import * as React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import SessionMailingList from './SessionMailingList';
import { SessionContext } from '../../providers/SessionContextProvider';
import { combineCodeSerialNum } from '../../utils/combineCodeSerialNum';
import { StudyResearcherContext } from '../../providers/StudyResearcherContextProvider';

export default function SessionParticipantList({ targetSessionId }) {
    
    const [open, setOpen] = React.useState(false);
    const scroll ='paper';
    const { studyInfo } = React.useContext(StudyResearcherContext);
    const { sessions, studyParticipantInfo } = React.useContext(SessionContext);
    const targetSession = sessions.find(s => s._id === targetSessionId);
    let participantInfo = []
    if (studyParticipantInfo) {
        participantInfo = studyParticipantInfo.reduce(
            (result, item) =>
            targetSession.participantList.some(el => el._id === item.participantInfo._id)
                ? [...result, item]
                : result,
            []
        );
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Typography textAlign="center" onClick={handleClickOpen}>View participant</Typography>
            <Dialog
                open={open}
                onClose={handleClose}
                scroll={scroll}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
                maxWidth="lg"
                fullWidth      
            >
                <DialogTitle id="scroll-dialog-title">View Participants</DialogTitle>
                <DialogContent dividers={scroll === 'paper'}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                            <TableRow>
                                <TableCell>Serial Number</TableCell>
                                <TableCell align="right">First Name</TableCell>
                                <TableCell align="right">Last Name</TableCell>
                                <TableCell align="right">Email</TableCell>
                                <TableCell align="right">Phone Number</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            {participantInfo.map((info) => (
                                <TableRow
                                key={info._id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                <TableCell component="th" scope="row">{combineCodeSerialNum( studyInfo.studyCode, info.serialNum)}</TableCell>
                                <TableCell align="right">{info.participantInfo.firstName}</TableCell>
                                <TableCell align="right">{info.participantInfo.lastName}</TableCell>
                                <TableCell align="right">{info.participantInfo.email}</TableCell>
                                <TableCell align="right">{info.participantInfo.phoneNum}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <SessionMailingList participants={participantInfo}/>
                    <Button variant="contained" onClick={handleClose} sx={{marginLeft: 1}}>Close</Button>
                </DialogActions>
            </Dialog>
    </div>
    );
}