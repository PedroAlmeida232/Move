package br.app.move.user;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    /** Usuário dono do token: o uid vem do "sub" e o e-mail do claim "email". Nunca do cliente. */
    public User fromToken(Jwt jwt) {
        return findOrCreate(jwt.getSubject(), jwt.getClaimAsString("email"));
    }

    /** Sem @Transactional de propósito: se dois primeiros acessos colidirem, busca de novo. */
    public User findOrCreate(String firebaseUid, String email) {
        return repository.findByFirebaseUid(firebaseUid).orElseGet(() -> {
            try {
                return repository.save(new User(firebaseUid, email));
            } catch (DataIntegrityViolationException corrida) {
                return repository.findByFirebaseUid(firebaseUid).orElseThrow(() -> corrida);
            }
        });
    }
}
