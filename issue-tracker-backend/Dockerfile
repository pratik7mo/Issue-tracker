FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app
COPY target/issue-tracker-backend-*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
