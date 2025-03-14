import * as THREE from 'three';
import { Board } from './board.js';
import { Cube } from './cube.js';

export class Game {
  constructor() {
    // Настройки игры
    this.boardSize = { width: 10, height: 10 };
    this.cellSize = 1;
    
    // Состояние игры
    this.active = false;
    this.collectedNumbers = new Set();
    
    // Компоненты Three.js
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.lights = [];
    
    // Игровые объекты
    this.board = null;
    this.cube = null;
    this.cubePositionHelper = null;
    
    // Вспомогательные объекты для отладки
    this.debugHelpers = {
      enabled: true,
      axesHelper: null,
      gridHelper: null
    };
  }

  init() {
    // Инициализация Three.js
    this.initThree();
    
    // Создание игровых объектов
    this.createGameObjects();
    
    // Настройка камеры
    this.setupCamera();
    
    // Добавление освещения
    this.setupLights();
    
    // Добавление объектов на сцену
    this.addObjectsToScene();
    
    // Настройка рендерера
    this.setupRenderer();
    
    // Обработка изменения размера окна
    window.addEventListener('resize', () => this.onWindowResize());
  }

  initThree() {
    // Создаем сцену
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);
    
    // Создаем камеру
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
  }

  createGameObjects() {
    // Создаем игровое поле
    this.board = new Board(this.boardSize.width, this.boardSize.height, this.cellSize);
    
    // Создаем кубик
    this.cube = new Cube(this.cellSize);
    
    // Создаем вспомогательный объект для визуализации позиции кубика
    const cubePositionGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const cubePositionMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.cubePositionHelper = new THREE.Mesh(cubePositionGeometry, cubePositionMaterial);
    this.cubePositionHelper.position.y = 0.2;
  }

  setupCamera() {
    // Позиционируем камеру
    const boardWidth = this.boardSize.width * this.cellSize;
    const boardHeight = this.boardSize.height * this.cellSize;
    const maxDimension = Math.max(boardWidth, boardHeight);
    
    // Устанавливаем камеру так, чтобы было видно все поле
    this.camera.position.set(maxDimension * 1.0, maxDimension * 1.0, maxDimension * 1.0);
    this.camera.lookAt(0, 0, 0);
  }

  setupLights() {
    // Добавляем окружающий свет
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);
    
    // Добавляем направленный свет (как солнце)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    
    // Настройка теней
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    
    const shadowSize = this.boardSize.width * this.cellSize * 0.8;
    directionalLight.shadow.camera.left = -shadowSize;
    directionalLight.shadow.camera.right = shadowSize;
    directionalLight.shadow.camera.top = shadowSize;
    directionalLight.shadow.camera.bottom = -shadowSize;
    
    this.scene.add(directionalLight);
    this.lights.push(directionalLight);
  }

  addObjectsToScene() {
    // Добавляем игровое поле
    this.scene.add(this.board.mesh);
    
    // Устанавливаем ссылку на сцену для куба
    this.cube.setScene(this.scene);
    
    // Добавляем кубик
    this.scene.add(this.cube.mesh);
    
    // Добавляем вспомогательный объект для визуализации позиции кубика
    this.scene.add(this.cubePositionHelper);
    
    // Добавляем вспомогательные объекты для отладки
    if (this.debugHelpers.enabled) {
      // Добавляем вспомогательные оси координат
      this.debugHelpers.axesHelper = new THREE.AxesHelper(this.boardSize.width * this.cellSize);
      this.scene.add(this.debugHelpers.axesHelper);
      
      // Добавляем вспомогательную сетку
      const gridSize = this.boardSize.width * this.cellSize * 2;
      const gridDivisions = this.boardSize.width * 2;
      this.debugHelpers.gridHelper = new THREE.GridHelper(gridSize, gridDivisions);
      this.scene.add(this.debugHelpers.gridHelper);
    }
  }

  setupRenderer() {
    // Создаем рендерер
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Добавляем рендерер на страницу
    const container = document.getElementById('game-canvas');
    container.appendChild(this.renderer.domElement);
  }

  onWindowResize() {
    // Обновляем соотношение сторон камеры
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    
    // Обновляем размер рендерера
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  start() {
    // Сбрасываем состояние игры
    this.reset();
    
    // Активируем игру
    this.active = true;
  }

  reset() {
    // Сбрасываем собранные цифры
    this.collectedNumbers.clear();
    
    // Сбрасываем позицию кубика
    const startPosition = this.board.getStartPosition();
    this.cube.reset(startPosition);
    
    // Обновляем позицию меша кубика в соответствии с координатной системой поля
    const worldX = startPosition.x * this.cellSize - (this.boardSize.width * this.cellSize) / 2 + this.cellSize / 2;
    const worldZ = startPosition.y * this.cellSize - (this.boardSize.height * this.cellSize) / 2 + this.cellSize / 2;
    
    this.cube.mesh.position.set(
      worldX,
      this.cellSize / 2,
      worldZ
    );
    
    // Сбрасываем вращение кубика
    this.cube.mesh.rotation.set(0, 0, 0);
    
    // Обновляем позицию вспомогательного объекта
    this.cubePositionHelper.position.x = worldX;
    this.cubePositionHelper.position.z = worldZ;
    
    // Сбрасываем подсветку целевых ячеек
    this.board.updateTargetCellsHighlight(1);
    
    // Обновляем отладочную информацию
    if (this.debugHelpers.enabled) {
      this.updateDebugInfo();
    }
  }

  animate() {
    // Запускаем цикл анимации
    requestAnimationFrame(() => this.animate());
    
    // Обновляем состояние кубика
    if (this.active) {
      const rotationCompleted = this.cube.update(this.boardSize, this.cellSize);
      
      // Если вращение завершено, проверяем, не попал ли кубик на целевую ячейку
      if (rotationCompleted) {
        this.checkTargetCell();
        
        // Обновляем отладочную информацию
        if (this.debugHelpers.enabled) {
          this.updateDebugInfo();
        }
      }
      
      // Обновляем позицию вспомогательного объекта
      const worldX = this.cube.position.x * this.cellSize - (this.boardSize.width * this.cellSize) / 2 + this.cellSize / 2;
      const worldZ = this.cube.position.y * this.cellSize - (this.boardSize.height * this.cellSize) / 2 + this.cellSize / 2;
      this.cubePositionHelper.position.x = worldX;
      this.cubePositionHelper.position.z = worldZ;
    }
    
    // Рендерим сцену
    this.renderer.render(this.scene, this.camera);
  }

  moveCube(direction) {
    // Если игра не активна или кубик уже вращается, игнорируем
    if (!this.active || this.cube.rotationInProgress) return false;
    
    // Пытаемся начать вращение кубика
    return this.cube.startRotation(direction, this.board.getSize(), this.cellSize);
  }

  checkTargetCell() {
    // Получаем текущую позицию кубика
    const { x, y } = this.cube.position;
    
    // Получаем значение нижней грани кубика
    const bottomValue = this.cube.getBottomValue();
    
    // Определяем следующую цифру, которую нужно собрать
    const nextNumberToCollect = this.collectedNumbers.size + 1;
    
    // Проверяем, находится ли кубик на целевой ячейке с соответствующим значением
    // и является ли это значение следующим в последовательности
    if (this.board.checkTargetCell(x, y, bottomValue) && bottomValue === nextNumberToCollect) {
      // Добавляем собранное значение
      this.collectedNumbers.add(bottomValue);
      
      // Обновляем подсветку целевых ячеек
      this.board.updateTargetCellsHighlight(nextNumberToCollect + 1);
      
      // Уведомляем UI о изменении количества собранных цифр
      if (this.onCollectedNumbersChanged) {
        this.onCollectedNumbersChanged(this.collectedNumbers.size);
      }
      
      // Если собраны все цифры, завершаем игру
      if (this.collectedNumbers.size === this.board.getTargetCellsCount()) {
        this.active = false;
        
        // Уведомляем о завершении игры
        if (this.onGameCompleted) {
          this.onGameCompleted();
        }
      }
    }
  }

  // Устанавливаем обработчик изменения количества собранных цифр
  setCollectedNumbersChangedHandler(handler) {
    this.onCollectedNumbersChanged = handler;
  }

  // Устанавливаем обработчик завершения игры
  setGameCompletedHandler(handler) {
    this.onGameCompleted = handler;
  }

  // Проверяем, активна ли игра
  isActive() {
    return this.active;
  }

  // Проверяем, вращается ли кубик
  isCubeRotating() {
    return this.cube.rotationInProgress;
  }

  // Обновляем отладочную информацию
  updateDebugInfo() {
    // Создаем или обновляем элемент для отображения отладочной информации
    let debugInfoElement = document.getElementById('debug-info');
    if (!debugInfoElement) {
      debugInfoElement = document.createElement('div');
      debugInfoElement.id = 'debug-info';
      debugInfoElement.style.position = 'absolute';
      debugInfoElement.style.top = '10px';
      debugInfoElement.style.left = '10px';
      debugInfoElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      debugInfoElement.style.color = 'white';
      debugInfoElement.style.padding = '10px';
      debugInfoElement.style.fontFamily = 'monospace';
      debugInfoElement.style.fontSize = '12px';
      debugInfoElement.style.zIndex = '1000';
      debugInfoElement.style.display = this.debugHelpers.enabled ? 'block' : 'none';
      document.body.appendChild(debugInfoElement);
    }
    
    // Обновляем содержимое
    const { top, bottom, left, right, front, back } = this.cube.faceValues;
    debugInfoElement.innerHTML = `
      <div>Позиция: x=${this.cube.position.x}, y=${this.cube.position.y}</div>
      <div>Грани:</div>
      <div>- Верх: ${top}</div>
      <div>- Низ: ${bottom}</div>
      <div>- Лево: ${left}</div>
      <div>- Право: ${right}</div>
      <div>- Перед: ${front}</div>
      <div>- Зад: ${back}</div>
    `;
  }

  // Включить/выключить вспомогательные объекты для отладки
  toggleDebugHelpers() {
    this.debugHelpers.enabled = !this.debugHelpers.enabled;
    
    if (this.debugHelpers.enabled) {
      // Включаем вспомогательные объекты
      if (this.debugHelpers.axesHelper) {
        this.scene.add(this.debugHelpers.axesHelper);
      }
      if (this.debugHelpers.gridHelper) {
        this.scene.add(this.debugHelpers.gridHelper);
      }
      this.scene.add(this.cubePositionHelper);
      this.cube.orientationHelpers.visible = true;
      
      // Обновляем отладочную информацию
      this.updateDebugInfo();
      document.getElementById('debug-info').style.display = 'block';
    } else {
      // Выключаем вспомогательные объекты
      if (this.debugHelpers.axesHelper) {
        this.scene.remove(this.debugHelpers.axesHelper);
      }
      if (this.debugHelpers.gridHelper) {
        this.scene.remove(this.debugHelpers.gridHelper);
      }
      this.scene.remove(this.cubePositionHelper);
      this.cube.orientationHelpers.visible = false;
      
      // Скрываем отладочную информацию
      const debugInfoElement = document.getElementById('debug-info');
      if (debugInfoElement) {
        debugInfoElement.style.display = 'none';
      }
    }
  }
}