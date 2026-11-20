package br.app.move.plan;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/** Plano inicial, igual ao do protótipo: unilaterais, lombar e abdômen. */
final class DefaultPlan {

    private DefaultPlan() {
    }

    static List<PlanDay> forUser(UUID userId) {
        List<PlanDay> dias = new ArrayList<>();
        dias.add(new PlanDay(userId, 0, "Descanso"));
        dias.add(dia(userId, 1, "Peito, tríceps e abdômen",
                ex("Supino com halteres", 3, "10"),
                ex("Crucifixo na polia (unilateral)", 3, "12"),
                ex("Flexão de braço", 3, "10-12"),
                ex("Tríceps corda na polia", 3, "12"),
                ex("Prancha frontal", 3, "30-40s"),
                ex("Dead bug", 3, "10 por lado")));
        dias.add(dia(userId, 2, "Costas, bíceps e lombar",
                ex("Serrote (remada unilateral)", 3, "10"),
                ex("Puxada unilateral na polia alta", 3, "10"),
                ex("Face pull", 3, "12"),
                ex("Rosca martelo alternada", 3, "12"),
                ex("Hiperextensão lombar", 3, "12"),
                ex("Bird dog", 3, "10 por lado")));
        dias.add(dia(userId, 3, "Cardio e mobilidade",
                ex("Caminhada inclinada ou bicicleta", 1, "30-40 min"),
                ex("Extensão torácica no rolo", 2, "10"),
                ex("Wall angels", 2, "12")));
        dias.add(dia(userId, 4, "Ombros, braços e core",
                ex("Desenvolvimento com halteres", 3, "10"),
                ex("Elevação lateral", 3, "12"),
                ex("Rosca alternada", 3, "10"),
                ex("Tríceps francês unilateral", 3, "10"),
                ex("Prancha lateral", 3, "25s por lado"),
                ex("Pallof press", 3, "10 por lado")));
        dias.add(dia(userId, 5, "Costas, pernas leves e lombar",
                ex("Remada unilateral na polia baixa", 3, "10"),
                ex("Crucifixo inverso", 3, "12"),
                ex("Leg press leve", 3, "12"),
                ex("Ponte de glúteos", 3, "15"),
                ex("Superman alternado", 3, "10 por lado")));
        dias.add(dia(userId, 6, "Cardio",
                ex("Caminhada inclinada ou bicicleta", 1, "30-40 min"),
                ex("Alongamento de flexores do quadril", 2, "30s")));
        return dias;
    }

    private record Ex(String name, int sets, String reps) {
    }

    private static Ex ex(String name, int sets, String reps) {
        return new Ex(name, sets, reps);
    }

    private static PlanDay dia(UUID userId, int weekday, String name, Ex... exercicios) {
        PlanDay dia = new PlanDay(userId, weekday, name);
        for (Ex e : exercicios) {
            dia.addExercise(e.name(), e.sets(), e.reps(), null, null);
        }
        return dia;
    }
}
