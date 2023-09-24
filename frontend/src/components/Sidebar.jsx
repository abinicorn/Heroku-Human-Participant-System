import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser'
import {request} from "../utils/request";

const drawerWidth = 240;

export default function Sidebar({isSession}) {
    
    const { user } = useCurrentUser();
    const [ studyList, setStudyList ] = React.useState([]);

    async function getStudyList (userId) {
        const response = await request.get(`http://localhost:3001/researcher/list/${userId}`)
        setStudyList(response.data.filter(function(item) {return item.isClosed === false}))
    }
    
    React.useEffect(() => {
        getStudyList(user.userId)
    }, [user])
    
    
    return (
        <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    {studyList.map((text, index) => (
                    <ListItem key={index} disablePadding component={Link} to={isSession ? `/session/${text._id}`: `/study-participants/${text._id}`}> 
                        <ListItemButton>
                        <ListItemIcon>
                            <AssignmentRoundedIcon/>
                        </ListItemIcon>
                        <ListItemText primary={text.studyName} />
                        </ListItemButton>
                    </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    )
}