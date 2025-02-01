// src/menu/menu.controller.ts
import {  Controller, Post, Put, Delete, Body, Param , Get ,Query } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuEntity } from './entities/menu.entity';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('list')
  async getMenuList(@Query('userId') userId: string): Promise<MenuEntity[]> {
    return this.menuService.getMenuList(userId);
  }

  // 根据菜单 id 获取菜单信息的路由
  @Get(':id')
  async getMenuById(@Param('id') menuId: number): Promise<MenuEntity> {
    return this.menuService.getMenuById(menuId);
  }

   // 添加菜单
   @Post()
   async createMenu(@Body() menu: MenuEntity): Promise<MenuEntity> {
     return this.menuService.createMenu(menu);
   }
 
   // 修改菜单
   @Put(':id')
   async updateMenu(
     @Param('id') id: number,
     @Body() menu: MenuEntity,
   ): Promise<MenuEntity> {
     return this.menuService.updateMenu(id, menu);
   }
 
   // 删除菜单
   @Delete(':id')
   async deleteMenu(@Param('id') id: number): Promise<void> {
     return this.menuService.deleteMenu(id);
   }
}