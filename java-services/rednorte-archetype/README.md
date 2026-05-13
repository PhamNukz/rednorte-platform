# rednorte-archetype

Arquetipo Maven para nuevos microservicios de la **Plataforma RedNorte**.

## ¿Qué genera?

```
mi-microservicio/
├── pom.xml                          ← Spring Boot 3.2.5, Java 21, todas las deps
├── Dockerfile                       ← Multi-stage build listo para producción
└── src/
    ├── main/
    │   ├── java/com/rednorte/mi-microservicio/
    │   │   └── Application.java
    │   └── resources/
    │       ├── application.yml      ← Config con env vars para Docker
    │       └── db/migration/
    │           └── V1__init.sql     ← Migración Flyway base
    └── test/
        └── java/com/rednorte/mi-microservicio/
```

## Instalación del archetype

```bash
cd java-services/rednorte-archetype
mvn install
```

## Crear nuevo microservicio

```bash
mvn archetype:generate \
  -DarchetypeGroupId=com.rednorte \
  -DarchetypeArtifactId=rednorte-archetype \
  -DarchetypeVersion=1.0.0 \
  -DgroupId=com.rednorte \
  -DartifactId=ms-nuevo-servicio \
  -DserviceName=nuevoServicio \
  -DservicePort=8083 \
  -DinteractiveMode=false
```

## Parámetros

| Parámetro     | Descripción                        | Default              |
|---------------|------------------------------------|----------------------|
| `groupId`     | Group ID Maven                     | `com.rednorte`       |
| `artifactId`  | Nombre del artefacto               | *(requerido)*        |
| `version`     | Versión inicial                    | `1.0.0-SNAPSHOT`     |
| `serviceName` | Nombre del servicio (camelCase)    | = `artifactId`       |
| `servicePort` | Puerto del servidor                | `8080`               |

## Stack incluido

- **Spring Boot** 3.2.5 + **Java** 21
- **Spring Data JPA** + PostgreSQL
- **Flyway** (migraciones de base de datos)
- **Bean Validation** (javax/jakarta)
- **SpringDoc OpenAPI** (Swagger UI en `/swagger-ui.html`)
- **Lombok**
- **Spring Boot Actuator** (health checks)
- **JUnit 5 + Mockito** (testing)
- **H2** en scope test para tests sin PostgreSQL

## Convenciones de paquetes

```
com.rednorte.{servicio}/
├── domain/        ← Entidades JPA + Enums
├── repository/    ← Spring Data JPA Repositories
├── factory/       ← Patrón Factory Method
├── service/       ← Lógica de negocio
├── controller/    ← REST Controllers
├── dto/           ← Request/Response DTOs
└── exception/     ← GlobalExceptionHandler (RFC 7807)
```
