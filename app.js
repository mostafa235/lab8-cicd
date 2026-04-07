const express = require('express');
const mongoose = require('mongoose');
const os = require('os');

const app = express();
const PORT = 3000;

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGO_URL || 'mongodb://mongo:27017/lab6', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Schema
const taskSchema = new mongoose.Schema({
  name: String,
  status: String
});

const Task = mongoose.model('Task', taskSchema);

// Seed Data: إضافة بيانات جديدة بدون تكرار
async function seedData() {
  const tasksToAdd = [
    { name: 'Milk', status: 'done' },
    { name: 'Eggs', status: 'done' },
    { name: 'Bread', status: 'pending' },
    { name: 'Butter', status: 'pending' },
    { name: 'Orange juice', status: 'pending' },
    { name: 'Tea', status: 'pending' } // المهمة الجديدة
  ];

  for (const task of tasksToAdd) {
    const exists = await Task.findOne({ name: task.name });
    if (!exists) {
      await Task.create(task);
      console.log(`Added task: ${task.name}`);
    }
  }
}

// نفذ الـ seed
seedData().catch(err => console.error(err));

// Route 1
app.get('/', (req, res) => {
  res.json({
    app: 'CISC 886 Lab 8',
    mode: process.env.MODE || 'local',
    node: process.version,
    host: os.hostname(),
  });
});

// Route 2 (from DB)
app.get('/tasks', async (req, res) => {
  const tasks = await Task.find();

  const grouped = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {});

  res.json(grouped);
});

// Start server
app.listen(PORT, () => {
  console.log('----------------------------------');
  console.log(`App running on port ${PORT}`);
  console.log(`Node: ${process.version}`);
  console.log(`Host: ${os.hostname()}`);
  console.log('----------------------------------');
});