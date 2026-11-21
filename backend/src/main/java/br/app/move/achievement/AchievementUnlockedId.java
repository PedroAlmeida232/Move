package br.app.move.achievement;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.UUID;

@Embeddable
public record AchievementUnlockedId(
        @Column(name = "user_id") UUID userId,
        @Column(name = "code") String code) implements Serializable {
}
