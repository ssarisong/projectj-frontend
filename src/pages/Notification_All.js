import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

// GraphQL 쿼리 정의
const FETCH_MY_NOTIFICATION_MESSAGES = gql`
  query FetchMyNotificationMessages {
    fetchMyNotificationMessages {
      id
      user {
        name
      }
      letter {
        title
        detail
      }
      board {
        title
      }
      reply {
        content
      }
      used_product {
        name
      }
      like {
        user {
          name
        }
        product {
          name
        }
      }
      code
      is_read
      created_at
    }
  }
`;

const Notification_All = () => {
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(FETCH_MY_NOTIFICATION_MESSAGES, {
    context: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // 필요한 경우 토큰 추가
      },
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error('Error fetching notification messages:', error);
    return <p>Error: {error.message}</p>;
  }

  const handleNotificationClick = (notification_id) => {
    navigate('/notification', { state: { notification_id } });
  };

  return (
    <div>
      <h2>My Notifications</h2>
      {data.fetchMyNotificationMessages.map((notification) => (
        <div key={notification.id} onClick={() => handleNotificationClick(notification.id)}>
          <h3>{notification.user.name}</h3>
          <p>{new Date(notification.created_at).toLocaleString()}</p>
          <p>Code: {notification.code}</p>
          {notification.letter && <p>Letter: {notification.letter.title}</p>}
          {notification.board && <p>Board: {notification.board.title}</p>}
          {notification.reply && <p>Reply: {notification.reply.content}</p>}
          {notification.used_product && <p>Used Product: {notification.used_product.name}</p>}
          {notification.like && <p>Liked by: {notification.like.user.name}</p>}
        </div>
      ))}
    </div>
  );
};

export default Notification_All;