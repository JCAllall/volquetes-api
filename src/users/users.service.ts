import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(data: Partial<User>): Promise<Partial<User>> {
  const hashed = await (bcrypt as any).hash(data.password!, 10);
  const user = this.usersRepository.create({ ...data, password: hashed });
  const saved = await this.usersRepository.save(user);
  const { password, ...rest } = saved;
  return rest;
}

  async findAll(): Promise<Partial<User>[]> {
  const users = await this.usersRepository.find();
  return users.map(({ password, ...rest }) => rest);
}
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async setResetToken(id: string, token: string, expires: Date): Promise<void> {
    await this.usersRepository.update(id, {
      reset_password_token: token,
      reset_password_expires: expires,
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { reset_password_token: token } });
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashed = await (bcrypt as any).hash(newPassword, 10);
    await this.usersRepository.update(id, {
      password: hashed,
      reset_password_token: null,
      reset_password_expires: null,
    });
  }
}
