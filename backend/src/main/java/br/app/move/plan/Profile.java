package br.app.move.plan;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "profiles")
public class Profile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    private String name;

    private String goal;

    protected Profile() {
    }

    public Profile(UUID userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public String getGoal() {
        return goal;
    }

    public void update(String name, String goal) {
        this.name = name;
        this.goal = goal;
    }
}
