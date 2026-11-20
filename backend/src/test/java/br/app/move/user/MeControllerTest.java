package br.app.move.user;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.app.move.security.SecurityConfig;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(MeController.class)
@Import(SecurityConfig.class)
class MeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void devolveIdEEmailDoUsuarioDoToken() throws Exception {
        UUID id = UUID.randomUUID();
        User user = new User("uid-1", "a@move.app");
        ReflectionTestUtils.setField(user, "id", id);
        when(userService.findOrCreate("uid-1", "a@move.app")).thenReturn(user);

        mockMvc.perform(get("/api/v1/me")
                        .with(jwt().jwt(j -> j.subject("uid-1").claim("email", "a@move.app"))))
                .andExpect(status().isOk())
                .andExpect(content().json(
                        "{\"id\":\"" + id + "\",\"email\":\"a@move.app\"}", true));
    }

    @Test
    void usuarioVemSempreDoTokenNuncaDoCliente() throws Exception {
        User user = new User("uid-1", "a@move.app");
        ReflectionTestUtils.setField(user, "id", UUID.randomUUID());
        when(userService.findOrCreate("uid-1", "a@move.app")).thenReturn(user);

        mockMvc.perform(get("/api/v1/me")
                        .param("id", UUID.randomUUID().toString())
                        .param("uid", "uid-de-outra-pessoa")
                        .header("X-User-Id", "uid-de-outra-pessoa")
                        .with(jwt().jwt(j -> j.subject("uid-1").claim("email", "a@move.app"))))
                .andExpect(status().isOk());

        verify(userService).findOrCreate("uid-1", "a@move.app");
    }

    @Test
    void semTokenRetorna401() throws Exception {
        mockMvc.perform(get("/api/v1/me")).andExpect(status().isUnauthorized());
    }
}
