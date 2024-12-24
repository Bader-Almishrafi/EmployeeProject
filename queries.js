const pool = require("pg").Pool;
const { request, response } = require("express");
const Response = require("./mode/Response")
const db = new pool({
    user:'postgres',
    host:'localhost',
    database:'employees',
    password:'Bader12098',
    port:5432
});

/*const getEmp = (request, response) => {
    db.query("SELECT * FROM employees ORDER BY id ASC", (error, results) => {
        if (error) {
            console.error("Error fetching employees:", error);
            const responseObj = new Response(false, 500, "Server Error", null);
            return response.status(500).json(responseObj);
        }
        const responseObj = new Response(true, 200, "Employees fetched successfully", results.rows);
        response.status(200).json(responseObj);
    });
};*/

// const getEmpById = (request, response) => {
//     const id =request.query.id

//     if(id){
//     if (isNaN(id)) {
//         const responseObj = new Response(false, 400, "Invalid ID", null);
//         return response.status(400).json(responseObj);
//     }

//     db.query("SELECT * FROM employees WHERE id = $1", [id], (error, results) => {
//         if (error) {
//             console.error("Error fetching employee:", error);
//             const responseObj = new Response(false, 500, "Server Error", null);
//             return response.status(500).json(responseObj);
//         }

//         if (results.rowCount === 0) {
//             const responseObj = new Response(false, 404, "Employee not found", null);
//             return response.status(404).json(responseObj);
//         }

       

//         const responseObj = new Response(true, 200, "Employee fetched successfully", results.rows[0]);
//         response.status(200).json(responseObj);
//     })}
//     else{
//         db.query("SELECT * FROM employees ORDER BY id ASC", (error, results) => {
//             if (error) {
//                 console.error("Error fetching employees:", error);
//                 const responseObj = new Response(false, 500, "Server Error", null);
//                 return response.status(500).json(responseObj);
//             }

             
            
//             const responseObj = new Response(true, 200, "Employees fetched successfully", results.rows);
//             response.status(200).json(responseObj);
//         });
//     }
// };

const getEmpById = (request, response) => {
    const { id, image } = request.query;

    if (id) {
        if (isNaN(id)) {
            const responseObj = new Response(false, 400, "Invalid ID", null);
            return response.status(400).json(responseObj);
        }

        if (image === "true") {
            db.query("SELECT image FROM employees WHERE id = $1", [id], (error, results) => {
                if (error) {
                    console.error("Error fetching image:", error);
                    return response.status(500).json({ success: false, message: "Server Error" });
                }

                if (results.rowCount === 0) {
                    return response.status(404).json({ success: false, message: "Image not found" });
                }

                const img = results.rows[0].image;
                response.set("Content-Type", "image/jpeg"); 
                return response.send(img);
            });
        } else {
            db.query(
                "SELECT id, fname, lname, position, salary FROM employees WHERE id = $1",
                [id],
                (error, results) => {
                    if (error) {
                        console.error("Error fetching employee:", error);
                        const responseObj = new Response(false, 500, "Server Error", null);
                        return response.status(500).json(responseObj);
                    }

                    if (results.rowCount === 0) {
                        const responseObj = new Response(false, 404, "Employee not found", null);
                        return response.status(404).json(responseObj);
                    }

                    const employee = results.rows[0];
                    employee.imageLink = `${request.protocol}://${request.get("host")}/employee?id=${employee.id}&image=true`;

                    const responseObj = new Response(true, 200, "Employee fetched successfully", employee);
                    return response.status(200).json(responseObj);
                }
            );
        }
    } else {
        db.query(
            "SELECT id, fname, lname, position, salary FROM employees ORDER BY id ASC",
            (error, results) => {
                if (error) {
                    console.error("Error fetching employees:", error);
                    const responseObj = new Response(false, 500, "Server Error", null);
                    return response.status(500).json(responseObj);
                }

                const employees = results.rows.map(employee => {
                    employee.imageLink = `${request.protocol}://${request.get("host")}/employee?id=${employee.id}&image=true`;
                    return employee;
                });

                const responseObj = new Response(true, 200, "Employees fetched successfully", employees);
                return response.status(200).json(responseObj);
            }
        );
    }
};


const fs = require("fs");
const path = require("path");

// const createEmp = (request, response) => {
//     const { fname, lname, position, salary } = request.body;
//     let imageBuffer = request.file ? request.file.buffer : null;

//     if (!fname || !lname || !position || !salary) {
//         const responseObj = new Response(false, 400, "All fields are required", null);
//         return response.status(400).json(responseObj);
//     }

//     if (!imageBuffer) {
//         const defaultImagePath = path.join(__dirname, './defaultImage/defaultImage.jpg');
//         imageBuffer = fs.readFileSync(defaultImagePath);
//     }



//     db.query("SELECT MAX(id) AS max_id FROM employees", (error, results) => {
//         if (error) {
//         console.error("Error retrieving max id:", error);
//         const responseObj = new Response(false, 500, "Server Error", null);
//         return response.status(500).json(responseObj);
//          }

//     const maxId = 0 || results.rows[0].max_id;  

//     db.query(
//         "SELECT setval('employees_id_seq', $1)", 
//         [maxId],
//         (error) => {
//             if (error) {
//                 console.error("Error resetting sequence:", error);
//                 const responseObj = new Response(false, 500, "Server Error", null);
//                 return response.status(500).json(responseObj);
//             }
//             const salary1 = salary-(salary*0.01)
//             const Rsalary = Math.round(salary1)

//             db.query(
//                 "INSERT INTO employees (fname, lname, position, salary, image) VALUES ($1, $2, $3, $4, $5) RETURNING id",
//                 [fname, lname, position, Rsalary ,imageBuffer],
//                 (error, results) => {
//                     if (error) {
//                         console.error("Error adding employee:", error);
//                         const responseObj = new Response(false, 500, "Server Error", null);
//                         return response.status(500).json(responseObj);
//                     }

//                     const newId = results.rows[0].id;
//                     const responseObj = new Response(true, 201, "Employee added successfully", { id: newId });
//                     response.status(201).json(responseObj);
//                 }
//             );
//         }
//     );
// });
// };

const createEmp = (request, response) => {
    const { fname, lname, position, salary } = request.body;
    let imagesBuffer = [];

    if (!fname || !lname || !position || !salary) {
        const responseObj = new Response(false, 400, "All fields are required", null);
        return response.status(400).json(responseObj);
    }

    if(request.files && request.files.length > 1){
        const responseObj = new Response(false, 400, "upload one image", null);
        return response.status(400).json(responseObj);
    }

    if (request.files && request.files.length > 0) {
        imagesBuffer = request.files.map(file => file.buffer);
    } else {
        const defaultImagePath = path.join(__dirname, './defaultImage/defaultImage.jpg');
        imagesBuffer.push(fs.readFileSync(defaultImagePath));
    }

    db.query("SELECT MAX(id) AS max_id FROM employees", (error, results) => {
        if (error) {
            console.error("Error retrieving max id:", error);
            const responseObj = new Response(false, 500, "Server Error", null);
            return response.status(500).json(responseObj);
        }

        const maxId = 0 || results.rows[0].max_id;

        db.query(
            "SELECT setval('employees_id_seq', $1)", 
            [maxId],
            (error) => {
                if (error) {
                    console.error("Error resetting sequence:", error);
                    const responseObj = new Response(false, 500, "Server Error", null);
                    return response.status(500).json(responseObj);
                }
                const salary1 = salary - (salary * 0.01);
                const Rsalary = Math.round(salary1);

                db.query(
                    "INSERT INTO employees (fname, lname, position, salary, image) VALUES ($1, $2, $3, $4, $5) RETURNING id",
                    [fname, lname, position, Rsalary, imagesBuffer[0]], 
                    (error, results) => {
                        if (error) {
                            console.error("Error adding employee:", error);
                            const responseObj = new Response(false, 500, "Server Error", null);
                            return response.status(500).json(responseObj);
                        }

                        const newId = results.rows[0].id;
                        const responseObj = new Response(true, 201, "Employee added successfully", { id: newId });
                        response.status(201).json(responseObj);
                    }
                );
            }
        );
    });
};


    /*db.query(
        "INSERT INTO employees (fname, lname, position, salary) VALUES ($1, $2, $3, $4) RETURNING id",
        [fname, lname, position, salary],
        (error, results) => {
            if (error) {
                console.error("Error adding employee:", error);
                const responseObj = new Response(false, 500, "Server Error", null);
                return response.status(500).json(responseObj);
            }

            const newId = results.rows[0].id;
            const responseObj = new Response(true, 201, "Employee added successfully", { id: newId });
            response.status(201).json(responseObj);
        }
    );*/
/*;*/

// const updateEmp = (request, response) => {
//     const id = request.query.id
//     const { fname, lname, position, salary } = request.body;
//     // const {position,salary} = request.body;
//     // const imageBuffer = request.file.buffer;
//     if (fname && lname && position && salary) {
//         db.query(
//             "UPDATE employees SET fanme = $1, lanme = $2, position = $3, salar = $4 WHERE id = $5",
//             [fname, lname, position, salary-(salary*0.01), id],
//             (error, results) => {
//                 if (error) {
//                     console.error("Error updating employee:", error);
//                     const responseObj = new Response(false, 500, "Server Error", null);
//                     return response.status(500).json(responseObj);
//                 }
    
//                 if (results.rowCount === 0) {
//                     const responseObj = new Response(false, 404, "Employee not found", null);
//                     return response.status(404).json(responseObj);
//                 }
    
//                 const responseObj = new Response(true, 200, "Employee updated successfully", null);
//                 response.status(200).json(responseObj);
//             }
//         );
//     }
//     else if(position && salary){
//     db.query(
//         "UPDATE employees SET position = $1, salary = $2 WHERE id = $3",
//         [position, salary-(salary*0.01), id],
//         (error, results) => {
//             if (error) {
//                 console.error("Error updating employee Position and salary:", error);
//                 const responseObj = new Response(false, 500, "Server Error", null);
//                 return response.status(500).json(responseObj);
//             }

//             if (results.rowCount === 0) {
//                 const responseObj = new Response(false, 404, "Employee not found", null);
//                 return response.status(404).json(responseObj);
//             }

//             const responseObj = new Response(true, 200, "Employee updated successfully", null);
//             response.status(200).json(responseObj);
//         }
//     );}
//     else if (position){
//         db.query("UPDATE employees SET position = $1 WHERE id = $2",
//             [position,id],(error, results) =>{
//                 if(error){
//                     console.error("Error updating employee Position",error);
//                     const responseObj = new Response(false, 500, "Server Error", null);
//                     return response.status(500).json(responseObj);
//                 }
//                 if (results.rowCount === 0) {
//                     const responseObj = new Response(false, 404, "Employee not found", null);
//                     return response.status(404).json(responseObj);
//                 }
                
//                 const responseObj = new Response(true, 200, "Employee updated successfully", null);
//                 response.status(200).json(responseObj);
//             }

//         )
//     }
//     else if(salary){
//         db.query("UPDATE employees SET salary = $1 WHERE id = $2",
//             [salary-(salary*0.01),id],(error, results) =>{
//                 if(error){
//                     console.error("Error updating employee salary",error);
//                     const responseObj = new Response(false, 500, "Server Error", null);
//                     return response.status(500).json(responseObj);
//                 }
//                 if (results.rowCount === 0) {
//                     const responseObj = new Response(false, 404, "Employee not found", null);
//                     return response.status(404).json(responseObj);
//                 }
                
//                 const responseObj = new Response(true, 200, "Employee updated successfully", null);
//                 response.status(200).json(responseObj);
//             }

//         )
//     }
// };

// const updateEmp = (request, response) => {
//     const { id } = request.query; 
//     const { fname, lname, position, salary } = request.body; 
//     const imageBuffer = request.file ? request.file.buffer : null; 

//     if (!id) {
//         const responseObj = new Response(false, 400, "Employee ID is required", null);
//         return response.status(400).json(responseObj);
//     }

//     const fields = [];
//     const values = [];
//     let valueIndex = 1;

//     if (fname) {
//         fields.push(`fname = $${valueIndex++}`);
//         values.push(fname);
//     }
//     if (lname) {
//         fields.push(`lname = $${valueIndex++}`);
//         values.push(lname);
//     }
//     if (position) {
//         fields.push(`position = $${valueIndex++}`);
//         values.push(position);
//     }
//     if (salary) {
//         const salary1 = salary - (salary * 0.01);
//         const Rsalary = Math.round(salary1);
//         fields.push(`salary = $${valueIndex++}`);
//         values.push(Rsalary);
//     }
//     if (imageBuffer) {
//         fields.push(`image = $${valueIndex++}`);
//         values.push(imageBuffer);
//     }

//     if (fields.length === 0) {
//         const responseObj = new Response(false, 400, "No fields to update", null);
//         return response.status(400).json(responseObj);
//     }

//     const updateQuery = `
//         UPDATE employees
//         SET ${fields.join(", ")}
//         WHERE id = $${valueIndex}
//         RETURNING id
//     `;
//     values.push(id);

//     db.query(updateQuery, values, (error, results) => {
//         if (error) {
//             console.error("Error updating employee:", error);
//             const responseObj = new Response(false, 500, "Server Error", null);
//             return response.status(500).json(responseObj);
//         }

//         if (results.rowCount === 0) {
//             const responseObj = new Response(false, 404, "Employee not found", null);
//             return response.status(404).json(responseObj);
//         }

//         const responseObj = new Response(true, 200, "Employee updated successfully", { id });
//         response.status(200).json(responseObj);
//     });
// };

const updateEmp = (request, response) => {
    const { id } = request.query; 
    const { fname, lname, position, salary } = request.body; 
    const imagesBuffer = request.files && request.files.length > 0 
        ? request.files.map(file => file.buffer) 
        : null;

    if (!id) {
        const responseObj = new Response(false, 400, "Employee ID is required", null);
        return response.status(400).json(responseObj);
    }

    const fields = [];
    const values = [];
    let valueIndex = 1;

    if (fname) {
        fields.push(`fname = $${valueIndex++}`);
        values.push(fname);
    }
    if (lname) {
        fields.push(`lname = $${valueIndex++}`);
        values.push(lname);
    }
    if (position) {
        fields.push(`position = $${valueIndex++}`);
        values.push(position);
    }
    if (salary) {
        const salary1 = salary - (salary * 0.01);
        const Rsalary = Math.round(salary1);
        fields.push(`salary = $${valueIndex++}`);
        values.push(Rsalary);
    }
    if(request.files && request.files.length > 1){
        const responseObj = new Response(false, 400, "upload one image", null);
        return response.status(400).json(responseObj);
    }

    if (imagesBuffer && imagesBuffer.length > 0) {
        fields.push(`image = $${valueIndex++}`);
        values.push(imagesBuffer[0]);
    }

    if (fields.length === 0) {
        const responseObj = new Response(false, 400, "No fields to update", null);
        return response.status(400).json(responseObj);
    }

    const updateQuery = `
        UPDATE employees
        SET ${fields.join(", ")}
        WHERE id = $${valueIndex}
        RETURNING id
    `;
    values.push(id);

    db.query(updateQuery, values, (error, results) => {
        if (error) {
            console.error("Error updating employee:", error);
            const responseObj = new Response(false, 500, "Server Error", null);
            return response.status(500).json(responseObj);
        }

        if (results.rowCount === 0) {
            const responseObj = new Response(false, 404, "Employee not found", null);
            return response.status(404).json(responseObj);
        }

        const responseObj = new Response(true, 200, "Employee updated successfully", { id });
        response.status(200).json(responseObj);
    });
};


const deleteEmp = (request, response) => {
    const id = request.query.id

    db.query("DELETE FROM employees WHERE id = $1", [id], (error, results) => {
        if (error) {
            console.error("Error deleting employee:", error);
            const responseObj = new Response(false, 500, "Server Error", null);
            return response.status(500).json(responseObj);
        }

        if (results.rowCount === 0) {
            const responseObj = new Response(false, 404, "Employee not found", null);
            return response.status(404).json(responseObj);
        }
        
        db.query(
            `WITH reordered AS (
                SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id
                FROM employees
            )
            UPDATE employees
            SET id = reordered.new_id
            FROM reordered
            WHERE employees.id = reordered.id;`,
            (reorderError) => {
                if (reorderError) {
                    console.error("Error reordering IDs:", reorderError);
                    const responseObj = new Response(false, 500, "Error reordering IDs", null);
                    return response.status(500).json(responseObj);
                }

                const responseObj = new Response(true, 200, "Employee deleted and IDs reordered successfully", null);
                response.status(200).json(responseObj);
            }
        );
    });
};

module.exports = {
    //getEmp,
    getEmpById,
    createEmp,
    updateEmp,
    deleteEmp,
};
