const express = require("express");
const bodyParser = require("body-parser");
const db = require("./queries"); 

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.get("/", (request, response) => {
    response.json({ info: "It is working!!" });
});


//app.get("/employee", db.getEmp);
app.get("/employee/", db.getEmpById);
app.post("/employee", db.createEmp);
app.put("/employee/", db.updateEmp);
app.delete("/employee/", db.deleteEmp);
