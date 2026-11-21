package br.app.move.user;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.AuthErrorCode;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Remove o usuário do Firebase Auth com a chave de administrador (variável de ambiente). */
@Component
public class FirebaseAccountRemover {

    private final String serviceAccountJson;
    private FirebaseAuth auth;

    public FirebaseAccountRemover(@Value("${firebase.service-account-json:}") String serviceAccountJson) {
        this.serviceAccountJson = serviceAccountJson;
    }

    /** Usuário que já não existe no Firebase conta como removido (a exclusão pode ser repetida). */
    public void remove(String firebaseUid) {
        try {
            auth().deleteUser(firebaseUid);
        } catch (FirebaseAuthException e) {
            if (e.getAuthErrorCode() != AuthErrorCode.USER_NOT_FOUND) {
                throw new FirebaseFalhouException("Não foi possível remover o usuário no Firebase", e);
            }
        }
    }

    private synchronized FirebaseAuth auth() {
        if (serviceAccountJson == null || serviceAccountJson.isBlank()) {
            throw new FirebaseNaoConfiguradoException();
        }
        if (auth == null) {
            try {
                GoogleCredentials credentials = GoogleCredentials.fromStream(
                        new ByteArrayInputStream(serviceAccountJson.getBytes(StandardCharsets.UTF_8)));
                FirebaseApp app = FirebaseApp.initializeApp(
                        FirebaseOptions.builder().setCredentials(credentials).build(), "move-admin");
                auth = FirebaseAuth.getInstance(app);
            } catch (IOException | RuntimeException e) {
                // Sem a causa de propósito: a mensagem poderia conter pedaços da chave.
                throw new FirebaseFalhouException("Chave de administrador do Firebase inválida", null);
            }
        }
        return auth;
    }
}
