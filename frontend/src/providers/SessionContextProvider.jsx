import * as React from 'react';
import useGet from '../hooks/useGet';
import { useParams } from 'react-router-dom';
import {request} from "../utils/request";


export const SessionContext = React.createContext(undefined);

export default function SessionContextProvider({children}) {
  
    const { studyId } = useParams();
    const {
        data: sessions,
        isLoading: sessionLoading,
        refresh: refreshSession
    } = useGet(`http://localhost:3001/session/list/${studyId}`, [])

    const { data: studyParticipantInfo } = useGet(`http://localhost:3001/study-participants/${studyId}`, []);
    
    async function addSession (newSession) {
        const sessionResponse = await request.post(`http://localhost:3001/session/${studyId}`, newSession)
        refreshSession();
        return sessionResponse.data
    }

    async function updateSession (updateData) {
        
        const sessionId = updateData._id
        const response = await request.put(`http://localhost:3001/session/${sessionId}`, updateData)
        console.log(response)
        refreshSession();
        return response.data
    }

    const context = {
        studyId,
        sessions,
        sessionLoading,
        studyParticipantInfo,
        addSession,
        updateSession,
        refreshSession
    }

    return (
        <SessionContext.Provider value={context}>
            {children}
        </SessionContext.Provider>
    )

}
