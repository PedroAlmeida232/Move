package br.app.move.weight;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.app.move.TesteDeIntegracao;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@TesteDeIntegracao
class WeightControllerTest {

    private static final String PERIODO = "?from=2026-11-01&to=2026-11-30";

    @Autowired
    private MockMvc mockMvc;

    private static RequestPostProcessor usuario(String uid) {
        return jwt().jwt(j -> j.subject(uid));
    }

    private static String novoUid() {
        return "uid-" + UUID.randomUUID();
    }

    private static MockHttpServletRequestBuilder putPeso(String data, String corpo) {
        return put("/api/v1/weight/" + data).contentType(MediaType.APPLICATION_JSON).content(corpo);
    }

    @Test
    void semTokenRetorna401() throws Exception {
        mockMvc.perform(get("/api/v1/weight" + PERIODO)).andExpect(status().isUnauthorized());
        mockMvc.perform(putPeso("2026-11-20", "{\"weightKg\":80}")).andExpect(status().isUnauthorized());
    }

    @Test
    void putSalvaEGetDevolveNoIntervalo() throws Exception {
        String uid = novoUid();

        mockMvc.perform(putPeso("2026-11-20", "{\"weightKg\":82.5,\"waistCm\":90}").with(usuario(uid)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.date").value("2026-11-20"))
                .andExpect(jsonPath("$.weightKg").value(82.5))
                .andExpect(jsonPath("$.waistCm").value(90.0));
        mockMvc.perform(putPeso("2026-11-18", "{\"weightKg\":83}").with(usuario(uid)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/weight" + PERIODO).with(usuario(uid)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].date").value("2026-11-18"))
                .andExpect(jsonPath("$[1].date").value("2026-11-20"))
                .andExpect(jsonPath("$[1].weightKg").value(82.5));
    }

    @Test
    void segundoPutDoMesmoDiaAtualiza() throws Exception {
        String uid = novoUid();
        mockMvc.perform(putPeso("2026-11-20", "{\"weightKg\":82.5}").with(usuario(uid))).andExpect(status().isOk());

        mockMvc.perform(putPeso("2026-11-20", "{\"weightKg\":81.0}").with(usuario(uid))).andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/weight" + PERIODO).with(usuario(uid)))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].weightKg").value(81.0));
    }

    @Test
    void cadaUsuarioSoVeEAtualizaOsProprios() throws Exception {
        String ana = novoUid();
        String bia = novoUid();
        mockMvc.perform(putPeso("2026-11-20", "{\"weightKg\":82.5}").with(usuario(ana))).andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/weight" + PERIODO).with(usuario(bia)))
                .andExpect(jsonPath("$", hasSize(0)));
        mockMvc.perform(putPeso("2026-11-20", "{\"weightKg\":60}").with(usuario(bia))).andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/weight" + PERIODO).with(usuario(ana)))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].weightKg").value(82.5));
    }

    @Test
    void requisicaoInvalidaRetorna400() throws Exception {
        String uid = novoUid();

        mockMvc.perform(putPeso("2026-11-20", "{\"weightKg\":19}").with(usuario(uid))).andExpect(status().isBadRequest());
        mockMvc.perform(putPeso("2026-11-20", "{\"weightKg\":401}").with(usuario(uid))).andExpect(status().isBadRequest());
        mockMvc.perform(putPeso("2026-11-20", "{\"weightKg\":80,\"waistCm\":10}").with(usuario(uid)))
                .andExpect(status().isBadRequest());
        mockMvc.perform(putPeso("2026-11-20", "{}").with(usuario(uid))).andExpect(status().isBadRequest());
        mockMvc.perform(putPeso("ontem", "{\"weightKg\":80}").with(usuario(uid))).andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/v1/weight").with(usuario(uid))).andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/v1/weight?from=2026-11-30&to=2026-11-01").with(usuario(uid)))
                .andExpect(status().isBadRequest());
    }
}
