import React from 'react';
import Chat from './Chat';
import Map from './Map';
import './App.css';


const amenities = [
  'WiFi',
  'Air conditioning',
  'Heating',
  'Kitchen',
  'Parking',
  'Pool',
  // Add more amenities as needed
];

const App: React.FC = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Map />
      <Chat amenities={amenities} />
    </div>
  );
};

export default App;