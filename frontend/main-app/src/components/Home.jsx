import React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import ClassCard from './ClassCard';

const Home = ({ classes }) => {
  return (
    <PageContainer sx={{ width: "100%", padding: "20px"}}>
        <ClassCard classes={ classes } />
    </PageContainer>
  );
};

export default Home;
