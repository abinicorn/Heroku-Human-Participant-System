import { useContext } from "react";
import { CurrentUserContext } from "../providers/CurrentUserProvider";

export const useCurrentUser = () => {

    const { user, getCurrentUser } = useContext(CurrentUserContext);


    return {
        user,
        getCurrentUser
    }
}