const express = require("express");
const multer = require('multer');
const bodyParser = require("body-parser");
const db = require("./queries"); 
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({storage});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.get("/", (request, response) => {
    response.json({ info: "It is working!!" });
});


//app.get("/employee", db.getEmp);
app.get("/employee/", db.getEmpById);
app.post("/employee",upload.single('image'),db.createEmp);
app.put("/employee/", upload.single('image'),db.updateEmp);
app.delete("/employee/", db.deleteEmp);
