// add event listeners for account form data

window.addEventListener("load", function(event) {
    document.getElementById("username").innerHTML = localStorage.getItem("username");
    // Dont' Starve stats
    // on load, update stat for dontStarveGamesPlayed
    /*
    const dontStarveGamesPlayed = document.getElementById("dontStarveGamesPlayed");
    dontStarveGamesPlayed.innerHTML = this.localStorage.getItem("")
    */
    const dontStarveHighScore = document.getElementById("dontStarveHighScore");
    dontStarveHighScore.innerHTML = this.localStorage.getItem("starveHighScore");

    // Obstacle Course stats
    const obstacleHighScore = document.getElementById("obstacleHighScore");
    obstacleHighScore.innerHTML = this.localStorage.getItem("obstacleHighScore");

});