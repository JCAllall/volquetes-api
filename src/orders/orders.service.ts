import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Tu pedido está pendiente de confirmación.',
  [OrderStatus.ACCEPTED]: 'Tu pedido fue aceptado por la empresa.',
  [OrderStatus.ASSIGNED]: 'Se asignó un chofer a tu pedido.',
  [OrderStatus.DELIVERED]: 'Tu volquete fue entregado.',
  [OrderStatus.PICKED_UP]: 'Tu volquete fue retirado.',
  [OrderStatus.COMPLETED]: 'Tu pedido fue completado.',
  [OrderStatus.CANCELLED]: 'Tu pedido fue cancelado.',
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private notificationsService: NotificationsService,
  ) {}

  async create(data: Partial<Order>): Promise<Order> {
    const order = this.ordersRepository.create(data);
    return this.ordersRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['user', 'company', 'driver', 'vehicle'],
      order: { created_at: 'DESC' },
    });
  }

  async findByUser(user_id: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user_id },
      relations: ['company', 'driver', 'vehicle'],
      order: { created_at: 'DESC' },
    });
  }

  async findByCompany(company_id: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { company_id },
      relations: ['user', 'driver', 'vehicle'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['user', 'company', 'driver', 'vehicle'],
    });
    if (!order) throw new NotFoundException('Orden no encontrada');
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    await this.ordersRepository.update(id, { status });
    const order = await this.findOne(id);
    await this.notifyStatusChange(order);
    return order;
  }

  async assignDriver(
    id: string,
    driver_id: string,
    vehicle_id: string,
  ): Promise<Order> {
    await this.ordersRepository.update(id, {
      driver_id,
      vehicle_id,
      status: OrderStatus.ASSIGNED,
    });
    const order = await this.findOne(id);
    await this.notifyStatusChange(order);
    return order;
  }

  private async notifyStatusChange(order: Order): Promise<void> {
    await this.notificationsService.create({
      user_id: order.user_id,
      type: NotificationType.ORDER_STATUS,
      title: 'Actualización de tu pedido',
      message:
        STATUS_MESSAGES[order.status] ?? 'El estado de tu pedido cambió.',
      order_id: order.id,
    });
  }
}
