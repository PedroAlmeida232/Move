package br.app.move.meal;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MealRepository extends JpaRepository<Meal, UUID> {

    List<Meal> findByUserIdAndEatenOnOrderByCreatedAt(UUID userId, LocalDate eatenOn);

    Optional<Meal> findByIdAndUserId(UUID id, UUID userId);
}
