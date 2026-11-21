package br.app.move.achievement;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

/** Regras puras das conquistas: sem banco, sem relógio. */
final class AchievementRules {

    private AchievementRules() {
    }

    /**
     * @param workouts treinos salvos
     * @param sets séries salvas, no total
     * @param longestStreak maior sequência de dias de treino já feita
     * @param record alguma vez superou a carga anterior em um exercício
     * @param weightWeeks maior número de semanas seguidas com peso registrado
     * @param proteinDays dias em que a meta de proteína foi batida
     */
    record Stats(int workouts, int sets, int longestStreak, boolean record, int weightWeeks, int proteinDays) {
    }

    static Set<Achievement> earned(Stats s) {
        Set<Achievement> ganhas = EnumSet.noneOf(Achievement.class);
        if (s.workouts() >= 1) {
            ganhas.add(Achievement.FIRST);
        }
        if (s.workouts() >= 10) {
            ganhas.add(Achievement.TEN);
        }
        if (s.workouts() >= 25) {
            ganhas.add(Achievement.W25);
        }
        if (s.sets() >= 100) {
            ganhas.add(Achievement.SETS_100);
        }
        if (s.longestStreak() >= 7) {
            ganhas.add(Achievement.STREAK_7);
        }
        if (s.record()) {
            ganhas.add(Achievement.PR);
        }
        if (s.weightWeeks() >= 4) {
            ganhas.add(Achievement.W4);
        }
        if (s.proteinDays() >= 5) {
            ganhas.add(Achievement.PROT_5);
        }
        return ganhas;
    }

    /**
     * Maior sequência de dias de treino do histórico. Os dias de descanso do plano
     * (0 = domingo … 6 = sábado) entre dois treinos não quebram a sequência e não somam.
     */
    static int longestStreak(Collection<LocalDate> trainingDays, Set<Integer> restWeekdays) {
        LocalDate anterior = null;
        int sequencia = 0;
        int maior = 0;
        for (LocalDate dia : new TreeSet<>(trainingDays)) {
            sequencia = anterior != null && onlyRestBetween(anterior, dia, restWeekdays) ? sequencia + 1 : 1;
            maior = Math.max(maior, sequencia);
            anterior = dia;
        }
        return maior;
    }

    private static boolean onlyRestBetween(LocalDate from, LocalDate to, Set<Integer> restWeekdays) {
        for (LocalDate d = from.plusDays(1); d.isBefore(to); d = d.plusDays(1)) {
            if (!restWeekdays.contains(d.getDayOfWeek().getValue() % 7)) {
                return false;
            }
        }
        return true;
    }

    /** Maior número de semanas seguidas (segunda a domingo) com ao menos um registro. */
    static int longestWeekRun(Collection<LocalDate> dates) {
        Long anterior = null;
        int sequencia = 0;
        int maior = 0;
        // o dia 0 da época (quinta) está 3 dias depois da segunda: a semana vira na segunda
        for (long semana : dates.stream().map(d -> Math.floorDiv(d.toEpochDay() + 3, 7))
                .collect(Collectors.toCollection(TreeSet::new))) {
            sequencia = anterior != null && semana == anterior + 1 ? sequencia + 1 : 1;
            maior = Math.max(maior, sequencia);
            anterior = semana;
        }
        return maior;
    }

    /**
     * @param sessions a carga máxima por exercício de cada treino, do mais antigo ao mais novo
     * @return se algum treino superou a maior carga anterior do mesmo exercício
     */
    static boolean hasRecord(List<Map<String, BigDecimal>> sessions) {
        Map<String, BigDecimal> maiorAteAgora = new HashMap<>();
        for (Map<String, BigDecimal> sessao : sessions) {
            for (Map.Entry<String, BigDecimal> e : sessao.entrySet()) {
                BigDecimal anterior = maiorAteAgora.get(e.getKey());
                if (anterior != null && e.getValue().compareTo(anterior) > 0) {
                    return true;
                }
            }
            sessao.forEach((exercicio, carga) -> maiorAteAgora.merge(exercicio, carga, BigDecimal::max));
        }
        return false;
    }
}
