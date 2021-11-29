/*
    This script is intended to implement the game-logic behind Snake.
    Currently, this version just initiates a blank grid and let's the user
    control a snake of length 3. The user can move the snake, which can wrap
    around the ends of the board.
*/

// Define the GridManager object to manage the game grid
const GridManager = {
    context: null,
    gameOver: false,
    blockWidth: null,
    growth: 0,
    /*
    Define game map, which lets us refer to grid locations
    instead of pixels. Intended to be used to keep track of food/other grid items
    */
    map: Array.from(Array(10), _ => Array(10).fill(0)),
    // Function to invoke canvas object and draw snake tile
    drawSnakeBlock: function (y, x) {
        var target = new Point(y, x);
        if (target.equals(snake.head)) {
            const headImg = new Image();
            switch (snake.direction) {
                case Direction.N:
                    headImg.src = "https://i.imgur.com/SzibTAr.png";
                    break;
                case Direction.E:
                    headImg.src = "https://i.imgur.com/aty89Dm.png";
                    break;
                case Direction.S:
                    headImg.src = "https://i.imgur.com/CDPu6N5.png";
                    break;
                case Direction.W:
                    headImg.src = "https://i.imgur.com/FOvnnXO.png";
            }

            this.context.drawImage(headImg, x * this.blockWidth - .5 * this.growth,
                y * this.blockWidth - .5 * this.growth,
                this.blockWidth + this.growth, this.blockWidth + this.growth);
        } else {
            const snakeImg = new Image();
            snakeImg.src = "https://i.imgur.com/8HVeW6i.png";
            this.context.drawImage(snakeImg, x * this.blockWidth - .5 * this.growth,
                y * this.blockWidth - .5 * this.growth,
                this.blockWidth + this.growth, this.blockWidth + this.growth);
        }

    },
    clear: function () {
        this.context.clearRect(0, 0, canvas.width, canvas.height);
    },
    // Remove snake tile as snake moves
    removeBlock: function (y, x, fruit) {
        this.context.fillStyle = 'rgb(255, 255, 255)';
        if (fruit) {
            this.context.clearRect(
                x * this.blockWidth, y * this.blockWidth,
                this.blockWidth, this.blockWidth
            );
        } else {
            switch (snake.direction) {
                case Direction.N:
                case Direction.S:
                    GridManager.clear();
                    for (let i = 0; i < snake.length; i++) {
                        this.drawSnakeBlock(...snake.points[i]);

                    }
                    break;

                case Direction.W:
                case Direction.E:
                    GridManager.clear();
                    for (let i = 0; i < snake.length; i++) {
                        this.drawSnakeBlock(...snake.points[i]);
                    }

                    break;

            }
        }
    },
    // Draw fruit tile
    drawFruitBlock: function (y, x) {

        const fruitImg = new Image();
        fruitImg.src = "https://preview.redd.it/bxcbiiu1wxa71.png?auto=webp&s=709c4efa8fc567e9f16aeda1008ccd5b700c3052";


        this.context.drawImage(fruitImg,
            x * this.blockWidth, y * this.blockWidth,
            this.blockWidth, this.blockWidth
        );
    },
    // Iterate over map elements and draw any non-zero objects
    drawGrid: function () {
        // GridManager.map.forEach(function (row, r) {
        //     row.forEach(function (block, c) {
        //         if (GridManager.map[r][c] !== 0) {
        //             /*
        //             Insert map logic
        //             */
        //         }
        //     });
        // });
        if (!this.gameOver) {
            GridManager.updateGame();
        }
    },
    // Make update to game state
    updateGame: function () {
        const maxIndex = GridManager.map[0].length - 1;

        // Update new head and place it in the current direction
        const oldHead = snake.head;
        var newHead;
        // const newDir = oldHead.direction + snake.direction;
        switch (snake.direction) {
            case Direction.N:
                newHead = new Point(oldHead.y === 0 ? maxIndex : oldHead.y - 1, oldHead.x);
                break;
            case Direction.S:
                newHead = new Point(oldHead.y === maxIndex ? 0 : oldHead.y + 1, oldHead.x);
                break;
            case Direction.W:
                newHead = new Point(oldHead.y, oldHead.x === 0 ? maxIndex : oldHead.x - 1);
                break;
            case Direction.E:
                newHead = new Point(oldHead.y, oldHead.x === maxIndex ? 0 : oldHead.x + 1);
                break;
        }
        newHead.direction = snake.direction.combine(snake.oldDirection);

        // Remove previous tail of snake OR retain with fruit
        if (snake.hasPoint(newHead)) {
            // Collision, end game
            // TODO: game end logic
            this.gameOver = true;
            return;
        }
        snake.points.push(newHead);
        this.drawSnakeBlock(...oldHead);
        if (newHead.equals(fruit)) {
            console.log("ate fruit");
            // Snake head is on a fruit
            this.growth += 5;
            // get rid of fruit immediately
            this.removeBlock(snake.head.y, snake.head.x, true);
            fruit = generateFruit();
            GridManager.drawFruitBlock(...fruit);
        } else {
            GridManager.removeBlock(...snake.points.shift(), false);
            GridManager.drawFruitBlock(...fruit);

        }
        GridManager.drawSnakeBlock(...snake.head);
        GridManager.drawFruitBlock(...fruit);
    }
}

// Manage snake object
var snake = new Snake();

var fruit = generateFruit();

function generateFruit() {
    const maxIndex = GridManager.map.length - 1;
    while (snake.hasPoint(fruit)) {
        // Find a new place for the fruit
        var out = new Point(Math.floor(Math.random() * maxIndex), Math.floor(Math.random() * maxIndex));
    }
    return out;
}

// When page loads, initialize game board
window.onload = function () {
    init();

    // Initialize snake
    snake.points.forEach(block => GridManager.drawSnakeBlock(...block));
    GridManager.drawFruitBlock(...fruit);
}

// Initialize canvas/corresponding attributes for GridManager
function init() {
    window.canvas = document.getElementById('snakeGrid');
    if (window.canvas.getContext) {
        GridManager.context = window.canvas.getContext('2d');
        GridManager.blockWidth = Math.floor(window.canvas.height / 10);


    }
    // Interval time is in ms
    setInterval(GridManager.drawGrid, 180);
}

// Watch for arrow key input to control snake direction
window.addEventListener("keydown", function (event) {
    // Prevent the same event from being handled twice
    if (event.defaultPrevented) {
        return;
    }

    switch (event.key) {
        case "ArrowLeft":
            if (snake.direction !== Direction.E) {
                snake.oldDirection = snake.direction;
                snake.direction = Direction.W;
            }
            break;
        case "ArrowRight":
            if (snake.direction !== Direction.W) {
                snake.oldDirection = snake.direction;
                snake.direction = Direction.E;
            }
            break;
        case "ArrowUp":
            if (snake.direction !== Direction.S) {
                snake.oldDirection = snake.direction;
                snake.direction = Direction.N;
            }
            break;
        case "ArrowDown":
            if (snake.direction !== Direction.N) {
                snake.oldDirection = snake.direction;
                snake.direction = Direction.S;
            }
            break;
    }

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}, true)
