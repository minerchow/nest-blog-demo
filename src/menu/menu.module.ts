import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { MenuEntity } from './entities/menu.entity';
import { User } from './../user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
@Module({
  imports: [TypeOrmModule.forFeature([User, MenuEntity]), 
    AuthModule,
    UserModule],
  controllers: [MenuController],
  providers: [MenuService]
})
export class MenuModule { }
