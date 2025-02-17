import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    // ดึงข้อมูล URL และ HTTP Method
    const { method, originalUrl } = req;
    const logData = `${method} ${originalUrl}`;

    // เมื่อ response ถูกส่งกลับมา
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const logMessage = `${logData} - Response Time: ${responseTime}ms\n`;

      // บันทึก log ลงในไฟล์
      const logFilePath = path.join(__dirname, '../../logs/api-logs.txt');
      fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
          console.error('Error writing log to file:', err);
        }
      });
    });

    next();
  }
}
