import React from 'react';

const Loader = ({ size = 16 }: { size?: number }) => {
  return (
    <span className="inline-flex items-center justify-center">
      <span
        className="loader"
        style={{ width: size, height: size, borderWidth: size / 8 }}
      />
    </span>
  );
};

export default Loader;