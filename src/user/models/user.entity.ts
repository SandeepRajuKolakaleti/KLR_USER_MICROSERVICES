import { integer } from "aws-sdk/clients/cloudfront";
import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @Column({ type: 'varchar', length: 10, select: false })
    phonenumber!: string;

    @Column({select: false})
    image!: string;

    @Column({select: false})
    userRole!: string;

    @Column({select: false})
    birthday!: string;

    @Column({select: false})
    address!: string;

    @Column({select: false})
    revenue!: string;

    @Column({select: false})
    totalSales!: string;

    @Column({
        type: "tinyint",
        width: 1,
        default: 1,  // active by default
    })
    status!: number;

    // ✅ Auto-created timestamp
    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    // ✅ Auto-updated timestamp
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;

    @BeforeInsert()
    emailToLowerCase() {
        this.email = this.email.toLowerCase();
    }
}