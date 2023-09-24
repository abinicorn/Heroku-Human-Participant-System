import React, { useState, useEffect, useContext } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, TextField, FormControlLabel, 
    Grid, List, ListItem, ListItemText, Typography
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import AddIcon from '@mui/icons-material/Add';
import CustomCheckbox from '../Button/CustomCheckbox';
import CloseCircleButton from '../Button/CloseCircleButton';
import ConfirmPopup from '../Popup/ConfirmPopup';
import OptionPopup from '../Popup/OptionPopup';
// import usePost from '../../hooks/usePost';
// import useGet from '../../hooks/useGet'

import { StudyParticipantContext } from '../../providers/StudyPaticipantsProvider';

import { checkEmailValidation } from '../../utils/checkEmailValidation';
import { checkPhoneNumValidation } from '../../utils/checkPhoneNumValidation';

import Papa from 'papaparse';

export default function AddParticipant({ study_id }) {
    const [open, setOpen] = useState(false);
    const [firstName, setFirstName] = useState(''); 
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNum, setPhoneNum] = useState('');
    const [isWillContact, setIsWillContact] = useState(false);
    const [popUpOpen, setPopUpOpen] = useState(false);
    const [files, setFiles] = useState([]);
    const [csvData, setCsvData] = useState([]);

    const {addStudyParticipants, addParticipants, isAnonymous} = useContext(StudyParticipantContext);

    const [emailError, setEmailError] = useState('');
    const [phoneNumError, setPhoneNumError] = useState('');

    const checkValidateEmails = async () => {
        if (!firstName && ! lastName && !email && !phoneNum && files.length == 0) {
            setEmailError('Input an email or upload a csv file');
            return false;
        }

        if (firstName || lastName || email || phoneNum) {
            if (!email) {
                setEmailError('Email cannot be empty');
                return false;
            }

            if (!checkEmailValidation(email)) {
                setEmailError('Invalid email format');
                return false;
            }

            if (phoneNum && !checkPhoneNumValidation(phoneNum)) {
                setPhoneNumError('Invalid phone number format');
                return false;
            }
        }

        if (files.length > 0) {
            const parsedData = await parseUploadedFiles();
            let hasError = false;

            if (parsedData.invalidEmails.length > 0) {
                alert('CSV contains invalid or empty emails: ' + parsedData.invalidEmails.join(', '));
                hasError = true;
            }
        
            if (parsedData.invalidPhoneNums.length > 0) {
                alert('CSV contains invalid phone numbers: ' + parsedData.invalidPhoneNums.join(', '));
                hasError = true;
            }
        
            if (hasError) {
                return false;
            }
        }

        setEmailError('');
        setPhoneNumError(''); 
        handleSave();
        return true;
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        resetData();
    };

    const resetData = () => {
        setFirstName(''); 
        setLastName('');
        setEmail('');
        setPhoneNum('');
        setEmailError(''); 
        setPhoneNumError('');
        setIsWillContact(false);
        setFiles([]);
        setCsvData([]);
    };

    // read submitted csv files
    const parseFile = async (file, encounteredEmails, invalidEmails, invalidPhoneNums) => {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (result) => {
                    const uniqueRows = result.data.filter(row => {
                        let emailValid = true;
                        if (encounteredEmails.has(row.Email)) {
                            emailValid = false;
                        }
                        if (!checkEmailValidation(row.Email)) {
                            invalidEmails.push(row.Email); // Collect invalid emails
                            emailValid = false;
                        }
                        if (row.PhoneNum && !checkPhoneNumValidation(row.PhoneNum)) {
                            invalidPhoneNums.push(row.PhoneNum); // Collect invalid phone numbers
                        }
                        if (emailValid) {
                            encounteredEmails.add(row.Email);
                        }
                        return emailValid;
                    });
                    resolve(uniqueRows);
                },
                error: (err) => {
                    reject(err.message);
                }
            });
        });
    };
    
    const parseUploadedFiles = async () => {
        const encounteredEmails = new Set();
        const invalidEmails = [];
        const invalidPhoneNums = [];
        const results = await Promise.all(files.map(file => parseFile(file, encounteredEmails, invalidEmails, invalidPhoneNums)));
        return {
            validData: results.flat(),
            invalidEmails,
            invalidPhoneNums
        };
    };

    const assembleParticipantsData = async () => {
        const csvData = await parseUploadedFiles();
        console.log(csvData);
    
        // participants in csv files
        const csvParticipants = csvData.map(data => ({
            firstName: data.FirstName,
            lastName: data.LastName,
            email: data.Email,
            phoneNum: data.PhoneNum,
            isWillContact: data.IsWillContact.toLowerCase() === 'true' ? true : false
        }));
    
        console.log(csvParticipants);
    
        // participant input by manual
        let manualParticipant = {};
        if (email) {
            manualParticipant = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phoneNum: phoneNum,
                isWillContact: isWillContact
            };
        }

    
        // Combine both
        const allParticipants = [manualParticipant, ...csvParticipants];
    
        return { participants: allParticipants };
    };

    const handleFileUpload = (event) => {
        let uploadedFiles = [...event.target.files];
        setFiles(prevFiles => [...prevFiles, ...uploadedFiles]);
    };

    const handleFileDelete = (fileToDelete) => {
        setFiles(prevFiles => prevFiles.filter(file => file !== fileToDelete));
    };

    const handleSave = async () => {

        try {

            const newParticipants = await assembleParticipantsData();
            console.log(newParticipants);
    
            // use to add participants
            const actionResult1 = await addParticipants(newParticipants.validData);
    
            if (actionResult1) {
                console.log("Participant data received", actionResult1);
                
                // extract all participants '_id'
                const participantIds = [...(actionResult1.success || []), ...(actionResult1.existing || [])].map(p => p._id);
                
                // use Redux thunk to add study participants
                const newStudyParticipants = {
                    participantIds: participantIds 
                };

                console.log("studyParticipantsPayload", newStudyParticipants);
                const actionResult2 = await addStudyParticipants(newStudyParticipants);
    
                if (actionResult2 && actionResult2.length > 0) {
                    console.log('StudyParticipant Response:', actionResult2);
                } else {
                    console.log('all imput study participants are existing!');
                }
            }
        } catch (error) {
            console.error("Error posting participant or study participant:", error);
        }
    };


    return (
        <div>
            <Button variant="contained" color="primary" onClick={handleOpen} startIcon={<AddIcon />}>
                Add New Participant
            </Button>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle align="center">
                    <Typography variant="h5" color="primary" style={{ marginBottom: '20px' }}><strong>Add New Participant</strong></Typography>
                </DialogTitle>
                <DialogContent>
                    { !isAnonymous &&
                    <>
                        <TextField 
                            fullWidth 
                            label="First Name"  
                            variant="outlined" 
                            value={firstName}  
                            onChange={(e) => setFirstName(e.target.value)} 
                            style={{ marginTop: '20px'}}
                        />
                        <TextField 
                            fullWidth 
                            label="Last Name"   
                            variant="outlined" 
                            value={lastName}    
                            onChange={(e) => setLastName(e.target.value)}
                            style={{ marginTop: '20px'}}
                        />
                    </>
                    }
                    <TextField 
                        fullWidth 
                        label="Email" 
                        variant="outlined" 
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailError('');  // clear the error when user types
                        }}
                        error={!!emailError}
                        helperText={emailError}
                        style={{ marginBottom: '20px', marginTop: '20px'}}
                    />
                    { !isAnonymous && <TextField 
                        fullWidth 
                        label="Phone Number" 
                        variant="outlined" 
                        value={phoneNum}
                        onChange={(e) => {
                            setPhoneNum(e.target.value);
                            setPhoneNumError('');
                        }}
                        error={!!phoneNumError}
                        helperText={phoneNumError}
                        style={{marginBottom: '20px'}}
                    />}
                    <FormControlLabel
                        control={
                            <CustomCheckbox 
                                checked={isWillContact}
                                onChange={() => setIsWillContact(!isWillContact)}
                            />
                        }
                        label="This participant is willing to join in the future studies."
                    />
                    <Typography variant="h6" style={{ marginTop: '20px' }}>
                        Uploaded Files:
                    </Typography>
                    <List>
                        {files.map((file, index) => (
                            <ListItem key={index}>
                                <Grid container alignItems="center" spacing={2} justifyContent="flex-end">
                                    <Grid item xs={1} container justifyContent="flex-end">
                                        <FileCopyIcon />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <ListItemText primary={file.name} />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <CloseCircleButton onClick={() => handleFileDelete(file)} size="28px" />
                                    </Grid>
                                </Grid>
                            </ListItem>
                        ))}
                    </List>
                    <Grid container direction="column" alignItems="center" style={{ marginTop: '20px' }}>
                        <Button
                            variant="contained"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            >
                                Upload a CSV File
                            <input
                                type="file"
                                hidden
                                onChange={handleFileUpload}
                                accept=".csv"
                            />
                        </Button>
                    </Grid>
                </DialogContent>
                <DialogActions style={{ padding: '20px'}}>
                    {emailError && <Typography color="error">{emailError}</Typography>}
                    <ConfirmPopup 
                        buttonText={'Add'} 
                        popupText={'The participants have been added'} 
                        open={popUpOpen} 
                        onClick={async() => {
                            return await checkValidateEmails();
                        }} 
                        onConfirm={handleClose}
                    />
                    <OptionPopup buttonText={'Cancel'} popupText={'Do you want to cancel?'} onClick={handleClose}/>
                </DialogActions>
            </Dialog>
        </div>
    );
}
