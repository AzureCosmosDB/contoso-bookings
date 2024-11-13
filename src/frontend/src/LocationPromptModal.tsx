import React, { useState } from 'react';
import './LocationPromptModal.css';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (location: string) => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [location, setLocation] = useState('');

  const handleSubmit = () => {
    onSubmit(location);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h1>Welcome to Contoso Bookings!</h1>
        {/* <h2>Enter Your Location</h2> */}
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter your location (City, State)"
        />
        <br />
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default LocationModal;