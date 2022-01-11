import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import { useOrderList, Contract } from './hooks/useOrderList';
import './App.css';

function App() {
  const [contract, setContract] = useState<Contract>('PI_XBTUSD');

  const [active, setActive] = useState<boolean>(false);

  const handleToggleContract = () => {
    const next: Contract = contract === 'PI_XBTUSD' ? 'PI_ETHUSD' : 'PI_XBTUSD';
    setContract(next);
  };

  const handleToggleActive = () => {
    setActive(!active);
  };

  useOrderList({ url: 'wss://www.cryptofacilities.com/ws/v1', contract, active });

  return (
    <div className="App">
      <button onClick={handleToggleContract}>Toggle Contract</button>
      <button onClick={handleToggleActive}>{active ? 'Stop' : 'Start'}</button>
      <h1>Woohoo</h1>
    </div>
  );
}

export default App;
