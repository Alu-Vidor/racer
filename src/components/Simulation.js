// src/components/Simulation.js
import React, { useRef, useEffect } from 'react';
import Track from '../utils/Track';
import GeneticAlgorithm from '../utils/GeneticAlgorithm';

function Simulation({ populationSize, mutationRate, isRunning }) {
  const canvasRef = useRef(null);
  const gaRef = useRef(null);
  const trackRef = useRef(null);
  const animationIdRef = useRef(null);

  // Инициализация GA и Track при изменении populationSize или mutationRate
  useEffect(() => {
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    const track = new Track(width, height);
    trackRef.current = track;
    const ga = new GeneticAlgorithm(populationSize, track, mutationRate);
    gaRef.current = ga;
  }, [populationSize, mutationRate]);

  // Анимационный цикл
  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Рисуем трассу
      trackRef.current.draw(ctx);

      // Обновляем и рисуем автомобили
      gaRef.current.population.forEach(car => {
        if (!car.isCrashed) {
          car.update(trackRef.current);
          drawCar(ctx, car);
        }
      });

      // Проверка завершения поколения
      const activeCars = gaRef.current.population.filter(car => !car.isCrashed);
      if (activeCars.length === 0) {
        gaRef.current.evaluateFitness();
        gaRef.current.generateNextGeneration();
        // Перезапускаем позиции автомобилей на трассе
        gaRef.current.population.forEach(car => {
          const angle = Math.random() * 2 * Math.PI;
          const radius = (trackRef.current.outerRadius + trackRef.current.innerRadius) / 2;
          car.x = trackRef.current.cx + radius * Math.cos(angle);
          car.y = trackRef.current.cy + radius * Math.sin(angle);
          car.angle = angle + Math.PI / 2;
          car.speed = 2;
          car.isCrashed = false;
          car.fitness = 0;
          car.distanceTravelled = 0;
          car.color = car.getRandomColor();
        });
      }

      // Отображение информации о поколении и лучшем автомобиле
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      ctx.fillText(`Поколение: ${gaRef.current.generation}`, 10, 30);

      const bestCar = gaRef.current.population.reduce((prev, current) => (prev.fitness > current.fitness) ? prev : current, gaRef.current.population[0]);
      ctx.fillText(`Лучший фитнес: ${bestCar.fitness.toFixed(2)}`, 10, 60);

      // Запрос следующего кадра
      animationIdRef.current = requestAnimationFrame(render);
    };

    if (isRunning) {
      // Начинаем анимацию
      if (!animationIdRef.current) {
        animationIdRef.current = requestAnimationFrame(render);
      }
    } else {
      // Приостанавливаем анимацию
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    }

    // Очистка при размонтировании компонента
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isRunning]);

  // Обработчик кликов на канвасе для изменения цвета машины или добавления препятствий
  useEffect(() => {
    const handleCanvasClick = (e) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Проверка, удерживается ли клавиша Shift для добавления препятствий
      if (e.shiftKey) {
        // Добавляем препятствие, если кликнут на трассе
        if (trackRef.current.isOnTrack(clickX, clickY)) {
          trackRef.current.addObstacle(clickX, clickY, 10); // Размер препятствия 10
        }
        return;
      }

      // Проверяем, попал ли клик на какую-либо машину
      gaRef.current.population.forEach(car => {
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

    const canvas = canvasRef.current;
    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, []);

  // Функция для рисования автомобиля
  const drawCar = (ctx, car) => {
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);

    // Рисуем треугольник вместо квадрата для указания направления
    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-10, -7);
    ctx.lineTo(-10, 7);
    ctx.closePath();
    ctx.fill();

    // Визуализируем сенсор (желтая линия)
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(30, 0); // Длина сенсора
    ctx.stroke();

    // Отображаем скорость машины
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillText(`V: ${car.speed.toFixed(1)}`, -15, -15);

    ctx.restore();
  };

  return (
    <div className="simulation">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid black' }}
      />
      <p>
        Удерживайте <strong>Shift</strong> и кликайте по трассе, чтобы добавлять препятствия.
      </p>
    </div>
  );
}

export default Simulation;