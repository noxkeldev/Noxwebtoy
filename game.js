const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas to fill the screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Tank Setup
const tank = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 25,
    angle: 0,          // Barrel rotation angle (controlled ONLY by arrows)
    vx: 0,             // Velocity X
    vy: 0,             // Velocity Y
    maxSpeed: 4,
    accel: 0.2,
    friction: 0.1,
    rotSpeed: 0.05     // How fast the barrel turns
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
    // 1. BARREL ROTATION (Only changes where you look, doesn't move you)
    if (keys["ArrowLeft"] || keys["<"] || keys[","]) {
        tank.angle -= tank.rotSpeed;
    }
    if (keys["ArrowRight"] || keys[">"] || keys["."]) {
        tank.angle += tank.rotSpeed;
    }

    // 2. 2D GRID MOVEMENT (W, A, S, D moves you globally)
    let moveX = 0;
    let moveY = 0;

    if (keys["w"] || keys["W"]) moveY -= 1; // Move Up
    if (keys["s"] || keys["S"]) moveY += 1; // Move Down
    if (keys["a"] || keys["A"]) moveX -= 1; // Move Left
    if (keys["d"] || keys["D"]) moveX += 1; // Move Right

    // If moving diagonally, normalize vector so you don't go super fast
    if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.7071;
        moveY *= 0.7071;
    }

    // Apply acceleration based on input
    if (moveX !== 0) {
        tank.vx = Math.max(-tank.maxSpeed, Math.min(tank.maxSpeed, tank.vx + moveX * tank.accel));
    } else {
        // Apply friction to X if not pressing A/D
        if (tank.vx > 0) tank.vx = Math.max(0, tank.vx - tank.friction);
        if (tank.vx < 0) tank.vx = Math.min(0, tank.vx + tank.friction);
    }

    if (moveY !== 0) {
        tank.vy = Math.max(-tank.maxSpeed, Math.min(tank.maxSpeed, tank.vy + moveY * tank.accel));
    } else {
        // Apply friction to Y if not pressing W/S
        if (tank.vy > 0) tank.vy = Math.max(0, tank.vy - tank.friction);
        if (tank.vy < 0) tank.vy = Math.min(0, tank.vy + tank.friction);
    }

    // Update positions
    tank.x += tank.vx;
    tank.y += tank.vy;

    // Screen boundary collisions
    if (tank.x < tank.radius) { tank.x = tank.radius; tank.vx = 0; }
    if (tank.x > canvas.width - tank.radius) { tank.x = canvas.width - tank.radius; tank.vx = 0; }
    if (tank.y < tank.radius) { tank.y = tank.radius; tank.vy = 0; }
    if (tank.y > canvas.height - tank.radius) { tank.y = canvas.height - tank.radius; tank.vy = 0; }
}

function renderArena() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background grid lines
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Save context to draw tank components
    ctx.save();
    ctx.translate(tank.x, tank.y);

    // 1. Draw the Barrel (Rotates based on tank.angle)
    ctx.save();
    ctx.rotate(tank.angle);
    ctx.fillStyle = "#999999";
    ctx.strokeStyle = "#555555";
    ctx.lineWidth = 4;
    ctx.fillRect(0, -10, 40, 20);
    ctx.strokeRect(0, -10, 40, 20);
    ctx.restore();

    // 2. Draw the Tank Body (Stays as a solid circle base)
    ctx.fillStyle = "#ff4444";
    ctx.beginPath();
    ctx.arc(0, 0, tank.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // HUD Info
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px Arial";
    ctx.fillText("Use W, A, S, D to MOVE globally", 20, 30);
    ctx.fillText("Use LEFT/RIGHT arrows to ROTATE barrel", 20, 55);
}

gameLoop();
