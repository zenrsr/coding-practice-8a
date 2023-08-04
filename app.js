const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const sqlite = require("sqlite3");
const { open } = require("sqlite");
let db = null;
const dbPath = path.join(__dirname, "todoApplication.db");
const initialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite.Database,
    });
    app.listen(3000, () => {
      console.log(`Server running at http://localhost:3000/`);
    });
  } catch (e) {
    console.log(`${e.message}`);
  }
};
initialize();

const truePriorityAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const trueStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const truePriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

// API 1
app.get("/todos/", async (request, response) => {
  try {
    const { search_q = "", status, priority } = request.query;
    let getQuery = null;
    switch (true) {
      case truePriorityAndStatus(request.query):
        getQuery = `SELECT * FROM todo WHERE 
            todo LIKE '%${search_q}%'
            AND priority = '${priority}'
            AND status = '${status}';`;
        break;
      case truePriority(request.query):
        getQuery = `SELECT * FROM todo WHERE
            todo LIKE '%${search_q}'
            AND priority = '${priority}';`;
        break;
      case trueStatus(request.query):
        getQuery = `SELECT * FROM todo WHERE
            todo LIKE '%${search_q}'
            AND status = '${status}';`;
        break;
      default:
        getQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
        break;
    }
    const x = await db.all(getQuery);
    response.send(x);
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  try {
    const x = await db.get(getQuery);
    response.send(x);
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const getQuery = `INSERT INTO todo VALUES (${id}, '${todo}', '${priority}', '${status}');`;
  try {
    const x = await db.run(getQuery);
    response.send("Todo Successfully Added");
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 4
app.put("/todos/:todoId/", async (request, response) => {
  try {
    const { todoId } = request.params;
    const { priority = "", status = "", todo = "" } = request.body;
    let getQuery = null;
    if (priority !== "") {
      getQuery = `UPDATE todo SET priority = '${priority}' WHERE id= ${todoId};`;
      const x = await db.run(getQuery);
      response.send("Priority Updated");
    } else if (status !== "") {
      getQuery = `UPDATE todo SET status = '${status}' WHERE id= ${todoId};`;
      const x = await db.run(getQuery);
      response.send("Status Updated");
    } else if (todo !== "") {
      getQuery = `UPDATE todo SET todo = '${todo}' WHERE id= ${todoId};`;
      const x = await db.run(getQuery);
      response.send("Todo Updated");
    }
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `DELETE FROM todo WHERE id= ${todoId};`;
  try {
    const x = await db.run(getQuery);
    response.send("Todo Deleted");
  } catch (e) {
    console.log(`${e.message}`);
  }
});

module.exports = app;
