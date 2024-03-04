export const NODE_ENV = process.env['NODE_ENV'] || 'development';
export const CONSOLE_LOG_LEVELS = 'log warn error'.split(' ');

//redis
export const REDIS_PORT = parseInt(
  process.env['REDIS_PORT'] || '6379',
  10
);
export const REDIS_HOST = process.env['REDIS_HOST'] || '127.0.0.1';
