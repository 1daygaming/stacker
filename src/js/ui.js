export class UI {
  constructor(game) {
    this.game = game;
    this.movesCounter = 0;
    this.collectedNumbers = 0;
    this.totalTargetNumbers = 6;
    
    // Элементы UI
    this.movesCounterElement = document.getElementById('moves-counter');
    this.collectedNumbersElement = document.getElementById('collected-numbers');
    this.nextNumberElement = document.getElementById('next-number');
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
    
    // Создаем элемент для отображения следующей цифры, если его нет
    if (!this.nextNumberElement) {
      this.nextNumberElement = document.createElement('div');
      this.nextNumberElement.id = 'next-number';
      this.nextNumberElement.style.position = 'absolute';
      this.nextNumberElement.style.top = '50px';
      this.nextNumberElement.style.right = '20px';
      this.nextNumberElement.style.backgroundColor = 'rgba(76, 175, 80, 0.8)';
      this.nextNumberElement.style.color = 'white';
      this.nextNumberElement.style.padding = '10px 20px';
      this.nextNumberElement.style.borderRadius = '5px';
      this.nextNumberElement.style.fontWeight = 'bold';
      this.nextNumberElement.style.fontSize = '18px';
      document.body.appendChild(this.nextNumberElement);
    }
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
        case 'D': // Shift+D для переключения режима отладки
          if (event.shiftKey) {
            this.game.toggleDebugHelpers();
          }
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
    
    // Обновляем информацию о следующей цифре
    const nextNumber = this.collectedNumbers + 1;
    if (nextNumber <= this.totalTargetNumbers) {
      this.nextNumberElement.textContent = `Следующая цель: ${nextNumber}`;
      this.nextNumberElement.style.display = 'block';
    } else {
      this.nextNumberElement.style.display = 'none';
    }
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
    // Добавляем информацию о правилах игры
    const rulesElement = document.createElement('div');
    rulesElement.className = 'rules';
    rulesElement.innerHTML = `
      <h2>Правила игры</h2>
      <p>Перемещайте кубик по полю, чтобы совместить <strong>нижнюю грань</strong> кубика с соответствующей цифрой на клетке.</p>
      <p>Собирайте цифры <strong>по порядку от 1 до 6</strong>. Текущая цель подсвечена зеленым цветом.</p>
      <p>Соберите все 6 цифр, чтобы выиграть!</p>
    `;
    
    // Проверяем, не добавлены ли уже правила
    if (!this.gameStartScreen.querySelector('.rules')) {
      this.gameStartScreen.insertBefore(rulesElement, this.startButton);
    }
    
    this.gameStartScreen.classList.remove('hidden');
    this.gameEndScreen.classList.add('hidden');
    
    // Скрываем индикатор следующей цифры на стартовом экране
    if (this.nextNumberElement) {
      this.nextNumberElement.style.display = 'none';
    }
  }

  hideStartScreen() {
    this.gameStartScreen.classList.add('hidden');
    
    // Показываем индикатор следующей цифры при начале игры
    this.updateCounters();
  }

  showEndScreen() {
    this.totalMovesElement.textContent = this.movesCounter;
    this.gameEndScreen.classList.remove('hidden');
    
    // Скрываем индикатор следующей цифры на экране победы
    if (this.nextNumberElement) {
      this.nextNumberElement.style.display = 'none';
    }
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
