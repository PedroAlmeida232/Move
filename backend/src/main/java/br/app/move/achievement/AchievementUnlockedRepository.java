package br.app.move.achievement;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface AchievementUnlockedRepository extends JpaRepository<AchievementUnlocked, AchievementUnlockedId> {

    @Query("select a from AchievementUnlocked a where a.id.userId = :userId")
    List<AchievementUnlocked> findOfUser(UUID userId);

    /** Idempotente, mesmo com dois salvamentos ao mesmo tempo: se já existe, não faz nada. */
    @Modifying
    @Query(value = """
            insert into achievements_unlocked (user_id, code, unlocked_at)
            values (:userId, :code, :unlockedAt)
            on conflict do nothing
            """, nativeQuery = true)
    void unlock(UUID userId, String code, Instant unlockedAt);
}
