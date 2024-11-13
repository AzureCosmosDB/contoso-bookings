import React, {useState} from 'react';
import Chat from './Chat';
import Map from './Map';
import LocationModal from './LocationPromptModal';
import './App.css';

import { provideFluentDesignSystem, fluentCard, fluentButton } from '@fluentui/web-components';
import { provideReactWrapper } from '@microsoft/fast-react-wrapper';
const { wrap } = provideReactWrapper(React, provideFluentDesignSystem());

export const FluentCard = wrap(fluentCard());
export const FluentButton = wrap(fluentButton());

const App: React.FC = () => {
  const [coordinates, setUserCoordinates] = useState<{ lat: number; lng: number }>();
  const [coordinates_collection, setSearchResults] = useState<{ name: String, price:number, similarity_score:number , lat: number; lng: number }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleLocationSubmit = async (location: string) => {
    try {
      const response = await fetch('http://localhost:8000/get_location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city_name: location }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const newCoordinates = {
        lat: data.latitude,
        lng: data.longitude,
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
        search_map_results={coordinates_collection || []} 
      />
      <Chat setSearchResults={setSearchResults} />
      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleLocationSubmit}
      />
    </div>
  );
};

export default App;