import {tokenService, TokenType} from "../services/tokenService";
import {useNavigate} from "react-router-dom";
import React, { useEffect, useState } from "react";
import {LoadingIndicator} from "../components/Common/LoadingIndicator";


export const AuthenticationRedirect = ({children}) => {

    const navigate = useNavigate();
    const validatePath = () => {
        return new Promise((resolve) => {

            const pathName = window.location.pathname;

            const accessToken = tokenService.getToken(TokenType.ACCESS_TOKEN);

            if (pathName && pathName.startsWith('/')) {
                if (!accessToken) {
                    navigate('/');
                    return resolve(true);
                }

            }  else {
                if (accessToken) {
                    navigate('/homepage');
                    return resolve(true);
                }
            }

            return resolve(false);

        });

    };


    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setIsLoading(true);

            const willRedirect = await validatePath();

            if (!willRedirect) {
                setIsLoading(false);
            }
        })();
    }, []);

    return isLoading ? <LoadingIndicator /> : children;
}