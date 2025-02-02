// src/redis/redis.service.ts
import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  // 注入 Redis 客户端实例
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  // 模块初始化时连接到 Redis
  async onModuleInit() {
   
  }

  // 模块销毁时断开与 Redis 的连接
  async onModuleDestroy() {
    await this.redisClient.quit();
    console.log('Disconnected from Redis');
  }

  /**
   * 设置键值对到 Redis
   * @param key 键
   * @param value 值
   * @returns 操作结果
   */
  async set(key: string, value: string | number) {
    return this.redisClient.set(key, value);
  }

  /**
   * 设置带过期时间的键值对到 Redis
   * @param key 键
   * @param value 值
   * @param seconds 过期时间（秒）
   * @returns 操作结果
   */
  async setWithExpiry(key: string, value: string | number, seconds: number) {
    return this.redisClient.setex(key, seconds, value);
  }

  /**
   * 从 Redis 获取指定键的值
   * @param key 键
   * @returns 键对应的值，如果不存在则返回 null
   */
  async get(key: string) {
    return this.redisClient.get(key);
  }

  /**
   * 从 Redis 删除指定键
   * @param key 键
   * @returns 删除的键的数量
   */
  async del(key: string) {
    return this.redisClient.del(key);
  }

  /**
   * 判断指定键是否存在于 Redis
   * @param key 键
   * @returns 如果键存在返回 1，否则返回 0
   */
  async exists(key: string) {
    return this.redisClient.exists(key);
  }
}