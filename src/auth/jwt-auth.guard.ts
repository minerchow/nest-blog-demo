import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    return request;
  }

  handleRequest<TUser>(err: any, user: TUser, info: any, context: ExecutionContext, status?: any): TUser {
    if (err || !user) {
      throw new UnauthorizedException('身份验证失败');
    }

    // 获取请求中的 AccessToken
    const request = this.getRequest(context);
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('未提供 AccessToken');
    }

    try {
      // 解码 AccessToken 以获取 tokenVersion
      const decoded = this.jwtService.decode(token) as { id: number; tokenVersion: number };
      console.log("decoded",decoded)
      if (!decoded || !decoded.id || !decoded.tokenVersion) {
        throw new UnauthorizedException('无效的 AccessToken');
      }
      console.log(this.userService)
      // 从数据库中获取用户的最新 tokenVersion
      this.userService.findOne(decoded.id).then((dbUser) => {
        console.log("db",dbUser);
        if (!dbUser) {
          throw new UnauthorizedException('用户不存在');
        }

        // 比较 tokenVersion
        if (dbUser.tokenVersion !== decoded.tokenVersion) {
          throw new UnauthorizedException('Token 已失效，请刷新');
        }
      }).catch((error) => {
        throw new UnauthorizedException('Token 验证失败1');
      });
    } catch (error) {
      console.log(error)
      throw new UnauthorizedException('Token 验证失败2');
    }

    return user;
  }
}