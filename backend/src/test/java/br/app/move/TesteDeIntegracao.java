package br.app.move;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

/**
 * Aplicação inteira com Postgres em container (nunca o Supabase) e MockMvc.
 * Todas as classes com esta anotação compartilham o mesmo contexto e o mesmo container.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest(properties = "firebase.project-id=move-teste")
@AutoConfigureMockMvc
@Import(PostgresTestConfig.class)
public @interface TesteDeIntegracao {
}
