package br.app.move.plan;

import static org.assertj.core.api.Assertions.assertThat;

import br.app.move.PostgresTestConfig;
import br.app.move.user.UserService;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest(properties = "firebase.project-id=move-teste")
@Import(PostgresTestConfig.class)
class PlanDayRepositoryTest {

    @Autowired
    private PlanDayRepository repository;

    @Autowired
    private UserService users;

    @Test
    void ordemDosExerciciosEPreservada() {
        UUID userId = users.findOrCreate("uid-" + UUID.randomUUID(), null).getId();
        PlanDay dia = new PlanDay(userId, 1, "Treino");
        dia.addExercise("Crucifixo", 3, "12", null, null);
        dia.addExercise("Agachamento", 3, "10", null, null);
        dia.addExercise("Barra", 3, "8", null, null);
        repository.save(dia);

        assertThat(repository.findByUserIdOrderByWeekday(userId)).singleElement()
                .satisfies(d -> assertThat(d.getExercises()).extracting(PlanExercise::getName)
                        .containsExactly("Crucifixo", "Agachamento", "Barra"));
    }
}
