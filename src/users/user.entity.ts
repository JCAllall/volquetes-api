import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ default: 'constructor' })
  role: string;

  @Column({ nullable: true })
  reset_password_token: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  reset_password_expires: Date | null;

  @CreateDateColumn()
  created_at: Date;
}
