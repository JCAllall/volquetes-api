import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';

export interface CreateNotificationInput {
  user_id: string;
  title: string;
  message: string;
  type?: NotificationType;
  order_id?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(data: CreateNotificationInput): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      type: NotificationType.SYSTEM,
      ...data,
    });
    return this.notificationsRepository.save(notification);
  }

  async findByUser(user_id: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { user_id },
      order: { created_at: 'DESC' },
    });
  }

  async unreadCount(user_id: string): Promise<{ count: number }> {
    const count = await this.notificationsRepository.count({
      where: { user_id, read: false },
    });
    return { count };
  }

  async markAsRead(id: string, user_id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id, user_id },
    });
    if (!notification)
      throw new NotFoundException('Notificación no encontrada');
    if (!notification.read) {
      notification.read = true;
      await this.notificationsRepository.save(notification);
    }
    return notification;
  }

  async markAllAsRead(user_id: string): Promise<void> {
    await this.notificationsRepository.update(
      { user_id, read: false },
      { read: true },
    );
  }
}
