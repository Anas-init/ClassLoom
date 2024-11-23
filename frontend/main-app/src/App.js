// Base imports
import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { createTheme } from '@mui/material/styles';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { Chip } from '@mui/material';

// Icons
import ClassIcon from '@mui/icons-material/Class';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HomeIcon from '@mui/icons-material/Home';

// Components
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import { stringToMuiColor } from './components/stringToMuiColor';

// Navigation items
var NAVIGATION = [
  { segment: '', title: 'Home', icon: <HomeIcon /> },
  { segment: 'assignments', title: 'Assignments', icon: <AssignmentIcon />, 
    // action: <Chip label={7} color="error" size="small" /> 
  },
  { kind: 'divider' },
  { segment: 'classes', title: 'Classes', icon: <ClassIcon />, 
    pattern: 'classes{/:classId}*', 
    children: []
  },
  { kind: 'divider' },
  { segment: 'settings', title: 'Settings', icon: <SettingsIcon /> },
];

// Dark mode and responsive theme configuration
const mainTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },

});

function App() {

  // Replace with in-place APIs for authentications and data retrieval
  const [session, setSession] = React.useState({
    user: {
      name: 'Test User',
      email: 'user@example.com',
      image: '',
    },
  });

  const authentication = React.useMemo(() => {
    return {
      signIn: () => {
        setSession({
          user: {
            name: 'Test User',
            email: 'user@example.com',
            image: '',
          },
        });
      },
      signOut: () => {
        setSession(null);
      },
    };
  }, []);

  const [classes, setClasses] = useState([]); // State to store classes

  useEffect(() => {
    // Simulate async data fetching
    const fetchData = async () => {
      const data = [
        { class_id: 1, class_name: "Mathematics 101", creator: "Dr. Alice" },
        { class_id: 2, class_name: "Physics 202", creator: "Prof. Bob" },
        { class_id: 3, class_name: "History 303", creator: "Dr. Carol" },
      ];

      // const data = await axios.post('http://127.0.0.1:8000/api/classes/');

      setClasses(data);
    };
    fetchData();
  }, []);

  NAVIGATION = NAVIGATION.map((item) => {
    if (item.segment === 'classes') {
      item.children = classes.map((classItem) => ({
        title: classItem.class_name,
        segment: `classes/${classItem.class_id}`,
        icon: <ClassIcon sx={{ color: stringToMuiColor(classItem.class_name) + " !important" }} />
      }));
    }
    return item;
  });

  return (
      <Router>
        <AppProvider 
        navigation={NAVIGATION} 
        theme={mainTheme}
        session={session}
        authentication={authentication} 
        branding={{
          title: 'ClassLoom',
          // logo only
        }}
        >
           <Routes>
          {/* Separate UI for Login and Register */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/*" 
            element={
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<Home classes={ classes } />} />
                  <Route path="/assignments" element={<div>Assignments Page</div>} />
                  <Route path="/settings" element={<div>Settings Page</div>} />
                </Routes>
              </DashboardLayout>
            } 
          />
        </Routes>
        </AppProvider>
      </Router>
  );
}

export default App;
