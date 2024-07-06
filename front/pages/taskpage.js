import { useEffect, useState } from 'react';
import axios from 'axios';
import Task from './task';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const link = 'https://super-orbit-wjx6p66wg7w3grgr-5000.app.github.dev';
  const wsLink = 'wss://super-orbit-wjx6p66wg7w3grgr-5000.app.github.dev';

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('user');
      const response = await axios.get(link + '/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks: ', error);
    }
  };

  useEffect(() => {
    fetchTasks();

    const ws = new WebSocket(wsLink);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'ADD_TASK':
          setTasks((prevTasks) => [...prevTasks, data.task]);
          break;
        case 'DELETE_TASK':
          setTasks((prevTasks) => prevTasks.filter(task => task._id !== data.taskId));
          break;
        case 'UPDATE_TASK':
          setTasks((prevTasks) => prevTasks.map(task => (task._id === data.task._id ? data.task : task)));
          break;
        default:
          break;
      }
    };

    return () => {
      if (ws.readyState === 1) { // <-- This is important
        ws.close();
    }
    };
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
      await axios.post(link + '/tasks', { description: newTaskName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewTaskName(''); // Clear the input field after adding task
      fetchTasks(); // Refetch the tasks to update the list
    } catch (error) {
      console.error('Error adding task: ', error);
    }
  };

  const handleSubmit = async (taskId,updatedDescription) => {
    try {
      const token = localStorage.getItem('user');
      const response = await axios.put(`${link}/tasks/${taskId}`, { description: updatedDescription }, {
        headers: { Authorization: `Bearer ${token}` },});
      console.log(response.data.task);
    } catch (error) {
      console.error('Error updating task: ', error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-1/2">
        <h1 className="text-2xl text-center">Tasks</h1>
        <div>
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Add New Task"
          />
          <button onClick={handleAddTask}>Add</button>
        </div>
        <div className="my-4">
          {tasks.map((task) => (
            <Task key={task._id} task={task} handleDelete={handleTaskDelete} handleSubmit={handleSubmit}/>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
