import "dotenv/config";
import pg from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing.");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = globalThis.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
