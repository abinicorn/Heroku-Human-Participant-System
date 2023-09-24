import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const researcherSchema = new Schema({

    firstName: String,
    lastName: String,
    email: {type: String, unique: true},
    username: {type: String, unique: true},
    password: String,
    studyList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Study'}],
    isActive: Boolean
}, {
    timestamps: true
});

const Researcher = mongoose.model('Researcher', researcherSchema, 'Researcher');

export default Researcher;