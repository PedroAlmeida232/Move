package br.app.move.db;

import static org.assertj.core.api.Assertions.assertThat;

import br.app.move.TesteDeIntegracao;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

@TesteDeIntegracao
class MigracaoV3Test {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void migracaoV3CriaAsTabelasDeTreinoComRlsLigado() {
        List<String> comRls = jdbc.queryForList("""
                select relname from pg_class
                where relname in ('workout_sessions', 'workout_sets') and relrowsecurity
                order by relname
                """, String.class);

        assertThat(comRls).containsExactly("workout_sessions", "workout_sets");
    }
}
