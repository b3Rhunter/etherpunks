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
const numberOfEnemies = 10;
const playerSpriteSheet = new Image();
playerSpriteSheet.src = './images/hero_spritesheet.png';
const fireballImg = new Image();
fireballImg.src = './images/fireball.png';
class GameObject {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}
class Player extends GameObject {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
        this.speed = 5;
        this.moving = false;
        this.direction = 'right';
        this.lastFireballTime = 0;
        this.fireballCooldown = 500;
    }
}
class Enemy extends GameObject {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.speed = 1;
        this.direction = 'left';
        this.hitCount = 0; 
    }
}
class Fireball extends GameObject {
    constructor(x, y, width, height, direction) {
        super(x, y, width, height);
        this.velocityX = direction === 'right' ? fireballSpeed : -fireballSpeed;
        this.velocityY = fireballSpeed / 2;
        this.rotation = 0;
    }
}
class Platform extends GameObject {
    constructor(x, y, width, height) {
        super(x, y, width, height);
    }
}
const player = new Player(50, 300, 32, 48);
const enemies = Array.from({length: numberOfEnemies}, (_, i) => new Enemy(300 + i * 250, 424, 32, 48));
const fireballs = [];
const platforms = [
    new Platform(200, 372, 200, 20),
    new Platform(400, 272, 200, 20),
    new Platform(600, 372, 200, 20),
    new Platform(800, 272, 200, 20),
    new Platform(1000, 372, 100, 20),
    new Platform(1200, 272, 100, 20),
    new Platform(1400, 172, 50, 20),
    new Platform(1600, 372, 100, 20),
    new Platform(1800, 362, 200, 20),
    new Platform(2000, 172, 50, 20),
    new Platform(2300, 372, 75, 20),
];
const keys = {
    Space: false,
    ArrowLeft: false,
    ArrowRight: false,
    KeyF: false
  };
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
const fireballSpeed = 7;
const frameCount = 4;
let currentFrame = 0;
const frameWidth = player.width;
const frameHeight = player.height;
const jumpFrameY = 2 * frameHeight;
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
    for (const fireball of fireballs) {
        fireball.x += fireball.velocityX;
        fireball.y += fireball.velocityY;
        fireball.rotation += 0.05;
        if (fireball.y + fireball.height >= floor.y) {
            fireball.velocityY = -fireball.velocityY * 0.8; // Reduce the velocityY by 20% each time the fireball hits the ground
            fireball.y = floor.y - fireball.height;  // Prevent the fireball from going below the ground
        }
        if (fireball.y <= 0 || fireball.y + fireball.height >= canvas.height) {
            fireball.velocityY = -fireball.velocityY;
        }
        for (const platform of platforms) {
            if (fireball.x + fireball.width >= platform.x &&
                fireball.x <= platform.x + platform.width &&
                fireball.y + fireball.height >= platform.y &&
                fireball.y <= platform.y + platform.height) {
                fireball.velocityY = -fireball.velocityY;
                break;
            }
        }
        for (const enemy of enemies) {
            if (fireball.x < enemy.x + enemy.width &&
                fireball.x + fireball.width > enemy.x &&
                fireball.y < enemy.y + enemy.height &&
                fireball.y + fireball.height > enemy.y) {
                enemies.splice(enemies.indexOf(enemy), 1);
                fireballs.splice(fireballs.indexOf(fireball), 1);
                break;
            }
        }

        if (fireball.x < player.x + player.width &&
            fireball.x + fireball.width > player.x &&
    fireball.y < player.y + player.height &&
    fireball.y + fireball.height > player.y) {
    gameOver();
    break;
    }
    }
    if (keys.ArrowLeft) {
        player.velocityX = -player.speed;
        player.direction = 'left';
        player.moving = true;
      } else if (keys.ArrowRight) {
        player.velocityX = player.speed;
        player.direction = 'right';
        player.moving = true;
      } else {
        player.velocityX = 0;
        player.moving = false;
      }
    
      if (keys.Space && player.onGround) {
        player.velocityY = -jumpHeight;
        player.onGround = false;
      }
      const currentTime = Date.now();
      if (keys.KeyF && currentTime - player.lastFireballTime >= player.fireballCooldown) {
        const fireball = new Fireball(
            player.direction === 'right' ? player.x + player.width : player.x - 15,
            player.y + player.height / 2,
            15,
            15,
            player.direction
        );
        fireballs.push(fireball);
        player.lastFireballTime = currentTime;
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
    for (const fireball of fireballs) {
        ctx.fillStyle = 'red'; // Set the fill style to red
        ctx.save();  // Save the current state of the context
        ctx.translate(fireball.x - camera.x + fireball.width / 2, fireball.y - camera.y + fireball.height / 2);  // Move the context to the center of the fireball
        ctx.rotate(fireball.rotation);  // Rotate the context
        ctx.drawImage(fireballImg, -fireball.width / 2, -fireball.height / 2, fireball.width, fireball.height);
        ctx.restore();
    }    
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
    if (event.code in keys) {
      keys[event.code] = true;
    }
  });
  
  document.addEventListener('keyup', (event) => {
    if (event.code in keys) {
      keys[event.code] = false;
    }
  });
  
