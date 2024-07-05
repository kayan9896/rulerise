import { useEffect, useState } from 'react';
import axios from 'axios';
import Task from './task';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const link='https://super-orbit-wjx6p66wg7w3grgr-5000.app.github.dev';

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('user');
      const response = await axios.get(link+'/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks: ', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskDelete = async (taskId) => {
    try {
      const token = localStorage.getItem('user');
      await axios.delete(`${link}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task: ', error);
    }
  };

  const handleAddTask = async () => {
    try {
      if (!newTaskName.trim()) return; // Prevent adding empty tasks
      const token = localStorage.getItem('user');
      await axios.post(link+'/tasks', { description: newTaskName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewTaskName(''); // Clear the input field after adding task
      fetchTasks(); // Refetch the tasks to update the list
    } catch (error) {
      console.error('Error adding task: ', error);
    }
  };

  return (
    <div>
      <h1>Tasks</h1>
      <div>
        <input
          type="text"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="Add New Task"
        />
        <button onClick={handleAddTask}>Add</button>
      </div>
      <div className="tasks-container">
        {tasks.map((task) => (
          <Task key={task._id} task={task} handleDelete={handleTaskDelete} />
        ))}
      </div>
    </div>
  );
};

export default TasksPage;