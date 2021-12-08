// add event listeners for account form data

window.addEventListener("load", function(event) {
    document.getElementById("username").innerHTML = localStorage.getItem("username");
    document.getElementById("starveHighScore").innerHTML = localStorage.getItem("starveHighScore");
    document.getElementById("obstacleHighScore").innerHTML = localStorage.getItem("obstacleHighScore");;
    document.getElementById("starveGamesPlayed").innerHTML = localStorage.getItem("starveGamesPlayed");
    document.getElementById("obstacleGamesPlayed").innerHTML = localStorage.getItem("obstacleGamesPlayed");

    document.getElementById("resetStatistics").addEventListener("click" , function(event){
        updateFields( {starveHighScore :  0 , obstacleHighScore : 0 , obstacleGamesPlayed : 0 , starveGamesPlayed:0} ) ;
        localStorage.setItem("obstacleHighScore" , 0) ;
        localStorage.setItem("starveHighScore" , 0) ;
        localStorage.setItem("starveGamesPlayed" , 0) ;
        localStorage.setItem("obstacleGamesPlayed" , 0) ;
        if(localStorage.getItem("username") === "guest"){
            alert("Guest statistics have been reset") ; 
        }
        else{
            alert("Your statistics have been reset") ;
        }
    } );
    document.getElementById("updatePassword").addEventListener("click" , function(event){
        if(localStorage.getItem("username") === "guest"){
            alert("You can't do this update when logged in as guest") ; 
        }
        else{ 
            updateFields( {password : document.getElementById("newPassword").value} ) ; 
            alert("Your password has been updated") ; 
        }
    } ) ; 

    document.getElementById("updateEmail").addEventListener("click" , function(event){
        if(localStorage.getItem("username") === "guest"){
            alert("You can't do this update when logged in as guest") ; 
        }
        else{
            const newEmail = document.getElementById("newEmail").value ; 
            updateFields( {email : newEmail} ) ;
            localStorage.setItem("email" , newEmail) ;
            alert("Your email has been updated") ; 
        }
    } );

    document.getElementById("deleteAccount").addEventListener("click" , function(event){
        if(localStorage.getItem("username") === "guest"){
            alert("You can't do this update when logged in as guest") ; 
        }
        else{
            const deleteRequest = new XMLHttpRequest() ; 
            deleteRequest.open("DELETE", "http://localhost:5000/app/delete/user/" + localStorage.getItem("username"));
            deleteRequest.send() ; 
            deleteRequest.addEventListener("load" , function(event){
                alert("Your account has been deleted") ;
                logout() ; 
            }) ;
        }
    } );

    function updateFields(updatedFields){
        const updateRequest = new XMLHttpRequest();
        updateRequest.open("PATCH", "http://localhost:5000/app/update/user/" + localStorage.getItem("username"));
        updateRequest.send(new URLSearchParams(updatedFields));

        updateRequest.addEventListener("load" , function(event){

        }) ; 
    }

});
function logout() {
    localStorage.clear();
    location.href = './../index.html';
}

// Change game mode to Don't Starve
function setDontStarve() {
    localStorage.setItem("mode", "Don't Starve");
    location.href = './../game_logic/snake.html';
}

// Change game mode to Don't Starve
function setObstacleCourse() {
    localStorage.setItem("mode", "Obstacle Course");
    location.href = './../game_logic/snake.html';
}
