package br.app.move.db;

import static org.assertj.core.api.Assertions.assertThat;

import br.app.move.TesteDeIntegracao;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

@TesteDeIntegracao
class MigracaoV1Test {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void aoSubirAAplicacaoAMigracaoV1CriaATabelaUsersComRlsLigado() {
        List<Boolean> rls = jdbc.queryForList(
                "select relrowsecurity from pg_class where relname = 'users'", Boolean.class);

        assertThat(rls).as("tabela users existe").hasSize(1);
        assertThat(rls.get(0)).as("RLS ligado em users").isTrue();
    }
}
