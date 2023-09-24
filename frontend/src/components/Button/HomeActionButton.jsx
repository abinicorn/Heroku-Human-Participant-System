import * as React from 'react';
import {Button, ClickAwayListener, Grow, Paper, Popper, MenuItem, MenuList, ListItemIcon, Box, Typography, Link} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PeopleIcon from '@mui/icons-material/People';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DescriptionIcon from '@mui/icons-material/Description';
import OptionPopup from '../Popup/OptionPopup';
import StudyReportPopup from '../Study/StudyReportPopup';
import ResearcherManagePopup from '../Researcher/ResearcherManagePopup';
import {StudyResearcherContextProvider} from '../../providers/StudyResearcherContextProvider';
import axios from 'axios';
import {request} from "../../utils/request";

export default function HomeActionButton({pageItemId, currentStudy, setStudyList, studyList}) {


    const [open, setOpen] = React.useState(false);
    // const[currentStudyStatus,setCurrentStudyStatus]=React.useState(currentStudy.status);
    const placement ='bottom-start';
    const anchorRef = React.useRef(null);

    function createData(icon, title) {
        return { icon, title };
    }

    const  actionList = [
        createData(<EditIcon/>, 'Edit Detail'),
        createData(<PeopleIcon/>, 'Manage Participant'),
        createData(<PeopleOutlineIcon/>, 'Manage Researcher'),
        createData(<CalendarMonthIcon/>, 'Manage Session'),
        createData(<DescriptionIcon/>, 'Generate Report'),
        createData(<HighlightOffIcon/>, 'Close Study')
      ];

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleCloseStudy = async () => {
    try{
    const response= await request.put(`/study/${pageItemId}`, {isClosed: true});
    // setCurrentStudyStatus(false);
    const updatedStudies = studyList.map(study => {
      if (study.studyId === pageItemId) {
          return {...study, status: true};
      }
      return study;
    });
    console.log('updatedStudies: ', updatedStudies);
  
    setStudyList(updatedStudies);
    alert("Study closed successfully");
    setOpen(false);
    // handleClose();
    } catch (error) {
        alert(error.response.data.message || "Error closing study");
    }

  }

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
                    <MenuItem key={0} disabled={!currentStudy.status}> 
                      <ListItemIcon>{actionList[0].icon}</ListItemIcon>                        
                      <Typography textAlign="center" ><Link href={`/studyDetail/${pageItemId}`} underline="none" color="inherit">{actionList[0].title}</Link></Typography>
                    </MenuItem>
                    <MenuItem key={1} disabled={!currentStudy.status}> 
                      <ListItemIcon>{actionList[1].icon}</ListItemIcon>                        
                      <Typography textAlign="center" ><Link href={`/study-participants/${pageItemId}`} underline="none" color="inherit">{actionList[1].title}</Link></Typography>
                    </MenuItem>
                    <MenuItem key={2} disabled={!currentStudy.status}> 
                      <ListItemIcon>{actionList[2].icon}</ListItemIcon>
                      <StudyResearcherContextProvider pageItemId={pageItemId}><ResearcherManagePopup />  </StudyResearcherContextProvider>  
                      {/* <Typography textAlign="center" ><Link href={`/studyDetail/${pageItemId}/researcher`} underline="none" color="inherit">{actionList[2].title}</Link></Typography> */}
                    </MenuItem>
                    <MenuItem key={3} disabled={!currentStudy.status}> 
                      <ListItemIcon>{actionList[3].icon}</ListItemIcon>                        
                      <Typography textAlign="center" ><Link href={`/session/${pageItemId}`} underline="none" color="inherit">{actionList[3].title}</Link></Typography>
                    </MenuItem>
                    <MenuItem key={4}>
                      <ListItemIcon>{actionList[4].icon}</ListItemIcon>                        
                      <StudyReportPopup currentStudy={currentStudy}/>
                    </MenuItem>
                    <MenuItem key={5} disabled={!currentStudy.status}> 
                      <ListItemIcon>{actionList[5].icon}</ListItemIcon>                        
                      <OptionPopup buttonText={actionList[5].title} popupText={'Are you sure you want to close this study?'} onClick={handleCloseStudy} />
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
