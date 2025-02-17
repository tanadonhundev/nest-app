import { IsNotEmpty, IsArray, IsNumber, IsString } from 'class-validator';

class CreateOrderItemDto {
  @IsString()
  product_name: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customer_name: string;

  @IsNumber()
  total_amount: number;

  @IsArray()
  items: CreateOrderItemDto[];
}
