# Multi-stage Docker build for Smart Family Financial Backend (Root Context)
# Stage 1: Build the Maven application
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy pom.xml and source code from backend directory
COPY backend/pom.xml .
COPY backend/src ./src

# Build JAR skipping tests for fast deployment
RUN mvn clean package -DskipTests

# Stage 2: Minimal runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built jar from build stage
COPY --from=build /app/target/smart-family-financial-1.0.0.jar app.jar

# Expose Render default port
ENV PORT=10000
EXPOSE 10000

# Run Spring Boot with dynamic port binding
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8083} -jar app.jar"]
