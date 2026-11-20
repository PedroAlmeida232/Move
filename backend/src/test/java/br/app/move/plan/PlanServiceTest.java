package br.app.move.plan;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.app.move.TesteDeIntegracao;
import br.app.move.plan.PlanData.DayData;
import br.app.move.plan.PlanData.ExerciseData;
import br.app.move.plan.PlanData.ProfileData;
import br.app.move.plan.PlanData.Request;
import br.app.move.plan.PlanData.Response;
import br.app.move.user.UserService;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@TesteDeIntegracao
class PlanServiceTest {

    private static final ProfileData SEM_PERFIL = new ProfileData(null, null);

    @Autowired
    private PlanService service;

    @Autowired
    private UserService users;

    private UUID novoUsuario() {
        return users.findOrCreate("uid-" + UUID.randomUUID(), null).getId();
    }

    private static ExerciseData ex(String name) {
        return new ExerciseData(name, 3, "10", null, null);
    }

    @Test
    void primeiroAcessoCriaOPlanoInicialDoPrototipo() {
        Response plano = service.get(novoUsuario());

        assertThat(plano.days()).extracting(DayData::weekday).containsExactly(0, 1, 2, 3, 4, 5, 6);
        assertThat(plano.trainingDays()).containsExactly(1, 2, 3, 4, 5, 6);
        assertThat(plano.days().get(0).exercises()).isEmpty();
        DayData segunda = plano.days().get(1);
        assertThat(segunda.name()).isEqualTo("Peito, tríceps e abdômen");
        assertThat(segunda.exercises().get(0)).isEqualTo(new ExerciseData("Supino com halteres", 3, "10", null, null));
        assertThat(segunda.exercises()).extracting(ExerciseData::name)
                .contains("Crucifixo na polia (unilateral)", "Prancha frontal", "Dead bug");
        assertThat(plano.days().get(2).exercises()).extracting(ExerciseData::name)
                .contains("Serrote (remada unilateral)", "Hiperextensão lombar");
    }

    @Test
    void segundoAcessoNaoRecriaOPlano() {
        UUID id = novoUsuario();

        assertThat(service.get(id)).isEqualTo(service.get(id));
    }

    @Test
    void criaEditaERemoveExerciciosDoDia() {
        UUID id = novoUsuario();
        service.replace(id, new Request(SEM_PERFIL,
                List.of(new DayData(1, "Peito", List.of(ex("Supino"), ex("Flexão"))))));

        Response depois = service.replace(id, new Request(SEM_PERFIL, List.of(new DayData(1, "Peito", List.of(
                new ExerciseData("Supino", 4, "8", "esquerdo primeiro", "mais carga"),
                ex("Crucifixo"))))));

        assertThat(depois.days()).singleElement().satisfies(dia -> assertThat(dia.exercises()).containsExactly(
                new ExerciseData("Supino", 4, "8", "esquerdo primeiro", "mais carga"),
                ex("Crucifixo")));
        assertThat(depois.trainingDays()).containsExactly(1);
        assertThat(service.get(id)).isEqualTo(depois);
    }

    @Test
    void planoSemDiasContinuaVazioNoProximoAcesso() {
        UUID id = novoUsuario();
        service.get(id);

        service.replace(id, new Request(SEM_PERFIL, List.of()));

        Response plano = service.get(id);
        assertThat(plano.days()).isEmpty();
        assertThat(plano.trainingDays()).isEmpty();
    }

    @Test
    void salvaEEditaOPerfil() {
        UUID id = novoUsuario();
        service.replace(id, new Request(new ProfileData("Ana", "Ganhar força"), List.of()));

        service.replace(id, new Request(new ProfileData("Ana", "Postura"), List.of()));

        assertThat(service.get(id).profile()).isEqualTo(new ProfileData("Ana", "Postura"));
    }

    @Test
    void diaRepetidoNaMesmaRequisicaoERecusado() {
        UUID id = novoUsuario();
        Request repetido = new Request(SEM_PERFIL,
                List.of(new DayData(1, "A", List.of()), new DayData(1, "B", List.of())));

        assertThatThrownBy(() -> service.replace(id, repetido))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
    }
}
