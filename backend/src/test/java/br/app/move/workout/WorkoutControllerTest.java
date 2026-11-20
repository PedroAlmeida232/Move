package br.app.move.workout;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.app.move.TesteDeIntegracao;
import com.jayway.jsonpath.JsonPath;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@TesteDeIntegracao
class WorkoutControllerTest {

    private static final String SESSAO = """
            {"performedAt":"2026-11-16T10:00:00Z","name":"Peito","sets":[
              {"exercise":"Supino com halteres","weightKg":20.5,"reps":10},
              {"exercise":"Flexão de braço","weightKg":0,"reps":12}]}
            """;

    private static final String SEMANA = "?from=2026-11-16T00:00:00Z&to=2026-11-23T00:00:00Z";

    @Autowired
    private MockMvc mockMvc;

    private static RequestPostProcessor usuario(String uid) {
        return jwt().jwt(j -> j.subject(uid));
    }

    private static String novoUid() {
        return "uid-" + UUID.randomUUID();
    }

    private static MockHttpServletRequestBuilder postJson(String corpo) {
        return post("/api/v1/workouts").contentType(MediaType.APPLICATION_JSON).content(corpo);
    }

    private String criar(String uid) throws Exception {
        String corpo = mockMvc.perform(postJson(SESSAO).with(usuario(uid)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(corpo, "$.id");
    }

    @Test
    void semTokenRetorna401() throws Exception {
        mockMvc.perform(get("/api/v1/workouts" + SEMANA)).andExpect(status().isUnauthorized());
        mockMvc.perform(postJson(SESSAO)).andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/api/v1/workouts/" + UUID.randomUUID())).andExpect(status().isUnauthorized());
    }

    @Test
    void postCriaEGetDevolveASessaoNoIntervalo() throws Exception {
        String uid = novoUid();
        String id = criar(uid);

        mockMvc.perform(get("/api/v1/workouts" + SEMANA).with(usuario(uid)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(id))
                .andExpect(jsonPath("$[0].performedAt").value("2026-11-16T10:00:00Z"))
                .andExpect(jsonPath("$[0].sets", hasSize(2)))
                .andExpect(jsonPath("$[0].sets[0].exercise").value("Supino com halteres"))
                .andExpect(jsonPath("$[0].sets[0].weightKg").value(20.5))
                .andExpect(jsonPath("$[0].sets[0].reps").value(10));
    }

    @Test
    void deleteRemoveASessao() throws Exception {
        String uid = novoUid();
        String id = criar(uid);

        mockMvc.perform(delete("/api/v1/workouts/" + id).with(usuario(uid))).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/workouts" + SEMANA).with(usuario(uid)))
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void cadaUsuarioSoVeEApagaAsProprias() throws Exception {
        String ana = novoUid();
        String bia = novoUid();
        String daAna = criar(ana);

        mockMvc.perform(get("/api/v1/workouts" + SEMANA).with(usuario(bia)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
        mockMvc.perform(delete("/api/v1/workouts/" + daAna).with(usuario(bia)))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/workouts" + SEMANA).with(usuario(ana)))
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void postInvalidoRetorna400() throws Exception {
        String uid = novoUid();
        String[] invalidos = {
            "{\"performedAt\":\"2026-11-16T10:00:00Z\",\"sets\":[{\"exercise\":\"Supino\",\"weightKg\":-1,\"reps\":10}]}",
            "{\"performedAt\":\"2026-11-16T10:00:00Z\",\"sets\":[{\"exercise\":\"Supino\",\"weightKg\":20,\"reps\":-1}]}",
            "{\"performedAt\":\"2026-11-16T10:00:00Z\",\"sets\":[{\"exercise\":\"\",\"weightKg\":20,\"reps\":10}]}",
            "{\"performedAt\":\"2026-11-16T10:00:00Z\",\"sets\":[]}",
            "{\"sets\":[{\"exercise\":\"Supino\",\"weightKg\":20,\"reps\":10}]}"
        };
        for (String corpo : invalidos) {
            mockMvc.perform(postJson(corpo).with(usuario(uid))).andExpect(status().isBadRequest());
        }
    }

    @Test
    void getComIntervaloAusenteOuInvalidoRetorna400() throws Exception {
        String uid = novoUid();

        mockMvc.perform(get("/api/v1/workouts").with(usuario(uid))).andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/v1/workouts?from=2026-11-23T00:00:00Z&to=2026-11-16T00:00:00Z")
                        .with(usuario(uid)))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/v1/workouts?from=ontem&to=hoje").with(usuario(uid)))
                .andExpect(status().isBadRequest());
    }
}
