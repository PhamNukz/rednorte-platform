# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && mvn package -DskipTests

# ── Stage 2: Runtime ────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Usuario no-root por seguridad
RUN addgroup -S rednorte && adduser -S rednorte -G rednorte
USER rednorte

COPY --from=builder /build/target/${artifactId}-${version}.jar app.jar

EXPOSE ${servicePort}
ENTRYPOINT ["java", "-jar", "app.jar"]
