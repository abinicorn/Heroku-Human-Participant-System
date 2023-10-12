import express from 'express';
import TagDao from '../database/tag/dao/TagDao.js';

const router = express.Router();
const log4js = require('../utils/log4js.js');

import { HTTP_SUCCESS,
    HTTP_NOT_FOUND,
    HTTP_SERVER_ERROR,
    HTTP_BAD_REQUEST,
    HTTP_CREATED,
    HTTP_NO_CONTENT,
    HTTP_LOGIN_ERROR} from "../enum.js";

//retrieve all tags in the db
router.get('/all', async (req, res) => {
    try {
        const tags = await TagDao.getAllTags();
        log4js.info(`Tag.router.get./all. Get all tags: ${tags.length}`)
        return res.status(HTTP_SUCCESS).json(tags);
    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            res.status(HTTP_SERVER_ERROR).json({ error: "Internal server error." });
            log4js.error(`Tag.router.get./all. Internal server error : ${error}`);
        } else {
            res.status(HTTP_SERVER_ERROR).json({
                error: "Failed to get tags.",
                details: error.message
            });
            log4js.error(`Tag.router.get./all. Failed to get tags : ${error}`);
        }
    }
});

//retrieve tag by tag id
router.get('/:tagId', async (req, res) => {
    try {
        const { tagId } = req.params;
        const tag = await TagDao.getTagById(tagId);

        if (tag) {
            res.json(tag);
            log4js.info(`Tag.router.get./:tagId. TagID:${tagId} retrieved`)
        } else {
            res.status(HTTP_NOT_FOUND).json({ error: "Tag not found" });
            log4js.warn(`Tag.router.get./:tagId. TagId:${tagId} not found`)
        }
    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            res.status(HTTP_SERVER_ERROR).json({ error: "Internal server error." });
            log4js.error(`Tag.router.get./:tagId, Internal server error : ${error}`);
        } else {
            res.status(HTTP_SERVER_ERROR).json({
                error: "Failed to get tag.",
                details: error.message
            });
            log4js.error(`Tag.router.get./:tagId. Failed to get tag : ${error}`);
        }
    }
});

//add new tags to db
router.post('/add', async (req, res) => {
    let tagsData = req.body.tags;

    // wrong syntax if its not array
    if (!Array.isArray(tagsData)) {
        res.status(HTTP_BAD_REQUEST).json("Wrong request syntax.");
        log4js.warn(`Tag.router.post./add. Wrong request syntax.}`);
        return;
    }

    try {
        // 1. filter existing data by searching tagNames
        const tagNames = tagsData.map(p => p.tagName);
        const existingTags = await TagDao.getTagByTagNames(tagNames);
        const existingTagNames = new Set(existingTags.map(p => p.tagName));
        tagsData = tagsData.filter(p => !existingTagNames.has(p.tagName));

        // 2. try to create all participants
    
        const result = await TagDao.createMultipleTags(tagsData);
        
        res.status(HTTP_CREATED).json({ 
            success: result,
            existing: existingTags
        });
        log4js.info(`Tag.router.post./add. Tag${tagNames} created`);

    } catch (error) {
        if (error.writeErrors) {
            // Handle writeErrors if they exist.
            const errorDetails = error.writeErrors.map(e => e.err);
            res.status(HTTP_BAD_REQUEST).json({
                error: "Failed to fully create tags",
                failedDetails: errorDetails
            });
            log4js.error(`Tag.router.post./add. Failed to fully create tags : ${errorDetails}`);
        } else {
            // Handle other types of errors.
            if (process.env.NODE_ENV === 'production') {
                res.status(HTTP_SERVER_ERROR).json({ error: "Internal server error." });
                log4js.error(`Tag.router.post./add. Internal server error : ${error}`);
            } else {
                res.status(HTTP_SERVER_ERROR).json({
                    error: "Failed to create tags.",
                    details: error.message
                });
                log4js.error(`Tag.router.post./add. Failed to create tag : ${error}`);
            }
        }
    }
});


export default router;