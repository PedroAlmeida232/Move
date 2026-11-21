package br.app.move.meal;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface MealRepository extends JpaRepository<Meal, UUID> {

    List<Meal> findByUserIdAndEatenOnOrderByCreatedAt(UUID userId, LocalDate eatenOn);

    /** Proteína total de cada dia com refeições. */
    @Query("select new br.app.move.meal.DayProtein(m.eatenOn, sum(m.proteinG)) "
            + "from Meal m where m.userId = :userId group by m.eatenOn")
    List<DayProtein> proteinByDay(UUID userId);

    Optional<Meal> findByIdAndUserId(UUID id, UUID userId);
}
