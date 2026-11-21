package br.app.move.meal;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Proteína total de um dia (consulta das conquistas). */
public record DayProtein(LocalDate date, BigDecimal proteinG) {
}
