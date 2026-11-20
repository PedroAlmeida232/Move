package br.app.move.workout;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Formato JSON dos treinos feitos em /api/v1/workouts. Datas em UTC. */
public final class WorkoutData {

    private WorkoutData() {
    }

    /** Uma série concluída. */
    public record SetData(
            @NotBlank @Size(max = 100) String exercise,
            @NotNull @DecimalMin("0") @DecimalMax("1000") @Digits(integer = 4, fraction = 2) BigDecimal weightKg,
            @NotNull @Min(0) @Max(1000) Integer reps) {
    }

    public record Request(
            @NotNull Instant performedAt,
            @Size(max = 100) String name,
            @NotNull @Size(min = 1, max = 200) List<@Valid @NotNull SetData> sets) {
    }

    public record Response(UUID id, Instant performedAt, String name, List<SetData> sets) {
    }
}
