import Session from '../domain/SessionDomain.js';

class SessionDao {

    static async createSession(session) {

        const dbSession = new Session(session);
        await dbSession.save();
        return dbSession;
    }
    
    static async retrieveSessionById(id) {
        return await Session.findById(id);
    }

    static async retrieveSessionByStudyId(id) {
        return await Session.find({ studyId: id})
        .populate({
            path: 'participantList',
            populate: {path: '_id', select: 'firstName lastName email phoneNum'}
        })
        .lean();
    }
    
    static async updateSession(sessionId, updateData) {
    
        const dbSession = await Session.findByIdAndUpdate(sessionId, updateData, { new: true });
        return dbSession != null;

    }

    static async deleteSessionsByStudyId(studyId) {
        return await Session.deleteMany({ studyId: studyId });
    }
    
    /*
    static async deleteSession(id) {
        return await Session.deleteOne({ _id: id });
    }
    */
    
}

export default SessionDao;