/*
    This script is intended to implement the game-logic behind Snake.
    Currently, this version just initiates a blank grid and let's the user
    control a snake of length 3. The user can move the snake, which can wrap
    around the ends of the board.
*/


const gridWidth = 12;
const numObstacles = 8;
let inputProcessed = false;
const initialRefreshTime = 150;
let refreshTime = initialRefreshTime;
let refresh = null;
const initialIncrement = 20;
let increment = initialIncrement;

// Define the GridManager object to manage the game grid
const GridManager = {
    context: null,
    gameOver: false,
    blockWidth: null,
    growth: 0,
    mode: Gamemode.DontStarve,  // TODO: set gamemode based on user selection
    /*
    Define game map, which lets us refer to grid locations
    instead of pixels. Intended to be used to keep track of food/other grid items
    */
    map: Array.from(Array(gridWidth), _ => Array(gridWidth).fill(0)),
    // Function to invoke canvas object and draw snake tile
    drawBlock: function (p) {
        if (!(p instanceof Point)) throw new Error("Not a Point");
        if (p.equals(snake.head)) {
            let headImg;
            switch (snake.direction) {
                case Direction.N:
                    headImg = LoadedImage.HeadNorth;
                    break;
                case Direction.E:
                    headImg = LoadedImage.HeadEast;
                    break;
                case Direction.S:
                    headImg = LoadedImage.HeadSouth;
                    break;
                case Direction.W:
                    headImg = LoadedImage.HeadWest;
                    break;
            }
            this.context.drawImage(headImg.image, p.x * this.blockWidth - .5 * this.growth,
                p.y * this.blockWidth - .5 * this.growth,
                this.blockWidth + this.growth, this.blockWidth + this.growth);
            // TODO: tail sprite
            //  } else if (p.equals(snake.tail)) {
        } else if (p.equals(entities.fruit)) {
            this.context.drawImage(LoadedImage.FruitApple.image,
                p.x * this.blockWidth, p.y * this.blockWidth,
                this.blockWidth, this.blockWidth
            );
        } else if (this.mode === Gamemode.DontStarve && p.equals(entities.slimFruit)) {
            this.context.drawImage(LoadedImage.FruitGreenApple.image,
                p.x * this.blockWidth, p.y * this.blockWidth,
                this.blockWidth, this.blockWidth
            );
        } else {
            // body block
            // TODO: Add directional sprites
            let snakeImg;
            switch (p.drawDirection) {
                case Direction.NS:
                    snakeImg = LoadedImage.BodyNS;
                    break;
                case Direction.EW:
                    snakeImg = LoadedImage.BodyEW;
                    break;
                case Direction.NW:
                    snakeImg = LoadedImage.BodyNW;
                    break;
                case Direction.SW:
                    snakeImg = LoadedImage.BodySW;
                    break;
                case Direction.NE:
                    snakeImg = LoadedImage.BodyNE;
                    break;
                case Direction.SE:
                    snakeImg = LoadedImage.BodySE;
                    break;
            }
            this.context.drawImage(snakeImg.image, p.x * this.blockWidth - .5 * this.growth,
                p.y * this.blockWidth - .5 * this.growth,
                this.blockWidth + this.growth, this.blockWidth + this.growth);
        }

    },
    clear: function () {
        this.context.clearRect(0, 0, canvas.width, canvas.height);
    },
    // Remove snake tile as snake moves
    removeBlock: function (y, x, isFruit) {
        this.context.fillStyle = 'rgb(255, 255, 255)';
        if (isFruit) {
            this.context.clearRect(
                x * this.blockWidth, y * this.blockWidth,
                this.blockWidth, this.blockWidth
            );
        } else {
            GridManager.clear();
            for (let i = 0; i < snake.length; i++) {
                this.drawBlock(snake.points[i]);
            }
            entities.draw();
        }
    },
    // Iterate over map elements and draw any non-zero objects
    drawGrid: function () {
        if (!this.gameOver) {
            GridManager.updateGame();
        }
    },
    // Make update to game state
    updateGame: function () {
        inputProcessed = false;
        if (this.gameOver) return;
        const maxIndex = gridWidth - 1;

        // Update new head and place it in the current direction
        const oldHead = snake.head;
        let newHead;
        switch (snake.direction) {
            case Direction.N:
                // newHead = new Point(oldHead.y === 0 ? maxIndex : oldHead.y - 1, oldHead.x);
                newHead = new Point(oldHead.y - 1, oldHead.x);
                break;
            case Direction.S:
                // newHead = new Point(oldHead.y === maxIndex ? 0 : oldHead.y + 1, oldHead.x);
                newHead = new Point(oldHead.y + 1, oldHead.x);
                break;
            case Direction.W:
                // newHead = new Point(oldHead.y, oldHead.x === 0 ? maxIndex : oldHead.x - 1);
                newHead = new Point(oldHead.y, oldHead.x - 1);
                break;
            case Direction.E:
                // newHead = new Point(oldHead.y, oldHead.x === maxIndex ? 0 : oldHead.x + 1);
                newHead = new Point(oldHead.y, oldHead.x + 1);
                break;
        }
        newHead.direction = snake.direction;
        oldHead.drawDirection = snake.direction.combine(oldHead.direction.opposite);

        // Remove previous tail of snake OR retain with fruit
        if (snake.hasPoint(newHead) || newHead.x < 0 || newHead.x > maxIndex || newHead.y < 0 || newHead.y > maxIndex) {
            // Collision, end game
            GridManager.removeBlock(oldHead.y, oldHead.x, false);
            GridManager.drawBlock(oldHead);
            this.gameOver = true;
            return;
        }
        snake.points.push(newHead);
        this.drawBlock(oldHead);
        if (newHead.equals(entities.fruit)) {
            // Snake head is on a fruit
            this.growth += 2.5;
            increment *= 0.85;
            refreshTime += .5 * increment;
            clearInterval(refresh);
            refresh = setInterval(GridManager.drawGrid, refreshTime);
            // get rid of fruit immediately
            this.removeBlock(snake.head.y, snake.head.x, true);
            this.removeBlock(oldHead.y, oldHead.x, false);
            entities.fruit = generateEntity(entities.slimFruit);
        } else {
            if (this.mode === Gamemode.DontStarve && newHead.equals(entities.slimFruit)) {
                this.growth = Math.max(this.growth - 2.5, 0);
                refreshTime = Math.max(refreshTime - .5 * increment, initialRefreshTime);
                increment = Math.min(increment /= 0.85, initialIncrement);

                clearInterval(refresh);
                refresh = setInterval(GridManager.drawGrid, refreshTime);
                // get rid of fruit immediately
                this.removeBlock(snake.head.y, snake.head.x, true);
                this.removeBlock(oldHead.y, oldHead.x, false);
                entities.slimFruit = generateEntity(entities.fruit);
            }
            GridManager.removeBlock(snake.points.shift(), false);
        }
        console.log(refreshTime);
        GridManager.drawBlock(snake.head);
        GridManager.drawBlock(oldHead);
        entities.draw();
    }
}

// Manage snake object
let snake = new Snake();

// Object containing all non-snake entities
const entities = {
    fruit: null,    // main fruit, always present
    slimFruit: null,            // slimming fruit, Don't Starve exclusive
    obstacles: null,            // obstacles, Obstacle course exclusive
    draw: _ => {
        GridManager.drawBlock(entities.fruit);
        if (GridManager.mode === Gamemode.DontStarve) {
            GridManager.drawBlock(entities.slimFruit);
        } // else if (GridManager.mode === Gamemode.ObstacleCourse) {
        //     for (const obs of this.obstacles) {
        //         GridManager.drawBlock(obs);
        //     }
        // }
    }
}

// Initialize slimFruit and obstacles according to mode
entities.obstacles = {
    points: [],
    hasPoint: function(p) {
        for (const point of this.points) {
            if (point.equals(p)) return true;
        }
        return false;
    }
}
if (GridManager.mode === Gamemode.ObstacleCourse) {
    // TODO: generate obstacles
    for (let i = 0; i < numObstacles; i++) {
        entities.obstacles.points.push(generateEntity());
    }
}
entities.fruit = generateEntity();
if (GridManager.mode === Gamemode.DontStarve) {
    entities.slimFruit = generateEntity(entities.fruit);
}


function generateEntity(exclude = null) {
    const maxIndex = gridWidth - 1;
    let out = snake.points[0];
    while (snake.hasPoint(out) || entities.obstacles.hasPoint(out) || out.equals(exclude)) {
        // Find a new place for the fruit
        out = new Point(Math.floor(Math.random() * maxIndex), Math.floor(Math.random() * maxIndex));
    }
    return out;
}

// When page loads, initialize game board
window.onload = function () {
    init();

    // Initialize snake
    snake.points.forEach(block => GridManager.drawBlock(block));
    entities.draw();
}

// Initialize canvas/corresponding attributes for GridManager
function init() {
    const usernameLabel = document.getElementById('usernameLabel');
    const emailLabel = document.getElementById('emailLabel');

    usernameLabel.innerHTML = "Username: " + localStorage.getItem("username");
    emailLabel.innerHTML = "Email: " + localStorage.getItem("email");
    window.canvas = document.getElementById('snakeGrid');


    if (window.canvas.getContext) {
        GridManager.context = window.canvas.getContext('2d');
        GridManager.blockWidth = Math.floor(window.canvas.height / gridWidth);
    }
    // Interval time is in ms
    refresh = setInterval(GridManager.drawGrid, refreshTime);
}

// Watch for arrow key input to control snake direction
window.addEventListener("keydown", function (event) {
    // Prevent the same event from being handled twice
    if (event.defaultPrevented || inputProcessed) {
        return;
    }
    inputProcessed = true;
    switch (event.key) {
        case "ArrowLeft":
            if (snake.direction !== Direction.E) {
                snake.direction = Direction.W;
            }
            break;
        case "ArrowRight":
            if (snake.direction !== Direction.W) {
                snake.direction = Direction.E;
            }
            break;
        case "ArrowUp":
            if (snake.direction !== Direction.S) {
                snake.direction = Direction.N;
            }
            break;
        case "ArrowDown":
            if (snake.direction !== Direction.N) {
                snake.direction = Direction.S;
            }
            break;
    }

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}, true)
