import React from 'react';
import { List, ListItem, ListItemText, Divider } from '@mui/material';

const ClassList = ({ classes = [] }) => {
    return (
        <div className="bg-gray-900 h-full p-4">
            <List component="nav" aria-label="class list">
                {classes.map((classInfo, index) => (
                    <React.Fragment key={index}>
                        <ListItem button>
                            <ListItemText
                                primary={classInfo.className}
                                secondary={`Section: ${classInfo.section}`}
                                primaryTypographyProps={{ className: 'text-white' }}
                                secondaryTypographyProps={{ className: 'text-gray-400' }}
                            />
                        </ListItem>
                        {index < classes.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </List>
        </div>
    );
};

export default ClassList;
