import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { models, tournament } from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Model IDs in AI Gateway format: "provider/model" (same as santa-market)
const MODELS = [
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "openai" },
  { id: "anthropic/claude-sonnet-4-20250514", name: "Claude Sonnet 4", provider: "anthropic" },
  { id: "google/gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google" },
  { id: "xai/grok-3-fast", name: "Grok 3", provider: "xai" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3", provider: "deepseek" },
];

async function seed() {
  console.log("Seeding models...");

  for (const model of MODELS) {
    await db.insert(models).values(model).onConflictDoNothing();
  }

  await db.insert(tournament).values({ id: 1 }).onConflictDoNothing();

  console.log("Seed complete!");
}

seed().catch(console.error);
