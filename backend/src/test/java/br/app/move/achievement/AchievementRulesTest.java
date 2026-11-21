package br.app.move.achievement;

import static br.app.move.achievement.Achievement.FIRST;
import static br.app.move.achievement.Achievement.PR;
import static br.app.move.achievement.Achievement.PROT_5;
import static br.app.move.achievement.Achievement.SETS_100;
import static br.app.move.achievement.Achievement.STREAK_7;
import static br.app.move.achievement.Achievement.TEN;
import static br.app.move.achievement.Achievement.W25;
import static br.app.move.achievement.Achievement.W4;
import static org.assertj.core.api.Assertions.assertThat;

import br.app.move.achievement.AchievementRules.Stats;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class AchievementRulesTest {

    private static final Stats ZERO = new Stats(0, 0, 0, false, 0, 0);

    private static Stats comTreinos(int n) {
        return new Stats(n, 0, 0, false, 0, 0);
    }

    private static LocalDate d(String iso) {
        return LocalDate.parse(iso);
    }

    private static Map<String, BigDecimal> kg(String exercicio, String kg) {
        return Map.of(exercicio, new BigDecimal(kg));
    }

    @Test
    void semNadaNaoDesbloqueiaNada() {
        assertThat(AchievementRules.earned(ZERO)).isEmpty();
    }

    @Test
    void conquistasPorQuantidadeDeTreinosNosLimites() {
        assertThat(AchievementRules.earned(comTreinos(0))).isEmpty();
        assertThat(AchievementRules.earned(comTreinos(1))).containsExactlyInAnyOrder(FIRST);
        assertThat(AchievementRules.earned(comTreinos(9))).containsExactlyInAnyOrder(FIRST);
        assertThat(AchievementRules.earned(comTreinos(10))).containsExactlyInAnyOrder(FIRST, TEN);
        assertThat(AchievementRules.earned(comTreinos(24))).containsExactlyInAnyOrder(FIRST, TEN);
        assertThat(AchievementRules.earned(comTreinos(25))).containsExactlyInAnyOrder(FIRST, TEN, W25);
    }

    @Test
    void cemSeriesNoTotal() {
        assertThat(AchievementRules.earned(new Stats(0, 99, 0, false, 0, 0))).doesNotContain(SETS_100);
        assertThat(AchievementRules.earned(new Stats(0, 100, 0, false, 0, 0))).containsExactly(SETS_100);
    }

    @Test
    void seteDiasSeguidos() {
        assertThat(AchievementRules.earned(new Stats(0, 0, 6, false, 0, 0))).isEmpty();
        assertThat(AchievementRules.earned(new Stats(0, 0, 7, false, 0, 0))).containsExactly(STREAK_7);
    }

    @Test
    void novoRecorde() {
        assertThat(AchievementRules.earned(new Stats(0, 0, 0, true, 0, 0))).containsExactly(PR);
    }

    @Test
    void quatroSemanasDePeso() {
        assertThat(AchievementRules.earned(new Stats(0, 0, 0, false, 3, 0))).isEmpty();
        assertThat(AchievementRules.earned(new Stats(0, 0, 0, false, 4, 0))).containsExactly(W4);
    }

    @Test
    void cincoDiasDeProteina() {
        assertThat(AchievementRules.earned(new Stats(0, 0, 0, false, 0, 4))).isEmpty();
        assertThat(AchievementRules.earned(new Stats(0, 0, 0, false, 0, 5))).containsExactly(PROT_5);
    }

    @Test
    void sequenciaVaziaVale0() {
        assertThat(AchievementRules.longestStreak(List.of(), Set.of())).isZero();
    }

    @Test
    void sequenciaContaDiasConsecutivosEDiaRepetidoValeUma() {
        List<LocalDate> dias = List.of(d("2026-11-16"), d("2026-11-16"), d("2026-11-17"), d("2026-11-18"));

        assertThat(AchievementRules.longestStreak(dias, Set.of())).isEqualTo(3);
    }

    @Test
    void sequenciaQuebraNoDiaDeTreinoPerdidoEVaiAMaiorSequenciaDoHistorico() {
        List<LocalDate> dias = List.of(d("2026-11-10"), d("2026-11-11"),
                d("2026-11-13"), d("2026-11-14"), d("2026-11-15"));

        assertThat(AchievementRules.longestStreak(dias, Set.of())).isEqualTo(3);
    }

    @Test
    void diaDeDescansoNaoQuebraNemSoma() {
        // sábado 21 e segunda 23, domingo (0) é descanso
        List<LocalDate> dias = List.of(d("2026-11-21"), d("2026-11-23"));

        assertThat(AchievementRules.longestStreak(dias, Set.of(0))).isEqualTo(2);
        assertThat(AchievementRules.longestStreak(dias, Set.of())).isEqualTo(1);
    }

    @Test
    void doisDiasDeDescansoSeguidosTambemNaoQuebram() {
        List<LocalDate> dias = List.of(d("2026-11-21"), d("2026-11-24"));

        assertThat(AchievementRules.longestStreak(dias, Set.of(0, 1))).isEqualTo(2);
        assertThat(AchievementRules.longestStreak(dias, Set.of(0))).isEqualTo(1);
    }

    @Test
    void semanasSeguidasComPeso() {
        List<LocalDate> dias = List.of(d("2026-11-16"), d("2026-11-23"), d("2026-11-30"), d("2026-12-07"));

        assertThat(AchievementRules.longestWeekRun(dias)).isEqualTo(4);
    }

    @Test
    void semanaSemPesoQuebraADeSequencia() {
        List<LocalDate> dias = List.of(d("2026-11-16"), d("2026-11-23"), d("2026-12-07"), d("2026-12-14"));

        assertThat(AchievementRules.longestWeekRun(dias)).isEqualTo(2);
    }

    @Test
    void duasPesagensNaMesmaSemanaContamUmaSemana() {
        List<LocalDate> dias = List.of(d("2026-11-16"), d("2026-11-18"), d("2026-11-22"));

        assertThat(AchievementRules.longestWeekRun(dias)).isEqualTo(1);
    }

    @Test
    void semanaComecaNaSegunda() {
        // domingo 22 e segunda 23 estão em semanas diferentes
        assertThat(AchievementRules.longestWeekRun(List.of(d("2026-11-22"), d("2026-11-23")))).isEqualTo(2);
        assertThat(AchievementRules.longestWeekRun(List.of())).isZero();
    }

    @Test
    void recordeExigeUmaCargaMaiorQueTodasAsAnterioresDoMesmoExercicio() {
        assertThat(AchievementRules.hasRecord(List.of(kg("Supino", "20"), kg("Supino", "22")))).isTrue();
    }

    @Test
    void primeiraVezNoExercicioNaoERecorde() {
        assertThat(AchievementRules.hasRecord(List.of())).isFalse();
        assertThat(AchievementRules.hasRecord(List.of(kg("Supino", "20")))).isFalse();
    }

    @Test
    void cargaIgualOuMenorNaoERecorde() {
        assertThat(AchievementRules.hasRecord(List.of(kg("Supino", "20"), kg("Supino", "20")))).isFalse();
        assertThat(AchievementRules.hasRecord(List.of(kg("Supino", "22"), kg("Supino", "20")))).isFalse();
    }

    @Test
    void recordeComparaPorExercicioEUsaOMaximoAnterior() {
        assertThat(AchievementRules.hasRecord(List.of(kg("Supino", "20"), kg("Serrote", "30")))).isFalse();
        assertThat(AchievementRules.hasRecord(
                List.of(kg("Supino", "25"), kg("Supino", "20"), kg("Supino", "24")))).isFalse();
        assertThat(AchievementRules.hasRecord(
                List.of(kg("Supino", "25"), kg("Supino", "20"), kg("Supino", "26")))).isTrue();
    }
}
