import React from 'react';
import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const Submissions = ({ submissions }) => {
  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '20px' }}>
      {submissions.map((submission) => (
        <Card
          key={submission.submission_id}
          sx={{
            width: { xs: '100%', sm: 250 },
            height: 150,
            border: '2px solid #4caf50',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <CardContent>
            <Typography variant="h6">
              {submission.student_name}
            </Typography>
            <Typography variant="body2">
              <strong>Submitted At:</strong>{' '}
              {new Date(submission.submitted_at).toLocaleString()}
            </Typography>
            <Typography
              component={Link}
              to={`/submission/${submission.submission_id}`}
              sx={{
                textDecoration: 'none',
                color: '#007bff',
                "&:hover": { textDecoration: 'underline' },
              }}
            >
              View Submission Details
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Submissions;
