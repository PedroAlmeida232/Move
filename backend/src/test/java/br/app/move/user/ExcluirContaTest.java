package br.app.move.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.app.move.TesteDeIntegracao;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@TesteDeIntegracao
class ExcluirContaTest {

    private static final String TREINO = """
            {"performedAt":"2026-11-16T10:00:00Z","name":"Peito","sets":[
              {"exercise":"Supino","weightKg":20,"reps":10}]}
            """;
    private static final String REFEICAO = """
            {"date":"2026-11-20","name":"Café","kcal":400,"proteinG":25.5,"carbsG":40,"fatG":12}
            """;
    private static final String PLANO = """
            {"profile":{"name":"Ana","goal":"Postura"},
             "days":[{"weekday":2,"name":"Plano","exercises":[
               {"name":"Remada","sets":3,"reps":"10","side":null,"note":null}]}]}
            """;
    private static final String[] TABELAS_DO_USUARIO = {
        "workout_sessions", "meals", "diet_goals", "profiles", "plan_days",
        "weight_entries", "achievements_unlocked"};

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    @MockitoBean
    private FirebaseAccountRemover firebase;

    private static RequestPostProcessor usuario(String uid) {
        return jwt().jwt(j -> j.subject(uid));
    }

    private static String novoUid() {
        return "uid-" + UUID.randomUUID();
    }

    private void json(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder req,
            String uid, String corpo) throws Exception {
        mockMvc.perform(req.with(usuario(uid)).contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().is2xxSuccessful());
    }

    /** Cria dados em todas as tabelas do usuário e devolve o id dele. */
    private UUID comDados(String uid) throws Exception {
        json(post("/api/v1/workouts"), uid, TREINO);
        json(post("/api/v1/meals"), uid, REFEICAO);
        json(put("/api/v1/meals/goals"), uid, "{\"kcal\":2200,\"proteinG\":150}");
        json(put("/api/v1/plan"), uid, PLANO);
        json(put("/api/v1/weight/2026-11-20"), uid, "{\"kg\":80.4,\"waistCm\":null}");
        return jdbc.queryForObject("select id from users where firebase_uid = ?", UUID.class, uid);
    }

    private int linhas(UUID userId) {
        int total = 0;
        for (String tabela : TABELAS_DO_USUARIO) {
            total += jdbc.queryForObject(
                    "select count(*) from " + tabela + " where user_id = ?", Integer.class, userId);
        }
        return total;
    }

    @Test
    void semTokenRetorna401() throws Exception {
        mockMvc.perform(delete("/api/v1/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void apagaOUsuarioETodosOsDadosEResponde204SemCorpo() throws Exception {
        String uid = novoUid();
        UUID id = comDados(uid);
        assertThat(linhas(id)).isGreaterThanOrEqualTo(6);

        mockMvc.perform(delete("/api/v1/me").with(usuario(uid)))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));

        verify(firebase).remove(uid);
        assertThat(linhas(id)).isZero();
        assertThat(jdbc.queryForObject(
                "select count(*) from users where id = ?", Integer.class, id)).isZero();
    }

    @Test
    void naoMexeNosDadosDeOutroUsuario() throws Exception {
        String ana = novoUid();
        String bia = novoUid();
        comDados(ana);
        UUID idBia = comDados(bia);
        int antes = linhas(idBia);

        mockMvc.perform(delete("/api/v1/me").with(usuario(ana))).andExpect(status().isNoContent());

        assertThat(linhas(idBia)).isEqualTo(antes);
        mockMvc.perform(get("/api/v1/workouts").with(usuario(bia)))
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void quemNaoTemLinhaNoBancoTambemRecebe204ENaoCriaUsuario() throws Exception {
        String uid = novoUid();

        mockMvc.perform(delete("/api/v1/me").with(usuario(uid))).andExpect(status().isNoContent());

        verify(firebase).remove(uid);
        assertThat(jdbc.queryForObject(
                "select count(*) from users where firebase_uid = ?", Integer.class, uid)).isZero();
    }

    @Test
    void seOFirebaseFalharNaoApagaNadoERetorna502() throws Exception {
        String uid = novoUid();
        UUID id = comDados(uid);
        int antes = linhas(id);
        doThrow(new FirebaseFalhouException("falhou", null)).when(firebase).remove(uid);

        mockMvc.perform(delete("/api/v1/me").with(usuario(uid))).andExpect(status().isBadGateway());

        assertThat(linhas(id)).isEqualTo(antes);
        assertThat(jdbc.queryForObject(
                "select count(*) from users where id = ?", Integer.class, id)).isEqualTo(1);
    }

    @Test
    void semChaveDoFirebaseConfiguradaRetorna503ENaoApagaNada() throws Exception {
        String uid = novoUid();
        UUID id = comDados(uid);
        int antes = linhas(id);
        doThrow(new FirebaseNaoConfiguradoException()).when(firebase).remove(uid);

        mockMvc.perform(delete("/api/v1/me").with(usuario(uid)))
                .andExpect(status().isServiceUnavailable());

        assertThat(linhas(id)).isEqualTo(antes);
    }

    @Test
    void usuarioVemSempreDoTokenNuncaDoCliente() throws Exception {
        String ana = novoUid();
        String bia = novoUid();
        comDados(ana);
        UUID idBia = comDados(bia);
        int antes = linhas(idBia);

        mockMvc.perform(delete("/api/v1/me")
                        .param("uid", bia).param("id", idBia.toString()).header("X-User-Id", bia)
                        .with(usuario(ana)))
                .andExpect(status().isNoContent());

        verify(firebase, never()).remove(bia);
        assertThat(linhas(idBia)).isEqualTo(antes);
    }
}
