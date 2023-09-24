import React, { useState, useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Button, Box } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

export default function MailingList({ context, selectedRows }) {
    const [open, setOpen] = useState(false);
    // Convert the participants' emails into a comma-separated string
    const {studyParticipants} = useContext(context);
    let emails = 'Mailing list is empty.'
    // if (studyParticipants && studyParticipants.length > 0) {
    //     emails = studyParticipants.map(sp => sp.participantInfo.email).join(', ');
    // }
    if (studyParticipants && studyParticipants.length > 0 && selectedRows && selectedRows.length > 0) {
        // Filter out participants who are selected and map to their emails
        emails = studyParticipants
                    .filter(sp => selectedRows.includes(sp._id))  // Assuming _id is a unique identifier for each participant
                    .map(sp => sp.participantInfo.email)
                    .join(', ');
    }

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            {/* This button will open the mailing list dialog */}
            <Button variant="contained" color="primary" onClick={handleOpen} startIcon={<MailOutlineIcon />}>
                Show Mailing List
            </Button>

            <Dialog open={open} onClose={handleClose} fullWidth>
                <DialogTitle align="center">
                    <Typography variant="h5" component="div" color="primary" style={{ marginBottom: '20px' }}>
                        <strong>Mailing List</strong>
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <textarea 
                        value={emails} 
                        readOnly 
                        style={{ 
                            width: '96%',
                            height: '400px',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            resize: 'none',
                            // overflowY: 'auto',
                            // whiteSpace: 'pre-wrap',
                            // wordBreak: 'break-word'
                        }}
                    />
                </DialogContent>
                <Box display="flex" justifyContent="center" marginTop={2} style={{ padding: '20px'}}>
                    <Button variant="contained" color="primary" onClick={handleClose}>
                        Close
                    </Button>
                </Box>
            </Dialog>
        </div>
    );
}
