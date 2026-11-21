package br.app.move.achievement;

import java.time.Instant;

/** Formato JSON de GET /api/v1/achievements. */
public final class AchievementData {

    private AchievementData() {
    }

    /** unlockedAt é nulo enquanto a conquista não foi desbloqueada. */
    public record View(String code, String name, String description, Instant unlockedAt) {
    }
}
