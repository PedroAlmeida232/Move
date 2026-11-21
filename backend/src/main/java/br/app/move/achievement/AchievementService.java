package br.app.move.achievement;

import br.app.move.achievement.AchievementData.View;
import br.app.move.achievement.AchievementRules.Stats;
import br.app.move.meal.DietGoals;
import br.app.move.meal.DietGoalsRepository;
import br.app.move.meal.MealRepository;
import br.app.move.meal.MealService;
import br.app.move.plan.PlanDay;
import br.app.move.plan.PlanDayRepository;
import br.app.move.weight.WeightEntryRepository;
import br.app.move.workout.WorkoutSession;
import br.app.move.workout.WorkoutSessionRepository;
import br.app.move.workout.WorkoutSet;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AchievementService {

    private final AchievementUnlockedRepository unlocked;
    private final WorkoutSessionRepository workouts;
    private final MealRepository meals;
    private final DietGoalsRepository dietGoals;
    private final WeightEntryRepository weights;
    private final PlanDayRepository planDays;

    public AchievementService(AchievementUnlockedRepository unlocked, WorkoutSessionRepository workouts,
            MealRepository meals, DietGoalsRepository dietGoals, WeightEntryRepository weights,
            PlanDayRepository planDays) {
        this.unlocked = unlocked;
        this.workouts = workouts;
        this.meals = meals;
        this.dietGoals = dietGoals;
        this.weights = weights;
        this.planDays = planDays;
    }

    /** O catálogo inteiro, com a data de desbloqueio (ou nulo) de cada conquista. */
    @Transactional(readOnly = true)
    public List<View> list(UUID userId) {
        Map<String, Instant> datas = unlocked.findOfUser(userId).stream()
                .collect(Collectors.toMap(a -> a.getId().code(), AchievementUnlocked::getUnlockedAt));
        return Arrays.stream(Achievement.values())
                .map(a -> new View(a.name(), a.title(), a.description(), datas.get(a.name())))
                .toList();
    }

    /**
     * Desbloqueia as conquistas cumpridas, uma única vez cada. Roda ao salvar treino, refeição
     * ou peso. Conquista desbloqueada nunca é removida (apagar o treino não a tira).
     * Os dias seguem o UTC, como os treinos são gravados.
     */
    @Transactional
    public void evaluate(UUID userId) {
        Set<String> jaTem = unlocked.findOfUser(userId).stream()
                .map(a -> a.getId().code())
                .collect(Collectors.toSet());
        Instant agora = Instant.now();
        for (Achievement a : AchievementRules.earned(stats(userId))) {
            if (!jaTem.contains(a.name())) {
                unlocked.unlock(userId, a.name(), agora);
            }
        }
    }

    private Stats stats(UUID userId) {
        List<WorkoutSession> sessoes = workouts.findAllOfUser(userId);
        List<LocalDate> diasDeTreino = sessoes.stream()
                .map(s -> s.getPerformedAt().atZone(ZoneOffset.UTC).toLocalDate())
                .toList();
        List<Map<String, BigDecimal>> cargaMaximaPorTreino = sessoes.stream()
                .map(s -> s.getSets().stream().collect(
                        Collectors.toMap(WorkoutSet::getExerciseName, WorkoutSet::getWeightKg, BigDecimal::max)))
                .toList();
        int series = sessoes.stream().mapToInt(s -> s.getSets().size()).sum();

        return new Stats(
                sessoes.size(),
                series,
                AchievementRules.longestStreak(diasDeTreino, restWeekdays(userId)),
                AchievementRules.hasRecord(cargaMaximaPorTreino),
                AchievementRules.longestWeekRun(weights.findDatesOfUser(userId)),
                proteinDays(userId));
    }

    /** Dias da semana sem exercício no plano do usuário (sem plano, nenhum). */
    private Set<Integer> restWeekdays(UUID userId) {
        return planDays.findByUserIdOrderByWeekday(userId).stream()
                .filter(d -> d.getExercises().isEmpty())
                .map(PlanDay::getWeekday)
                .collect(Collectors.toSet());
    }

    private int proteinDays(UUID userId) {
        int meta = dietGoals.findById(userId)
                .map(DietGoals::getProteinG)
                .orElse(MealService.META_PADRAO.proteinG());
        if (meta <= 0) {
            return 0;
        }
        BigDecimal limite = BigDecimal.valueOf(meta);
        return (int) meals.proteinByDay(userId).stream()
                .filter(d -> d.proteinG().compareTo(limite) >= 0)
                .count();
    }
}
