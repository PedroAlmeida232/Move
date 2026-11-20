package br.app.move.workout;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "workout_sessions")
public class WorkoutSession {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "performed_at", nullable = false)
    private Instant performedAt;

    private String name;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position")
    private List<WorkoutSet> sets = new ArrayList<>();

    protected WorkoutSession() {
    }

    public WorkoutSession(UUID userId, Instant performedAt, String name) {
        this.id = UUID.randomUUID();
        this.userId = userId;
        this.performedAt = performedAt;
        this.name = name;
    }

    public void addSet(String exerciseName, BigDecimal weightKg, int reps) {
        sets.add(new WorkoutSet(this, sets.size(), exerciseName, weightKg, reps));
    }

    public UUID getId() {
        return id;
    }

    public Instant getPerformedAt() {
        return performedAt;
    }

    public String getName() {
        return name;
    }

    public List<WorkoutSet> getSets() {
        return sets;
    }
}
