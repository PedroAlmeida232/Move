package br.app.move.meal;

import br.app.move.meal.MealData.Goals;
import br.app.move.meal.MealData.MealView;
import br.app.move.meal.MealData.Remaining;
import br.app.move.meal.MealData.Totals;
import java.math.BigDecimal;
import java.util.List;
import java.util.function.Function;

/** Regras puras do dia de dieta: total das refeições e quanto falta para a meta. */
final class DietDay {

    private DietDay() {
    }

    static Totals totals(List<MealView> meals) {
        return new Totals(
                meals.stream().mapToInt(MealView::kcal).sum(),
                sum(meals, MealView::proteinG),
                sum(meals, MealView::carbsG),
                sum(meals, MealView::fatG));
    }

    static Remaining remaining(Totals totals, Goals goals) {
        return new Remaining(
                goals.kcal() - totals.kcal(),
                BigDecimal.valueOf(goals.proteinG()).subtract(totals.proteinG()));
    }

    private static BigDecimal sum(List<MealView> meals, Function<MealView, BigDecimal> campo) {
        return meals.stream().map(campo).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
