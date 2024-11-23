// Base imports
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { createTheme } from '@mui/material/styles';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

// Icons
import ClassIcon from '@mui/icons-material/Class';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HomeIcon from '@mui/icons-material/Home';

// Components
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';

// Navigation items
const NAVIGATION = [
  { segment: '', title: 'Home', icon: <HomeIcon /> },
  { segment: 'assignments', title: 'Assignments', icon: <AssignmentIcon /> },
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
                  <Route path="/" element={<Home />} />
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
