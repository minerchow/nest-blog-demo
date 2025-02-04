import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { JwtService } from '@nestjs/jwt';
  import { RedisService } from 'src/redis/redis.service';
  
  @Injectable()
  export class GuestAuthGuard extends AuthGuard('guest') {
    constructor(
      private readonly jwtService: JwtService,
      private readonly redisService: RedisService,
    ) {
      super();
    }
  
    getRequest(context: ExecutionContext) {
      const ctx = context.switchToHttp();
      const request = ctx.getRequest();
      return request;
    }
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = this.getRequest(context);
      const token = request.headers.authorization?.replace('Bearer ', '');
        console.log("t",token)
      if (!token) {
        throw new UnauthorizedException('未提供游客 Token');
      }
 
  
      try {
        const decoded = this.jwtService.verify(token) as { id: number; tokenVersion: number };
        console.log("decoded",decoded)
        if (!decoded || !decoded.tokenVersion) {
          throw new UnauthorizedException('无效的游客 Token');
        }
  
        // const tokenVer = await this.redisService.get(`Token_${decoded.id}`);
        // if (parseInt(tokenVer) !== decoded.tokenVersion) {
        //   throw new UnauthorizedException('游客 Token 已失效，请重新获取');
        // }
  
        // 为请求添加游客用户信息
        // request.user = {
        //   id: decoded.id,
        //   username: 'guest',
        //   role: 'guest',
        // };
  
        return true;
      } catch (error) {
        throw new UnauthorizedException('游客 Token 验证失败');
      }
    }
  }