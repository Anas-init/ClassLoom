import React from 'react';
// import { useParams } from 'react-router-dom';
import Comments from './Comments';
import { Link } from 'react-router-dom';

const Assignments = ({ assignments }) => {
  // const { class_id } = useParams();
  return (
    <div>
      <h2>Assignments</h2>
      {assignments.length > 0 ? (
        assignments.map((assignment) => (
          <div key={assignment.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>
            <Link
              to={`/assignment/${assignment.id}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              {assignment.title}
            </Link>
            </h3>
            <Comments itemType="assignment" itemId={assignment.id} />
          </div>
        ))
      ) : (
        <p>No assignments available.</p>
      )}
    </div>
  );
};

export default Assignments;