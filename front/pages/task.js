import { useState } from 'react';
import axios from 'axios';

const Task = ({ task, handleDelete, handleSubmit }) => {
  const [editMode, setEditMode] = useState(false);
  const [updatedDescription, setUpdatedDescription] = useState(task.description);


  const handleSubmitUpdate = async () => {
    handleSubmit(task._id,updatedDescription)
    setEditMode(false);
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
