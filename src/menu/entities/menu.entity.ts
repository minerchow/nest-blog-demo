// src/menu/entities/menu.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MenuEntity {
  // 添加主键 id，使用 PrimaryGeneratedColumn 自动生成唯一的 id
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  name: string;
}