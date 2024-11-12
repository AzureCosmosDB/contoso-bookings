import React, {useState} from 'react';
import Chat from './Chat';
import Map from './Map';
import LocationModal from './LocationPromptModal';
import './App.css';
import './App.css';

const App: React.FC = () => {
  const [coordinates, setUserCoordinates] = useState<{ lat: number; lng: number }>();
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleLocationSubmit = async (location: string) => {
    try {
      const response = await fetch('http://localhost:8000/get_location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location }),
      });

      console.log(location);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const newCoordinates = {
        lat: data.location.coordinates[1],
        lng: data.location.coordinates[0],
      };

      setUserCoordinates(newCoordinates);
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  return (
    <div className="App">
      <Map 
        user_coordinates={coordinates || { lat: 0, lng: 0 }} 
        search_coordinates={[]} 
      />
      {/* <Chat setUserCoordinates={setUserCoordinates} /> */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleLocationSubmit}
      />
    </div>
  );
};

export default App;