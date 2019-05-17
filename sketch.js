//RAYCASTING

const TOTAL = 200;
const MUTATION_RATE = 0.05;
let walls = [];
let ray;
let start, end;

let population = [];
let savedParticles = [];

let speedSlider;

function setup() {
  createCanvas(400, 400);
  tf.setBackend("cpu");

  walls.push(new Boundary(50, 399, 100, 399));

  walls.push(new Boundary(50, 400, 50, 200));
  walls.push(new Boundary(50, 200, 150, 50));
  walls.push(new Boundary(150, 50, 400, 50));

  walls.push(new Boundary(100, 400, 100, 200));
  walls.push(new Boundary(100, 200, 175, 100));
  walls.push(new Boundary(175, 100, 400, 100));

  walls.push(new Boundary(399, 50, 399, 100));

  start = createVector(75, 350);
  end = createVector(350, 75);

  for (let i = 0; i < TOTAL; i++) {
    population[i] = particle = new Particle();
  }

  speedSlider = createSlider(1, 10, 1);
}

function draw() {
  const cycles = speedSlider.value();

  for (let n = 0; n < cycles; n++) {
    for (let particle of population) {
      particle.look(walls);
      particle.checkBounds();
      particle.check(end);
      particle.update();
    }

    for (let i = population.length - 1; i >= 0; i--) {
      const particle = population[i];
      if (particle.dead || particle.finished) {
        savedParticles.push(population.splice(i, 1)[0]);
      }
    }

    if (population.length == 0) {
      nextGeneration();
    }
  }

  background(0);

  for (let wall of walls) {
    wall.show();
  }

  for (let particle of population) {
    particle.show();
  }

  //ellipse(start.x, start.y, 10);
  ellipse(end.x, end.y, 10);
}
