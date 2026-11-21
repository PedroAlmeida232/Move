package br.app.move.weight;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface WeightEntryRepository extends JpaRepository<WeightEntry, WeightEntryId> {

    @Query("select e.id.entryDate from WeightEntry e where e.id.userId = :userId")
    List<LocalDate> findDatesOfUser(UUID userId);

    @Query("""
            select e from WeightEntry e
            where e.id.userId = :userId and e.id.entryDate between :from and :to
            order by e.id.entryDate
            """)
    List<WeightEntry> findInRange(UUID userId, LocalDate from, LocalDate to);
}
