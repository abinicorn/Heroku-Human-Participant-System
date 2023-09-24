import React from 'react';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import { Button, Dialog, DialogContent, DialogActions, DialogContentText } from '@mui/material';
import OptionDialog from '../Popup/OptonDialog';

export default function CloseCircleButton({ popupText, onClick, size = '48px' }) {
    const iconSize = `calc(${size} * 0.6)`;  // Making the icon size proportional to the button size

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const handleYesClick = () => {
        onClick();
        handleClose();
    };

    return (
        <div>
            <IconButton 
                style={{
                    backgroundColor: 'red',
                    color: 'white',
                    borderRadius: '50%',
                    width: size,
                    height: size,
                    fontSize: iconSize  // Setting the font size which the SvgIcon will inherit
                }}
                onClick={handleClickOpen}
            >
                <SvgIcon fontSize="inherit" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" stroke="white" strokeWidth="3.5"/>
                </SvgIcon>
            </IconButton>

            <OptionDialog
                open={open}
                onClose={handleClose}
                popupText={popupText}
                onClick={handleYesClick}
            />

            {/* <Dialog
            open={open}
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
            <Button variant="contained" onClick={handleYesClick}>YES</Button>
            <Button variant="contained" onClick={handleClose}>NO</Button>
            </DialogActions>
            </Dialog> */}
        </div>
    );
}
