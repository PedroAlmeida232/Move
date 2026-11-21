package br.app.move.weight;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "weight_entries")
public class WeightEntry {

    @EmbeddedId
    private WeightEntryId id;

    @Column(name = "weight_kg", precision = 4, scale = 1)
    private BigDecimal weightKg;

    @Column(name = "waist_cm", precision = 4, scale = 1)
    private BigDecimal waistCm;

    protected WeightEntry() {
    }

    public WeightEntry(WeightEntryId id, BigDecimal weightKg, BigDecimal waistCm) {
        this.id = id;
        this.weightKg = weightKg;
        this.waistCm = waistCm;
    }

    public WeightEntryId getId() {
        return id;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public BigDecimal getWaistCm() {
        return waistCm;
    }

    public void update(BigDecimal weightKg, BigDecimal waistCm) {
        this.weightKg = weightKg;
        this.waistCm = waistCm;
    }
}
