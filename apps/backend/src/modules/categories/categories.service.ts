import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoriesRepository.findOne({
      where: [{ slug: createCategoryDto.slug }, { name: createCategoryDto.name }],
      withDeleted: true,
    });
    
    if (existing) {
      throw new ConflictException('Category with this name or slug already exists');
    }

    const category = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    const whereClauses: Array<Partial<Category>> = [];
    if (updateCategoryDto.slug !== undefined) whereClauses.push({ slug: updateCategoryDto.slug });
    if (updateCategoryDto.name !== undefined) whereClauses.push({ name: updateCategoryDto.name });

    if (whereClauses.length > 0) {
      const existing = await this.categoriesRepository.findOne({
        where: whereClauses,
        withDeleted: true,
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Category with this name or slug already exists');
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoriesRepository.softRemove(category);
  }
}
