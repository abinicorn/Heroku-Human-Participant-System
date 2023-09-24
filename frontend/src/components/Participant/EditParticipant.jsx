import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, FormControlLabel, Switch,Grid, 
    Typography, Chip, Input, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CustomCheckbox from '../Button/CustomCheckbox';
import ConfirmPopup from '../Popup/ConfirmPopup';
import OptionPopup from '../Popup/OptionPopup';
import { checkEmailValidation } from '../../utils/checkEmailValidation';
import { checkPhoneNumValidation } from '../../utils/checkPhoneNumValidation'


export default function EditParticipant({participant, onSave, isAnonymous}) {
    const [localParticipant, setLocalParticipant] = useState(participant);
    const [editOpen, setEditOpen] = useState(false); 
    const [popUpOpen, setPopUpOpen] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [phoneNumError, setPhoneNumError] = useState('');

    useEffect(() => {
        if (editOpen) {
            setLocalParticipant(participant);  // Reset localParticipant when the dialog opens
        }
    }, [editOpen, participant]);

    const resetData = () => {
        setEmailError('');
        setPhoneNumError('');
    }

    const handleAddTag = (tag) => {
        if (!localParticipant.participantInfo.tagsInfo.includes(tag)) {
            setLocalParticipant(prev => ({ 
                ...prev, 
                participantInfo: {
                    ...prev.participantInfo,
                    tagsInfo: [...prev.participantInfo.tagsInfo, tag]
                }
            }));
        }
    };

    const handleDeleteTag = (tagToDelete) => {
        setLocalParticipant(prev => ({
            ...prev,
            participantInfo: {
                ...prev.participantInfo,
                tagsInfo: prev.participantInfo.tagsInfo.filter(tag => tag !== tagToDelete)
            }
        }));
    };

    const handleSave = () => {
        if (!checkEmailValidation(localParticipant.participantInfo.email)) {
            setEmailError('Invalid email format');
            return false;
        }
        if (localParticipant.participantInfo.phoneNum && !checkPhoneNumValidation(localParticipant.participantInfo.phoneNum)) {
            setPhoneNumError('Invalid phone number format');
            return false;
        }
        onSave(localParticipant);
        console.log('Saved!');
        return true;
    };

    const handleClose = () => {
        setEditOpen(false);
        resetData();
    };

    return (
        <div>
            {/* This button will trigger the edit dialog */}
            <IconButton onClick={() => setEditOpen(true)}>
                <EditIcon color="primary"/>
            </IconButton>

            <Dialog open={editOpen} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle align="center">
                    <Typography variant="h5" color="primary" style={{ marginBottom: '20px' }}><strong>Edit Participant</strong></Typography>
                </DialogTitle>
                <DialogContent>
                    { !isAnonymous && 
                    <>
                        <TextField 
                            fullWidth 
                            label="First Name" 
                            variant="outlined" 
                            value={localParticipant.participantInfo.firstName}
                            onChange={(e) => setLocalParticipant(prev => ({
                                ...prev,
                                participantInfo: {
                                    ...prev.participantInfo,
                                    firstName: e.target.value
                                }
                            }))}
                            style={{marginTop: '20px'}}
                        />
                        <TextField 
                            fullWidth 
                            label="Last Name" 
                            variant="outlined" 
                            value={localParticipant.participantInfo.lastName}
                            onChange={(e) => setLocalParticipant(prev => ({
                                ...prev,
                                participantInfo: {
                                    ...prev.participantInfo,
                                    lastName: e.target.value
                                }
                            }))}
                            style={{marginTop: '20px'}}
                        />
                    </>}
                    <TextField 
                        fullWidth 
                        label="Email" 
                        variant="outlined" 
                        value={localParticipant.participantInfo.email}
                        onChange={(e) => {
                            setLocalParticipant(prev => ({
                                ...prev,
                                participantInfo: {
                                    ...prev.participantInfo,
                                    email: e.target.value
                                }
                            }));
                            setEmailError('');
                        }}
                        error={!!emailError}
                        helperText={emailError}
                        style={{marginBottom: '20px', marginTop: '20px'}}
                    />
                    { !isAnonymous && <TextField 
                        fullWidth 
                        label="Phone Number" 
                        variant="outlined" 
                        value={localParticipant.participantInfo.phoneNum}
                        onChange={(e) => {
                            setLocalParticipant(prev => ({
                            ...prev,
                            participantInfo: {
                                ...prev.participantInfo,
                                phoneNum: e.target.value
                            }
                            }));
                            setPhoneNumError('');
                        }}
                        error={!!phoneNumError}
                        helperText={phoneNumError}
                        style={{marginBottom: '20px'}}
                    />}
                    <FormControlLabel
                        control={
                            <CustomCheckbox 
                                checked={localParticipant.participantInfo.isWillContact}
                                onChange={() => setLocalParticipant(prev => ({
                                    ...prev,
                                    participantInfo: {
                                        ...prev.participantInfo,
                                        isWillContact: !prev.participantInfo.isWillContact
                                    }
                                }))}
                            />
                        }
                        label="This participant is willing to join in the future studies."
                    />
                    <FormControlLabel
                        control={
                            <CustomCheckbox 
                                checked={localParticipant.isGift}
                                onChange={() => setLocalParticipant(prev => ({
                                    ...prev,
                                    isGift: !prev.isGift
                                }))}
                            />
                        }
                        label="This participant wins a gift."
                    />
                    <FormControlLabel
                        control={
                            <CustomCheckbox 
                                checked={localParticipant.isWIllReceiveReport}
                                onChange={() => setLocalParticipant(prev => ({
                                    ...prev,
                                    isWIllReceiveReport: !prev.isWIllReceiveReport
                                }))}
                            />
                        }
                        label="This participant is willing to receive the report."
                    />
                    <Typography variant="h6" style={{ marginTop: '20px', marginBottom: '20px' }}>Tags:</Typography>
                    <Grid container spacing={2}>
                        {localParticipant.participantInfo.tagsInfo.map((tag, index) => (
                            <Grid item key={index}>
                                <Chip 
                                    label={tag}
                                    onDelete={() => handleDeleteTag(tag)}
                                />
                            </Grid>
                        ))}
                        <Grid item>
                            <Input 
                                placeholder="Add Tag"
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter') {
                                        handleAddTag(event.target.value);
                                        event.target.value = '';  // Clear the input after adding the tag
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Typography variant="h6" style={{ marginTop: '20px' }}>
                        Status:
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch 
                                checked={localParticipant.isComplete} 
                                onChange={() => setLocalParticipant(prev => ({
                                    ...prev,
                                    isComplete: !prev.isComplete
                                }))}
                            />
                        }
                        label={
                            localParticipant.isComplete ? 
                            <Chip label="Completed" color="success"/> : 
                            <Chip label="Processing" color="success" variant="outlined" />
                        }
                        labelPlacement="start"
                        style={{ marginTop: '20px'}}
                    />
                    <Typography variant="h6" style={{ marginTop: '20px' }}>Note:</Typography>
                    <TextField 
                        fullWidth 
                        label="Note" 
                        variant="outlined" 
                        value={localParticipant.note}
                        onChange={(e) => setLocalParticipant(prev => ({
                            ...prev,
                            note: e.target.value
                        }))}
                        multiline
                        rows={4}
                        style={{ marginBottom: '20px', marginTop: '20px'}}
                    />
                </DialogContent>
                <DialogActions style={{ padding: '20px'}}>
                    <ConfirmPopup buttonText={'Save'} popupText={'Your edit has been saved!'} open={popUpOpen} onClick={handleSave} onConfirm={handleClose}/>
                    <OptionPopup buttonText={'Cancel'} popupText={'Do you want to cancel?'} onClick={handleClose}/>
                </DialogActions>
            </Dialog>
        </div>
    );
}
