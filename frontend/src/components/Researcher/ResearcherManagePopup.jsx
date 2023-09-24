import * as React from 'react';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Avatar from '@mui/material/Avatar';
import AddRsearcherPopup from './AddResearcherPopup';
import CloseCircleButton from '../Button/CloseCircleButton';
import {
    Typography,
    TextField,
    Button,
    Stack,
    Alert
} from '@mui/material';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import "../../styles/App.css";
import { StudyResearcherContext } from '../../providers/StudyResearcherContextProvider';
import axios from 'axios';
import OptionPopup from '../Popup/OptionPopup';
import MsgPopup from '../Popup/MsgPopup';
import DeletePopupButton from '../Button/DeletePopupButton';




const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function stringToColor(string) {
    let hash = 0;
    let i;
    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */
    return color;
}

function stringAvatar(name) {
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
    };
}


export default function ResearcherManagePopup() {
    const [researcherId, setResearcherId] = React.useState()

    const {
        researcherList,
        studyInfo,
        removeResearcher,
        fetchResearcherbyEmail,
        refreshResearcherContext
    } = React.useContext(StudyResearcherContext);

    const [open, setOpen] = React.useState(false);
    const [email, setEmail] = React.useState();
    const [msgOpen, setMsgOpen] = React.useState(false);


    const handleClickOpen= () => {
        setOpen(true);

    };

    const handleDeleteResearcher = (researcherId) => {
        removeResearcher(studyInfo._id, researcherId);
    }

    const handleClose = () => {
        setOpen(false);
    };


    const handleSearchClick = async () => {
        const response = await axios.get(`http://localhost:3001/researcher/email/${email}`);
        if (response.status === 200) {
            setMsgOpen(true);
            setResearcherId(response.data._id);
            console.log("success");
        } else{
            alert("The Researcher is not found in the system. Please add the researcher to the system first.");
        }
    };

    const handleAddRsearcher = async () => {
        try {
            console.log(researcherId);
            const data = await axios.put(`http://localhost:3001/study/associateResearcher/${studyInfo._id}/${researcherId}`);
            if (data.status === 200) {
                console.log("success");
                refreshResearcherContext();
            }
        } catch (error) {
            console.log(error);
        }

    }


    //TO DO: what if the researcher is the only one in the study, should not be allowed to be removed
    const listResearcher = researcherList ? researcherList.map(researcher =>
        <Stack direction="row" spacing={2} margin="20px" key={researcher._id}>
            <Avatar
            // {...stringAvatar(researcher.username)}
            />
            <Typography variant="subtitle1" sx={{ ml: 1 }}>
                {researcher.username}
            </Typography>
            <DeletePopupButton
                popupText={"Do you want to remove this researcher from the study?"}
                onClick={() =>{handleDeleteResearcher(researcher._id)}}
                size={'10px'}
            />
        </Stack>
    ) : null;





    return (
        <>
            <Typography textAlign="center" onClick={handleClickOpen}>Manage Researchers</Typography>
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Manage Researchers
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent dividers>
                    <Typography gutterBottom>
                        <h3> Current Reseracher for this Study</h3>
                        {listResearcher}
                    </Typography>

                    <Typography gutterBottom>
                        <h3>Add New Researcher by Searching Email Address</h3>

                        {/* <TextField 
                        fullWidth 
                        type="email" 
                        label="Search by Email Address" 
                        size="Standard" 
                        margin="dense" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    /> */}
                        <Paper
                            component="form"
                            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 500 }}
                        >
                            <InputBase
                                sx={{ ml: 1, flex: 1 }}
                                placeholder="Search existing researchers by email address"
                                inputProps={{ 'aria-label': 'search by Email Address' }}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                }}
                            />

                            <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={handleSearchClick}>
                                <SearchIcon />
                            </IconButton>
                        </Paper>
                        <div className='align-right'>
                            <AddRsearcherPopup />
                        </div>

                    </Typography>
                    <MsgPopup isOpen={msgOpen} setOpen={setMsgOpen} popupText="Do you want to add researcher?" onClick={() => {
                        handleAddRsearcher(researcherId);
                    }} />

                </DialogContent>
                <DialogActions>
                    <Button autoFocus variant="contained" onClick={handleClose}>
                        Save changes
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </>
    );
}