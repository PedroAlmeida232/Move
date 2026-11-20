package br.app.move.workout;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.app.move.TesteDeIntegracao;
import br.app.move.user.UserService;
import br.app.move.workout.WorkoutData.Request;
import br.app.move.workout.WorkoutData.Response;
import br.app.move.workout.WorkoutData.SetData;
import jakarta.validation.ConstraintViolationException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@TesteDeIntegracao
class WorkoutServiceTest {

    private static final Instant SEG = Instant.parse("2026-11-16T10:00:00Z");
    private static final Instant TER = Instant.parse("2026-11-17T10:00:00Z");
    private static final Instant QUA = Instant.parse("2026-11-18T10:00:00Z");

    @Autowired
    private WorkoutService service;

    @Autowired
    private UserService users;

    private UUID novoUsuario() {
        return users.findOrCreate("uid-" + UUID.randomUUID(), null).getId();
    }

    private static SetData serie(String exercicio, String kg, int reps) {
        return new SetData(exercicio, new BigDecimal(kg), reps);
    }

    private static Request sessao(Instant quando, SetData... series) {
        return new Request(quando, "Peito", List.of(series));
    }

    private static void assertMesmasSeries(List<SetData> atual, SetData... esperadas) {
        assertThat(atual).usingRecursiveFieldByFieldElementComparator(
                        org.assertj.core.api.recursive.comparison.RecursiveComparisonConfiguration.builder()
                                .withComparatorForType(BigDecimal::compareTo, BigDecimal.class).build())
                .containsExactly(esperadas);
    }

    @Test
    void salvaSessaoComSeriesNaOrdem() {
        UUID id = novoUsuario();

        Response salva = service.create(id, sessao(SEG,
                serie("Supino com halteres", "20.5", 10),
                serie("Supino com halteres", "22", 8),
                serie("Flexão de braço", "0", 12)));

        assertThat(salva.id()).isNotNull();
        assertThat(salva.performedAt()).isEqualTo(SEG);
        assertThat(salva.name()).isEqualTo("Peito");
        List<Response> lista = service.list(id, SEG, TER);
        assertThat(lista).extracting(Response::id).containsExactly(salva.id());
        assertMesmasSeries(lista.get(0).sets(),
                serie("Supino com halteres", "20.5", 10),
                serie("Supino com halteres", "22", 8),
                serie("Flexão de braço", "0", 12));
    }

    @Test
    void rejeitaCargaNegativa() {
        UUID id = novoUsuario();

        assertThatThrownBy(() -> service.create(id, sessao(SEG, serie("Supino", "-1", 10))))
                .isInstanceOf(ConstraintViolationException.class);
        assertThat(service.list(id, SEG, TER)).isEmpty();
    }

    @Test
    void rejeitaRepeticoesNegativas() {
        UUID id = novoUsuario();

        assertThatThrownBy(() -> service.create(id, sessao(SEG, serie("Supino", "20", -1))))
                .isInstanceOf(ConstraintViolationException.class);
        assertThat(service.list(id, SEG, TER)).isEmpty();
    }

    @Test
    void listaSoOIntervaloPedidoEmOrdemDeData() {
        UUID id = novoUsuario();
        Response ter = service.create(id, sessao(TER, serie("Serrote", "18", 10)));
        Response seg = service.create(id, sessao(SEG, serie("Supino", "20", 10)));
        service.create(id, sessao(QUA, serie("Cardio", "0", 1)));

        assertThat(service.list(id, SEG, QUA)).extracting(Response::id).containsExactly(seg.id(), ter.id());
    }

    @Test
    void removeASessao() {
        UUID id = novoUsuario();
        Response salva = service.create(id, sessao(SEG, serie("Supino", "20", 10)));

        service.delete(id, salva.id());

        assertThat(service.list(id, SEG, TER)).isEmpty();
    }

    @Test
    void naoRemoveSessaoDeOutroUsuario() {
        UUID dono = novoUsuario();
        UUID outro = novoUsuario();
        Response salva = service.create(dono, sessao(SEG, serie("Supino", "20", 10)));

        assertThatThrownBy(() -> service.delete(outro, salva.id()))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
        assertThat(service.list(dono, SEG, TER)).hasSize(1);
    }

    @Test
    void naoListaSessoesDeOutroUsuario() {
        UUID dono = novoUsuario();
        service.create(dono, sessao(SEG, serie("Supino", "20", 10)));

        assertThat(service.list(novoUsuario(), SEG, TER)).isEmpty();
    }

    @Test
    void intervaloInvalidoERecusado() {
        UUID id = novoUsuario();

        for (Instant[] intervalo : new Instant[][] {
            {TER, SEG},
            {SEG, SEG},
            {SEG, SEG.plusSeconds(367L * 24 * 3600)}
        }) {
            assertThatThrownBy(() -> service.list(id, intervalo[0], intervalo[1]))
                    .isInstanceOfSatisfying(ResponseStatusException.class,
                            e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
        }
    }
}
