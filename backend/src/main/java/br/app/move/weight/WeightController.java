package br.app.move.weight;

import br.app.move.user.UserService;
import br.app.move.weight.WeightData.Entry;
import br.app.move.weight.WeightData.EntryRequest;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/weight")
public class WeightController {

    private final UserService userService;
    private final WeightService weightService;

    public WeightController(UserService userService, WeightService weightService) {
        this.userService = userService;
        this.weightService = weightService;
    }

    @PutMapping("/{date}")
    public Entry put(@AuthenticationPrincipal Jwt jwt,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody EntryRequest request) {
        return weightService.put(userService.fromToken(jwt).getId(), date, request);
    }

    @GetMapping
    public List<Entry> list(@AuthenticationPrincipal Jwt jwt,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return weightService.list(userService.fromToken(jwt).getId(), from, to);
    }
}
