# Lightweight, instant-startup runtime image using prebuilt, verified JAR
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy verified prebuilt Spring Boot application
COPY smart-family-financial.jar app.jar

# Configure Render port and memory limits (350MB fits safely within Render 512MB free tier)
ENV PORT=10000
EXPOSE 10000

# Start Spring Boot application
ENTRYPOINT ["sh", "-c", "java -Xmx350m -Dserver.port=${PORT:-8083} -jar app.jar"]
