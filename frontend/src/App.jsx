import { Routes, Route } from 'react-router-dom';
import './styles/App.css';
import SessionManagePage from './pages/SessionManagePage';
import SessionContextProvider from './providers/SessionContextProvider';
import Login from "./pages/LoginPage";
//import {ResearcherHomePage} from "./components/Researcher/ResearcherHomePage";
import React from "react";
import StudyParticipantsProvider from './providers/StudyPaticipantsProvider'
import ParticipantManagePage from './pages/ParticipantManagePage'
import ResearcherManagePopup from './components/Researcher/ResearcherManagePopup';
import {StudyResearcherContextProvider} from './providers/StudyResearcherContextProvider';
import CreateStudyPage from './pages/CreateStudyPage';
import EditStudyPage from './pages/EditStudyPage';
import { CurrentUserContextProvider } from './providers/CurrentUserProvider';
import ResearcherDashboardPage from './pages/ResearcherDashboardPage';
import ResearcherProfilePage from './pages/ResearcherProfilePage';
import { AuthenticationRedirect } from './utils/AuthenticationRedirect'


function App() {
  // Determine if you're in Edit mode or Create mode
  // If it's Edit mode, provide the existing study data
  // const existingData = isEditMode ? /* Existing study data */ : null;

    return (

        <Routes>
          <Route path='/' element={<Login/>} />

          <Route path="session">
            <Route path=":studyId" element = {
              <SessionContextProvider>
                <StudyResearcherContextProvider>
                  <SessionManagePage/>
                </StudyResearcherContextProvider>
              </SessionContextProvider>} />
          </Route>
          <Route path="/homepage" element={
              <AuthenticationRedirect>
                <CurrentUserContextProvider>
                  <ResearcherDashboardPage/>
                </CurrentUserContextProvider>
              </AuthenticationRedirect>
            }>
          </Route>
          <Route path="researcher/profile" element={<CurrentUserContextProvider><ResearcherProfilePage/></CurrentUserContextProvider>} />
          <Route path="/studyDetail">
            <Route path=":studyId" element={<EditStudyPage/>} />
            <Route path="create" element={<CurrentUserContextProvider><CreateStudyPage/></CurrentUserContextProvider>} />
            <Route path=":studyId/researcher" element={<StudyResearcherContextProvider><ResearcherManagePopup/></StudyResearcherContextProvider>} />
          </Route>
          <Route path="study-participants">
            <Route path=":studyId" element = {<StudyParticipantsProvider><StudyResearcherContextProvider><ParticipantManagePage/></StudyResearcherContextProvider></StudyParticipantsProvider>} />
          </Route>



        </Routes>

  );
}

export default App;
