import React, { useState } from 'react';
import { MdMoreVert } from "react-icons/md";
import './css/Comment_Item.css';
import { gql, useMutation, useQuery } from '@apollo/client';

const INCREASE_REPLY_LIKE = gql`
  mutation IncreaseReplyLike($reply_id: String!) {
    increaseReplyLike(reply_id: $reply_id) {
      id
    }
  }
`;

const DECREASE_REPLY_LIKE = gql`
  mutation DecreaseReplyLike($reply_id: String!) {
    decreaseReplyLike(reply_id: $reply_id){
      id
    } 
  }
`;
const DELETE_COMMENT_REPLY = gql`
  mutation DeleteCommentReply($commentReplyId: String!) {
    deleteCommentReply(commentReply_id: $commentReplyId) {
        id
        like
        detail
        user {
          id
          name
        }
        like_user {
          id
          user {
            id
            name
          }
        }
    }
  }
`;

export const WHO_AM_I_QUERY = gql`
  query WhoAmI {
    whoAmI {
      id
      name
    }
  }
`;

export default function CommentToComment_Item({CommentToComent, onDeleteSuccess,likedCTC }) {
  const { loading: whoAmILoading, error: whoAmIError, data: whoAmIData } = useQuery(WHO_AM_I_QUERY);
  const whoAmI = whoAmIData?.whoAmI;
  const [liked, setLiked] = useState(likedCTC);
  const [likeCount, setLikeCount] = useState(CommentToComent.like);

  const [increaseReplyLike] = useMutation(INCREASE_REPLY_LIKE, {
    context: {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')}`
      }
    },
    onCompleted: (data) => {
      setLikeCount((prev) => prev + 1);
      setLiked(true);
    },
    onError: (error) => {
      alert('댓글 좋아요 중 오류가 발생했습니다.'+error);
      console.log(CommentToComent);
      console.log(JSON.stringify(error, null, 2))
    }
  });

  const [decreaseReplyLike] = useMutation(DECREASE_REPLY_LIKE, {
    onCompleted: () => {
      setLikeCount((prev) => prev - 1);
      setLiked(false);
    },
    onError: (error) => {
      console.error('대댓글 삭제 중 오류 발생:', error);
      alert('대댓글 삭제 중 오류가 발생했습니다: ' + error.message);
      console.log(JSON.stringify(error, null, 2))
    }
  });

  const [deleteCommentReply, { loading, error }] = useMutation(DELETE_COMMENT_REPLY, {
    onCompleted: (data) => {
      console.log('대댓글 삭제 성공:', data);
      if (onDeleteSuccess) {
        onDeleteSuccess(CommentToComent.id);
      }
    },
    onError: (error) => {
      console.error('대댓글 삭제 중 오류 발생:', error);
      alert('대댓글 삭제 중 오류가 발생했습니다: ' + error.message);
      console.log(JSON.stringify(error, null, 2))
    }
  });

  const handleDelete = () => {
    deleteCommentReply({ variables: { commentReplyId: CommentToComent.id } });
  };

  const handleLikeClick = () => {
    if (liked) {
      decreaseReplyLike({ variables: { reply_id: CommentToComent.id } });
    } else {
      increaseReplyLike({ variables: { reply_id: CommentToComent.id } });
    }
  };

  return (
    <div className='commentTocomment-container0'>
      <div className='commentTocomment-container1'> {/* 사진, 이름, 삭제 */}
        <div className='comment-photo'>
          {CommentToComent.user.profile_image && CommentToComent.user.profile_image.imagePath ? (
          <img className="comment-photo" src={CommentToComent.user.profile_image.imagePath} alt={CommentToComent.user.name} />
        ) : (
          <img className="comment-photo" src="assets/mate/user.jpeg" alt="user" />
        )}
        </div>
        <div className='commentTocomment-name'>
          <p>{CommentToComent.user.name}</p>
        </div>
        {whoAmI && whoAmI.id === CommentToComent.user.id && (
          <div className='commentTocomment-delete'>
            <button onClick={handleDelete}>삭제</button>
          </div>
        )}
      </div>

      <div className='commentTocomment-container2'> {/* 내용, 좋아요 */}
        <div className='commentTocomment-detail'>
          {CommentToComent.detail}
        </div>
        <div className='comment-like'>
          <button onClick={handleLikeClick} className='like-button'>
            <img src={liked ? '/assets/community/heartFill.png' : '/assets/community/heartEmpty.png'} alt='like' />
          </button>
          <h6>{likeCount}</h6>
        </div>
      </div>
    </div>
  );
}
