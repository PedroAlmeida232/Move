package br.app.move.plan;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

/** Formato JSON do plano em GET e PUT /api/v1/plan. */
public final class PlanData {

    private PlanData() {
    }

    public record ProfileData(@Size(max = 100) String name, @Size(max = 200) String goal) {
    }

    public record ExerciseData(
            @NotBlank @Size(max = 100) String name,
            @NotNull @Min(1) @Max(20) Integer sets,
            @NotBlank @Size(max = 30) String reps,
            @Size(max = 30) String side,
            @Size(max = 500) String note) {
    }

    public record DayData(
            @NotNull @Min(0) @Max(6) Integer weekday,
            @NotBlank @Size(max = 100) String name,
            @NotNull @Size(max = 30) List<@Valid @NotNull ExerciseData> exercises) {
    }

    public record Request(
            @NotNull @Valid ProfileData profile,
            @NotNull @Size(max = 7) List<@Valid @NotNull DayData> days) {
    }

    /** trainingDays: dias da semana (0 = domingo) que têm ao menos um exercício. */
    public record Response(ProfileData profile, List<Integer> trainingDays, List<DayData> days) {
    }
}
