/*
import Navbar from "../Navbar";
import React from "react";
import { Route, Routes } from "react-router-dom";
import ResearcherDashboardPage from "../../pages/ResearcherDashboardPage";
import ResearcherProfilePage from "../../pages/ResearcherProfilePage";
import {AuthenticationRedirect} from "../../utils/AuthenticationRedirect";
import {CurrentUserContextProvider} from "../../providers/CurrentUserProvider";

const MainSubScreens = () => {


    return (
            <Routes>
                <Route path={""} element={<ResearcherDashboardPage/> } />
                <Route path={"/researcher/profile"} element={<ResearcherProfilePage/>} />

            </Routes>

    );
};

const Main = () => {


    return (
        <CurrentUserContextProvider>
            <>
                <Navbar/>
                <MainSubScreens/>
            </>
        </CurrentUserContextProvider>

    );
};

export const ResearcherHomePage = () => {

    return (
        <AuthenticationRedirect>
            <Main />
        </AuthenticationRedirect>

    );
};
*/