import React from 'react';
import Comments from './Comments';

const Assignments = ({ assignments }) => {
  if (!assignments.length) {
    return <p>No assignments available.</p>;
  }

  return (
    <div>
      <h2>Assignments</h2>
      {assignments.map((assignment) => (
        <div key={assignment.id} style={{ marginBottom: '16px' }}>
          <p><strong>Title:</strong> {assignment.title}</p>
          <Comments itemType="assignment" itemId={assignment.id} />
        </div>
      ))}
    </div>
  );
};

export default Assignments;
