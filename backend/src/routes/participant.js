import express from 'express';
import ParticipantDao from '../database/participant/dao/ParticipantDao.js';
import StudyParticipantDao from '../database/studyParticipant/dao/StudyParticipantDao.js';

const router = express.Router();
const log4js = require('../utils/log4js.js');

import { HTTP_SUCCESS,
    HTTP_NOT_FOUND,
    HTTP_SERVER_ERROR,
    HTTP_BAD_REQUEST,
    HTTP_CREATED,
    HTTP_NO_CONTENT,
    HTTP_LOGIN_ERROR} from "../enum.js";


// Create new participant
router.post('/add', async (req, res) => {
    let participantsData = req.body.participants;

    // wrong syntax if its not array
    if (!Array.isArray(participantsData)) {
        res.status(HTTP_BAD_REQUEST).json("Wrong request syntax.");
        log4js.warn(`Participant.router.post./add. Wrong request syntax.`);
    }

    try {
        // 1. filter existing data by searching emails
        const emails = participantsData.map(p => p.email);
        const existingParticipants = await ParticipantDao.findParticipantsByEmails(emails);
        const existingEmails = new Set(existingParticipants.map(p => p.email));
        participantsData = participantsData.filter(p => !existingEmails.has(p.email));

        // 2. try to create all participants
    
        const result = await ParticipantDao.createMultipleParticipants(participantsData);
        
        res.status(HTTP_CREATED).json({ 
            success: result,
            existing: existingParticipants
        })
        log4js.info(`Participant.router.post./add. Participants: ${result.length} created`);

    } catch (error) {
        if (error.writeErrors) {
            // Handle writeErrors if they exist.
            const errorDetails = error.writeErrors.map(e => e.err);
            res.status(HTTP_BAD_REQUEST).json({
                error: "Failed to fully create participants",
                failedDetails: errorDetails
            });
            log4js.warn(`Participant.router.post./add. Failed to fully create participants : ${error}`);
        } else {
            // Handle other types of errors.
            if (process.env.NODE_ENV === 'production') {
                res.status(HTTP_SERVER_ERROR).json({ error: "Internal server error." });
                log4js.error(`Participant.router.post./add. Internal server error : ${error}`);
            } else {
                res.status(HTTP_SERVER_ERROR).json({
                    error: "Failed to create participants.",
                    details: error.message
                });
                log4js.error(`Participant.router.post./add. Failed to create participants : ${error}`);
            }
        }
    }
});

// get all participants id
router.get('/all', async (req, res) => {

    try {
        const participants = await ParticipantDao.getAllParticipants();

        if (participants) {
            res.status(HTTP_SUCCESS).json(participants);
            log4js.info(`Participant.router.get./all. All participants id retrieved successfully.`);
        } else {
            res.status(HTTP_NOT_FOUND).json({ error: "Participant not found" });
            log4js.warn(`Participant.router.get./all. Participant not found`);
        }
    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            res.status(HTTP_SERVER_ERROR).json({ error: "Internal server error." });
            log4js.error(`Participant.router.get./all. Internal server error : ${error}`);
        } else {
            res.status(HTTP_SERVER_ERROR).json({
                error: "Failed to get participant.",
                details: error.message
            });
            log4js.error(`Participant.router.get./all. Failed to get participant : ${error}`);
        }
    }
    
});

// Retrieve specific participant details
router.get('/:participantId', async (req, res) => {

    try {
        const { participantId } = req.params;
        const participant = await ParticipantDao.getParticipantById(participantId);

        if (participant) {
            res.json(participant);
            log4js.info(`Participant.router.get./:participantId. Participant ${participantId} detail retrieved successfully`);
        } else {
            res.status(HTTP_NOT_FOUND).json({ error: "Participant not found" });
            log4js.warn(`Participant.router.get./:participantId. Participant ${participantId} not found`);
        }
    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            res.status(HTTP_SERVER_ERROR).json({ error: "Internal server error." });
            log4js.error(`Participant.router.get./:participantId. Internal server error : ${error}`);
        } else {
            res.status(HTTP_SERVER_ERROR).json({
                error: "Failed to get participant.",
                details: error.message
            });
            log4js.error(`Participant.router.get./:participantId. Failed to get participant detail : ${error}`);
        }
    }
    
});

//check if a participant can be reset info
router.get('/check/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;

        // Step 1: Check isWillContact in Participant table
        const participant = await ParticipantDao.getParticipantById(participantId);
        
        if (!participant) {
            log4js.warn(`Participant.router.get./check/:participantId. Participant ${participantId} not found`)
            return res.status(HTTP_NOT_FOUND).json({ error: "Participant not found" });
        }

        // Step 2: If isWillContact is not false, return shouldKeepInfo: true
        if (participant.isWillContact !== false) {
            log4js.info(`Participant.router.get./check/:participantId. Participant ${participantId} can be rest info`)
            return res.json({ shouldKeepInfo: true });
        }

        // Step 3: Check SP table
        const studyParticipants = await StudyParticipantDao.findStudyParticipantsByParticipantId(participantId);
        
        for (const studyParticipant of studyParticipants) {
            if (studyParticipant.isActive) {
                return res.json({ shouldKeepInfo: false });
            }
        }

        // Step 4: If none of the SP documents are active, return shouldKeepInfo: true
        return res.json({ shouldKeepInfo: true });

    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            res.status(HTTP_SERVER_ERROR).json({ error: "Internal server error." });
            log4js.error(`Participant.router.get./check/:participantId. Internal server error : ${error}`);
        } else {
            res.status(HTTP_SERVER_ERROR).json({
                error: "Failed to check participant.",
                details: error.message
            });
            log4js.error(`Participant.router.get./check/:participantId. Failed to check participant : ${error}`);
        }
        
    }
});

// Toggle a boolean property for multiple study-participants by their IDs
router.put('/toggle-property', async (req, res) => {
    const { ids, propertyName } = req.body;

    if (!Array.isArray(ids) || !propertyName) {
        log4js.warn(`Participant.router.put./toggle-property. Both IDs (as an array) and propertyName are required in the request body.`)
        return res.status(HTTP_BAD_REQUEST).json({
            error: "Both IDs (as an array) and propertyName are required in the request body."
        });
    }

    try {
        const updatedCount = await ParticipantDao.toggleBooleanPropertyByIds(ids, propertyName);

        if (updatedCount > 0) {
            res.status(HTTP_SUCCESS).json({ message: `${updatedCount} documents updated successfully.` });
            log4js.info(`Participant.router.put./toggle-property. ${updatedCount} documents updated successfully.`);
        } else {
            res.status(HTTP_NOT_FOUND).json({ error: "No matching documents found for the provided IDs." });
            log4js.warn(`Participant.router.put./toggle-property. No matching documents found for the provided IDs ${ids}.`);
        }

    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            res.status(HTTP_SERVER_ERROR).json({ error: "Internal server error." });
            log4js.error(`Participant.router.put./toggle-property. Internal server error : ${error}`);
        } else {
            res.status(HTTP_SERVER_ERROR).json({
                error: "Failed to toggle property for study-participants.",
                details: error.message
            });
            log4js.error(`Participant.router.put./toggle-property. Failed to toggle property for study-participants : ${error}`);
        }
    }
});

//update partcipant info
router.put('/:participantId', async (req, res) => {
    const { participantId } = req.params;
    const updatedData = req.body;

    try {
        const success = await ParticipantDao.updateParticipantById(participantId, updatedData);

        res.sendStatus(success ? HTTP_NO_CONTENT : HTTP_NOT_FOUND);
        if(success) {
            log4js.info(`Participant.router.put./:participantId. Participant ${participantId} info updated successfully.`);
        } else {
            log4js.warn(`Participant.router.put./:participantId. Participant ${participantId} info updated unsuccessfully.`);
        }

    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            res.status(HTTP_SERVER_ERROR).json({ error: "Internal server error." });
            log4js.error(`Participant.router.put./:participantId. Internal server error : ${error}`);
        } else {
            res.status(HTTP_SERVER_ERROR).json({
                error: "Failed to update participant.",
                details: error.message
            });
            log4js.error(`Participant.router.put./:participantId. Failed to update participant : ${error}`);
        }
        
    }
});

// delete study-participant
router.delete('/:participantId', async (req, res) => {
    const { participantId } = req.params;

    try {
        const success = await ParticipantDao.deleteParticipant(participantId);

        // check if successfully deleted
        res.sendStatus(success ? HTTP_NO_CONTENT : HTTP_NOT_FOUND);
        if(success) {
            log4js.info(`Participant.router.delete./:participantId. Participant ${participantId} deleted successfully.`);
        } else {
            log4js.warn(`Participant.router.delete./:participantId. Participant ${participantId} deleted unsuccessfully.`);
        }

    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            res.status(HTTP_SERVER_ERROR).json({ error: "Internal server error." });
            log4js.error(`Participant.router.delete./:participantId. Internal server error : ${error}`);
        } else {
            res.status(HTTP_SERVER_ERROR).json({
                error: "Failed to delete participant.",
                details: error.message
            });
            log4js.error(`Participant.router.delete./:participantId. Failed to delete participant : ${error}`);
        }
        
    }
});


export default router;

//Retrieve all related participants by studyId
// router.get('/study-participant/list/:studyId', async (req, res) => {

//     const { studyId } = req.params;
//     const studyParticipants = await StudyParticipantDao.findStudyParticipantsByStudyId(studyId).lean();

//     const participantsInfoPromises = studyParticipants.map(async studyParticipant => {
//         const participantInfo = await ParticipantDao.getParticipantById(studyParticipant.participantId);
        
//         const tagsInfoPromises = participantInfo.tag.map(tagId => TagDao.getTagById(tagId));
//         const tagsInfo = await Promise.all(tagsInfoPromises);
        
//         participantInfo.tagsInfo = tagsInfo;
//         studyParticipant.participantInfo = participantInfo;

//         return studyParticipant; // Return the modified studyParticipant
//     });

//     const participantsWithInfo = await Promise.all(participantsInfoPromises);

//     if (participantsWithInfo.length > 0) {
//         res.json(participantsWithInfo);
//     }
//     else {
//         res.sendStatus(HTTP_NO_CONTENT);
//     }
// });


// Create new participant
// router.post('/participant/create/:studyId', async (req, res) => {

//     const { studyId } = req.params;

//     const newParticipant = await ParticipantDao.createParticipant({
//         firstName: req.body.firstName,
//         lastName: req.body.lastName,
//         email: req.body.email,
//         tag: req.body.tagList,
//         isWillContact: req.body.isWillContact
//     });

//     if (newParticipant) {
//         res.status(HTTP_CREATED)
//            .header('Location', `/participant/${newParticipant._id}`)
//            .json(newParticipant);
//     } else {
//         res.status(HTTP_BAD_REQUEST).json({ error: "Failed to create participant" });
//     }
// });