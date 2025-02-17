import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, nullable: false })
  firstName: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  lastName: string;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  email: string;

  @Column({ type: 'text', nullable: false })
  password: string;

  @Column({ default: true })
  isActive: boolean;
}
