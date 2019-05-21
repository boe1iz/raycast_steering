/// Bir nokta ile bir çizgi arasındaki mesafeyi hesapla
function plDistance(p1, p2, x, y) {
  const num = abs(
    (p2.y - p1.y) * x - (p2.x - p1.x) * y + p2.x * p1.y - p2.y * p1.x
  );
  const den = p5.Vector.dist(p1, p2);
  return num / den;
}

class Particle {
  constructor(brain) {
    this.dead = false;
    this.finished = false;
    this.fitness = 0;
    this.pos = createVector(start.x, start.y);
    this.vel = createVector();
    this.acc = createVector();
    this.maxspeed = 4;
    this.maxforce = 0.5;
    this.sight = SIGHT;
    this.rays = [];
    this.index = 0;
    this.counter = 0;

    for (let a = -45; a < 45; a += 5) {
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
      this.counter++;
      if (this.counter > LIFESPAN) {
        this.dead = true;
      }
      for (let i = 0; i < this.rays.length; i++) {
        this.rays[i].rotate(this.vel.heading());
      }
    }
  }

  check(checkpoints) {
    if (!this.finished) {
      this.goal = checkpoints[this.index];
      const d = plDistance(this.goal.a, this.goal.b, this.pos.x, this.pos.y);
      if (d < 5) {
        //this.index++;
        this.index = (this.index + 1) % checkpoints.length;
        this.fitness++;
        this.counter = 0;

        //// Parkur tamamlandıysa tüm partikülleri öldür
        // if (this.index == checkpoints.length - 1) {
        //   this.finished = true;
        // }
      }
    }
  }

  mutate() {
    this.brain.mutate(MUTATION_RATE);
  }

  calculateFitness() {
    this.fitness = pow(2, this.fitness);
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

      if (record < 5) {
        this.dead = true;
      }

      inputs[i] = map(record, 0, 50, 1, 0);

      /// Sensorleri en yakın engele göre ekranda göster
      //   if (closest) {
      //     stroke(255);
      //     line(this.pos.x, this.pos.y, closest.x, closest.y);
      //   }
    }

    const output = this.brain.predict(inputs);
    let angle = map(output[0], 0, 1, -PI, PI);
    angle += this.vel.heading();
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

    /// Tüm sensörleri göster
    // for (let ray of this.rays) {
    //   ray.show();
    // }

    /// En yakın segmenti göster
    // if (this.goal) {
    //   this.goal.show();
    // }
  }
}
