import { z } from 'zod';

const envSchema = z.object({
  CORS_ORIGINS: z
    .string()
    .default(
      [
        'http://localhost:4173',
        'http://localhost:5173',
        'http://localhost:5180',
        'http://localhost:15173',
        'http://localhost:15174',
        'http://localhost:15175',
        'http://127.0.0.1:4173',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5180',
        'http://127.0.0.1:15174',
        'http://127.0.0.1:15175',
      ].join(','),
    )
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_TOKEN_SECRET: z.string().min(32),
  JWT_ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  MAIL_FROM: z.string().email(),
  OPENSEARCH_NODE: z.string().url(),
  OPENSEARCH_USERNAME: z.string().min(1).optional(),
  OPENSEARCH_PASSWORD: z.string().optional(),
  CLICKHOUSE_URL: z.string().url(),
  CLICKHOUSE_USERNAME: z.string().min(1).default('default'),
  CLICKHOUSE_PASSWORD: z.string().optional(),
  CLICKHOUSE_DATABASE: z.string().min(1).default('moddery'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  RATE_LIMIT_REQUESTS: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  REQUEST_LOGGING_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  REDIS_URL: z.string().url(),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  S3_ENDPOINT: z.string().url().optional(),
  S3_FORCE_PATH_STYLE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  S3_PUBLIC_BASE_URL: z.string().url(),
  S3_REGION: z.string().min(1).default('us-east-1'),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
});

export type Environment = z.infer<typeof envSchema>;

export function validateEnvironment(): {
  app: {
    corsOrigins: Environment['CORS_ORIGINS'];
    jwtAccessTokenSecret: Environment['JWT_ACCESS_TOKEN_SECRET'];
    jwtAccessTokenTtlSeconds: Environment['JWT_ACCESS_TOKEN_TTL_SECONDS'];
    nodeEnv: Environment['NODE_ENV'];
    port: Environment['PORT'];
    rateLimitRequests: Environment['RATE_LIMIT_REQUESTS'];
    rateLimitTtlSeconds: Environment['RATE_LIMIT_TTL_SECONDS'];
    requestLoggingEnabled: Environment['REQUEST_LOGGING_ENABLED'];
  };
  database: {
    url: Environment['DATABASE_URL'];
  };
  redis: {
    url: Environment['REDIS_URL'];
  };
  mail: {
    from: Environment['MAIL_FROM'];
    smtpHost: Environment['SMTP_HOST'];
    smtpPort: Environment['SMTP_PORT'];
  };
  search: {
    node: Environment['OPENSEARCH_NODE'];
    password: Environment['OPENSEARCH_PASSWORD'];
    username: Environment['OPENSEARCH_USERNAME'];
  };
  analytics: {
    database: Environment['CLICKHOUSE_DATABASE'];
    password: Environment['CLICKHOUSE_PASSWORD'];
    url: Environment['CLICKHOUSE_URL'];
    username: Environment['CLICKHOUSE_USERNAME'];
  };
  s3: {
    accessKeyId: Environment['S3_ACCESS_KEY_ID'];
    bucket: Environment['S3_BUCKET'];
    endpoint: Environment['S3_ENDPOINT'];
    forcePathStyle: Environment['S3_FORCE_PATH_STYLE'];
    publicBaseUrl: Environment['S3_PUBLIC_BASE_URL'];
    region: Environment['S3_REGION'];
    secretAccessKey: Environment['S3_SECRET_ACCESS_KEY'];
  };
} {
  const env = envSchema.parse(process.env);

  return {
    app: {
      corsOrigins: env.CORS_ORIGINS,
      jwtAccessTokenSecret: env.JWT_ACCESS_TOKEN_SECRET,
      jwtAccessTokenTtlSeconds: env.JWT_ACCESS_TOKEN_TTL_SECONDS,
      nodeEnv: env.NODE_ENV,
      port: env.PORT,
      rateLimitRequests: env.RATE_LIMIT_REQUESTS,
      rateLimitTtlSeconds: env.RATE_LIMIT_TTL_SECONDS,
      requestLoggingEnabled: env.REQUEST_LOGGING_ENABLED,
    },
    database: {
      url: env.DATABASE_URL,
    },
    redis: {
      url: env.REDIS_URL,
    },
    mail: {
      from: env.MAIL_FROM,
      smtpHost: env.SMTP_HOST,
      smtpPort: env.SMTP_PORT,
    },
    search: {
      node: env.OPENSEARCH_NODE,
      password: env.OPENSEARCH_PASSWORD,
      username: env.OPENSEARCH_USERNAME,
    },
    analytics: {
      database: env.CLICKHOUSE_DATABASE,
      password: env.CLICKHOUSE_PASSWORD,
      url: env.CLICKHOUSE_URL,
      username: env.CLICKHOUSE_USERNAME,
    },
    s3: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      bucket: env.S3_BUCKET,
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: env.S3_FORCE_PATH_STYLE,
      publicBaseUrl: env.S3_PUBLIC_BASE_URL,
      region: env.S3_REGION,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  };
}
