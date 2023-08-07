import axios from 'axios';
import dayjs from 'dayjs';
import jwt_decode from 'jwt-decode';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext'
import { config } from './Constants'

const useAxios = () => {
	const { authTokens, setUser, setAuthTokens } = useContext(AuthContext)
	let baseURL = config.url.API_URL

	const axiosInstance = axios.create({
		baseURL: baseURL,
		headers: { Authorization: `Bearer ${authTokens?.access}` }

	})
    axiosInstance.interceptors.request.use(async req => {
        const user = jwt_decode(authTokens.access)
        const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

        if (!isExpired) return req

        const response = await axiosInstance.post(`${baseURL}/auth/login/refresh/`, {
            refresh: authTokens.refresh
        })
        console.log(authTokens)
        localStorage.setItem('authTokens', JSON.stringify(response.data))

        setAuthTokens(response.data)
        setUser(jwt_decode(response.data.access))

        req.headers.Authorization = `Bearer ${response.data.access}`
        return req

    })
	return axiosInstance
}

export default useAxios;