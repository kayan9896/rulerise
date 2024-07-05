import { useEffect, useState } from 'react';
import axios from 'axios';
import Task from './task';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
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
      await axios.delete(`/api/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task: ', error);
    }
  };

  return (
    <div>
      <h1>Tasks</h1>
      <div className="tasks-container">
        {tasks.map((task) => (
          <Task key={task._id} task={task} handleDelete={handleTaskDelete} />
        ))}
      </div>
    </div>
  );  
};

export default TasksPage;