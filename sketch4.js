/*
  Endless Button v4 - Fast Pendulum Button (p5.js)
  --------------------------------------------------------
  Beginner-friendly sketch:
  - A round button swings quickly like a pendulum.
  - You must catch/hit the moving button with a click.
  - On successful click: confetti appears.
*/

const pendulum = {
  anchorX: 0,
  anchorY: 74,
  length: 270,

  angle: 0,
  angularVelocity: 0.14,
  angularAcceleration: 0,

  gravity: 1.05,
  damping: 0.997,

  bobRadius: 42,
  activationPulse: 0
};

// Small particles for confetti effect.
let confetti = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pendulum.anchorX = width / 2;

  // Start slightly off-center so motion begins immediately.
  pendulum.angle = radians(22);
}

function draw() {
  drawBackground();

  updatePendulumPhysics();

  // Activation glow fades over time.
  pendulum.activationPulse = max(0, pendulum.activationPulse - 0.028);

  drawPendulum();
  updateAndDrawConfetti();
  drawInfoText();
}

function updatePendulumPhysics() {
  // Classic pendulum equation.
  pendulum.angularAcceleration = (-pendulum.gravity / pendulum.length) * sin(pendulum.angle);
  pendulum.angularVelocity += pendulum.angularAcceleration;

  // Keep swing lively/fast by lightly enforcing minimum momentum.
  const minSpeed = 0.055;
  const direction = pendulum.angularVelocity === 0 ? 1 : Math.sign(pendulum.angularVelocity);
  if (abs(pendulum.angularVelocity) < minSpeed) {
    pendulum.angularVelocity = minSpeed * direction;
  }

  pendulum.angularVelocity *= pendulum.damping;
  pendulum.angle += pendulum.angularVelocity;
}

function mousePressed() {
  const bob = getBobPosition();
  const hitDistance = dist(mouseX, mouseY, bob.x, bob.y);

  // User must catch the moving button.
  if (hitDistance <= pendulum.bobRadius) {
    triggerConfetti(bob.x, bob.y);
  }
}

function triggerConfetti(x, y) {
  pendulum.activationPulse = 1;

  // Create colorful particles bursting outward.
  const burstAmount = 54;
  for (let i = 0; i < burstAmount; i++) {
    const angle = random(TWO_PI);
    const speed = random(2.2, 7.2);

    confetti.push({
      x,
      y,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed - random(0.5, 2.6),
      size: random(4, 9),
      life: 1,
      gravity: random(0.05, 0.14),
      spin: random(-0.2, 0.2),
      rotation: random(TWO_PI),
      color: color(random(80, 255), random(80, 255), random(80, 255))
    });
  }
}

function updateAndDrawConfetti() {
  for (let i = confetti.length - 1; i >= 0; i--) {
    const p = confetti[i];

    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.spin;
    p.life -= 0.017;

    push();
    translate(p.x, p.y);
    rotate(p.rotation);
    fill(red(p.color), green(p.color), blue(p.color), 255 * max(0, p.life));
    noStroke();
    rectMode(CENTER);
    rect(0, 0, p.size, p.size * 0.6, 1.5);
    pop();

    if (p.life <= 0 || p.y > height + 40) {
      confetti.splice(i, 1);
    }
  }
}

function getBobPosition() {
  const x = pendulum.anchorX + pendulum.length * sin(pendulum.angle);
  const y = pendulum.anchorY + pendulum.length * cos(pendulum.angle);
  return { x, y };
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pendulum.anchorX = width / 2;
}

function drawBackground() {
  background(242, 246, 252);

  // Soft center gradient for depth feeling.
  for (let r = 380; r > 0; r -= 14) {
    const a = map(r, 380, 0, 0, 56);
    fill(255, 255, 255, a * 0.34);
    ellipse(width / 2, height / 2 + 60, r * 2.2, r * 1.05);
  }
}

function drawPendulum() {
  const bob = getBobPosition();

  // Activation ripple/glow when clicked successfully.
  if (pendulum.activationPulse > 0) {
    const rippleRadius = 88 + (1 - pendulum.activationPulse) * 165;
    const rippleAlpha = 96 * pendulum.activationPulse;
    noFill();
    stroke(124, 196, 255, rippleAlpha);
    strokeWeight(2.3);
    ellipse(bob.x, bob.y, rippleRadius, rippleRadius);
    noStroke();
  }

  // String shadow and line.
  stroke(30, 40, 58, 32);
  strokeWeight(3);
  line(pendulum.anchorX + 2, pendulum.anchorY + 2, bob.x + 2, bob.y + 2);

  stroke(70, 84, 108, 180);
  strokeWeight(2);
  line(pendulum.anchorX, pendulum.anchorY, bob.x, bob.y);

  // Anchor.
  noStroke();
  fill(80, 94, 118, 190);
  ellipse(pendulum.anchorX, pendulum.anchorY, 10, 10);

  // Bob shadow.
  fill(22, 32, 48, 34);
  ellipse(bob.x + 5, bob.y + 8, pendulum.bobRadius * 1.68, pendulum.bobRadius * 1.2);

  // Bob color briefly turns "active" when hit.
  const base = color(232, 237, 246);
  const active = color(140, 214, 255);
  const bobColor = lerpColor(base, active, pendulum.activationPulse);

  fill(170, 178, 193, 90);
  ellipse(bob.x, bob.y + 4, pendulum.bobRadius * 1.78, pendulum.bobRadius * 1.45);

  fill(bobColor);
  stroke(255, 255, 255, 168);
  strokeWeight(1.1);
  ellipse(bob.x, bob.y, pendulum.bobRadius * 2, pendulum.bobRadius * 2);
  noStroke();

  fill(255, 255, 255, 124);
  ellipse(bob.x - 10, bob.y - 12, pendulum.bobRadius * 0.88, pendulum.bobRadius * 0.56);

  fill(38, 48, 66, 190);
  textAlign(CENTER, CENTER);
  textSize(14);
  text('HIT', bob.x, bob.y);
}

function drawInfoText() {
  fill(35, 44, 62, 168);
  textAlign(CENTER, TOP);
  textSize(14);
  text('Catch the fast pendulum button and click it.', width / 2, 16);

  fill(35, 44, 62, 120);
  textSize(12);
  text('Treffer = Konfetti ✨', width / 2, 38);
}
