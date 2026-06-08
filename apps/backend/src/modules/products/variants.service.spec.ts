/* eslint-disable no-undef */
import { Test, TestingModule } from '@nestjs/testing';
import { VariantsService } from './variants.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from './entities/product.entity';
import { ConflictException } from '@nestjs/common';

describe('VariantsService', () => {
  let service: VariantsService;

  const mockVariantRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    softRemove: jest.fn(),
  };

  const mockProductRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VariantsService,
        { provide: getRepositoryToken(ProductVariant), useValue: mockVariantRepository },
        { provide: getRepositoryToken(Product), useValue: mockProductRepository },
      ],
    }).compile();

    service = module.get<VariantsService>(VariantsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should prevent duplicate variant names', async () => {
    mockProductRepository.findOne.mockResolvedValue({ id: 'p1' });
    mockVariantRepository.findOne.mockResolvedValue({ id: 'v1', name: 'Color' });

    await expect(service.create('p1', { name: 'Color', price: 10, weight: 1, stockQuantity: 5 }))
      .rejects.toThrow(ConflictException);
  });
});
