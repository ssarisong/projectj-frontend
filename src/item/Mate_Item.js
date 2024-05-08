import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Mate_Item.css';

export default function Mate_Item({ user }) {
    const navigate = useNavigate();

    if (!user) {
        return <p>Loading user data...</p>;
    }

    const userName = user.name ? user.name : 'Unknown User';
    const birthYear = user.birth_at ? new Date(user.birth_at).getFullYear() : 'Unknown Year';
    const currentYear = new Date().getFullYear();
    const userAge = user.birth_at ? `${currentYear - birthYear} 세` : 'Age unknown';

    const handleSendMessage = () => {
        const isLoggedIn = true; 
        if (isLoggedIn) {
            navigate('../Message');
        } else {
            navigate('../pages/Before/Login');
            
        }
    };

    return (
        <div className='mi-container'>
            <div className='mi-photo'> 
                <img className="user-image" src="/user.jpeg" alt="user"/>
            </div>
            <div className='mi-name'>
                <h4>{userName}</h4>
            </div>
            <div className='mi-age'>
                <h4>{userAge}</h4>
            </div>
            <div className='mi-button'>
                <button onClick={handleSendMessage}>쪽지보내기</button>
            </div>
        </div>
    );
}
