import Participant from '../domain/ParticipantDomain.js';
import mongoose from 'mongoose';

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

    static async addTagByIds(ids, tagId) {
        const matchedDocuments = await Participant.updateMany(
            { _id: { $in: ids } },
            { $addToSet: { tag: tagId } } // 使用 $addToSet 来避免重复添加 tagId
        );

        if(matchedDocuments.modifiedCount == 0) {
            throw new Error('No documents found for the provided IDs.');
        }
        
        // if(!matchedDocuments) {
        //     throw new Error('No documents found for the provided IDs.');
        // }
        
        return matchedDocuments.modifiedCount; // 返回实际更新的文档数量。
    }

    static async deleteTagByIds(ids, tagId) {
        const matchedDocuments = await Participant.updateMany(
            { _id: { $in: ids } },
            { $pull: { tag: tagId } } // 使用 $pull 来删除 tag 数组中的 tagId
        );
        
        if(matchedDocuments.modifiedCount == 0) {
            throw new Error('No documents found for the provided IDs.');
        }
        
        return matchedDocuments.modifiedCount; // 返回实际更新的文档数量。
    }

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

    // static async anonymizeParticipants(participantIds) {
    //     const fakeEmailSuffix = '@deleteduser.com';
    //     return await Participant.updateMany(
    //         { _id: { $in: participantIds } },
    //         { $set: { firstName: 'Deleted', lastName: 'Participant', email: { $concat: ['$_id', fakeEmailSuffix] }, phoneNum: '' } }
    //     );
    // }

    static async anonymizeParticipants(participantIds) {
        const objectIdList = participantIds.map(id => mongoose.Types.ObjectId(id)); // 转换为ObjectId，如果它们已经是ObjectId，则不必转换
        
        const pipeline = [
            { $match: { _id: { $in: objectIdList } } },
            {
                $addFields: {
                    email: {
                        $concat: [
                            { $toString: '$_id' }, // 转换ObjectId为字符串
                            '@deleteduser.com'
                        ]
                    },
                    firstName: 'Deleted',
                    lastName: 'Participant',
                    phoneNum: ''
                }
            },
            {
                $merge: {
                    into: 'Participant', // 或者您的集合名字
                    whenMatched: 'merge'
                }
            }
        ];

        // 执行聚合管道
        return await Participant.aggregate(pipeline);
    }

    static async deleteParticipant(participantId) {
        return await Participant.findByIdAndDelete(participantId);
    }
}

export default ParticipantDao;
