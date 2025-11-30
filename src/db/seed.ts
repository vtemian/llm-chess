import { config } from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { models, tournament, games, moves } from "./schema";

config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Model IDs in AI Gateway format
const MODELS = [
  { id: "openai/gpt-5.1-thinking", name: "GPT-5", provider: "openai" },
  { id: "anthropic/claude-opus-4.5", name: "Claude Opus", provider: "anthropic" },
  { id: "google/gemini-3-pro-preview", name: "Gemini Pro", provider: "google" },
  { id: "xai/grok-4-fast-reasoning", name: "Grok 4", provider: "xai" },
  { id: "deepseek/deepseek-v3", name: "DeepSeek V3", provider: "deepseek" },
  { id: "meta/llama-4-maverick", name: "Llama 4", provider: "meta" },
];

async function seed() {
  console.log("Clearing existing data...");
  await db.delete(moves);
  await db.delete(games);
  await db.delete(models);

  console.log("Seeding models...");
  for (const model of MODELS) {
    await db.insert(models).values(model).onConflictDoNothing();
  }

  await db.insert(tournament).values({ id: 1 }).onConflictDoNothing();

  console.log("Seed complete!");
  await sql.end();
}

seed().catch(console.error);
