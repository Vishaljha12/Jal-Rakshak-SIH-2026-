import * as THREE from 'three';

export class SimulationEngine {
  constructor() {
    this.grid = null;
    this.width = 0;
    this.height = 0;
    this.cellSize = 0;
    
    // Arrays for simulation
    this.elevation = null; // Terrain height
    this.waterLevel = null; // Absolute water surface height
    this.depth = null; // Water depth (waterLevel - elevation)
    this.activeCells = [];
    
    this.isRunning = false;
    this.time = 0;
    this.maxDepth = 0;
    this.floodedArea = 0;
    
    // Config
    this.params = {
      speed: 1,
      releaseVolume: 10,
      damBreakWidth: 5, // cells
      sourceX: 0,
      sourceY: 0,
    };
  }

  // Initialize the 2D grid by raycasting against the terrain mesh
  async initializeFromMesh(mesh, resolution = 100) {
    return new Promise(async (resolve) => {
      // Get bounding box
      const box = new THREE.Box3().setFromObject(mesh);
      const size = new THREE.Vector3();
      box.getSize(size);
      
      this.width = resolution;
      this.height = Math.floor(resolution * (size.z / size.x));
      this.cellSize = size.x / this.width;
      
      const totalCells = this.width * this.height;
      this.elevation = new Float32Array(totalCells);
      this.waterLevel = new Float32Array(totalCells);
      this.depth = new Float32Array(totalCells);
      
      const raycaster = new THREE.Raycaster();
      const origin = new THREE.Vector3();
      const direction = new THREE.Vector3(0, -1, 0); // Raycast straight down
      
      // Start raycasting slightly above the bounding box
      const rayY = box.max.y + 100; 

      for (let z = 0; z < this.height; z++) {
        for (let x = 0; x < this.width; x++) {
          const idx = z * this.width + x;
          
          // Map grid coordinates to world coordinates
          const worldX = box.min.x + (x + 0.5) * this.cellSize;
          const worldZ = box.min.z + (z + 0.5) * this.cellSize;
          
          origin.set(worldX, rayY, worldZ);
          raycaster.set(origin, direction);
          
          const intersects = raycaster.intersectObject(mesh, true);
          
          if (intersects.length > 0) {
            this.elevation[idx] = intersects[0].point.y;
          } else {
            // If no intersection, set a high wall so water doesn't flow there
            this.elevation[idx] = box.max.y + 1000; 
          }
          
          this.waterLevel[idx] = this.elevation[idx];
          this.depth[idx] = 0;
        }
        
        // Yield to main thread every few rows to keep UI responsive
        if (z % 10 === 0) {
          await new Promise(r => setTimeout(r, 0));
        }
      }
      
      // Default source to roughly center or highest point
      this.params.sourceX = Math.floor(this.width / 2);
      this.params.sourceY = Math.floor(this.height / 2);
      
      resolve();
    });
  }

  start() {
    this.isRunning = true;
  }

  pause() {
    this.isRunning = false;
  }

  reset() {
    this.isRunning = false;
    this.time = 0;
    this.maxDepth = 0;
    this.floodedArea = 0;
    this.activeCells = [];
    
    const totalCells = this.width * this.height;
    for (let i = 0; i < totalCells; i++) {
      this.waterLevel[i] = this.elevation[i];
      this.depth[i] = 0;
    }
  }

  setParams(newParams) {
    this.params = { ...this.params, ...newParams };
  }

  // Simplified cellular automata for water spreading
  step(dt) {
    if (!this.isRunning) return;

    this.time += dt * this.params.speed;
    
    // 1. Add water at source (Dam Break)
    const sourceIdx = this.params.sourceY * this.width + this.params.sourceX;
    
    // Spread source across breach width
    const halfWidth = Math.floor(this.params.damBreakWidth / 2);
    for (let dy = -halfWidth; dy <= halfWidth; dy++) {
      for (let dx = -halfWidth; dx <= halfWidth; dx++) {
        const sx = this.params.sourceX + dx;
        const sy = this.params.sourceY + dy;
        
        if (sx >= 0 && sx < this.width && sy >= 0 && sy < this.height) {
          const idx = sy * this.width + sx;
          
          // Add water volume if we haven't reached max capacity (simplified)
          const targetLevel = this.elevation[idx] + (this.params.releaseVolume * 2);
          if (this.waterLevel[idx] < targetLevel) {
            this.waterLevel[idx] += this.params.releaseVolume * dt * this.params.speed * 2;
            if (this.depth[idx] === 0) {
              this.activeCells.push(idx);
            }
            this.depth[idx] = this.waterLevel[idx] - this.elevation[idx];
          }
        }
      }
    }

    // 2. Propagate water to neighbors
    const newActiveCells = new Set();
    let currentMaxDepth = 0;
    let currentFloodedArea = 0;

    // We need a copy of the water level to read from while writing to the main array
    const nextWaterLevel = new Float32Array(this.waterLevel);
    
    for (let i = 0; i < this.activeCells.length; i++) {
      const idx = this.activeCells[i];
      const x = idx % this.width;
      const y = Math.floor(idx / this.width);
      
      const currentWL = this.waterLevel[idx];
      if (this.depth[idx] < 0.05) continue; // Skip near-dry cells
      
      currentFloodedArea++;
      if (this.depth[idx] > currentMaxDepth) currentMaxDepth = this.depth[idx];
      newActiveCells.add(idx); // Keep this cell active

      // Check 4 neighbors
      const neighbors = [
        [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          const nIdx = ny * this.width + nx;
          
          // Water flows if there is a height difference
          const nWL = this.waterLevel[nIdx];
          const diff = currentWL - nWL;
          
          if (diff > 0.1) {
            // Transfer a fraction of the difference
            const flow = diff * 0.4 * dt * this.params.speed; 
            
            // Ensure we don't transfer more than we have (above elevation)
            const availableFlow = Math.min(flow, this.depth[idx]);
            
            if (availableFlow > 0.01) {
              nextWaterLevel[idx] -= availableFlow;
              nextWaterLevel[nIdx] += availableFlow;
              newActiveCells.add(nIdx); // Neighbor becomes active
            }
          }
        }
      }
    }

    // Apply changes
    this.activeCells = Array.from(newActiveCells);
    for (let i = 0; i < this.activeCells.length; i++) {
      const idx = this.activeCells[i];
      this.waterLevel[idx] = nextWaterLevel[idx];
      this.depth[idx] = Math.max(0, this.waterLevel[idx] - this.elevation[idx]);
    }
    
    this.maxDepth = currentMaxDepth;
    // Calculate area: assuming each cell is cellSize * cellSize square meters
    this.floodedArea = (currentFloodedArea * this.cellSize * this.cellSize) / 1000000; // in km2
  }
}
