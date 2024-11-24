import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
// import { Chip } from '@mui/material';
import { PageContainer } from '@toolpad/core/PageContainer';

// Icons
import ClassIcon from '@mui/icons-material/Class';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HomeIcon from '@mui/icons-material/Home';

// Components
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Settings from './components/Settings';
import ClassPage from './components/ClassPage';
import Assignments from './components/Assignments';

// Styling and Helpers
import darkTheme from './theme';
import { stringToMuiColor } from './components/stringToMuiColor';

async function fetchNavigation() {
  try {
    const response = [
      { class_id: 1, class_name: 'Mathematics 101', creator: 'Dr. Alice' },
      { class_id: 2, class_name: 'Physics 202', creator: 'Prof. Bob' },
      { class_id: 3, class_name: 'History 303', creator: 'Dr. Carol' },
    ];
    // const response = await axios.post("http://127.0.0.1:8000/api/classes/");
    // const classes = response.data.map((classItem) => ({
    const classes = response.map((classItem) => ({
      title: classItem.class_name,
      segment: `${classItem.class_id}`,
      icon: <ClassIcon sx={{ color: stringToMuiColor(classItem.class_name) + " !important" }} />,
    }));

    return [
      {
        segment: "",
        title: "Home",
        icon: <HomeIcon />,
      },
      {
        segment: "assignments",
        title: "Assignments",
        icon: <AssignmentIcon />,
        // action: <Chip label={7} color="error" size="small" /> 
      },
      {
        kind: "divider",
      },
      {
        segment: "class",
        title: "Classes",
        icon: <ClassIcon />,
        children: classes,
      },
      {
        kind: "divider",
      },
      {
        segment: "settings",
        title: "Settings",
        icon: <SettingsIcon />,
      },
    ];
  } catch (error) {
    console.error("Failed to fetch navigation data:", error);
    return [
      {
        segment: "login",
        title: "Please Sign In Again",
        icon: <SettingsIcon />,
      },
    ];
  }
}

function CustomRouter(initialPath) {
  const [pathname, setPathname] = useState(initialPath);

  const router = useMemo(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  return router;
}

export default function App() {
  const router = CustomRouter('/');

  // Session Management
  const [session, setSession] = useState(() => {
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

  // Account Display Management
  const authentication = useMemo(() => ({
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
        }
      }
      return false;
    },
    signOut: () => {
      setSession(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.navigate('/login');
    },
  }), [router]);

  const [NAVIGATION, setNavigation] = useState([]);
  useEffect(() => {
    const initializeNavigation = async () => {
      const navData = await fetchNavigation();
      setNavigation(navData);
    };

    const initializeApp = async () => {
      if (authentication.signIn()) {
        await initializeNavigation();
      }
    };

    initializeApp();
  }, [authentication]);

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={darkTheme}
      session={session}
      authentication={authentication}
      branding={{
        title: 'ClassLoom',
        // logo only
      }}
    >
      <DashboardLayout>
        <PageContainer>
          {router.pathname === "/" && <Home />}
          {router.pathname === "/login" && <Login />}
          {router.pathname === "/register" && <Register />}
          {router.pathname === "/assignments" && <Assignments />}
          {router.pathname === "/settings" && <Settings />}
          {router.pathname.startsWith("/class/") && (
            <ClassPage class_id={router.pathname.split("/").pop()} />
          )}
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}