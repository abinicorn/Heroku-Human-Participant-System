import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditStudyTemplate from '../components/Study/EditStudyTemplate';
import { useCurrentUser } from '../hooks/useCurrentUser';
import {request} from "../utils/request";

export default function CreateStudyPage() {

    const navigate = useNavigate("/");
    const {user}= useCurrentUser();
    console.log ("user", user);



    // const researcherId = '64fe98fdae1ff28bdcd455a7';

    const researcherId = user.userId;

    const [studyData, setStudyData] = useState({
        studyCode: '',
        studyName: '',
        description: '',
        creator: researcherId,
        researcherList: [researcherId],
        studyType: '',
        participantNum: '',
        recruitmentStartDate: '',
        recruitmentCloseDate: '',
        location: [],
        surveyLink: '',
        driveLink: ''
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        setStudyData({
            ...studyData,
            creator: researcherId
        });
        createStudy(studyData)
            .then((res) => {
                navigate(`../${res.study._id}`);
            })
            .catch((error) => {
                console.log('Error creating study', error);
            })
        alert('Study saved successfully!');
    };

    const createStudy = async (studyData) => {

        try {
            const response = await request.post(`/study/${researcherId}`, studyData);
            return response.data;
        } catch (error) {
            console.error('Error creating study:', error);
            throw error;
        }
    };

    return (
        <EditStudyTemplate
            isEditMode={false}
            studyData={studyData}
            setStudyData={setStudyData}
            handleSubmit={handleSubmit}
        />
    );


}