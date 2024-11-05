import React, {useState} from 'react';
import Chat from './Chat';
import Map from './Map';
import './App.css';


const App: React.FC = () => {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }[]>([]);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Map coordinates={coordinates} />
      <Chat setCoordinates={setCoordinates} />
    </div>
  );
};

export default App;