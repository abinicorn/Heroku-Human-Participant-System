import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import SessionDao from '../dao/SessionDao';
import Session from '../domain/SessionDomain';
import Participant from '../../participant/domain/ParticipantDomain';

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
    isArchive: true,
    createdAt: new Date(),
    updatedAt: new Date()
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
        mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b2"),
        mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b3"),
        mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b4")
    ],
    isArchive: false,
    createdAt: new Date(),
    updatedAt: new Date()
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
        mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b1"),
        mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b2"),
        mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b3")
    ],
    isArchive: false,
    createdAt: new Date(),
    updatedAt: new Date()
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

describe ('Check session dao', () => {
    

    it ('Check the return value of retrieveSessionById function', async () => {
        const result = await SessionDao.retrieveSessionById('000000000000000000000002')
        expect(result.studyId).toEqual(mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6a2"));
        expect(result.sessionCode).toBe('SE45893');
        expect(result.date.toISOString().split('T')[0]).toEqual('2023-09-05');
        expect(result.time).toBe('10:30');
        expect(result.location).toBe('Conference Room B');
        expect(result.participantNum).toBe(20);
        expect(result.participantList.length).toBe(3);
        expect(result.isArchive).toBe(false);
    });

    it ('Check the return value of retrieveSessionByStudyId function', async () => {
        const result = await SessionDao.retrieveSessionByStudyId('615cdd2f3d4f7e0016b4a6a1');
        expect(result).toBeDefined();
        expect(result.length).toBe(2);
        expect(result[0]).toEqual(expect.objectContaining({
            _id: expect.any(Object),
            studyId: expect.any(Object),
            sessionCode: expect.any(String),
            date: expect.any(Date),
            time: expect.any(String),
            location: expect.any(String),
            participantNum: expect.any(Number),
            participantList: expect.any(Array),
            isArchive: expect.any(Boolean),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date)
        }))
    });

    it ('Check the return value of createSession function', async () => {
        const newSession = {
            studyId: mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6a3"),
            sessionCode: 'SE4599',
            date: new Date("2023-10-05"),
            time: "11:30",
            location: "Conference Room A",
            participantNum: 20,
            participantList: [
                mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b3"),
                mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b4"),
                mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b5")
            ],
            isArchive: false 
        }
        
        const result = await SessionDao.createSession(newSession);
        expect(result).toBeDefined();

        const fromDb = await mongoose.connection.db.collection('Session').findOne({ _id: result._id });
        expect(fromDb.studyId).toEqual(mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6a3"));
        expect(fromDb.sessionCode).toBe('SE4599');
        expect(fromDb.date.toISOString().split('T')[0]).toEqual('2023-10-05');
        expect(fromDb.time).toBe('11:30');
        expect(fromDb.location).toBe('Conference Room A');
        expect(fromDb.participantNum).toBe(20);
        expect(fromDb.participantList.length).toBe(3);
        expect(fromDb.isArchive).toBe(false);
    });

    it ('Check the return value of updateSession function', async () => {
        
        const updatedSession = {
            _id: mongoose.Types.ObjectId('000000000000000000000003'),
            studyId: mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6a3"),
            sessionCode: 'SE4599',
            date: new Date("2023-11-05"),
            time: "15:30",
            location: "Room 312",
            participantNum: 15,
            participantList: [
                mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b3"),
                mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b4"),
                mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b5"),
                mongoose.Types.ObjectId("615aef8f1d8e5a001f8e6b11")
            ],
            isArchive: false 
        }
        
        const result = await SessionDao.updateSession(updatedSession._id, updatedSession);
        expect(result).toBeDefined();

        const fromDb = await mongoose.connection.db.collection('Session').findOne({ _id: updatedSession._id});
        expect(fromDb.studyId).toEqual(mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6a3"));
        expect(fromDb.sessionCode).toBe('SE4599');
        expect(fromDb.date.toISOString().split('T')[0]).toEqual('2023-11-05');
        expect(fromDb.time).toBe('15:30');
        expect(fromDb.location).toBe('Room 312');
        expect(fromDb.participantNum).toBe(15);
        expect(fromDb.participantList.length).toBe(4);
        expect(fromDb.isArchive).toBe(false);
    });


});

/*
const participant_1 = {
    _id: mongoose.Types.ObjectId('615cdd2f3d4f7e0016b4a6b1'),
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phoneNum: '012-345-8974'
};

const participant_2 = {
    _id: mongoose.Types.ObjectId('615cdd2f3d4f7e0016b4a6b2'),
    firstName: 'David',
    lastName: 'Lee',
    email: 'david@example.com',
    phoneNum: '012-321-8974'
};

const participant_3 = {
    _id: mongoose.Types.ObjectId('615cdd2f3d4f7e0016b4a6b3'),
    firstName: 'Alice',
    lastName: 'Wang',
    email: 'alice@example.com',
    phoneNum: '012-345-3374'
};

const participant_4 = {
    _id: mongoose.Types.ObjectId('615cdd2f3d4f7e0016b4a6b4'),
    firstName: 'Chris',
    lastName: 'Mee',
    email: 'chris@example.com',
    phoneNum: '012-345-8983'
};

//const participants = [participant_1, participant_2, participant_3, participant_4]
*/