package br.app.move.user;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** A chave de administrador do Firebase não foi configurada neste ambiente. */
@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class FirebaseNaoConfiguradoException extends RuntimeException {

    public FirebaseNaoConfiguradoException() {
        super("Chave de administrador do Firebase não configurada");
    }
}
