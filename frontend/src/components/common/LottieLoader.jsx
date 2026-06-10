import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../../assets/loading-animation.json';

const LottieLoader = ({ size = 80, className = "" }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Lottie 
        animationData={animationData} 
        loop={true} 
        style={{ width: size, height: size }} 
      />
    </div>
  );
};

export default LottieLoader;
