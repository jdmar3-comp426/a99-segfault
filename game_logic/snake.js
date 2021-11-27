/*
    This script is intended to implement the game-logic behind Snake.
    Currently, this version just initiates a blank grid and let's the user
    control a snake of length 3. The user can move the snake, which can wrap
    around the ends of the board.
*/

// Define the GridManager object to manage the game grid
const GridManager = {
    context: null,
    blockWidth: null,
    blockHeight: null,
    /*
    Define game map, which lets us refer to grid locations
    instead of pixels. Intended to be used to keep track of food/other grid items
    */
    map: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
    // Function to invoke canvas object and draw snake tile
    drawSnakeBlock: function(y, x) {
        this.context.fillStyle = 'rgb(200, 0, 0)';
        this.context.fillRect(
            x*this.blockWidth, y*this.blockWidth, 
            this.blockWidth, this.blockWidth
        );
    },
    // Remove snake tile as snake moves
    removeSnakeBlock: function(y, x) {
        this.context.fillStyle = 'rgb(255, 255, 255)';
        this.context.fillRect(
            x*this.blockWidth, y*this.blockWidth, 
            this.blockWidth, this.blockWidth
        );
    },
    // Iterate over map elements and draw any non-zero objects
    drawGrid: function() {
        GridManager.map.forEach(function(row, r) {
            row.forEach(function(block, c) {
                if (GridManager.map[r][c] !== 0) {
                    /*
                    Insert map logic
                    */
                }
            });
        });
        GridManager.updateGame();
    },
    // Make update to game state
    updateGame: function() {
        // Remove previous tail of snake
        GridManager.removeSnakeBlock(...snake.points.shift());

        // Update new head of snake
        const oldHead = snake.getHead();
        const maxWidth = GridManager.map[0].length - 1;
        // Place new head in the current direction
        switch (snake.direction) {
            case "left":
                snake.points.push([oldHead[0], oldHead[1] === 0 ? maxWidth : oldHead[1]-1]);
                break;
            case "right":
                snake.points.push([oldHead[0], oldHead[1] === maxWidth ? 0 : oldHead[1]+1]);
                break;
            case "up":
                snake.points.push([oldHead[0] === 0 ? maxWidth : oldHead[0]-1, oldHead[1]]);
                break;
            case "down":
                snake.points.push([oldHead[0] === maxWidth ? 0 : oldHead[0]+1, oldHead[1]]);
                break;
        }
        GridManager.drawSnakeBlock(...snake.getHead());
    }
}

// Manage snake object
var snake = {
    // Keep track of snake as array of points
    points: [[0, 0], [0, 1], [0, 2]], // points are stored as (y, x) pairs with index 0 as the tail
    direction: "right",
    getHead: function() { return this.points[this.points.length-1] }
}

// When page loads, initialize game board
window.onload = function() {
    init();

    // Initialize snake
    snake.points.forEach(block => GridManager.drawSnakeBlock(block[1], block[0]));
}

// Initialize canvas/corresponding attributes for GridManager
function init() {
    window.canvas = document.getElementById('snakeGrid');
    if (window.canvas.getContext) {
        GridManager.context = window.canvas.getContext('2d');
        GridManager.blockWidth = Math.floor(window.canvas.width/10);
        GridManager.blockHeight = Math.floor(window.canvas.height/10);
    }
    // Interval time is in ms
    setInterval(GridManager.drawGrid, 100);
}

// Watch for arrow key input to control snake direction
window.addEventListener("keydown", function(event) {
    // Prevent the same event from being handled twice
    if (event.defaultPrevented) {
        return;
    }

    switch (event.key) {
        case "ArrowLeft":
            if (snake.direction != "right") {
                snake.direction = "left";
            }
            break;
        case "ArrowRight":
            if (snake.direction != "left") {
                snake.direction = "right";
            }
            break;
        case "ArrowUp":
            if (snake.direction != "down") {
                snake.direction = "up";
            }
            break;
        case "ArrowDown":
            if (snake.direction != "up") {
                snake.direction = "down";
            }
            break;
    }

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}, true)
