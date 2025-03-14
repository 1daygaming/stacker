export class UI {
  constructor(game) {
    this.game = game;
    this.movesCounter = 0;
    this.collectedNumbers = 0;
    this.totalTargetNumbers = 6;
    
    // Элементы UI
    this.movesCounterElement = document.getElementById('moves-counter');
    this.collectedNumbersElement = document.getElementById('collected-numbers');
    this.gameStartScreen = document.getElementById('game-start');
    this.gameEndScreen = document.getElementById('game-end');
    this.totalMovesElement = document.getElementById('total-moves');
    
    // Кнопки
    this.startButton = document.getElementById('start-btn');
    this.restartButton = document.getElementById('restart-btn');
    this.upButton = document.getElementById('up-btn');
    this.leftButton = document.getElementById('left-btn');
    this.rightButton = document.getElementById('right-btn');
    this.downButton = document.getElementById('down-btn');
  }

  init() {
    // Инициализация обработчиков событий
    this.setupEventListeners();
    
    // Показываем стартовый экран
    this.showStartScreen();
    
    // Обновляем счетчики
    this.updateCounters();
  }

  setupEventListeners() {
    // Обработчики для кнопок управления
    this.upButton.addEventListener('click', () => this.handleMove('up'));
    this.leftButton.addEventListener('click', () => this.handleMove('left'));
    this.rightButton.addEventListener('click', () => this.handleMove('right'));
    this.downButton.addEventListener('click', () => this.handleMove('down'));
    
    // Обработчики для клавиатуры
    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          this.handleMove('up');
          break;
        case 'ArrowLeft':
        case 'a':
          this.handleMove('left');
          break;
        case 'ArrowRight':
        case 'd':
          this.handleMove('right');
          break;
        case 'ArrowDown':
        case 's':
          this.handleMove('down');
          break;
      }
    });
    
    // Обработчики для кнопок старта/рестарта
    this.startButton.addEventListener('click', () => {
      this.hideStartScreen();
      this.game.start();
    });
    
    this.restartButton.addEventListener('click', () => {
      this.hideEndScreen();
      this.reset();
      this.game.start();
    });
  }

  handleMove(direction) {
    // Если игра не активна, игнорируем нажатия
    if (!this.game.isActive()) return;
    
    // Если кубик уже вращается, игнорируем нажатия
    if (this.game.isCubeRotating()) return;
    
    // Пытаемся сделать ход
    const moved = this.game.moveCube(direction);
    
    // Если ход успешен, увеличиваем счетчик ходов
    if (moved) {
      this.movesCounter++;
      this.updateCounters();
    }
  }

  updateCounters() {
    // Обновляем счетчик ходов
    this.movesCounterElement.textContent = `Ходы: ${this.movesCounter}`;
    
    // Обновляем счетчик собранных цифр
    this.collectedNumbersElement.textContent = `Собрано: ${this.collectedNumbers}/${this.totalTargetNumbers}`;
  }

  updateCollectedNumbers(count) {
    this.collectedNumbers = count;
    this.updateCounters();
    
    // Если собраны все цифры, показываем экран победы
    if (this.collectedNumbers === this.totalTargetNumbers) {
      this.showEndScreen();
    }
  }

  showStartScreen() {
    this.gameStartScreen.classList.remove('hidden');
    this.gameEndScreen.classList.add('hidden');
  }

  hideStartScreen() {
    this.gameStartScreen.classList.add('hidden');
  }

  showEndScreen() {
    this.totalMovesElement.textContent = this.movesCounter;
    this.gameEndScreen.classList.remove('hidden');
  }

  hideEndScreen() {
    this.gameEndScreen.classList.add('hidden');
  }

  reset() {
    this.movesCounter = 0;
    this.collectedNumbers = 0;
    this.updateCounters();
  }
}
