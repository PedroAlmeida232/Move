package br.app.move.workout;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, UUID> {

    @EntityGraph(attributePaths = "sets")
    @Query("""
            select s from WorkoutSession s
            where s.userId = :userId and s.performedAt >= :from and s.performedAt < :to
            order by s.performedAt
            """)
    List<WorkoutSession> findInRange(UUID userId, Instant from, Instant to);

    /** Todos os treinos do usuário, do mais antigo ao mais novo (base das conquistas). */
    @EntityGraph(attributePaths = "sets")
    @Query("select s from WorkoutSession s where s.userId = :userId order by s.performedAt, s.id")
    List<WorkoutSession> findAllOfUser(UUID userId);

    Optional<WorkoutSession> findByIdAndUserId(UUID id, UUID userId);
}
