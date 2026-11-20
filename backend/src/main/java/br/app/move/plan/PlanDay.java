package br.app.move.plan;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "plan_days")
public class PlanDay {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    private int weekday;

    private String name;

    @OneToMany(mappedBy = "planDay", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position")
    private List<PlanExercise> exercises = new ArrayList<>();

    protected PlanDay() {
    }

    public PlanDay(UUID userId, int weekday, String name) {
        this.id = UUID.randomUUID();
        this.userId = userId;
        this.weekday = weekday;
        this.name = name;
    }

    public void addExercise(String name, int sets, String reps, String side, String note) {
        exercises.add(new PlanExercise(this, exercises.size(), name, sets, reps, side, note));
    }

    public int getWeekday() {
        return weekday;
    }

    public String getName() {
        return name;
    }

    public List<PlanExercise> getExercises() {
        return exercises;
    }
}
