// src/menu/menu.controller.ts
import {  Controller, Post, Put, Delete, Body, Param , Get ,Query, UseGuards, Req } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuEntity } from './entities/menu.entity';
import { JwtAuthGuard } from './../auth/jwt-auth.guard';
import { RolesGuard, Roles } from './../auth/role.guard';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
@Controller('menu')
export class MenuController extends AuthGuard('jwt') {
  constructor(
    private readonly menuService: MenuService,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  @Roles('root')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('list')
  async getMenuList(@Req() req: Request,@Query('userId') userId: string): Promise<MenuEntity[]> {
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if(!token){
      return [];
    }
    const decoded = this.jwtService.decode(token) as {id:number}
    return this.menuService.getMenuList(decoded.id.toString());
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