FROM eclipse-temurin:21-jdk-jammy

# Copy the JAR file from the backend target directory
COPY target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "/app.jar"]
