package br.app.move.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

class UserServiceConcorrenciaTest {

    @Test
    void doisPrimeirosAcessosSimultaneosNaoViram500() {
        UserRepository repository = mock(UserRepository.class);
        User existente = new User("uid-corrida", "c@move.app");
        when(repository.findByFirebaseUid("uid-corrida"))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(existente));
        when(repository.save(any(User.class)))
                .thenThrow(new DataIntegrityViolationException("firebase_uid duplicado"));

        User user = new UserService(repository).findOrCreate("uid-corrida", "c@move.app");

        assertThat(user).isSameAs(existente);
    }
}
