import { useState, useEffect, createContext} from 'react';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';
import axios from 'axios';
import { config } from "../utils/Constants";
import { useTranslation } from 'react-i18next';

const AuthContext = createContext()
export default AuthContext;


export const AuthProvider = ({children}) => {
    let baseURL = config.url.API_URL
    let [authTokens, setAuthTokens] = useState(()=> localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null)
    let [user, setUser] = useState(()=> localStorage.getItem('authTokens') ? jwt_decode(localStorage.getItem('authTokens')) : null)
    let [loading, setLoading] = useState(true)
    const navigate = useNavigate() 
    const {t} = useTranslation()

    
    let createUser = async (e) => {
        let response = await axios.post(`${baseURL}/auth/register/`, {
            'first_name': e.firstName, 'last_name': e.lastName, 'username': '','email': e.email, 'password': e.password, 'password2': e.confirmPassword
        })
        if (response.status === 200) {
            swal(t('success'), t('email_verification_sent'), "success")
            navigate('/login')
        } else {
            swal(t('error'), response.data, "error")
        }
    }

    let loginUser = async (e )=> {
        e.preventDefault()
        let response = await axios.post(`${baseURL}/auth/login/`, {
            'email':e.target.email.value,
            'password':e.target.password.value
        })
        let data = await response.data

        if (response.status === 200) {
            
            setAuthTokens(data)
            setUser(jwt_decode(data.access))
            localStorage.setItem('authTokens', JSON.stringify(data))
            navigate('/home')
            window.location.reload(false);
            
        } else if (response.status !== 200) {
            swal(t('error'), response.data, 'error')
        } else {
        swal(t('error'), t('unknown_error_occurred'), 'error')
      }
    }

    let logoutUser = () => {
        setAuthTokens(null)
        setUser(null)
        localStorage.removeItem('authTokens')
        navigate('/login')
    }
    
    let resetPassword = async (e )=> {
        e.preventDefault()
        let response = await axios.post(`${baseURL}/auth/reset-password/`, {
            'email':e.target.email.value,
        })
        if(response.status === 200){
            swal('Success', t('email_verification_sent'), 'success')
            navigate('/login')
        } else {
            swal(t('error'), t('unknown_error_occurred'), 'error')
        }
    }

    let contextData = {
        user: user,
        setUser: setUser,
        authTokens:authTokens,
        setAuthTokens:setAuthTokens,
        createUser:createUser,
        loginUser:loginUser,
        logoutUser:logoutUser,
        resetPassword:resetPassword,
    }


    
    useEffect (()=> {

        if(authTokens) {
            setUser(jwt_decode(authTokens.access))
        }
        setLoading(false)
    }, [authTokens, loading])


    return(
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    )
}