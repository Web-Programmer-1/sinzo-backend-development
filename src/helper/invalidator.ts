import redis from "../config/redis";

// invalidation helper বানাও
export const invalidateAllProductsCache = async () => {
  try {
    const keys = await redis.keys('products:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Redis invalidation error:', error);
  }
};