import React, { useState } from 'react';
import axios from 'axios';

const CreateAssignmentForm = ({ class_id, creator_id }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [grade, setGrade] = useState('');
  const [attachments, setAttachments] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const accessToken = localStorage.getItem('accessToken');

  const handleFileChange = (e) => {
    setAttachments(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !dueDate || !grade || !attachments) {
      alert('Please fill in all fields');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('due_date', dueDate);
    formData.append('class_card', parseInt(class_id));
    formData.append('creator', parseInt(creator_id));
    formData.append('grade', grade);
    for (let i = 0; i < attachments.length; i++) {
      formData.append('attachments', attachments[i]);
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post('http://127.0.0.1:8000/api/create-assignment/', formData, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        alert('Assignment created successfully');
        window.location.href = `/class/` + class_id;
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      setError('Error creating assignment, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Create Assignment</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Due Date:</label>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Grade:</label>
          <input
            type="number"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Attachments:</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Assignment'}
        </button>
      </form>
    </div>
  );
};

export default CreateAssignmentForm;
