// src/App.js
import React, { useState } from 'react';
import Controls from './components/Controls';
import Simulation from './components/Simulation';
import './App.css';

function App() {
  const [populationSize, setPopulationSize] = useState(20);
  const [mutationRate, setMutationRate] = useState(0.1);
  const [isRunning, setIsRunning] = useState(false);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  return (
    <div className="App">
      <h1>Симуляция Гонок с Генетическим Алгоритмом</h1>
      <Controls
        onStart={handleStart}
        onPause={handlePause}
        populationSize={populationSize}
        setPopulationSize={setPopulationSize}
        mutationRate={mutationRate}
        setMutationRate={setMutationRate}
      />
      <Simulation
        populationSize={populationSize}
        mutationRate={mutationRate}
        isRunning={isRunning}
      />
    </div>
  );
}

export default App;