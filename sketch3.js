/*
  Endless Button v3 (Spring Depth) - p5.js
  --------------------------------------------------------
  Beginner-friendly idea:
  - One button in the center.
  - Every click pushes it deeper (smaller + darker).
  - Around 30 clicks, stored tension releases and it bounces forward.
*/

const button = {
  x: 0,
  y: 0,
  baseW: 190,
  baseH: 80,

  // Interaction state
  pressCount: 0,
  armedForBounce: false,

  // Depth state (0 = front, bigger means deeper)
  depth: 0,
  depthVelocity: 0,
  targetDepth: 0,

  // Hover animation helper
  hoverAmount: 0
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  noStroke();

  button.x = width / 2;
  button.y = height / 2;
}

function draw() {
  drawBackgroundDepth();

  // Smooth hover animation.
  const hovering = isMouseOverButton();
  button.hoverAmount = lerp(button.hoverAmount, hovering ? 1 : 0, 0.15);

  // Spring physics for depth:
  // force = (target - current) * stiffness
  const stiffness = 0.12;
  const damping = 0.78;
  const force = (button.targetDepth - button.depth) * stiffness;
  button.depthVelocity += force;
  button.depthVelocity *= damping;
  button.depth += button.depthVelocity;

  // When bounce settles, allow the spring event again.
  if (button.armedForBounce && button.depth < 0.03 && abs(button.depthVelocity) < 0.02) {
    button.armedForBounce = false;
  }

  drawSoftPit();
  drawButtonBody();
  drawHUD();
}

function mousePressed() {
  if (!isMouseOverButton()) return;

  button.pressCount++;

  // Push deeper every click (until max depth).
  button.targetDepth = constrain(button.targetDepth + 0.03, 0, 0.95);

  // After about 30 clicks: release spring and bounce back out.
  // We arm once and then trigger one strong forward kick.
  if (button.pressCount >= 30 && !button.armedForBounce) {
    button.armedForBounce = true;

    // Move target to front and add negative velocity for an elastic pop.
    button.targetDepth = 0;
    button.depthVelocity = -0.17;

    // Optional: reset counter so effect can happen again later.
    button.pressCount = 0;
  }

}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  button.x = width / 2;
  button.y = height / 2;
}

function isMouseOverButton() {
  // Deeper = smaller visible button.
  const depthScale = 1 - button.depth * 0.75;
  const hoverScale = 1 + button.hoverAmount * 0.04;
  const w = button.baseW * depthScale * hoverScale;
  const h = button.baseH * depthScale * hoverScale;

  return (
    mouseX >= button.x - w / 2 &&
    mouseX <= button.x + w / 2 &&
    mouseY >= button.y - h / 2 &&
    mouseY <= button.y + h / 2
  );
}

function drawBackgroundDepth() {
  // Layered gradient to make scene feel like a soft 3D surface.
  for (let i = 0; i < height; i += 4) {
    const t = i / height;
    const c = lerpColor(color(238, 242, 250), color(214, 221, 236), t);
    stroke(c);
    line(0, i, width, i);
  }
  noStroke();

  // Soft radial highlight near center for depth cue.
  const glowA = 60;
  for (let r = 300; r > 0; r -= 12) {
    const a = map(r, 300, 0, 0, glowA);
    fill(255, 255, 255, a * 0.25);
    ellipse(button.x, button.y - 20, r * 2.2, r * 1.1);
  }
}

function drawSoftPit() {
  // Pit darkens as button goes deep.
  const pitAlpha = map(button.depth, 0, 0.95, 18, 115);
  const pitW = button.baseW * (1.15 + button.depth * 0.16);
  const pitH = button.baseH * (1.02 + button.depth * 0.26);
  fill(20, 26, 40, pitAlpha);
  ellipse(button.x, button.y + 7 + button.depth * 10, pitW, pitH);
}

function drawButtonBody() {
  const depthScale = 1 - button.depth * 0.75;
  const hoverScale = 1 + button.hoverAmount * 0.04;
  const scaleFinal = depthScale * hoverScale;

  const w = button.baseW * scaleFinal;
  const h = button.baseH * scaleFinal;
  const radius = 22 * scaleFinal;

  // Darker when deeper.
  const topTone = map(button.depth, 0, 0.95, 242, 90);
  const lowTone = map(button.depth, 0, 0.95, 202, 62);

  // Back face for thickness.
  fill(lowTone - 14, lowTone - 10, lowTone + 2, 215);
  rect(button.x, button.y + 7 + button.depth * 9, w, h, radius);

  // Main face.
  fill(topTone, topTone + 3, topTone + 10);
  rect(button.x, button.y, w, h, radius);

  // Top highlight strip.
  fill(255, 255, 255, map(button.depth, 0, 0.95, 78, 16));
  rect(button.x, button.y - h * 0.18, w * 0.86, h * 0.16, radius * 0.6);

  // Label fades a bit when deep.
  fill(25, 32, 48, map(button.depth, 0, 0.95, 170, 34));
  textAlign(CENTER, CENTER);
  textSize(16 * scaleFinal + 1);
  text('push', button.x, button.y);
}

function drawHUD() {
  fill(30, 38, 58, 170);
  textAlign(CENTER, TOP);
  textSize(14);
  text('Clicks: ' + button.pressCount + ' / 30', width / 2, 15);

  fill(30, 38, 58, 125);
  textSize(12);
  text('Klick den Button: tiefer, tiefer... dann springt er elastisch zurück.', width / 2, 36);
}
