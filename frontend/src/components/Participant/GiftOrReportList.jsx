import React, { useState, useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, List, ListItem, Grid, Button, Typography, Box, Switch, DialogActions } from '@mui/material';
import CustomCheckbox from '../Button/CustomCheckbox';
import CloseCircleButton from '../Button/CloseCircleButton';
import DescriptionIcon from '@mui/icons-material/Description';
import RedeemIcon from '@mui/icons-material/Redeem';
import '../../styles/GiftList.css';
import { StudyParticipantContext } from '../../providers/StudyPaticipantsProvider';

export default function GiftList({ type = 'gift' }) {
    const [open, setOpen] = useState(false);
    const {studyParticipants, updateStudyParticipant, updateSpecificStudyParticipant} = useContext(StudyParticipantContext);

    const handleToggleSentStatus = (_id) => {
        const participantToUpdate = studyParticipants.find(p => p._id === _id);
        let updatedParticipant;

        if (type === 'gift') {
            updatedParticipant = { ...participantToUpdate, isSentGift: !participantToUpdate.isSentGift };
        } else if (type === 'report') {
            updatedParticipant = { ...participantToUpdate, isSentReport: !participantToUpdate.isSentReport };
        }

        console.log(updatedParticipant);
        updateSpecificStudyParticipant(updatedParticipant);
    };

    const getTitle = () => {
        return type === 'gift' ? 'Gift List' : 'Report Recipients List';
    }

    const shouldIncludeParticipant = (participant) => {
        return type === 'gift' ? participant.isGift : participant.isWIllReceiveReport;
    }

    const getCheckboxState = (participant) => {
        return type === 'gift' ? participant.isSentGift : participant.isSentReport;
    }

    return (
        <div>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setOpen(true)}
                startIcon={type === 'gift' ? <RedeemIcon /> : <DescriptionIcon />}
            >
                {type === 'gift' ? 'Show Gift List' : 'Show Report Recipients'}
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
                <Box marginLeft={8} marginRight={8}>
                    <DialogTitle align="center">
                            <Typography variant="h5" color="primary" style={{ marginBottom: '20px'}}><strong>{getTitle()}</strong></Typography>
                            <ListItem>
                                    <Grid container spacing={2} justifyContent="space-between">
                                        <Grid item xs={3}><Typography color="primary"><strong>Serial No.</strong></Typography></Grid>
                                        <Grid item xs={5}><Typography color="primary"><strong>Email</strong></Typography></Grid>
                                        <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ marginLeft: '15%' }}>
                                                <Typography color="primary" style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                                                    <strong>{type === 'gift' ? 'Sent Gift' : 'Sent Report'}</strong>
                                                </Typography>
                                            </div>
                                        </Grid>
                                    </Grid>
                                </ListItem>
                        </DialogTitle>
                    <DialogContent style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        <List>
                            {studyParticipants && studyParticipants.length > 0 ? (
                                studyParticipants.map((participant) => (
                                    shouldIncludeParticipant(participant) && (
                                        <ListItem key={participant._id}>
                                            <Grid container alignItems="center" spacing={2} justifyContent="space-between">
                                                <Grid item xs={3}>
                                                    <Typography color="primary">{participant.serialNum}</Typography>
                                                </Grid>
                                                <Grid item xs={5}>
                                                    <div className="emailContainer">
                                                        <Typography color="primary">{participant.participantInfo.email}</Typography>
                                                    </div>
                                                </Grid>
                                                <Grid item xs={2} style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <CustomCheckbox checked={getCheckboxState(participant)} onChange={() => handleToggleSentStatus(participant._id)} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                    )
                                ))
                            ) : (
                                 <Typography color="textSecondary">No participants available.</Typography>
                            )}
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" color="primary" onClick={() => setOpen(false)}>
                            Close
                        </Button>
                    </DialogActions>
                </Box>
                {/* <Box display="flex" justifyContent="center" marginTop={2} style={{ padding: '20px'}}>
                    <Button variant="contained" color="primary" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                </Box> */}
            </Dialog>
        </div>
    );
}

// export default function GiftList({type = 'gift' }) {
//     const [open, setOpen] = useState(false);
//     const dispatch = useDispatch();
//     const studyParticipants = useSelector(state => state.studyParticipants);
//     const [participants, setParticipants] = useState(studyParticipants);

//     const handleToggleGift = (serialNum) => {
//         const updatedParticipants = participants.map(p => {
//             if (p.serialNum === serialNum) {
//                 if (type === 'gift') {
//                     return { ...p, isSentGift: !p.isSentGift };
//                 } else if (type === 'report') {
//                     return { ...p, isSentReport: !p.isSentReport };
//                 }
//             }
//             return p;
//         });
//         setParticipants(updatedParticipants);
//     };

//     const handleOpen = () => {
//         setOpen(true);
//     };

//     const handleClose = () => {
//         setOpen(false);
//     };

//     const handleDelete = (serialNum) => {
//         console.log(`Delete participant with serialNum: ${serialNum}`);
//         // Here you can implement the logic to remove the participant from the list
//     };

//     const getTitle = () => {
//         return type === 'gift' ? 'Gift List' : 'Report Recipients List';
//     }

//     const shouldIncludeParticipant = (participant) => {
//         return type === 'gift' ? participant.isGift : participant.isWIllReceiveReport;
//     }

//     const getCheckboxState = (participant) => {
//         return type === 'gift' ? participant.isSentGift : participant.isSentReport;
//     }

//     return (
//         <div>
//             <Button 
//                 variant="contained" 
//                 color="primary" 
//                 onClick={handleOpen}
//                 startIcon={type === 'gift' ? <RedeemIcon /> : <DescriptionIcon />}
//             >
//                 {type === 'gift' ? 'Show Gift List' : 'Show Report Recipients'}
//             </Button>

//             <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">

//                 <DialogContent>
//                     <List>
//                         {participants.map((participant) => (
//                             shouldIncludeParticipant(participant) && (
//                                 <ListItem key={participant.serialNum}>
//                                     <Grid container alignItems="center">
//                                         <Grid item xs={3}>
//                                             <Typography color="primary">{participant.serialNum}</Typography>
//                                         </Grid>
//                                         <Grid item xs={5}>
//                                             <div className="emailContainer">
//                                                 <Typography color="primary">{participant.participantInfo.email}</Typography>
//                                             </div>
//                                         </Grid>
//                                         <Grid item xs={2} style={{ display: 'flex', justifyContent: 'center' }}>
//                                             <CustomCheckbox checked={getCheckboxState(participant)} onChange={() => handleToggleGift(participant.serialNum)} />
//                                         </Grid>
//                                         <Grid item xs={2} style={{ display: 'flex', justifyContent: 'center' }}>
//                                             <CloseCircleButton onClick={() => handleDelete(participant.serialNum)} size="25px"/>
//                                         </Grid>
//                                     </Grid>
//                                 </ListItem>
//                             )
//                         ))}
//                     </List>
//                 </DialogContent>
//                 <Box display="flex" justifyContent="center" marginTop={2} style={{ padding: '20px'}}>
//                     <Button variant="contained" color="primary" onClick={handleClose}>
//                         Close
//                     </Button>
//                 </Box>
//             </Dialog>
//         </div>
//     );
// }
