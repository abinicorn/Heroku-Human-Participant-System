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

    static async getParticipantsToContact() {
        const pipeline = [
            {
                $match: { isWillContact: true } // get all docs with 'isWillContact:true'
            },
            {
                $lookup: {
                    from: "Tag",
                    localField: "tag",
                    foreignField: "_id",
                    as: "tagNames"
                }
            },
            {
                $project: {
                    email: 1,
                    tag: "$tagNames.tagName" // only select 'tagName'
                }
            }
        ];
        
        return await Participant.aggregate(pipeline);
    }

    static async addTagByIds(ids, tagId) {
        const matchedDocuments = await Participant.updateMany(
            { _id: { $in: ids } },
            { $addToSet: { tag: tagId } } // Use $addToSet to avoid adding tagId repeatedly
        );

        if(matchedDocuments.modifiedCount == 0) {
            throw new Error('No documents found for the provided IDs.');
        }
        
        // if(!matchedDocuments) {
        //     throw new Error('No documents found for the provided IDs.');
        // }
        
        return matchedDocuments.modifiedCount; // Returns the actual number of documents updated.
    }

    static async deleteTagByIds(ids, tagId) {
        const matchedDocuments = await Participant.updateMany(
            { _id: { $in: ids } },
            { $pull: { tag: tagId } } // Use $pull to delete the tagId in the tag array
        );
        
        if(matchedDocuments.modifiedCount == 0) {
            throw new Error('No documents found for the provided IDs.');
        }
        
        return matchedDocuments.modifiedCount; // Returns the actual number of documents updated.
    }

    static async updateParticipantById(participantId, updateData) {
        const participant = await Participant.findByIdAndUpdate(participantId, updateData, {new: true});
        return participant != null;
    }

    static async toggleBooleanPropertyByIds(ids, propertyName) {
        // Get all matching documents.
        const matchedDocuments = await Participant.find({ _id: { $in: ids } }).lean();
    
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
    
        // Use two updateMany operations to update the document separately.
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
    
        return matchedDocuments.length;  // Returns the number of documents processed.
    }


    static async anonymizeParticipants(participantIds) {
        const objectIdList = participantIds.map(id => mongoose.Types.ObjectId(id)); // Convert to ObjectId
        
        const pipeline = [
            { $match: { _id: { $in: objectIdList } } },
            {
                $addFields: {
                    email: {
                        $concat: [
                            { $toString: '$_id' }, // transfor ObjectId to string
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
                    into: 'Participant',
                    whenMatched: 'merge'
                }
            }
        ];

        return await Participant.aggregate(pipeline);
    }

    static async deleteParticipant(participantId) {
        return await Participant.findByIdAndDelete(participantId);
    }

    static async deleteAnonymizedParticipants() {
        const query = {
            email: { $regex: /@deleteduser\.com$/, $options: "i" }, // match email ending with '@deleteduser.com'
            $expr: { $eq: [{ $strLenCP: "$email" }, 40] } // ensure the length of email is 40
        };
        return await Participant.deleteMany(query);
    }
    
}

export default ParticipantDao;
