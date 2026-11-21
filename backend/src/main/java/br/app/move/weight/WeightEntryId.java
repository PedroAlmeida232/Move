package br.app.move.weight;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

@Embeddable
public record WeightEntryId(
        @Column(name = "user_id") UUID userId,
        @Column(name = "entry_date") LocalDate entryDate) implements Serializable {
}
