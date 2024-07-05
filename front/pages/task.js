import { useState } from 'react';
import axios from 'axios';

const Task = ({ task, handleDelete }) => {
  const [editMode, setEditMode] = useState(false);
  const [updatedDescription, setUpdatedDescription] = useState(task.description);

  const handleSubmitUpdate = async () => {
    try {
      const response = await axios.put(`/api/tasks/${task._id}`, { description: updatedDescription });
      setEditMode(false);
      console.log(response.data.task);
    } catch (error) {
      console.error('Error updating task: ', error);
    }
  };

  const handleDeleteClick = () => {
    handleDelete(task._id);
  };

  return (
    <div className="task-container" key={task._id}>
      {editMode ? (
        <div>
          <input
            type="text"
            value={updatedDescription}
            onChange={(e) => setUpdatedDescription(e.target.value)}
          />
          <button onClick={handleSubmitUpdate}>Save</button>
        </div>
      ) : (
        <div>
          <p>{task.description}</p>
          <button onClick={() => setEditMode(!editMode)}>Edit</button>
          <button onClick={handleDeleteClick}>Delete</button>
        </div>
      )}
    </div>
  );
};  
export default Task;