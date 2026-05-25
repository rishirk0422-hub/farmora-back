import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for Neon
  },
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL (Neon) connected");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL error:", err.message);
});
