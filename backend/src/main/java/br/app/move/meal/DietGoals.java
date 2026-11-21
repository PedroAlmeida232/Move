package br.app.move.meal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "diet_goals")
public class DietGoals {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    private int kcal;

    @Column(name = "protein_g")
    private int proteinG;

    protected DietGoals() {
    }

    public DietGoals(UUID userId, int kcal, int proteinG) {
        this.userId = userId;
        this.kcal = kcal;
        this.proteinG = proteinG;
    }

    public int getKcal() {
        return kcal;
    }

    public int getProteinG() {
        return proteinG;
    }
}
