// src/utils/GeneticAlgorithm.js
import Car from './Car';

export default class GeneticAlgorithm {
  constructor(populationSize, track, mutationRate) {
    this.populationSize = populationSize;
    this.population = [];
    this.generation = 0;
    this.track = track;
    this.mutationRate = mutationRate;
    this.initializePopulation();
  }

  initializePopulation() {
    this.population = [];
    for (let i = 0; i < this.populationSize; i++) {
      // Размещаем машины на трассе с небольшим разбросом по углу
      const angle = Math.random() * 2 * Math.PI;
      const radius = (this.track.outerRadius + this.track.innerRadius) / 2;
      const x = this.track.cx + radius * Math.cos(angle);
      const y = this.track.cy + radius * Math.sin(angle);
      const car = new Car(null, x, y);
      car.angle = angle + Math.PI / 2; // Направление вдоль трассы
      this.population.push(car);
    }
  }

  evaluateFitness() {
    // Фитнес уже обновляется в методе Car.update
  }

  selectParents() {
    // Сортировка по фитнесу и выбор лучших
    this.population.sort((a, b) => b.fitness - a.fitness);
    const topHalf = this.population.slice(0, Math.floor(this.populationSize / 2));
    return topHalf;
  }

  crossover(parent1, parent2) {
    const childWeights = {};
    for (let key in parent1.weights) {
      // Смешиваем веса родителей
      childWeights[key] = Math.random() < 0.5 ? parent1.weights[key] : parent2.weights[key];
    }

    // Размещаем ребенка на трассе с небольшим разбросом по углу
    const angle = Math.random() * 2 * Math.PI;
    const radius = (this.track.outerRadius + this.track.innerRadius) / 2;
    const x = this.track.cx + radius * Math.cos(angle);
    const y = this.track.cy + radius * Math.sin(angle);

    const child = new Car(childWeights, x, y);
    child.angle = angle + Math.PI / 2; // Направление вдоль трассы
    return child;
  }

  mutate(car) {
    for (let key in car.weights) {
      if (Math.random() < this.mutationRate) {
        // Небольшое изменение веса
        car.weights[key] += (Math.random() - 0.5) * 0.02;
        // Ограничение весов
        if (key === 'leftTurn' || key === 'rightTurn') {
          car.weights[key] = Math.max(Math.min(car.weights[key], 0.05), -0.05);
        } else if (key === 'accelerate') {
          car.weights[key] = Math.max(Math.min(car.weights[key], 0.2), -0.2);
        }
      }
    }
  }

  generateNextGeneration() {
    const parents = this.selectParents();
    const newPopulation = [];

    while (newPopulation.length < this.populationSize) {
      const parent1 = parents[Math.floor(Math.random() * parents.length)];
      const parent2 = parents[Math.floor(Math.random() * parents.length)];
      const child = this.crossover(parent1, parent2);
      this.mutate(child);
      newPopulation.push(child);
    }

    this.population = newPopulation;
    this.generation += 1;
  }

  setMutationRate(newRate) {
    this.mutationRate = newRate;
  }
}