const express = require("express");
const bodyParser = require("body-parser");
const db = require("./queries"); 


const path = require('path');
const multer = require('multer');


const fs = require("fs");

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}



const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const storage = multer.diskStorage({
    destination: (request, file, cb) => cb(null, "uploads/"),
    filename: (request, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });





app.get("/", (request, response) => {
    response.json({ info: "It is working!!" });
});


//app.get("/employee", db.getEmp);
app.get("/employee/", db.getEmpById);
app.post("/employee", upload.single("image") ,db.createEmp);
app.put("/employee/", db.updateEmp);
app.delete("/employee/", db.deleteEmp);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
