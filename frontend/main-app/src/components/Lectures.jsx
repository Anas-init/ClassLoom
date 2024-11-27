import React from 'react';
import Comments from './Comments';

const Lectures = ({ lectures }) => {
  if (!lectures.length) {
    return <p>No lectures available.</p>;
  }

  return (
    <div>
      <h2>Lectures</h2>
      {lectures.map((lecture) => (
        <div key={lecture.id} style={{ marginBottom: '16px' }}>
          <p><strong>Title:</strong> {lecture.title}</p>
          <Comments itemType="lecture" itemId={lecture.id} />
        </div>
      ))}
    </div>
  );
};

export default Lectures;
