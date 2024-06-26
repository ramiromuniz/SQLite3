## Overview

Full-stack blogging platform built with Node.js, using Express and EJS as the web application framework and SQLite as the database. It supports basic blog functionalities including user authentication, article posting (both drafts and published posts), commenting, and liking posts. All stored dynamically in Tables of the Database.

## Installation

To get started with the Blogging Platform, follow these steps:

### 1. Install Dependencies

Run the following command to install all necessary dependencies:

npm install

### 2. Building the Database

To initialize the database, use one of the following commands based on your system:

- For macOS/Linux:

npm run build-db

- For Windows:

npm run build-db-win

### 3. Starting the Application

To start the server, execute:

npm start

The application will be available at [http://localhost:3000](http://localhost:3000).

## Creating an Account

To access the authoring features, you'll need to create an account. There's no rigorous authentication process implemented, so you can use dummy data to set up an account.

## Dependencies

The Blogging Platform relies on the following dependencies:

- `bcrypt`: Used for password hashing.
- `express-session`: Manages user sessions and authentication.
- `ejs`: Template engine for rendering views.
- `sqlite3`: Database to store user and blog data.
- `express`: Web application framework.

Ensure that you are running Node.js version 16.x and npm version 8.x or higher to avoid any compatibility issues. Further assistance can be found in the `package.json` file.

## Additional Libraries

No additional libraries are used beyond what has been provided in the `package.json`.

## Running the App

After the initial setup, you should be able to access the application without further need for compilation or additional installations. If you encounter any issues, ensure that the version requirements for Node.js and npm are met and that all commands are executed in the root directory of the project.

## User Guide

- **Reader Portal**: No login is required. Readers can view published articles, comment on them, and express their likes.

- **Author Portal**: Requires account creation. Authors can write articles, save drafts, publish content, and manage their blog settings.
