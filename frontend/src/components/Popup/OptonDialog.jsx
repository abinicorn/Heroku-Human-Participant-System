// ConfirmDialog.jsx
import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';

export default function OptionDialog({ open, onClose, popupText, onClick }) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                {popupText}
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button variant="contained" onClick={onClick}>YES</Button>
            <Button variant="contained" onClick={onClose}>NO</Button>
            </DialogActions>
        </Dialog>
    );
}
