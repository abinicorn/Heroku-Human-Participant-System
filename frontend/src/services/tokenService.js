export  const TokenType = {
    ACCESS_TOKEN: "accessToken",
    REFRESH_TOKEN: "refreshToken",
    CURRENT_USERID: 'userId'
}

export const tokenService = {
    getToken: (tokenType) => {
        return localStorage.getItem(tokenType) ?? null;
    },
    setToken: (tokenType, value) => {
        localStorage.setItem(tokenType, value);
    },
    clearAllTokens: () => {
        localStorage.removeItem(TokenType.ACCESS_TOKEN);
        localStorage.removeItem(TokenType.REFRESH_TOKEN);
        localStorage.removeItem(TokenType.CURRENT_USERID)
    },
};