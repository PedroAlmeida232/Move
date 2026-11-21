package br.app.move.db;

import static org.assertj.core.api.Assertions.assertThat;

import br.app.move.TesteDeIntegracao;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

@TesteDeIntegracao
class MigracaoV4Test {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void migracaoV4CriaAsTabelasDeDietaComRlsLigado() {
        List<String> comRls = jdbc.queryForList("""
                select relname from pg_class
                where relname in ('meals', 'diet_goals') and relrowsecurity
                order by relname
                """, String.class);

        assertThat(comRls).containsExactly("diet_goals", "meals");
    }
}
