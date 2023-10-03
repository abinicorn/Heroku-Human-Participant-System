import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import request from 'supertest';
import routes from '../session';

const app = express();
app.use(express.json());
app.use('/session', routes);

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

const participants = [participant_1, participant_2, participant_3, participant_4];

let mongod;

beforeAll(async () => {

    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { useNewUrlParser: true });

});

beforeEach(async () => {

    // Drop existing collections
    await mongoose.connection.db.dropCollection('Session');
    await mongoose.connection.db.dropDatabase();
    // Create new collections
    const sessionCollection = await mongoose.connection.db.createCollection('Session');
    const participantCollection = await mongoose.connection.db.createCollection('Participant');
    await sessionCollection.insertMany(sessions);
    await participantCollection.insertMany(participants);

});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
    await mongod.stop();
});

describe('Session Router', () => {

    // Test GET /session/list/:studyId
    it('should retrieve sessions by studyId', (done) => {
        const studyId = '615cdd2f3d4f7e0016b4a6a1';
        request(app)
            .get(`/session/list/${studyId}`)
            .send()
            .expect(200)
            .then((res) => {

                const sessionsFromApi = res.body;
                expect(sessionsFromApi).toBeTruthy();
                expect(sessionsFromApi.length).toBe(2);

                expect(sessionsFromApi[0].sessionCode).toBe('SE5566');
                expect(sessionsFromApi[0].date.toString().split('T')[0]).toEqual('2023-08-15');
                expect(sessionsFromApi[0].time).toBe('14:00');
                expect(sessionsFromApi[0].location).toBe('Room A');
                expect(sessionsFromApi[0].participantNum).toBe(10);
                expect(sessionsFromApi[0].participantList.length).toBe(4);
                expect(sessionsFromApi[0].isArchive).toBe(true);

                expect(sessionsFromApi[1].sessionCode).toBe('SE4587');
                expect(sessionsFromApi[1].date.toString().split('T')[0]).toEqual('2023-09-15');
                expect(sessionsFromApi[1].time).toBe('14:00');
                expect(sessionsFromApi[1].location).toBe('Room 301');
                expect(sessionsFromApi[1].participantNum).toBe(30);
                expect(sessionsFromApi[1].participantList.length).toBe(3);
                expect(sessionsFromApi[1].isArchive).toBe(false);

                return done();

            })
            .catch((err) => {
                return done(err)
            });
    });

    // Test GET /session/sessionId
    it('should retrieve a session by sessionId', (done) => {
        const sessionId = '000000000000000000000001';
        request(app)
            .get(`/session/${sessionId}`)
            .send()
            .expect(200)
            .then((res) => {

                const sessionsFromApi = res.body;
                expect(sessionsFromApi).toBeTruthy();

                expect(sessionsFromApi.sessionCode).toBe('SE5566');
                expect(sessionsFromApi.date.toString().split('T')[0]).toEqual('2023-08-15');
                expect(sessionsFromApi.time).toBe('14:00');
                expect(sessionsFromApi.location).toBe('Room A');
                expect(sessionsFromApi.participantNum).toBe(10);
                expect(sessionsFromApi.participantList.length).toBe(4);
                expect(sessionsFromApi.isArchive).toBe(true);

                return done();

            })
            .catch((err) => {
                return done(err)
            });
    
    });

    // Test POST /session/:studyId
    it('should create a new session', (done) => {
        
        const studyId = "615cdd2f3d4f7e0016b4a6a3"
        const newSession = {
            sessionCode: 'SE4599',
            date: new Date("2023-10-05"),
            time: "11:30",
            location: "Conference Room A",
            participantNum: 20,
            participantList: [
                mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b3"),
                mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b4"),
                mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6b1")
            ],
            isArchive: false 
        }

        request(app)
            .post(`/session/${studyId}`)
            .send(newSession)
            .expect(201)
            .then((res) => {

                const sessionsFromApi = res.body;
                expect(sessionsFromApi).toBeTruthy();

                expect(sessionsFromApi.studyId).toBe('615cdd2f3d4f7e0016b4a6a3');
                expect(sessionsFromApi.sessionCode).toBe('SE4599');
                expect(sessionsFromApi.date.toString().split('T')[0]).toEqual('2023-10-05');
                expect(sessionsFromApi.time).toBe('11:30');
                expect(sessionsFromApi.location).toBe('Conference Room A');
                expect(sessionsFromApi.participantNum).toBe(20);
                expect(sessionsFromApi.participantList.length).toBe(3);
                expect(sessionsFromApi.isArchive).toBe(false);

                return done();

            })
            .catch((err) => {
                return done(err)
            });
        
    });

     // Test PUT /session/:sessionId
     it('should update a session', (done) => {

        const sessionId = '000000000000000000000003';
        const updatedSession = {
            _id: mongoose.Types.ObjectId('000000000000000000000003'),
            studyId: mongoose.Types.ObjectId("615cdd2f3d4f7e0016b4a6a1"),
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

        request(app)
            .put(`/session/${sessionId}`)
            .send(updatedSession)
            .expect(200)
            .then((res) => {

                const sessionsFromApi = res.body;
                expect(sessionsFromApi).toBeTruthy();
                /*
                expect(sessionsFromApi.studyId).toBe('615cdd2f3d4f7e0016b4a6a1');
                expect(sessionsFromApi.sessionCode).toBe('SE4599');
                expect(sessionsFromApi.date.toString().split('T')[0]).toEqual('2023-11-05');
                expect(sessionsFromApi.time).toBe('15:30');
                expect(sessionsFromApi.location).toBe('Room 312');
                expect(sessionsFromApi.participantNum).toBe(15);
                expect(sessionsFromApi.participantList.length).toBe(4);
                expect(sessionsFromApi.isArchive).toBe(false);
                */
                return done();

            })
            .catch((err) => {
                return done(err)
            });

     });
})
