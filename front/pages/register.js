import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './useAuth';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { register, error } = useAuth();

  const handleRegister = async () => {
    try {
      const response = await register(email, password);
      if (response) {
        router.push('/'); // Redirect to home page after successful registration
      } else {
        throw new Error('Failed to register user');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Register</h1>
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
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default RegisterPage;