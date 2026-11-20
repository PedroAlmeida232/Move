package br.app.move.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.app.move.TesteDeIntegracao;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;

@TesteDeIntegracao
class UserRepositoryTest {

    @Autowired
    private UserRepository repository;

    @Test
    void firebaseUidEUnico() {
        repository.saveAndFlush(new User("uid-unico", "x@move.app"));

        assertThatThrownBy(() -> repository.saveAndFlush(new User("uid-unico", "y@move.app")))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void buscaPorFirebaseUid() {
        User salvo = repository.saveAndFlush(new User("uid-busca", "z@move.app"));

        assertThat(repository.findByFirebaseUid("uid-busca")).get().extracting(User::getId)
                .isEqualTo(salvo.getId());
        assertThat(repository.findByFirebaseUid("nao-existe")).isEmpty();
    }
}
