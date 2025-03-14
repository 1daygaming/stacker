import * as THREE from 'three';

export class Board {
  constructor(width = 5, height = 5, cellSize = 1) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.mesh = null;
    this.cells = [];
    this.targetCells = [];
    this.createMesh();
    this.setupTargetCells();
  }

  createMesh() {
    // Создаем группу для всех элементов поля
    this.mesh = new THREE.Group();
    
    // Создаем геометрию для ячейки поля
    const cellGeometry = new THREE.BoxGeometry(this.cellSize, this.cellSize * 0.1, this.cellSize);
    
    // Создаем материал для обычных ячеек
    const cellMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a6572,
      roughness: 0.7,
      metalness: 0.2
    });
    
    // Создаем ячейки поля
    for (let y = 0; y < this.height; y++) {
      this.cells[y] = [];
      for (let x = 0; x < this.width; x++) {
        const cell = new THREE.Mesh(cellGeometry, cellMaterial.clone());
        
        // Позиционируем ячейку
        cell.position.set(
          x * this.cellSize,
          -this.cellSize * 0.05, // Половина высоты ячейки
          y * this.cellSize
        );
        
        // Добавляем тень
        cell.receiveShadow = true;
        
        // Добавляем ячейку в группу
        this.mesh.add(cell);
        
        // Сохраняем ссылку на ячейку
        this.cells[y][x] = {
          mesh: cell,
          type: 'normal',
          value: null
        };
      }
    }
    
    // Центрируем поле
    this.mesh.position.set(
      -(this.width * this.cellSize) / 2 + this.cellSize / 2,
      0,
      -(this.height * this.cellSize) / 2 + this.cellSize / 2
    );
  }

  setupTargetCells() {
    // Создаем материал для целевых ячеек
    const targetMaterial = new THREE.MeshStandardMaterial({
      color: 0x344955,
      roughness: 0.7,
      metalness: 0.2,
      emissive: 0x344955,
      emissiveIntensity: 0.2
    });
    
    // Создаем массив значений от 1 до 6
    const values = [1, 2, 3, 4, 5, 6];
    
    // Перемешиваем массив значений
    this.shuffleArray(values);
    
    // Создаем массив всех возможных позиций (исключая центр поля, где стартует кубик)
    const allPositions = [];
    const centerX = Math.floor(this.width / 2);
    const centerY = Math.floor(this.height / 2);
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // Исключаем центральную клетку (стартовую позицию)
        if (x !== centerX || y !== centerY) {
          allPositions.push({ x, y });
        }
      }
    }
    
    // Перемешиваем массив позиций
    this.shuffleArray(allPositions);
    
    // Выбираем первые 6 позиций (или меньше, если поле маленькое)
    const targetPositions = [];
    const numTargets = Math.min(6, allPositions.length);
    
    for (let i = 0; i < numTargets; i++) {
      targetPositions.push({
        x: allPositions[i].x,
        y: allPositions[i].y,
        value: values[i]
      });
    }
    
    // Устанавливаем целевые ячейки
    for (const pos of targetPositions) {
      const cell = this.cells[pos.y][pos.x];
      cell.type = 'target';
      cell.value = pos.value;
      cell.mesh.material = targetMaterial.clone();
      
      // Добавляем текстуру с цифрой
      const texture = this.createNumberTexture(pos.value);
      cell.mesh.material.map = texture;
      
      // Сохраняем ссылку на целевую ячейку
      this.targetCells.push(cell);
    }
    
    // Инициализируем подсветку целевых ячеек (подсвечиваем первую цифру)
    this.updateTargetCellsHighlight(1);
  }

  // Вспомогательный метод для перемешивания массива
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  createNumberTexture(number) {
    // Создаем канвас для отрисовки текстуры
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    
    // Заливаем прозрачным фоном
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем цифру
    context.fillStyle = '#ffffff';
    context.font = 'bold 64px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(number.toString(), canvas.width / 2, canvas.height / 2);
    
    // Создаем текстуру из канваса
    const texture = new THREE.CanvasTexture(canvas);
    
    return texture;
  }

  // Проверяем, является ли ячейка целевой и соответствует ли значение кубика
  checkTargetCell(x, y, cubeValue) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return false;
    }
    
    const cell = this.cells[y][x];
    return cell.type === 'target' && cell.value === cubeValue;
  }

  // Получаем стартовую позицию (центр поля)
  getStartPosition() {
    return {
      x: Math.floor(this.width / 2),
      y: Math.floor(this.height / 2)
    };
  }

  // Преобразуем координаты поля в мировые координаты
  gridToWorld(x, y) {
    return {
      x: (x - Math.floor(this.width / 2)) * this.cellSize,
      z: (y - Math.floor(this.height / 2)) * this.cellSize
    };
  }

  // Получаем размер поля
  getSize() {
    return {
      width: this.width,
      height: this.height
    };
  }

  // Получаем количество целевых ячеек
  getTargetCellsCount() {
    return this.targetCells.length;
  }

  // Обновляем подсветку целевых ячеек
  updateTargetCellsHighlight(nextNumberToCollect) {
    // Проходим по всем целевым ячейкам
    for (const cell of this.targetCells) {
      // Если значение ячейки меньше nextNumberToCollect, значит она уже собрана
      if (cell.value < nextNumberToCollect - 1) {
        // Подсвечиваем собранные ячейки зеленым цветом
        cell.mesh.material.color.set(0x4CAF50);
        cell.mesh.material.emissive.set(0x2E7D32);
        cell.mesh.material.emissiveIntensity = 0.3;
      } 
      // Если значение ячейки равно nextNumberToCollect, значит это текущая цель
      else if (cell.value === nextNumberToCollect - 1) {
        // Подсвечиваем текущую цель ярко-зеленым цветом
        cell.mesh.material.color.set(0x4CAF50);
        cell.mesh.material.emissive.set(0x2E7D32);
        cell.mesh.material.emissiveIntensity = 0.6; // Более яркое свечение для текущей цели
      }
      // Иначе это будущие цели
      else {
        // Оставляем стандартный цвет для будущих целей
        cell.mesh.material.color.set(0x344955);
        cell.mesh.material.emissive.set(0x344955);
        cell.mesh.material.emissiveIntensity = 0.2;
      }
    }
  }
}
