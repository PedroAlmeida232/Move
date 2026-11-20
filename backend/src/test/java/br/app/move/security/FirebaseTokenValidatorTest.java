package br.app.move.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;

class FirebaseTokenValidatorTest {

    private static final String PROJETO = "move-teste";

    private final OAuth2TokenValidator<Jwt> validador = SecurityConfig.validador(PROJETO);

    private Jwt jwt(String issuer, List<String> audience) {
        return Jwt.withTokenValue("t")
                .header("alg", "RS256")
                .issuer(issuer)
                .audience(audience)
                .subject("uid-1")
                .issuedAt(Instant.now().minusSeconds(60))
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();
    }

    @Test
    void aceitaIssuerEAudienceDoProjeto() {
        Jwt token = jwt("https://securetoken.google.com/" + PROJETO, List.of(PROJETO));

        assertThat(validador.validate(token).hasErrors()).isFalse();
    }

    @Test
    void rejeitaIssuerDeOutroProjeto() {
        Jwt token = jwt("https://securetoken.google.com/outro", List.of(PROJETO));

        assertThat(validador.validate(token).hasErrors()).isTrue();
    }

    @Test
    void rejeitaAudienceDeOutroProjeto() {
        Jwt token = jwt("https://securetoken.google.com/" + PROJETO, List.of("outro"));

        assertThat(validador.validate(token).hasErrors()).isTrue();
    }

    @Test
    void rejeitaTokenExpirado() {
        Jwt token = Jwt.withTokenValue("t")
                .header("alg", "RS256")
                .issuer("https://securetoken.google.com/" + PROJETO)
                .audience(List.of(PROJETO))
                .issuedAt(Instant.now().minusSeconds(7200))
                .expiresAt(Instant.now().minusSeconds(3600))
                .build();

        assertThat(validador.validate(token).hasErrors()).isTrue();
    }
}
