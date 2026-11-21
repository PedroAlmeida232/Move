package br.app.move.meal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Formato JSON de /api/v1/meals. Macronutrientes em gramas, com uma casa decimal. */
public final class MealData {

    private MealData() {
    }

    /** date é o dia local de quem comeu. */
    public record MealRequest(
            @NotNull LocalDate date,
            @NotBlank @Size(max = 100) String name,
            @NotNull @Min(0) @Max(10000) Integer kcal,
            @NotNull @DecimalMin("0") @DecimalMax("1000") @Digits(integer = 4, fraction = 1) BigDecimal proteinG,
            @NotNull @DecimalMin("0") @DecimalMax("1000") @Digits(integer = 4, fraction = 1) BigDecimal carbsG,
            @NotNull @DecimalMin("0") @DecimalMax("1000") @Digits(integer = 4, fraction = 1) BigDecimal fatG) {
    }

    public record MealView(UUID id, LocalDate date, String name, int kcal,
            BigDecimal proteinG, BigDecimal carbsG, BigDecimal fatG) {
    }

    public record Goals(
            @NotNull @Min(1) @Max(10000) Integer kcal,
            @NotNull @Min(0) @Max(1000) Integer proteinG) {
    }

    public record Totals(int kcal, BigDecimal proteinG, BigDecimal carbsG, BigDecimal fatG) {
    }

    /** Meta menos total; negativo quando a meta foi ultrapassada. */
    public record Remaining(int kcal, BigDecimal proteinG) {
    }

    public record DayResponse(LocalDate date, List<MealView> meals, Totals totals, Goals goals,
            Remaining remaining) {
    }
}
