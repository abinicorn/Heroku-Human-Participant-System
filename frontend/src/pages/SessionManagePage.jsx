import * as React from 'react';
import Box from '@mui/material/Box';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CreateEditSession from '../components/Session/CreateEditSession';
import SessionActionButton from '../components/Button/SessionActionButton';
import { SessionContext } from '../providers/SessionContextProvider';
import { GridToolbar  } from '@mui/x-data-grid';
import { StyledDataGrid } from '../styles/StyledDataGrid';
import SessionArchive from '../components/Session/SessionArchive';
import { CurrentUserContextProvider } from '../providers/CurrentUserProvider';
import { CustomNoRowsOverlaySession } from '../styles/CustomNoRowsOverlay';
import { StudyResearcherContext } from '../providers/StudyResearcherContextProvider';


export default function SessionManagePage() {
  
  const { studyInfo } = React.useContext(StudyResearcherContext)
  const { sessions } = React.useContext(SessionContext);
  const activeSessions = sessions.filter(function(item) {return item.isArchive === false});

  const columns = [
    { field: 'sessionCode', headerName: 'Session Code', flex: 1.5, headerAlign: 'center', align:'center'},
    { field: 'date', headerName: 'Date', flex: 1.5, headerAlign: 'center', align:'center', valueGetter: (params) => (params.value.slice(0,10)) },
    { field: 'time', headerName: 'Time', flex: 1.5, headerAlign: 'center', align:'center'},
    { field: 'location', headerName: 'Location', flex: 1.5, headerAlign: 'center', align:'center'},
    { field: 'participantNum', headerName: 'Participant Number', flex: 1.5, headerAlign: 'center', align:'center' },
    { field: '_id', headerName: 'Action', flex: 1, headerAlign: 'center', align:'center', renderCell: (params) => (<SessionActionButton pageItemId = {params.value}/>)},
  ]

    return (
        <div>
          <Box sx={{ display: 'flex'}}>
            <CurrentUserContextProvider>
              <Navbar/>
              <Sidebar isSession={true}/>
            </CurrentUserContextProvider>
          </Box>
          <Box marginLeft={35} marginRight={23} marginTop={10}>
            <h1>Session Management</h1>
            <h1>{studyInfo.studyName} (Study Code: {studyInfo.studyCode})</h1>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end'}}>
              <CreateEditSession create={true}/>
              <SessionArchive/>
            </Box>
              <StyledDataGrid
              sx={{
                height: "65vh",
                maxWidth: '100vw', 
                overflowY: 'auto',
                overflowX: 'hidden',
                marginTop: 2,
                '&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell': { py: '8px' },
                    '&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell': { py: '15px' },
                    '&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell': { py: '22px' }
              }}
              getRowId={(row) => row._id}
              rows={activeSessions}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              slots={{
                noRowsOverlay: CustomNoRowsOverlaySession,
                toolbar: GridToolbar
              }}
              disableSelectionOnClick
              hideFooterSelectedRowCount
            />
          </Box>
        </div>       
    );
}