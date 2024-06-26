import React, { useState, useEffect } from 'react';
import './css/Community.css';
import { useQuery, useMutation } from '@apollo/client'; 
import { gql } from '@apollo/client';
import { useNavigate, useLocation } from 'react-router-dom';
import Community_Item from '../../item/Community_Item';
import Comment_Item from '../../item/Comment_Item';
import { WHO_AM_I_QUERY } from '../../item/Community_Item';
// Community 구성은 크게 Community_Item, Comment_Item, 댓글 작성 총 3가지입니다. 
// 컴포넌트도 다른 페이지로 데이터 넘기듯이 (board) 괄호 안에 데이터 이름 넣어주고, 
// 컴포넌트 괄호에도 (board) 이렇게 넣어주고 필드이름을 board.name 형태로 바꿔주시면 됩니다. 
// 예시로 Message_Item, Market_Item 등이 있습니다. 

const CREATE_REPLY = gql`
  mutation CreateReply($board_id: String!, $detail: String!) {
    createReply(board_id: $board_id, detail: $detail) {
      id
      detail
      user {
        id
        name
        profile_image {
          imagePath
        }
      }
    }
  }
`;
const FETCH_BOARD_BY_ID = gql`
  query FetchBoardById($board_id: String!) {
    fetchBoardById(board_id: $board_id) {
      id
      user {
        profile_image {
          imagePath
        }
      }
    }
  }
`;


const CommunityDetail =  () => {
  const location = useLocation();
  const [board, setBoard] = useState(location.state?.board);
  const [selectedItem, setSelectedItem] = useState(location.state?.selectedItem);
  const { loading:errorLoading, error:errorWho, data:dataWho } = useQuery(WHO_AM_I_QUERY);
  const [newComment, setNewComment] = useState('');
  const token = localStorage.getItem('token');
  const [createReply] = useMutation(CREATE_REPLY);

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };
  const handleSubmitComment = async () => {
    try {
      const { data } = await createReply({
        variables: {
          board_id: board.id,
          detail: newComment
        }
      });
      console.log('댓글 작성 완료되었습니다.');
      setNewComment('');

      // 새로운 댓글을 게시판에 반영
      console.log(data.createReply);
      const updatedBoard = {
        ...board,
        reply: [...board.reply, data.createReply] // 새로운 댓글을 추가
      };
      setBoard(updatedBoard);
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('댓글을 작성하는 중 오류가 발생했습니다.'+error);
    }
  };
  //삭제된 댓글 바로 반영
  const handleDeleteSuccess = (deletedCommentId) => {
    const updatedBoard = {
      ...board,
      reply: board.reply.filter(comment => comment.id !== deletedCommentId)
    };
    setBoard(updatedBoard);
  };
  if (!board) {
    return <div>게시글을 불러오지 못했습니다.</div>;
  }
  return (
    <div className='communitydetail-container'>
      {/* 게시물 정보 */}
      <Community_Item key={board.id} board={board} selectedItem={selectedItem}  isLiked={location.state?.isLiked} />
     
      {/* 댓글 */}
      <div className='comment-scroll'>
        <div className='comment-container'> 
        {board.reply && board.reply.length > 0 ? (
    board.reply.map((comment) =>{
      console.log(comment)
      const isLiked = comment.like_user && comment.like_user.some(like_user => like_user.user.id === dataWho.whoAmI.id);
      return (
      <Comment_Item key={comment.id} comment={comment} isLiked ={isLiked} onDeleteSuccessToComment={handleDeleteSuccess}/>
             )})
  ) : (
    <p>댓글이 없습니다.</p>
  )}

        </div>
      </div>

      {/* 댓글 작성 */}
      <div className='comment-container4'> 
            <div className='comment-write'>
            <input
            type="comment-text"
            value={newComment}
            onChange={handleCommentChange}
            placeholder="댓글쓰기"
          />
            </div>
            <div className='comment-send'onClick={handleSubmitComment}>
                <p>전송</p>
            </div>
        </div>
    </div>

  );
}

export default CommunityDetail;
