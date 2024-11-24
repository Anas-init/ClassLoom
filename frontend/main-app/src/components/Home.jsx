import React from 'react';
import ClassCard from './ClassCard';

const Home = () => {
  const classes = [
    { class_id: 1, class_name: 'Mathematics 101', creator: 'Dr. Alice' },
    { class_id: 2, class_name: 'Physics 202', creator: 'Prof. Bob' },
    { class_id: 3, class_name: 'History 303', creator: 'Dr. Carol' },
  ];
  
  return (
    <ClassCard classes={classes} />
  );
};

export default Home;
