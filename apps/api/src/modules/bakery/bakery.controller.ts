import { Controller, Get, Param, Put, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BakeryService } from './bakery.service';

@Controller('bakeries')
export class BakeryController {
  constructor(private bakeries: BakeryService) {}

  @Get()
  findAll() { return this.bakeries.findAll(); }

  @Get('nearby')
  findNearby(@Query('lat') lat: string, @Query('lng') lng: string, @Query('radius') radius?: string) {
    return this.bakeries.findNearby(parseFloat(lat), parseFloat(lng), radius ? parseInt(radius) : 10);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.bakeries.findOne(id); }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() body: any) { return this.bakeries.update(id, body); }
}
