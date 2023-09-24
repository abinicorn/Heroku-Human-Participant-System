import express from "express";

const router = express.Router();

import participant from './participant.js';
router.use('/participant', participant);

import studyParticipant from "./studyParticipant.js";
router.use('/study-participants', studyParticipant);

import tag from './tag.js';
router.use('/tag', tag);

import researcher from './researcher.js';
router.use('/researcher', researcher);

import session from './session.js';
router.use('/session', session);

import study from './study.js';
router.use('/study', study);


export default router;