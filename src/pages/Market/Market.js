import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import Market_Item from '../../item/Market_Item.js';
import { HiOutlineBars3 } from "react-icons/hi2";
import { IoSearchOutline } from "react-icons/io5";
import { useQuery, gql } from '@apollo/client';
import "./css/Market.css";

const GET_USED_PRODUCTS = gql`
  query GetUsedProducts {
    fetchUsedProducts {
      id
      title
      price
      detail
      category
      state
      create_at
      user {
        id
        name
      }
    }
  }
`;

export default function Market() {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_USED_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUserName, setLoggedInUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  
    const loggedInUser = localStorage.getItem('loggedInUserName');
    if (loggedInUser) {
      setLoggedInUserName(loggedInUser);
    } else {
      setLoggedInUserName('');
    }
  }, []);
  
  const handlePostButtonClick = () => {
    navigate('/MarketPost', { state: { isLoggedIn } });
  };

  const handleItemClick = (product) => {
    navigate('/MarketDetail', { state: { product, loggedInUserName } });
  };

  const handleCategoryClick = (category) => {
    const selected = category === 'all' ? '전체' : category;
    setSelectedCategory(selected);
  };

  const renderPostButton = () => {
    if (isLoggedIn) {
      return <button className="post-button" onClick={handlePostButtonClick}>상품 등록</button>;
    } else {
      return null;
    }
  };

  // 페이지네이션 로직
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data && data.fetchUsedProducts.filter((product) => 
    selectedCategory === '전체' || product.category === selectedCategory
  ).slice(indexOfFirstItem, indexOfLastItem);

  const pageNumbers = [];
  if (data && data.fetchUsedProducts.length > 0) {
    for (let i = 1; i <= Math.ceil(data.fetchUsedProducts.length / itemsPerPage); i++) {
      pageNumbers.push(i);
    }
  }

  return (
    <div className="market-container">
      <div className="market-header">
        <div
          className="market-category-icon"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <HiOutlineBars3 style={{ fontSize: '40px' }} />
        </div>
        <IoSearchOutline className="market-search-icon" />
        <input
          type="text"
          className="market-search-input"
          placeholder="상품명을 입력하세요."
        />
      </div>
      {isHovered && (
        <div
          className="market-category"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <p onClick={() => handleCategoryClick('전체')}>전체</p>
          <p onClick={() => handleCategoryClick('의류')}>의류</p>
          <p onClick={() => handleCategoryClick('신발')}>신발</p>
          <p onClick={() => handleCategoryClick('전자기기')}>전자기기</p>
          <p onClick={() => handleCategoryClick('가구')}>가구/인테리어</p>
          <p onClick={() => handleCategoryClick('도서')}>도서</p>
        </div>
      )}
      <div className="market-item">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error.message}</p>
        ) : (
          currentItems && currentItems.length > 0 ? (
            currentItems.map((product, index) => (
              <Market_Item key={index} product={product} onClick={() => handleItemClick(product)} />
            ))
          ) : (
            <p className='nodata'>등록된 상품이 없습니다.</p>
          )
        )}
      </div>
      <ul className="pagination">
        {pageNumbers.map(number => (
          <li key={number} onClick={() => setCurrentPage(number)} style={{ cursor: 'pointer' }}>
            {number}
          </li>
        ))}
      </ul>
      <button className='post-button2' onClick={handlePostButtonClick}>상품 등록</button>
    </div>
  );
}