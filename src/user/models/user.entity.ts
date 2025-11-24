import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({unique: true})
    email!: string;

    @Column({select: false})
    password!: string;

    @Column({select: false})
    permissionId!: number;

    @Column({select: false})
    phonenumber!: number;

    @Column({select: false})
    image!: string;

    @Column({select: false})
    userRole!: string;

    @Column({select: false})
    birthday!: string;

    @Column({select: false})
    address!: string;

    @BeforeInsert()
    emailToLowerCase() {
        this.email = this.email.toLowerCase();
    }
}