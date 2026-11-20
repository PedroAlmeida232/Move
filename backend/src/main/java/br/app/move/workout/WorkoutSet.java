package br.app.move.workout;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "workout_sets")
public class WorkoutSet {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id")
    private WorkoutSession session;

    private int position;

    @Column(name = "exercise_name")
    private String exerciseName;

    @Column(name = "weight_kg", precision = 6, scale = 2)
    private BigDecimal weightKg;

    private int reps;

    protected WorkoutSet() {
    }

    WorkoutSet(WorkoutSession session, int position, String exerciseName, BigDecimal weightKg, int reps) {
        this.id = UUID.randomUUID();
        this.session = session;
        this.position = position;
        this.exerciseName = exerciseName;
        this.weightKg = weightKg;
        this.reps = reps;
    }

    public String getExerciseName() {
        return exerciseName;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public int getReps() {
        return reps;
    }
}
