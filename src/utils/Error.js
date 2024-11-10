import React from 'react';
import '../assets/Error.css';

const Error = ( {type, message} ) => {
  return (
    <div className = "error-div">
      <h1>{type}</h1>
      <p>{message}</p>
    </div>
  );
}

export default Error;