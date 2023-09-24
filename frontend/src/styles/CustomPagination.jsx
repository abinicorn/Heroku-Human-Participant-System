import React, { useState } from 'react';
import { useGridApiContext, useGridSelector, gridPageCountSelector, GridPagination } from '@mui/x-data-grid';
import MuiPagination from '@mui/material/Pagination';

function Pagination(props) {
    const apiRef = useGridApiContext();
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  
    const [pageInput, setPageInput] = useState('');  // 用于存储用户输入的页码
  
    const handlePageInputChange = (e) => {
      setPageInput(e.target.value);
    };
  
    const handleGoButtonClick = () => {
      const pageNum = parseInt(pageInput, 10);
      if (pageNum >= 1 && pageNum <= pageCount) {
        props.onPageChange(null, pageNum - 1);
      } else {
        alert('Invalid page number');
      }
    };
  
    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '400px'}}>
        <MuiPagination
          color="primary"
          className={props.className}
          count={pageCount}
          siblingCount={2}
          // boundaryCount={3}
          page={props.page + 1}
          onChange={(event, newPage) => {
            props.onPageChange(event, newPage - 1);
          }}
        />
        <input
          type="number"
          value={pageInput}
          onChange={handlePageInputChange}
          style={{ marginLeft: '10px', width: '50px' }}
          placeholder="Go to"
        />
        <button onClick={handleGoButtonClick} style={{ marginLeft: '5px' }}>Go</button>
      </div>
    );
  }
  
export function CustomPagination(props) {
    return <GridPagination ActionsComponent={Pagination} {...props} />;
}