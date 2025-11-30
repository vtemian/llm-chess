import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { models, tournament } from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Model IDs in AI Gateway format: "provider/model"
const MODELS = [
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "openai" },
  { id: "anthropic/claude-sonnet-4-20250514", name: "Claude Sonnet 4", provider: "anthropic" },
  { id: "google/gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "google" },
  { id: "groq/llama-3.1-70b-versatile", name: "Llama 3.1 70B", provider: "groq" },
  { id: "mistral/mistral-large-latest", name: "Mistral Large", provider: "mistral" },
  { id: "cohere/command-r-plus", name: "Command R+", provider: "cohere" },
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
