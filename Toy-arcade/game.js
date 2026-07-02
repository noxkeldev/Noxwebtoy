const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas to fill the screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 2D Rotation Physics Setup
const tank = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 25,
    angle: 0,          // Current direction the tank is facing (in radians)
    speed: 0,
    maxSpeed: 4,
    accel: 0.15,
    friction: 0.08,
    rotSpeed: 0.05     // How fast the tank turns when pressing Left/Right
};

// Track keyboard inputs
const keys = {};
window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

// The Main Game Loop
function gameLoop() {
    updatePhysics();
    renderArena();
    requestAnimationFrame(gameLoop);
}

function updatePhysics() {
    // Rotate left/right using Arrow Keys (or < > keys)
    if (keys["ArrowLeft"] || keys["<"] || keys[","]) {
        tank.angle -= tank.rotSpeed;
    }
    if (keys["ArrowRight"] || keys[">"] || keys["."]) {
        tank.angle += tank.rotSpeed;
    }

    // Drive forward/backward using Up/Down arrows or W/S
    if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
        tank.speed = Math.min(tank.speed + tank.accel, tank.maxSpeed);
    } else if (keys["ArrowDown"] || keys["s"] || keys["S"]) {
        tank.speed = Math.max(tank.speed - tank.accel, -tank.maxSpeed * 0.5);
    } else {
        // Apply friction to smoothly slow down when no keys are pressed
        if (tank.speed > 0) tank.speed = Math.max(0, tank.speed - tank.friction);
        if (tank.speed < 0) tank.speed = Math.min(0, tank.speed + tank.friction);
    }

    // Convert angle and speed into X and Y velocity vectors using Trigonometry
    tank.x += Math.cos(tank.angle) * tank.speed;
    tank.y += Math.sin(tank.angle) * tank.speed;

    // Screen boundary collisions
    if (tank.x < tank.radius) tank.x = tank.radius;
    if (tank.x > canvas.width - tank.radius) tank.x = canvas.width - tank.radius;
    if (tank.y < tank.radius) tank.y = tank.radius;
    if (tank.y > canvas.height - tank.radius) tank.y = canvas.height - tank.radius;
}

function renderArena() {
    // Clear screen for the next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background grid lines for a true .io feel
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Save context state to rotate the tank sprite cleanly
    ctx.save();
    ctx.translate(tank.x, tank.y);
    ctx.rotate(tank.angle);

    // 1. Draw the Barrel/Gun facing forward
    ctx.fillStyle = "#999999";
    ctx.strokeStyle = "#555555";
    ctx.lineWidth = 4;
    ctx.fillRect(0, -10, 40, 20); // Width: 40px, Height: 20px
    ctx.strokeRect(0, -10, 40, 20);

    // 2. Draw the Tank Body (Circle)
    ctx.fillStyle = "#ff4444"; // Classic Red tank
    ctx.beginPath();
    ctx.arc(0, 0, tank.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore(); // Reset rotation/translation for everything else

    // Simple HUD info
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px Arial";
    ctx.fillText("Use LEFT/RIGHT arrows to ROTATE", 20, 30);
    ctx.fillText("Use UP/DOWN arrows to DRIVE", 20, 55);
}

// Start the loop!
gameLoop();
