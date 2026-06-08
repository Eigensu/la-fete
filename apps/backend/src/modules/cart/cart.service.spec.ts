/* eslint-disable no-undef */
import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { DataSource } from 'typeorm';

describe('CartService', () => {
  let service: CartService;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      })),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useValue: mockRepository },
        { provide: getRepositoryToken(CartItem), useValue: mockRepository },
        { provide: getRepositoryToken(Product), useValue: mockRepository },
        { provide: getRepositoryToken(ProductVariant), useValue: mockRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should merge cart in a transaction', async () => {
    mockQueryRunner.manager.findOne.mockResolvedValueOnce(null); // cart
    mockQueryRunner.manager.create.mockReturnValue({ items: [] });
    mockQueryRunner.manager.save.mockResolvedValue({ items: [] });
    mockRepository.create.mockReturnValue({ user: { id: 'user1' } });
    mockRepository.save.mockResolvedValue({ user: { id: 'user1' }, items: [] });
    
    // Empty merge dto for simple test
    await service.mergeGuestCart('user1', { items: [] });
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
  });
});
