import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Session from '../domain/SessionDomain';

// Testing data
const session1 = {
    _id: new mongoose.Types.ObjectId('000000000000000000000001'),
    studyId: mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6a1"),
    sessionCode: 'SE5566',
    date: new Date("2023-08-15"),
    time: "14:00",
    location: "Room A",
    participantNum: 10,
    participantList: [
        mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b1"),
        mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b2"),
        mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b3"),
        mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b4")
    ],
    isArchive: true  
};

const session2 = {
    _id: new mongoose.Types.ObjectId('000000000000000000000002'),
    studyId: mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6a2"),
    sessionCode: 'SE45893',
    date: new Date("2023-09-05"),
    time: "10:30",
    location: "Conference Room B",
    participantNum: 20,
    participantList: [
        mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b5"),
        mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b6"),
        mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b7")
    ],
    isArchive: false 
};

const session3 = {
    _id: new mongoose.Types.ObjectId('000000000000000000000003'),
    studyId: mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6a1"),
    sessionCode: 'SE4587',
    date: new Date("2023-09-15"),
    time: "14:00",
    location: "Room 301",
    participantNum: 30,
    participantList: [
        mongoose.Types.ObjectId("615aef8f1d8e5a001f8e6b11"),
        mongoose.Types.ObjectId("615aef8f1d8e5a001f8e6b12"),
        mongoose.Types.ObjectId("615aef8f1d8e5a001f8e6b13")
    ],
    isArchive: false 
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
    await mongoose.connection.db.dropCollection('Session');
    await mongoose.connection.db.dropDatabase();
    // Create new collections
    const collection = await mongoose.connection.db.createCollection('Session');
    await collection.insertMany(sessions);
});


/**
 * After all tests, gracefully terminate the in-memory MongoDB instance and mongoose connection.
 */
afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
    await mongod.stop();
});

describe ('Check session schema', () => {
    it('get sessions', async () => {
        
        const sessionsFromDb = await Session.find();
        expect(sessionsFromDb).toBeTruthy();
        expect(sessionsFromDb.length).toBe(3);

        expect(sessionsFromDb[0].studyId).toEqual(mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6a1"));
        expect(sessionsFromDb[0].sessionCode).toBe('SE5566');
        expect(sessionsFromDb[0].date.toISOString().split('T')[0]).toEqual('2023-08-15');
        expect(sessionsFromDb[0].time).toBe('14:00');
        expect(sessionsFromDb[0].location).toBe('Room A');
        expect(sessionsFromDb[0].participantNum).toBe(10);
        expect(sessionsFromDb[0].participantList.length).toBe(4);
        expect(sessionsFromDb[0].isArchive).toBe(true);

        expect(sessionsFromDb[1].studyId).toEqual(mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6a2"));
        expect(sessionsFromDb[1].sessionCode).toBe('SE45893');
        expect(sessionsFromDb[1].date.toISOString().split('T')[0]).toEqual('2023-09-05');
        expect(sessionsFromDb[1].time).toBe('10:30');
        expect(sessionsFromDb[1].location).toBe('Conference Room B');
        expect(sessionsFromDb[1].participantNum).toBe(20);
        expect(sessionsFromDb[1].participantList.length).toBe(3);
        expect(sessionsFromDb[1].isArchive).toBe(false);

        expect(sessionsFromDb[2].studyId).toEqual(mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6a1"));
        expect(sessionsFromDb[2].sessionCode).toBe('SE4587');
        expect(sessionsFromDb[2].date.toISOString().split('T')[0]).toEqual('2023-09-15');
        expect(sessionsFromDb[2].time).toBe('14:00');
        expect(sessionsFromDb[2].location).toBe('Room 301');
        expect(sessionsFromDb[2].participantNum).toBe(30);
        expect(sessionsFromDb[2].participantList.length).toBe(3);
        expect(sessionsFromDb[2].isArchive).toBe(false);

    });
});