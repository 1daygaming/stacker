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
    
    // Добавляем кубик
    this.scene.add(this.cube.mesh);
    
    // Добавляем вспомогательный объект для визуализации позиции кубика
    this.scene.add(this.cubePositionHelper);
    
    // Добавляем вспомогательные оси координат
    const axesHelper = new THREE.AxesHelper(this.boardSize.width * this.cellSize);
    this.scene.add(axesHelper);
    
    // Добавляем вспомогательную сетку
    const gridSize = this.boardSize.width * this.cellSize * 2;
    const gridDivisions = this.boardSize.width * 2;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions);
    this.scene.add(gridHelper);
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
    
    // Получаем значение верхней грани кубика
    const topValue = this.cube.getTopValue();
    
    // Проверяем, находится ли кубик на целевой ячейке с соответствующим значением
    if (this.board.checkTargetCell(x, y, topValue)) {
      // Если значение еще не собрано, добавляем его
      if (!this.collectedNumbers.has(topValue)) {
        this.collectedNumbers.add(topValue);
        
        // Уведомляем UI о изменении количества собранных цифр
        if (this.onCollectedNumbersChanged) {
          this.onCollectedNumbersChanged(this.collectedNumbers.size);
        }
        
        // Если собраны все цифры, завершаем игру
        if (this.collectedNumbers.size === this.board.getTargetCellsCount()) {
          this.active = false;
        }
      }
    }
  }

  // Устанавливаем обработчик изменения количества собранных цифр
  setCollectedNumbersChangedHandler(handler) {
    this.onCollectedNumbersChanged = handler;
  }

  // Проверяем, активна ли игра
  isActive() {
    return this.active;
  }

  // Проверяем, вращается ли кубик
  isCubeRotating() {
    return this.cube.rotationInProgress;
  }
}