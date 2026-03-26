FROM openjdk:17-jdk-slim

# Copy the JAR file from the backend target directory
COPY target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "/app.jar"]
