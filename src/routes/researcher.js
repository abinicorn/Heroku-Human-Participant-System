import express from 'express';
import jwt from "jsonwebtoken";

import {ResearcherDao} from "../database/researcher/dao/ResearcherDao.js";
import StudyDao from "../database/study/dao/StudyDao.js";
import Researcher from "../database/researcher/domain/ResearcherDomain.js";
const log4js = require('../utils/log4js.js');
import bcrypt from 'bcrypt';

import { HTTP_SUCCESS,
    HTTP_NOT_FOUND,
    HTTP_SERVER_ERROR,
    HTTP_NO_CONTENT,
    HTTP_LOGIN_ERROR} from "../enum.js";
import StudyParticipantDao from "../database/studyParticipant/dao/StudyParticipantDao";


const router = express.Router();

const secret = "secret123";

const expiresIn = '43200000';

/**
 * @swagger
 * tags:
 *   - name: Researcher
 *     description: Operations related to researchers
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user by providing their username and password.
 *     tags:
 *      - Researcher
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               username: john_doe
 *               password: secret123
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 studyList:
 *                   type: array
 *                   items:
 *                     type: string
 *               example:
 *                 _id: "123456789"
 *                 studyList: ["study1", "study2"]
 *       401:
 *         description: Unauthorized - Username or password error
 *         content:
 *           application/json:
 *             example:
 *               message: Username or password error
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Server error
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {

        // Get userData by username, then check the password
        const user = await ResearcherDao.login(username);
        const loginSuccess = await bcrypt.compare(password, user.password);
        if ( !loginSuccess) {
                log4js.warn(`Researcher.router.post./login. Failed to login : Username or password error`);
                return res.status(HTTP_LOGIN_ERROR).json({ message: 'Username or password error' })
            }

        // Create token in cookies
        const { _id } = user;
        const token = jwt.sign({ _id }, secret
            , { expiresIn }
        )
        const result = {
            _id,
            token
        };
        log4js.info(`Researcher.router.post./login. ResearcherId : ${user._id} login success`);
        return res.cookie("access_token", token, {httpOnly: true })
            .status(HTTP_SUCCESS).json({ message: 'Login Success', result: result });
    } catch (error) {
        log4js.error(`Researcher.router.post./login. Server error: ${error}`);
        return res.status(HTTP_SERVER_ERROR).json({ message: 'Server error' })
    }
});


// Log out
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(HTTP_SUCCESS).json({ message: 'Logout Success' });
    log4js.info(`Researcher.router.get./logout. User logout success`)
});

/**
 * @swagger
 * /api/info/{researcherId}:
 *   get:
 *     summary: Get researcher information by ID
 *     description: Retrieve researcher information by their unique ID.
 *     tags:
 *      - Researcher
 *     parameters:
 *       - in: path
 *         name: researcherId
 *         required: true
 *         description: The ID of the researcher to retrieve information for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful retrieval of researcher information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResearcherInfo'
 *             examples:
 *               example1:
 *                 value:
 *                   message: User Info
 *                   result:
 *                     firstName: John
 *                     lastName: Doe
 *                     email: john.doe@example.com
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Server error
 */
router.get('/info/:researcherId', async (req, res) => {

    const { researcherId } = req.params;
    try{
        const user = await ResearcherDao.getResearcherById(researcherId);

        log4js.info(`Researcher.router.get./info/:researcherId. ResearcherId: ${researcherId} info retrieved`)
        return res.status(HTTP_SUCCESS).json({ message: 'User Info',
            result: { firstName: user.firstName, lastName: user.lastName, email: user.email, studyList: user.studyList}
        });
    } catch (error) {
        log4js.error(`Researcher.router.get./info/:researcherId. Internal server error: ${error}`);
        return res.status(HTTP_SERVER_ERROR).json({ message: 'Server error'})
    }
})

/**
 * @swagger
 * /api/update/info:
 *   put:
 *     summary: Update researcher information
 *     description: Update researcher information by providing their ID, first name, last name, and email.
 *     tags:
 *      - Researcher
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the researcher to update.
 *               firstName:
 *                 type: string
 *                 description: The updated first name of the researcher.
 *               lastName:
 *                 type: string
 *                 description: The updated last name of the researcher.
 *               email:
 *                 type: string
 *                 description: The updated email of the researcher.
 *             example:
 *               id: "123456789"
 *               firstName: "John"
 *               lastName: "Doe"
 *               email: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: Successful update of researcher information
 *         content:
 *           application/json:
 *             example:
 *               message: Update success
 *       404:
 *         description: Update error - Researcher not found
 *         content:
 *           application/json:
 *             example:
 *               message: Update error
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Server error
 */
router.put('/update/info', async (req, res) => {

    const { firstName, lastName, email, id } = req.body;

    try{
        const user = await ResearcherDao.getResearcherById(id);

        const success = await ResearcherDao.updateResearcher(user, firstName, lastName, email);

        if (!success) {
            log4js.warn(`Researcher.router.put./update/info. ResearcherId: ${id} not found`);
            return res.status(HTTP_NOT_FOUND).json({ message: 'Update error'})
        }

        res.status(HTTP_SUCCESS).json({ message: 'Update success'})
        log4js.info(`Researcher.router.put./update/info. ResearcherId: ${id} info updated`);

    } catch (error) {
        log4js.error(`Researcher.router.put./update/info, Internal server error: ${error}`);
        return res.status(HTTP_SERVER_ERROR).json({ message: 'Server error'})
    }

})

/**
 * @swagger
 * /api/resetPwd:
 *   put:
 *     summary: Reset researcher's password
 *     description: Reset a researcher's password by providing their ID, current password, and a new password.
 *     tags:
 *      - Researcher
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the researcher whose password needs to be reset.
 *               currentPwd:
 *                 type: string
 *                 description: The current password of the researcher.
 *               newPwd:
 *                 type: string
 *                 description: The new password for the researcher.
 *             example:
 *               id: "123456789"
 *               currentPwd: "old_password"
 *               newPwd: "new_password"
 *     responses:
 *       200:
 *         description: Successful password reset
 *         content:
 *           application/json:
 *             example:
 *               message: Reset password success
 *       401:
 *         description: Unauthorized - Current password error
 *         content:
 *           application/json:
 *             example:
 *               message: Current password error
 *       404:
 *         description: Reset password error - Researcher not found
 *         content:
 *           application/json:
 *             example:
 *               message: Reset password error
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Server error
 */
router.put('/resetPwd', async (req, res) => {

    const { currentPwd, newPwd, id } = req.body;

    try{
        const user = await ResearcherDao.getResearcherById(id);

        const checkPassword = await bcrypt.compare(currentPwd, user.password);

        if ( !checkPassword) {
            log4js.warn(`Researcher.router.put./resetPwd. Current password error`);
            return res.status(HTTP_LOGIN_ERROR).json({message: 'Current password error'})
        }


        const isError = await ResearcherDao.resetResearcherPwd(user, newPwd);

        if (isError) {
            log4js.warn(`Researcher.router.put./resetPwd. ResearcherId: ${id} reset password error`);
            return res.status(HTTP_NOT_FOUND).json({ message: 'Reset password error'})
        }

        res.status(HTTP_SUCCESS).json({ message: 'Reset password success'})
        log4js.info(`Researcher.router.put./resetPwd. ResearcherId: ${id} reset password success`);

    } catch (error) {
        log4js.error(`Researcher.router.put./resetPwd. Internal server error: ${error}`);
        return res.status(HTTP_SERVER_ERROR).json({ message: 'Server error'})
    }

})

/**
 * @swagger
 * /api/list/{researcherId}:
 *   get:
 *     summary: Get study list for a researcher
 *     description: Retrieve the list of studies associated with a researcher based on their unique ID.
 *     tags:
 *      - Researcher
 *     parameters:
 *       - in: path
 *         name: researcherId
 *         required: true
 *         description: The ID of the researcher whose study list needs to be retrieved.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful retrieval of researcher's study list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudyListResponse'
 *             examples:
 *               example1:
 *                 value:
 *                   message: current researcher study list
 *                   result:
 *                     - studyId: "study1"
 *                       studyName: "Study 1"
 *                     - studyId: "study2"
 *                       studyName: "Study 2"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Server error
 */
// Get studyList by researcherId
router.get('/list/:researcherId', async (req, res) => {

    const { researcherId } = req.params;

    try{
        const user = await ResearcherDao.getResearcherById(researcherId);

        const { studyList } = user;

        const studlyInfoList = await StudyDao.retrieveStudyList(studyList);

        log4js.info(`Researcher.router.get./list/:researcherId. ResearcherId: ${user._id} retrieved study list`);
        return res.status(HTTP_SUCCESS)
            .json(studlyInfoList)

    } catch (error) {
        log4js.error(`Researcher.router.get./list/:researcherId. Internal server error: ${error}`);
        return res.status(HTTP_SERVER_ERROR).json({ message: 'Server error'})
    }

})


/**
 * @swagger
 * /api/email/{email}:
 *   get:
 *     summary: Get researcher by email
 *     description: Retrieve a researcher's information by their email address.
 *     tags:
 *      - Researcher
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         description: The email address of the researcher to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful retrieval of researcher by email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResearcherInfo'
 *             examples:
 *               example1:
 *                 value:
 *                   message: researcher
 *                   result:
 *                     firstName: John
 *                     lastName: Doe
 *                     email: john.doe@example.com
 *       204:
 *         description: No Content - No result found for the given email
 *         content:
 *           application/json:
 *             example:
 *               message: No result
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Server error
 */
router.get('/email/:email', async (req, res) => {

    const { email } = req.params;

    try{
        const researcher = await ResearcherDao.getResearcherByEmail(email);
        if (researcher) {
            log4js.info(`Researcher.router.get./email/:email. ResearcherId: ${researcher._id} retrieved successfully by email`);
            return res.status(HTTP_SUCCESS)
            .json(researcher)
        }
        else{
            log4js.warn(`Researcher.router.get./email/:email. No result, you need to add new researcher to the system first`);
            return res.status(HTTP_NO_CONTENT)
            .json({ message: 'No result, you need to add new researcher to the system first'})
        };
    } catch (error) {
        console.log(error);
        log4js.error(`Researcher.router.get./email/:email. Internal server error: ${error}`);
        return res.status(HTTP_SERVER_ERROR).json({ message: 'Server error'})
    }

})

/**
 * @swagger
 * /api/add:
 *   post:
 *     summary: Create a new researcher
 *     description: Create a new researcher by providing their first name, last name, email, and username.
 *     tags:
 *      - Researcher
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The first name of the researcher.
 *               lastName:
 *                 type: string
 *                 description: The last name of the researcher.
 *               email:
 *                 type: string
 *                 description: The email address of the researcher.
 *               username:
 *                 type: string
 *                 description: The username of the researcher.
 *             example:
 *               firstName: "John"
 *               lastName: "Doe"
 *               email: "john.doe@example.com"
 *               username: "john_doe"
 *     responses:
 *       200:
 *         description: Successful creation of a new researcher
 *         content:
 *           application/json:
 *             example:
 *               message: Create new researcher success
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Server error
 */
router.post('/add', async (req, res) => {

    const { firstName, lastName, email, username} = req.body;

    const newResearcher = new Researcher({
        firstName: firstName,
        lastName: lastName,
        email: email,
        username: username,
        password: '123456',
        studyList: [],
        isActive: true
    });
    try{
        await ResearcherDao.createResearcher(newResearcher);

        log4js.info(`Researcher.router.post/add. ${newResearcher.username} created success`);
        return res.status(HTTP_SUCCESS)
            .json({ message: 'Create new researcher success'})

    } catch (error) {
        log4js.error(`Researcher.router.post/add, Internal server error: ${error}`);
        return res.status(HTTP_SERVER_ERROR).json({ message: 'Server error'})
    }

})



router.get('/studyList/:researcherId', async (req, res) => {
    const { researcherId } = req.params;
    try{
        const user = await ResearcherDao.getResearcherById(researcherId);
        
        if (!Array.isArray(user.studyList) || user.studyList.length === 0) {
            return res.status(HTTP_SUCCESS).json([]);
        }

        const studies = await StudyDao.findStudiesByIdsAndPopulate(user.studyList);

        const counts = await StudyParticipantDao.getActiveStudyParticipantsCountsByStudyIds(user.studyList);
        
        const studlyInfoList = studies.map(study => {
            const countObj = counts.find(c => c._id.toString() === study._id.toString()) || { count: 0 };
            return {
                studyId: study._id,
                studyCode: study.studyCode,
                studyName: study.studyName,
                participantNum: study.participantNum,
                participantCurrentNum: study.isAnonymous ? study.anonymousParticipantNum : countObj.count,
                status: study.isClosed,
                isCleared: study.isCleared,
                recruitmentStartDate: study.recruitmentStartDate,
                recruitmentCloseDate: study.recruitmentCloseDate,
            };
        });
        
        log4js.info(`Researcher.router.get/studyList/:researcherId. Get ${researcherId} study info success`);
        return res.status(HTTP_SUCCESS).json(studlyInfoList);
    } catch (error) {
        log4js.error(`Researcher.router.get/studyList/:researcherId. Internal server error: ${error}`);
        return res.status(HTTP_SERVER_ERROR).json({ message: 'Server error'});
    }
});


router.get('/allResearchers', async (req, res) => {
    
    try{ 
        const allResearchers= await ResearcherDao.retrieveResearcherList();
        log4js.info(`Researcher.router.get/allResearchers. Get all researchers success`);
        return res.status(HTTP_SUCCESS)
            .json(allResearchers)
    } catch (error) {
        log4js.error(`Researcher.router.get/allResearchers. Internal server error: ${error}`);
        return res.status(HTTP_SERVER_ERROR).json({ message: 'Server error'});

        }

})

export default router;
