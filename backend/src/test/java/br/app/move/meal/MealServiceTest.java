package br.app.move.meal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.app.move.TesteDeIntegracao;
import br.app.move.meal.MealData.DayResponse;
import br.app.move.meal.MealData.Goals;
import br.app.move.meal.MealData.MealRequest;
import br.app.move.meal.MealData.MealView;
import br.app.move.user.UserService;
import jakarta.validation.ConstraintViolationException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@TesteDeIntegracao
class MealServiceTest {

    private static final LocalDate HOJE = LocalDate.of(2026, 11, 20);

    @Autowired
    private MealService service;

    @Autowired
    private UserService users;

    private UUID novoUsuario() {
        return users.findOrCreate("uid-" + UUID.randomUUID(), null).getId();
    }

    private static MealRequest refeicao(LocalDate dia, String nome, int kcal, String prot) {
        return new MealRequest(dia, nome, kcal, new BigDecimal(prot), new BigDecimal("10"), new BigDecimal("5"));
    }

    @Test
    void totalDoDiaSomaAsRefeicoesDaqueleDia() {
        UUID id = novoUsuario();
        service.create(id, refeicao(HOJE, "Café", 400, "25"));
        service.create(id, refeicao(HOJE, "Almoço", 800, "50.5"));
        service.create(id, refeicao(HOJE.plusDays(1), "Amanhã", 999, "99"));

        DayResponse dia = service.day(id, HOJE);

        assertThat(dia.date()).isEqualTo(HOJE);
        assertThat(dia.meals()).extracting(MealView::name).containsExactly("Café", "Almoço");
        assertThat(dia.totals().kcal()).isEqualTo(1200);
        assertThat(dia.totals().proteinG()).isEqualByComparingTo("75.5");
        assertThat(dia.totals().carbsG()).isEqualByComparingTo("20");
        assertThat(dia.totals().fatG()).isEqualByComparingTo("10");
    }

    @Test
    void semMetaDefinidaUsaAMetaPadraoDoPrototipo() {
        UUID id = novoUsuario();
        service.create(id, refeicao(HOJE, "Almoço", 800, "50"));

        DayResponse dia = service.day(id, HOJE);

        assertThat(service.goals(id)).isEqualTo(new Goals(2000, 140));
        assertThat(dia.goals()).isEqualTo(new Goals(2000, 140));
        assertThat(dia.remaining().kcal()).isEqualTo(1200);
        assertThat(dia.remaining().proteinG()).isEqualByComparingTo("90");
    }

    @Test
    void restanteUsaAMetaDoUsuario() {
        UUID id = novoUsuario();
        service.updateGoals(id, new Goals(2500, 160));
        service.updateGoals(id, new Goals(2200, 150));
        service.create(id, refeicao(HOJE, "Almoço", 800, "50"));

        DayResponse dia = service.day(id, HOJE);

        assertThat(service.goals(id)).isEqualTo(new Goals(2200, 150));
        assertThat(dia.remaining().kcal()).isEqualTo(1400);
        assertThat(dia.remaining().proteinG()).isEqualByComparingTo("100");
    }

    @Test
    void removeARefeicao() {
        UUID id = novoUsuario();
        MealView salva = service.create(id, refeicao(HOJE, "Café", 400, "25"));

        service.delete(id, salva.id());

        assertThat(service.day(id, HOJE).meals()).isEmpty();
    }

    @Test
    void naoVeNemRemoveRefeicaoDeOutroUsuario() {
        UUID dono = novoUsuario();
        UUID outro = novoUsuario();
        MealView salva = service.create(dono, refeicao(HOJE, "Café", 400, "25"));
        service.updateGoals(dono, new Goals(3000, 200));

        assertThat(service.day(outro, HOJE).meals()).isEmpty();
        assertThat(service.goals(outro)).isEqualTo(new Goals(2000, 140));
        assertThatThrownBy(() -> service.delete(outro, salva.id()))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
        assertThat(service.day(dono, HOJE).meals()).hasSize(1);
    }

    @Test
    void rejeitaValoresNegativos() {
        UUID id = novoUsuario();

        assertThatThrownBy(() -> service.create(id, refeicao(HOJE, "Café", -1, "25")))
                .isInstanceOf(ConstraintViolationException.class);
        assertThatThrownBy(() -> service.create(id, refeicao(HOJE, "Café", 400, "-1")))
                .isInstanceOf(ConstraintViolationException.class);
        assertThatThrownBy(() -> service.updateGoals(id, new Goals(0, 140)))
                .isInstanceOf(ConstraintViolationException.class);
        assertThat(service.day(id, HOJE).meals()).isEmpty();
    }
}
