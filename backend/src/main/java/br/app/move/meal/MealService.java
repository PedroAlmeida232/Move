package br.app.move.meal;

import br.app.move.meal.MealData.DayResponse;
import br.app.move.meal.MealData.Goals;
import br.app.move.meal.MealData.MealRequest;
import br.app.move.meal.MealData.MealView;
import br.app.move.meal.MealData.Totals;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.server.ResponseStatusException;

@Service
@Validated
public class MealService {

    /** Meta padrão do protótipo, usada enquanto o usuário não define a dele. */
    static final Goals META_PADRAO = new Goals(2000, 140);

    private final MealRepository meals;
    private final DietGoalsRepository goals;

    public MealService(MealRepository meals, DietGoalsRepository goals) {
        this.meals = meals;
        this.goals = goals;
    }

    @Transactional
    public MealView create(UUID userId, @Valid MealRequest r) {
        Meal meal = meals.save(new Meal(userId, r.date(), r.name(), r.kcal(), r.proteinG(), r.carbsG(), r.fatG()));
        return toView(meal);
    }

    @Transactional(readOnly = true)
    public DayResponse day(UUID userId, LocalDate date) {
        List<MealView> doDia = meals.findByUserIdAndEatenOnOrderByCreatedAt(userId, date).stream()
                .map(MealService::toView)
                .toList();
        Goals meta = goals(userId);
        Totals totais = DietDay.totals(doDia);
        return new DayResponse(date, doDia, totais, meta, DietDay.remaining(totais, meta));
    }

    /** Refeição de outro usuário responde 404, sem revelar que existe. */
    @Transactional
    public void delete(UUID userId, UUID mealId) {
        Meal meal = meals.findByIdAndUserId(mealId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        meals.delete(meal);
    }

    @Transactional(readOnly = true)
    public Goals goals(UUID userId) {
        return goals.findById(userId)
                .map(g -> new Goals(g.getKcal(), g.getProteinG()))
                .orElse(META_PADRAO);
    }

    @Transactional
    public Goals updateGoals(UUID userId, @Valid Goals nova) {
        goals.save(new DietGoals(userId, nova.kcal(), nova.proteinG()));
        return nova;
    }

    private static MealView toView(Meal m) {
        return new MealView(m.getId(), m.getEatenOn(), m.getName(), m.getKcal(),
                m.getProteinG(), m.getCarbsG(), m.getFatG());
    }
}
