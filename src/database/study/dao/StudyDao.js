import Study from "../domain/StudyDomain.js";

class StudyDao {

    //To create a study
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


    //To retrieve all studies
    static async retrieveAllStudyList() {
        return await Study.find();
    }

    //To retrieve all studies by studyId
    static async retrieveStudy(id) {
        return await Study.findById(id)
    }

    //To retrieve the study details with creator and researcherList populated by studyId
    static async retrieveStudyReport(id) {
        return await Study.findById(id)
            .populate("creator", "firstName lastName email username createdAt updatedAt isActive") 
            .populate("researcherList", "firstName lastName email username createdAt updatedAt isActive"); 
    }


    //To retrieve all studies information with creator and researcherlist populated by studyIdList
    static async findStudiesByIdsAndPopulate(studyIds) {
        return await Study.find({ _id: { $in: studyIds } })
            .populate("creator", "firstName lastName email username isActive")
            .populate("researcherList", "firstName lastName email username isActive");
    }
    

    //To retrieve all studies information by studyIdList
    static async retrieveStudyList(idList) {
        return await Study.find({ _id: { $in: idList } });
    }


    //To update study information by studyId and study data
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

    //To retreieve researcherList of a study by studyId
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


    //To remove a researcher from the researcher list of a study by studyId and researcherId
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


    // To retrieve the study's creator by studyId
    static async findCreator(studyId) {
        const dbStudy = await Study.findOne({ _id: studyId });
        return dbStudy.creator;
    }

    //To retrieve the study by studyCode
    static async findStudyByCode(code) {
        const dbStudy = await Study.findOne({ studyCode: code });
        return dbStudy;
    }


    //For further use of deleting a study
    // static async deleteStudyById(id) {
    //     await Study.deleteOne({ _id: id });
    // }

}

export default StudyDao;
