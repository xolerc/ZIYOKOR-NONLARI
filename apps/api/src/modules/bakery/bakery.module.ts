import { Module } from '@nestjs/common';
import { BakeryService } from './bakery.service';
import { BakeryController } from './bakery.controller';

@Module({
  controllers: [BakeryController],
  providers: [BakeryService],
  exports: [BakeryService],
})
export class BakeryModule {}
