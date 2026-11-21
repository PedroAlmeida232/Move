package br.app.move.weight;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

/** Formato JSON de /api/v1/weight. A data é o dia local de quem se pesou. */
public final class WeightData {

    private WeightData() {
    }

    public record EntryRequest(
            @NotNull @DecimalMin("20") @DecimalMax("400") @Digits(integer = 3, fraction = 1) BigDecimal weightKg,
            @DecimalMin("20") @DecimalMax("300") @Digits(integer = 3, fraction = 1) BigDecimal waistCm) {
    }

    public record Entry(LocalDate date, BigDecimal weightKg, BigDecimal waistCm) {
    }
}
