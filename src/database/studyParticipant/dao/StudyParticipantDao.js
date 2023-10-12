import StudyParticipant from '../domain/StudyParticipantDomain.js';
import mongoose from 'mongoose';

class StudyParticipantDao {

    static async createMultipleStudyParticipants(studyId, participantIds) {
        const existingCount = await StudyParticipant.countDocuments({ studyId });
    
        const data = participantIds.map((participantId, index) => ({
            studyId,
            participantId,
            serialNum: existingCount + index + 1
        }));
        
        return await StudyParticipant.insertMany(data);
    }
    
    static async checkExistingStudyParticipants(studyId, participantIds) {
        const existingParticipants = await StudyParticipant.find({
            studyId: studyId,
            participantId: { $in: participantIds }
        }).exec();
    
        return existingParticipants;
    }

    static async getActiveStudyParticipantsCountByStudyId(studyId) {
        const query = {
            studyId: studyId,
            isActive: true
        };
        return await StudyParticipant.countDocuments(query);
    }

    static async getActiveStudyParticipantsCountsByStudyIds(studyIds) {
        const counts = await StudyParticipant.aggregate([
            { $match: { studyId: { $in: studyIds }, isActive: true } },
            { $group: { _id: "$studyId", count: { $sum: 1 } } }
        ]);
        return counts;
    }

    static async findStudyParticipantById(id) {
        return await StudyParticipant.findById(id);
    }

    static async findMultipleStudyParticipantsByIds(ids) {
        return await StudyParticipant.find({ _id: { $in: ids } })
            .populate({
                path: 'participantId',
                select: 'firstName lastName email phoneNum tag isWillContact',  // select filling attributes
                populate: {
                    path: 'tag',
                    select: '_id tagName'  // fill tagName
                }
            })
            .lean();
    }

    static async findStudyParticipantsByStudyId(studyId) {
        return await StudyParticipant.find({ studyId, isActive: true })
            .select("studyId serialNum isActive isComplete isGift isSentGift isWIllReceiveReport isSentReport note")
            .populate({
                path: 'participantId',
                select: 'firstName lastName email phoneNum tag isWillContact',  // select filling attributes
                populate: {
                    path: 'tag',
                    select: 'tagName'  // fill tagName
                }
            })
            .lean();
    }

    static async findStudyParticipantsByParticipantId(participantId) {
        return await StudyParticipant.find({participantId}).lean();
    }

    static async activateExistingParticipants(existingParticipants) {
        const idsToActivate = existingParticipants.map(p => p._id);
        if (idsToActivate.length > 0) {
            await StudyParticipant.updateMany(
                { _id: { $in: idsToActivate }, isActive: false },
                { $set: { isActive: true } }
            );
        }
        return await StudyParticipant.find({ _id: { $in: idsToActivate } }).lean();
    }
    

    static async updateStudyParticipantById(id, updateData) {
        const studyParticipant = await StudyParticipant.findByIdAndUpdate(id, updateData, {new: true});
        return studyParticipant != null;
    }

    static async toggleBooleanPropertyByIds(ids, propertyName) {
        // Get all matching documents.
        const matchedDocuments = await StudyParticipant.find({ _id: { $in: ids }, isActive: true }).lean();
    
        if (!matchedDocuments || matchedDocuments.length === 0) {
            throw new Error('No documents found for the provided IDs.');
        }
    
        const idsToSetTrue = [];
        const idsToSetFalse = [];
    
        // Sort the ID based on the current boolean value.
        matchedDocuments.forEach(doc => {
            if (doc[propertyName]) {
                idsToSetFalse.push(doc._id);
            } else {
                idsToSetTrue.push(doc._id);
            }
        });
    
        // Use two updateMany operations to update documents separately.
        if (idsToSetTrue.length) {
            await StudyParticipant.updateMany(
                { _id: { $in: idsToSetTrue } },
                { $set: { [propertyName]: true } }
            );
        }
        
        if (idsToSetFalse.length) {
            await StudyParticipant.updateMany(
                { _id: { $in: idsToSetFalse } },
                { $set: { [propertyName]: false } }
            );
        }
    
        return matchedDocuments.length;  // Returns the number of documents processed.
    }

    static async getParticipantsByStudy(studyId) {
        const pipeline = [
            { $match: { studyId: mongoose.Types.ObjectId(studyId) } },
            {
                $lookup: {
                    from: 'Participant',
                    localField: 'participantId',
                    foreignField: '_id',
                    as: 'participant'
                }
            },
            { $unwind: '$participant' },
            { $match: { 'participant.isWillContact': false } },
            {
                $lookup: {
                    from: 'StudyParticipant',
                    localField: 'participantId',
                    foreignField: 'participantId',
                    as: 'relatedStudyParticipants'
                }
            },
            {
                $lookup: {
                    from: 'Study',
                    localField: 'relatedStudyParticipants.studyId',
                    foreignField: '_id',
                    as: 'relatedStudies'
                }
            },
            { $unwind: '$relatedStudies' },
            { $group: { _id: '$participantId', allClosed: { $min: '$relatedStudies.isClosed' } } },
            { $match: { allClosed: true } },
            { $group: { _id: null, participantIds: { $push: '$_id' } } }
         ];
        return await StudyParticipant.aggregate(pipeline);
    }
    
    static async deleteStudyParticipantById(id) {
        return await StudyParticipant.findByIdAndDelete(id);
    }

    static async deleteStudyParticipantsByStudyId(studyId) {
        return await StudyParticipant.deleteMany({ studyId: studyId });
    }
    
}

export default StudyParticipantDao;
