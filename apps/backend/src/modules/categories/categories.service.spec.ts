/* eslint-disable no-undef */
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  
  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a category', async () => {
    const dto = { name: 'Test', slug: 'test', isActive: true };
    mockRepository.findOne.mockResolvedValue(null);
    mockRepository.create.mockReturnValue(dto);
    mockRepository.save.mockResolvedValue({ id: 'uuid', ...dto });

    const result = await service.create(dto);
    expect(result.id).toBe('uuid');
    expect(result.name).toBe('Test');
  });

  it('should throw ConflictException if slug exists', async () => {
    const dto = { name: 'Test', slug: 'test' };
    mockRepository.findOne.mockResolvedValue({ id: 'uuid', ...dto });

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });
});
