package br.app.move.achievement;

import br.app.move.achievement.AchievementData.View;
import br.app.move.user.UserService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/achievements")
public class AchievementController {

    private final UserService userService;
    private final AchievementService achievementService;

    public AchievementController(UserService userService, AchievementService achievementService) {
        this.userService = userService;
        this.achievementService = achievementService;
    }

    @GetMapping
    public List<View> list(@AuthenticationPrincipal Jwt jwt) {
        return achievementService.list(userService.fromToken(jwt).getId());
    }
}
