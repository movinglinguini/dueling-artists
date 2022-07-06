let automataArr = [];

function parseAutomataConfig(config) {
  console.log(config);
  const automataConfig = {
    x: config.x,
    y: config.y,
    baseHue: config.baseHue,
    colorSaturation: config.colorSaturation,
    colorLightness: config.colorLightness,
    hueShift: config.hueShift,
    drawGrid: config.drawGrid,
    gridColor: config.gridColor || 'white',
    canvasWidth: config.w,
    canvasHeight: config.h,
  };

  return automataConfig;
}

function s(_p5Instance) {  
  _p5Instance.createCanvas(document.body.clientWidth, document.body.clientHeight);
  _p5Instance.background(0);

  
  input_file.forEach(config => {
    const automataConfig = parseAutomataConfig(config);
    automataArr.push(new Automata(automataConfig, _p5Instance));
  });
}

function d(_p5Instance) {
  automataArr.forEach(automata => automata.draw());
}

const p5InstanceStart = p => {
  p.setup = () => s(p);
  p.draw = () => d(p);
};

new p5(p5InstanceStart);