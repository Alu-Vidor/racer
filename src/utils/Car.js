// src/utils/Car.js
export default class Car {
  constructor(weights = null, startX, startY) {
    this.x = startX;
    this.y = startY;
    this.angle = -Math.PI / 2; // Начальное направление вверх по трассе
    this.speed = 2;

    this.weights = weights || this.initializeWeights();

    this.fitness = 0;
    this.isCrashed = false;
    this.distanceTravelled = 0;

    // Назначаем случайный цвет машине
    this.color = this.getRandomColor();
  }

  initializeWeights() {
    return {
      accelerate: Math.random() * 0.1,    // Скорость ускорения
      leftTurn: (Math.random() - 0.5) * 0.05, // Поворот влево
      rightTurn: (Math.random() - 0.5) * 0.05, // Поворот вправо
    };
  }

  getRandomColor() {
    // Генерация случайного цвета в формате HEX
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Метод для обновления состояния автомобиля
  update(track) {
    if (this.isCrashed) return;

    // Управление на основе весов и сенсоров
    const sensorDistance = 30; // Расстояние сенсора вперед

    // Рассчитываем позицию точки впереди автомобиля для сенсора
    const sensorX = this.x + Math.cos(this.angle) * sensorDistance;
    const sensorY = this.y + Math.sin(this.angle) * sensorDistance;

    // Проверяем наличие препятствий перед автомобилем
    let obstacleAhead = false;
    for (let obstacle of track.obstacles) {
      const dx = sensorX - obstacle.x;
      const dy = sensorY - obstacle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= obstacle.radius + 10) { // 10 - радиус машины
        obstacleAhead = true;
        break;
      }
    }

    // Если препятствие обнаружено, используем дополнительные веса для поворота
    if (obstacleAhead) {
      // Решаем, поворачивать ли влево или вправо
      const turnDecision = Math.random() < 0.5 ? 'leftTurn' : 'rightTurn';
      if (turnDecision === 'leftTurn') {
        this.angle += this.weights.leftTurn;
      } else {
        this.angle += this.weights.rightTurn;
      }
    } else {
      // Если препятствий нет, используем основной поворот
      this.angle += this.weights.leftTurn + this.weights.rightTurn;
    }

    // Ускорение
    this.speed += this.weights.accelerate;

    // Ограничение скорости
    this.speed = Math.min(this.speed, 5);

    // Сохранение предыдущей позиции для проверки
    const prevX = this.x;
    const prevY = this.y;

    // Обновление позиции
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    // Проверка на выход за пределы трассы
    if (!track.isOnTrack(this.x, this.y)) {
      this.isCrashed = true;
      return;
    }

    // Обновление расстояния и фитнеса
    this.distanceTravelled += this.speed;
    this.fitness += this.speed;
  }

  clone() {
    const clonedCar = new Car(JSON.parse(JSON.stringify(this.weights)), this.x, this.y);
    clonedCar.color = this.getRandomColor(); // Назначаем новый цвет при клонировании
    return clonedCar;
  }
}
