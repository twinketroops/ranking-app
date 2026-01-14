import "dotenv/config";

// Minimal config for Prisma CLI compatibility in this project.
// Removed dependency on @prisma/config for Prisma v4 compatibility.
export default {
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
