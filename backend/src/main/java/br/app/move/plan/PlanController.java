package br.app.move.plan;

import br.app.move.plan.PlanData.Request;
import br.app.move.plan.PlanData.Response;
import br.app.move.user.UserService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/plan")
public class PlanController {

    private final UserService userService;
    private final PlanService planService;

    public PlanController(UserService userService, PlanService planService) {
        this.userService = userService;
        this.planService = planService;
    }

    @GetMapping
    public Response get(@AuthenticationPrincipal Jwt jwt) {
        return planService.get(userId(jwt));
    }

    @PutMapping
    public Response put(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody Request request) {
        return planService.replace(userId(jwt), request);
    }

    /** O dono do plano vem sempre do token. */
    private UUID userId(Jwt jwt) {
        return userService.findOrCreate(jwt.getSubject(), jwt.getClaimAsString("email")).getId();
    }
}
