import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Button, Box } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

export default function SessionMailingList({participants}) {
    const [open, setOpen] = useState(false);
    const emails = participants.map(sp => sp.participantInfo.email).join(', ');

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
                Mailing List
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
                            resize: 'none'
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