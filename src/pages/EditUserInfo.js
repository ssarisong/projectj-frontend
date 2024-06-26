import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { UPDATE_USER_MUTATION } from './gql/UpdateUserGql';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/EditUserInfo.css';

export const WHO_AM_I_QUERY = gql`
  query{
    whoAmI{
      id
      email
      name
      birth_at
      mbti
    }
  }
`;

export default function EditUserInfo() {
  const navigate = useNavigate();
  const [yearOptions, setYearOptions] = useState([]);
  const [monthOptions, setMonthOptions] = useState([]);
  const [dayOptions, setDayOptions] = useState([]);
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    mbti: "",
    birthYear: "",
    birthMonth: "",
    birthDay: ""
  });

  const getToken = () => {
    return localStorage.getItem('token') || ''; // 토큰이 없을 경우 빈 문자열 반환
  };

  const { loading: loadingWhoAmI, error: errorWhoAmI, data: dataWhoAmI } = useQuery(WHO_AM_I_QUERY, {
    context: {
      headers: {
        authorization: `Bearer ${getToken()}`
      }
    },
  });

  const [updateUser] = useMutation(UPDATE_USER_MUTATION);

  useEffect(() => {
    if (dataWhoAmI && dataWhoAmI.whoAmI) {
      const { whoAmI } = dataWhoAmI;
      const birthDate = new Date(whoAmI.birth_at);

      setUser({
        username: whoAmI.name,
        email: whoAmI.email,
        password: "",
        confirmPassword: "",
        mbti: whoAmI.mbti,
        birthYear: birthDate.getFullYear().toString(),
        birthMonth: new Date(whoAmI.birth_at).getMonth() + 1 < 10 ? (new Date(whoAmI.birth_at).getMonth() + 1).toString() : ('0' + (birthDate.getMonth() + 1)).slice(-2).toString(),
        birthDay: new Date(whoAmI.birth_at).getDate() < 10 ? new Date(whoAmI.birth_at).getDate().toString() : ('0' + new Date(whoAmI.birth_at).getDate()).slice(-2).toString()
      });
    }
    setYearOptions(generateOptions(1970, 2024)); // 생년월일 옵션 설정
    setMonthOptions(generateOptions(1, 12));
    setDayOptions(generateOptions(1, 31));
  }, [dataWhoAmI]);

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!user.password || !user.confirmPassword) {
      alert('비밀번호를 입력하세요');
      return;
    }
    if (user.password !== user.confirmPassword) {
      alert('비밀번호를 확인하세요');
      return;
    }
  
    try {
      let profileImageUrl = null;
  
      if (user.profileImage) {
        // 먼저 프로필 이미지를 업로드합니다.
        const formData = new FormData();
        formData.append('operations', JSON.stringify({
          query: `
            mutation updateUser($input: UpdateUserInput!) {
              updateUser(updateUserInput: $input) {
                id
                profile_image {
                  imagePath
                }
                email
                name
                gender
                birth_at
                mbti
                phone_number
              }
            }
          `,
          variables: {
            input: {
              email: user.email,
              name: user.username,
              birth_year: user.birthYear,
              birth_month: user.birthMonth,
              birth_day: user.birthDay,
              mbti: user.mbti,
              password: user.password
            }
          }
        }));
        formData.append('map', JSON.stringify({ '0': ['variables.input.profile_image'] }));
        formData.append('0', user.profileImage);
  
        const uploadResponse = await axios.post('http://54.180.182.40:5000/graphql', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${getToken()}`
          }
        });
  
        // 업로드된 이미지의 URL을 가져옵니다.
        profileImageUrl = uploadResponse.data.data.updateUser.profile_image.imagePath; // 서버가 업로드된 이미지의 URL을 반환하는 것으로 가정합니다.
      }
  
      // 이제 프로필 이미지 URL을 포함하여 사용자 정보를 업데이트합니다.
      const updateUserResponse = await updateUser({
        variables: {
          updateUserInput: {
            email: user.email,
            name: user.username,
            birth_year: user.birthYear,
            birth_month: user.birthMonth,
            birth_day: user.birthDay,
            mbti: user.mbti,
            password: user.password,
            profile_image: profileImageUrl // 여기에 프로필 이미지 URL을 전달합니다.
          }
        },
        context: {
          headers: {
            authorization: `Bearer ${getToken()}`
          }
        }
      });
  
      console.log('updateUserResponse:', updateUserResponse.data);
  
      navigate('/mypage');
    } catch (error) {
      console.error('사용자 정보를 업데이트하는 중 오류 발생:', error);
      navigate('/mypage');
      if (error.response && error.response.data) {
        console.error('서버 오류 메시지:', error.response.data.errors);
      }
    }
  };
  
  const handleProfileImageChange = (event) => {
    const file = event.target.files[0];
    setUser({ ...user, profileImage: file });
  };

  const generateOptions = (start, end) => {
    const options = [];
    for (let i = start; i <= end; i++) {
      options.push(<option key={i} value={i}>{i}</option>);
    }
    return options;
  };

  return (
    <div className="edit-user-info-container">
      <h2 className="edit-user-info-title">내 정보 수정</h2>
      <form className="edit-user-info-form" onSubmit={handleEditSubmit}>
        <div className="edit-group">
          <div className="edit-name">
            <label htmlFor="username">이름</label>
            <input type="edit-text" id="username" name="username" value={user.username} onChange={(e) => setUser({ ...user, username: e.target.value })} />
          </div>
          <div className="edit-id">
            <label htmlFor="email">이메일</label>
            <input type="edit-text" id="email" name="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
          </div>
          <div className="edit-password">
            <label htmlFor="password">비밀번호</label>
            <input type="password" id="password" name="password" value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} />
          </div>
          <div className="edit-password">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input type="password" id="confirmPassword" name="confirmPassword" value={user.confirmPassword} onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })} />
          </div>
          <div className="edit-mbti">
            <label htmlFor="mbti">MBTI</label>
            <select id="mbti" value={user.mbti} onChange={(e) => setUser({ ...user, mbti: e.target.value })}>
              <option value="">MBTI 선택</option>
              <option value="ISTJ">ISTJ</option>
              <option value="ISFJ">ISFJ</option>
              <option value="INFJ">INFJ</option>
              <option value="INTJ">INTJ</option>
              <option value="ISTP">ISTP</option>
              <option value="ISFP">ISFP</option>
              <option value="INFP">INFP</option>
              <option value="INTP">INTP</option>
              <option value="ESTP">ESTP</option>
              <option value="ESFP">ESFP</option>
              <option value="ENFP">ENFP</option>
              <option value="ENTP">ENTP</option>
              <option value="ESTJ">ESTJ</option>
              <option value="ESFJ">ESFJ</option>
              <option value="ENFJ">ENFJ</option>
              <option value="ENTJ">ENTJ</option>
            </select>
          </div>
          <div className="edit-birth">
            <label htmlFor="birth">생년월일</label>
            <div className="birth-inputs">
              <select id="birthYear" value={user.birthYear} onChange={(e) => setUser({ ...user, birthYear: e.target.value })}>
                <option value="">연도</option>
                {yearOptions}
              </select>
              <select id="birthMonth" value={user.birthMonth} onChange={(e) => setUser({ ...user, birthMonth: e.target.value })}>
                <option value="">월</option>
                {monthOptions}
              </select>
              <select id="birthDay" value={user.birthDay} onChange={(e) => setUser({ ...user, birthDay: e.target.value })}>
                <option value="">일</option>
                {dayOptions}
              </select>
            </div>
          </div>
          <div className="edit-image">
            <label htmlFor="profileImage">프로필 사진</label>
            <input type="file" id="profileImage" name="profileImage" accept="image/*" onChange={handleProfileImageChange} />
          </div>
          <button type="submit" className="edit-submit">수정하기</button>
        </div>
      </form>
    </div>
  );
}