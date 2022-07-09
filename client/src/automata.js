const __CORNERS = ['tl', 'tr', 'bl', 'br']; 

class Automata {
    /*
    Author: Luis Garcia
    Description: Implements a version of the cellular automata technique where the
    individual units ("cells") are colored line segments drawn along a square grid.

    There are two rules:
    1. the next line segment must be connected to the last
    2. the next line segment drawn in a square has to  
  */

  get position() {
    return [ this.xPos, this.yPos ];
  }

  constructor(configObj, p5Instance) {
    this.setConfigObj(configObj, true);
    this._p5 = p5Instance;

    this._p5.stroke(this._configObj.gridColor);
    this._p5.noFill();

    this.cellWidth = this._configObj.w / this._configObj.resolution;
    this.cellHeight = this._configObj.h / this._configObj.resolution;
    this.cellCR = [Math.floor(this._p5.random(1, this._configObj.resolution - 1)), Math.ceil(this._p5.random(1, this._configObj.resolution - 2))];
    if (this._configObj.drawGrid) {
      this._p5.push();
      this._p5.translate(this._configObj.x, this._configObj.y);
      for (let x = 0; x < this._configObj.w; x += this.cellWidth) {
        for (let y = 0; y < this._configObj.h; y += this.cellHeight) {
          this._p5.rect(x, y, this.cellWidth, this.cellHeight);
        }
      }
      this._p5.pop();
    }

    // other variables
    this.cellToVisitCount = new Map();
    this.cellCorner = 'tl';
    this.xPos = 0;
    this.yPos = 0;

    console.log(this._configObj);
  }

  setConfigObj(configObj, setDefaults = false) {
    if (setDefaults) {
      // set defaults and save
      const x = configObj.x || 0;
      const y = configObj.y || 0;
      const w = configObj.w || 0;
      const h = configObj.h || 0;
      const resolution = configObj.resolution || 50;
      const baseHue = configObj.baseHue || 263;
      const colorSaturation = configObj.colorSaturation || 0;
      const colorLightness = configObj.colorLightness || 0;
      const hueShift = configObj.hueShift || 0;
      const gridColor = configObj.gridColor || 255;
      const drawGrid = configObj.drawGrid;
      const stepsPerFrame = configObj.stepsPerFrame || 1;

      this._configObj = {
        x,
        y,
        w,
        h,
        resolution,
        baseHue,
        colorSaturation,
        colorLightness,
        hueShift,
        gridColor,
        drawGrid,
        stepsPerFrame,
      };
    } else {
      this._configObj = {
        ...this._configObj,
        configObj
      };
    }
  }

  draw() {
    // increment the amount of times drawn in this cell.
    // we want to do this so that we know what color use for the next segment
    this._p5.push();
    this._p5.translate(this._configObj.x, this._configObj.y);

    for (let i = 0; i < this._configObj.stepsPerFrame; i += 1) {
      const cellMapKey = `${this.cellCR.join('')}`;
      if (!this.cellToVisitCount.has(cellMapKey)) {
        this.cellToVisitCount.set(cellMapKey, 0);
      }
      const visitCount = this.cellToVisitCount.get(cellMapKey);
      this.cellToVisitCount.set(cellMapKey, visitCount + 1);
  
      // draw segment
      const nextCorner = this.drawCurve(this.cellCR[0], this.cellCR[1], this.cellCorner);
      // pick the next cell to draw through
      const { chosenNeighbor, startCorner } = this.chooseNeighbor(this.cellCR[0], this.cellCR[1], nextCorner);
  
      // save the next cell and start corner for the next iteration
      this.cellCR = chosenNeighbor;
      this.cellCorner = startCorner;
    }

    this._p5.pop();
  }

    /*
    Draws the next line segment on the grid.
  */
  drawCurve(col, row, lastCorner) {
    const baseHue = this._configObj.baseHue;
    const colorSaturation = this._configObj.colorSaturation;
    const colorLightness = this._configObj.colorLightness;
    const hueShift = this._configObj.hueShift;

    const cellMapKey = `${col}${row}`;
    const cellCount = this.cellToVisitCount.get(cellMapKey);

    const cornerX = lastCorner[1] === 'l' ? 0 : 1;
    const cornerY = lastCorner[0] === 't' ? 0 : 1;

    let nextCorner = this._p5.random(__CORNERS.filter(c => c !== lastCorner));

    let xDirection = 0;
    let yDirection = 0;

    if (nextCorner[1] !== lastCorner[1]) {
      xDirection = nextCorner[1] === 'l' ? -1 : 1;
    } 

    if (nextCorner[0] !== lastCorner[0]) {
      yDirection = nextCorner[0] === 't' ? -1 : 1;
    }

    const x1 = (col + cornerX) * this.cellWidth;
    const y1 = (row + cornerY) * this.cellHeight;

    const x2 = x1 + xDirection * this.cellWidth;
    const y2 = y1 + yDirection * this.cellHeight;

    // if there are line segments in this cell, shift the hue for the color
    let lineHue = baseHue + (hueShift * (cellCount - 1));
    lineHue = lineHue % 360;
    const lineColorHSB = `hsb(${lineHue}, ${colorSaturation}%, ${colorLightness}%)`;
    
    this._p5.strokeWeight(2);
    this._p5.stroke(lineColorHSB);
    this._p5.line(x1, y1, x2, y2);
    
    this.xPos = x2;
    this.yPos = y2;

    return nextCorner;
  }

  chooseNeighbor(col, row, nextCorner) {
    const resolution = this._configObj.resolution;
  
    let xDelta = nextCorner[1] === 'l' ? -1 : 1;
    let yDelta = nextCorner[0] === 't' ? -1 : 1;
  
    let potentialNeighbors = [];
    for (let c = 0; Math.abs(c) <= Math.abs(xDelta); c += Math.sign(xDelta)) {
      for (let r = 0; Math.abs(r) <= Math.abs(yDelta); r += Math.sign(yDelta)) {
        potentialNeighbors.push([c + col, r + row]);
      }
    }
  
    const inBoundsX = (c) => c[0] >= 0 && c[0] < resolution;
    const inBoundsY = (c) => c[1] >= 0 && c[1] < resolution;
  
    potentialNeighbors = potentialNeighbors.filter(n => inBoundsX(n) && inBoundsY(n));
  
    const chosenNeighbor = this._p5.random(potentialNeighbors);
  
    // flip the corners
    let startCorner = [nextCorner[0], nextCorner[1]];
    xDelta = chosenNeighbor[0] - col;
    if (xDelta < 0) {
      startCorner[1] = 'r';
    } else if (xDelta > 0) {
      startCorner[1] = 'l';
    }
  
    yDelta = chosenNeighbor[1] - row;
    if (yDelta < 0) {
      startCorner[0] = 'b';
    } else if (yDelta > 0) {
      startCorner[0] = 't';
    }
  
    startCorner = startCorner.join('');
  
    return { chosenNeighbor, startCorner };
  }
}