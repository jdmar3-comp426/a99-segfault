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
let progress = null;
const initialIncrement = 20;
let increment = initialIncrement;

// Define the GridManager object to manage the game grid
const GridManager = {
    context: null,
    gameOver: false,
    isPaused: false,
    blockWidth: null,
    growth: 0,
    mode: localStorage.getItem("mode") === "Don't Starve" ? Gamemode.DontStarve : Gamemode.ObstacleCourse,
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
        } else if (this.mode === Gamemode.ObstacleCourse && entities.obstacles.hasPoint(p)) {
            this.context.drawImage(LoadedImage.TrafficCone.image,
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
        if (!this.gameOver && !this.isPaused) {
            GridManager.updateGame();
        }
    },
    // Make update to game state
    updateGame: function () {
        if (this.gameOver || this.isPaused) return;
        inputProcessed = false;
        const maxIndex = gridWidth - 1;

        // Update new head and place it in the current direction
        const oldHead = snake.head;
        let newHead;
        switch (snake.direction) {
            case Direction.N:
                newHead = new Point(oldHead.y - 1, oldHead.x);
                break;
            case Direction.S:
                newHead = new Point(oldHead.y + 1, oldHead.x);
                break;
            case Direction.W:
                newHead = new Point(oldHead.y, oldHead.x - 1);
                break;
            case Direction.E:
                newHead = new Point(oldHead.y, oldHead.x + 1);
                break;
        }
        newHead.direction = snake.direction;
        oldHead.drawDirection = snake.direction.combine(oldHead.direction.opposite);

        // Remove previous tail of snake OR retain with fruit
        if (snake.hasPoint(newHead) || (this.mode === Gamemode.ObstacleCourse && entities.obstacles.hasPoint(newHead)) ||
            newHead.x < 0 || newHead.x > maxIndex || newHead.y < 0 || newHead.y > maxIndex) {
            // Collision, end game
            GridManager.removeBlock(oldHead.y, oldHead.x, false);
            GridManager.drawBlock(oldHead);
            endGame();
            return;
        }
        snake.points.push(newHead);
        this.drawBlock(oldHead);
        if (this.mode === Gamemode.DontStarve) {
            if (newHead.equals(entities.fruit)) {
                // Snake head is on a fruit
                this.growth += 2.5;
                increment *= 0.85;
                refreshTime += .5 * increment;
                document.getElementById('currentScore').innerHTML = "" + (parseInt(document.getElementById('currentScore').innerHTML) + 1);

                clearInterval(refresh);
                refresh = setInterval(GridManager.drawGrid, refreshTime);
                // get rid of fruit immediately
                this.removeBlock(snake.head.y, snake.head.x, true);
                this.removeBlock(oldHead.y, oldHead.x, false);
                entities.fruit = generateEntity(entities.slimFruit);

                // Update timer
                document.getElementById('progressBar').value += 5;
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
        } else {
            if (newHead.equals(entities.fruit)) {
                // Snake head is on a fruit
                document.getElementById('currentScore').innerHTML = "" + (parseInt(document.getElementById('currentScore').innerHTML) + 1);

                clearInterval(refresh);
                refresh = setInterval(GridManager.drawGrid, refreshTime);
                // get rid of fruit immediately
                this.removeBlock(snake.head.y, snake.head.x, true);
                this.removeBlock(oldHead.y, oldHead.x, false);
                entities.fruit = generateEntity();
            } else {
                GridManager.removeBlock(snake.points.shift(), false);
            }
        }
        GridManager.drawBlock(snake.head);
        GridManager.drawBlock(oldHead);
        entities.draw();
    }
}

// Manage snake object
let snake = new Snake();

// Object containing all non-snake entities
const entities = {
    fruit: null,                // main fruit, always present
    slimFruit: null,            // slimming fruit, Don't Starve exclusive
    obstacles: {                // obstacles, Obstacle course exclusive
        points: [],
        hasPoint: function (p) {
            for (const point of this.points) {
                if (point.equals(p)) return true;
            }
            return false;
        }
    },
    draw: _ => {
        GridManager.drawBlock(entities.fruit);
        if (GridManager.mode === Gamemode.DontStarve) {
            GridManager.drawBlock(entities.slimFruit);
        } else if (GridManager.mode === Gamemode.ObstacleCourse) {
            for (const obs of entities.obstacles.points) {
                GridManager.drawBlock(obs);
            }
        }
    }
}

entities.init = _ => {
    entities.obstacles.points = []
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
window.onload = init;

// Initialize canvas/corresponding attributes for GridManager
function init() {

    const usernameLabel = document.getElementById('usernameLabel');
    const emailLabel = document.getElementById('emailLabel');
    const highestScoreLabel = document.getElementById('userStandardScore');

    if (document.getElementById('gameType').innerHTML === "Don't Starve") {
        highestScoreLabel.innerHTML = localStorage.getItem("starveHighScore");
    } else {
        highestScoreLabel.innerHTML = localStorage.getItem("obstacleHighScore");
    }

    usernameLabel.innerHTML = localStorage.getItem("username");
    emailLabel.innerHTML = localStorage.getItem("email");

    window.canvas = document.getElementById('snakeGrid');

    if (window.canvas.getContext) {
        GridManager.context = window.canvas.getContext('2d');
        GridManager.blockWidth = Math.floor(window.canvas.height / gridWidth);
    }
    // Interval time is in ms
    refresh = setInterval(GridManager.drawGrid, refreshTime);
    entities.init();

    snake.points.forEach(block => GridManager.drawBlock(block));
    entities.draw();
    progress = setInterval(updateProgressBar, 200);
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
        case " ":
            inputProcessed = false;
            if (GridManager.gameOver) {
                restartGame();
            } else {
                GridManager.isPaused = !GridManager.isPaused;
            }
            break;
    }

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}, true)

// Reset game state
function restartGame() {
    GridManager.isPaused = true;
    clearInterval(refresh);
    refresh = setInterval(GridManager.drawGrid, refreshTime);

    // reset timer
    document.getElementById('progressBar').value = 100;
    progress = setInterval(updateProgressBar, 200);

    document.getElementById('currentScore').innerHTML = "0";
    GridManager.clear();
    snake = new Snake();
    entities.init();

    GridManager.gameOver = false;
}

// Update progress bar for simulating timer
function updateProgressBar() {
    progressBar = document.getElementById('progressBar');
    if (progressBar.value >= 75) {
        progressBar.classList.remove("is-warning");
        progressBar.classList.remove("is-danger");
        progressBar.classList.add("is-success");
    } else if (progressBar.value >= 25) {
        progressBar.classList.remove("is-success");
        progressBar.classList.remove("is-danger");
        progressBar.classList.add("is-warning");
    } else {
        progressBar.classList.remove("is-success");
        progressBar.classList.remove("is-warning");
        progressBar.classList.add("is-danger");
    }
    progressBar.value -= 1;

    // Game over
    if (progressBar.value === 0) {
        endGame();
    }
}

// Change game mode to Don't Starve
function setDontStarve() {
    GridManager.mode = Gamemode.DontStarve;
    //GridManager.isPaused = true;
    //restartGame();
    document.getElementById('progressBar').style.display = "";
    document.getElementById('gameType').innerHTML = "Don't Starve";
}

// Change game mode to Obstacle Course
function setObstacleCourse() {
    GridManager.mode = Gamemode.ObstacleCourse;
    //GridManager.isPaused = true;
    //restartGame();
    document.getElementById('progressBar').style.display = "none";
    document.getElementById('gameType').innerHTML = "Obstacle Course";
}

function endGame() {
    clearInterval(progress);
    console.log(localStorage.getItem("username"));
    console.log(localStorage.getItem("starveGamesPlayed"));
    const currentScore = parseInt(document.getElementById('currentScore').innerHTML);
    const highestScoreLabel = document.getElementById('userStandardScore');
    const highScore = parseInt(highestScoreLabel.innerHTML);

    const updateRequest = new XMLHttpRequest();
    updateRequest.open("PATCH", "http://localhost:5000/app/update/user/" + localStorage.getItem("username"));

    if (currentScore > highScore) {
        highestScoreLabel.innerHTML = currentScore;
        if (document.getElementById('gameType').innerHTML.includes("Don't Starve")) {
            currentGamesPlayed = localStorage.getItem("starveGamesPlayed");
            updateRequest.send(new URLSearchParams({
                starveHighScore: currentScore,
                starveGamesPlayed: (parseInt(currentGamesPlayed) + 1)
            }));
            localStorage.setItem("starveHighScore", currentScore);
            localStorage.setItem("starveGamesPlayed", (parseInt(currentGamesPlayed) + 1));
        } else {
            currentGamesPlayed = localStorage.getItem("obstacleGamesPlayed");
            updateRequest.send(new URLSearchParams({
                obstacleHighScore: currentScore,
                obstacleGamesPlayed: (parseInt(currentGamesPlayed) + 1)
            }));
            localStorage.setItem("obstacleHighScore", currentScore);
            localStorage.setItem("obstacleGamesPlayed", (parseInt(currentGamesPlayed) + 1));
        }
    } else {
        if (document.getElementById('gameType').innerHTML.includes("Don't Starve")) {
            currentGamesPlayed = localStorage.getItem("starveGamesPlayed");
            updateRequest.send(new URLSearchParams({starveGamesPlayed: (parseInt(currentGamesPlayed) + 1)}));
            localStorage.setItem("starveGamesPlayed", (parseInt(currentGamesPlayed) + 1));
        } else {
            currentGamesPlayed = localStorage.getItem("obstacleGamesPlayed");
            updateRequest.send(new URLSearchParams({obstacleGamesPlayed: (parseInt(currentGamesPlayed) + 1)}));
            localStorage.setItem("obstacleGamesPlayed", (parseInt(currentGamesPlayed) + 1));
        }
    }
    updateRequest.addEventListener("load", function (event) {

    });

    GridManager.gameOver = true;
}