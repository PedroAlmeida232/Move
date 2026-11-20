package br.app.move.user;

import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me")
public class MeController {

    private final UserService userService;

    public MeController(UserService userService) {
        this.userService = userService;
    }

    /** O usuário vem sempre do token; nada enviado pelo cliente escolhe quem é. */
    @GetMapping
    public MeResponse me(@AuthenticationPrincipal Jwt jwt) {
        User user = userService.fromToken(jwt);
        return new MeResponse(user.getId(), user.getEmail());
    }

    public record MeResponse(UUID id, String email) {
    }
}
