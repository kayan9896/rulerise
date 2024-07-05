import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { login, error } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await login(email, password);
      if (response) {
        router.push('/'); 
      } else {
        throw new Error('Failed to login user');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p>{error}</p>}
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoginPage;