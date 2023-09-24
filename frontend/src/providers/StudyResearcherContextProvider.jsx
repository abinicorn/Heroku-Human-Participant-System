import * as React from 'react';
import { useParams } from 'react-router-dom';
import useGet from '../hooks/useGet';
import {request} from "../utils/request";


const StudyResearcherContext = React.createContext({
    researcherList: [],
    studyInfo: {}
});

function StudyResearcherContextProvider({pageItemId, children}) {

    // const {studyId} =useParams();


    // Get studyId from route params
    const { studyId: routeStudyId } = useParams();

    // Determine the studyId to use (pageItemId or routeStudyId)
    const studyIdToUse = pageItemId || routeStudyId;

    const { 
        data: studyInfo,
        isLoadig: studyLoading,
        refresh: refreshStudyContext
    } = useGet(`http://localhost:3001/study/${studyIdToUse}`,[]);

    console.log(studyInfo);

    const{
        data: researcherList,
        isLoadig: researcherLoading,
        refresh: refreshResearcherContext
    } = useGet(`http://localhost:3001/study/researcher/list/${studyIdToUse}`,[]);

    console.log(researcherList);

    React.useEffect(() => {
        refreshStudyContext();
    }, [studyIdToUse]);
    

    //to do
    async function addResearcher (newResearcher) { 
        try{
            const researcherResponse = await request.post(`http://localhost:3001/study/addResearcher/${studyIdToUse}`, newResearcher)
            console.log(researcherResponse);
            refreshResearcherContext();
            return researcherResponse.data;
        } catch (error) {
            alert(error.response.data.message || "Error adding researcher");
        }
    }

    async function removeResearcher (studyId, researcherId) {
        try {
            const response = await request.put(`http://localhost:3001/study/removeResearcher/${studyIdToUse}/${researcherId}`);
            refreshResearcherContext();
            return response.data;
        } catch (error) {
            alert(error.response.data.message || "Error removing researcher)");
        }
        }


    async function fetchResearcherbyEmail (email) {


        
        const response = await request.get(`http://localhost:3001/researcher/email/${email}`);
        return response;
    }

    const context={
        studyInfo,
        studyLoading,
        refreshStudyContext,
        researcherList,
        researcherLoading,
        refreshResearcherContext,
        addResearcher,
        removeResearcher,
        fetchResearcherbyEmail
    }

    return (
        <StudyResearcherContext.Provider value={context}>
            {children}
        </StudyResearcherContext.Provider>
    )
}

export {
    StudyResearcherContext,
    StudyResearcherContextProvider
};
