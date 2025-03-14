import * as THREE from 'three';

export class Cube {
  constructor(size = 1) {
    this.size = size;
    this.mesh = null;
    this.position = { x: 0, y: 0 };
    this.faceValues = {
      top: 1,
      bottom: 6,
      left: 3,
      right: 4,
      front: 2,
      back: 5
    };
    this.rotationInProgress = false;
    this.rotationAxis = null;
    this.rotationAngle = 0;
    this.targetRotation = 0;
    this.rotationDirection = 1;
    this.rotationSpeed = Math.PI / 24; // скорость вращения
    this.createMesh();
  }

  createMesh() {
    // Создаем геометрию куба
    const geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
    
    // Создаем материалы для каждой грани куба
    const materials = [
      this.createFaceMaterial(this.faceValues.right), // правая грань
      this.createFaceMaterial(this.faceValues.left),  // левая грань
      this.createFaceMaterial(this.faceValues.top),   // верхняя грань
      this.createFaceMaterial(this.faceValues.bottom), // нижняя грань
      this.createFaceMaterial(this.faceValues.front), // передняя грань
      this.createFaceMaterial(this.faceValues.back)   // задняя грань
    ];
    
    // Создаем меш с геометрией и материалами
    this.mesh = new THREE.Mesh(geometry, materials);
    
    // Устанавливаем начальную позицию куба
    this.mesh.position.set(0, this.size / 2, 0);
    
    // Добавляем тень
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }

  createFaceMaterial(value) {
    // Создаем канвас для отрисовки текстуры
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    
    // Заливаем фон
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем границу
    context.strokeStyle = '#000000';
    context.lineWidth = 8;
    context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
    
    // Рисуем цифру
    context.fillStyle = '#000000';
    context.font = 'bold 80px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(value.toString(), canvas.width / 2, canvas.height / 2);
    
    // Создаем текстуру из канваса
    const texture = new THREE.CanvasTexture(canvas);
    
    // Создаем материал с текстурой
    return new THREE.MeshStandardMaterial({ 
      map: texture,
      roughness: 0.5,
      metalness: 0.1
    });
  }

  // Обновляем значения граней после вращения
  updateFaceValues(direction) {
    const { top, bottom, left, right, front, back } = this.faceValues;
    
    switch (direction) {
      case 'up':
        this.faceValues = {
          top: back,
          bottom: front,
          left: left,
          right: right,
          front: top,
          back: bottom
        };
        break;
      case 'down':
        this.faceValues = {
          top: front,
          bottom: back,
          left: left,
          right: right,
          front: bottom,
          back: top
        };
        break;
      case 'left':
        this.faceValues = {
          top: right,
          bottom: left,
          left: top,
          right: bottom,
          front: front,
          back: back
        };
        break;
      case 'right':
        this.faceValues = {
          top: left,
          bottom: right,
          left: bottom,
          right: top,
          front: front,
          back: back
        };
        break;
    }
  }

  // Начать вращение куба в указанном направлении
  startRotation(direction, boardSize, cellSize) {
    if (this.rotationInProgress) return false;
    
    // Проверяем, можно ли двигаться в указанном направлении
    const newPosition = { ...this.position };
    
    switch (direction) {
      case 'up':
        newPosition.y += 1;
        break;
      case 'down':
        newPosition.y -= 1;
        break;
      case 'left':
        newPosition.x -= 1;
        break;
      case 'right':
        newPosition.x += 1;
        break;
    }
    
    // Проверяем, не выходит ли куб за границы поля
    if (
      newPosition.x < 0 || 
      newPosition.x >= boardSize.width || 
      newPosition.y < 0 || 
      newPosition.y >= boardSize.height
    ) {
      return false;
    }
    
    this.rotationInProgress = true;
    this.rotationDirection = 1;
    this.rotationAngle = 0;
    this.targetRotation = Math.PI / 2;
    
    // Получаем текущую позицию в мировых координатах
    const worldX = this.position.x * this.size - (boardSize.width * cellSize) / 2 + cellSize / 2;
    const worldZ = this.position.y * this.size - (boardSize.height * cellSize) / 2 + cellSize / 2;
    
    // Устанавливаем ось вращения и позицию
    switch (direction) {
      case 'up':
        this.rotationAxis = new THREE.Vector3(1, 0, 0);
        this.mesh.position.set(worldX, this.size / 2, worldZ - this.size / 2);
        break;
      case 'down':
        this.rotationAxis = new THREE.Vector3(-1, 0, 0);
        this.mesh.position.set(worldX, this.size / 2, worldZ + this.size / 2);
        break;
      case 'left':
        this.rotationAxis = new THREE.Vector3(0, 0, 1);
        this.mesh.position.set(worldX - this.size / 2, this.size / 2, worldZ);
        break;
      case 'right':
        this.rotationAxis = new THREE.Vector3(0, 0, -1);
        this.mesh.position.set(worldX + this.size / 2, this.size / 2, worldZ);
        break;
    }
    
    return true;
  }

  // Обновление вращения куба
  update(boardSize, cellSize) {
    if (!this.rotationInProgress) return;
    
    // Продолжаем вращение
    this.rotationAngle += this.rotationSpeed;
    
    if (this.rotationAngle >= this.targetRotation) {
      // Завершаем вращение
      this.rotationAngle = this.targetRotation;
      this.rotationInProgress = false;
      
      // Определяем направление вращения
      let direction;
      if (this.rotationAxis.x === 1) direction = 'up';
      else if (this.rotationAxis.x === -1) direction = 'down';
      else if (this.rotationAxis.z === 1) direction = 'left';
      else if (this.rotationAxis.z === -1) direction = 'right';
      
      // Обновляем значения граней
      this.updateFaceValues(direction);
      
      // Обновляем позицию куба на поле
      switch (direction) {
        case 'up':
          this.position.y += 1;
          break;
        case 'down':
          this.position.y -= 1;
          break;
        case 'left':
          this.position.x -= 1;
          break;
        case 'right':
          this.position.x += 1;
          break;
      }
      
      // Сбрасываем позицию меша с учетом центрирования поля
      this.mesh.position.set(
        this.position.x * this.size - (boardSize.width * cellSize) / 2 + cellSize / 2,
        this.size / 2,
        this.position.y * this.size - (boardSize.height * cellSize) / 2 + cellSize / 2
      );
      
      // Сбрасываем вращение
      this.mesh.rotation.set(0, 0, 0);
      
      return true; // вращение завершено
    }
    
    // Применяем вращение к мешу
    this.mesh.rotateOnWorldAxis(this.rotationAxis, this.rotationSpeed);
    
    return false; // вращение продолжается
  }

  // Получить текущее значение верхней грани
  getTopValue() {
    return this.faceValues.top;
  }

  // Сбросить куб в начальное положение
  reset(startPosition) {
    this.position = { ...startPosition };
    this.rotationInProgress = false;
    this.faceValues = {
      top: 1,
      bottom: 6,
      left: 3,
      right: 4,
      front: 2,
      back: 5
    };
  }
}
