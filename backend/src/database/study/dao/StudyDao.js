import Study from "../domain/StudyDomain.js";

class StudyDao {
    static async createStudy(study) {

        const dbStudy = new Study(study);
        await dbStudy.save();
        // await Study.findOneAndUpdate(
        //     { _id: dbStudy._id },
        //     { $push: { researcherList: dbStudy.creator } },
        //     { new: true }
        // );
        return dbStudy;
    }


    static async retrieveAllStudyList() {
        return await Study.find();
    }

    static async retrieveStudy(id) {
        return await Study.findById(id)
    }
    static async retrieveStudyReport(id) {
        return await Study.findById(id)
            .populate("creator")
            .populate("researcherList");
    }

    static async retrieveStudyList(idList) {
        return await Study.find({ _id: { $in: idList } });
    }

    static async updateStudy(studyId, studyData) {
        try {
            const dbStudy = await Study.findOneAndUpdate(
                { _id: studyId },
                { $set: studyData },
                { new: true });
            return dbStudy || null;
        } catch (error) {
            console.log("Update study error: ", error);
        }
    }

    static async deleteStudyById(id) {
        await Study.deleteOne({ _id: id });
    }

    static async retrieveResearcherListByStudyId(studyId) {

        try {
            const study = await Study.findById(studyId)
                .populate(
                    "researcherList"
                );
            console.log(study);
            if (!study) {
                return null; // Study not found
            }
            return study.researcherList;
        } catch (error) {
            console.error(error);
        }
    }

    static async removeResearherfromStudy(studyId, researcherId) {

        try {
            // Find the study by its ID
            const study = await Study.findById(studyId);


            // Check if the study exists
            if (!study) {
                throw new Error('Study not found');
            }

            // Remove the researcher from the list of researchers
            study.researcherList = study.researcherList.filter(id => id.toString() !== researcherId);

            // Save the updated study
            await study.save();

            return { success: true, message: 'Researcher removed from study' };

        } catch (error) {
            return { success: false, message: error.message };
        }

    }


    //To update the study's reseacherList by adding researcherId
    static async updateStudyByStudyId(studyId, researcherId) {
        const dbStudy = await Study.findOneAndUpdate({ _id: studyId }, { $addToSet: { researcherList: researcherId } }, { new: true });
        return dbStudy != null;
    }

    static async findCreator(studyId) {
        const dbStudy = await Study.findOne({ _id: studyId });
        return dbStudy.creator;
    }

}

export default StudyDao;
