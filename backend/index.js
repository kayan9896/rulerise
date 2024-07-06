require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(session({
  secret: 'your-secret-key', //replace 'your-secret-key' with a secure random string
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000, secure: false } // 1 hour, adjust as needed
}));

app.use(express.json());
app.use(cors());
app.use(passport.initialize());


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB', err));

const User = require('./users');
require('./passport')(passport);

// Create a new user
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ email, password });
    await user.save();

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token }); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Login route
app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
  // Generate and sign a JWT token
  const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  console.log(req.user.id);
  console.log(token)
  res.json({ token });
});

// Logout route 
app.get('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Logged out successfully' });
});

const Task = require('./task');
const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Expecting 'Bearer <token>'
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  console.log(token);
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = { id: decoded.id }; // Set the user id in the request
    next();
  });
};



// Get all tasks for the currently authenticated user
app.get('/tasks', isAuthenticated, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json({ tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get a single task by Id
app.get('/tasks/:id', isAuthenticated, getTask, (req, res) => {
  res.json({ task: res.task });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

app.post('/tasks', isAuthenticated, async (req, res) => {
  const { description } = req.body;
  const userId = req.user.id;

  try {
    const task = new Task({ description, user: userId });
    await task.save();
    broadcast({ type: 'ADD_TASK', task });
    res.status(201).json({ task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.delete('/tasks/:id', isAuthenticated, getTask, async (req, res) => {
  await res.task.remove();
  broadcast({ type: 'DELETE_TASK', taskId: req.params.id });
  res.json({ message: 'Deleted Task' });
});

app.put('/tasks/:id', isAuthenticated, getTask, async (req, res) => {
  const updates = Object.keys(req.body);
  updates.forEach((key) => {
    res.task[key] = req.body[key];
  });
  await res.task.save();
  broadcast({ type: 'UPDATE_TASK', task: res.task });
  res.json({ task: res.task });
});
// Middleware to fetch task by id - used in task update and delete routes
async function getTask(req, res, next) {
  let task;
  try {
    task = await Task.findById(req.params.id);
    if (task == null) {
      return res.status(404).json({ message: 'Cannot find task' });
    }
    // Check if the task belongs to the authenticated user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' });
  }
  res.task = task;
  next();
}

const Project = require('./project');

// Create a new Project
app.post('/projects', isAuthenticated, async (req, res) => {  
 const { name, description } = req.body;
 const userId = req.user.id;

 try {
   const project = new Project({ name, description, user: userId });
   await project.save();
   res.status(201).json({ project });
 } catch (error) {
   console.error(error);
   res.status(500).json({ message: 'Server Error' });
 }
});

// Get all projects for the currently authenticated user
app.get('/projects', isAuthenticated, async (req, res) => { 
 try {
   const projects = await Project.find({ user: req.user.id });
   res.json({ projects });
 } catch (error) {
   console.error(error); 
   res.status(500).json({ message: 'Server Error' });
 }
});

// Get a single project by Id
app.get('/projects/:id', isAuthenticated, getProject, (req, res) => { 
  res.json({ project: res.project });
});

// Update a project
app.put('/projects/:id', isAuthenticated, getProject, async (req, res) => {  
   const updates = Object.keys(req.body);
   updates.forEach((key) => {
     res.project[key] = req.body[key];
   });
   await res.project.save();
   res.json({ project: res.project });
});

// Delete a project
app.delete('/projects/:id', isAuthenticated, getProject, async (req, res) => {   
   await res.project.remove();
   res.json({ message: 'Deleted Project' });   
});

// Middleware to fetch project by id
async function getProject(req, res, next) {  
  let project;
  try {
    project = await Project.findById(req.params.id);
    if (project == null) {  
        return res.status(404).json({ message: 'Cannot find project' });
    }
    // Check if the project belongs to the authenticated user
    if (project.user.toString() !== req.user.id) { 
        return res.status(401).json({ message: 'Not authorized' });    
    }
  } catch (error) {  
    return res.status(500).json({ message: 'Server Error' }); 
  }  
  res.project = project;
  next();  
} 


app.listen(PORT, () => console.log(`Server started on port ${PORT}`));