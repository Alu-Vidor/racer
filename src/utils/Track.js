// src/utils/Track.js
export default class Track {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.trackWidth = 100; // Ширина трассы

    // Центр трассы
    this.cx = width / 2;
    this.cy = height / 2;

    // Радиусы внешней и внутренней границ трассы
    this.outerRadius = Math.min(width, height) / 2 - 50; // Отступ от края канваса
    this.innerRadius = this.outerRadius - this.trackWidth;

    // Препятствия
    this.obstacles = []; // Массив объектов {x, y, radius}
  }

  // Добавление препятствия с уменьшенным радиусом
  addObstacle(x, y, radius = 10) { // Изменено с 20 на 10
    this.obstacles.push({ x, y, radius });
  }

  // Проверка, находится ли точка (x, y) на трассе и не сталкивается ли с препятствием
  isOnTrack(x, y) {
    const dx = x - this.cx;
    const dy = y - this.cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < this.innerRadius || distance > this.outerRadius) {
      return false;
    }

    // Проверка на столкновение с препятствиями
    for (let obstacle of this.obstacles) {
      const dxObs = x - obstacle.x;
      const dyObs = y - obstacle.y;
      const distanceObs = Math.sqrt(dxObs * dxObs + dyObs * dyObs);
      if (distanceObs <= obstacle.radius + 10) { // 10 - радиус машины
        return false;
      }
    }

    return true;
  }

  // Метод для рисования трассы на канвасе
  draw(ctx) {
    // Заполняем фон (например, травой)
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, this.width, this.height);

    // Заполняем трассу белым цветом, создавая кольцо
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.outerRadius, 0, 2 * Math.PI);
    ctx.arc(this.cx, this.cy, this.innerRadius, 0, 2 * Math.PI, true);
    ctx.fill('evenodd');

    // Рисуем черные границы трассы
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.outerRadius, 0, 2 * Math.PI);
    ctx.arc(this.cx, this.cy, this.innerRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Рисуем препятствия
    ctx.fillStyle = 'brown';
    this.obstacles.forEach(obstacle => {
      ctx.beginPath();
      ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, 2 * Math.PI);
      ctx.fill();
    });
  }
}