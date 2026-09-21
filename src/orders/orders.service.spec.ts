import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './order.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  const mockOrderRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };
  const mockNotificationsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('notifies the customer when the status changes', async () => {
    const order = {
      id: 'o1',
      user_id: 'u1',
      status: OrderStatus.ACCEPTED,
    };
    mockOrderRepo.update.mockResolvedValue(undefined);
    mockOrderRepo.findOne.mockResolvedValue(order);

    const result = await service.updateStatus('o1', OrderStatus.ACCEPTED);

    expect(mockOrderRepo.update).toHaveBeenCalledWith('o1', {
      status: OrderStatus.ACCEPTED,
    });
    expect(mockNotificationsService.create).toHaveBeenCalledWith({
      user_id: 'u1',
      type: NotificationType.ORDER_STATUS,
      title: 'Actualización de tu pedido',
      message: 'Tu pedido fue aceptado por la empresa.',
      order_id: 'o1',
    });
    expect(result).toBe(order);
  });

  it('notifies the customer when a driver is assigned', async () => {
    const order = {
      id: 'o1',
      user_id: 'u1',
      status: OrderStatus.ASSIGNED,
    };
    mockOrderRepo.update.mockResolvedValue(undefined);
    mockOrderRepo.findOne.mockResolvedValue(order);

    await service.assignDriver('o1', 'd1', 'v1');

    expect(mockOrderRepo.update).toHaveBeenCalledWith('o1', {
      driver_id: 'd1',
      vehicle_id: 'v1',
      status: OrderStatus.ASSIGNED,
    });
    expect(mockNotificationsService.create).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'u1', order_id: 'o1' }),
    );
  });
});
