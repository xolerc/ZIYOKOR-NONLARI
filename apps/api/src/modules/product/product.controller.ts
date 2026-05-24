import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private products: ProductService) {}

  @Get('bakery/:bakeryId')
  findByBakery(@Param('bakeryId') bakeryId: string) { return this.products.findByBakery(bakeryId); }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() body: any) { return this.products.create(body); }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() body: any) { return this.products.update(id, body); }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) { return this.products.remove(id); }
}
