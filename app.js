const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



const databasePath = path.join(__dirname, "newtasks.db");
const app = express();
app.use(express.json());

let database = null;

const createInitialDatabases = async () => {
    await database.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        status TEXT,
        assignee_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(assignee_id) REFERENCES users(id)
    )`);

    await database.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password_hash TEXT,
        user_type TEXT
    )`);
};

const initializeDbAndServer = async () => {
    try {
        database = await open({
            filename: databasePath,
            driver: sqlite3.Database,
        });

        await createInitialDatabases();

        app.listen(3000, () =>
            console.log("Server Running at http://localhost:3000/")
        );
    } catch (error) {
        console.log(`DB Error: ${error.message}`);
        process.exit(1);
    }
};

initializeDbAndServer();

const validatePassword = (password) => { 
    return password.length > 4;
};


//token authentication
function authenticateToken(request, response, next) {
    let jwtToken;
    const authHeader = request.headers["authorization"];
    if (authHeader !== undefined) {
      jwtToken = authHeader.split(" ")[1];
    }
    if (jwtToken === undefined) {
      response.status(401);
      response.send("Invalid JWT Token");
    } else {
      jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
        if (error) {
          response.status(401);
          response.send("Invalid JWT Token");
        } else {
          next();
        }
      });
    }
  }

  // Middleware to authenticate user role
  function authenticateUserRole(allowedRoles) {
    return (request, response, next) => {
        // Get the JWT token from the request headers
        const token = request.headers.authorization && request.headers.authorization.split(' ')[1];
        
        if (!token) {
            return response.status(401).json({ error: 'JWT token not provided' });
        }

        // Verify and decode the JWT token
        jwt.verify(token, 'MY_SECRET_TOKEN', (error, decoded) => {
            if (error) {
                return response.status(401).json({ error: 'Invalid JWT token' });
            }
            
            console.log(decoded); // This will log the decoded payload
            
            // Check if user has permission based on the allowed roles for this route
            if (allowedRoles.includes(decoded.user_type)) {
                // User has permission, proceed to the next middleware or route handler
                next();
            } else {
                // User doesn't have permission, return a 403 Forbidden error
                return response.status(403).json({ error: "Unauthorized: Insufficient role" });
            }
        });
    };
}



// get user details
app.get("/users",authenticateToken,authenticateUserRole(["user", "admin"]),async (request,response) => {
    try {
        const userListQuery = `SELECT * FROM users;`;
        const userList = await database.all(userListQuery)
        response.send(userList)

    } catch (error) {
        response.status(500).send("Internal Server Error");
    }
})

/// user related stuff user table 

app.post("/register", async (request, response) => {
    try {
        const { username, password, user_type } = request.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const selectUserQuery = `SELECT * FROM users WHERE username = ?;`;
        const databaseUser = await database.get(selectUserQuery, [username]);

        if (!databaseUser) {
            const createUserQuery = `
                INSERT INTO users (username, password_hash, user_type)
                VALUES (?, ?, ?);`;

            if (validatePassword(password)) {
                await database.run(createUserQuery, [
                    username,
                    hashedPassword,
                    user_type,
                ]);
                response.send("User created successfully");
            } else {
                response.status(400).send("Password is too short");
            }
        } else {
            response.status(400).send("User already exists");
        }
    } catch (error) {
        console.log(`Error registering user: ${error.message}`);
        response.status(500).send("Internal Server Error");
    }
});


/// user related stuff user table

app.post("/login", async (request, response) => {
    try {
        const { username, password,user_type } = request.body;
        const selectUserQuery = `SELECT * FROM users WHERE username = ?;`;
        const databaseUser = await database.get(selectUserQuery, [username]);
        console.log("User type fetched from database:", databaseUser);


        if (databaseUser) {
            const isPasswordMatched = await bcrypt.compare(
                password,
                databaseUser.password_hash
            );
            if (isPasswordMatched) {
                const payload = {
                    username: databaseUser.username,
                    user_type:databaseUser.user_type
                  };
                  console.log(payload)
                  const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
                  response.send({ jwtToken });
                
            } else {
                response.status(400).send("Invalid password");
            }
        } else {
            response.status(400).send("Invalid user");
        }
    } catch (error) {
        console.log(`Error logging in: ${error.message}`);
        response.status(500).send("Internal Server Error");
    }
});


//get all tasks list

app.get("/tasks", authenticateToken,authenticateUserRole(["user", "admin"]),async (request,response) => {
    try {
        const tasksListQuery = `SELECT * FROM tasks;`;
        const tasksList = await database.all(tasksListQuery)
        response.send(tasksList)

    } catch (error) {
        response.status(500).send("Internal Server Error");
    }
})

// specific task

app.get("/task/:id",authenticateToken,authenticateUserRole(["user", "admin"]),async (request,response) => {
    const {id}= request.params
    try {
        const taskListQuery = `SELECT * FROM tasks WHERE id = ${id};`;
        const task = await database.all(taskListQuery)
        response.send(task)

    } catch (error) {
        response.status(500).send("Internal Server Error");
    }
})


/// task related stuff task table

app.post("/tasks",authenticateToken,authenticateUserRole(["admin"]), async (request, response) => {
    const { title, description, status, assignee_id } = request.body;
    const taskQuery = `
      INSERT INTO
        tasks (title, description, status, assignee_id)
      VALUES
        ('${title}', '${description}', '${status}', ${assignee_id});`; // Enclose string values in single quotes
    try {
      await database.run(taskQuery);
      response.send("Task Successfully Added");
    } catch (error) {
      console.error("Error adding task:", error);
      response.status(500).send("Internal Server Error");
    }
  });
  
////// task related stuff task table update

app.put('/tasks/:id',authenticateToken,authenticateUserRole(["admin"]), async (request, response) => {
    const { id } = request.params;
    const { title, description, status, assignee_id } = request.body;
    const updateTaskQuery = `
      UPDATE
        tasks
      SET
        title = '${title}',
        description = '${description}',
        status = '${status}',
        assignee_id = ${assignee_id}
      WHERE
        id = ${id};
    `;
  
    try {
      await database.run(updateTaskQuery);
      response.send("Task Details Updated");
    } catch (error) {
      console.error("Error updating task:", error);
      response.status(500).send("Internal Server Error");
    }
  });

  // delete tasks

  app.delete('/task/:id',authenticateToken,authenticateUserRole(["admin"]), async (request, response) => {
    const { id } = request.params;
  
    const deleteTaskQuery = `
      DELETE FROM
        tasks
      WHERE
        id = ${id};
    `;
  
    try {
      await database.run(deleteTaskQuery);
      response.send("Task Deleted Successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      response.status(500).send("Internal Server Error");
    }
  });
  