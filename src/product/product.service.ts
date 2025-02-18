import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { createObjectCsvStringifier } from 'csv-writer';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productsRepository.findOne({
      where: { name: createProductDto.name }, // ตรวจสอบสินค้าซ้ำ
    });
    if (existingProduct) {
      throw new BadRequestException('Product name already exists');
    }
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }
  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    // ตรวจสอบว่าสินค้าที่ต้องการอัปเดตมีอยู่หรือไม่
    const existingProduct = await this.findOne(id);
    if (!existingProduct) {
      throw new BadRequestException('Product not found');
    }
    // ตรวจสอบว่าชื่อที่อัปเดตไปซ้ำกับสินค้ารายการอื่นหรือไม่
    if (updateProductDto.name) {
      const duplicateProduct = await this.productsRepository.findOne({
        where: { name: updateProductDto.name },
      });

      if (duplicateProduct && duplicateProduct.id !== id) {
        throw new BadRequestException('Product name already exists');
      }
    }
    // อัปเดตสินค้า
    await this.productsRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.productsRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Product not found');
  }

  async generateCSV(): Promise<string> {
    const products = await this.findAll();

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Product Name' },
        { id: 'price', title: 'Price' },
      ],
    });

    const csvData =
      csvStringifier.getHeaderString() +
      csvStringifier.stringifyRecords(products);

    return csvData;
  }
}
