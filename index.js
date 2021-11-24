/*
    This script is intended to be used for user authentication and
    configuring gameplay settings (alternative modes, etc.)
*/

// When home page loads, add event to button click that sends user to game
window.onload = function() {
    document.getElementById("launchGame").onclick = function() {
        location.href = './game_logic/snake.html';
    }
}
