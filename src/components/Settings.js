import React from 'react';

function Settings({ populationSize, setPopulationSize }) {
  const handleChange = (e) => {
    setPopulationSize(Number(e.target.value));
  };

  return (
    <div className="settings">
      <label>
        Количество машин в популяции:
        <input
          type="number"
          value={populationSize}
          onChange={handleChange}
          min="1"
          max="1000"
        />
      </label>
    </div>
  );
}

export default Settings;