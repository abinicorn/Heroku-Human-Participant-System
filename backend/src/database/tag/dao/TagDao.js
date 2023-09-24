import Tag from '../domain/TagDomain.js';

class TagDao {

    static async createMultipleTags(tagsData) {
        return await Tag.insertMany(tagsData, { ordered: false });
    }

    static async getAllTags() {
        return await Tag.find({}, {tagName: 1});
    }

    static async getTagById(tagId) {
        return await Tag.findById(tagId).lean();
    }

    static async getTagByTagNames(tagNames) {
        return await Tag.find({ tagName: { $in: tagNames } });
    }

    static async updateTag(tagId, updateData) {
        const tag = await Tag.findByIdAndUpdate(tagId, updateData, {new: true});
        return tag != null;
    }

    static async deleteTag(tagId) {
        return await Tag.findByIdAndDelete(tagId);
    }
}

export default TagDao;