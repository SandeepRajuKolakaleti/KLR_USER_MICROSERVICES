import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../auth/services/auth/auth.service';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from '../models/dto/CreateUser.dto';
import { LoginUserDto } from '../models/dto/LoginUser.dto';
import { UserEntity } from '../models/user.entity';
import { UserI } from '../models/user.interface';
import { UserPermissionI } from '../models/user.permission.interface';
import { UserPermissionEntity } from '../models/user.permission.entity';
import { AppConstants } from 'src/app.constants';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import axios from 'axios';
import { PaginatedResult, Pagination } from '../models/pagination.interface';
@Injectable()
export class UserService {
    public readonly s3Client;
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(UserPermissionEntity)
        private userPermissionRepository: Repository<UserPermissionEntity>,
        private authService: AuthService,
        private configService: ConfigService,
    ) { 
        this.s3Client = new S3Client({
            region: configService.get('S3_REGION'),
            credentials: {
                accessKeyId: configService.get('S3_ACCESS_KEY_ID')|| '',
                secretAccessKey: configService.get('S3_SECRET_ACCESS_KEY') || '',
            },
        });
    }

    create(createUserDto: CreateUserDto): Observable<any> {
        return this.PermissionExists(createUserDto.userRole.toString()).pipe(switchMap((permissionId: number) => {
            return this.mailExists(createUserDto.email).pipe(
                switchMap((exists: boolean) => {
                    if (!exists) {
                        return this.authService.hashPassword(createUserDto.password).pipe(
                            switchMap((passwordHash: string) => {
                                // Overwrite the user password with the hash, to store it in the db
                                createUserDto.password = passwordHash;
                                createUserDto.permissionId = permissionId;
                                const user = this.userRepository.create({
                                    ...createUserDto,
                                    permissionId,
                                    password: passwordHash
                                });

                                return from(this.userRepository.save(user)).pipe(
                                    map((savedUser) => {
                                        const { password, ...user } = savedUser;
                                        return user;
                                    })
                                );
                            })
                        )
                    } else {
                        throw new HttpException('Email already in use', HttpStatus.CONFLICT);
                    }
                })
            )
        }
        ))
    }

    login(loginUserDto: LoginUserDto): Observable<String> {
        return this.findUserByEmail(loginUserDto.email).pipe(
            switchMap((user: UserI) => {
                if (user) {
                    loginUserDto.permissionId = user.permissionId;
                    return this.findPermissionById(user.permissionId).pipe(
                        switchMap((permissionName: String) => {
                            return this.validatePassword(loginUserDto.password, user.password).pipe(
                                switchMap((passwordsMatches: boolean) => {
                                    if (passwordsMatches) {
                                        return this.findOne(user.id).pipe(switchMap((user: UserI) => {
                                            console.log('user', user);
                                            return this.authService.generateJwt(user).pipe(
                                                switchMap((gwtStr: string) => {
                                                    console.log('Generated JWT:', gwtStr);
                                                    loginUserDto.id = user.id;
                                                    loginUserDto.gwtToken = gwtStr;
                                                    if(loginUserDto.permissionId) {
                                                        return this.findPermissionDetailsById(loginUserDto.permissionId).pipe(
                                                        map((userPermission: UserPermissionI) => {
                                                            loginUserDto.permissionName = userPermission.permissionName;
                                                            return '{"token":"' + gwtStr + '","permissionName":"' + userPermission.permissionName + '","id":"' + loginUserDto.id + '"}';
                                                        }))
                                                    } else {
                                                        return of('{"token":"' + gwtStr + '","permissionName":"' + permissionName + '","id":"' + loginUserDto.id + '"}');
                                                    }
                                                }))
                                        })
                                        )
                                    } else {
                                        throw new HttpException('Login was not Successfulll', HttpStatus.UNAUTHORIZED);
                                    }
                                })
                            )

                        })
                    )

                } else {
                    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
                }
            }
            )
        )
    }

    resetPassword(resetPassword: LoginUserDto): Observable<UserI> {
        return this.findUserByEmail(resetPassword.email).pipe(
            switchMap((user: any) => {
                if (user) {
                    resetPassword.permissionId = user.permissionId;
                    resetPassword.id = user.id;
                    resetPassword.name = user.name;
                    return this.authService.hashPassword(resetPassword.password).pipe(
                        switchMap((passwordHash: string) => {
                            // Overwrite the user password with the hash, to store it in the db
                            resetPassword.password = passwordHash;
                            return from(this.userRepository.update(user, {...resetPassword})).pipe(
                                map((updatedUser: any) => {
                                    const { password, ...user } = updatedUser;
                                    return user;
                                })
                            )
                        })
                    )
                }
                return of(user);
            }),
        )     
    }

    findAll(pagination: Pagination): Observable<PaginatedResult<UserI>> {
        return from(this.userRepository.findAndCount({
            skip: pagination.offset,
            take: pagination.limit,
            order: { createdAt: "DESC" },
            // where: {status: AppConstants.app.status.active},
            select: ['id', 'email', 'name', 'password', 'phonenumber', 'image', 'permissionId', 'address', 'birthday', 'userRole', 'revenue', 'totalSales', 'status', 'createdAt', 'updatedAt'],
        })).pipe(
        map(([products, total]) => ({
            total: total,
            offset: pagination.offset,
            limit: pagination.limit,
            data: products
        })));
    }

    findOne(id: number): Observable<any> {
        return from(this.userRepository.findOne({ 
            where: {id},
            select: ['id', 'email', 'name', 'password', 'phonenumber', 'image', 'permissionId', 'address', 'birthday', 'userRole', 'revenue', 'totalSales', 'status', 'createdAt', 'updatedAt'],
        }));
    }

    findUserByEmail(email: string): Observable<any> {
        return from(this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'name', 'password', 'phonenumber', 'image', 'permissionId', 'address', 'birthday', 'userRole', 'revenue', 'totalSales', 'status', 'createdAt', 'updatedAt'], 
        }));
    }

    async deleteUser(id: number) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            return false;
        }

        user.status = AppConstants.app.status.inactive; // deactivate user instead of deleting
        await this.userRepository.save(user);

        return true;
    }

    private validatePassword(password: string, storedPasswordHash: string): Observable<boolean> {
        return this.authService.comparePasswords(password, storedPasswordHash);
    }

    private mailExists(email: string): Observable<boolean> {
        return from(this.userRepository.findOne({ where: {email} })).pipe(
            map((user: any) => {
                if (user) {
                    return true;
                } else {
                    return false;
                }
            })
        )
    }


    private PermissionExists(permissionName: string): Observable<number> {
        return from(this.userPermissionRepository.findOne({ 
            where: { permissionName},
            select: ['permissionId', 'permissionName', 'permissionDescription']
        })).pipe(
            map((userPermission: any) => {
                if (userPermission) {
                    return userPermission.permissionId;
                }
                else {
                    return 1;
                }
            })
        )
    }

    private findPermissionById(permissionId: number): Observable<String> {
        return from(this.userPermissionRepository.findOne({ 
            where: {permissionId }, 
            select: ['permissionId', 'permissionName', 'permissionDescription'] 
        })).pipe(
            map((userPermission: any) => {

                if (userPermission) {
                    return userPermission.permissionName;
                }
                else {
                    return "";
                }
            })
        )
    }

    private findPermissionDetailsById(permissionId: number): Observable<UserPermissionI> {
        return from(this.userPermissionRepository.findOne({ 
            where: {permissionId }, select: ['permissionId', 'permissionName', 'permissionDescription'] })).pipe(
            map((userPermission: any) => {
                if (userPermission) {
                    return userPermission;
                }
                else {
                    return null;
                }
            })
        )
    }

    update(id: number, dto: UpdateUserDto): Observable<any> {
        return from(this.userRepository.findOne({ where: { id } })).pipe(
            switchMap((existingUser) => {
                if (!existingUser) {
                    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
                }

                // Update allowed fields
                existingUser.name = dto.name ?? existingUser.name;
                existingUser.email = dto.email?.toLowerCase() ?? existingUser.email;
                existingUser.userRole = dto.userRole ?? existingUser.userRole;
                existingUser.permissionId = dto.permissionId ?? existingUser.permissionId;
                existingUser.phonenumber = dto.phonenumber ?? existingUser.phonenumber;
                existingUser.image = dto.image ?? existingUser.image;
                existingUser.address = dto.address ?? existingUser.address;
                existingUser.birthday = dto.birthday ?? existingUser.birthday;
                existingUser.revenue = dto.revenue ?? existingUser.revenue;
                existingUser.totalSales = dto.totalSales ?? existingUser.totalSales;

                const passwordUpdated = dto.password && dto.password !== existingUser.password;

                // If password updated → hash it and save
                if (passwordUpdated) {
                    let existingUserPassword = existingUser.password? existingUser.password : '';
                    return this.validatePassword(dto.password, existingUserPassword).pipe(
                        switchMap(passwordMatched => {
                            if (!passwordMatched) {
                                return this.authService.hashPassword(dto.password).pipe(
                                    switchMap((hashed) => {
                                        existingUser.password = hashed;
                                        return from(this.userRepository.save(existingUser)).pipe(
                                            map((updatedUser: any) => {
                                                const { password, ...user } = updatedUser;
                                                return user;
                                            })
                                        );
                                    })
                                );
                            }
                            // Password matched (no change needed), just save
                            return from(this.userRepository.save(existingUser)).pipe(
                                map((savedUser: any) => {
                                    const { password, ...user } = savedUser;
                                    return user;
                                })
                            );
                        })
                    );
                }

                // Password not updated
                return from(this.userRepository.save(existingUser)).pipe(
                    map((savedUser) => {
                        const { password, ...safeUser } = savedUser;
                        return safeUser;
                    })
                );
            })
        );
    }

    async upload(fileName: string, file:Buffer) {
        const folder = AppConstants.app.S3.user;
        const s3Key = `${folder}/${fileName}`;
        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: AppConstants.app.bucket,
                Key: s3Key,
                Body: file
            })
        );
        // await this.getImageUrlToBase64(s3Key)
        return s3Key;
    }

    async getImageUrlToBase64(s3Key: string) {
        return await this.imageUrlToBase64(`https://${AppConstants.app.bucket}.s3.${this.configService.get('S3_REGION')}.amazonaws.com/${s3Key}`)
        .then((base64) => {
            // console.log("base64", base64);
            return { img: base64 };
        })
        .catch(console.error);
    }

    async imageUrlToBase64(url: string): Promise<string> {
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
        });
      
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
      
        // Optional: Get content-type for full data URI
        const contentType = response.headers['content-type'];
      
        return `data:${contentType};base64,${base64}`;
    }

}
