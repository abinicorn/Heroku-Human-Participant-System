import React from 'react';
import Button from '@mui/material/Button';
import OptonDialog from './OptonDialog';  // Import the new component

export default function OptionPopup({ buttonText, popupText, onClick }) {
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
    }

    return (
        <div>
            <Button variant="contained" color="secondary" onClick={handleClickOpen}>
                {buttonText}
            </Button>

            <OptonDialog
                open={open}
                onClose={handleClose}
                popupText={popupText}
                onClick={handleYesClick}
            />
        </div>
    );
}

// import * as React from 'react';
// import Button from '@mui/material/Button';
// import Dialog from '@mui/material/Dialog';
// import DialogActions from '@mui/material/DialogActions';
// import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
// import DialogTitle from '@mui/material/DialogTitle';

// export default function OptionPopup({ buttonText, popupText, onClick }) {
//     const [open, setOpen] = React.useState(false);

//     const handleClickOpen = () => {
//         setOpen(true);
//     };
//     const handleClose = () => {
//         setOpen(false);
//     };

//     return (
//         <div>
//             <Button variant="contained" color="secondary" onClick={handleClickOpen}>
//             {buttonText}
//             </Button>

//             <Dialog
//                 open={open}
//                 onClose={handleClose}
//                 aria-labelledby="alert-dialog-title"
//                 aria-describedby="alert-dialog-description"
//             >
//                 <DialogContent>
//                 <DialogContentText id="alert-dialog-description">
//                     {popupText}
//                 </DialogContentText>
//                 </DialogContent>
//                 <DialogActions>
//                 <Button variant="contained" onClick={onClick}>YES</Button>
//                 <Button variant="contained" onClick={handleClose}>NO</Button>
//                 </DialogActions>
//             </Dialog>
//         </div>
//     );
// }