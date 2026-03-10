/*
  Endless Button v4 - Pendulum Button (p5.js)
  --------------------------------------------------------
  Beginner-friendly sketch:
  - A round button hangs from a line.
  - Drag it sideways with the mouse.
  - Release it to let physics swing it naturally.
  - Passing through center with enough speed triggers activation.
*/

// Pendulum state in one object for readability.
const pendulum = {
  anchorX: 0,
  anchorY: 70,
  length: 260,

  angle: 0,
  angularVelocity: 0,
  angularAcceleration: 0,

  gravity: 0.75,
  damping: 0.994,

  bobRadius: 44,
  dragging: false,
  dragOffsetAngle: 0,

  // Activation effect values
  activationPulse: 0,
  crossedCenterLastFrame: false
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  pendulum.anchorX = width / 2;
  pendulum.angle = radians(24); // small initial angle
}

function draw() {
  drawBackground();

  // Physics only runs when user is not dragging.
  if (!pendulum.dragging) {
    // Pendulum equation (small to medium angles still looks good visually):
    // angularAcceleration = -g / L * sin(angle)
    pendulum.angularAcceleration = (-pendulum.gravity / pendulum.length) * sin(pendulum.angle);
    pendulum.angularVelocity += pendulum.angularAcceleration;
    pendulum.angularVelocity *= pendulum.damping;
    pendulum.angle += pendulum.angularVelocity;

    detectActivation();
  } else {
    // While dragging, velocity resets for smooth release behavior.
    pendulum.angularVelocity = 0;
  }

  // Fade activation pulse over time.
  pendulum.activationPulse = max(0, pendulum.activationPulse - 0.03);

  drawPendulum();
  drawInfoText();
}

function mousePressed() {
  const bob = getBobPosition();
  const d = dist(mouseX, mouseY, bob.x, bob.y);

  if (d <= pendulum.bobRadius + 8) {
    pendulum.dragging = true;

    // Keep drag smooth by preserving current angle offset.
    const mouseAngle = atan2(mouseX - pendulum.anchorX, mouseY - pendulum.anchorY);
    pendulum.dragOffsetAngle = pendulum.angle - mouseAngle;
  }
}

function mouseDragged() {
  if (!pendulum.dragging) return;

  // Convert mouse position to pendulum angle.
  // Note: we swap x/y in atan2 to measure from vertical axis.
  const mouseAngle = atan2(mouseX - pendulum.anchorX, mouseY - pendulum.anchorY);
  pendulum.angle = mouseAngle + pendulum.dragOffsetAngle;

  // Limit extreme angles so the motion stays realistic.
  pendulum.angle = constrain(pendulum.angle, radians(-85), radians(85));
}

function mouseReleased() {
  pendulum.dragging = false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pendulum.anchorX = width / 2;
}

function getBobPosition() {
  const x = pendulum.anchorX + pendulum.length * sin(pendulum.angle);
  const y = pendulum.anchorY + pendulum.length * cos(pendulum.angle);
  return { x, y };
}

function detectActivation() {
  // Trigger when pendulum crosses center fast enough.
  const nearCenter = abs(pendulum.angle) < radians(2.8);
  const enoughSpeed = abs(pendulum.angularVelocity) > 0.03;
  const crossedCenter = nearCenter && enoughSpeed;

  if (crossedCenter && !pendulum.crossedCenterLastFrame) {
    pendulum.activationPulse = 1;
  }

  pendulum.crossedCenterLastFrame = crossedCenter;
}

function drawBackground() {
  background(242, 246, 252);

  // Soft spotlight in the center to suggest depth.
  for (let r = 360; r > 0; r -= 12) {
    const a = map(r, 360, 0, 0, 52);
    fill(255, 255, 255, a * 0.35);
    ellipse(width / 2, height / 2 + 50, r * 2.2, r * 1.1);
  }
}

function drawPendulum() {
  const bob = getBobPosition();

  // Activation ripple
  if (pendulum.activationPulse > 0) {
    const rippleRadius = 80 + (1 - pendulum.activationPulse) * 170;
    const rippleAlpha = 90 * pendulum.activationPulse;
    noFill();
    stroke(120, 180, 255, rippleAlpha);
    strokeWeight(2.2);
    ellipse(bob.x, bob.y, rippleRadius, rippleRadius);
    noStroke();
  }

  // String shadow
  stroke(30, 40, 55, 30);
  strokeWeight(3);
  line(pendulum.anchorX + 2, pendulum.anchorY + 2, bob.x + 2, bob.y + 2);

  // Main string
  stroke(70, 82, 102, 170);
  strokeWeight(2);
  line(pendulum.anchorX, pendulum.anchorY, bob.x, bob.y);

  // Anchor point
  noStroke();
  fill(78, 90, 112, 180);
  ellipse(pendulum.anchorX, pendulum.anchorY, 9, 9);

  // Bob shadow
  fill(20, 30, 45, 35);
  ellipse(bob.x + 5, bob.y + 8, pendulum.bobRadius * 1.6, pendulum.bobRadius * 1.15);

  // Button color changes briefly on activation.
  const base = color(232, 236, 245);
  const active = color(170, 210, 255);
  const bobColor = lerpColor(base, active, pendulum.activationPulse);

  // Bob body
  fill(170, 176, 190, 90);
  ellipse(bob.x, bob.y + 4, pendulum.bobRadius * 1.75, pendulum.bobRadius * 1.45);

  fill(bobColor);
  stroke(255, 255, 255, 160);
  strokeWeight(1.1);
  ellipse(bob.x, bob.y, pendulum.bobRadius * 2, pendulum.bobRadius * 2);
  noStroke();

  // Top highlight
  fill(255, 255, 255, 120);
  ellipse(bob.x - 11, bob.y - 12, pendulum.bobRadius * 0.85, pendulum.bobRadius * 0.55);

  // Label
  fill(40, 48, 64, 185);
  textAlign(CENTER, CENTER);
  textSize(14);
  text('drag', bob.x, bob.y);
}

function drawInfoText() {
  fill(35, 44, 62, 165);
  textAlign(CENTER, TOP);
  textSize(14);
  text('Drag the pendulum button sideways, then release.', width / 2, 16);

  fill(35, 44, 62, 120);
  textSize(12);
  text('When it swings fast through the center, it activates with a ripple.', width / 2, 38);
}
