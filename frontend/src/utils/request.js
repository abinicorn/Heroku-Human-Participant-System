import axios from "axios";
import {tokenService, TokenType} from "../services/tokenService";

export const request = axios.create({
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});



request.interceptors.request.use(
    (config) => {
        const accessToken = tokenService.getToken(TokenType.ACCESS_TOKEN);

        if (config.headers) {
            config.headers["Authorization"] = accessToken;
        } else {
            config = {
                ...config,
                headers: {
                    Authorization: accessToken,
                },
            };
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// request.interceptors.response.use(
//     (response) => {
//         return response;
//     },
//     async (error) => {
//         const originalRequest = error.config;
//
//         if (error.response.status === 401 && !originalRequest._retry) {
//             originalRequest._retry = true;
//             try {
//                 await authService.refreshToken();
//             } catch (_) {
//                 tokenService.clearAllTokens();
//                 window.location.href = ScreenPath.Login;
//                 return;
//             }
//
//             return request(originalRequest);
//         }
//
//         return Promise.reject(error.response.data);
//     }
// );
