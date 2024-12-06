import  { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const AuthRedirect = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (token && role) {
            try {
                const decoded = jwtDecode(token);
                const isTokenExpired = decoded.exp * 1000 < Date.now();

                if (isTokenExpired) {
                    localStorage.clear(); 
                    navigate('/');
                } else if (role === 'admin') {
                    navigate('/admin');
                } else if (role === 'user') {
                    navigate('/user');
                }
            } catch (err) {
                console.error('Error decoding token:', err);
                localStorage.clear();
                navigate('/');
            }
        }
    }, [navigate]);

    return children; 
};

export default AuthRedirect;
