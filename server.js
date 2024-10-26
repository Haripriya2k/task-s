const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/taskmanager', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

// Task Schema
const taskSchema = new mongoose.Schema({
    taskName: { type: String, required: true },
    assignedTo: { type: String, required: true },
    priority: { type: String, required: true, enum: ['Low', 'Medium', 'High'] },
    due: { type: Date, required: true }
});

const Task = mongoose.model('Task', taskSchema);

// Add a new task
app.post('/add-task', async (req, res) => {
    const { taskName, assignedTo, due } = req.body;

    // Determine priority based on due date
    const currentDate = new Date();
    const dueDate = new Date(due);
    const timeDiff = dueDate - currentDate;
    const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let priority;
    if (daysUntilDue < 1) {
        priority = 'Low';
    } else if (daysUntilDue <= 10) {
        priority = 'Medium';
    } else {
        priority = 'High';
    }

    const task = new Task({
        taskName,
        assignedTo,
        priority,
        due
    });

    try {
        await task.save();
        res.status(201).json({ message: 'Task added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding task', error });
    }
});

// Get tasks
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch tasks', error });
    }
});

// Start server
app.listen(5500, () => {
    console.log('Server is running on http://localhost:5500');
});
