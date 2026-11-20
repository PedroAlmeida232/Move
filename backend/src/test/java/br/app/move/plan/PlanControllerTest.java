package br.app.move.plan;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.not;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.app.move.PostgresTestConfig;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest(properties = "firebase.project-id=move-teste")
@AutoConfigureMockMvc
@Import(PostgresTestConfig.class)
class PlanControllerTest {

    private static final String PLANO_DA_ANA = """
            {"profile":{"name":"Ana","goal":"Postura"},
             "days":[{"weekday":2,"name":"Plano da Ana","exercises":[
               {"name":"Exercício secreto","sets":3,"reps":"10","side":null,"note":null}]}]}
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
        mockMvc.perform(get("/api/v1/plan")).andExpect(status().isUnauthorized());
        mockMvc.perform(put("/api/v1/plan").contentType(MediaType.APPLICATION_JSON).content(PLANO_DA_ANA))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getDevolveOPlanoInicial() throws Exception {
        mockMvc.perform(get("/api/v1/plan").with(usuario(novoUid())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.days.length()").value(7))
                .andExpect(jsonPath("$.trainingDays", contains(1, 2, 3, 4, 5, 6)))
                .andExpect(jsonPath("$.days[1].exercises[0].name").value("Supino com halteres"));
    }

    @Test
    void putSalvaEGetDevolveOSalvo() throws Exception {
        String uid = novoUid();

        mockMvc.perform(put("/api/v1/plan").with(usuario(uid))
                        .contentType(MediaType.APPLICATION_JSON).content(PLANO_DA_ANA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trainingDays", contains(2)));

        mockMvc.perform(get("/api/v1/plan").with(usuario(uid)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.name").value("Ana"))
                .andExpect(jsonPath("$.days.length()").value(1))
                .andExpect(jsonPath("$.days[0].name").value("Plano da Ana"))
                .andExpect(jsonPath("$.days[0].exercises[0].name").value("Exercício secreto"));
    }

    @Test
    void cadaUsuarioSoVeOProprioPlano() throws Exception {
        String ana = novoUid();
        String bia = novoUid();
        mockMvc.perform(put("/api/v1/plan").with(usuario(ana))
                        .contentType(MediaType.APPLICATION_JSON).content(PLANO_DA_ANA))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/plan").with(usuario(bia)))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString("Plano da Ana"))))
                .andExpect(content().string(not(containsString("Exercício secreto"))))
                .andExpect(content().string(not(containsString("Ana"))));

        mockMvc.perform(put("/api/v1/plan").with(usuario(bia)).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"profile\":{\"name\":\"Bia\",\"goal\":null},\"days\":[]}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/plan").with(usuario(ana)))
                .andExpect(jsonPath("$.profile.name").value("Ana"))
                .andExpect(jsonPath("$.days[0].name").value("Plano da Ana"));
    }

    @Test
    void putInvalidoRetorna400() throws Exception {
        String uid = novoUid();
        String[] invalidos = {
            "{\"profile\":{},\"days\":[{\"weekday\":9,\"name\":\"X\",\"exercises\":[]}]}",
            "{\"profile\":{},\"days\":[{\"weekday\":1,\"name\":\"X\",\"exercises\":"
                    + "[{\"name\":\"Supino\",\"sets\":0,\"reps\":\"10\"}]}]}",
            "{\"profile\":{},\"days\":[{\"weekday\":1,\"name\":\"\",\"exercises\":[]}]}",
            "{\"profile\":{},\"days\":[{\"weekday\":1,\"name\":\"A\",\"exercises\":[]},"
                    + "{\"weekday\":1,\"name\":\"B\",\"exercises\":[]}]}",
            "{\"days\":[]}"
        };
        for (String corpo : invalidos) {
            mockMvc.perform(put("/api/v1/plan").with(usuario(uid))
                            .contentType(MediaType.APPLICATION_JSON).content(corpo))
                    .andExpect(status().isBadRequest());
        }
    }
}
