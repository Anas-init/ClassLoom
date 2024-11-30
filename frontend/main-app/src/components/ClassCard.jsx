import * as React from 'react';
import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { stringToMuiColor } from './stringToMuiColor';

export default function ClassCard({ classes }) {
  return (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
      {classes.map((classItem) => (
        <Card
          key={classItem.class_id}
          sx={{
            width: { xs: '100%', sm: 250 },
            height: 200,
            border: "3px solid",
            borderColor: stringToMuiColor(classItem.class_name),
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <CardContent
            sx={{
              backgroundColor: stringToMuiColor(classItem.class_name),
            }}
          >
            <Typography
              gutterBottom
              variant="h5"
              component={Link}
              to={`/class/${classItem.class_id}`}
              state={{
                className: classItem.class_name,
                creatorName: classItem.creator_name,
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
