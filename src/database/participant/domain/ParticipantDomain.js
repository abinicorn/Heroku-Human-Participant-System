import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const participantSchema = new Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNum: {
        type: String,
        default: ""
    },
    tag: [{
        type: Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    isWillContact: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: {}
});

participantSchema.index({ email: 1 });
participantSchema.index({ tag: 1 });
participantSchema.index({ isWillContact: 1 });

const Participant = mongoose.model('Participant', participantSchema, 'Participant');

export default Participant;
