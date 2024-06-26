import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import MateFilterModal from '../../components/MateFilterModal.js';
import Mate_Item from '../../item/Mate_Item.js';
import './Mate.css';

// 모든 유저 정보 가져오기
const FETCH_ALL_USERS = gql`
  query {
    fetchUsers {
      id
      name
      gender
      birth_at
      mbti
      is_find_mate
      create_at
      profile_image{
        imagePath
      }
      dong {
        id
        name
      }
    }
  }
`;

const FETCH_ALL_SGNG = gql`
  query FetchAllSgng {
    fetchAllSgng {
      id
      name
    }
  }
`;

export const WHO_AM_I_QUERY = gql`
  query WhoAmI {
    whoAmI {
      id
      name
      mbti
    }
  }
`;

const PAGE_SIZE = 10; // 한 페이지에 표시할 항목 수

export default function Mate() {
  const navigate = useNavigate();
  const [isFilterVisible, setFilterVisible] = useState(false);  // 필터 기능
  const [filters, setFilters] = useState({
    region: null,
    gender: null,
    age: null,
    mbti: null
  });
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const { data, loading, error } = useQuery(FETCH_ALL_USERS);  // gql
  const { data: sgngData, loading: sgngLoading, error: sgngError } = useQuery(FETCH_ALL_SGNG);  // gql
  const token = localStorage.getItem('token');

  const { loading: loadingWhoAmI, error: errorWhoAmI, data: dataWhoAmI } = useQuery(WHO_AM_I_QUERY, {
    context: {
      headers: {
        authorization: `Bearer ${token || ''}`
      }
    },
  });


  // 필터 클릭 리스너
  const handleFilterClick = () => {
    setFilterVisible(prev => !prev);
  };

  // 필터에서 확인 버튼 클릭 리스너
  const handleConfirmButtonClick = (selectedFilters) => {
    setFilters(selectedFilters);
    setCurrentPage(1); // 필터가 변경되면 첫 페이지로 이동
    setFilterVisible(false);
  };

  if (loading || loadingWhoAmI) return <p>Loading...</p>;
  if (error || errorWhoAmI) return <p>Error: {error?.message || errorWhoAmI?.message}</p>;

  const whoAmI = dataWhoAmI?.whoAmI;
  
  // 사용자 필터링 함수
  const filteredUsers = data.fetchUsers.filter(user => {
    // 지역 필터링
    if (filters.region) {
      const regionId = sgngData.fetchAllSgng.find(region => region.name === filters.region)?.id;
      const userSgngId = user.dong.id.substring(0, 5); // 사용자의 동 id의 앞 다섯 자리 추출
      if (regionId !== userSgngId) return false;
    }
    // 성별 필터링
    if (filters.gender) {
      const genderValue = filters.gender === '남성' ? 'male' : 'female';
      if (user.gender !== genderValue) return false;
    }
    // 나이 필터링
    if (filters.age) {
      const age = new Date().getFullYear() - new Date(user.birth_at).getFullYear();
      switch (filters.age) {
        case '10대':
          if (age >= 20) return false;
          break;
        case '20대':
          if (age < 20 || age >= 30) return false;
          break;
        case '30대':
          if (age < 30 || age >= 40) return false;
          break;
        case '40대':
          if (age < 40 || age >= 50) return false;
          break;
        case '50대 이상':
          if (age < 50) return false;
          break;
        default:
          break;
      }
    }
    // MBTI 필터링
    if (filters.mbti && user.mbti !== filters.mbti) return false;

    return true;
  });

  // 페이지네이션을 위한 데이터 슬라이싱
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // 본인 제외 MBTI 같은 사용자만 추천 메이트에 넣기
  const recommendedUsers = data.fetchUsers
    .filter(user => user.mbti === whoAmI.mbti && user.id !== whoAmI.id)
    .slice(0, 5);

  return (
    <div className={`Mate-container ${isFilterVisible ? 'filter-open' : ''}`}>
      <div className='cook-ai-header'>
        <img src="/assets/mate/mate2.png" alt="mate" style={{ width: '50px', height: '50px', marginRight: '10px', marginBottom: '5px' }} />
        <h2>{whoAmI.name}님, 추천 메이트 </h2>
      </div>
      <div className='Mate-recommend'>
        {recommendedUsers.map((user) => (
          <Mate_Item key={user.id} user={user} />
        ))}
      </div>

      <div className='Mate-main'>
        <div className='Mate-filter'>
          <button onClick={handleFilterClick}>
            <img src='/assets/mate/filter.png' alt='filter' />
          </button>
          <h4>나와 맞는 메이트를 찾아보세요</h4>
          {isFilterVisible && <MateFilterModal onClose={handleConfirmButtonClick} />}
        </div>
        <div className='Mate-list'>
          <div className='Mate-items'>
            {paginatedUsers.map((user) => (
              <Mate_Item key={user.id} user={user} />
            ))}
          </div>
          {/* 페이지네이션 */}
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{marginRight:'10px'}}
            >
              이전
            </button>
            <span>{currentPage}</span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={endIndex >= filteredUsers.length}
              style={{marginLeft:'10px'}}
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
