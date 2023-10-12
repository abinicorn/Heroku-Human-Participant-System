import express from 'express';
import StudyDao from '../database/study/dao/StudyDao.js';
import {ResearcherDao} from '../database/researcher/dao/ResearcherDao.js';
import Researcher from "../database/researcher/domain/ResearcherDomain.js";

const router = express.Router();
const log4js = require('../utils/log4js.js');

import { HTTP_SUCCESS,
    HTTP_NOT_FOUND,
    HTTP_SERVER_ERROR,
    HTTP_BAD_REQUEST,
    HTTP_CREATED,
    HTTP_NO_CONTENT,
    HTTP_LOGIN_ERROR} from "../enum.js";
import Study from '../database/study/domain/StudyDomain.js';

// Route to retrieve study details by studyId
router.get('/:studyId', async (req, res) => {
    const studyId = req.params.studyId;
    try {
        const study = await StudyDao.retrieveStudy(studyId);
        if (!study) {
            log4js.warn(`Study.router.get./:studyId. StudyId:${studyId} not found`)
            return res.status(HTTP_NOT_FOUND).json({ message: 'Study not found' })
        }
        res.status(HTTP_SUCCESS).json(study);
        log4js.info(`Study.router.get./:studyId. StudyId:${studyId} detail retrieved`)
    } catch (error) {
        res.status(HTTP_SERVER_ERROR).json({ message: 'An error occurred', error });
        log4js.error(`Study.router.get./:studyId. Internal server error: ${error}`);
    }
})


// Route to edit study details by studyId
router.put('/:studyId', async (req, res) => {
    const studyId = req.params.studyId;
    const updatedData = req.body;

    try {
        const updatedStudy = await StudyDao.updateStudy(studyId, updatedData);
        if (!updatedStudy) {
            log4js.warn(`Study.router.put./:studyId. StudyId:${studyId} not found`)
            return res.status(HTTP_NOT_FOUND).json({ message: 'Study not found' })
        }
        else{
            res.status(HTTP_SUCCESS).json(updatedStudy);
            log4js.info(`Study.router.put./:studyId. StudyId:${studyId} successfully updated`)
        }
    } catch (error) {
        res.status(HTTP_SERVER_ERROR).json({ message: 'An error occurred'});
        log4js.error(`Study.router.put./:studyId. Internal server error: ${error}`);
    }
});

// Create a new study and associate it with a researcher
router.post('/:researcherId', async (req, res) => {
    console.log("connected");
    try {
        const researcherId= req.params.researcherId;
        const studyData = req.body; 
        const study = await StudyDao.findStudyByCode(studyData.studyCode);
        // Create a new study
        if(!!study){
            console.log("Find by studycode: ", study);
            res.status(HTTP_BAD_REQUEST).json({ message: 'Study code already exists' });
        }else{
            const newStudy = await StudyDao.createStudy(studyData);// Find the researcher and update their studyList
            console.log("Researcher: " +studyData.creator);
            const updatedResearcher = await ResearcherDao.updateResearcherByResearcherId(
                studyData.creator,
                newStudy._id
            );
            res.status(HTTP_CREATED).json({
                message: 'Study created and associated with researcher',
                study: newStudy,
                researcher: updatedResearcher
            })
            log4js.info(`Study.router.post./:researcherId. StudyId:${newStudy._id} successfully created. ResearcherId: ${updatedResearcher._id} successfully updated`)
            console.log("passed");
        }
    } catch (error) {
        console.log(error);
        res.status(HTTP_SERVER_ERROR).json({ error: 'Error creating study' });
        log4js.error(`Study.router.post./:researcherId. Error about create a new study and associate it with a researcher : ${error}`);
    }
});

// Route to query existing researchers in a study by studyId
router.get('/researcher/list/:studyId', async (req, res) => {
    try {
        const studyId = req.params.studyId;
        // Query existing researcherId in the study
        const researcherList = await StudyDao.retrieveResearcherListByStudyId(studyId);
        console.log(researcherList);
        res.status(HTTP_SUCCESS).json(researcherList);
        log4js.info(`Study.router.get./researcher/list/:studyId. StudyId:${studyId} Researcher list amount: ${researcherList.length}`)
    } catch (error) {
        res.status(HTTP_SERVER_ERROR).json({ message: 'Error querying researchers in study', error });
        log4js.error(`Study.router.get./researcher/list/:studyId. Error querying researchers in study : ${error}`);
        }
    });

// Route to remove a study by studyId
router.put('/removeResearcher/:studyId/:researcherId', async (req, res) => {

    const studyId = req.params.studyId;
    const researcherId = req.params.researcherId;
    const creator = await StudyDao.findCreator(studyId);
    if(creator.equals(researcherId)){
        res.status(HTTP_BAD_REQUEST).json({ message: 'Can not delete creator' });
    }
    else{
        try {
            const removeStudy = await ResearcherDao.removeStudyfromResearcher(studyId, researcherId);
            const removeResearcher = await StudyDao.removeResearherfromStudy(studyId, researcherId);

            // Check if both operations were successful
            if (removeStudy.success && removeResearcher.success) {
                res.status(HTTP_SUCCESS).json({ message: 'Researcher removed from study and study removed from researcher' });
                log4js.info(`Study.router.put./removeResearcher/:studyId/:researcherId. Researcher ${researcherId} removed from study:${studyId}. Study ${studyId} removed from researcher ${researcherId}`)
            } else {
                res.status(HTTP_SERVER_ERROR).json({ message: 'Error removing researcher from study' });
                log4js.warn(`Study.router.put./removeResearcher/:studyId/:researcherId. Error removing researcher from study ${studyId}`);
            }
        } catch (error) {
            res.status(HTTP_SERVER_ERROR).json({ message: 'Error removing researcher from study', error });
            log4js.error(`Study.router.put./removeResearcher/:studyId/:researcherId. Error removing researcher from study ${studyId}: ${error}`);
        }
    }
});


//Route to update researcher's studylist and study's researcherlist
router.put('/associateResearcher/:studyId/:researcherId', async (req, res) => {
    const studyId = req.params.studyId;
    const researcherId = req.params.researcherId;

    try{
        const updatedStudy = await StudyDao.updateStudyByStudyId(studyId, researcherId);
        const updatedResearcher = await ResearcherDao.updateResearcherByResearcherId(researcherId, studyId);
        if(updatedStudy && updatedResearcher){
            res.status(HTTP_SUCCESS).json({ message: 'Researcher associated with study' });
            log4js.info(`Study.router.put./associateResearcher/:studyId/:researcherId 
            Researcher ${researcherId} associated with study:${studyId}.`)
        }
        else{
            res.status(HTTP_BAD_REQUEST).json({ message: 'Can not associate researcher with study' });
            log4js.warn(`Study.router.put./associateResearcher/:studyId/:researcherId. Can not associate researcher ${researcherId} with study ${studyId}`);
        }
    } catch (error) {
        res.status(HTTP_SERVER_ERROR).json({ message: 'Error associating researcher with study', error });
        log4js.error(`Study.router.put./associateResearcher/:studyId/:researcherId. Error associating researcher with study ${studyId} : ${error}`);
    }
});


//Route for adding a new researcher and associate with an existing study
router.post('/addResearcher/:studyId', async (req, res) => {
    const {firstName, lastName, email} = req.body;
    const studyId = req.params.studyId;
    const existingResearcher = await ResearcherDao.getResearcherByEmail(email);
    try{
        const username = email.split('@')[0];
        const study = await StudyDao.retrieveStudy(studyId);
        if (!study) {
            log4js.warn(`Study.router.post./addResearcher/:studyId. Study ${studyId} not found`);
            return res.status(HTTP_NOT_FOUND).json({message: 'study not found'})
        }
        else if(existingResearcher){
            
            res.status(HTTP_BAD_REQUEST).json({message: 'Researcher already exists'});
            log4js.warn(`Study.router.post./addResearcher/:studyId. Researcher ${existingResearcher._id} already exists`);
        }
        else{
            const newResearcher= new Researcher({
                firstName: firstName,
                lastName: lastName,
                email: email,
                username: username,
                password: '123456',
                studyList: [],
                isActive: true
            });

            const updateResearcher= await ResearcherDao.createResearcher(newResearcher);
            const updateStudy=await StudyDao.updateStudyByStudyId(studyId, updateResearcher._id);
            const associateResearcher= await ResearcherDao.updateResearcherByResearcherId(updateResearcher._id, studyId);
            res.status(HTTP_SUCCESS).json({username : newResearcher.username, message: 'New researcher added & study updated successfully'});
            log4js.info(`Study.router.post./addResearcher/:studyId. New researcher ${updateResearcher._id} added & study ${studyId} updated successfully`)
        }
    }catch (error) {
        res.status(HTTP_SERVER_ERROR).json ({message: 'Adding researcher associating with study error'});
        log4js.error(`Study.router.post./addResearcher/:studyId. Adding researcher associating with study error: ${error}`);
    }
});

//Route to retrieve a study's information by studyId
router.get('/studyReport/:studyId', async (req, res) => {
    const studyId = req.params.studyId;
    try {
        const study = await StudyDao.retrieveStudyReport(studyId);
        const result = {
            studyId: study._id,
            studyCode: study.studyCode,
            name: study.studyName,
            isClosed: study.isClosed,
            description: study.description,
            creator:  study.creator.firstName + ' ' + study.creator.lastName,
            researcherList: study.researcherList,
            studyType: study.studyType,
            isAnonymous: study.isAnonymous,
            anonymousPartipantNum: study.anonymousPartipantNum,
            recruitmentStartDate: study.recruitmentStartDate,
            recruitmentCloseDate: study.recruitmentCloseDate,
            location: study.location,
            isCleared: study.isCleared,
            driveLink: study.driveLink,
            createdAt: study.createdAt,
            updatedAt: study.updatedAt,
            surveyLink: study.surveyLink
        };
        if (!study) {
            log4js.warn(`Study.router.get./studyReport/:studyId. StudyId:${studyId} not found`)
            return res.status(HTTP_NOT_FOUND).json({ message: 'Study not found' })
        }
        res.status(HTTP_SUCCESS).json(result);
        log4js.info(`Study.router.get./studyReport/:studyId. StudyId:${studyId} detail retrieved`)
    } catch (error) {
        res.status(HTTP_SERVER_ERROR).json({ message: 'An error occurred', error });
        log4js.error(`Study.router.get./studyReport/:studyId. Internal server error: ${error}`);
    }
})

export default router;