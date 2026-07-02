const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- WORLD SETTINGS ---
const WORLD_SIZE = 3000; // The map is now 3000x3000px!

// --- TOGGLE STATES ---
let autoSpin = false;
let autoShoot = false;

// --- GAME OBJECTS ---
const tank = {
    x: WORLD_SIZE / 2, // Spawn in the middle of the giant map
    y: WORLD_SIZE / 2,
    radius: 25,
    angle: 0,
    vx: 0,
    vy: 0,
    maxSpeed: 4.5,
    accel: 0.25,
    friction: 0.1,
    rotSpeed: 0.04,
    fireCooldown: 0,
    fireRate: 15 // Frames between shots (~4 shots per second)
};

const bullets = [];
const blocks = [];

// Spawn 60 random shapes across the map at the start
for (let i = 0; i < 60; i++) {
    blocks.push({
        x: Math.random() * (WORLD_SIZE - 60) + 30,
        y: Math.random() * (WORLD_SIZE - 60) + 30,
        size: 30,
        angle: Math.random() * Math.PI
    });
}

// --- INPUT HANDLING ---
const keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    
    // Toggle switches on keypress
    if (e.key === "c" || e.key === "C") autoSpin = !autoSpin;
    if (e.key === "e" || e.key === "E") autoShoot = !autoShoot;
});
window.addEventListener("keyup", (e) => keys[e.key] = false);

// --- MAIN GAME LOOP ---
function gameLoop() {
    updatePhysics();
    renderGame();
    requestAnimationFrame(gameLoop);
}

function updatePhysics() {
    // 1. Handle Barrel Rotation & Auto-Spin
    if (autoSpin) {
        tank.angle += 0.02; // Smoothly spin around
    } else {
        if (keys["ArrowLeft"] || keys["<"] || keys[","]) tank.angle -= tank.rotSpeed;
        if (keys["ArrowRight"] || keys[">"] || keys["."]) tank.angle += tank.rotSpeed;
    }

    // 2. WASD Movement Input Vector
    let moveX = 0, moveY = 0;
    if (keys["w"] || keys["W"]) moveY -= 1;
    if (keys["s"] || keys["S"]) moveY += 1;
    if (keys["a"] || keys["A"]) moveX -= 1;
    if (keys["d"] || keys["D"]) moveX += 1;

    if (moveX !== 0 && moveY !== 0) { moveX *= 0.7071; moveY *= 0.7071; }

    // Accelerate / Friction
    if (moveX !== 0) tank.vx = Math.max(-tank.maxSpeed, Math.min(tank.maxSpeed, tank.vx + moveX * tank.accel));
    else tank.vx *= (1 - tank.friction);

    if (moveY !== 0) tank.vy = Math.max(-tank.maxSpeed, Math.min(tank.maxSpeed, tank.vy + moveY * tank.accel));
    else tank.vy *= (1 - tank.friction);

    tank.x += tank.vx;
    tank.y += tank.vy;

    // World Boundary Collision for Tank
    if (tank.x < tank.radius) { tank.x = tank.radius; tank.vx = 0; }
    if (tank.x > WORLD_SIZE - tank.radius) { tank.x = WORLD_SIZE - tank.radius; tank.vx = 0; }
    if (tank.y < tank.radius) { tank.y = tank.radius; tank.vy = 0; }
    if (tank.y > WORLD_SIZE - tank.radius) { tank.y = WORLD_SIZE - tank.radius; tank.vy = 0; }

    // 3. Shooting Logic (Spacebar OR AutoShoot toggle)
    if (tank.fireCooldown > 0) tank.fireCooldown--;

    if ((keys[" "] || autoShoot) && tank.fireCooldown === 0) {
        // Spawn bullet at muzzle location
        const muzzleDist = 40;
        bullets.push({
            x: tank.x + Math.cos(tank.angle) * muzzleDist,
            y: tank.y + Math.sin(tank.angle) * muzzleDist,
            vx: Math.cos(tank.angle) * 8, // Bullet Speed
            vy: Math.sin(tank.angle) * 8,
            life: 60 // Disappears after 60 frames (1 second)
        });
        tank.fireCooldown = tank.fireRate;
    }

    // Update Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.life--;
        if (b.life <= 0 || b.x < 0 || b.x > WORLD_SIZE || b.y < 0 || b.y > WORLD_SIZE) {
            bullets.splice(i, 1);
        }
    }
}

function renderGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- THE CAMERA SYSTEM ---
    // Shift world rendering coordinates so the tank stays centered on screen
    const camX = canvas.width / 2 - tank.x;
    const camY = canvas.height / 2 - tank.y;

    ctx.save();
    ctx.translate(camX, camY);

    // 1. Draw Map Background Arena Limits
    ctx.fillStyle = "#222222";
    ctx.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);

    // 2. Draw Arena Grid Lines
    ctx.strokeStyle = "#2c2c2c";
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = 0; x <= WORLD_SIZE; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD_SIZE); ctx.stroke();
    }
    for (let y = 0; y <= WORLD_SIZE; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD_SIZE, y); ctx.stroke();
    }

    // 3. Draw Farmable Blocks (Yellow Squares)
    ctx.fillStyle = "#ffe853";
    ctx.strokeStyle = "#bfa71b";
    ctx.lineWidth = 3;
    for (let b of blocks) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);
        ctx.fillRect(-b.size/2, -b.size/2, b.size, b.size);
        ctx.strokeRect(-b.size/2, -b.size/2, b.size, b.size);
        ctx.restore();
    }

    // 4. Draw Bullets
    ctx.fillStyle = "#00b2e1";
    ctx.strokeStyle = "#0080a3";
    ctx.lineWidth = 3;
    for (let b of bullets) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // 5. Draw Player Tank
    ctx.save();
    ctx.translate(tank.x, tank.y);
    
    // Barrel
    ctx.save();
    ctx.rotate(tank.angle);
    ctx.fillStyle = "#999999";
    ctx.strokeStyle = "#555555";
    ctx.lineWidth = 4;
    ctx.fillRect(0, -10, 40, 20);
    ctx.strokeRect(0, -10, 40, 20);
    ctx.restore();

    // Body
    ctx.fillStyle = "#ff4444";
    ctx.strokeStyle = "#b32d2d";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, tank.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore(); // Restore Player
    ctx.restore(); // Restore Camera context

    // --- DRAW HUD STATIC ON SCREEN (Not affected by Camera) ---
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(10, 10, 310, 130);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px Arial";
    ctx.fillText("V0.2 ARENA EXPANSION", 20, 30);
    ctx.font = "12px Arial";
    ctx.fillText("WASD to Move | Arrows to Turn", 20, 55);
    ctx.fillText(`Auto-Spin (C): ${autoSpin ? "ON" : "OFF"}`, 20, 80);
    ctx.fillText(`Auto-Shoot (E): ${autoShoot ? "ON" : "OFF"}`, 20, 105);
    ctx.fillText(`Position: ${Math.round(tank.x)}, ${Math.round(tank.y)}`, 20, 125);
}

// Adjust canvas viewport if browser gets resized
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

gameLoop();


