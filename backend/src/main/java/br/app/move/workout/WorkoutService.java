package br.app.move.workout;

import br.app.move.workout.WorkoutData.Request;
import br.app.move.workout.WorkoutData.Response;
import br.app.move.workout.WorkoutData.SetData;
import jakarta.validation.Valid;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.server.ResponseStatusException;

@Service
@Validated
public class WorkoutService {

    static final Duration INTERVALO_MAXIMO = Duration.ofDays(366);

    private final WorkoutSessionRepository sessions;

    public WorkoutService(WorkoutSessionRepository sessions) {
        this.sessions = sessions;
    }

    @Transactional
    public Response create(UUID userId, @Valid Request request) {
        WorkoutSession session = new WorkoutSession(userId, request.performedAt(), request.name());
        for (SetData s : request.sets()) {
            session.addSet(s.exercise(), s.weightKg(), s.reps());
        }
        return toResponse(sessions.save(session));
    }

    /** Sessões com performedAt em [from, to), da mais antiga para a mais nova. */
    @Transactional(readOnly = true)
    public List<Response> list(UUID userId, Instant from, Instant to) {
        if (!from.isBefore(to) || Duration.between(from, to).compareTo(INTERVALO_MAXIMO) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Intervalo inválido");
        }
        return sessions.findInRange(userId, from, to).stream().map(WorkoutService::toResponse).toList();
    }

    /** Sessão de outro usuário responde 404, sem revelar que existe. */
    @Transactional
    public void delete(UUID userId, UUID sessionId) {
        WorkoutSession session = sessions.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        sessions.delete(session);
    }

    private static Response toResponse(WorkoutSession s) {
        return new Response(s.getId(), s.getPerformedAt(), s.getName(), s.getSets().stream()
                .map(set -> new SetData(set.getExerciseName(), set.getWeightKg(), set.getReps()))
                .toList());
    }
}
