import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { User } from './auth/entities/user.entity';
import { Product } from './product/entities/product.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { LoggerMiddleware } from './common/logger.middleware';
import { OrderModule } from './order/order.module';
import { OrderItem } from './order/entities/order-item.entity';
import { Order } from './order/entities/order.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.UB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Product, RefreshToken, OrderItem, Order],
      autoLoadEntities: true,
      synchronize: true,
    }),
    DatabaseModule,
    AuthModule,
    ProductModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // ใช้ Middleware สำหรับทุก API
  }
}
