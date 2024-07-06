import { useEffect, useState } from 'react';
import axios from 'axios';
import Team from './team';


const TeamPage = () => {
    const [teams, setTeams] = useState([]);
    const [newTeamName, setNewTeamName] = useState('');
    const link='https://super-orbit-wjx6p66wg7w3grgr-5000.app.github.dev';

    const fetchTeams = async () => {
        try { 
            const token = localStorage.getItem('user');
            const response = await axios.get(`${link}/teams`, {
                headers: { Authorization: `Bearer ${token}` },      });
                setTeams(response.data.teams);
        } catch (error) { 
            console.error('Error fetching teams: ', error);
        }
    };
    
    useEffect(() => {  fetchTeams(); }, []);
    
    const handleTeamDelete = async (teamId) => {        
        try {
            const token = localStorage.getItem('user');
            await axios.delete(`${link}/teams/${teamId}`, {            
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchTeams();
        } catch (error) {          
            console.error('Error deleting team: ', error);
        }
    }; 
    
   const handleAddTeam = async () => {
        try {
            if (!newTeamName.trim()) return; 
            const token = localStorage.getItem('user');
            await axios.post(`${link}/teams`, { name: newTeamName },{                headers: { Authorization: `Bearer ${token}` },
            }); 
            setNewTeamName('');  fetchTeams();
        } catch (error) {  
            console.error('Error adding team: ', error);    
        }
    };  

    return (  
        <div className="flex justify-center items-center h-screen">
            <div className="w-1/2">
            <h1 className="text-2xl text-center">Teams</h1>     
            <div>   <input type="text" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="Add New Team" />
                <button onClick={handleAddTeam}>Add</button>
            </div>     
            <div className="my-4">  {teams.map((team) => (  <Team key={team._id} team={team} handleDelete={handleTeamDelete} />))}    
            </div>  
            </div>
        </div>  
    );
};  
export default TeamPage;