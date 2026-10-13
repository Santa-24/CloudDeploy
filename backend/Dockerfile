# ==============================================================================
# CloudDeploy Backend — Multi-Stage Production Dockerfile (Java 21)
# ==============================================================================

# Stage 1: Build the Spring Boot application
FROM maven:3.9.8-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build application JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal Production JRE 21 Runtime
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

# Create non-root system user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Prepare persistent storage directory
RUN mkdir -p /app/storage /app/logs && chown -R appuser:appgroup /app

# Copy compiled JAR
COPY --from=builder --chown=appuser:appgroup /app/target/clouddeploy-backend-1.0.0.jar app.jar

USER appuser

ENV SERVER_PORT=8080 \
    JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
