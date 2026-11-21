package br.app.move.weight;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.app.move.TesteDeIntegracao;
import br.app.move.user.UserService;
import br.app.move.weight.WeightData.Entry;
import br.app.move.weight.WeightData.EntryRequest;
import jakarta.validation.ConstraintViolationException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@TesteDeIntegracao
class WeightServiceTest {

    private static final LocalDate D1 = LocalDate.of(2026, 11, 18);
    private static final LocalDate D2 = LocalDate.of(2026, 11, 19);
    private static final LocalDate D3 = LocalDate.of(2026, 11, 20);

    @Autowired
    private WeightService service;

    @Autowired
    private UserService users;

    private UUID novoUsuario() {
        return users.findOrCreate("uid-" + UUID.randomUUID(), null).getId();
    }

    private static EntryRequest pesagem(String kg, String cintura) {
        return new EntryRequest(new BigDecimal(kg), cintura == null ? null : new BigDecimal(cintura));
    }

    @Test
    void salvaPesoECinturaDoDia() {
        UUID id = novoUsuario();

        Entry salvo = service.put(id, D1, pesagem("82.5", "90.0"));

        assertThat(salvo.date()).isEqualTo(D1);
        assertThat(salvo.weightKg()).isEqualByComparingTo("82.5");
        assertThat(salvo.waistCm()).isEqualByComparingTo("90.0");
    }

    @Test
    void cinturaEOpcional() {
        UUID id = novoUsuario();

        Entry salvo = service.put(id, D1, pesagem("82.5", null));

        assertThat(salvo.waistCm()).isNull();
    }

    @Test
    void segundoRegistroDoMesmoDiaAtualizaSemDuplicar() {
        UUID id = novoUsuario();
        service.put(id, D1, pesagem("82.5", "90"));

        service.put(id, D1, pesagem("81.9", null));

        List<Entry> lista = service.list(id, D1, D1);
        assertThat(lista).hasSize(1);
        assertThat(lista.get(0).weightKg()).isEqualByComparingTo("81.9");
        assertThat(lista.get(0).waistCm()).isNull();
    }

    @Test
    void rejeitaPesoForaDe20a400Kg() {
        UUID id = novoUsuario();

        for (String kg : new String[] {"19.9", "400.1", "0", "-70"}) {
            assertThatThrownBy(() -> service.put(id, D1, pesagem(kg, null)))
                    .isInstanceOf(ConstraintViolationException.class);
        }
        assertThat(service.list(id, D1, D1)).isEmpty();
    }

    @Test
    void aceitaOsLimitesDePeso() {
        UUID id = novoUsuario();

        assertThat(service.put(id, D1, pesagem("20", null)).weightKg()).isEqualByComparingTo("20");
        assertThat(service.put(id, D2, pesagem("400", null)).weightKg()).isEqualByComparingTo("400");
    }

    @Test
    void rejeitaCinturaForaDe20a300Cm() {
        UUID id = novoUsuario();

        for (String cm : new String[] {"19.9", "300.1", "-1"}) {
            assertThatThrownBy(() -> service.put(id, D1, pesagem("80", cm)))
                    .isInstanceOf(ConstraintViolationException.class);
        }
    }

    @Test
    void listaOIntervaloInclusivoEmOrdemDeData() {
        UUID id = novoUsuario();
        service.put(id, D3, pesagem("80", null));
        service.put(id, D1, pesagem("82", null));
        service.put(id, D2, pesagem("81", null));
        service.put(id, D3.plusDays(1), pesagem("79", null));

        assertThat(service.list(id, D1, D3)).extracting(Entry::date).containsExactly(D1, D2, D3);
    }

    @Test
    void cadaUsuarioSoVeEAtualizaOsProprios() {
        UUID ana = novoUsuario();
        UUID bia = novoUsuario();
        service.put(ana, D1, pesagem("82", "90"));

        assertThat(service.list(bia, D1, D3)).isEmpty();
        service.put(bia, D1, pesagem("60", null));

        List<Entry> daAna = service.list(ana, D1, D3);
        assertThat(daAna).hasSize(1);
        assertThat(daAna.get(0).weightKg()).isEqualByComparingTo("82");
        assertThat(daAna.get(0).waistCm()).isEqualByComparingTo("90");
    }

    @Test
    void intervaloInvalidoERecusado() {
        UUID id = novoUsuario();

        for (LocalDate[] intervalo : new LocalDate[][] {{D3, D1}, {D1, D1.plusDays(367)}}) {
            assertThatThrownBy(() -> service.list(id, intervalo[0], intervalo[1]))
                    .isInstanceOfSatisfying(ResponseStatusException.class,
                            e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
        }
    }
}
