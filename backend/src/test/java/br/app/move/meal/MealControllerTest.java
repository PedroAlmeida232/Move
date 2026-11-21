package br.app.move.meal;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
class MealControllerTest {

    private static final String CAFE = """
            {"date":"2026-11-20","name":"Café","kcal":400,"proteinG":25.5,"carbsG":40,"fatG":12}
            """;

    @Autowired
    private MockMvc mockMvc;

    private static RequestPostProcessor usuario(String uid) {
        return jwt().jwt(j -> j.subject(uid));
    }

    private static String novoUid() {
        return "uid-" + UUID.randomUUID();
    }

    private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder req, String corpo) {
        return req.contentType(MediaType.APPLICATION_JSON).content(corpo);
    }

    private String criar(String uid) throws Exception {
        String corpo = mockMvc.perform(json(post("/api/v1/meals"), CAFE).with(usuario(uid)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(corpo, "$.id");
    }

    @Test
    void semTokenRetorna401() throws Exception {
        mockMvc.perform(get("/api/v1/meals?date=2026-11-20")).andExpect(status().isUnauthorized());
        mockMvc.perform(json(post("/api/v1/meals"), CAFE)).andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/api/v1/meals/" + UUID.randomUUID())).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/meals/goals")).andExpect(status().isUnauthorized());
        mockMvc.perform(json(put("/api/v1/meals/goals"), "{\"kcal\":2000,\"proteinG\":140}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void postCriaEGetDevolveODiaComTotaisEMeta() throws Exception {
        String uid = novoUid();
        String id = criar(uid);

        mockMvc.perform(get("/api/v1/meals?date=2026-11-20").with(usuario(uid)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.date").value("2026-11-20"))
                .andExpect(jsonPath("$.meals", hasSize(1)))
                .andExpect(jsonPath("$.meals[0].id").value(id))
                .andExpect(jsonPath("$.meals[0].name").value("Café"))
                .andExpect(jsonPath("$.totals.kcal").value(400))
                .andExpect(jsonPath("$.totals.proteinG").value(25.5))
                .andExpect(jsonPath("$.goals.kcal").value(2000))
                .andExpect(jsonPath("$.goals.proteinG").value(140))
                .andExpect(jsonPath("$.remaining.kcal").value(1600))
                .andExpect(jsonPath("$.remaining.proteinG").value(114.5));

        mockMvc.perform(get("/api/v1/meals?date=2026-11-21").with(usuario(uid)))
                .andExpect(jsonPath("$.meals", hasSize(0)));
    }

    @Test
    void deleteRemoveARefeicao() throws Exception {
        String uid = novoUid();
        String id = criar(uid);

        mockMvc.perform(delete("/api/v1/meals/" + id).with(usuario(uid))).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/meals?date=2026-11-20").with(usuario(uid)))
                .andExpect(jsonPath("$.meals", hasSize(0)));
    }

    @Test
    void putGoalsAlteraAMetaUsadaNoDia() throws Exception {
        String uid = novoUid();
        criar(uid);

        mockMvc.perform(json(put("/api/v1/meals/goals"), "{\"kcal\":2500,\"proteinG\":160}").with(usuario(uid)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.kcal").value(2500));

        mockMvc.perform(get("/api/v1/meals/goals").with(usuario(uid)))
                .andExpect(jsonPath("$.kcal").value(2500))
                .andExpect(jsonPath("$.proteinG").value(160));
        mockMvc.perform(get("/api/v1/meals?date=2026-11-20").with(usuario(uid)))
                .andExpect(jsonPath("$.remaining.kcal").value(2100));
    }

    @Test
    void cadaUsuarioSoVeEApagaAsProprias() throws Exception {
        String ana = novoUid();
        String bia = novoUid();
        String daAna = criar(ana);
        mockMvc.perform(json(put("/api/v1/meals/goals"), "{\"kcal\":3000,\"proteinG\":200}").with(usuario(ana)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/meals?date=2026-11-20").with(usuario(bia)))
                .andExpect(jsonPath("$.meals", hasSize(0)))
                .andExpect(jsonPath("$.goals.kcal").value(2000));
        mockMvc.perform(delete("/api/v1/meals/" + daAna).with(usuario(bia))).andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/meals?date=2026-11-20").with(usuario(ana)))
                .andExpect(jsonPath("$.meals", hasSize(1)))
                .andExpect(jsonPath("$.goals.kcal").value(3000));
    }

    @Test
    void requisicaoInvalidaRetorna400() throws Exception {
        String uid = novoUid();
        String[] refeicoesInvalidas = {
            "{\"date\":\"2026-11-20\",\"name\":\"Café\",\"kcal\":-1,\"proteinG\":25,\"carbsG\":40,\"fatG\":12}",
            "{\"date\":\"2026-11-20\",\"name\":\"Café\",\"kcal\":400,\"proteinG\":-1,\"carbsG\":40,\"fatG\":12}",
            "{\"date\":\"2026-11-20\",\"name\":\"\",\"kcal\":400,\"proteinG\":25,\"carbsG\":40,\"fatG\":12}",
            "{\"name\":\"Café\",\"kcal\":400,\"proteinG\":25,\"carbsG\":40,\"fatG\":12}"
        };
        for (String corpo : refeicoesInvalidas) {
            mockMvc.perform(json(post("/api/v1/meals"), corpo).with(usuario(uid)))
                    .andExpect(status().isBadRequest());
        }
        mockMvc.perform(get("/api/v1/meals").with(usuario(uid))).andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/v1/meals?date=ontem").with(usuario(uid))).andExpect(status().isBadRequest());
        mockMvc.perform(json(put("/api/v1/meals/goals"), "{\"kcal\":0,\"proteinG\":140}").with(usuario(uid)))
                .andExpect(status().isBadRequest());
    }
}
