import React from 'react';
import { List, ListItem, ListItemText, Divider, /* IconButton, */ ListItemIcon } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SettingsIcon from '@mui/icons-material/Settings';
import ClassList from './ClassList';

const Sidebar = ({ classes }) => {
    return (
        <div className="w-64 h-screen bg-gray-900 flex flex-col justify-between">
            {/* Top Section: Home and Calendar/To-Do List */}
            <div>
                <List>
                    <ListItem button>
                        <ListItemIcon>
                            <HomeIcon style={{ color: 'white' }} />
                        </ListItemIcon>
                        <ListItemText primary="Home" primaryTypographyProps={{ className: 'text-white' }} />
                    </ListItem>

                    <ListItem button>
                        <ListItemIcon>
                            <CalendarTodayIcon style={{ color: 'white' }} />
                        </ListItemIcon>
                        <ListItemText primary="Calendar" primaryTypographyProps={{ className: 'text-white' }} />
                    </ListItem>
                </List>
                <Divider />
            </div>

            {/* Middle Section: Class List */}
            <div className="flex-grow">
                <ClassList classes={classes} />
            </div>

            {/* Bottom Section: Settings */}
            <div>
                <Divider />
                <List>
                    <ListItem button>
                        <ListItemIcon>
                            <SettingsIcon style={{ color: 'white' }} />
                        </ListItemIcon>
                        <ListItemText primary="Settings" primaryTypographyProps={{ className: 'text-white' }} />
                    </ListItem>
                </List>
            </div>
        </div>
    );
};

export default Sidebar;
