import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType } from './notification.entity';

describe('NotificationsService', () => {
  let service: NotificationsService;
  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a notification with a default type', async () => {
    const input = { user_id: 'u1', title: 't', message: 'm' };
    mockRepo.create.mockReturnValue({
      ...input,
      type: NotificationType.SYSTEM,
    });
    mockRepo.save.mockResolvedValue({
      id: 'n1',
      ...input,
      type: NotificationType.SYSTEM,
    });

    const result = await service.create(input);

    expect(mockRepo.create).toHaveBeenCalledWith({
      type: NotificationType.SYSTEM,
      ...input,
    });
    expect(result.id).toBe('n1');
  });

  it('returns the unread count for a user', async () => {
    mockRepo.count.mockResolvedValue(3);
    const result = await service.unreadCount('u1');
    expect(mockRepo.count).toHaveBeenCalledWith({
      where: { user_id: 'u1', read: false },
    });
    expect(result).toEqual({ count: 3 });
  });

  it('throws when marking a missing notification as read', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.markAsRead('n1', 'u1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('marks a notification as read', async () => {
    const notification = { id: 'n1', user_id: 'u1', read: false };
    mockRepo.findOne.mockResolvedValue(notification);
    mockRepo.save.mockResolvedValue({ ...notification, read: true });

    const result = await service.markAsRead('n1', 'u1');

    expect(mockRepo.save).toHaveBeenCalledWith({ ...notification, read: true });
    expect(result.read).toBe(true);
  });
});
