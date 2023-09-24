import React, { useState, useEffect } from "react";
import { createContext } from 'react';
import {LoadingIndicator} from "../components/Common/LoadingIndicator";

import { tokenService, TokenType } from "../services/tokenService";
import {useNavigate} from "react-router-dom";
import {request} from "../utils/request";


export const CurrentUserContext = createContext({
    user: null,
    getCurrentUser: async () => {},
});

export function CurrentUserContextProvider ({ children })  {

    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);

    const getCurrentUser =  async (userId) => {

        const userInfo = await fetchUserInfo(userId);
        setCurrentUser(userInfo);
    };

    const fetchUserInfo = async (token, userId) => {
        try {

            const response = await request.get(`http://localhost:3001/researcher/info/${userId}`);


            const firstName = response.data.result.firstName;
            const lastName = response.data.result.lastName;
            const email = response.data.result.email;
            const studyList = response.data.result.studyList;


            const userInfo = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                studyList: studyList,
                userId: userId
            };

            return userInfo;



        } catch (error) {
            console.error("Error fetching user info:", error);
        }
    };

    useEffect(() => {
        (async () => {
            const userInfo = await fetchUserInfo(tokenService.getToken(TokenType.ACCESS_TOKEN)
                , tokenService.getToken(TokenType.CURRENT_USERID));
            await setCurrentUser(userInfo);

        })();
    }, [navigate]);

    useEffect(() => {

    }, [currentUser]);



    return (
        <CurrentUserContext.Provider
            value={{
                user: currentUser,
                getCurrentUser,
            }}
        >
            {currentUser ? children : <LoadingIndicator />}
        </CurrentUserContext.Provider>
    );
};