package br.app.move.user;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
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
