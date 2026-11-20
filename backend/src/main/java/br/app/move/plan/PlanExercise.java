package br.app.move.plan;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "plan_exercises")
public class PlanExercise {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "plan_day_id")
    private PlanDay planDay;

    private int position;

    private String name;

    private int sets;

    private String reps;

    private String side;

    private String note;

    protected PlanExercise() {
    }

    PlanExercise(PlanDay planDay, int position, String name, int sets, String reps, String side, String note) {
        this.id = UUID.randomUUID();
        this.planDay = planDay;
        this.position = position;
        this.name = name;
        this.sets = sets;
        this.reps = reps;
        this.side = side;
        this.note = note;
    }

    public String getName() {
        return name;
    }

    public int getSets() {
        return sets;
    }

    public String getReps() {
        return reps;
    }

    public String getSide() {
        return side;
    }

    public String getNote() {
        return note;
    }
}
