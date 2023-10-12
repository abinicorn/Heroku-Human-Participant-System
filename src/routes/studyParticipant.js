import express from 'express';
import ParticipantDao from '../database/participant/dao/ParticipantDao.js';
import TagDao from '../database/tag/dao/TagDao.js';
import StudyParticipantDao from '../database/studyParticipant/dao/StudyParticipantDao.js'
import exp from 'constants';

import { HTTP_SUCCESS,
    HTTP_NOT_FOUND,
    HTTP_SERVER_ERROR,
    HTTP_BAD_REQUEST,
    HTTP_CREATED,
    HTTP_NO_CONTENT,
    HTTP_LOGIN_ERROR} from "../enum.js";

const router = express.Router();
const log4js = require('../utils/log4js.js');

//format the study participants data
function transformDocument(originalDoc) {
    return {
        _id: originalDoc._id,
        serialNum: originalDoc.serialNum,
        isActive: originalDoc.isActive || false,  
        isComplete: originalDoc.isComplete || false,
        isGift: originalDoc.isGift || false,
        isSentGift: originalDoc.isSentGift || false,
        isWIllReceiveReport: originalDoc.isWIllReceiveReport || false,
        isSentReport: originalDoc.isSentReport || false,
        note: originalDoc.note || "",
        participantInfo: {
            _id: originalDoc.participantId._id,
            firstName: originalDoc.participantId.firstName,
            lastName: originalDoc.participantId.lastName,
            email: originalDoc.participantId.email,
            phoneNum: originalDoc.participantId.phoneNum,
            isWillContact: originalDoc.participantId.isWillContact,
            tag: originalDoc.participantId.tag.map(t => t._id),
            tagsInfo: originalDoc.participantId.tag.map(t => t.tagName)
        }
    };
}

// count participants num in the study
router.get('/count/:studyId', async (req, res) => {
    try {
        const { studyId } = req.params;
        const count = await StudyParticipantDao.getActiveStudyParticipantsCountByStudyId(studyId);
        
        res.status(HTTP_SUCCESS).json({ count });
        log4js.info(`studyParticipant.router.get./count/:studyId. Study participant list amount: ${count}`)

    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            res.status(HTTP_SERVER_ERROR).json({ error: "Internal server error." });
            log4js.error(`studyParticipant.router.get./count/:studyId. Internal server error : ${error}`);
        } else {
            res.status(HTTP_SERVER_ERROR).json({
                error: "Failed to get the count of active study-participants.",
                details: error.message
            });
            log4js.error(`studyParticipant.router.get./count/:studyId. Failed to get the count of active study-participants : ${error}`);
        }
    }
});

//Retrieve all related participants by studyId
router.get('/:studyId', async (req, res) => {
    try {
        const { studyId } = req.params;
        const studyParticipants = await StudyParticipantDao.findStudyParticipantsByStudyId(studyId);
        
        if (studyParticipants && studyParticipants.length > 0) {
            // transform
            const transformedParticipants = studyParticipants.map(transformDocument);
            res.status(HTTP_SUCCESS).json(transformedParticipants);
            log4js.info(`studyParticipant.router.get./:studyId. StudyId: ${studyId} Succeed to retrieve all related participants`)
        } else {
            res.sendStatus(HTTP_NO_CONTENT);
            log4js.warn(`studyParticipant.router.get./:studyId. StudyId: ${studyId} related participants not found`)
        }

    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            res.status(HTTP_SERVER_ERROR).json({ error: "Internal server error." });
            log4js.error(`studyParticipant.router.get./:studyId. Internal server error : ${error}`);
        } else {
            res.status(HTTP_SERVER_ERROR).json({
                error: "Failed to get study-participant list.",
                details: error.message
            });
            log4js.error(`studyParticipant.router.get./:studyId. Failed to get study-participant list : ${error}`);
        }
    }
});

// add participants to the study
router.post('/:studyId', async (req, res) => {
    const { studyId } = req.params;
    let participantIds = req.body.participantIds;

    if (!Array.isArray(participantIds)) {
        participantIds = [participantIds];
    }
    console.log(participantIds);
    try {
        // check if some studyparticipants are existing
        const existingParticipants = await StudyParticipantDao.checkExistingStudyParticipants(studyId, participantIds);

        // Activate existing participants and get their IDs
        const activatedExistingParticipants = await StudyParticipantDao.activateExistingParticipants(existingParticipants);

        // filter existing studyparticipants
        const newParticipantIds = participantIds.filter(id => 
            !existingParticipants.some(p => p.participantId.toString() === id)
        );

        const insertedDocs = await StudyParticipantDao.createMultipleStudyParticipants(studyId, newParticipantIds);

        const allInsertedDocs = [...insertedDocs, ...activatedExistingParticipants];

        if (allInsertedDocs && allInsertedDocs.length > 0) {
            // transform
            const resultIds = allInsertedDocs.map(doc => doc._id);
            const newStudyParticipants = await StudyParticipantDao.findMultipleStudyParticipantsByIds(resultIds)
            const transformedStudyParticipants = newStudyParticipants.map(transformDocument);
            res.status(HTTP_CREATED).json(transformedStudyParticipants);
            log4js.info(`studyParticipant.router.post./:studyId. Participants ${participantIds} added to the study ${studyId} with transformed data format`)
        } else {
            res.status(HTTP_CREATED).json(insertedDocs);
            log4js.info(`studyParticipant.router.post./:studyId. Participants ${participantIds} added to the study ${studyId}`)
        }
        
    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            res.status(HTTP_SERVER_ERROR).json({ error: "Internal server error." });
            log4js.error(`studyParticipant.router.post./:studyId. Internal server error: ${error}`);
        } else {
            res.status(HTTP_SERVER_ERROR).json({
                error: "Failed to add study-participant.",
                details: error.message
            });
            log4js.error(`studyParticipant.router.post./:studyId. Failed to add study-participant: ${error}`);
        }
    }
});

// Toggle a boolean property for multiple study-participants by their IDs
router.put('/toggle-property', async (req, res) => {
    const { ids, propertyName } = req.body;

    if (!Array.isArray(ids) || !propertyName) {
        return res.status(HTTP_BAD_REQUEST).json({
            error: "Both IDs (as an array) and propertyName are required in the request body."
        });
    }

    try {
        const updatedCount = await StudyParticipantDao.toggleBooleanPropertyByIds(ids, propertyName);

        if (updatedCount > 0) {
            res.status(HTTP_SUCCESS).json({ message: `${updatedCount} documents updated successfully.` });
            log4js.info(`studyParticipant.router.put./toggle-property. ${updatedCount} documents updated successfully`)
        } else {
            res.status(HTTP_NOT_FOUND).json({ error: "No matching documents found for the provided IDs." });
            log4js.warn(`studyParticipant.router.put./toggle-property. No matching documents found for the provided IDs ${ids}`)
        }

    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            res.status(HTTP_SERVER_ERROR).json({ error: "Internal server error." });
            log4js.error(`studyParticipant.router.put./toggle-property. Internal server error: ${error}`);
        } else {
            res.status(HTTP_SERVER_ERROR).json({
                error: "Failed to toggle property for study-participants.",
                details: error.message
            });
            log4js.error(`studyParticipant.router.put./toggle-property. Failed to toggle property for study-participants: ${error}`);
        }
    }
});

// update study-participant
router.put('/:studyParticipantId', async (req, res) => {
    const { studyParticipantId } = req.params;
    const updatedData = req.body;

    try {
        // Update StudyParticipant info
        const success = await StudyParticipantDao.updateStudyParticipantById(studyParticipantId, updatedData);

        res.sendStatus(success ? HTTP_NO_CONTENT : HTTP_NOT_FOUND);

        if (success) {
            log4js.info(`studyParticipant.router.put./:studyParticipantId. StudyParticipantId: ${studyParticipantId} updated`)
        } else {
            log4js.warn(`studyParticipant.router.put./:studyParticipantId. StudyParticipantId: ${studyParticipantId} not found`)
        }

    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            res.status(HTTP_SERVER_ERROR).json({ error: "Internal server error." });
            log4js.error(`studyParticipant.router.put./:studyParticipantId. Internal server error: ${error}`);
        } else {
            res.status(HTTP_SERVER_ERROR).json({
                error: "Failed to update study-participant details.",
                details: error.message
            });
            log4js.error(`studyParticipant.router.put./:studyParticipantId. Failed to update study-participant details: ${error}`);
        }
    }
});


// delete study-participant
router.delete('/:studyParticipantId', async (req, res) => {
    const { studyParticipantId } = req.params;

    try {
        const success = await StudyParticipantDao.deleteStudyParticipantById(studyParticipantId);

        // check if successfully deleted
        res.sendStatus(success ? HTTP_NO_CONTENT : HTTP_NOT_FOUND);
        if (success) {
            log4js.info(`studyParticipant.router.delete./:studyParticipantId. StudyParticipantId: ${studyParticipantId} deleted`)
        } else {
            log4js.warn(`studyParticipant.router.delete./:studyParticipantId. StudyParticipantId: ${studyParticipantId} not found`)
        }

    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            res.status(HTTP_SERVER_ERROR).json({ error: "Internal server error." });
            log4js.error(`studyParticipant.router.delete./:studyParticipantId. Internal server error: ${error}`);
        } else {
            res.status(HTTP_SERVER_ERROR).json({
                error: "Failed to delete study-participant.",
                details: error.message
            });
            log4js.error(`studyParticipant.router.delete./:studyParticipantId. Failed to delete study-participant: ${error}`);
        }
        
    }
});


export default router;