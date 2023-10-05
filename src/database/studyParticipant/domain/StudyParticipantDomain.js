import mongoose from 'mongoose';

const studyParticipantSchema = new mongoose.Schema({
    studyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Study'
    },
    serialNum: {
        type: Number
    },
    participantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Participant'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isComplete: {
        type: Boolean,
        default: false
    },
    isGift: {
        type: Boolean,
        default: false
    },
    isSentGift: {
        type: Boolean,
        default: false
    },
    isWIllReceiveReport: {
        type: Boolean,
        default: false
    },
    isSentReport: {
        type: Boolean,
        default: false
    },
    note: {
        type: String,
        default: ""
    }
}, {
    timestamps: {}
});

studyParticipantSchema.index({ studyId: 1, isActive: 1 });
studyParticipantSchema.index({ participantId: 1 });

const StudyParticipant = mongoose.model('StudyParticipant', studyParticipantSchema,'StudyParticipant');

export default StudyParticipant;
