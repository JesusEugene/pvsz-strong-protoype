// wariables
const width = 1000;
const height = 600;
const cellSize = 100;
const cellGap = 3;
const gameGrid = [];
const controlsBar = {
    width: canvas.width,
    height: cellSize,
};
const defenders = [];
const enemies = [];
const projectiles = [];
const resources = [];
const amounts = [20, 30, 40];
let score = 0;
const winningScore = 10;
//mouse
let mouse = {
    x: undefined,
    y: undefined,
    width: 0.1,
    height: 0.1,
};
let numberOfResources = 100;
let canvasPosition;
let frame = 0;
let enemiesInterval = 1020;
let gameOver = false;
class cell {
    /**
     * Конструктор клетки
     * @param  {} x - координата x
     * @param  {} y - координата y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap;
        this.height = cellSize - cellGap;
    }
    update(deltatime) {}
    draw(ctx) {
        if (mouse.x && mouse.y && collision(this, mouse)) {
            ctx.strokeStyle = "black";
            ctx.strokeRect(this.x, this.y, cellSize, cellSize);
        }
    }
}
class Resource {
    /**
     * Конструктор класса ресурсов
     */
    constructor() {
        this.x = Math.random() * (canvas.width - cellSize);
        this.y = canvas.height - cellSize * 4 + Math.random() * cellSize * 2;
        this.width = cellSize * 0.6;
        this.height = cellSize * 0.6;
        this.amount = amounts[Math.floor(Math.random() * amounts.length)];
        this.markedForDeletion = false;
    }
    draw(ctx) {
        ctx.fillStyle = "yellow";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.fillText(this.amount, this.x + 15, this.y + 30);
    }
    update() {
        if (frame % 100 === 0) {
            this.amount++;
        }
    }
}

class Projectile {
    /**
     * конструктор класса снаряда
     * @param  {} x - координата x
     * @param  {} y - координата y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.power = 20;
        this.speed = 4;
    }
    update(deltatime) {
        this.x += this.speed;
    }
    draw(ctx) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Defender {
    /**
     * Конструктор класса защитника
     * @param  {} x - координата x
     * @param  {} y - координата y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.shooting = false;
        this.health = 100;
        this.timer = 0;
    }
    update() {
        this.timer++;
        if (this.shooting && this.timer % 100 === 0) {
            projectiles.push(
                new Projectile(
                    this.x + this.width / 2,
                    this.y + this.height / 2
                )
            );
        }
    }
    draw(ctx) {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "white";
        ctx.font = "30px Bangers";
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    }
}

class Enemy {
    /**
     * Конструктор класса врага
     * @param  {} verticalPosition - вертикальная позиция
     */
    constructor(verticalPosition) {
        this.x = width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random() * 0.2 + 0.4;
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health;
    }
    update() {
        this.x -= this.movement;
    }
    draw(ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "white";
        ctx.font = "30px Bangers";
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    }
}
/**
 * Функция для отрисовки игрового поля
 */
function createGrid() {
    for (let y = cellSize; y < height; y += cellSize) {
        for (let x = 0; x < width; x += cellSize) {
            gameGrid.push(new cell(x, y));
        }
    }
}
function handleGameGrid(ctx) {
    for (let i = 0; i < gameGrid.length; i++) {
        gameGrid[i].draw(ctx);
    }
}

function handleProjectiles(ctx) {
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].update();
        projectiles[i].draw(ctx);
        for (let j = 0; j < enemies.length; j++) {
            if (
                enemies[j] &&
                projectiles[i] &&
                collision(projectiles[i], enemies[j])
            ) {
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
            }
        }
        if (projectiles[i] && projectiles[i].x > width - cellSize) {
            projectiles.splice(i, 1);
            i--;
        }
    }
}

function handleDefender(ctx) {
    for (let i = 0; i < defenders.length; i++) {
        defenders[i].draw(ctx);
        defenders[i].update(ctx);
        // console.log(enemies.find((enemy) => enemy.y === defenders[i].y));
        if (enemies.find((enemy) => enemy.y === defenders[i].y)) {
            defenders[i].shooting = true;
        } else {
            defenders[i].shooting = false;
        }
        for (let j = 0; j < enemies.length; j++) {
            if (defenders[i] && collision(defenders[i], enemies[j])) {
                enemies[j].movement = 0;
                defenders[i].shooting = true;
                defenders[i].health -= 0.2;
            }
            if (defenders[i] && defenders[i].health <= 0) {
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}
function handleEnemies(ctx) {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
        enemies[i].draw(ctx);
        if (enemies[i].x < 0) {
            gameOver = true;
        }
        if (enemies[i].health <= 0) {
            let gainedResources = enemies[i].maxHealth / 10;
            numberOfResources += gainedResources;
            score++;
            enemies.splice(i, 1);
            i--;
        }
    }
    if (frame % enemiesInterval === 0) {
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize;
        enemies.push(new Enemy(verticalPosition));
        if (enemiesInterval >= 100) enemiesInterval -= 25;
    }
}

function handleResources(ctx) {
    if (frame % 300 === 0) {
        resources.push(new Resource());
    }

    for (let i = 0; i < resources.length; i++) {
        resources[i].draw(ctx);
        if (
            resources[i] &&
            mouse.x &&
            mouse.y &&
            collision(resources[i], mouse)
        ) {
            numberOfResources += resources[i].amount;
            resources.splice(i, 1);
            i--;
        }
    }
}

function handleGameStatus(ctx) {
    ctx.fillStyle = "black";
    ctx.font = "30px Bangers";

    ctx.fillText("Resources: " + numberOfResources, 20, 30);
    if (gameOver) {
        ctx.fillStyle = "black";
        ctx.font = "90px Bangers";
        ctx.fillText("GAME OVER", 135, 330);
    }
    ctx.fillText("Score: " + score, 20, 55);
}

function collision(first, second) {
    return (
        first.x < second.x + second.width &&
        first.x + first.width > second.x &&
        first.y < second.y + second.height &&
        first.y + first.height > second.y
    );
}
window.addEventListener("load", () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    canvas.addEventListener("mousemove", function (e) {
        mouse.x =
            (e.clientX - canvasPosition.left) *
            (canvas.width / canvasPosition.width);
        mouse.y =
            (e.clientY - canvasPosition.top) *
            (canvas.height / canvasPosition.height);
    });
    canvas.addEventListener("mouseleave", function () {
        mouse.x = undefined;
        mouse.y = undefined;
    });
    canvas.addEventListener("click", function () {
        const gridPositionX = mouse.x - (mouse.x % cellSize);
        const gridPositionY = mouse.y - (mouse.y % cellSize);
        if (gridPositionY < cellSize) return;
        for (let i = 0; i < defenders.length; i++) {
            if (
                defenders[i].x === gridPositionX &&
                defenders[i].y === gridPositionY
            )
                return;
        }
        let defenderCost = 100;
        if (numberOfResources >= defenderCost) {
            defenders.push(new Defender(gridPositionX, gridPositionY));
            numberOfResources -= defenderCost;
        }
    });
    createGrid();
    var lastTime = 0;
    function animate(timeStamp) {
        ctx.clearRect(0, 0, width, height);
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        canvasPosition = canvas.getBoundingClientRect();

        handleGameGrid(ctx);

        handleDefender(ctx);
        handleProjectiles(ctx);
        handleEnemies(ctx);
        handleResources(ctx);
        handleGameStatus(ctx);
        frame++;
        if (!gameOver) requestAnimationFrame(animate);
    }
    animate(0);
});
