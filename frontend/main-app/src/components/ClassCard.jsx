import * as React from 'react';
import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { stringToMuiColor } from './stringToMuiColor';

export default function ClassCard({ classes }) {
  return (
    <div style={{ 
      display: "flex", 
      gap: "16px", 
      flexWrap: "wrap",
      padding: "20px"
  }}>
      {classes.map((classItem) => (
        <Card
          key={classItem.class_id}
          sx={{
            width: { xs: '100%', sm: 250 },
            border: "3px solid",
            borderRadius: "8px",
            borderColor: stringToMuiColor(classItem.class_name),
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <CardContent
            sx={{
              backgroundColor: stringToMuiColor(classItem.class_name),
              m: 1,
              borderRadius: "8px"
            }}
          >
            <Typography
              gutterBottom
              variant="h5"
              component={Link}
              to={`/class/${classItem.class_id}`}
              state={{
                class_name: classItem.class_name,
                creator_name: classItem.creator_name,
                class_color: stringToMuiColor(classItem.class_name),
              }}
              sx={{
                textDecoration: "none",
                color: "inherit",
                "&:hover": { textDecoration: "underline" }
              }}
            >
              {classItem.class_name}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Created by: {classItem.creator_name}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
