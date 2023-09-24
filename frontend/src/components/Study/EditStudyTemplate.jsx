import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    TextField,
    Select,
    MenuItem,
    Button,
    Grid,
    FormLabel,
    Chip,
    Stack,
} from '@mui/material';
import Navbar from '../Navbar';
import CreateIcon from '@mui/icons-material/Create';
import GroupIcon from '@mui/icons-material/Group';
import ScienceIcon from '@mui/icons-material/Science';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import axios from 'axios';

const apiClient = axios.create();

export default function EditStudyTemplate({ isEditMode, studyData, setStudyData, handleSubmit }) {
    const [locationInput, setLocationInput] = useState('');

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setStudyData({
            ...studyData,
            [name]: value
        });
    };

    const addLocation = () => {
        if (locationInput.trim() !== '') {
            setStudyData({
                ...studyData,
                location: [...studyData.location, locationInput],
            });
            setLocationInput(''); 
        }
    };

    const removeLocation = (index) => {
        const newLocations = studyData.location.filter((_, i) => i !== index);
        setStudyData({ ...studyData, location: newLocations });
    };



    return (
        <div>
            <Navbar />
            <div style={{ paddingTop: '64px' }}>
                <Typography variant="h4" component="h1" color="grey" 
                            style={{
                                margin: '20px',
                            }} gutterBottom>
                    Study Details
                </Typography>

                <Container>
                    {/* maxWidth="sm" */}
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>

                            <Grid item xs={12}>
                                <FormLabel>Design a code for your study</FormLabel>
                                <TextField
                                    fullWidth
                                    name="studyCode"
                                    value={studyData.studyCode}
                                    onChange={handleInputChange}
                                    required
                                    margin="dense"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormLabel>What's the title of the study?</FormLabel>
                                <TextField
                                    fullWidth
                                    name="studyName"
                                    value={studyData.studyName}
                                    onChange={handleInputChange}
                                    required
                                    margin="dense"
                                />
                            </Grid>


                            <Grid item xs={4}>
                                <FormLabel >What's the type of the study: </FormLabel>
                                <Select
                                    fullWidth
                                    name="studyType"
                                    value={studyData.studyType}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <MenuItem value="interview"> <CreateIcon style={{ minWidth: '40px' }} />  Interview</MenuItem>
                                    <MenuItem value="focus-group"> <GroupIcon style={{ minWidth: '40px' }} /> Focus Group</MenuItem>
                                    <MenuItem value="experiment"> <ScienceIcon style={{ minWidth: '40px' }} /> Experiment</MenuItem>
                                    <MenuItem value="online-survey"> <AssignmentIcon style={{ minWidth: '40px' }} /> Online Survey</MenuItem>
                                    <MenuItem value="questionnaire"> <ContactPageIcon style={{ minWidth: '40px' }} /> Questionnaire</MenuItem>
                                </Select>
                            </Grid>

                            <Grid item xs={12}>
                                <FormLabel>Description: </FormLabel>
                                <TextField
                                    fullWidth
                                    id="outlined-multiline-static"
                                    label="Write the description here"
                                    name="description"
                                    value={studyData.description}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={10}
                                    variant="outlined"
                                    margin="dense"
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <FormLabel>Recruitment Start Date</FormLabel>
                                <TextField
                                    fullWidth
                                    type="date"
                                    name="recruitmentStartDate"
                                    value={studyData.recruitmentStartDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormLabel>Recruitment Close Date</FormLabel>
                                <TextField
                                    fullWidth
                                    type="date"
                                    name="recruitmentCloseDate"
                                    value={studyData.recruitmentCloseDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormLabel>Location(s) Details</FormLabel>

                                <Stack direction="row" spacing={1}>
                                    {studyData.location.map((loc, index) => (
                                        <Chip
                                            key={index}
                                            label={loc}
                                            onDelete={() => removeLocation(index)}
                                            color="primary"
                                            variant="outlined"
                                            style={{ margin: '4px' }}
                                        />
                                    ))
                                    }
                                </Stack>
                                <TextField
                                    // fullWidth
                                    label="Add your location here"
                                    name="location"
                                    value={locationInput}
                                    onChange={(e) => setLocationInput(e.target.value)}
                                    margin="dense"
                                />

                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="outlined" onClick={addLocation}>Add new location</Button>
                            </Grid>
                            <Grid item xs={6}>
                                <FormLabel>Number of Participants</FormLabel>
                                <TextField
                                    fullWidth
                                    label="Number"
                                    name="participantNum"
                                    value={studyData.participantNum}
                                    onChange={handleInputChange}
                                    required
                                    margin="dense"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormLabel>Related Survey Link</FormLabel>
                                <TextField
                                    fullWidth
                                    name="surveyLink"
                                    value={studyData.surveyLink}
                                    onChange={handleInputChange}
                                    margin="dense"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormLabel>Related Drive Link</FormLabel>
                                <TextField
                                    fullWidth
                                    name="driveLink"
                                    value={studyData.driveLink}
                                    onChange={handleInputChange}
                                    margin="dense"
                                />
                            </Grid>
                            <Grid container spacing={2} justifyContent="center">
                                <Grid item xs={4}>
                                    <div style={{ margin: '50px' }}>
                                        <Button type="submit" variant="contained" color="primary">
                                            {isEditMode ? 'SAVE' : 'SUBMIT'}
                                        </Button>
                                    </div>
                                </Grid>
                                <Grid item xs={4}>
                                    <div style={{ margin: '50px' }}>
                                        <Button type="button" variant="contained" color="secondary" onClick={() => alert('Changes discarded.')}>
                                            CANCEL
                                        </Button>
                                    </div>
                                </Grid>
                            </Grid>
                        </Grid>
                    </form>
                </Container>
            </div>
        </div>
    );


}