/*
  Endless Button v2 (Depth Illusion) - p5.js [sketch2]
  --------------------------------------------------------
  Beginner-friendly sketch:
  - One button starts in the center.
  - Each click pushes the button "deeper" into the screen.
  - Depth is simulated with scale, darker shading, and softer shadow.
*/

// We keep button data in one object for clarity.
const button = {
  x: 0,
  y: 0,
  baseWidth: 180,
  baseHeight: 76,
  pressCount: 0,
  currentDepth: 0,
  targetDepth: 0,
  hoverAmount: 0
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  noStroke();

  // Place the button in the center.
  button.x = width / 2;
  button.y = height / 2;
}

function draw() {
  // Clean minimal background.
  background(246, 248, 252);

  // Smooth animations:
  // - currentDepth follows targetDepth
  // - hoverAmount follows hover state
  button.currentDepth = lerp(button.currentDepth, button.targetDepth, 0.12);

  const hovering = isMouseOverButton();
  button.hoverAmount = lerp(button.hoverAmount, hovering ? 1 : 0, 0.14);

  drawSurfaceGlow();
  drawDepthButton();
  drawInfoText();
}

function mousePressed() {
  if (isMouseOverButton()) {
    button.pressCount++;

    // Increase depth a little on each press.
    // Constrain keeps the value in a useful range.
    button.targetDepth = constrain(button.targetDepth + 0.055, 0, 0.92);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  button.x = width / 2;
  button.y = height / 2;
}

function isMouseOverButton() {
  // As depth increases, the button appears smaller.
  const depthScale = 1 - button.currentDepth * 0.78;
  const hoverScale = 1 + button.hoverAmount * 0.04;

  const w = button.baseWidth * depthScale * hoverScale;
  const h = button.baseHeight * depthScale * hoverScale;

  return (
    mouseX >= button.x - w / 2 &&
    mouseX <= button.x + w / 2 &&
    mouseY >= button.y - h / 2 &&
    mouseY <= button.y + h / 2
  );
}

function drawSurfaceGlow() {
  // A very subtle surface halo to suggest softness around the center.
  const glowSize = 290 + button.currentDepth * 100;
  fill(255, 255, 255, 46);
  ellipse(button.x, button.y + 10, glowSize, glowSize * 0.6);
}

function drawDepthButton() {
  // Depth controls size and darkness.
  const depthScale = 1 - button.currentDepth * 0.78;
  const hoverScale = 1 + button.hoverAmount * 0.04;
  const finalScale = depthScale * hoverScale;

  const w = button.baseWidth * finalScale;
  const h = button.baseHeight * finalScale;
  const r = 20 * finalScale;

  // The "pit" shadow gets stronger/deeper over time.
  const pitAlpha = map(button.currentDepth, 0, 0.92, 22, 105);
  const pitW = button.baseWidth * 1.15;
  const pitH = button.baseHeight * 1.05;
  fill(18, 24, 35, pitAlpha);
  ellipse(button.x, button.y + 6, pitW, pitH);

  // Button color becomes darker as it goes deeper.
  const brightness = map(button.currentDepth, 0, 0.92, 238, 96);
  const tint = map(button.currentDepth, 0, 0.92, 0, 30);

  // Back face (adds thickness illusion).
  fill(brightness - 36, brightness - 34, brightness - 30 + tint, 210);
  rect(button.x, button.y + 5 + button.currentDepth * 8, w, h, r);

  // Top face.
  fill(brightness, brightness + 2, brightness + 8 + tint);
  rect(button.x, button.y, w, h, r);

  // Subtle highlight on top edge.
  fill(255, 255, 255, 70 - button.currentDepth * 45);
  rect(button.x, button.y - h * 0.18, w * 0.86, h * 0.18, r * 0.5);

  // Optional: text fades as button goes deep.
  const labelAlpha = map(button.currentDepth, 0, 0.92, 160, 20);
  fill(24, 30, 44, labelAlpha);
  textAlign(CENTER, CENTER);
  textSize(16 * finalScale + 1);
  text('push', button.x, button.y);
}

function drawInfoText() {
  fill(34, 41, 60, 155);
  textAlign(CENTER, TOP);
  textSize(14);
  text('Clicks: ' + button.pressCount, width / 2, 16);

  fill(34, 41, 60, 120);
  textSize(12);
  text('Jeder Klick drückt den Button tiefer in die Oberfläche.', width / 2, 38);
}
