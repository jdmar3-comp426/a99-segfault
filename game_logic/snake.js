/*
    This script is intended to implement the game-logic behind Snake.
    Currently, this version just initiates a blank grid and let's the user
    control a snake of length 3. The user can move the snake, which can wrap
    around the ends of the board.
*/

const gridWidth = 14;
const numObstacles = 8;
let obsIndex = 0;
let obsRandom = [];
let inputProcessed = false;
let initialRefreshTime = 0;
let refreshTime = initialRefreshTime;
let refresh = null;
let progress = null;
const initialIncrement = 20;
let increment = initialIncrement;

// Define the GridManager object to manage the game grid
const GridManager = {
    context: null,
    gameOver: false,
    isPaused: true,
    blockWidth: null,
    offset: 1,
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
        if (p.dir === Direction.NA) {
            let pauseImg = LoadedImage.Pause;
            this.context.drawImage( pauseImg.image, canvas.width / 2 - pauseImg.image.width / 2+175,
                canvas.height / 2 - pauseImg.image.height / 2 +175, 160, 160);
        } else if (p.equals(snake.head)) {
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
        } else if (p.equals(snake.tail)) {
            let tailImg;
            if (snake.tail.direction !== snake.points[1].direction) {
                snake.tail.direction = snake.points[1].direction;
            }
            switch (snake.tail.direction) {
                case Direction.N:
                    tailImg = LoadedImage.TailNorth;
                    break;
                case Direction.E:
                    tailImg = LoadedImage.TailEast;
                    break;
                case Direction.S:
                    tailImg = LoadedImage.TailSouth;
                    break;
                case Direction.W:
                    tailImg = LoadedImage.TailWest;
                    break;
            }
            this.context.drawImage(tailImg.image, p.x * this.blockWidth - .5 * this.growth,
                p.y * this.blockWidth - .5 * this.growth,
                this.blockWidth + this.growth, this.blockWidth + this.growth);
        } else if (p.equals(entities.fruit)) {
            this.context.drawImage(LoadedImage.Rat.image,
                p.x * this.blockWidth, p.y * this.blockWidth,
                this.blockWidth*1.10, this.blockWidth*1.10
            );
        } else if (this.mode === Gamemode.DontStarve && p.equals(entities.slimFruit)) {
            this.context.drawImage(LoadedImage.Coffee.image,
                p.x * this.blockWidth, p.y * this.blockWidth,
                this.blockWidth, this.blockWidth
            );
        } else if (this.mode === Gamemode.ObstacleCourse && entities.obstacles.hasPoint(p)) {
            if (obsIndex === numObstacles) {
                obsIndex = 0;
            }
            obsIndex += 1;
            switch (obsRandom[obsIndex-1]) {
                case 0:
                    this.context.drawImage(LoadedImage.TrafficCone.image,
                        p.x * this.blockWidth, p.y * this.blockWidth,
                        this.blockWidth, this.blockWidth
                    );
                    break;
                case 1:
                    this.context.drawImage(LoadedImage.BlueMailBox.image,
                        p.x * this.blockWidth, p.y * this.blockWidth,
                        this.blockWidth, this.blockWidth
                    );
                    break;
                case 2:
                    this.context.drawImage(LoadedImage.Bollard.image,
                        p.x * this.blockWidth, p.y * this.blockWidth,
                        this.blockWidth, this.blockWidth
                    );
                    break;
                case 3:
                    this.context.drawImage(LoadedImage.PottedPlant.image,
                        p.x * this.blockWidth, p.y * this.blockWidth,
                        this.blockWidth, this.blockWidth
                    );
                    break;
                case 4:
                    this.context.drawImage(LoadedImage.RedMailBox.image,
                        p.x * this.blockWidth, p.y * this.blockWidth,
                        this.blockWidth, this.blockWidth
                    );
                    break;
                case 5:
                    this.context.drawImage(LoadedImage.Tire.image,
                        p.x * this.blockWidth, p.y * this.blockWidth,
                        this.blockWidth, this.blockWidth
                    );
                    break;
                case 6:
                    this.context.drawImage(LoadedImage.TrashBags.image,
                        p.x * this.blockWidth, p.y * this.blockWidth,
                        this.blockWidth, this.blockWidth
                    );
                    break;
                case 7:
                    this.context.drawImage(LoadedImage.TrashCan.image,
                        p.x * this.blockWidth, p.y * this.blockWidth,
                        this.blockWidth, this.blockWidth
                    );
                    break;

            }
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
    draw: function() {
        this.clear();
        for (let i = 0; i < snake.length; i++) {
            this.drawBlock(snake.points[i]);
        }
        entities.draw();
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
            this.draw();
        }
    },
    // Iterate over map elements and draw any non-zero objects
    drawGrid: function () {
        if (!GridManager.gameOver && !GridManager.isPaused) {
            GridManager.updateGame();
        }
    },
    // Make update to game state
    updateGame: function () {
        if (GridManager.gameOver || GridManager.isPaused) return;
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
            newHead.x <= 0 || newHead.x >= maxIndex || newHead.y <= 0 || newHead.y >= maxIndex) {
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
                refreshTime += .8 * increment;
                document.getElementById('currentScore').innerHTML = "" + (parseInt(document.getElementById('currentScore').innerHTML) + 1);

                clearInterval(refresh);
                refresh = setInterval(GridManager.drawGrid, refreshTime);
                // get rid of fruit immediately
                this.removeBlock(snake.head.y, snake.head.x, true);
                this.removeBlock(oldHead.y, oldHead.x, false);
                entities.fruit = generateEntity(entities.slimFruit);

                // Update timer
                document.getElementById('progressBar').value += 10;
            } else {
                if (this.mode === Gamemode.DontStarve && newHead.equals(entities.slimFruit)) {
                    this.growth = Math.max(this.growth - 2.5, 0);
                    refreshTime = Math.max(refreshTime - .5 * increment, initialRefreshTime);
                    increment = Math.min(increment /= 0.85, initialIncrement);


                    document.getElementById('progressBar').value += 5;
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
            obsRandom[i] = Math.floor(Math.random() * numObstacles);
            entities.obstacles.points.push(generateEntity(new Point(0, 3)));
        }
    }
    entities.fruit = generateEntity();
    if (GridManager.mode === Gamemode.DontStarve) {
        entities.slimFruit = generateEntity(entities.fruit);
    }
}

function generateEntity(exclude = null) {
    const maxIndex = gridWidth - 2;
    let out = snake.points[0];
    while (snake.hasPoint(out) || entities.obstacles.hasPoint(out) || out.equals(exclude)) {
        // Find a new place for the fruit
        let yVal = Math.floor(Math.random() * maxIndex)+1;
        let xVal = Math.floor(Math.random() * maxIndex) + 1;
        if (yVal === maxIndex) {yVal-=1;}
        if (yVal === 1 && GridManager.mode === Gamemode.ObstacleCourse) {yVal+=1;}
        out = new Point(yVal, xVal);
    }
    return out;
}

window.addEventListener("load", function() {
    init_game();
});

// Initialize canvas/corresponding attributes for GridManager
function init_game() {
    const usernameLabel = document.getElementById('usernameLabel');
    const emailLabel = document.getElementById('emailLabel');
    const highestScoreLabel = document.getElementById('userStandardScore');

    if (GridManager.mode.name === "Don't Starve") {
        initialRefreshTime = 150;
        refreshTime = initialRefreshTime;
        highestScoreLabel.innerHTML = localStorage.getItem("starveHighScore");
        document.getElementById('progressBar').style.display = "block";
    } else {
        initialRefreshTime = 175;
        refreshTime = initialRefreshTime;
        highestScoreLabel.innerHTML = localStorage.getItem("obstacleHighScore");
        document.getElementById('progressBar').style.display = "none";
    }
    usernameLabel.innerHTML = localStorage.getItem("username");
    emailLabel.innerHTML = localStorage.getItem("email");

    window.canvas = document.getElementById('snakeGrid');

    // Set game type display
    document.getElementById('gameType').innerHTML = GridManager.mode.name;

    if (window.canvas.getContext) {
        GridManager.context = window.canvas.getContext('2d');
        GridManager.blockWidth = Math.floor(window.canvas.height / gridWidth);
    }
    // Interval time is in ms
    refresh = setInterval(GridManager.drawGrid, refreshTime);
    entities.init();

    snake.points.forEach(block => GridManager.drawBlock(block));
    entities.draw();
    if (!GridManager.isPaused && GridManager.mode === Gamemode.DontStarve) progress = setInterval(updateProgressBar, 100);
    pauseSymbol();
};

// Watch for arrow key input to control snake direction
window.addEventListener("keydown", function (event) {
    if (inputProcessed) return;
    inputProcessed = true;
    switch (event.key) {
        case " ":
            if (GridManager.gameOver) {
                restartGame();
            } else {
                GridManager.isPaused = !GridManager.isPaused;
                pauseSymbol();
                clearInterval(progress);
                if (GridManager.mode === Gamemode.DontStarve) {
                    progress = setInterval(updateProgressBar, 200);
                }
            }
            break;
        case "ArrowLeft":
            event.preventDefault();
            if (!GridManager.isPaused) {
                if (snake.direction !== Direction.E) {
                    snake.direction = Direction.W;
                }
            }
            break;
        case "ArrowRight":
            event.preventDefault();
            if (!GridManager.isPaused) {
                if (snake.direction !== Direction.W) {
                    snake.direction = Direction.E;
                }
            }
            break;
        case "ArrowUp":
            event.preventDefault();
            if (!GridManager.isPaused) {
                if (snake.direction !== Direction.S) {
                    snake.direction = Direction.N;
                }
            }
            break;
        case "ArrowDown":
            event.preventDefault();
            inputProcessed = false;
            if(!GridManager.isPaused) {
                if (snake.direction !== Direction.N) {
                    snake.direction = Direction.S;
                }
            }
            break;
    }

    // Cancel the default action to avoid it being handled twice

    // allow inputs in between ticks w/o breaking game
    setTimeout(() => {inputProcessed = false;}, 150);
    event.preventDefault();
}, true)




// Reset game state
function restartGame() {
    GridManager.isPaused = true;
    clearInterval(refresh);
    refresh = setInterval(GridManager.drawGrid, refreshTime);

    // reset timer
    document.getElementById('progressBar').max = 101;
    document.getElementById('progressBar').value = 101;
    clearInterval(progress);
    updateProgressBar();
    document.getElementById('progressBar').max = 100;


    document.getElementById('currentScore').innerHTML = "0";
    GridManager.clear();
    snake = new Snake();
    entities.init();
    GridManager.growth = 0;
    console.log("FUCK");
    GridManager.gameOver = false;
    GridManager.draw();
    pauseSymbol();
}

// Update progress bar for simulating timer
function updateProgressBar() {
    let progressBar = document.getElementById('progressBar');
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
    // TODO: don't decrement progressBar if game is paused
    progressBar.value -= 1;

    // Game over
    if (progressBar.value === 0 ) {
        endGame();
    }
}

// Change game mode to Don't Starve
function setDontStarve() {
    initialRefreshTime = 150;
    refreshTime = initialRefreshTime;
    localStorage.setItem("mode", Gamemode.DontStarve.name);
    syncDB();
    GridManager.mode = Gamemode.DontStarve;
    restartGame();
    document.getElementById('progressBar').style.display = "block";
    document.getElementById('gameType').innerHTML = "Don't Starve";
    document.getElementById('userStandardScore').innerHTML = localStorage.starveHighScore;
}

// Change game mode to Obstacle Course
function setObstacleCourse() {
    initialRefreshTime = 175;
    refreshTime = initialRefreshTime;
    localStorage.setItem("mode", Gamemode.ObstacleCourse.name);
    syncDB();
    GridManager.mode = Gamemode.ObstacleCourse;
    restartGame();
    clearInterval(progress);
    document.getElementById('progressBar').style.display = "none";
    document.getElementById('gameType').innerHTML = "Obstacle Course";
    document.getElementById('userStandardScore').innerHTML = localStorage.obstacleHighScore;
}

function endGame() {
    clearInterval(progress);
    clearInterval(refresh);
    syncDB() ;

    let highestScoreLabel = document.getElementById('userStandardScore');
    let currentScore = parseInt(document.getElementById('currentScore').innerHTML);
    let highScore = parseInt(highestScoreLabel.innerHTML);

    if (currentScore > highScore) {
        if (document.getElementById('gameType').innerHTML.includes("Don't Starve")) {
            localStorage.setItem("starveHighScore", currentScore);
        } else {
            localStorage.setItem("obstacleHighScore", currentScore);
        }
        highestScoreLabel.innerHTML = currentScore;
    }
    GridManager.gameOver = true;
}

// Sync DB with session results
function syncDB() {
    const currentScore = parseInt(document.getElementById('currentScore').innerHTML);
    const highScore = GridManager.mode === Gamemode.DontStarve ? localStorage.getItem("starveHighScoreDB") : localStorage.getItem("obstacleHighScoreDB");

    const updateRequest = new XMLHttpRequest();
    updateRequest.open("PATCH", "http://localhost:5000/app/update/user/" + localStorage.getItem("username"));

    if (currentScore > highScore) {
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
}

function pauseSymbol() {
    let middle = new Point(7, 7, Direction.NA, Direction.NA);
    if (GridManager.isPaused) {
        GridManager.drawBlock(middle);
    }
}

function logout() {
    localStorage.clear();
    location.href = './../index.html';
}