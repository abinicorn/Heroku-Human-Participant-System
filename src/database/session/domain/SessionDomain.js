import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    
    studyId: {type: Schema.Types.ObjectId, ref:'Study', required: true},
    sessionCode: {type: String, required: true, unique: true},
    date: {type: Date, required: true},
    time: {type: String},
    location: {type: String},
    note: {type: String},
    participantNum: {type: Number, required: true},
    participantList: [{type: Schema.Types.ObjectId, ref:'Participant'}],
    isArchive: {type: Boolean} 
}, {
    timestamps: {}
});

const Session = mongoose.model('Session', sessionSchema, 'Session');

export default Session;
