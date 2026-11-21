package br.app.move.meal;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DietGoalsRepository extends JpaRepository<DietGoals, UUID> {
}
