import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Announcements from './Announcements';
import Lectures from './Lectures';
import Assignments from './Assignments';
import Participants from './Participants';

const ClassPage = () => {
  const { class_id } = useParams();
  const [stream, setStream] = useState({
    announcements: [],
    lectures: [],
    assignments: [],
  });
  const [error, setError] = useState(null);

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
        console.error("Error fetching class stream:", err);
        setError("Failed to load class stream.");
      }
    };

    fetchStream();
  }, [class_id]);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Class {class_id} Stream</h1>
      <Announcements announcements={stream.announcements} refreshStream={() => setStream({ ...stream })} />
      <Lectures lectures={stream.lectures} />
      <Assignments assignments={stream.assignments} />
      <Participants class_id={class_id} />
    </div>
  );
};

export default ClassPage;
