# ORGANNOU: Classroom Announcement System

**Final Project Report**
**IT 211: Database Management System**
1st Semester, AY 2025–2026

**Prepared by:**
Geevoi A. Plaza
BS Computer Science – CS-2105
December 2025

---

## Table of Contents

1. [Project Proposal and Objectives](#project-proposal-and-objectives)
2. [Technology](#technology)
3. [Database Design](#database-design)
4. [Setup Instructions](#setup-instructions)
5. [Features Overview](#features-overview)
6. [User Manual](#user-manual)
7. [Tips & Best Practices](#tips--best-practices)
8. [Reflection](#reflection)
9. [Conclusion](#conclusion)

---

## Project Proposal and Objectives

### Organnou: Classroom Announcement System

Organnou is a full-stack web application developed for the IT 211 Database Management System course. Its primary goal is to provide a functional and user-friendly platform for managing educational announcements, organizing topics hierarchically, and tracking classroom resources within an academic institution.

The system uses a modern technology stack:

-   **Frontend:** Next.js 14
-   **Backend:** Node.js with Express
-   **Database:** MySQL

Key capabilities include announcement creation and filtering, hierarchical topic organization, building and room management, and schedule visualization via an interactive calendar.

### Objectives

1. **Design the Database** – Create a robust relational database with ERDs and normalized tables for announcements, topics, buildings, and rooms.
2. **Implement CRUD Operations** – Full create, read, update, and delete functionality with validation and error handling.
3. **Handle Complex Relationships** – Many-to-many relationships via junction tables and self-referencing topic hierarchies.
4. **Advanced Filtering Logic** – Recursive topic filtering with AND logic, including descendant topics.
5. **Build Modern UI/UX** – Responsive and intuitive UI using Next.js, React, and shadcn components.
6. **Visualize Data** – Card layouts, topic trees, and an interactive calendar view.

---

## Technology

### Main Data Entities

-   Announcements
-   Topics (hierarchical)
-   Buildings
-   Rooms

### Technology Stack

-   **Backend:** Node.js, Express.js, TypeScript
-   **Frontend:** Next.js 14 (App Router), React 18, TypeScript
-   **Database:** MySQL (mysql2 with connection pooling)
-   **UI Libraries:** Tailwind CSS, shadcn/ui, react-big-calendar, @hello-pangea/dnd
-   **State Management:** @tanstack/react-query

### MySQL Features Used

-   Foreign key constraints
-   Cascade delete rules
-   Auto-increment primary keys
-   Junction tables for many-to-many relationships
-   Self-referencing foreign keys
-   Indexed columns for performance

---

## Database Design

### ERD Map (Main Tables)

1. **topic**

    - Self-referencing hierarchy
    - Parent–child relationships
    - Many-to-many with announcements

2. **building**

    - One-to-many with rooms

3. **room**

    - Belongs to a building

4. **announcement**

    - Many-to-many with topics and rooms

### Junction Tables

5. **announcement_topic** – Connects announcements and topics
6. **announcement_room** – Connects announcements and rooms

### Normalization

The database follows **Third Normal Form (3NF)**:

-   **1NF:** Atomic values, no repeating groups
-   **2NF:** No partial dependencies
-   **3NF:** No transitive dependencies

This structure minimizes redundancy and ensures data integrity.

---

## Setup Instructions

### Prerequisites

-   Node.js (v18+)
-   npm
-   XAMPP (MySQL)
-   Git

Links:

-   [https://nodejs.org/](https://nodejs.org/)
-   [https://www.apachefriends.org/](https://www.apachefriends.org/)
-   [https://git-scm.com/](https://git-scm.com/)

### Quick Start

```bash
git clone https://github.com/serogee/Organnou.git
cd Organnou
```

### Database Setup

1. Start **Apache** and **MySQL** in XAMPP
2. Open phpMyAdmin → SQL tab
3. Run the provided SQL schema
4. Verify all tables are created

### Backend Setup

```bash
cd server
npm install
npm run dev
```

Create a `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=classroom_announcement_system
PORT=5000
```

Health check:

```
http://localhost:5000/health
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Access the app at:

```
http://localhost:3000
```

---

## Features Overview

### Dashboard

-   Summary statistics
-   Quick access cards

### Announcements

-   Full CRUD
-   Topic and room assignment
-   AND-based topic filtering
-   Optional start/end dates

### Calendar View

-   Monthly, weekly, daily, agenda views
-   Drag-to-create announcements

### Topics

-   Hierarchical tree structure
-   Drag-and-drop reordering

### Buildings & Rooms

-   Building and room management
-   Cascade delete behavior

---

## User Manual

### Getting Started

-   Open `http://localhost:3000`
-   Use the left sidebar for navigation

### Dashboard Overview

-   Total announcements
-   Total topics
-   Total buildings
-   Total rooms

### Managing Announcements

-   Create, edit, and delete announcements
-   Assign topics and rooms
-   Filter using multiple topics (AND logic)

### Calendar View

-   Visualize announcements by date
-   Edit directly from calendar

### Managing Topics

-   Create parent/child topics
-   Drag and drop to reorganize

### Managing Buildings & Rooms

-   Create and edit buildings
-   Add and remove rooms
-   Cascade delete behavior

---

## Tips & Best Practices

### Organize Topics Hierarchically

-   Use broad parent topics
-   Nest specific child topics

### Use Dates Effectively

-   Add deadlines for time-sensitive announcements
-   Use calendar view for planning

### Filter Smart

-   Combine multiple topics for precision
-   Remember filtering uses AND logic

### Reference IDs

-   IDs are shown on all cards
-   Useful for debugging and references

---

## Reflection

Developing Organnou highlighted the importance of proper database design and structured relationships. Recursive topic filtering and junction tables enabled flexible categorization while maintaining data integrity. The project emphasized type safety, performance considerations, and clean UI design in a full-stack environment.

---

## Conclusion

Organnou provides a centralized platform for classroom announcements with advanced filtering and location-based organization. It demonstrates how relational database principles and a modern full-stack architecture can solve real-world academic management problems while remaining scalable and maintainable.
