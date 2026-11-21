package br.app.move.user;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** O Firebase recusou ou não respondeu; nada foi apagado no nosso banco. */
@ResponseStatus(HttpStatus.BAD_GATEWAY)
public class FirebaseFalhouException extends RuntimeException {

    public FirebaseFalhouException(String message, Throwable cause) {
        super(message, cause);
    }
}
