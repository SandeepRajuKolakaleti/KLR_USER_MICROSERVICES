import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("user_permission")
export class UserPermissionEntity {

    @PrimaryGeneratedColumn()
    permissionId!: number;

    @Column({unique: true})
    permissionName!: string;

    @Column()
    permissionDescription!: string;

    // ✅ Auto-created timestamp
    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    // ✅ Auto-updated timestamp
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;

}