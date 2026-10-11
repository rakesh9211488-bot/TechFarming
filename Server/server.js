//Declaring all the dependencies use in the server side
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const fs = require('fs');

const { loadLocalEnvironment, readConfig } = require('./Config/runtime');
loadLocalEnvironment();
const config = readConfig();
const app = express();
const port = config.port;
const saltRounds = 10;
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

//products uploading routes
app.get('/api/upload-new-products', (req, res) => {
  res.sendFile(__dirname + '/ProductsPage/ProductsEntryForm.html');
});

app.post('/add-product', (req, res) => {
  const newProduct = req.body;
  const products = JSON.parse(fs.readFileSync('Products.json'));
  products.products.push(newProduct);
  fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
  res.redirect('/api/upload-new-products');
});

app.post('/classify-image', (req, res) => {
  // Receive image data from the request body
  const image = req.body.imageData;

  // Call the Python script
  const pythonProcess = spawn('python', ['../Python/ImageProcessing.py', image]);

  // Process the output from the Python script
  pythonProcess.stdout.on('data', (data) => {
    const result = JSON.parse(data);

    // Send the result back to the frontend
    res.json(result);
  });
});

//Generating connection between server and Database
const dbUser = mysql.createConnection({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.users,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

//Checking for safe connections between and if any errors
//Occurred while connecting to MySQL & Server side
dbUser.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Account collections remain disabled until authenticated authorization exists.
// Never expose password hashes or seller contact records through public routes.
app.get(['/api/users', '/api/sellers'], (req, res) => {
  res.status(403).json({ error: 'Account listing is unavailable.' });
});

//Getting user sign up details
//Only for user sign up not seller
app.post('/api/users/signup', async (req, res) => {
  const { name, email, dob, gender, password } = req.body;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    const sql = 'INSERT INTO user_sign_up (Name, Email, Date_of_Birth , Gender, Password) VALUES (?, ?, ?, ?, ?)';
    const values = [name, email, dob, gender, hash];

    dbUser.query(sql, values, (err, results) => {
      if (err) {
        console.error('Error inserting user data into database:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      console.log('User data inserted into the database:', results);
      res.status(201).json({ message: 'Signup successful' });
    });
  });

})

//Getting seller sign up details
app.post('/api/sellers/signup', async (req, res) => {
  const { name, companyName, phoneNumber, website, email, productCategory, logo, address } = req.body;

  const sql = 'INSERT INTO seller_sign_up ( Name, Company_Name, Logo, Website, Product_category, Email, Phone_Number, Address) VAlUES (?,?,?,?,?,?,?,?)';
  const values = [name, companyName, logo, website, productCategory, email, phoneNumber, address];

  const companyID = generateRandomCode();
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  dbUser.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error inserting user data into database:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    console.log('User data inserted into the database:', results);
    res.status(201).json({ message: 'Signup successful', companyID });
  });
})

//random code generation
function generateRandomCode() {
  const prefixes = ['#', '@', '&', '*'];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return randomPrefix + randomNumber.toString();
}


app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  // Query the database to retrieve the hashed password for the provided email
  const sql = 'SELECT Password FROM user_sign_up WHERE Email = ?';
  dbUser.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error fetching user data from database:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (results.length === 0) {
      // No user found with the provided email
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const hashedPassword = results[0].Password;

    // Compare the provided password with the stored hashed password
    bcrypt.compare(password, hashedPassword, (bcryptErr, bcryptRes) => {
      if (bcryptErr || !bcryptRes) {
        // Passwords don't match
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Passwords match, user is authenticated
      res.json({ message: 'Login successful' });
    });
  });
});

//Generating jobs list from database 
const dbJobs = mysql.createConnection({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.jobs,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

//checking if job database is available
dbJobs.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
});

//collecting job information from database
app.get('/api/job', (req, res) => {
  dbJobs.query('SELECT * FROM jods_list', (err, results) => {
    if (err) {
      console.error('Error fetching jobs:', err);
      res.status(500).json({ error: 'Error while fetching the job Details' });
      return;
    }
    res.json(results);
  });
});

//adding new job to the database of the job list
// API endpoint for adding a new job opening
app.post('/api/job/add', (req, res) => {
  const { category, title, location, span, description, requirements, additionalInfo } = req.body;

  // Validate the input
  if (!title || !location || !description || !span || !applyLink || !applyLinkText || !department) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Insert the new job opening into the database
  const sql = 'INSERT INTO jods_list (Job_category, Job_title, Job_location, Job_span, Job_description, Job_requirements, Job_additionInfo) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [category, title, location, span, description, requirements, additionalInfo];

  dbJobs.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error inserting job opening into the database:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.status(201).json({ message: 'Job opening added successfully' });
  });
});

// HTML form to add a new job opening
app.get('/api/add-job', (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <style>
    body {
      background-color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
  
    body form {
      border: 1px solid #2e1e58;
      padding: 30px 20px;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    body form .form-item{
      display: flex;
      flex-direction: column;
    }
  
    body form .form-item input[type="text"], input[type="date"], select{
      height: 27px;
      border:1px solid #2e1e58;
    }

    body form .form-item input:focus, select:focus, textarea{
      border: 1px solid #00ff00;
      outline:none;
    }

    body form .form-item textarea{
      border:1px solid #2e1e58;
    }
  
    body form .line{
      display: flex;
      gap: 7px;
    }
  </style>
  
  <body>
    <h2>Add New Job Opening</h2>
    <form action="/api/job/add" method="POST">
      <div class="form-item">
        <label for="job-category">Select Category</label>
        <select name="" id="">
          <option value="select">--Select--</option>
          <option value="software">Software Department</option>
          <option value="hardware">Hardware Department</option>
          <option value="ml">Machine Learning Department</option>
          <option value="ai">Artificial Intelligence Department </option>
          <option value="marketing">Marketing Department</option>
          <option value="embedded">Embedded & Data Department</option>
          <option value="designer">Designer Department</option>
        </select>
      </div>
      <div class="form-item">
        <label for="job-title">Job Title</label>
        <input type="text" title="Enter the job title">
      </div>
      <div class="line">
        <div class="form-item">
          <label for="job-location">Job Location</label>
          <input type="text" title="Enter the job location">
        </div>
        <div class="form-item">
          <label for="job-span">Job Opening</label>
          <input type="date" name="" id="" title="Enter the job opening date">
        </div>
      </div>
      <div class="form-item">
        <label for="job-description">Job Description</label>
        <textarea name="" id="" cols="30" rows="5"></textarea>
      </div>
      <div class="form-item job-requirement">
        <label for="job-requirement">Job Requirement</label>
        <input type="text" name="skills[]" id="" title="Enter the job requiring skills">
        <button type="button" id="addRequirement">Add Skill</button>
        <ul id="displaySkills"></ul>
      </div>
      <div class="form-item">
        <label for="job-additional-info">Additional Info</label>
        <textarea name="" id="" cols="30" rows="5"></textarea>
      </div>
      <input type="submit" value="Add Job Opening">
    </form>
  </body>
  <script>
    document.getElementById('addRequirement').addEventListener('click', function () {
      const skillInput = document.querySelector('.form-item.job-requirement input[name="skills[]"]');
      const skillValue = skillInput.value;
  
      if (skillValue) {
        const displaySkillsList = document.getElementById('displaySkills');
        const skillItem = document.createElement('li');
        skillItem.textContent =  skillValue ;
        displaySkillsList.appendChild(skillItem);
  
        // Clear the input field
        skillInput.value = '';
      }
    });
  </script>
  </html>
  
  `);
});


//checking the port number of the server
//Returning the port number
app.listen(port, config.host, () => {
  console.log(`Server is running on port ${port}`);
});
