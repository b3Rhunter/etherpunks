const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerImgRight = new Image();
playerImgRight.src = './images/hero_right.png';
const playerImgLeft = new Image();
playerImgLeft.src = './images/hero_left.png';
const background = new Image();
background.src = './images/background.png';
const platformImg = new Image();
platformImg.src = './images/platforms.png';
const enemyImg = new Image();
enemyImg.src = './images/enemy.png';
const enemies = [];
const numberOfEnemies = 10;
const playerSpriteSheet = new Image();
playerSpriteSheet.src = './images/hero_spritesheet.png';
for (let i = 0; i < numberOfEnemies; i++) {
    const enemy = {
        x: 300 + i * 250,
        y: 424,
        width: 32,
        height: 48,
        speed: 1,
        direction: 'left'
    };
    enemies.push(enemy);
}
const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
};
const worldWidth = canvas.width * 5;
const worldHeight = canvas.height;
const player = {
    x: 50,
    y: 300,
    width: 32,
    height: 48,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
    speed: 5,
    moving: false,
    direction: 'right'
};
const frameCount = 4;
let currentFrame = 0;
const frameWidth = player.width;
const frameHeight = player.height;
const jumpFrameY = 2 * frameHeight;
const platforms = [
    { x: 0, y: 472, width: 512, height: 40 },
    { x: 200, y: 372, width: 200, height: 20 },
    { x: 400, y: 272, width: 200, height: 20 },
    { x: 600, y: 372, width: 200, height: 20 },
    { x: 800, y: 272, width: 100, height: 20 },
    { x: 1000, y: 372, width: 100, height: 20 },
    { x: 1200, y: 272, width: 100, height: 20 },
    { x: 1400, y: 172, width: 50, height: 20 },
    { x: 1600, y: 372, width: 100, height: 20 },
    { x: 1800, y: 362, width: 200, height: 20 },
    { x: 2000, y: 172, width: 50, height: 20 },
    { x: 2300, y: 372, width: 75, height: 20 },
];
const gravity = 1;
const jumpHeight = 20;
const floor = {
    x: 0,
    y: 472,
    width: 512,
    height: 40
};
function update() {
    const previousPlayerY = player.y;
    if (!player.onGround) {
        player.velocityY += gravity;
    } else {
        player.velocityY = 0;
    }
    player.x += player.velocityX;
    player.y += player.velocityY;
    let onAnyPlatform = false;
    for (const platform of platforms) {
        if (player.x + player.width >= platform.x &&
            player.x <= platform.x + platform.width &&
            previousPlayerY + player.height <= platform.y &&
            player.y + player.height >= platform.y) {
            onAnyPlatform = true;
            player.y = platform.y - player.height;
            player.velocityY = 0;
            break;
        }
    }
    if (!onAnyPlatform) {
        if (player.y + player.height >= floor.y) {
            player.onGround = true;
            player.y = floor.y - player.height;
        } else {
            player.onGround = false;
        }
    } else {
        player.onGround = true;
    }
    for (const enemy of enemies) {
        if (enemy.direction === 'left') {
            enemy.x -= enemy.speed;
            if (enemy.x <= 0) {
                enemy.direction = 'right';
            }
        } else {
            enemy.x += enemy.speed;
            if (enemy.x >= worldWidth - enemy.width) {
                enemy.direction = 'left';
            }
        }
    }
    for (const enemy of enemies) {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            if (previousPlayerY + player.height <= enemy.y) {
                enemies.splice(enemies.indexOf(enemy), 1);
            } else {
                gameOver();
            }
        }
        function gameOver() {
            gameCanvas.style.display = 'none';
            gameOverPage.style.display = 'flex';
        }
    }
    if (player.x >= worldWidth - player.width) {
        gameCanvas.style.display = 'none';
        levelCompletePage.style.display = 'flex';
    }    
    camera.x = player.x - (camera.width / 2);
    camera.y = player.y - (camera.height / 2);
    camera.x = Math.max(0, Math.min(camera.x, worldWidth - camera.width));
    camera.y = Math.max(0, Math.min(camera.y, worldHeight - camera.height));
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, -camera.x, -camera.y, worldWidth, worldHeight);
    ctx.drawImage(
        playerSpriteSheet, 
        player.onGround ? (currentFrame % 2) * frameWidth : (player.direction === 'right' ? 0 : frameWidth), 
        player.onGround ? (player.direction === 'right' ? 0 : frameHeight) : 2 * frameHeight, 
        frameWidth, 
        frameHeight, 
        player.x - camera.x, 
        player.y - camera.y, 
        player.width, 
        player.height
    );
    for (const platform of platforms) {
        ctx.drawImage(platformImg, platform.x - camera.x, platform.y - camera.y, platform.width, platform.height);
    }
    for (const enemy of enemies) {
        ctx.save();
        if (enemy.direction === 'left') {
            ctx.scale(-1, 1);
            ctx.drawImage(enemyImg, -(enemy.x - camera.x) - enemy.width, enemy.y - camera.y, enemy.width, enemy.height);
        } else {
            ctx.drawImage(enemyImg, enemy.x - camera.x, enemy.y - camera.y, enemy.width, enemy.height);
        }
        ctx.restore();
    }
}
let gameLoopId;
function gameLoop() {
    update();
    if (player.moving && gameLoop.counter++ % 10 === 0) {
        currentFrame = (currentFrame + 1) % frameCount;
    }
    draw();
    gameLoopId = requestAnimationFrame(gameLoop);
}
gameLoop.counter = 0;
const gameOverPage = document.querySelector('.game-over-page');
const playAgainButton = document.getElementById('playAgainButton');
playAgainButton.addEventListener('click', () => {
    gameOverPage.style.display = 'none';
    gameCanvas.style.display = 'block';
    startGame();
});
const levelCompletePage = document.querySelector('.level-complete-page');
const nextLevelButton = document.getElementById('nextLevelButton');
nextLevelButton.addEventListener('click', () => {
    levelCompletePage.style.display = 'none';
    gameCanvas.style.display = 'block';
    startGame();
});
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && player.onGround) {
        player.velocityY = -jumpHeight;
        player.onGround = false;
    }
    if (event.code === 'ArrowLeft') {
        player.velocityX = -player.speed;
        player.direction = 'left';
    }
    if (event.code === 'ArrowRight') {
        player.velocityX = player.speed;
        player.direction = 'right';
    }
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
        player.moving = true;
    }
});
document.addEventListener('keyup', (event) => {
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
        player.velocityX = 0;
    }
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
        player.moving = false;
    }
});
