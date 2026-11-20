package br.app.move.security;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.app.move.health.HealthController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@WebMvcTest(controllers = {SecurityConfigTest.ProtegidoController.class, HealthController.class})
@Import({SecurityConfig.class, SecurityConfigTest.ProtegidoController.class})
class SecurityConfigTest {

    @RestController
    static class ProtegidoController {
        @GetMapping("/api/v1/protegido")
        String protegido() {
            return "ok";
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void semTokenRetorna401() throws Exception {
        mockMvc.perform(get("/api/v1/protegido")).andExpect(status().isUnauthorized());
    }

    @Test
    void tokenInvalidoRetorna401() throws Exception {
        when(jwtDecoder.decode(anyString())).thenThrow(new BadJwtException("token inválido"));

        mockMvc.perform(get("/api/v1/protegido").header("Authorization", "Bearer lixo"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tokenValidoRetorna200() throws Exception {
        mockMvc.perform(get("/api/v1/protegido").with(jwt())).andExpect(status().isOk());
    }

    @Test
    void healthContinuaPublico() throws Exception {
        mockMvc.perform(get("/api/v1/health")).andExpect(status().isOk());
    }
}
