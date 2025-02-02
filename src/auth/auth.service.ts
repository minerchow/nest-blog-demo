import { UserService } from './../user/user.service';
import { Injectable, BadRequestException, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import {
  AccessTokenInfo,
  AccessConfig,
  WechatError,
  WechatUserInfo,
} from './auth.interface';
import { lastValueFrom, map, Observable } from 'rxjs';
//@ts-ignore
import { AxiosResponse } from 'axios';
import { RedisService  } from 'src/redis/redis.service';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private httpService: HttpService,
    private readonly redisService: RedisService
  ) {}
  private accessTokenInfo: AccessTokenInfo;
  public apiServer = 'https://api.weixin.qq.com';

  createToken(user: Partial<User>) {
    return this.jwtService.sign(user,{ expiresIn: '2h' });
  }

   // 创建RefreshToken
   createRefreshToken(user: Partial<User>) {
    return this.jwtService.sign(user, { expiresIn: '7d' }); // 设置RefreshToken有效期为7天
  }

  async login(user: Partial<User>) {
    const token = this.createToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    const refreshToken = this.createRefreshToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    return { accessToken:token , refreshToken };
  }

  async loginWithWechat(code) {
    if (!code) {
      throw new BadRequestException('请输入微信授权码');
    }
    await this.getAccessToken(code);

    const user = await this.getUserByOpenid();
    if (!user) {
      // 获取用户信息，注册新用户
      const userInfo: WechatUserInfo = await this.getUserInfo();
      return this.userService.registerByWechat(userInfo);
    }
    return this.login(user);
  }

  async getUser(user) {
    return await this.userService.findOne(user.id);
  }

  async getUserByOpenid() {
    return await this.userService.findByOpenid(this.accessTokenInfo.openid);
  }
  async getUserInfo() {
    const result: AxiosResponse<WechatError & WechatUserInfo> =
      await lastValueFrom(
        this.httpService.get(
          `${this.apiServer}/sns/userinfo?access_token=${this.accessTokenInfo.accessToken}&openid=${this.accessTokenInfo.openid}`,
        ),
      );
    if (result.data.errcode) {
      throw new BadRequestException(
        `[getUserInfo] errcode:${result.data.errcode}, errmsg:${result.data.errmsg}`,
      );
    }
    console.log('result', result.data);

    return result.data;
  }

  async getAccessToken(code) {
    const { APPID, APPSECRET } = process.env;
    if (!APPSECRET) {
      throw new BadRequestException('[getAccessToken]必须有appSecret');
    }
    if (
      !this.accessTokenInfo ||
      (this.accessTokenInfo && this.isExpires(this.accessTokenInfo))
    ) {
      // 请求accessToken数据
      const res: AxiosResponse<WechatError & AccessConfig, any> =
        await lastValueFrom(
          this.httpService.get(
            `${this.apiServer}/sns/oauth2/access_token?appid=${APPID}&secret=${APPSECRET}&code=${code}&grant_type=authorization_code`,
          ),
        );

      if (res.data.errcode) {
        throw new BadRequestException(
          `[getAccessToken] errcode:${res.data.errcode}, errmsg:${res.data.errmsg}`,
        );
      }
      this.accessTokenInfo = {
        accessToken: res.data.access_token,
        expiresIn: res.data.expires_in,
        getTime: Date.now(),
        openid: res.data.openid,
      };
    }

    return this.accessTokenInfo.accessToken;
  }

    // 使用RefreshToken换取AccessToken
    async refreshAccessToken(refreshToken: string) {
      try {
        const decoded = this.jwtService.verify(refreshToken);
        const user = await this.userService.findOne(decoded.id);
  
        // if (!user || user.refreshToken !== refreshToken) {
        //   throw new BadRequestException('无效的RefreshToken');
        // }
        // console.log("user.tokenVersion",user.tokenVersion);
        // user.tokenVersion++; 
        // console.log("user.tokenVersion2",user.tokenVersion);
        // await this.userService.updateUser(user);
        user.tokenVersion = Math.floor(Date.now() / 1000); 
        // await this.userService.updateUser(user);
        this.redisService.setWithExpiry(`Token_${user.id}`, user.tokenVersion, 7200); // 2h
        const newAccessToken = this.createToken({
          id: user.id,
          username: user.username,
          role: user.role,
          tokenVersion: user.tokenVersion
        });
  
        return { accessToken: newAccessToken };
      } catch (error) {
        throw new BadRequestException('无效的RefreshToken');
      }
    }

  isExpires(access) {
    return Date.now() - access.getTime > access.expiresIn * 1000;
  }
}
