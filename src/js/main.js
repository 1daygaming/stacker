import * as THREE from 'three';
import { Game } from './game.js';
import { UI } from './ui.js';

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Создаем экземпляр игры
  const game = new Game();
  
  // Создаем экземпляр UI
  const ui = new UI(game);
  
  // Устанавливаем обработчик изменения количества собранных цифр
  game.setCollectedNumbersChangedHandler((count) => {
    ui.updateCollectedNumbers(count);
  });
  
  // Инициализируем игру
  game.init();
  
  // Инициализируем UI
  ui.init();
  
  // Запускаем игровой цикл
  game.animate();
});