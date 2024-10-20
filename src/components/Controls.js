// src/components/Controls.js
import React from 'react';

function Controls({ onStart, onPause, onReset, populationSize, setPopulationSize, mutationRate, setMutationRate }) {
  return (
    <div className="controls">
      <button onClick={onStart}>Старт</button>
      <button onClick={onPause}>Пауза</button>
      <button onClick={onReset}>Сброс</button>
      
      <div className="slider-group">
        <label>
          Размер популяции: {populationSize}
          <input
            type="range"
            min="10"
            max="1000"
            value={populationSize}
            onChange={(e) => setPopulationSize(Number(e.target.value))}
          />
        </label>
      </div>
      
      <div className="slider-group">
        <label>
          Вероятность мутации: {(mutationRate * 100).toFixed(0)}%
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={mutationRate}
            onChange={(e) => setMutationRate(Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}

export default Controls;