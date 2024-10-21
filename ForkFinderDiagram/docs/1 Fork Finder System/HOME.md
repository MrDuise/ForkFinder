# 1 Fork Finder System

![diagram](https://www.plantuml.com/plantuml/svg/0/bPHDZzem48RlIFo7QGuLI5cuxAcdKfPsgHOMyT6g9pJO0t6Ls95d0hkg-jyhEv25XKjFSJplZ1-_7lip2tgfYhpT-c2ioYjDa8cK_AdVztZexOnarQPYyifP8IizvOe-Qc_GxlEghFh3-xjPZbPMawT-Za8i_U7zUkYieB7aUsKitcuz3NuzhvRhd-Fbu_ffz6qqVUXqm_oCF3lRCLYba8ojDdjTOGw3ieGLaqzII0OG0C1jGJ82BCjUqcst5gyiLAn7Bz8XJY4PtHLeSk0u7TAM6G6z27cBET1vz7s-rw70d5WyLbRW0GLXSRjGNG6spiEEH8pTWMyIDGgU5__YAglHltRCvdA5hyPgyaaN_hHR002DNvq2KqWcRcDo2YOaCGsLm1J5x2dypxpR6qqSxOZM62lajwWeSYbF6C6Oc8sp30SZ6PJaofm0hGO-c388nC7MMFss0uxqbqHwaq8IBDaWKysJenWNt3XDmq9bL628BiHvufhBqyw4oa4DncwTB-8uXGmv8mrOIKPMZAebofCElvXp2gWKCKFkTfm2YRg1PlqLtDHPk05uHjQuThJd4emhbG5o4omzRScJLSJHEkMi9IMaOms-PbAeCaeX6OPlSXf0M1ntxpdUMkSC0WAm1cUZv0R8zQ9Ocd1HPkFGC_dHpjYxhoMnygQKI3ybbjvlXicFuKKdHJ_ml1DYOuGUsLPMrMOQUOMzGK3uldYUzX-NonaCPkDuBZNGdF8Q9Tx81LdDnvl7SUEJvUp4taZhoxTYYfAcyk9A68zwJgWPFiB16maUkjCcd-UJgunZU_nNpkduRYRDIHi-JmctjVR-zWR-1cU2CBvl1pmJDfecN3JXusnmiNuOBwmCCDrswpDP7H_NVm00)

# Level 2: Container Diagram

## Context Scope
This diagram outlines the structure and major components of the **Restaurant Finder App**. It provides a high-level view of the system's containers (frontend, backend, database, etc.), external systems it interacts with (email, restaurant data), and how these components communicate with one another.

## Containers and Relationships

### People
- **Individual App User (IAU)**: A person who uses the app to find restaurants and manage sessions.

### External Systems
- **E-mail System (ES)**: An external system that sends notifications and emails to users (e.g., for registration confirmation, session updates).
- **Restaurant Data System (RDS)**: An external system used to fetch restaurant data based on user preferences and location (e.g., Yelp API, Google Places).

### Internal Containers
- **Mobile App (MA)**: 
  - **Technology**: React Native
  - **Description**: The mobile app provides the user interface for creating sessions, inviting friends, and swiping to find restaurants.
  
- **Database (Relational) (DB)**:
  - **Technology**: Relational Database Schema
  - **Description**: Stores persistent user information, such as registration data, hashed authentication credentials, and access logs.
  
- **Non-Relational Database (NRDB)**:
  - **Technology**: NoSQL (Non-Relational) Database
  - **Description**: Stores user session data, including session preferences, active sessions, and connected users.
  
- **Cache Storage (CACHE)**:
  - **Technology**: Redis
  - **Description**: Temporary storage for restaurant data based on session preferences to reduce repeated API calls to external systems.
  
- **API Application (API)**:
  - **Technology**: Typescript, Nest.js MVC
  - **Description**: Handles core functionality including user authentication, restaurant data retrieval, and session management. Provides this functionality via a JSON/HTTP API.

## Container Communication
- **API ↔ E-mail System**: Sends emails through the external email system via SMTP.
- **API ↔ Restaurant Data System**: Fetches restaurant data from the external system using JSON/HTTPS requests.
- **API ↔ Relational Database**: Reads and writes user and session data to the relational database using TypeORM.
- **API ↔ Non-Relational Database**: Reads and writes session-specific data to the NoSQL database using TypeORM.
- **API ↔ Cache Storage**: Interacts with Redis to cache restaurant data for faster access.
- **Mobile App ↔ API**: Communicates with the API to authenticate users, fetch restaurant data, and manage sessions via JSON/HTTPS requests.

## People Communication
- **Individual App User ↔ Mobile App**: Users interact with the mobile app over HTTPS to perform various actions.
- **E-mail System ↔ Individual App User**: The external email system sends emails to the user (e.g., for registration confirmation or session updates).

---

## Relationships
- **MA → API**: The mobile app communicates with the API using JSON/HTTPS to retrieve restaurant data and manage sessions.
- **API → ES**: The API communicates with the email system over SMTP to send emails to users.
- **API → RDS**: The API fetches restaurant data from external sources via JSON/HTTPS.
- **API → DB**: The API reads from and writes to the relational database using TypeORM.
- **API → NRDB**: The API interacts with the NoSQL database to store and retrieve session information.
- **API → CACHE**: The API caches restaurant data in Redis based on session preferences to avoid redundant external API calls.

## Intended Audience
This diagram is intended for **technical staff**, including software architects, developers, and operations/support personnel. It provides an overview of how the containers within the system are structured and communicate with each other.

