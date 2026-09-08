// CalendarWrapper.js
import React from 'react';

const CalendarWrapper = ({ isOpen, children }) => {
  return (
    <div className={`calendar-wrapper ${isOpen ? 'open' : ''}`}>
      {children}
    </div>
  );
};

export default CalendarWrapper;
