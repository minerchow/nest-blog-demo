import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ApiProperty } from '@nestjs/swagger';
import { PostsEntity } from 'src/posts/posts.entity';
// import { v4 as uuidv4 } from 'uuid';
@Entity('user')
export class User {
  @ApiProperty({ description: '用户id' })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true })
  username: string;

  @Column({ length: 100, nullable: true })
  nickname: string;

  @Exclude()
  @Column({ select: false, nullable: true })
  password: string;

  @Column({ default: null })
  avatar: string;

  @Column({ default: null })
  email: string;

  @Column({ default: null })
  openid: string;

  @Column('enum', { enum: ['root', 'author', 'visitor'], default: 'visitor' })
  role: string;

  @Column({ type: 'bigint', default: 0 }) 
  tokenVersion: number;
  
  @Column({ type: 'json', nullable: false })
  accessibleUrls: string[];

  @OneToMany(() => PostsEntity, (post) => post.author)
  posts: PostsEntity[];

  @Column({
    name: 'create_time',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createTime: Date;
  

  @Exclude()
  @Column({
    name: 'update_time',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updateTime: Date;

  @BeforeInsert()
  async encryptPwd() {
    if (!this.password) return;
    this.password = await bcrypt.hashSync(this.password, 10);
  }
}
