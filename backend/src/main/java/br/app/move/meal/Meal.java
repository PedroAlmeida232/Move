package br.app.move.meal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "meals")
public class Meal {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "eaten_on", nullable = false)
    private LocalDate eatenOn;

    private String name;

    private int kcal;

    @Column(name = "protein_g", precision = 5, scale = 1)
    private BigDecimal proteinG;

    @Column(name = "carbs_g", precision = 5, scale = 1)
    private BigDecimal carbsG;

    @Column(name = "fat_g", precision = 5, scale = 1)
    private BigDecimal fatG;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Meal() {
    }

    public Meal(UUID userId, LocalDate eatenOn, String name, int kcal,
            BigDecimal proteinG, BigDecimal carbsG, BigDecimal fatG) {
        this.id = UUID.randomUUID();
        this.userId = userId;
        this.eatenOn = eatenOn;
        this.name = name;
        this.kcal = kcal;
        this.proteinG = proteinG;
        this.carbsG = carbsG;
        this.fatG = fatG;
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public LocalDate getEatenOn() {
        return eatenOn;
    }

    public String getName() {
        return name;
    }

    public int getKcal() {
        return kcal;
    }

    public BigDecimal getProteinG() {
        return proteinG;
    }

    public BigDecimal getCarbsG() {
        return carbsG;
    }

    public BigDecimal getFatG() {
        return fatG;
    }
}
