Cloneflix Project Plan: Admin Panel & TV Series
Overview
This document outlines the implementation plan to extend the Cloneflix application with new features, including an admin panel for content management, role-based access control, and the ability to handle TV series in addition to movies. The project will now use a polyglot persistence strategy, combining PostgreSQL for user data with a new MongoDB database for content data.

The strategy is to build a robust foundation first by setting up the new database, then migrating existing movie data, and finally building the core CRUD and advanced features on top of this new architecture.

Phase 0: Introduce MongoDB and Next.js API Layer
This new foundational phase will establish the connection to MongoDB and create a backend-for-frontend (BFF) API layer within Next.js to manage all content data. This showcases a modern microservice-style pattern.

Backend: Set up MongoDB Connection

Set up a local MongoDB instance using Docker or by installing it directly.

Establish a connection to the MongoDB database using a dedicated module in the Next.js project.

Frontend (Next.js): Create a Content API Layer

Create new API routes in Next.js (e.g., pages/api/movies.ts) to handle all content-related logic.

These API routes will connect directly to MongoDB, making the Next.js app a full-stack application for content management.

Phase 1: Movie Data Migration and Core Movie CRUD
This phase focuses on migrating our movie data from the temporary movies.csv file into the new MongoDB database and implementing the basic functionality to manage this data via our Next.js API layer.

Backend (Next.js API): Replace CSV with MongoDB

Create a data schema (or interface) for the Movie document in MongoDB.

Implement a script or initial function to load movies from the existing movies.csv file into the new MongoDB database if the database is empty.

Create API endpoints within Next.js (e.g., api/movies/{id}) to fetch movie data from MongoDB.

Frontend (Next.js): Create Movie Admin Panel UI

Design and build a new protected page (e.g., /admin) accessible only by authenticated admin users.

This page will display a table of all movies, fetched from our new Next.js API endpoints.

Implement UI elements to perform Create, Read, Update, and Delete (CRUD) operations on movies by interacting with the new Next.js API.

Phase 2: Content Enrichment and Access Control
This phase will add richer content to the movie data and introduce a security layer to control who can access the admin features, with a refined architecture leveraging both Spring Boot and Next.js.

Backend (Next.js API): Add Poster and Trailer Fields

Modify the Movie document schema in MongoDB to include new fields for poster_url and trailer_url.

Update the CRUD endpoints in the Next.js API layer to allow setting and updating these fields.

Backend: Implement Role-Based Access Control (RBAC)

Spring Boot (Auth Service):

Modify the User model to include a role field (e.g., user, admin).

Create a new endpoint to allow an admin user to set roles for other users.

Frontend (Next.js):

Implement logic within the Next.js API routes and frontend components to validate the user's role by calling the Spring Boot service.

Restrict access to the /admin page and the movie CRUD endpoints (POST, PUT, DELETE) to users with the admin role.

Frontend (Next.js): Enhance Movie Display

Update the MovieCard component and the movie details page ([id]/page.tsx) to display the new poster_url and a playable YouTube video for the trailer_url.

Add the poster_url and trailer_url fields to the admin panel's movie creation/update forms.

Phase 3: TV Series Functionality
The final phase will expand the core data model to support TV series, leveraging the flexibility of MongoDB to handle seasons and episodes.

Backend (Next.js API): Extend Data Model for TV Series

Modify the MongoDB schema to handle both "movie" and "series" types.

Create sub-documents or new collections for Season and Episode to be linked to a series document.

Create new API endpoints in Next.js for managing seasons and episodes.

Frontend (Next.js): Refactor Content Details Page for TV Series

Modify the movies/[id]/page.tsx component to be a dynamic "Content Details" page.

Based on the content type, conditionally render a movie-specific UI or a new TV series UI.

The TV series UI will include a season selector and a dynamic list of episodes for the selected season, each with its own details, poster, and trailer.

Phase 4: Machine Learning and Data Statistics
This new phase introduces a data-driven statistics dashboard to showcase the power of the FastAPI service and provide insights into user behavior.

Backend (FastAPI): Implement Statistics Endpoints

Create new API endpoints (e.g., /api/v1/stats/) to calculate key metrics from the PostgreSQL database (ratings, watchlist data).

Possible endpoints include:

/stats/top_movies: Returns a list of movies sorted by average rating.

/stats/popular_genres: Returns a breakdown of the most-watched genres.

/stats/user_ratings_distribution: Returns a distribution of all ratings (e.g., how many 1s, 2s, etc.).

Use a simple machine learning model or statistical methods to find trends or generate basic insights.

Frontend (Next.js): Create a Statistics Dashboard

Create a new protected page (e.g., /admin/stats) accessible to admin users.

Integrate a charting library like recharts to create a visually appealing dashboard.

Fetch data from the new FastAPI statistics endpoints and display it using various chart types (bar charts, pie charts, line graphs).

This will provide a powerful, visual overview of user engagement and content popularity.