import { useState } from 'react';
import axios from 'axios';
import {request} from "../utils/request";

const usePost = (url) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const executePost = async (body) => {
        setLoading(true);
        let responseData = null;
        let responseError = null;
        try {
            const response = await request.post(url, body);
            console.log("Response from", url, response);
            setData(response.data);
            responseData = response.data;
        } catch (err) {
            console.error("Error posting to", url, err);
            setError(err);
            responseError = err;
        } finally {
            setLoading(false);
        }
        return { data: responseData, error: responseError };
    };
    

    return { data, error, loading, executePost };
};

export default usePost;