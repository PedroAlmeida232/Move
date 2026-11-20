package br.app.move.plan;

import br.app.move.plan.PlanData.DayData;
import br.app.move.plan.PlanData.ExerciseData;
import br.app.move.plan.PlanData.ProfileData;
import br.app.move.plan.PlanData.Request;
import br.app.move.plan.PlanData.Response;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PlanService {

    private final ProfileRepository profiles;
    private final PlanDayRepository days;

    public PlanService(ProfileRepository profiles, PlanDayRepository days) {
        this.profiles = profiles;
        this.days = days;
    }

    /** No primeiro acesso (ainda sem perfil), cria o perfil e o plano inicial do protótipo. */
    @Transactional
    public Response get(UUID userId) {
        Profile profile = profiles.findById(userId).orElseGet(() -> {
            days.saveAll(DefaultPlan.forUser(userId));
            return profiles.save(new Profile(userId));
        });
        return toResponse(profile, days.findByUserIdOrderByWeekday(userId));
    }

    /** Substitui o perfil e o plano inteiro do usuário. */
    @Transactional
    public Response replace(UUID userId, Request request) {
        Set<Integer> vistos = new HashSet<>();
        for (DayData dia : request.days()) {
            if (!vistos.add(dia.weekday())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dia da semana repetido");
            }
        }

        Profile profile = profiles.findById(userId).orElseGet(() -> new Profile(userId));
        profile.update(request.profile().name(), request.profile().goal());
        profiles.save(profile);

        days.deleteAllOfUser(userId);
        days.saveAll(request.days().stream().map(dia -> toEntity(userId, dia)).toList());

        return toResponse(profiles.findById(userId).orElseThrow(), days.findByUserIdOrderByWeekday(userId));
    }

    private static PlanDay toEntity(UUID userId, DayData dia) {
        PlanDay entity = new PlanDay(userId, dia.weekday(), dia.name());
        for (ExerciseData e : dia.exercises()) {
            entity.addExercise(e.name(), e.sets(), e.reps(), e.side(), e.note());
        }
        return entity;
    }

    private static Response toResponse(Profile profile, List<PlanDay> planDays) {
        List<DayData> dias = planDays.stream()
                .map(d -> new DayData(d.getWeekday(), d.getName(), d.getExercises().stream()
                        .map(e -> new ExerciseData(e.getName(), e.getSets(), e.getReps(), e.getSide(), e.getNote()))
                        .toList()))
                .toList();
        List<Integer> treino = dias.stream()
                .filter(d -> !d.exercises().isEmpty())
                .map(DayData::weekday)
                .toList();
        return new Response(new ProfileData(profile.getName(), profile.getGoal()), treino, dias);
    }
}
