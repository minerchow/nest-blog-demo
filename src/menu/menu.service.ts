// src/menu/menu.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './../user/entities/user.entity';
import { MenuEntity } from './entities/menu.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MenuEntity)
    private readonly menuRepository: Repository<MenuEntity>,
  ) {}

  async getMenuList(userId: string): Promise<MenuEntity[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    console.log("user",user)
    if (!user) {
      return [];
    }
    if (user.accessibleUrls.length === 0) {
      return [];
    }
    // 使用 find 方法根据 accessibleUrls 数组查询菜单信息
    // console.log("user.accessibleUrls",user.accessibleUrls)

    const menus = await this.menuRepository.find({
      where: {
        url: In(user.accessibleUrls),
      },
    });

    return menus;
  }

  // 根据菜单 id 获取菜单信息
  async getMenuById(menuId: number): Promise<MenuEntity> {
    return this.menuRepository.findOne({ where: { id: menuId } });
  }

  // 添加菜单
  async createMenu(menu: MenuEntity): Promise<MenuEntity> {
    return this.menuRepository.save(menu);
  }

  // 修改菜单
  async updateMenu(id: number, menu: MenuEntity): Promise<MenuEntity> {
    await this.menuRepository.update(id, menu);
    return this.menuRepository.findOne({ where: { id } });
  }

  // 删除菜单
  async deleteMenu(id: number): Promise<void> {
    await this.menuRepository.delete(id);
  }
}