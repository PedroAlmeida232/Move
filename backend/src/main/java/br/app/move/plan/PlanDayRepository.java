package br.app.move.plan;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface PlanDayRepository extends JpaRepository<PlanDay, UUID> {

    @EntityGraph(attributePaths = "exercises")
    List<PlanDay> findByUserIdOrderByWeekday(UUID userId);

    /** Remoção em lote; os exercícios saem pelo "on delete cascade" do banco. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from PlanDay d where d.userId = :userId")
    void deleteAllOfUser(UUID userId);
}
