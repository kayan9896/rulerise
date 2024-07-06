import { useEffect, useState } from 'react';
import axios from 'axios';
import Project from './project';

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const link='https://super-orbit-wjx6p66wg7w3grgr-5000.app.github.dev';

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('user');
      const response = await axios.get(`${link}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error fetching projects: ', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectDelete = async (projectId) => {
    try {
      const token = localStorage.getItem('user');
      await axios.delete(`${link}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project: ', error);
    }
  };

  const handleAddProject = async () => {
    try {
      if (!newProjectName.trim()) return; // Prevent adding empty projects
      const token = localStorage.getItem('user');
      await axios.post(`${link}/projects`, { name: newProjectName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewProjectName(''); // Clear the input field after adding project
      fetchProjects(); // Refetch the projects to update the list
    } catch (error) {
      console.error('Error adding project: ', error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
        <div className="w-1/2">
      <h1 className="text-2xl text-center">Projects</h1>
      <div >
        <input
          type="text"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="Add New Project"
        />
        <button onClick={handleAddProject}>Add</button>
      </div>
      <div className="my-4">
        {projects.map((project) => (
          <Project key={project._id} project={project} handleDelete={handleProjectDelete} />
        ))}
      </div>
      </div>
    </div>
  );
};

export default ProjectPage;
