// Base imports
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { Chip } from '@mui/material';
import darkTheme from './theme';

// Icons
import ClassIcon from '@mui/icons-material/Class';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HomeIcon from '@mui/icons-material/Home';

// Components
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
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

function App() {

  const [session, setSession] = React.useState(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken);
        return { user: decoded };
      } catch (error) {
        console.error('Invalid token during initialization', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    return null;
  });  

  const authentication = React.useMemo(() => ({
    signIn: () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const decoded = jwtDecode(accessToken);
          setSession({
            user: {
              exp: decoded.exp,
              iat: decoded.iat,
              jti: decoded.jti,
              role: decoded.role,
              token_type: decoded.token_type,
              user_id: decoded.user_id,

              name: "Placeholder",
              email: "example@placeholder.com",
              image: "",
            }
          });
          return true;
        } catch (error) {
          console.error('Invalid token', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setSession(null);
          return false;
        }
      }
    },
    signOut: () => {
      setSession(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }), []);

  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {

      const data = [
        { class_id: 1, class_name: "Mathematics 101", creator: "Dr. Alice" },
        { class_id: 2, class_name: "Physics 202", creator: "Prof. Bob" },
        { class_id: 3, class_name: "History 303", creator: "Dr. Carol" },
      ];
      // const data = await axios.post('http://127.0.0.1:8000/api/classes/'); 
      setClasses(data);
    };

    const initializeApp = async () => {
      if (authentication.signIn()) {
        await fetchData();
      }
    };
  
    initializeApp();
  }, [authentication]);

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
        theme={darkTheme}
        session={session}
        authentication={authentication} 
        branding={{
          title: 'ClassLoom',
          // logo only
        }}
        >
           <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Private Routes */}
          <Route 
            path="/*" 
            element={
              <PrivateRoute session={session}>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<Home classes={ classes } />} />
                    <Route path="/assignments" element={<div>Assignments Page</div>} />
                    <Route path="/settings" element={<div>Settings Page</div>} />
                  </Routes>
                </DashboardLayout>
              </PrivateRoute>
            } 
          />
        </Routes>
        </AppProvider>
      </Router>
  );
}

export default App;
