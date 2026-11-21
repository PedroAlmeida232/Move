package br.app.move.db;

import static org.assertj.core.api.Assertions.assertThat;

import br.app.move.TesteDeIntegracao;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

@TesteDeIntegracao
class MigracaoV6Test {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void migracaoV6CriaAchievementsUnlockedComRlsLigado() {
        List<Boolean> rls = jdbc.queryForList(
                "select relrowsecurity from pg_class where relname = 'achievements_unlocked'", Boolean.class);

        assertThat(rls).as("tabela achievements_unlocked existe").hasSize(1);
        assertThat(rls.get(0)).as("RLS ligado em achievements_unlocked").isTrue();
    }
}
