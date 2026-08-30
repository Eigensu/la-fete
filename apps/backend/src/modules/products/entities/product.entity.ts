import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';

@Entity('products')
@Index('products_slug', ['slug'])
@Index('products_category_id', ['category'])
@Index('products_is_available', ['isAvailable'])
@Index('products_is_featured', ['isFeatured'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'simple-array' })
  images: string[];

  @Column({ default: true })
  isAvailable: boolean;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ nullable: true })
  tag: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: ProductVariant[];

  @Column({ default: '' })
  format: string;

  @Column({ nullable: true })
  dietaryTags: string;

  @Column({ nullable: true })
  otherTags: string;

  @Column({ type: 'text', nullable: true })
  ingredients: string;

  @Column({ type: 'simple-json', nullable: true })
  sweetenerOptions: string[];

  @Column({ type: 'text', nullable: true })
  shelfLife: string;

  @Column({ type: 'text', nullable: true })
  allergyInformation: string;

  @Column({ type: 'text', nullable: true })
  deliveryInstructions: string;

  @Column({ type: 'text', nullable: true })
  nutritionalHighlight: string;
}
