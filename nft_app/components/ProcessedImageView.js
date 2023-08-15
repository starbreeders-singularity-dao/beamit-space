// ProcessedImageView.js
import React from 'react';

const ProcessedImageView = ({ processedImage }) => (
  <div>
    <h2>Processed Image</h2>
    <img src={processedImage} alt="Processed" />
  </div>
);

export default ProcessedImageView;