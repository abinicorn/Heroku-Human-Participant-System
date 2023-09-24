import mongoose from 'mongoose';
import Session from './session/domain/SessionDomain.js';
import SessionDao from './session/dao/SessionDao.js';
import { dummyParticipants, dummyResearchers, dummySessions } from './dummydata.js';
import ParticipantDao from './participant/dao/ParticipantDao.js';
import Participant from './participant/domain/ParticipantDomain.js';
import {ResearcherDao} from "./researcher/dao/ResearcherDao";
import * as dotenv from "dotenv";

dotenv.config();

main();

async function main() {

    console.log('Init-db Start.....')

    // For cloud env
    await mongoose.connect( process.env.DB_URL,{ useNewUrlParser: true });
    console.log('Connected to cloud database!');
    //

    // For local test
    // await mongoose.connect(process.env.DB_LOCAL_URL,{useNewUrlParser: true});
    // console.log('Connected to local database!');

    // Clear old data in the database
    // await clearDatabase();
    // console.log("Old data cleared");


    await seedSampleData();
    console.log('Added sample data!');


    // Disconnect when complete
    await mongoose.disconnect();
    console.log('Disconnected from database!');
}

// Clear database function
async function clearDatabase() {
    const sessionDeleted = await Session.deleteMany({});
    const participantDeleted = await Participant.deleteMany({});
    console.log(`Cleared database (removed ${sessionDeleted.deletedCount} sessions).`);
    console.log(`Cleared database (removed ${participantDeleted.deletedCount} sessions).`);
}

// Add dummy sessions to the database
async function addSessions() {

    for (let dummySession of dummySessions) {
        const dbData = await SessionDao.createSession(dummySession);
        // console.log(`${dbData.date}'s session is added to database (_id = ${dbData._id})`);
    }
} 

// Add dummy participant
async function addParticipants() {

    for (let dummyParticipant of dummyParticipants) {
        const dbData = await ParticipantDao.createParticipant(dummyParticipant);
        // console.log(`${dbData.date}'s session is added to database (_id = ${dbData._id})`);
    }
}

async function addResearcherData() {

    for (let dummyResearcher of dummyResearchers) {
        const dbData = await ResearcherDao.createResearch(dummyResearcher);
    }
}


async function seedSampleData(){

    // await addSessions();
    // console.log("Sessions added");
    //
    // await addParticipants()
    // console.log("Participants added");

    await addResearcherData();
    console.log("Researcher added");

}
