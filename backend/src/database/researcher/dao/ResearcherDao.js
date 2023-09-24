import  Researcher  from "../domain/ResearcherDomain.js";



class ResearcherDao  {

    static async  createResearcher(researcher) {

        const dbResearcher = new Researcher(researcher);
        await dbResearcher.save();
        return dbResearcher;

    }

    static async  retrieveResearcherList() {

        return  await Researcher.find();
    }

    static async  getResearcherById(id) {
        return  await Researcher.findById(id);
    }

    static async  retrieveResearcherByFirstName(firstName) {

        const researcher = await Researcher.find({
            researcherFirstName: { $regex: firstName, $options: 'i' }
        });
        return researcher;
    }

    static async  retrieveResearcherByLastName(lastName) {

        const researcher = await Researcher.find({
            researcherLastName: { $regex: lastName, $options: 'i' }
        });
        return researcher;
    }

    static async getResearcherByEmail(email){
        const researcher = await Researcher.findOne({email: email});

        return researcher;
    }

    static async  updateResearcher(researcher, firstName, lastName, email){


        researcher.firstName = firstName;
        researcher.lastName = lastName;
        researcher.email = email;
        const dbResearcher = await Researcher.findOneAndUpdate({ _id: researcher._id}, researcher, {new: true});

        return dbResearcher != null;
    }


    static async  updateResearcherByResearcherId(researcherId, studyId) {
        const dbResearcher = await Researcher.findOneAndUpdate({ _id: researcherId}, { $addToSet: { studyList: studyId } }, {new: true});
        return dbResearcher != null;
    }

    static async login(username, password){

        const user = await Researcher.findOne({ username: username, password: password });

        return user;

    }

    static async resetResearcherPwd(researcher, newPwd){

        researcher.password = newPwd;

        const dbResearcher = await Researcher.findOneAndUpdate({ _id: researcher._id}, researcher, {new: true});

        return dbResearcher != null;
    }

    static async checkPassword(researcher, password){

        return researcher.password == password;

    }

    static async removeStudyfromResearcher(studyId, researcherId){

        try{
            // Find the researcher by their ID
            const researcher = await Researcher.findById(researcherId);
            
            // Check if the researcher exists
            if (!researcher) {
                throw new Error('Researcher not found');
            }

            // Remove the studyId from the researcher's studyList
            researcher.studyList = researcher.studyList.filter(id => id.toString() !== studyId);

            // Save the updated researcher
            await researcher.save();

            return { success: true, message: 'study removed from researcher' };
            
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

export {ResearcherDao};




