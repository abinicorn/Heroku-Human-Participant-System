import express from 'express';
import ParticipantDao from '../database/participant/dao/ParticipantDao.js';
import StudyParticipantDao from '../database/studyParticipant/dao/StudyParticipantDao.js';
import SessionDao from '../database/session/dao/SessionDao.js';

const router = express.Router();
const log4js = require('../utils/log4js.js');

import { HTTP_SUCCESS,
    HTTP_NOT_FOUND,
    HTTP_SERVER_ERROR,
    HTTP_BAD_REQUEST,
    HTTP_CREATED,
    HTTP_NO_CONTENT,
    HTTP_LOGIN_ERROR} from "../enum.js";


// Create new participants
router.post('/add', async (req, res) => {
    let participantsData = req.body.participants;

    // wrong syntax if its not array
    if (!Array.isArray(participantsData)) {
        log4js.warn(`Participant.router.post./add. Wrong request syntax.`);
        return res.status(HTTP_BAD_REQUEST).json("Wrong request syntax.");
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

// Retrieve participants with isWillContact as true and populate their tag names
router.get('/to-contact', async (req, res) => {

    try {
        const participants = await ParticipantDao.getParticipantsToContact();

        if (participants && participants.length > 0) {
            res.status(HTTP_SUCCESS).json(participants);
            log4js.info(`Participant.router.get./to-contact. Retrieved participants to contact successfully.`);
        } else {
            res.status(HTTP_NO_CONTENT).json({ message: "No participants found with isWillContact as true." });
            log4js.warn(`Participant.router.get./to-contact. No participants found with isWillContact as true.`);
        }
    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            res.status(HTTP_SERVER_ERROR).json({ error: "Internal server error." });
            log4js.error(`Participant.router.get./to-contact. Internal server error : ${error}`);
        } else {
            res.status(HTTP_SERVER_ERROR).json({
                error: "Failed to get participants to contact.",
                details: error.message
            });
            log4js.error(`Participant.router.get./to-contact. Failed to get participants to contact : ${error}`);
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


// Update tag for multiple participants by their IDs
router.put('/update-tag', async (req, res) => {
    const { updateIds, tagId } = req.body;

    if (!Array.isArray(updateIds) || !tagId) {
        log4js.warn(`Participant.router.put./update-tag. Both updateIds (as an array) and tagId are required in the request body.`)
        return res.status(HTTP_BAD_REQUEST).json({
            error: "Both updateIds (as an array) and tagId are required in the request body."
        });
    }

    try {
        const updatedCount = await ParticipantDao.addTagByIds(updateIds, tagId);

        if (updatedCount > 0) {
            res.status(HTTP_SUCCESS).json({ message: `${updatedCount} documents updated successfully.` });
            log4js.info(`Participant.router.put./update-tag. ${updatedCount} documents updated successfully.`);
        } else {
            res.status(HTTP_NOT_FOUND).json({ error: "No matching documents found for the provided IDs." });
            log4js.warn(`Participant.router.put./update-tag. No matching documents found for the provided IDs ${updateIds}.`);
        }

    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            res.status(HTTP_SERVER_ERROR).json({ error: "Internal server error." });
            log4js.error(`Participant.router.put./update-tag. Internal server error : ${error}`);
        } else {
            res.status(HTTP_SERVER_ERROR).json({
                error: "Failed to update tag for participants.",
                details: error.message
            });
            log4js.error(`Participant.router.put./update-tag. Failed to update tag for participants : ${error}`);
        }
    }
});

// Delete tag for multiple participants by their IDs
router.put('/delete-tag', async (req, res) => {
    const { deleteIds, tagId } = req.body;

    if (!Array.isArray(deleteIds) || !tagId) {
        log4js.warn(`Participant.router.put./delete-tag. Both deleteIds (as an array) and tagId are required in the request body.`)
        return res.status(HTTP_BAD_REQUEST).json({
            error: "Both deleteIds (as an array) and tagId are required in the request body."
        });
    }

    try {
        const updatedCount = await ParticipantDao.deleteTagByIds(deleteIds, tagId);

        if (updatedCount > 0) {
            res.status(HTTP_SUCCESS).json({ message: `${updatedCount} documents updated successfully.` });
            log4js.info(`Participant.router.put./delete-tag. ${updatedCount} documents updated successfully.`);
        } else {
            res.status(HTTP_NOT_FOUND).json({ error: "No matching documents found for the provided IDs." });
            log4js.warn(`Participant.router.put./delete-tag. No matching documents found for the provided IDs ${deleteIds}.`);
        }

    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            res.status(HTTP_SERVER_ERROR).json({ error: "Internal server error." });
            log4js.error(`Participant.router.put./delete-tag. Internal server error : ${error}`);
        } else {
            res.status(HTTP_SERVER_ERROR).json({
                error: "Failed to delete tag for participants.",
                details: error.message
            });
            log4js.error(`Participant.router.put./delete-tag. Failed to delete tag for participants : ${error}`);
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
        if (error.message && error.message.includes('E11000 duplicate key error')) {
            res.status(400).json({ error: "Email already exists." });
            log4js.error(`Participant.router.put./:participantId. Email already exists : ${error}`);
        } else if (process.env.NODE_ENV === 'production') {
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

// anonymize participants in a closed study
router.delete('/anonymize-participants/:studyId', async (req, res) => {
    try {
        const studyId = req.params.studyId;
        const toUpdate = await StudyParticipantDao.getParticipantsByStudy(studyId);

        //Check if toUpdate is not empty and toUpdate[0] contains the participantIds attribute
        if (toUpdate.length > 0 && 'participantIds' in toUpdate[0]) {
            const idsToUpdate = toUpdate[0].participantIds;
            
            await ParticipantDao.anonymizeParticipants(idsToUpdate);

            await StudyParticipantDao.deleteStudyParticipantsByStudyId(studyId);

            await SessionDao.deleteSessionsByStudyId(studyId);

            await ParticipantDao.deleteAnonymizedParticipants();

            res.status(200).send({ success: true, toUpdate: toUpdate, updatedCount: idsToUpdate.length });
        } else {
            await StudyParticipantDao.deleteStudyParticipantsByStudyId(studyId);

            await SessionDao.deleteSessionsByStudyId(studyId);

            res.status(204).send({ success: true, message: 'No participants to update' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Internal Server Error' });
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