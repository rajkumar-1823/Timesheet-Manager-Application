const express = require('express');
const connectDB = require('./Database/db');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const jwt = require('jsonwebtoken');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.json());

// ========================== Models ==========================
// User model
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  phone: String,
  department: String,
  businessUnit: String,
  spendHour: Number,
  completedTask: Number,
  completedDate: Date,
  role: { type: String, default: 'user' },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'  
  }]
});
  
const User = mongoose.model('User', userSchema);

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  clientName: { type: String, required: true },
  address: { type: String, required: true },
  department: { type: String, required: true },
  businessUnit: { type: String, required: true },
  projectType: { type: String, required: true },
  tasks: [
    {
      taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true }, 
      taskHour: { type: Number, required: true }, 
    },
  ], 
  users: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
  ], 
});


const Project = mongoose.model('Project', projectSchema);

//Task Model
const taskSchema = new mongoose.Schema({
  taskName: { type: String, required: true },
  taskHour: { type: Number, required: true },
  spentHour: { type: Number, required: true, default: 0 },
  taskAssigned: { type: [String], required: true, default: [] },
  taskStatus: { type: String, default: "Pending", 
    enum: ["Pending", "In Progress", "Completed"]  },
});

const Task = mongoose.model("Task", taskSchema);

//TimeLog Model
const timelogSchema = new mongoose.Schema({
  Date: { type: Date, required: true },
  projectName: { type: String, required: true },
  taskName: { type: String, required: true },
  spentHour: { type: Number, required: true },
  taskStatus: { type: String, required: true, enum: ['Pending', 'In Progress', 'Completed'] },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  
    required: true,  
  },
});

const Timelog = mongoose.model('Timelog', timelogSchema);


// ========================== Middleware ==========================
// Middleware to verify JWT tokens and enforce role-based access control

const verifyToken = (roles) => (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'G9iwh*3hd!!a9$X12k38QwnfJsd@9hkX'); // Use the same secret key

    if (!roles.includes(decoded.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

app.get('/api/admin', verifyToken(['admin']), (req, res) => {
  res.status(200).json({ message: `Welcome Admin!`, user: req.user });
});

app.get('/api/user', verifyToken(['user', 'admin']), (req, res) => {
  res.status(200).json({ message: `Welcome User!`, user: req.user });
});

app.post('/api/auth/validate', (req, res) => {
  const { token } = req.body;

  try {
      const decoded = jwt.verify(token, 'yourSecretKey');
      res.status(200).json({ valid: true, role: decoded.role });
  } catch (err) {
      console.error('Token validation failed:', err);
      res.status(401).json({ valid: false, message: 'Invalid or expired token.' });
  }
});


app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Wrong credentials.' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Wrong credentials.' });
    }

    const token = jwt.sign(
      { username: user.username, role: user.role, id: user._id },  
      'yourSecretKey',  
      { expiresIn: '1h' }
    );


    const responseData = {
      message: 'Login successful.',
      token,
      role: user.role,
    };


    if (user.role === 'user') {
      responseData.userId = user._id;
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// ========================== Routes ==========================
// Route to User
app.post('/api/users', async (req, res) => {
    try {
      const user = new User(req.body);
      const savedUser = await user.save();
      res.status(201).json(savedUser);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

 
app.get('/api/users', async (req, res) => {
  try {
    const { search, department, businessUnit } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (department) {
      filter.department = { $regex: department, $options: 'i' };
    }
    if (businessUnit) {
      filter.businessUnit = { $regex: businessUnit, $options: 'i' };
    }

    const users = await User.find(filter);
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

  
  app.delete('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
  
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
  
    try {

      const projectsUpdated = await Project.updateMany(
        { userId: userId },  
        { $pull: { userId: userId }  }  
      );

      if (projectsUpdated.nModified === 0) {
        return res.status(404).json({ message: 'User not found in any projects' });
      }

      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'User and user assignments removed successfully' });
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).json({ message: 'Error deleting user' });
    }
  });
  
  
  
  app.get('/api/users/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/users/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const updatedData = req.body;
  

      const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });



  // ========================== Routes to Project ==========================

  app.post('/api/projects/:projectId/addUser', async (req, res) => {
    const { projectId } = req.params;
    const { userId } = req.body;  
  
    try {

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
 
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (project.users.some((user) => user.userId.toString() === userId)) {
        return res.status(400).json({ message: 'User is already added to the project' });
      }

      project.users.push({ userId });
      await project.save();

      user.projects.push(projectId);
      await user.save();
  
      res.status(200).json({ message: 'User added to project successfully', project });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

  app.get('/api/projects/user/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {

      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const projects = await Project.find({ '_id': { $in: user.projects } });
  
      if (projects.length === 0) {
        return res.status(404).json({ message: 'No projects found for this user' });
      }

      res.status(200).json(projects);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching projects' });
    }
  });


app.put('/api/users/:userId/updateCompletedTasks', async (req, res) => {
  try {
    const { increment } = req.body;  
    const user = await User.findById(req.params.userId);
    
    if (user) {
      user.completedTask += increment; 
      user.completedDate = new Date();
      await user.save();
      res.status(200).send(user);
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).send({ message: "Error updating user" });
  }
});


app.post('/api/projects', async (req, res) => {
  try {
    const project = new Project(req.body);
    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.get('/api/projects', async (req, res) => {
  try {
    const { search, department, businessUnit } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { projectName: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }
    if (department) {
      filter.department = { $regex: department, $options: 'i' };
    }
    if (businessUnit) {
      filter.businessUnit = { $regex: businessUnit, $options: 'i' };
    }
 
    const projects = await Project.find(filter)
      .populate('tasks.taskId', 'taskName')  
      .populate('users.userId', 'username') 

    res.status(200).json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.delete('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting project' });
  }
});

app.get('/api/projects/:projectId', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.put('/api/projects/:projectId', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const updatedData = req.body;

    const updatedProject = await Project.findByIdAndUpdate(projectId, updatedData, { new: true });

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/api/projects/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;

    const projectToDuplicate = await Project.findById(id);

    if (!projectToDuplicate) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const duplicatedProject = new Project({
      projectName: `${projectToDuplicate.projectName} (Copy)`,
      clientName: projectToDuplicate.clientName,
      address: projectToDuplicate.address,
      department: projectToDuplicate.department,
      businessUnit: projectToDuplicate.businessUnit,
      projectType: projectToDuplicate.projectType,
      tasks: projectToDuplicate.tasks.map(task => ({
        taskId: task.taskId,
        taskHour: task.taskHour,
      })),
      users: projectToDuplicate.users.map(user => ({
        userId: user.userId,
      })),
    });
    

    const savedProject = await duplicatedProject.save();

    res.status(201).json(savedProject);
  } catch (error) {
    console.error('Error duplicating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/api/projects/add-user/:projectId/:userId', async (req, res) => {
  const { projectId, userId } = req.params; 
  try {

    const project = await Project.findByIdAndUpdate(
      projectId, 
      { $push: { users: { userId } } }, 
      { new: true, runValidators: true } 
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error('Error adding user to project:', error);
    res.status(500).json({ error: 'Error adding user to project' });
  }
});


// ========================== Routes to Task ==========================

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { taskName, taskHour } = req.body;
  const newTask = new Task({ taskName, taskHour });

  try {
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/tasks/:taskId', async (req, res) => {
  try {
    const taskId = req.params.taskId;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    await Project.updateMany(
      { taskId: taskId },  
      { $pull: { taskId: taskId } }  
    );

    await Task.findByIdAndDelete(taskId);

    res.status(200).json({ message: 'Task and associated project task reference deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error('Error fetching task', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});


app.put('/api/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params; 
  const { taskStatus } = req.body; 

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({ message: 'Invalid Task ID' });
  }

  try {

    const updatedTask = await Task.findByIdAndUpdate(taskId, { taskStatus }, { new: true });

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task status', error });
  }
});


app.get('/api/project-tasks', async (req, res) => {
  try {
    const { projectId } = req.query; 
    if (!projectId) {
      return res.status(400).json({ message: 'No project ID provided' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const taskIds = project.tasks.map(task => task.taskId); 

    if (taskIds.length > 0) {
      const tasks = await Task.find({ _id: { $in: taskIds } }); 
      res.json(tasks); 
    } else {
      res.status(404).json({ message: 'No tasks available for this project' });
    }
  } catch (err) {
    console.error('Error fetching tasks:', err.message);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});




app.get('/api/pages', async (req, res) => {
  try {

    const taskName = req.query.search; 

    const filter = {};

    if (taskName) {
      filter.taskName = { $regex: taskName, $options: 'i' };  
    }

    const tasks = await Task.find(filter);  

    res.json(tasks);  
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).send('Error fetching pages');
  }
});


app.post('/api/projects/:projectId/addTask', async (req, res) => {
  const { projectId } = req.params;
  const { taskId, taskHour } = req.body;

  try {

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.taskAssigned.length > 0) {
      return res.status(400).json({ message: 'Task is already assigned to another project' });
    }

    if (project.tasks.some((task) => task.taskId.toString() === taskId)) {
      return res.status(400).json({ message: 'Task is already added to this project' });
    }

    project.tasks.push({ taskId, taskHour });

    task.taskAssigned.push(project.projectName);
    await task.save();

    await project.save();

    res.status(200).json({ message: 'Task added to project successfully', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// ========================== Routes to TimeLog ==========================

app.post('/api/logs', async (req, res) => {
  try {
    const logs = new Timelog(req.body);
    const savedlogs = await logs.save();
    res.status(201).json({ message: 'Log entry added successfully', savedlogs });
  } catch (err) {
    res.status(500).json({ message: 'Error adding log entry', error: err });
  }
});



app.get('/api/logs', async (req, res) => {
  try {
    const logs = await Timelog.find();
    const formattedLogs = logs.map(log => {
      log.Date = new Date(log.Date).toLocaleDateString('en-IN');
      return log;
    });
    res.status(200).json(formattedLogs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching logs', error: err });
  }
});


app.get('/api/projects/:projectId', async (req, res) => {
  try {

    const project = await Project.findById(req.params.projectId)
      .populate('tasks.taskId');  

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = project.tasks.map(task => task.taskId); 
    res.status(200).json({ projectName: project.projectName, tasks: tasks });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching project data', error });
  }
})

app.put('/api/logs/:logId', async (req, res) => {
  const { logId } = req.params;
  const { spentHour, taskStatus } = req.body;

  try {

    const log = await Timelog.findById(logId);
    if (!log) {
      return res.status(404).json({ error: 'Log entry not found' });
    }

    const task = await Task.findOne({ taskName: log.taskName });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.spentHour = spentHour;
    log.spentHour = spentHour;


    if (taskStatus) {
      log.taskStatus = taskStatus;
      task.taskStatus = taskStatus;  
    }

    await task.save();
    await log.save();

    res.status(200).json({
      message: 'Spent hours and task status successfully updated in Task and Timelog.',
      log,
      task,
    });
  } catch (error) {
    console.error('Error updating log or task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/api/logs/user/:userId', async (req, res) => {
  const { userId } = req.params;  

  try {
    
    const logs = await Timelog.find({ user: userId });

    if (!logs) {
      return res.status(404).json({ message: 'No logs found for this user.' });
    }

    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// ========================== Graph ==========================

app.get('/api/projects/graph/hours', async (req, res) => {
  try {

    const projects = await Project.find().populate('tasks.taskId');

    const projectsWithDetails = projects.map((project) => ({
      projectName: project.projectName,
      tasks: project.tasks
        .filter((task) => task.taskId) 
        .map((task) => ({
          taskName: task.taskId.taskName,
          taskHour: task.taskHour || 0,
          spentHour: task.taskId.spentHour || 0, 
          taskStatus: task.taskId.taskStatus,
        })),
    }));


    res.status(200).json(projectsWithDetails);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/project/status', async (req, res) => {
  try {
    console.log('Fetching project statuses...'); 

    const projects = await Project.find().populate({
      path: 'tasks.taskId',
      model: 'Task'
    });


    const businessUnitStatusMap = {};

    projects.forEach((project) => {
      if (!businessUnitStatusMap[project.businessUnit]) {
        businessUnitStatusMap[project.businessUnit] = {
          businessUnit: project.businessUnit,
          pending: 0,
          inProgress: 0,
          completed: 0,
        };
      }

      project.tasks.forEach((task) => {

        if (task.taskId && task.taskId.taskStatus) { 
          if (task.taskId.taskStatus === 'Pending') {
            businessUnitStatusMap[project.businessUnit].pending += 1;
          } else if (task.taskId.taskStatus === 'In Progress') {
            businessUnitStatusMap[project.businessUnit].inProgress += 1;
          } else if (task.taskId.taskStatus === 'Completed') {
            businessUnitStatusMap[project.businessUnit].completed += 1;
          }
        } else {
          console.warn('Skipping task due to missing taskId or taskStatus:', task); 
        }
      });
    });

    const businessUnitStatusData = Object.values(businessUnitStatusMap);

    res.json(businessUnitStatusData);
  } catch (err) {
    console.error('Error fetching project status:', err.message);
    res.status(500).json({ message: 'Error fetching project status', error: err.message });
  }
});



const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
