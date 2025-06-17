// DropdownButton.js
import React from 'react';

const DropdownButton = ({ onClick, children }) => {
  return (
    <button onClick={onClick} className="dropdown-button">
      {children}
    </button>
  );
};

export default DropdownButton;
