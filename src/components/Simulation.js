// src/components/Simulation.js
import React, { useRef, useEffect, useState } from 'react';
import Track from '../utils/Track';
import GeneticAlgorithm from '../utils/GeneticAlgorithm';

function Simulation({ populationSize, mutationRate, isRunning, resetFlag }) {
  const canvasRef = useRef(null);
  const [ga, setGa] = useState(null);
  const [track, setTrack] = useState(null);
  const [animationId, setAnimationId] = useState(null);
  const [isPlacingObstacle, setIsPlacingObstacle] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const trackWidth = canvas.width;
    const trackHeight = canvas.height;
    const newTrack = new Track(trackWidth, trackHeight);
    const newGa = new GeneticAlgorithm(populationSize, newTrack, mutationRate);
    setTrack(newTrack);
    setGa(newGa);
  }, [populationSize, mutationRate]);

  useEffect(() => {
    if (!ga || !track) return;

    // Если требуется сбросить симуляцию
    if (resetFlag) {
      ga.initializePopulation();
      track.obstacles = []; // Удаляем все препятствия при сбросе
    }

    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Рисуем трассу
      track.draw(ctx);

      // Обновляем и рисуем автомобили
      ga.population.forEach(car => {
        if (!car.isCrashed) {
          car.update(track);
          drawCar(ctx, car);
        }
      });

      // Проверка завершения поколения
      const activeCars = ga.population.filter(car => !car.isCrashed);
      if (activeCars.length === 0) {
        ga.evaluateFitness();
        ga.generateNextGeneration();
        // Перезапускаем позиции автомобилей на трассе
        ga.population.forEach(car => {
          const angle = Math.random() * 2 * Math.PI;
          const radius = (track.outerRadius + track.innerRadius) / 2;
          car.x = track.cx + radius * Math.cos(angle);
          car.y = track.cy + radius * Math.sin(angle);
          car.angle = angle + Math.PI / 2; // Направление вдоль трассы
          car.speed = 2;
          car.isCrashed = false;
          car.fitness = 0;
          car.distanceTravelled = 0;
          car.color = car.getRandomColor(); // Назначаем новый цвет
        });
      }

      // Отображение информации о поколении и лучшем автомобиле
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      ctx.fillText(`Поколение: ${ga.generation}`, 10, 30);

      // Находим самый лучший автомобиль в текущем поколении
      const bestCar = ga.population.reduce((prev, current) => (prev.fitness > current.fitness) ? prev : current, ga.population[0]);
      ctx.fillText(`Лучший фитнес: ${bestCar.fitness.toFixed(2)}`, 10, 60);

      // Продолжаем анимацию, если симуляция запущена
      if (isRunning) {
        const id = requestAnimationFrame(render);
        setAnimationId(id);
      }
    };

    // Запускаем анимацию, если симуляция запущена
    if (isRunning) {
      const id = requestAnimationFrame(render);
      setAnimationId(id);
    }

    // Останавливаем анимацию, если симуляция приостановлена
    if (!isRunning && animationId) {
      cancelAnimationFrame(animationId);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [ga, track, isRunning, resetFlag]);

  // Обработчик кликов на канвасе
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (isPlacingObstacle) {
      // Размещаем препятствие на трассе
      if (track.isOnTrack(clickX, clickY)) {
        track.addObstacle(clickX, clickY, 10); // Размер препятствия изменен на 10
      }
      return;
    }

    // Проверяем, попал ли клик на какую-либо машину
    ga.population.forEach(car => {
      if (!car.isCrashed) {
        const dx = car.x - clickX;
        const dy = car.y - clickY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= 10) { // Радиус клика по машине
          car.color = car.getRandomColor(); // Изменяем цвет машины
          car.fitness += 50; // Добавляем бонусный фитнес
        }
      }
    });
  };

  // Обработчик клавиш для включения режима размещения препятствий
  const handleKeyDown = (e) => {
    if (e.key === 'Shift') {
      setIsPlacingObstacle(true);
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === 'Shift') {
      setIsPlacingObstacle(false);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const drawCar = (ctx, car) => {
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);
  
    // Рисуем треугольник вместо квадрата
    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-10, -7);
    ctx.lineTo(-10, 7);
    ctx.closePath();
    ctx.fill();
  
    ctx.restore();
  };  

  return (
    <div className="simulation">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid black' }}
        onClick={handleCanvasClick}
      />
      <p>
        Удерживайте <strong>Shift</strong> и кликайте по трассе, чтобы добавлять препятствия.
      </p>
    </div>
  );
}

export default Simulation;