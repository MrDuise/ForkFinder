# Overview

![diagram](https://www.plantuml.com/plantuml/svg/0/NL5BRy8m3BuZyH-yda02Uk6q4mZAXWGRug5f9-Gr1gAbIHKxmFxzb7QWCkNs-NlP6R6Wbr2OTkj9szm4HN0IAVavJJrU1aSjf_0Lc7pkh92LGUwA59NNQCycb26T3FihWrPsoqLgK8WbdGptayY-og2ihDkjnVZpVRVTVyoth_j5zfAzJJlTYA_8ixCTZQ47oTmgVLO13OpB4dPCFkb1CeOO3-u0SYB0iXmatNPhyyD2HUTmu1uaC-U_OQQj8W_re18QuovSgHd4mS7v0exUXP9J9cRjR8rhgm0XTqNXB7XYyHYin16X04eZS9zTfKCnC-iNg0tmFMvx8g0c-5_cLTIjx_vJ56pKhVHN8M_nvX0hmv54j3qsYYaKhCpZMvEfprUVOiV4SHJXsBE-x8QiuhzsSUSRez9KwpmmOftDShjweDNrR_uZighwsry0)

# Level 1: System Context Diagram

## Context Scope
The scope of the system is a **restaurant finder app** that allows users to swipe through nearby restaurants with friends, selecting preferences and syncing their choices. The system includes a mobile app (frontend), a backend (microservices for authentication, sessions, etc.), and external integrations, such as an email system for notifications.

## Primary Elements

### The App (System in Scope)
- **Frontend**: The mobile app interface that users interact with. This includes features for registration, logging in, creating restaurant selection sessions, and interacting with other users.
- **Backend**: A series of microservices that handle authentication, session management, restaurant selection logic, and user preferences.

### People (Actors/Roles/Personas)
- **Users**: People who use the app to find restaurants and sync sessions with friends. These users interact with both the frontend (to view and swipe restaurants) and the backend (for login, session creation, and management).

### Software Systems (External Dependencies)
- **Email System**: The external system that handles sending emails for notifications, such as confirming account registration, password recovery, or session-related notifications. This could be an external service like AWS SES, SendGrid, or the Gmail API.
- **Restaurant Data API**: A third-party system (Google Places) that the app uses to fetch restaurant data for users to swipe through.

## Intended Audience
This diagram is aimed at both **technical and non-technical stakeholders**. It provides a high-level view of how the restaurant finder app interacts with its users and external systems, allowing everyone, including managers, developers, designers, and external partners, to understand the relationships between the app’s components without getting into technical details.
