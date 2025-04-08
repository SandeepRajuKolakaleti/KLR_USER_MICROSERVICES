import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("user_permission")
export class UserPermissionEntity {

    @PrimaryGeneratedColumn()
    permissionId!: number;

    @Column({unique: true})
    permissionName!: string;

    @Column()
    permissionDescription!: string;


}