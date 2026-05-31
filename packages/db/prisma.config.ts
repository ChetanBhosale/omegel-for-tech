import { defineConfig } from 'prisma/config'
import secrets from '@repo/secrets/backend'

// Prisma CLI configuration (used by `prisma migrate`, `prisma generate`, etc.).
// The datasource URL is sourced from the shared secrets package, which loads
// it from the repo-root .env file.
export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations'
    },
    datasource: {
        url: secrets.DATABASE_URL
    }
})
