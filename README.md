# Transport Service Issue Tracker

A Java and Spring Boot application for reporting, assigning, tracking and resolving transport service issues.

This project was created as a portfolio project to demonstrate Java 17, Spring Boot, REST APIs, SQL/Oracle development, Agile-style incremental delivery, automated testing and Git version control.

## Project Status

The Spring Boot REST API MVP is functional.

Current development uses an H2 in-memory database configured in Oracle compatibility mode. Oracle Database and Oracle APEX integration are planned as the next stage.

## Features

- Create a service issue
- View all issues
- View an issue by issue number
- Assign an issue to a support agent
- Change issue priority
- Change issue status
- Add comments and internal notes
- Add resolution notes
- Resolve, close and reopen issues
- Record status-change history
- Search issues by title
- Filter by status, priority, category and assignee
- Record creation, update, resolution and closure times
- Validate API requests
- Return structured JSON errors
- Explore and test endpoints through Swagger UI

## Technologies

- Java 17
- Spring Boot
- Spring Web MVC
- Spring Data JPA
- Hibernate
- Jakarta Validation
- Flyway
- H2 Database
- Oracle-compatible SQL migrations
- Maven
- JUnit 5
- AssertJ
- Springdoc OpenAPI
- Swagger UI
- Git and GitHub

## Architecture

```text
Oracle APEX / Swagger UI / API Client
                 |
                 v
        Spring Boot Controllers
                 |
                 v
          Service Layer
                 |
                 v
      Spring Data JPA Repositories
                 |
                 v
      H2 Development Database
                 |
                 v
       Oracle Database (planned)
```
