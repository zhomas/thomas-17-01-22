import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import { useOrderList, Contract } from './hooks/useOrderList';
import './App.css';

function App() {
  const { bids, asks, active, methods } = useOrderList({
    url: 'wss://www.cryptofacilities.com/ws/v1',
  });

  const handleToggleActive = () => {
    const fn = active ? methods.stop : methods.start;
    fn();
  };

  return (
    <div className="App">
      <button onClick={methods.toggleContract}>Toggle Contract</button>
      <button onClick={handleToggleActive}>{active ? 'Stop' : 'Start'}</button>
      <h1>Woohoo</h1>
      <h3>Bid count: {bids.length}</h3>
    </div>
  );
}

export default App;
