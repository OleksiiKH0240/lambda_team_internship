import type { Config } from "drizzle-kit";
 
export default {
  schema: "./schemas.ts",
  out: "./drizzle",
} satisfies Config;