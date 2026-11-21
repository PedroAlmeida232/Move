package br.app.move.weight;

import br.app.move.weight.WeightData.Entry;
import br.app.move.weight.WeightData.EntryRequest;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.server.ResponseStatusException;

@Service
@Validated
public class WeightService {

    static final long DIAS_MAXIMOS = 366;

    private final WeightEntryRepository entries;

    public WeightService(WeightEntryRepository entries) {
        this.entries = entries;
    }

    /** Um registro por dia: o segundo do mesmo dia atualiza o primeiro. */
    @Transactional
    public Entry put(UUID userId, LocalDate date, @Valid EntryRequest request) {
        WeightEntryId id = new WeightEntryId(userId, date);
        WeightEntry entry = entries.findById(id).orElseGet(() -> new WeightEntry(id, null, null));
        entry.update(request.weightKg(), request.waistCm());
        return toEntry(entries.save(entry));
    }

    /** Registros de from a to, ambos inclusivos, em ordem de data. */
    @Transactional(readOnly = true)
    public List<Entry> list(UUID userId, LocalDate from, LocalDate to) {
        if (from.isAfter(to) || ChronoUnit.DAYS.between(from, to) > DIAS_MAXIMOS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Intervalo inválido");
        }
        return entries.findInRange(userId, from, to).stream().map(WeightService::toEntry).toList();
    }

    private static Entry toEntry(WeightEntry e) {
        return new Entry(e.getId().entryDate(), e.getWeightKg(), e.getWaistCm());
    }
}
