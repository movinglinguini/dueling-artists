const Automata = window.automata;

function setup() {
  const body = document.body;
  
  createCanvas(body.clientWidth, body.clientHeight);
  background(0);

  Automata.setup();
}

function draw() {
  Automata.draw();
}