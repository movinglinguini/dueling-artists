let automataArr = [];

function s(_p5Instance) {
  _p5Instance.createCanvas(input_file.canvas.w, input_file.canvas.h);
  _p5Instance.background(input_file.canvas.background);

  input_file.artists.forEach(config => {
    console.log(config);
    automataArr.push(new Automata({ ...config, stepsPerFrame: input_file.global.stepsPerFrame }, _p5Instance));
  });
}

function d(_p5Instance) {
  for (let i = 0; i < input_file.global.stepsPerFrame; i += 1) {
    automataArr.forEach(automata => automata.draw());
  }
}

const p5InstanceStart = p => {
  p.setup = () => s(p);
  p.draw = () => d(p);
};

new p5(p5InstanceStart);