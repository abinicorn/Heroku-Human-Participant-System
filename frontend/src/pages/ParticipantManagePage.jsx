import React, { useState, useEffect, useContext } from 'react';
import { Button, Box, Typography, Grid } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
// import mockParticipants from '../TestData';
import ParticipantsTable from '../components/Participant/StudyParticipantTable';
import AddParticipant from '../components/Participant/AddParticipant';
import MailingList from '../components/Participant/MailingList';
import GiftOrReportList from '../components/Participant/GiftOrReportList';
import StudyPaticipantTablePopUp from '../components/Participant/StudyParticipantTablePopUp'

import { StudyParticipantContext } from '../providers/StudyPaticipantsProvider';
import { CurrentUserContextProvider } from '../providers/CurrentUserProvider';
import { StudyResearcherContext } from '../providers/StudyResearcherContextProvider';
import { DataGridProvider } from '../providers/DataGridProvider';

export default function ParticipantManagePage() {
    const { studyInfo } = useContext(StudyResearcherContext);
    const { setIsAnonymous, selectedRows} = useContext(StudyParticipantContext);

    setIsAnonymous(studyInfo.studyType === "online-survey");

    console.log('studyInfo',studyInfo)

    return (
        <div style={{maxHeight: '100vh', maxWidth: '100vw', overflowY: 'auto', overflowX: 'hidden'}}>
            <Box sx={{ display: 'flex'}}>
                <CurrentUserContextProvider>
                    <Navbar/>
                    <Sidebar/>
                </CurrentUserContextProvider>
            </Box>
            <Box component="main" marginLeft={35} marginRight={20} marginTop={10} marginBottom={7}>
                <h1>{studyInfo.studyName}</h1>
                <Typography color='primary'><h1>Participants Management</h1></Typography>
            </Box>
            <Box marginLeft={37} marginRight={15}>
                <Grid
                    container
                    direction="row"
                    spacing={2}
                    justifyContent="space-between"
                    alignItems="center"
                    >
                            <GiftOrReportList 
                                type='report'
                            />
                            <GiftOrReportList 
                                type='gift'
                            />
                            <MailingList context={StudyParticipantContext} selectedRows={selectedRows}/>
                            <AddParticipant/>
                </Grid>
            </Box>
            <Box 
                marginLeft={35} marginRight={5} marginTop={7} marginBottom={10}
                sx={{display:'flex', flexDirection: 'column', alignItems: 'center' }}
            >
                <DataGridProvider>
                   <StudyPaticipantTablePopUp/>
                    <ParticipantsTable/> 
                </DataGridProvider>
                
            </Box>
        </div>
    )
}
