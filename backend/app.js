import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3003;


app.use(cors());
app.use(bodyParser.json());

// Configure database connection
const db = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "Umesh@01",
   database: "hospital",
});

db.connect((err) => {
   if (err) {
      console.error("Database connection error:", err);
      return;
   }
   console.log("Connected to MySQL database!");
});

// Mapping tables and columns for different entities
const tableMappings = {
   doctor: {
      tableName: "doctor",
      columns: {
         employeeId: "eid",
         name: "name",
         licenseNumber: "license_no",
         department: "department",
         experience: "yoe"
      }
   },
   ambulance: {
      tableName: "ambulance",
      columns: {
         ambulanceNumber: "amb_num",
         driverName: "driver_name",
         status: "status",
         contactNumber: "contact_no"
      }
   }
};

// Function to handle the common GET request for any table
const getEntityData = (entity, res) => {
   const tableName = tableMappings[entity]?.tableName;
   if (!tableName) {
      return res.status(400).send("Invalid entity");
   }

   const query = `SELECT * FROM ${tableName}`;
   db.query(query, (err, results) => {
      if (err) {
         return res.status(500).send("Database error: " + err.message);
      }
      res.json(results);
   });
};

// Function to handle the common POST request for any table
const addEntityData = (entity, req, res) => {
   const tableName = tableMappings[entity]?.tableName;
   const columns = tableMappings[entity]?.columns;
   if (!tableName || !columns) {
      return res.status(400).send("Invalid entity");
   }

   const data = {};
   for (let field in columns) {
      if (req.body[field] !== undefined) {
         data[columns[field]] = req.body[field];
      }
   }

   const query = `INSERT INTO ${tableName} (${Object.values(columns).join(", ")}) VALUES (${Object.keys(columns).map(() => "?").join(", ")})`;
   db.query(query, Object.values(data), (err, result) => {
      if (err) {
         return res.status(500).send("Database error: " + err.message);
      }
      res.send("Data added successfully");
   });
};

// Function to handle the common PUT request for any table
const updateEntityData = (entity, req, res) => {
   const tableName = tableMappings[entity]?.tableName;
   const columns = tableMappings[entity]?.columns;
   if (!tableName || !columns) {
      return res.status(400).send("Invalid entity");
   }

   const { id } = req.params;
   const data = {};
   for (let field in columns) {
      if (req.body[field] !== undefined) {
         data[columns[field]] = req.body[field];
      }
   }

   const setClause = Object.keys(data).map(col => `${col} = ?`).join(", ");
   const query = `UPDATE ${tableName} SET ${setClause} WHERE ${columns[Object.keys(columns)[0]]} = ?`;

   db.query(query, [...Object.values(data), id], (err, result) => {
      if (err) {
         return res.status(500).send("Database error: " + err.message);
      }
      res.send("Data updated successfully");
   });
};

// Function to handle the common DELETE request for any table
const deleteEntityData = (entity, req, res) => {
   const tableName = tableMappings[entity]?.tableName;
   const columns = tableMappings[entity]?.columns;
   if (!tableName || !columns) {
      return res.status(400).send("Invalid entity");
   }

   const { id } = req.params;
   const query = `DELETE FROM ${tableName} WHERE ${columns[Object.keys(columns)[0]]} = ?`;

   db.query(query, [id], (err, result) => {
      if (err) {
         return res.status(500).send("Database error: " + err.message);
      }
      res.send("Data deleted successfully");
   });
};

// GET route to fetch data for any entity (doctor, patient, etc.)
app.get("/:entity", (req, res) => {
   const entity = req.params.entity;
   getEntityData(entity, res);
});

// POST route to add data for any entity (doctor, patient, etc.)
app.post("/:entity", (req, res) => {
   const entity = req.params.entity;
   addEntityData(entity, req, res);
});

// PUT route to update data for any entity (doctor, patient, etc.)
app.put("/:entity/:id", (req, res) => {
   const entity = req.params.entity;
   updateEntityData(entity, req, res);
});

// DELETE route to delete data for any entity (doctor, patient, etc.)
app.delete("/doctor/:id", (req, res) => {
   const { id } = req.params;
   deleteEntityData("doctor", req, res); // Call the function to delete doctor data
});

app.listen(PORT, () => {
   console.log(`Server running on http://localhost:${PORT}`);
});

// Function to delete an ambulance by its number
function deleteAmbulance(ambulanceNumber) {
   if (confirm("Are you sure you want to delete this ambulance?")) {
      fetch(`http://localhost:3003/ambulance/${ambulanceNumber}`, {
         method: "DELETE",
      })
         .then(response => {
            if (response.ok) {
               alert("Ambulance deleted successfully!");
               loadAmbulances(); // Reload table after deletion
            } else {
               alert("Failed to delete the ambulance.");
            }
         })
         .catch(error => console.error("Error deleting ambulance:", error));
   }
}

// Function to update an ambulance's information by its number
function updateAmbulance(ambulanceNumber) {
   const newDriverName = prompt("Enter the new driver name:");
   const newStatus = prompt("Enter the new status:");
   const newContactNumber = prompt("Enter the new contact number:");

   if (newDriverName && newStatus && newContactNumber) {
      fetch(`http://localhost:3003/ambulance/${ambulanceNumber}`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({
            driverName: newDriverName,
            status: newStatus,
            contactNumber: newContactNumber
         }),
      })
         .then(response => {
            if (response.ok) {
               alert("Ambulance updated successfully!");
               loadAmbulances(); // Reload table after update
            } else {
               alert("Failed to update the ambulance.");
            }
         })
         .catch(error => console.error("Error updating ambulance:", error));
   } else {
      alert("All fields are required for updating.");
   }
}


// GET route for ambulances
app.get("/ambulance", (req, res) => {
   getEntityData("ambulance", res);
});

// POST route to add an ambulance
app.post("/ambulance", (req, res) => {
   addEntityData("ambulance", req, res);
});

// PUT route to update an ambulance by its ID
app.put("/ambulance/:id", (req, res) => {
   updateEntityData("ambulance", req, res);
});

// DELETE route to delete an ambulance by its ID
app.delete("/ambulance/:id", (req, res) => {
   deleteEntityData("ambulance", req, res);
});
