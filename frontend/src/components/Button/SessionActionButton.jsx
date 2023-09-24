import * as React from 'react';
import { Button, ClickAwayListener, Grow, Paper, Popper, MenuItem, MenuList, ListItemIcon, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { SessionContext } from '../../providers/SessionContextProvider';
import CreateEditSession from '../Session/CreateEditSession';
import OptionPopup from '../Popup/OptionPopup';
import SessionParticipantList from '../Session/SessionParticipantList';

export default function SessionActionButton({pageItemId}) {
  
    const [open, setOpen] = React.useState(false);
    const placement ='bottom-start';
    const anchorRef = React.useRef(null);

    const { sessions, updateSession, refreshSession } = React.useContext(SessionContext);

    function createData(icon, title) {
        return { icon, title };
    }
        
    const actionList = [
        createData(<EditIcon/>, 'Edit Session'),
        createData(<ListAltIcon/>, 'View Participants'), 
        createData(<HighlightOffIcon/>, 'Delete Session')
    ];

  const handleArchive = () => {
    const targetSession = sessions.find(s => s._id === pageItemId)
    targetSession['isArchive'] = true
    updateSession(targetSession);
    refreshSession();
    setOpen(false);
  }

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <div>
        <Box sx={{ display: 'flex', marginBottom: 5, marginRight: 10}}>
            <Button
            variant="contained"
            ref={anchorRef}
            id="composition-button"
            aria-controls={open ? 'composition-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
            sx = {{ position: 'absolute' }}
            >
            Action
            </Button>
        </Box>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          placement={placement}
          transition
          disablePortal
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={open}
                    id="composition-menu"
                    aria-labelledby="composition-button"
                    onKeyDown={handleListKeyDown}
                  >                    
                    <MenuItem key={0}> 
                      <ListItemIcon>{actionList[0].icon}</ListItemIcon>
                      <CreateEditSession create={false} targetSessionId={pageItemId}/>                
                    </MenuItem>
                    <MenuItem key={1}>
                      <ListItemIcon>{actionList[1].icon}</ListItemIcon>
                      <SessionParticipantList targetSessionId={pageItemId}/>
                    </MenuItem> 
                    <MenuItem key={2}>
                      <ListItemIcon>{actionList[2].icon}</ListItemIcon>
                      <OptionPopup buttonText={'Archive Session'} popupText={'Are you sure you want to archive this session?'} onClick={handleArchive}/>
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
    </div>

  );
}

/*
{actionList.map((actionList, index) => (
  <MenuItem key={index} onClick={handleMenuItem}> 
      <ListItemIcon>{actionList.icon}</ListItemIcon>                        
      <Typography textAlign="center">{actionList.title}</Typography>
  </MenuItem>
))}
*/