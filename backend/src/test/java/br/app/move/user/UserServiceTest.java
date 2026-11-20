package br.app.move.user;

import static org.assertj.core.api.Assertions.assertThat;

import br.app.move.TesteDeIntegracao;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;

@TesteDeIntegracao
class UserServiceTest {

    @Autowired
    private UserService service;

    @Autowired
    private UserRepository repository;

    @Test
    void primeiroAcessoCriaOUsuario() {
        User user = service.findOrCreate("uid-primeiro", "a@move.app");

        assertThat(user.getId()).isNotNull();
        assertThat(user.getFirebaseUid()).isEqualTo("uid-primeiro");
        assertThat(user.getEmail()).isEqualTo("a@move.app");
        assertThat(repository.findByFirebaseUid("uid-primeiro")).isPresent();
    }

    @Test
    void segundoAcessoReaproveitaSemDuplicar() {
        User primeiro = service.findOrCreate("uid-repetido", "b@move.app");
        User segundo = service.findOrCreate("uid-repetido", "b@move.app");

        assertThat(segundo.getId()).isEqualTo(primeiro.getId());
        assertThat(repository.findAll().stream()
                        .filter(u -> u.getFirebaseUid().equals("uid-repetido")))
                .hasSize(1);
    }

    @Test
    void usuariosDiferentesRecebemLinhasDiferentes() {
        User a = service.findOrCreate("uid-a", "a@move.app");
        User b = service.findOrCreate("uid-b", "b@move.app");

        assertThat(a.getId()).isNotEqualTo(b.getId());
    }

    @Test
    void fromTokenUsaOSubjectEOEmailDoToken() {
        Jwt jwt = Jwt.withTokenValue("t").header("alg", "none")
                .subject("uid-do-token").claim("email", "t@move.app").build();

        User user = service.fromToken(jwt);

        assertThat(user.getFirebaseUid()).isEqualTo("uid-do-token");
        assertThat(user.getEmail()).isEqualTo("t@move.app");
        assertThat(service.fromToken(jwt).getId()).isEqualTo(user.getId());
    }

    @Test
    void tokenSemEmailCriaUsuarioComEmailNulo() {
        User user = service.findOrCreate("uid-sem-email", null);

        assertThat(user.getEmail()).isNull();
    }
}
