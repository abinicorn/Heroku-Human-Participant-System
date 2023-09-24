import Participant from '../domain/ParticipantDomain.js';

class ParticipantDao {

    static async createMultipleParticipants(participantsData) {
        return await Participant.insertMany(participantsData, { ordered: false });
    }

    static async getAllParticipants() {
        return await Participant.find({}, {_id: 1});
    }

    static async getParticipantById(participantId) {
        return await Participant.findById(participantId).lean();
    }

    static async findParticipantsByEmails(emails) {
        return await Participant.find({ email: { $in: emails } });
    }

    // static async getParticipantByEmail(email) {
    //     return (await Participant.findOne({ email: email }, '_id'))?._id ?? null;
    // }

    static async updateParticipantById(participantId, updateData) {
        const participant = await Participant.findByIdAndUpdate(participantId, updateData, {new: true});
        return participant != null;
    }

    static async toggleBooleanPropertyByIds(ids, propertyName) {
        // 获取所有匹配的文档。
        const matchedDocuments = await Participant.find({ _id: { $in: ids } }).lean();
    
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
            await Participant.updateMany(
                { _id: { $in: idsToSetTrue } },
                { $set: { [propertyName]: true } }
            );
        }
        
        if (idsToSetFalse.length) {
            await Participant.updateMany(
                { _id: { $in: idsToSetFalse } },
                { $set: { [propertyName]: false } }
            );
        }
    
        return matchedDocuments.length;  // 返回处理的文档数量。
    }

    static async deleteParticipant(participantId) {
        return await Participant.findByIdAndDelete(participantId);
    }
}

export default ParticipantDao;
