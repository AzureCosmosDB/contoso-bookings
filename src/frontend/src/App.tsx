import React from 'react';
import Chat from './Chat';
import Map from './Map';
import './App.css';


const App: React.FC = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Map />
      <Chat />
    </div>
  );
};

export default App;