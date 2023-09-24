import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function MsgPopup({isOpen, setOpen, popupText, onClick}) {
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Dialog
                open={isOpen}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {popupText}
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button variant="contained" onClick={()=>{
                    onClick();
                    setOpen(false);
                }}>YES</Button>
                <Button variant="contained" onClick={handleClose}>NO</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}