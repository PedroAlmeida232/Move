package br.app.move.achievement;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.app.move.TesteDeIntegracao;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@TesteDeIntegracao
class AchievementControllerTest {

    private static final String TREINO = """
            {"performedAt":"2026-11-16T10:00:00Z","name":"Peito","sets":[
              {"exercise":"Supino","weightKg":20,"reps":10}]}
            """;

    @Autowired
    private MockMvc mockMvc;

    private static RequestPostProcessor usuario(String uid) {
        return jwt().jwt(j -> j.subject(uid));
    }

    private static String novoUid() {
        return "uid-" + UUID.randomUUID();
    }

    @Test
    void semTokenRetorna401() throws Exception {
        mockMvc.perform(get("/api/v1/achievements")).andExpect(status().isUnauthorized());
    }

    @Test
    void devolveOCatalogoComTudoBloqueadoParaUsuarioNovo() throws Exception {
        mockMvc.perform(get("/api/v1/achievements").with(usuario(novoUid())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(8)))
                .andExpect(jsonPath("$[0].code").value("FIRST"))
                .andExpect(jsonPath("$[0].name").value("Primeiro treino"))
                .andExpect(jsonPath("$[0].description").value("Conclua um treino completo"))
                .andExpect(jsonPath("$[0].unlockedAt", nullValue()))
                .andExpect(jsonPath("$[7].code").value("W25"));
    }

    @Test
    void salvarUmTreinoDesbloqueiaPrimeiroTreino() throws Exception {
        String uid = novoUid();

        mockMvc.perform(post("/api/v1/workouts").with(usuario(uid))
                        .contentType(MediaType.APPLICATION_JSON).content(TREINO))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/achievements").with(usuario(uid)))
                .andExpect(jsonPath("$[0].code").value("FIRST"))
                .andExpect(jsonPath("$[0].unlockedAt", notNullValue()))
                .andExpect(jsonPath("$[1].unlockedAt", nullValue()));
    }

    @Test
    void cadaUsuarioSoVeAsProprias() throws Exception {
        String ana = novoUid();
        String bia = novoUid();
        mockMvc.perform(post("/api/v1/workouts").with(usuario(ana))
                        .contentType(MediaType.APPLICATION_JSON).content(TREINO))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/achievements").with(usuario(bia)))
                .andExpect(jsonPath("$[0].unlockedAt", nullValue()));
    }
}
