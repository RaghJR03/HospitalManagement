var pool=require("./connection");
const express=require('express');
const app=express();
const port=3000;
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }))
const path=require('path');
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static("public"));




app.get("/", (req, res) => {
  const pid = req.query.pid;
  const email = req.query.email;
  const password = req.query.password;
  const sname = req.query.sname;

  // Now you have the user data and can render the home page with this data
  res.render("home", { pid: pid, email: email, password: password, sname: sname });
});

app.post("/register", (req, res) => {
  const sname = req.body.sname;
  const email = req.body.email;

  const password = req.body.password;
  const cnfpassword = req.body.cnfpassword;

  if (cnfpassword === password) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting connection from pool:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      const checkUniqueQuery = "SELECT COUNT(*) AS count FROM Patient WHERE  Email = ?";
      connection.query(checkUniqueQuery, [email], (queryErr, result) => {
        if (queryErr) {
          console.error(queryErr);
          connection.release();
          return res.status(500).json({ error: 'Query error' });
        }

        const uniqueCount = result[0].count;
        if (uniqueCount > 0) {
          
          connection.release();
          console.log("PID or email already exists");
          return res.render("register", { log: "1" });
        } else {
          // Insert user data into the database
          const insertQuery = "INSERT INTO Patient (Name, Email, password) VALUES (?, ?, ?)";
          connection.query(insertQuery, [sname, email, password], (insertErr) => {
            
            if (insertErr) {
              console.error(insertErr);
              return res.status(500).json({ error: 'Insertion error' });
            }
            const pidquery="Select pid from Patient where Email = ?" 
            connection.query(pidquery,[email],(err,result)=>{
            connection.release();
              if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Insertion error' });
              }
             const pid=result[0].pid;
              res.render("home", { sname: sname, email: email, pid: pid, password: password, log: "1" });
            })
          });
        }
      });
    });
  } else {
    console.log("Password confirmation doesn't match");
    res.render("register", { log: "0" });
  }
});

app.get("/register",(req, res) => {
  res.render('register');
  })
    
app.get('/contact', (req, res) => {
    res.render('contact');
    });

app.get('/login', (req, res) => {
      res.render('login');
 });

 app.post("/login", (req, res) => {
    const sname = req.body.sname;   // Assuming sname is coming from a text input
    const email = req.body.email;   // Assuming email is coming from a text input
 
    const password = req.body.password; // Assuming password is coming from a password input
  
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting connection from pool:', err);
        return res.status(500).json({ error: 'Database error' });
      }
  
      const sql = "SELECT * FROM Patient WHERE email = ?";
      connection.query(sql, [email], function (error, result) {
        connection.release();
  
        if (error) {
          console.error(error);
          return res.status(500).json({ error: 'Query error' });
        } else {
          if (result.length === 0) {
             res.render("login",{log:"0"});
          }
       else
       {   
            const user = result[0];
            const pid=user.pid;
          if (
            user.Name === sname &&
            user.Email === email &&
            user.password === password
          ) {
            res.render("home",{sname:sname,email:email,pid:pid,password:password,log:"1"});
          } else {
            
            res.render("login",{log:"0"});
          }
       }
        
        }
      });
    });
  });
  
  
 


  
 app.get('/logout', (req, res) => {
    res.render('logout');
});



 
app.get("/appointments", (req, res) => {
  const pid = req.query.pid;
  const email = req.query.email;
  const password = req.query.password;
  const sname = req.query.sname;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Fetch doctor data from the database
    const fetchDoctorsQuery = "SELECT * FROM docter";
    connection.query(fetchDoctorsQuery, (doctorsQueryErr,doc) => {
      if (doctorsQueryErr) {
        console.error(doctorsQueryErr);
        connection.release();
        return res.status(500).json({ error: 'Query error' });
      }
  
      
      const fetchAppointmentsQuery = "select Dname,Date from docter inner join appointment on appointment.did=docter.did where pid=?";
    
    connection.query(fetchAppointmentsQuery, [pid], (appointmentsQueryErr, appointments) => {
      if (appointmentsQueryErr) {
        console.error(appointmentsQueryErr);
        connection.release();
        return res.status(500).json({ error: 'Query error' });
      }

        
        connection.release();

        
        res.render("appointments", {
          pid: pid,
          email: email,
          password: password,
          sname: sname,
          doctors: doc,
          appointments: appointments
        });
        console.log(appointments)
      });
    });
  });
});



  

  app.post("/book-appointment", (req, res) => {
    const customerPid = req.body.customerPid; // Get customer's pid from the form submission
    const selectedDoctor = req.body.doctor;
    const appointmentDate = req.body.appointmentDate;
  
   
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting connection from pool:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
    // Fetch user details from the database based on customer's pid
    const getUserDetailsQuery = "SELECT * FROM patient WHERE pid = ?";
   connection.query(getUserDetailsQuery, [customerPid], (fetchErr, userDetails) => {
      if (fetchErr) {
        console.error(fetchErr);
        return res.status(500).json({ error: 'Error fetching user details' });
      }
      
      // Insert the new appointment into the database
      const insertAppointmentQuery = "INSERT INTO Appointment (pid, did, Date) VALUES (?, ?, ?)";
    connection.query(insertAppointmentQuery, [customerPid, selectedDoctor, appointmentDate], (insertErr) => {
      if (insertErr) {
        console.error(insertErr);
        return res.status(500).json({ error: 'Insertion error' });
      }
        // Redirect back to the appointments page with user details
        res.redirect("/appointments?pid=" + customerPid + "&email=" + userDetails[0].Email + "&password=" + userDetails[0].password + "&sname=" + userDetails[0].Name );
      });
    });
  });
});
     

app.post("/cancel",(req,res)=>{
  const docname=req.body.Dname;
  const appointmentDate = new Date(req.body.appointmentDate);
  const customerPid = req.body.pid; 
 


  pool.getConnection((err,connection)=>{
    if (err) {
      console.error('Error getting connection from pool:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    else{
    const delq="delete from appointment where pid=? and Date=? and did=(select did from docter where Dname=?)";
    connection.query(delq,[customerPid,appointmentDate,docname],(insertErr,del)=>{
      if (insertErr) {
        console.error(insertErr);
        return res.status(500).json({ error: 'Insertion error' });
      }
    })
    const getUserDetailsQuery = "SELECT * FROM patient WHERE pid = ?";
   connection.query(getUserDetailsQuery, [customerPid], (fetchErr, userDetails) => {
      if (fetchErr) {
        console.error(fetchErr);
        return res.status(500).json({ error: 'Error fetching user details' });
      }
      connection.release();
      res.redirect("/appointments?pid=" + customerPid + "&email=" + userDetails[0].Email + "&password=" + userDetails[0].password + "&sname=" + userDetails[0].Name );

    });
  }
});
});

app.listen(port,()=>{
    console.log(`server running on port ${port}`);
})