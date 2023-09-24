import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function ConfirmPopup({buttonText, popupText, onClick, onConfirm}) {
    const [open, setOpen] = React.useState(false);
    
    // const handleClickOpen = () => {
    //     if (onClick) { // Ensure onClick is provided and is a function
    //         onClick();
    //     }
    //     setOpen(true);
    // };
    const handleClickOpen = async () => {
        let shouldOpen = true; // Default to true in case onClick is not provided
    
        if (onClick) { // Ensure onClick is provided and is a function
            shouldOpen = await onClick();
        }
    
        if (shouldOpen) {
            setOpen(true);
        }
    };
    

    const handleClose = () => {
        if(onConfirm) {
            onConfirm();
        }
        setOpen(false);
    };


    return (
        <div>
            <Button variant="contained" onClick={handleClickOpen}>
            {buttonText}
            </Button>

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                {"Confirmation"}
                </DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {popupText}
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button variant="contained" onClick={handleClose}>OK</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}