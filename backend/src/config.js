import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}

export function getRedisUrl() {
  return requireEnv('REDIS_URL');
}

export function getBasePublicUrl() {
  return requireEnv('BASE_PUBLIC_URL');
}

export function getPort() {
  const raw = requireEnv('PORT');
  const port = Number.parseInt(raw, 10);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${raw}`);
  }
  return port;
}
