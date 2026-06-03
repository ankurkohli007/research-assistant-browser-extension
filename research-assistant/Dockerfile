# Stage 1: Build the app
FROM eclipse-temurin:26-jdk AS builder
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the app
FROM eclipse-temurin:26-jdk
WORKDIR /app
COPY --from=builder /app/target/research-assistant-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]