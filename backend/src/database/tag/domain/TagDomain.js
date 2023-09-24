import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const tagSchema = new Schema({
    tagName: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: {}
});

const Tag = mongoose.model('Tag', tagSchema, 'Tag');

export default Tag