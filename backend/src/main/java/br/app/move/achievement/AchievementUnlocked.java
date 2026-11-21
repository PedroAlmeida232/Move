package br.app.move.achievement;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;

/** Leitura apenas: o desbloqueio é gravado por AchievementUnlockedRepository.unlock. */
@Entity
@Table(name = "achievements_unlocked")
public class AchievementUnlocked {

    @EmbeddedId
    private AchievementUnlockedId id;

    @Column(name = "unlocked_at", nullable = false)
    private Instant unlockedAt;

    protected AchievementUnlocked() {
    }

    public AchievementUnlockedId getId() {
        return id;
    }

    public Instant getUnlockedAt() {
        return unlockedAt;
    }
}
