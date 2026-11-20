package br.app.move.workout;

import br.app.move.user.UserService;
import br.app.move.workout.WorkoutData.Request;
import br.app.move.workout.WorkoutData.Response;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/workouts")
public class WorkoutController {

    private final UserService userService;
    private final WorkoutService workoutService;

    public WorkoutController(UserService userService, WorkoutService workoutService) {
        this.userService = userService;
        this.workoutService = workoutService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Response create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody Request request) {
        return workoutService.create(userId(jwt), request);
    }

    @GetMapping
    public List<Response> list(@AuthenticationPrincipal Jwt jwt,
            @RequestParam Instant from, @RequestParam Instant to) {
        return workoutService.list(userId(jwt), from, to);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        workoutService.delete(userId(jwt), id);
    }

    /** O dono vem sempre do token. */
    private UUID userId(Jwt jwt) {
        return userService.findOrCreate(jwt.getSubject(), jwt.getClaimAsString("email")).getId();
    }
}
