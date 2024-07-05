import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import TasksPage from './taskpage';
import { useAuth } from './useAuth';

const Home = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div>
      {!user ? (
        <>
          <h1>Welcome to the Task Manager</h1>
          <button onClick={() => router.push('/login')}>Login</button>
          <button onClick={() => router.push('/register')}>Register</button>
        </>
      ) : (
        <>
          <button onClick={() => {logout();router.push('/');}}>Logout</button>
          <TasksPage />
        </>
      )}
    </div>
  );
};

export default Home;
