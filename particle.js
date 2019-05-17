class Particle {
  constructor(brain) {
    this.dead = false;
    this.finished = false;
    this.fitness = 0;
    this.pos = createVector(start.x, start.y);
    this.vel = createVector();
    this.acc = createVector();
    this.maxspeed = 5;
    this.maxforce = 0.1;
    this.sight = 50;
    this.rays = [];

    for (let a = 0; a < 360; a += 45) {
      this.rays.push(new Ray(this.pos, radians(a)));
    }

    if (brain) {
      this.brain = brain.copy();
    } else {
      this.brain = new NeuralNetwork(this.rays.length, this.rays.length, 1);
    }
  }

  applyForce(force) {
    this.acc.add(force);
  }

  dispose() {
    this.brain.dispose();
  }

  update() {
    if (!this.dead && !this.finished) {
      this.pos.add(this.vel);
      this.vel.add(this.acc);
      this.vel.limit(this.maxspeed);
      this.acc.set(0, 0);
    }
  }

  check(target) {
    const d = p5.Vector.dist(this.pos, target);
    if (d < 10) {
      this.finished = true;
    }
  }

  mutate() {
    this.brain.mutate(MUTATION_RATE);
  }

  calculateFitness(target) {
    if (this.finished) {
      this.fitness = 1;
    } else {
      const d = p5.Vector.dist(this.pos, target);
      this.fitness = constrain(1 / d, 0, 1);
    }
  }

  checkBounds() {
    if (
      this.pos.x < 0 ||
      this.pos.x > width ||
      this.pos.y < 0 ||
      this.pos.y > height
    ) {
      this.dead = true;
    }
  }

  look(walls) {
    const inputs = [];

    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      let closest = null;
      let record = this.sight;
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record && d < this.sight) {
            record = d;
            closest = pt;
          }
        }
      }

      if (record < 2) {
        this.dead = true;
      }

      inputs[i] = map(record, 0, 50, 1, 0);

      if (closest) {
        //stroke(255, 100);
        //line(this.pos.x, this.pos.y, closest.x, closest.y);
      }
    }
    const output = this.brain.predict(inputs);
    const angle = map(output[0], 0, 1, 0, TWO_PI);
    const steering = p5.Vector.fromAngle(angle);
    steering.setMag(this.maxspeed);
    steering.sub(this.vel);
    steering.limit(this.maxforce);
    this.applyForce(steering);
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    const heading = this.vel.heading();
    rotate(heading);
    fill(255, 100);
    rectMode(CENTER);
    rect(0, 0, 10, 5);
    pop();
    for (let ray of this.rays) {
      // ray.show();
    }
  }
}
