import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateOrderDto } from './dto/create-order.dto';
import { BadRequestException } from '@nestjs/common';
import { Connection } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private connection: Connection,
  ) {}

  // สร้างคำสั่งซื้อพร้อมรายการสินค้า
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.startTransaction();
    try {
      // สร้างคำสั่งซื้อ
      const order = this.ordersRepository.create({
        customer_name: createOrderDto.customer_name,
        total_amount: createOrderDto.total_amount,
        items: createOrderDto.items.map((item) => {
          return this.orderItemsRepository.create(item);
        }),
      });

      // บันทึกคำสั่งซื้อ
      const savedOrder = await queryRunner.manager.save(order);

      // บันทึกรายการสินค้า
      await queryRunner.manager.save(OrderItem, order.items);

      // commit transaction
      await queryRunner.commitTransaction();
      return savedOrder;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // rollback transaction ถ้ามีข้อผิดพลาด
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        'Error occurred while processing the order',
      );
    } finally {
      await queryRunner.release();
    }
  }

  // ดึงข้อมูลคำสั่งซื้อทั้งหมด
  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['items'],
    });
  }
}
