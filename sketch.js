/*
  Endless Button (p5.js)
  --------------------------------------------------------
  Beginner-friendly sketch:
  - Starts with one button in the center.
  - Clicking a button creates 2 to 3 more buttons.
  - Every button can create more buttons.
  - Buttons are stored in an array.
*/

let buttons = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  // Start with one button in the center.
  const centerButton = createButtonObject(width / 2, height / 2);
  buttons.push(centerButton);
}

function draw() {
  // Minimal light background.
  background(247, 248, 252);

  // Draw every button in the array.
  for (let i = 0; i < buttons.length; i++) {
    updateAndDrawButton(buttons[i]);
  }

  // Small label so the user knows what to do.
  fill(30, 35, 45, 140);
  textAlign(CENTER, TOP);
  textSize(14);
  text('Click any button to create more', width / 2, 16);
}

function mousePressed() {
  // Check buttons from end to start.
  // This helps when buttons overlap (top-most / newest gets clicked first).
  for (let i = buttons.length - 1; i >= 0; i--) {
    const b = buttons[i];

    if (isMouseOverButton(b)) {
      spawnNewButtonsFrom(b);
      break; // Only trigger one button per click.
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// --------------------------------------------------------
// Button helpers
// --------------------------------------------------------

function createButtonObject(x, y) {
  const size = random(84, 118);

  // Soft color palette with slight variation.
  const hue = random(190, 330);
  const saturation = random(45, 70);
  const lightness = random(50, 67);
  const baseColor = color(`hsl(${hue}, ${saturation}%, ${lightness}%)`);

  return {
    x,
    y,
    size,
    color: baseColor,
    hoverAmount: 0 // 0 = no hover, 1 = fully hovered
  };
}

function updateAndDrawButton(button) {
  const hovered = isMouseOverButton(button);

  // Smooth hover animation by easing hoverAmount.
  if (hovered) {
    button.hoverAmount = lerp(button.hoverAmount, 1, 0.15);
  } else {
    button.hoverAmount = lerp(button.hoverAmount, 0, 0.15);
  }

  const w = button.size * (1 + 0.08 * button.hoverAmount);
  const h = button.size * 0.52 * (1 + 0.08 * button.hoverAmount);
  const roundness = 16 + button.hoverAmount * 4;

  // Create hover tint.
  const drawColor = lerpColor(button.color, color(255), 0.14 * button.hoverAmount);

  // Soft shadow.
  fill(20, 25, 35, 28 + 28 * button.hoverAmount);
  rect(button.x + 3, button.y + 4, w, h, roundness);

  // Main button.
  fill(drawColor);
  rect(button.x, button.y, w, h, roundness);

  // Label text.
  fill(255, 245);
  textAlign(CENTER, CENTER);
  textSize(13 + 1.5 * button.hoverAmount);
  text('click', button.x, button.y + 1);
}

function isMouseOverButton(button) {
  // Use current drawn size so hover area matches animation.
  const currentW = button.size * (1 + 0.08 * button.hoverAmount);
  const currentH = button.size * 0.52 * (1 + 0.08 * button.hoverAmount);

  const left = button.x - currentW / 2;
  const right = button.x + currentW / 2;
  const top = button.y - currentH / 2;
  const bottom = button.y + currentH / 2;

  return mouseX >= left && mouseX <= right && mouseY >= top && mouseY <= bottom;
}

function spawnNewButtonsFrom(parentButton) {
  // Generate 2 or 3 new buttons.
  const amount = floor(random(2, 4));

  for (let i = 0; i < amount; i++) {
    const newButton = createRandomNearbyButton(parentButton);
    buttons.push(newButton);
  }
}

function createRandomNearbyButton(parentButton) {
  // Pick a random angle + distance from the parent button.
  const angle = random(TWO_PI);
  const distance = random(85, 185);

  let x = parentButton.x + cos(angle) * distance;
  let y = parentButton.y + sin(angle) * distance;

  // Keep buttons on screen with some margin.
  x = constrain(x, 60, width - 60);
  y = constrain(y, 48, height - 48);

  return createButtonObject(x, y);
}
