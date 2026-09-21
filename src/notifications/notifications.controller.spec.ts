import { Test, TestingModule } from '@nestjs/testing';
import {
  NotificationsController,
  AuthenticatedRequest,
} from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  const mockService = {
    findByUser: jest.fn(),
    unreadCount: jest.fn(),
    markAllAsRead: jest.fn(),
    markAsRead: jest.fn(),
  };
  const req = {
    user: { id: 'u1', email: 'u1@test.com', role: 'constructor' },
  } as unknown as AuthenticatedRequest;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: mockService }],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('lists notifications for the authenticated user', async () => {
    mockService.findByUser.mockResolvedValue([]);
    await controller.findMine(req);
    expect(mockService.findByUser).toHaveBeenCalledWith('u1');
  });

  it('marks a single notification as read for the authenticated user', async () => {
    await controller.markAsRead('n1', req);
    expect(mockService.markAsRead).toHaveBeenCalledWith('n1', 'u1');
  });
});
