import React, { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';

//Reusable button
function ContinueButton({ onClick, disabled, label = 'Continue' }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        backgroundColor: disabled ? '#ccc' : '#ff9933',
        color: 'white',
        padding: '10px 20px',
        fontSize: '16px',
        border: 'none',
        borderRadius: '5px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        marginTop: '20px',
      }}
    >
      {label}
    </button>
  );
}

export default ContinueButton;
