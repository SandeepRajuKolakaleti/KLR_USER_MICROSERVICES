import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../auth/services/auth/auth.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../models/dto/CreateUser.dto';
import { LoginUserDto } from '../models/dto/LoginUser.dto';
import { UserEntity } from '../models/user.entity';
import { UserI } from '../models/user.interface';
import { UserPermissionI } from '../models/user.permission.interface';
import { UserPermissionEntity } from '../models/user.permission.entity';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(UserPermissionEntity)
        private userPermissionRepository: Repository<UserPermissionEntity>,
        private authService: AuthService
    ) { }

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
                                            return this.authService.generateJwt(user).pipe(
                                                switchMap((gwtStr: String) => {
                                                    loginUserDto.id = user.id;
                                                    loginUserDto.gwtToken = gwtStr;

                                                    return this.findPermissionDetailsById(loginUserDto.permissionId).pipe(
                                                        map((userPermission: UserPermissionI) => {
                                                            loginUserDto.permissionName = userPermission.permissionName;
                                                            return '{"token":"' + gwtStr + '","permissionName":"' + userPermission.permissionName + '","id":"' + loginUserDto.id + '"}';
                                                        }))
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

    findAll(): Observable<UserI[]> {
        return from(this.userRepository.find());
    }

    findOne(id: number): Observable<any> {
        return from(this.userRepository.findOne({ 
            where: {id},
            select: ['id', 'email', 'name', 'password', 'phonenumber', 'image', 'permissionId']
        }));
    }

    findUserByEmail(email: string): Observable<any> {
        return from(this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'name', 'password', 'phonenumber', 'image', 'permissionId'], 
        }));
    }

    async deleteUser(id: number) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (user) {
           await this.userRepository.remove(user);
           return true;
        }
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

}
