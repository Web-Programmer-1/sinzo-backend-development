import redis from "../config/redis";

export const invalidateAllCategoriesCache = async () => {
  try {
    const keys = await redis.keys('categories:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Redis Categories Cache Invalidation Error:', error);
  }
};