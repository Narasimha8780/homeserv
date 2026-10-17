import React from 'react';
import houseSymbol from '../../assets/brand/home-symbol.png';

// Horizontal lockup for the customer dashboard. Existing launcher/service assets
// remain unchanged; the house reuses the approved Android source artwork.
export const HomeBrand: React.FC = () => (
  <span className="home-brand">
    <img src={houseSymbol} alt="" className="home-brand-mark" />
    <span className="home-brand-copy">
      <span className="home-brand-name">Home<span>Serv</span></span>
      <span className="home-brand-tagline">All Home Services. One App.</span>
    </span>
  </span>
);
