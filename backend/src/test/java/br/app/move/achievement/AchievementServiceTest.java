package br.app.move.achievement;

import static org.assertj.core.api.Assertions.assertThat;

import br.app.move.TesteDeIntegracao;
import br.app.move.achievement.AchievementData.View;
import br.app.move.meal.MealData.Goals;
import br.app.move.meal.MealData.MealRequest;
import br.app.move.meal.MealService;
import br.app.move.plan.PlanService;
import br.app.move.user.UserService;
import br.app.move.weight.WeightData.EntryRequest;
import br.app.move.weight.WeightService;
import br.app.move.workout.WorkoutData.Request;
import br.app.move.workout.WorkoutData.Response;
import br.app.move.workout.WorkoutData.SetData;
import br.app.move.workout.WorkoutService;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

@TesteDeIntegracao
class AchievementServiceTest {

    @Autowired
    private AchievementService achievements;

    @Autowired
    private WorkoutService workouts;

    @Autowired
    private MealService meals;

    @Autowired
    private WeightService weights;

    @Autowired
    private PlanService plans;

    @Autowired
    private UserService users;

    private UUID novoUsuario() {
        return users.findOrCreate("uid-" + UUID.randomUUID(), null).getId();
    }

    private static Instant meioDia(String dia) {
        return Instant.parse(dia + "T12:00:00Z");
    }

    private Response treino(UUID id, String dia, String exercicio, String kg) {
        return workouts.create(id, new Request(meioDia(dia), "Treino",
                List.of(new SetData(exercicio, new BigDecimal(kg), 10))));
    }

    private Response treino(UUID id, String dia) {
        return treino(id, dia, "Supino", "20");
    }

    private List<Achievement> desbloqueadas(UUID id) {
        return achievements.list(id).stream()
                .filter(v -> v.unlockedAt() != null)
                .map(v -> Achievement.valueOf(v.code()))
                .toList();
    }

    @Test
    void listaOCatalogoInteiroSemDesbloqueiosParaQuemNaoFezNada() {
        List<View> lista = achievements.list(novoUsuario());

        assertThat(lista).extracting(View::code).containsExactly(
                "FIRST", "STREAK_7", "TEN", "PR", "W4", "PROT_5", "SETS_100", "W25");
        assertThat(lista).allSatisfy(v -> {
            assertThat(v.unlockedAt()).isNull();
            assertThat(v.name()).isNotBlank();
            assertThat(v.description()).isNotBlank();
        });
    }

    @Test
    void primeiroTreinoDesbloqueiaPrimeiroTreino() {
        UUID id = novoUsuario();

        treino(id, "2026-11-16");

        assertThat(desbloqueadas(id)).containsExactly(Achievement.FIRST);
    }

    @Test
    void salvarDeNovoNaoDuplicaNemMudaAData() {
        UUID id = novoUsuario();
        treino(id, "2026-11-16");
        Instant antes = achievements.list(id).get(0).unlockedAt();

        treino(id, "2026-11-16");
        achievements.evaluate(id);
        achievements.evaluate(id);

        assertThat(desbloqueadas(id)).containsExactly(Achievement.FIRST);
        assertThat(achievements.list(id).get(0).unlockedAt()).isEqualTo(antes);
    }

    @Test
    void dezTreinosDesbloqueiamDezTreinos() {
        UUID id = novoUsuario();
        for (int i = 1; i <= 9; i++) {
            treino(id, "2026-10-%02d".formatted(i * 2));
        }
        assertThat(desbloqueadas(id)).doesNotContain(Achievement.TEN);

        treino(id, "2026-10-30");

        assertThat(desbloqueadas(id)).contains(Achievement.FIRST, Achievement.TEN);
    }

    @Test
    void cemSeriesDesbloqueiamCemSeries() {
        UUID id = novoUsuario();
        List<SetData> series = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            series.add(new SetData("Supino", new BigDecimal("20"), 10));
        }

        workouts.create(id, new Request(meioDia("2026-11-16"), "Treino", series));

        assertThat(desbloqueadas(id)).contains(Achievement.SETS_100);
    }

    @Test
    void seteDiasSeguidosDesbloqueiam() {
        UUID id = novoUsuario();
        for (int dia = 9; dia <= 14; dia++) {
            treino(id, "2026-11-%02d".formatted(dia));
        }
        assertThat(desbloqueadas(id)).doesNotContain(Achievement.STREAK_7);

        treino(id, "2026-11-15");

        assertThat(desbloqueadas(id)).contains(Achievement.STREAK_7);
    }

    @Test
    void domingoDeDescansoDoPlanoNaoQuebraASequencia() {
        UUID id = novoUsuario();
        plans.get(id); // plano inicial: domingo é descanso
        for (String dia : List.of("2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20",
                "2026-11-21")) {
            treino(id, dia);
        }
        assertThat(desbloqueadas(id)).doesNotContain(Achievement.STREAK_7);

        treino(id, "2026-11-23"); // segunda, depois do domingo 22

        assertThat(desbloqueadas(id)).contains(Achievement.STREAK_7);
    }

    @Test
    void semPlanoODomingoQuebraASequencia() {
        UUID id = novoUsuario();
        for (String dia : List.of("2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20",
                "2026-11-21", "2026-11-23")) {
            treino(id, dia);
        }

        assertThat(desbloqueadas(id)).doesNotContain(Achievement.STREAK_7);
    }

    @Test
    void novoRecordeDeCargaNoMesmoExercicio() {
        UUID id = novoUsuario();
        treino(id, "2026-11-16", "Supino", "20");
        assertThat(desbloqueadas(id)).doesNotContain(Achievement.PR);

        treino(id, "2026-11-17", "Supino", "22");

        assertThat(desbloqueadas(id)).contains(Achievement.PR);
    }

    @Test
    void cargaMaiorEmOutroExercicioNaoERecorde() {
        UUID id = novoUsuario();
        treino(id, "2026-11-16", "Supino", "20");

        treino(id, "2026-11-17", "Serrote", "40");

        assertThat(desbloqueadas(id)).doesNotContain(Achievement.PR);
    }

    @Test
    void quatroSemanasSeguidasDePesoDesbloqueiamBalancaEmDia() {
        UUID id = novoUsuario();
        weights.put(id, LocalDate.parse("2026-11-16"), new EntryRequest(new BigDecimal("80"), null));
        weights.put(id, LocalDate.parse("2026-11-23"), new EntryRequest(new BigDecimal("79.5"), null));
        weights.put(id, LocalDate.parse("2026-11-30"), new EntryRequest(new BigDecimal("79"), null));
        assertThat(desbloqueadas(id)).doesNotContain(Achievement.W4);

        weights.put(id, LocalDate.parse("2026-12-07"), new EntryRequest(new BigDecimal("78.5"), null));

        assertThat(desbloqueadas(id)).containsExactly(Achievement.W4);
    }

    @Test
    void metaDeProteinaEmCincoDiasDesbloqueiaProteinaEmDia() {
        UUID id = novoUsuario();
        meals.updateGoals(id, new Goals(2000, 100));
        for (int dia = 16; dia <= 19; dia++) {
            meals.create(id, refeicao("2026-11-" + dia, "100"));
        }
        meals.create(id, refeicao("2026-11-20", "99.9"));
        assertThat(desbloqueadas(id)).doesNotContain(Achievement.PROT_5);

        meals.create(id, refeicao("2026-11-20", "0.1"));

        assertThat(desbloqueadas(id)).containsExactly(Achievement.PROT_5);
    }

    @Test
    void proteinaSomaAsRefeicoesDoDiaEUsaAMetaPadraoSemMetaDefinida() {
        UUID id = novoUsuario();
        for (int dia = 16; dia <= 20; dia++) {
            meals.create(id, refeicao("2026-11-" + dia, "70"));
            meals.create(id, refeicao("2026-11-" + dia, "70"));
        }

        assertThat(desbloqueadas(id)).containsExactly(Achievement.PROT_5);
    }

    @Test
    void metaDeProteinaZeradaNaoDesbloqueia() {
        UUID id = novoUsuario();
        meals.updateGoals(id, new Goals(2000, 0));
        for (int dia = 16; dia <= 20; dia++) {
            meals.create(id, refeicao("2026-11-" + dia, "0"));
        }

        assertThat(desbloqueadas(id)).doesNotContain(Achievement.PROT_5);
    }

    @Test
    void apagarOTreinoNaoTiraAConquista() {
        UUID id = novoUsuario();
        Response salvo = treino(id, "2026-11-16");

        workouts.delete(id, salvo.id());
        achievements.evaluate(id);

        assertThat(desbloqueadas(id)).containsExactly(Achievement.FIRST);
    }

    @Test
    void conquistaDeUmUsuarioNaoApareceParaOutro() {
        UUID ana = novoUsuario();
        UUID bia = novoUsuario();

        treino(ana, "2026-11-16");

        assertThat(desbloqueadas(ana)).containsExactly(Achievement.FIRST);
        assertThat(desbloqueadas(bia)).isEmpty();
    }

    private static MealRequest refeicao(String dia, String proteina) {
        return new MealRequest(LocalDate.parse(dia), "Refeição", 500,
                new BigDecimal(proteina), BigDecimal.ZERO, BigDecimal.ZERO);
    }
}
