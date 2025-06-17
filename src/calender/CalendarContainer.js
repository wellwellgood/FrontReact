// CalendarContainer.js
import React from 'react';

const CalendarContainer = ({ children }) => {
  return (
    <div className="calendar-container">
      {children}  {/* 자식 컴포넌트를 렌더링 */}
    </div>
  );
};

export default CalendarContainer;
