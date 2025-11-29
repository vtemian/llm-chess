import { db } from "@/db";
import { games, moves, models } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateMove, applyMove, getLegalMoves, getTurn, isGameOver, getGameResult, getMoveNumber } from "./chess";
import { requestMove } from "./ai";
import { calculateNewElo, outcomeFromResult } from "./elo";
import type { Game } from "@/db/schema";

export async function processGame(game: Game): Promise<void> {
  const turn = getTurn(game.fen);
  const modelId = turn === "w" ? game.whiteId : game.blackId;
  const color = turn === "w" ? "white" : "black";

  // Get recent moves for context
  const recentMoves = await db
    .select({ moveSan: moves.moveSan })
    .from(moves)
    .where(eq(moves.gameId, game.id))
    .orderBy(moves.moveNumber)
    .limit(10);

  const legalMoves = getLegalMoves(game.fen);

  let moveResponse;
  let errorContext: string | undefined;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      moveResponse = await requestMove(modelId, {
        fen: game.fen,
        color: color as "white" | "black",
        legalMoves,
        lastMoves: recentMoves.map(m => m.moveSan),
        errorContext,
      });

      if (validateMove(game.fen, moveResponse.move)) {
        break;
      }

      errorContext = `"${moveResponse.move}" is illegal. Legal moves: ${legalMoves.join(", ")}`;
      moveResponse = null;

    } catch {
      if (attempt === 3) {
        // Forfeit
        await forfeitGame(game, modelId);
        return;
      }
    }
  }

  if (!moveResponse) {
    await forfeitGame(game, modelId);
    return;
  }

  // Apply move
  const result = applyMove(game.fen, moveResponse.move);
  if (!result) {
    await forfeitGame(game, modelId);
    return;
  }

  const moveNumber = getMoveNumber(game.fen);

  // Store move
  await db.insert(moves).values({
    gameId: game.id,
    modelId,
    moveNumber,
    moveSan: moveResponse.move,
    fenAfter: result.fen,
    reasoning: moveResponse.reasoning,
  });

  // Update game
  await db
    .update(games)
    .set({ fen: result.fen, pgn: result.pgn })
    .where(eq(games.id, game.id));

  // Check for game end
  if (isGameOver(result.fen)) {
    const gameResult = getGameResult(result.fen);
    await endGame(game, gameResult!);
  }
}

async function forfeitGame(game: Game, forfeitingModelId: string): Promise<void> {
  const result = forfeitingModelId === game.whiteId ? "0-1" : "1-0";
  await endGame(game, result);
}

async function endGame(game: Game, result: "1-0" | "0-1" | "1/2-1/2"): Promise<void> {
  // Get current ratings
  const [white] = await db.select().from(models).where(eq(models.id, game.whiteId));
  const [black] = await db.select().from(models).where(eq(models.id, game.blackId));

  // Calculate new ELO
  const whiteOutcome = outcomeFromResult(result, true);
  const blackOutcome = outcomeFromResult(result, false);

  const whiteElo = calculateNewElo(white.elo, black.elo, whiteOutcome);
  const blackElo = calculateNewElo(black.elo, white.elo, blackOutcome);

  // Update models
  await db
    .update(models)
    .set({
      elo: whiteElo.newRating,
      gamesPlayed: white.gamesPlayed + 1,
      wins: white.wins + (whiteOutcome === "win" ? 1 : 0),
      losses: white.losses + (whiteOutcome === "loss" ? 1 : 0),
      draws: white.draws + (whiteOutcome === "draw" ? 1 : 0),
    })
    .where(eq(models.id, game.whiteId));

  await db
    .update(models)
    .set({
      elo: blackElo.newRating,
      gamesPlayed: black.gamesPlayed + 1,
      wins: black.wins + (blackOutcome === "win" ? 1 : 0),
      losses: black.losses + (blackOutcome === "loss" ? 1 : 0),
      draws: black.draws + (blackOutcome === "draw" ? 1 : 0),
    })
    .where(eq(models.id, game.blackId));

  // Update game
  await db
    .update(games)
    .set({ status: "complete", result, endedAt: new Date() })
    .where(eq(games.id, game.id));
}

export async function matchmake(): Promise<void> {
  // Get models not in active games
  const activeGames = await db
    .select({ whiteId: games.whiteId, blackId: games.blackId })
    .from(games)
    .where(eq(games.status, "active"));

  const busyModelIds = new Set(
    activeGames.flatMap(g => [g.whiteId, g.blackId])
  );

  const allModels = await db.select().from(models).orderBy(models.elo);
  const idleModels = allModels.filter(m => !busyModelIds.has(m.id));

  // Pair adjacent models by ELO
  for (let i = 0; i < idleModels.length - 1; i += 2) {
    const model1 = idleModels[i];
    const model2 = idleModels[i + 1];

    // Alternate colors (simple: lower ELO plays white)
    await db.insert(games).values({
      whiteId: model1.id,
      blackId: model2.id,
    });
  }
}
