import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Button, Box, DialogActions } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ParticipantsTable from './StudyParticipantTable'

export default function StudyParticipantTable() {
    const [open, setOpen] = useState(false);
    // Convert the participants' emails into a comma-separated string

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div style={{marginBottom: '8px'}}>
            {/* This button will open the mailing list dialog */}
            <Button variant="contained" color="primary" onClick={handleOpen} startIcon={<FullscreenIcon/>}>
                view in fullScreen
            </Button>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xl" fullScreen>
                <DialogContent style={{ height: '90vh', width: '97vw' }}>
                    <ParticipantsTable />
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" onClick={handleClose} startIcon={<FullscreenExitIcon/>}>
                        Exit fullscreen
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
