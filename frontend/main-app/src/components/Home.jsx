import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ClassCard from './ClassCard';

const Home = () => {
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.get(
          'http://127.0.0.1:8000/api/classes/',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setClasses(response.data);
        
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError("Failed to load classes.");
      }
    };

    fetchClasses();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Welcome to Home</h1>
      <ClassCard classes={classes} />
    </div>
  );
};

export default Home;
