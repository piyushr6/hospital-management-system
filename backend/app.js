import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import { json } from 'express'; // Import json from express

const app = express();
const PORT = 3002;

// Middleware
app.use(json());
app.use(cors());

// Configure database connection
const db = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "Umesh@01",  // Update with your MySQL password
   database: "hospital",  // Ensure your database is named "hospital"
});

// Connect to the database
db.connect((err) => {
   if (err) {
      console.error("Database connection error:", err);
      return;
   }
   console.log("Connected to MySQL database!");
});

// POST route for adding a doctor
app.post("/doctor", (req, res) => {
   console.log("POST /doctor received");  // Log to verify the route is being hit
   const { employeeId, name, licenseNumber, department, experience } = req.body;

   if (!employeeId || !name || !licenseNumber || !department || !experience) {
      return res.status(400).send("All fields are required");
   }

   console.log('Data received:', req.body);  // Log incoming data

   const query = "INSERT INTO doctor (eid, name, license_no, department, yoe) VALUES (?, ?, ?, ?, ?)";
   db.query(query, [employeeId, name, licenseNumber, department, experience], (err, result) => {
      if (err) {
         console.error('Error inserting data:', err);  // Log MySQL error
         return res.status(500).send("Database error: " + err.message);
      }
      console.log('Insert result:', result);  // Log the result from the database (insert id, etc.)
      res.send("Data added successfully");
   });
});

// GET route to fetch all doctors
app.get("/doctor", (req, res) => {
   console.log("GET /doctor received");  // Log to verify the route is being hit
   const query = "SELECT * FROM doctor";
   db.query(query, (err, results) => {
      if (err) {
         console.error('Error fetching data:', err);  // Log MySQL error
         return res.status(500).send("Database error: " + err.message);
      }
      console.log('Data fetched:', results);  // Log fetched data
      res.json(results);  // Return the result as JSON
   });
});

// Start server
app.listen(PORT, () => {
   console.log(`Server running on http://localhost:${PORT}`);
});
