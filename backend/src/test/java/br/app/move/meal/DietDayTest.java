package br.app.move.meal;

import static org.assertj.core.api.Assertions.assertThat;

import br.app.move.meal.MealData.Goals;
import br.app.move.meal.MealData.MealView;
import br.app.move.meal.MealData.Remaining;
import br.app.move.meal.MealData.Totals;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class DietDayTest {

    private static final LocalDate DIA = LocalDate.of(2026, 11, 20);

    private static MealView refeicao(int kcal, String prot, String carb, String gord) {
        return new MealView(UUID.randomUUID(), DIA, "Refeição", kcal,
                new BigDecimal(prot), new BigDecimal(carb), new BigDecimal(gord));
    }

    @Test
    void diaSemRefeicoesTemTotalZeroERestanteIgualAMeta() {
        Totals totais = DietDay.totals(List.of());

        assertThat(totais.kcal()).isZero();
        assertThat(totais.proteinG()).isEqualByComparingTo("0");
        assertThat(totais.carbsG()).isEqualByComparingTo("0");
        assertThat(totais.fatG()).isEqualByComparingTo("0");
        Remaining restante = DietDay.remaining(totais, new Goals(2000, 140));
        assertThat(restante.kcal()).isEqualTo(2000);
        assertThat(restante.proteinG()).isEqualByComparingTo("140");
    }

    @Test
    void totalSomaTodasAsRefeicoes() {
        Totals totais = DietDay.totals(List.of(
                refeicao(500, "30.5", "60", "10.2"),
                refeicao(700, "45", "80.5", "20")));

        assertThat(totais.kcal()).isEqualTo(1200);
        assertThat(totais.proteinG()).isEqualByComparingTo("75.5");
        assertThat(totais.carbsG()).isEqualByComparingTo("140.5");
        assertThat(totais.fatG()).isEqualByComparingTo("30.2");
    }

    @Test
    void restanteDescontaOTotalDaMeta() {
        Remaining restante = DietDay.remaining(
                DietDay.totals(List.of(refeicao(1200, "75.5", "0", "0"))), new Goals(2000, 140));

        assertThat(restante.kcal()).isEqualTo(800);
        assertThat(restante.proteinG()).isEqualByComparingTo("64.5");
    }

    @Test
    void restanteFicaNegativoQuandoPassaDaMeta() {
        Remaining restante = DietDay.remaining(
                DietDay.totals(List.of(refeicao(2300, "150", "0", "0"))), new Goals(2000, 140));

        assertThat(restante.kcal()).isEqualTo(-300);
        assertThat(restante.proteinG()).isEqualByComparingTo("-10");
    }
}
