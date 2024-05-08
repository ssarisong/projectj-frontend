import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import './css/Home.css';
import Mate_Item from '../item/Mate_Item';
import OneRoom_Item from '../item/Oneroom_Item';
import Cooking_Item from '../item/Cooking_Item';
import Community_Hot_Item from '../item/Community_Hot_Item';
import Tip_Item from '../item/Tip_Item';
import Market_Item from '../item/Market_Item';
import { gql } from '@apollo/client';

// Mate_Item
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
    }
  }
`;

// Market_Item
const GET_USED_PRODUCTS = gql`
  query GetUsedProducts {
    fetchUsedProducts {
      id
      title
      price
      detail
    }
  }
`;

export const images = [
  "/mainPhoto_1.webp",
  "/mainPhoto_2.webp",
  "/mainPhoto_3.webp",
  "/mainPhoto_4.webp",
  "/mainPhoto_5.webp",
];

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 쿼리를 사용하여 데이터 가져오기
  const { loading: loadingMates, data: matesData } = useQuery(FETCH_ALL_USERS);
  const { loading: loadingProducts, data: productsData } = useQuery(GET_USED_PRODUCTS);

  useEffect(() => {
    const setScrollableStyle = () => {
      const mateRecommend = document.querySelector('.Mate-recommend');
      if (mateRecommend) {
        mateRecommend.style.whiteSpace = 'nowrap';
      }
    };

    setScrollableStyle();

    // 이미지 슬라이드 3초마다 변경
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [currentImageIndex]);

  if (loadingMates || loadingProducts) {
    return <div>Loading...</div>;
  }

  return (
    <div className='Home-container'>
      <div className='Home-photoList'>
        <img
          className="card-photo"
          src={images[currentImageIndex]}
          alt="로고"
        />
      </div>
      <h4>요리 (추천 레시피 / 인기 급상승 레시피)</h4>
      <div className='Home-section Home-Cook'>
        <Cooking_Item />
      </div>
      <h4>원룸 (추천 원룸 / 원룸 검색창)</h4>
      <div className='Home-section Home-OneRoom'>
        <OneRoom_Item />
      </div>
      <h4>자취메이트</h4>
      <div className="mate-item">
        {matesData?.fetchUsers.map((user) => (
          <Mate_Item key={user.id} user={user} />
        ))}
      </div>
      <h4>중고마켓</h4>
      <div className="market-item">
        {productsData?.fetchUsedProducts.map((product, index) => (
          <Market_Item key={index} product={product} />
        ))}
      </div>

      <h4>커뮤니티(핫 게시물)</h4>
      <div className='Home-section Home-Community'>
        <Community_Hot_Item />
      </div>
      
      <h4>생활꿀팁 (청소편)</h4>
      <div className='Home-section Home-Tip'>
        <Tip_Item />
      </div>
    </div>
  );
};

export default Home;
