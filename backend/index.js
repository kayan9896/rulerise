require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const passportLocal = require('./passport');
const session = require('express-session');
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

  res.json({ token });
});

// Logout route 
app.get('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Logged out successfully' });
});

const Task = require('./task');

// Create a new task
app.post('/tasks', async (req, res) => {
  const { description } = req.body;
  const userId = req.user.id; // Assuming 'req.user' is populated by passport

  try {
    const task = new Task({ description, user: userId });
    await task.save();
    res.status(201).json({ task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all tasks for the currently authenticated user
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json({ tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get a single task by Id
app.get('/tasks/:id', getTask, (req, res) => {
  res.json({ task: res.task });
});

// Update a task
app.put('/tasks/:id', getTask, async (req, res) => {
  // Only update fields that are sent in the request body
  const updates = Object.keys(req.body);
  updates.forEach((key) => {
    res.task[key] = req.body[key];
  });
  await res.task.save();
  res.json({ task: res.task });
});

// Delete a task
app.delete('/tasks/:id', getTask, async (req, res) => {
  await res.task.remove();
  res.json({ message: 'Deleted Task' });
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

const server = require('http').Server(app);
const io = require('socket.io')(server);

// Socket.io configuration
io.on('connection', (socket) => {
    console.log('New user connected');
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    
});
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));