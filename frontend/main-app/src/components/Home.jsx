import React from 'react';
import ClassCard from './ClassCard';

const classes = [
  {
    bannerUrl: 'https://example.com/banner1.jpg',
    className: 'Math 101',
    section: 'Section A',
    instructor: 'John Doe',
  },
  {
    bannerUrl: 'https://example.com/banner2.jpg',
    className: 'Physics 202',
    section: 'Section B',
    instructor: 'Jane Smith',
  },
];

const Home = () => {
  return (
    <div className="flex flex-wrap justify-center">
      {classes.map((classInfo, index) => (
        <ClassCard
          key={index}
          bannerUrl={classInfo.bannerUrl}
          className={classInfo.className}
          section={classInfo.section}
          instructor={classInfo.instructor}
        />
      ))}
    </div>
  );
};

export default Home;
