
import Redis from 'ioredis'
// ket noi den redis
const redisClient = new Redis(
  "rediss://default:AU93AAIjcDE2MjI5Mzc2NzQzYzI0NGVmYTNiODY0YThkOTM1Y2IxZXAxMA@gentle-whippet-20343.upstash.io:6379"
);

export default redisClient
