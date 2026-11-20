package br.app.move.db;

import static org.assertj.core.api.Assertions.assertThat;

import br.app.move.PostgresTestConfig;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest(properties = "firebase.project-id=move-teste")
@Import(PostgresTestConfig.class)
class MigracaoV2Test {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void migracaoV2CriaAsTabelasDoPlanoComRlsLigado() {
        List<String> comRls = jdbc.queryForList("""
                select relname from pg_class
                where relname in ('profiles', 'plan_days', 'plan_exercises') and relrowsecurity
                order by relname
                """, String.class);

        assertThat(comRls).containsExactly("plan_days", "plan_exercises", "profiles");
    }
}
