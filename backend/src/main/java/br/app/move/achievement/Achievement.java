package br.app.move.achievement;

/** Catálogo de conquistas (igual ao do protótipo). Só o desbloqueio é gravado, não o catálogo. */
public enum Achievement {
    FIRST("Primeiro treino", "Conclua um treino completo"),
    STREAK_7("7 dias seguidos", "Mantenha a sequência por 7 dias"),
    TEN("10 treinos", "Conclua 10 treinos completos"),
    PR("Novo recorde", "Supere sua carga em um exercício"),
    W4("Balança em dia", "Registre o peso 4 semanas seguidas"),
    PROT_5("Proteína em dia", "Bata a meta de proteína em 5 dias"),
    SETS_100("100 séries", "Conclua 100 séries no total"),
    W25("25 treinos", "Conclua 25 treinos completos");

    private final String title;
    private final String description;

    Achievement(String title, String description) {
        this.title = title;
        this.description = description;
    }

    public String title() {
        return title;
    }

    public String description() {
        return description;
    }
}
