import React from 'react';
import Dialog from '@mui/material/Dialog';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import parseData from "../../utils/parseData";

export default function StudyDetailPopup({ study, onClose, open }) {
    const handleClosePopup = () => {
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClosePopup}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="md" // 设置最大宽度，可以根据需要调整
            fullWidth // 使用窗口宽度
            maxHeight="80%"
        >


            <Paper sx={{ padding: '20px' }} elevation={3} className="study-info-popup">
                <Grid container spacing={2} alignItems="center" justifyContent="flex-start">
                    <Grid item xs={12} align="center">
                        <Typography variant="h3">{study.name} ({study.studyCode})</Typography>
                    </Grid>
                    <Grid item xs={12} align="center">
                        <Typography variant="h4">By {study.creator}</Typography>
                    </Grid>
                    <Grid item xs={12} align="left">
                        <Typography variant="h5">Researcher List: &nbsp;
                        {study.researcherList.map((researcher, index) => (
                            <span key={index}>{researcher.firstName + ' ' + researcher.lastName}；</span>
                        ))}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} align="left">
                        <Typography variant="h5">Description:</Typography>
                        <Paper elevation={0} sx={{ padding: '10px' }}>
                            <Box sx={{ backgroundColor: '#2196f3', padding: '10px', borderRadius: '4px' }}>
                                <Typography variant="body1">{study.description}</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} align="h5">
                        <Typography variant="h5" style={{ marginBottom: '10px', display: 'flex'}}>
                            <span>
                                Experiment Type: &nbsp;{study.studyType}
                                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                                Date: &nbsp;{parseData(study.createdAt)}
                            </span>
                        </Typography>
                        <Typography variant="h5" style={{ marginBottom: '10px' }}>Location: &nbsp;{study.location.join('; ')}</Typography>
                    </Grid>
                    <Grid item xs={12} align="left">
                        <a href="/session" style={{ textDecoration: 'none' }}>
                            <Button variant="contained" color="secondary">Session List</Button>
                        </a>
                    </Grid>
                    <Grid item xs={12} align="left">
                        <a href="/session" style={{ textDecoration: 'none' }}>
                            <Button variant="contained" color="secondary">Participant List</Button>
                        </a>
                    </Grid>
                    <Grid item xs={12} align="right">
                        <Button variant="contained" color="primary" onClick={handleClosePopup}>Close</Button>
                    </Grid>
                </Grid>
            </Paper>


        </Dialog>
    );
}