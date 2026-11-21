package br.app.move.meal;

import br.app.move.meal.MealData.DayResponse;
import br.app.move.meal.MealData.Goals;
import br.app.move.meal.MealData.MealRequest;
import br.app.move.meal.MealData.MealView;
import br.app.move.user.UserService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/meals")
public class MealController {

    private final UserService userService;
    private final MealService mealService;

    public MealController(UserService userService, MealService mealService) {
        this.userService = userService;
        this.mealService = mealService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MealView create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody MealRequest request) {
        return mealService.create(userService.fromToken(jwt).getId(), request);
    }

    @GetMapping
    public DayResponse day(@AuthenticationPrincipal Jwt jwt,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return mealService.day(userService.fromToken(jwt).getId(), date);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        mealService.delete(userService.fromToken(jwt).getId(), id);
    }

    @GetMapping("/goals")
    public Goals goals(@AuthenticationPrincipal Jwt jwt) {
        return mealService.goals(userService.fromToken(jwt).getId());
    }

    @PutMapping("/goals")
    public Goals updateGoals(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody Goals goals) {
        return mealService.updateGoals(userService.fromToken(jwt).getId(), goals);
    }
}
