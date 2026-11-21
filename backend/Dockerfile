# Estágio 1: compila o jar. Os testes rodam no CI (GitHub Actions), não aqui.
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Dependências primeiro: esta camada só é refeita quando o pom.xml muda.
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw -B -q dependency:go-offline

COPY src src
RUN ./mvnw -B -q package -DskipTests

# Estágio 2: só o JRE e o jar, sem usuário root.
FROM eclipse-temurin:21-jre
WORKDIR /app

RUN useradd --system --no-create-home --shell /usr/sbin/nologin move
COPY --from=build /app/target/*.jar app.jar
USER move

# A porta vem da variável PORT (server.port=${PORT:8080}); a Railway a define.
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
