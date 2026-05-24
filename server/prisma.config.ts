import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // URL is used by Prisma CLI (migrate, db push) — runtime uses PrismaPg adapter in config/prisma.ts
    url: process.env.DATABASE_URL ?? '',
  },
})
