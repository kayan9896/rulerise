import { useState } from 'react';
import axios from 'axios';

const Project = ({ project, handleDelete }) => {
  const [editMode, setEditMode] = useState(false);
  const [updatedName, setUpdatedName] = useState(project.name);
  const link='https://super-orbit-wjx6p66wg7w3grgr-5000.app.github.dev';

  const handleSubmitUpdate = async () => {
    try {
      const token = localStorage.getItem('user');
      const response = await axios.put(`${link}/projects/${project._id}`, { name: updatedName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditMode(false);
      console.log(response.data.project);
    } catch (error) {
      console.error('Error updating project: ', error);
    }
  };

  const handleDeleteClick = () => {
    handleDelete(project._id);
  };

  return (
    <div className="project-container" key={project._id}>
      {editMode ? (
        <div>
          <input
            type="text"
            value={updatedName}
            onChange={(e) => setUpdatedName(e.target.value)}
          />
          <button onClick={handleSubmitUpdate}>Save</button>
        </div>
      ) : (
        <div>
          <p>{project.name}</p>
          <button onClick={() => setEditMode(!editMode)}>Edit</button>
          <button onClick={handleDeleteClick}>Delete</button>
        </div>
      )}
    </div>
  );
};

export default Project;
