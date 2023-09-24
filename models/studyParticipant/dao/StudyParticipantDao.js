import StudyParticipant from '../domain/StudyParticipantDomain.js';

class StudyParticipantDao {
    // static async createStudyParticipant(data) {
    //     const studyParticipant = new StudyParticipant(data);
    //     return await studyParticipant.save();
    // }

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

    static async updateStudyParticipantById(id, updateData) {
        const studyParticipant = await StudyParticipant.findByIdAndUpdate(id, updateData, {new: true});
        return studyParticipant != null;
    }

    static async toggleBooleanPropertyByIds(ids, propertyName) {
        // 获取所有匹配的文档。
        const matchedDocuments = await StudyParticipant.find({ _id: { $in: ids }, isActive: true }).lean();
    
        if (!matchedDocuments || matchedDocuments.length === 0) {
            throw new Error('No documents found for the provided IDs.');
        }
    
        const idsToSetTrue = [];
        const idsToSetFalse = [];
    
        // 根据当前的boolean值分类ID。
        matchedDocuments.forEach(doc => {
            if (doc[propertyName]) {
                idsToSetFalse.push(doc._id);
            } else {
                idsToSetTrue.push(doc._id);
            }
        });
    
        // 使用两个updateMany操作分别更新文档。
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
    
        return matchedDocuments.length;  // 返回处理的文档数量。
    }
    

    static async deleteStudyParticipantById(id) {
        return await StudyParticipant.findByIdAndDelete(id);
    }
}

export default StudyParticipantDao;
