//RAYCASTING

/// Toplam partikül sayısı
const TOTAL = 100;
/// Gen mutasyon oranı
const MUTATION_RATE = 0.05;
/// Partikül ömrü
const LIFESPAN = 50;
/// Sensor mesafesi
const SIGHT = 50;

/// Parkur
let walls = [];
/// Sensor
let ray;
/// Başlangıç ve bitiş noktaları
let start, end;

/// Partikül populasyonu
let population = [];
/// Ölen partiküller
let savedParticles = [];

/// Parkur orta hat koordinatları
let checkpoints = [];
/// Parkur iç hat koordinatları
let inside = [];
/// Parkur dış hat koordinatları
let outside = [];

/// Ekran değer kaydırıcı
let speedSlider;

function buildTrack() {
  /// Parkur koordinatlarını temizle
  checkpoints = [];
  inside = [];
  outside = [];

  /// Parkur distorsiyon oranı (Yüksek parkuru zorlaştırır)
  const noiseMax = 3;
  /// Parkur genişliği (Düşük rakam parkuru zorlaştırır)
  const pathWidth = 50;
  /// Parkur kenar sayısı
  const total = 30;

  /// Her seferinde farklı parkur için random x, y sayıları
  let startX = random(1000);
  let startY = random(1000);

  /// Parkur iç, dış ve orta hat noktalarını oluştur.
  for (let i = 0; i < total; i++) {
    let a = map(i, 0, total, 0, TWO_PI);
    let xoff = map(cos(a), -1, 1, 0, noiseMax) + startX;
    let yoff = map(sin(a), -1, 1, 0, noiseMax) + startY;
    let r = map(noise(xoff, yoff), 0, 1, 100, height / 2);
    let x1 = width / 2 + (r - pathWidth) * cos(a);
    let y1 = height / 2 + (r - pathWidth) * sin(a);
    let x2 = width / 2 + (r + pathWidth) * cos(a);
    let y2 = height / 2 + (r + pathWidth) * sin(a);
    checkpoints.push(new Boundary(x1, y1, x2, y2));
    inside.push(createVector(x1, y1));
    outside.push(createVector(x2, y2));
  }

  /// Parkuru sil ve yeniden oluştur.
  walls = [];
  for (let i = 0; i < checkpoints.length; i++) {
    let a1 = inside[i];
    let b1 = inside[(i + 1) % checkpoints.length];
    walls.push(new Boundary(a1.x, a1.y, b1.x, b1.y));
    let a2 = outside[i];
    let b2 = outside[(i + 1) % checkpoints.length];
    walls.push(new Boundary(a2.x, a2.y, b2.x, b2.y));
  }

  /// Başlangıç ve bitiş noktalarını ayarlar
  start = checkpoints[0].midpoint();
  end = checkpoints[checkpoints.length - 1].midpoint();
}

function setup() {
  createCanvas(800, 800);
  tf.setBackend("cpu");

  /// Parkuru hesapla.
  buildTrack();

  /// Yeni partiküller oluştur.
  for (let i = 0; i < TOTAL; i++) {
    population[i] = particle = new Particle();
  }

  /// Ekran değer kaydırıcıyı ekranda göster
  speedSlider = createSlider(1, 10, 1);
}

function draw() {
  /// Arka planı siyaha boya
  background(0);

  /// Değer kaydırıcı değerini oku
  const cycles = speedSlider.value();

  /// Her bir cycle da kontrolleri yap
  for (let n = 0; n < cycles; n++) {
    for (let particle of population) {
      particle.look(walls);
      particle.check(checkpoints);
      particle.checkBounds();
      particle.update();
      particle.show();
    }

    for (let i = population.length - 1; i >= 0; i--) {
      const particle = population[i];
      if (particle.dead || particle.finished) {
        savedParticles.push(population.splice(i, 1)[0]);
      }
    }

    if (population.length == 0) {
      buildTrack();
      nextGeneration();
    }
  }

  /// Her bir segmenti ekranda göster
  //   for (let cp of checkpoints) {
  //     cp.show();
  //   }

  /// Parkuru ekranda göster
  for (let wall of walls) {
    wall.show();
  }

  /// Parikülleri ekranda göster
  for (let particle of population) {
    particle.show();
  }

  /// Başlanguç ve bitiş noktalarını ekranda göster
  ellipse(start.x, start.y, 10);
  ellipse(end.x, end.y, 10);
}
