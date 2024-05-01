# Task Management Application API Documentation

This API documentation outlines the endpoints and functionalities of a Task Management Application built using Express.js and SQLite database.

## Table Creation

The application creates two tables in the database:

### Task Table

| Column      | Type    |
| ----------- | ------- |
| id          | INTEGER |
| title       | TEXT    |
| description | TEXT    |
| status      | TEXT    |
| assignee_id | INTEGER |
| created_at  | DATETIME|
| updated_at  | DATETIME|

### Users Table

| Column        | Type    |
| ------------- | ------- |
| id            | INTEGER |
| username      | TEXT    |
| password_hash | TEXT    |
| user_type     | TEXT    |


### sample logins
{
    "username":"saishiva","password":"saishiva","user_type":"admin"
}

{
    "username":"raju","password":"rajubhai6","user_type":"user"
}


### status were "To Do","IN PROGRESS" and "DONE"


## API Endpoints

### 1. Get All Users

- **Path:** `/users`
- **Method:** `GET`
- **Description:** Returns a list of all users.
- **Authorization:** Requires authentication token and user role ("user" or "admin").
- **Sample Response:**
  ```json
  [
    {
      "id": 1,
      "username": "john_doe",
      "user_type": "user"
    },
    {
      "id": 2,
      "username": "admin_user",
      "user_type": "admin"
    }
  ]
  ```

### 2. Register User

- **Path:** `/register`
- **Method:** `POST`
- **Description:** Registers a new user.
- **Request Body:**
  ```json
  {
    "username": "new_user",
    "password": "password123",
    "user_type": "user"
  }
  ```
- **Sample Response:** `User created successfully`

### 3. Login User

- **Path:** `/login`
- **Method:** `POST`
- **Description:** Logs in an existing user.
- **Request Body:**
  ```json
  {
    "username": "existing_user",
    "password": "password123"
  }
  ```
- **Sample Response:** Returns a JWT token.{
    "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNhaXNoaXZhIiwidXNlcl90eXBlIjoiYWRtaW4iLCJpYXQiOjE3MTQ1NDU4MzF9.2u5-xXOTldYGSt-hm-YAMKadGMDSCM3c-Gq3vlY6VT0"
}


### 4. Get All Tasks

- **Path:** `/tasks`
- **Method:** `GET`
- **Description:** Returns a list of all tasks.
- **Authorization:** Requires authentication token and user role ("user" or "admin").
- **Sample Response:**
  ```json
  [
    {
      "id": 1,
      "title": "Task 1",
      "description": "Description of Task 1",
      "status": "TO DO",
      "assignee_id": 1,
      "created_at": "2024-05-01T12:00:00Z",
      "updated_at": "2024-05-01T12:00:00Z"
    },
    {
      "id": 2,
      "title": "Task 2",
      "description": "Description of Task 2",
      "status": "IN PROGRESS",
      "assignee_id": 2,
      "created_at": "2024-05-01T12:00:00Z",
      "updated_at": "2024-05-01T12:00:00Z"
    }
  ]
  ```

### 5. Get Specific Task

- **Path:** `/task/:id`
- **Method:** `GET`
- **Description:** Returns details of a specific task based on ID.
- **Authorization:** Requires authentication token and user role ("user" or "admin").
- **Sample Response:**
  ```json
  {
    "id": 1,
    "title": "Task 1",
    "description": "Description of Task 1",
    "status": "TO DO",
    "assignee_id": 1,
    "created_at": "2024-05-01T12:00:00Z",
    "updated_at": "2024-05-01T12:00:00Z"
  }
  ```

### 6. Create Task

- **Path:** `/tasks`
- **Method:** `POST`
- **Description:** Creates a new task.
- **Authorization:** Requires authentication token and "admin" role.
- **Request Body:**
  ```json
  {
    "title": "New Task",
    "description": "Description of New Task",
    "status": "TO DO",
    "assignee_id": 1
  }
  ```
- **Sample Response:** `Task Successfully Added`

### 7. Update Task

- **Path:** `/tasks/:id`
- **Method:** `PUT`
- **Description:** Updates details of a specific task based on ID.
- **Authorization:** Requires authentication token and "admin" role.
- **Request Body:** Can contain any combination of `title`, `description`, `status`, `assignee_id`.
- **Sample Response:** `Task Details Updated`

### 8. Delete Task

- **Path:** `/task/:id`
- **Method:** `DELETE`
- **Description:** Deletes a task based on ID.
- **Authorization:** Requires authentication token and "admin" role.
- **Sample Response:** `Task Deleted Successfully`

These APIs provide functionality for managing users and tasks in the Task Management Application.