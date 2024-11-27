import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ClassPage = () => {
  const { class_id } = useParams();
  // const response = await axios.post("http://127.0.0.1:8000/api/classes/");

  //const stream = await axios.get("http://127.0.0.1:8000/api/class-stream/?class_id=" + class_id);
  
  const [stream, setStream] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const response = [
          { class_id: 1, class_name: 'Mathematics 101', creator: 'Dr. Alice' },
          { class_id: 2, class_name: 'Physics 202', creator: 'Prof. Bob' },
          { class_id: 3, class_name: 'History 303', creator: 'Dr. Carol' },
        ];

        //const accessToken = localStorage.getItem('accessToken');
        // const response = await axios.get(
        //   'http://127.0.0.1:8000/api/classes/',
        //   {},
        //   {
        //     headers: {
        //       Authorization: `Bearer ${accessToken}`,
        //     },
        //   }
        // );
        //setClasses(response.data);
        
        setStream(response);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError("Failed to load classes.");
      }
    };

    fetchStream();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }
  
  return (
    <div>
        <h1>This is Class {class_id}</h1>
        <p>
            {stream.length}
        </p>
    </div>
  );
};

export default ClassPage;
