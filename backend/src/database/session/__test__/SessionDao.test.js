import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import SessionDao from '../dao/SessionDao';

// Testing data
const session1 = {
    //_id: new mongoose.Types.ObjectId('000000000000000000000001'),
    studyId: 'ObjectId("615cdd2f3d4f7e0016b4a6a1")',
    date: new Date("2023-08-15"),
    time: "14:00",
    location: "Room A",
    participantNum: 10,
    participantList: [
        'ObjectId("615cdd2f3d4f7e0016b4a6b1")',
        'ObjectId("615cdd2f3d4f7e0016b4a6b2")',
        'ObjectId("615cdd2f3d4f7e0016b4a6b3")',
        'ObjectId("615cdd2f3d4f7e0016b4a6b4")'
    ] 
};

const session2 = {
    //_id: new mongoose.Types.ObjectId('000000000000000000000002'),
    studyId: 'ObjectId("615cdd2f3d4f7e0016b4a6a2")',
    date: new Date("2023-09-05"),
    time: "10:30",
    location: "Conference Room B",
    participantNum: 8,
    participantList: [
        'ObjectId("615cdd2f3d4f7e0016b4a6b5")',
        'ObjectId("615cdd2f3d4f7e0016b4a6b6")',
        'ObjectId("615cdd2f3d4f7e0016b4a6b7")'
    ]
};

const session3 = {
    //_id: new mongoose.Types.ObjectId('000000000000000000000003'),
    studyId: ObjectId("615aef8f1d8e5a001f8e6b01"),
    date: new Date("2023-09-15"),
    time: "14:00",
    location: "Room A",
    participantNum: 10,
    participantList: [
        'ObjectId("615aef8f1d8e5a001f8e6b11")',
        'ObjectId("615aef8f1d8e5a001f8e6b12")',
        'ObjectId("615aef8f1d8e5a001f8e6b13")'
    ]
};

const sessions = [session1, session2, session3];

let mongod;

/**
 * Before all tests, create an in-memory MongoDB instance so we don't have to test on a real database,
 * then establish a mongoose connection to it.
 */
beforeAll(async () => {

    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { useNewUrlParser: true });

});

/**
 * Before each test, initialize the database with some data
 */
beforeEach(async () => {

    // Drop existing collections
    await mongoose.connection.db.dropDatabase();
    // Create new collections
    const collection = await mongoose.connection.db.createCollection('Session');
    await collection.insertMany(sessions);
});

/**
 * After all tests, gracefully terminate the in-memory MongoDB instance and mongoose connection.
 */
afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

describe ('Check session dao', () => {
    it ('Check the return value of retrieveSessionList function', async () => {
        const result = await SessionDao.retrieveSessionList();
        expect(result).toBeDefined();
        expect(result.length).toBe(3);
    })
});