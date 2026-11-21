package br.app.move.user;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class FirebaseAccountRemoverTest {

    @Test
    void semChaveConfiguradaFalhaComErroDeNaoConfigurado() {
        assertThatThrownBy(() -> new FirebaseAccountRemover("").remove("uid-1"))
                .isInstanceOf(FirebaseNaoConfiguradoException.class);
        assertThatThrownBy(() -> new FirebaseAccountRemover("   ").remove("uid-1"))
                .isInstanceOf(FirebaseNaoConfiguradoException.class);
    }

    @Test
    void chaveInvalidaFalhaComErroDoFirebaseSemVazarOConteudo() {
        assertThatThrownBy(() -> new FirebaseAccountRemover("{segredo-quebrado").remove("uid-1"))
                .isInstanceOf(FirebaseFalhouException.class)
                .hasMessageNotContaining("segredo-quebrado");
    }
}
