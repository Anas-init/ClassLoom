import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Comments from './Comments';
import CreateAssignmentForm from './CreateAssignmentForm';
import { jwtDecode } from 'jwt-decode';

const Assignments = ({ assignments, class_id }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const accessToken = localStorage.getItem('accessToken');
  const decodedToken = jwtDecode(accessToken);
  const creator_id = decodedToken.user_id;

  const handleCreateButtonClick = () => {
    setShowCreateForm(!showCreateForm);  // Toggle the form visibility
  };


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

      {/* Button to toggle the creation of a new assignment */}
      <button onClick={handleCreateButtonClick}>
        {showCreateForm ? 'Cancel Create Assignment' : 'Create Assignment'}
      </button>

      {/* Conditionally render Create Assignment Form */}
      {showCreateForm && (
        <CreateAssignmentForm class_id={class_id} creatorId={creator_id} />
      )}
    </div>
  );
};

export default Assignments;