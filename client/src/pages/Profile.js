// src/pages/Profile.js
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const { data } = await axios.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch profile');
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Your Profile</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {user && (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      )}
    </div>
  );
};

export default Profile;