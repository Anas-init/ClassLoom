import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Announcements from './Announcements';
import Lectures from './Lectures';
import Assignments from './Assignments';
import Participants from './Participants';
import '../ClassPage.css'; 

const ClassPage = () => {
  const { class_id } = useParams();
  const [stream, setStream] = useState({
    announcements: [],
    lectures: [],
    assignments: [],
  });
  const [error, setError] = useState(null);
  const location = useLocation();
  const { className, creatorName } = location.state || {};

  const [activeTab, setActiveTab] = useState('stream');

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.get(
          `http://127.0.0.1:8000/api/class-stream/?class_id=${class_id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setStream(response.data);
      } catch (err) {
        console.error('Error fetching class stream:', err);
        setError('Failed to load class stream.');
      }
    };

    fetchStream();
  }, [class_id]);

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="class-page">
      <header className="class-header">
        <h1>{className}</h1>
        <p>By: {creatorName}</p>
      </header>

      <nav className="class-nav">
        <button
          className={`nav-button ${activeTab === 'stream' ? 'active' : ''}`}
          onClick={() => setActiveTab('stream')}
        >
          Stream
        </button>
        <button
          className={`nav-button ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assigned Tasks
        </button>
        <button
          className={`nav-button ${activeTab === 'people' ? 'active' : ''}`}
          onClick={() => setActiveTab('people')}
        >
          People
        </button>
      </nav>

      <main className="class-content">
        {activeTab === 'stream' && (
          <>
            <Announcements
              class_id={class_id}
              announcements={stream.announcements}
              refreshStream={() => setStream({ ...stream })}
            />
            <Lectures lectures={stream.lectures} />
          </>
        )}
        {activeTab === 'assignments' && (
          <Assignments assignments={stream.assignments} />
        )}
        {activeTab === 'people' && <Participants class_id={class_id} />}
      </main>
    </div>
  );
};

export default ClassPage;
