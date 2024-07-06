import { useState } from 'react';  import axios from 'axios';

const Team = ({ team, handleDelete }) => {    
    const [editMode, setEditMode] = useState(false);    
    const [updatedName, setUpdatedName] = useState(team.name);    
    const link='https://super-orbit-wjx6p66wg7w3grgr-5000.app.github.dev';
    
    
    const handleSubmitUpdate = async () => {  
        try {
            const token = localStorage.getItem('user');
            const response = await axios.put(`${link}/teams/${team._id}`, { name: updatedName },  {        
                headers: { Authorization: `Bearer ${token}` },
            }); 
            setEditMode(false);   
            console.log(response.data.team);  
        } catch (error) {    
            console.error('Error updating team: ', error);  
        }
    };  
    
    const handleDeleteClick = () => {        handleDelete(team._id);   };
    
    return (  
        <div className="team-container" key={team._id}>  
            {editMode ? (  <div>  <input type="text" value={updatedName} onChange={(e) => setUpdatedName(e.target.value)} />  <button onClick={handleSubmitUpdate}>Save</button>  </div>) : (  
                <div>  
                    <p>{team.name}</p>  <button onClick={() => setEditMode(!editMode)}>Edit</button>  <button onClick={handleDeleteClick}>Delete</button>   
                </div>  
            )}  
        </div>  
    );
};  

export default Team;