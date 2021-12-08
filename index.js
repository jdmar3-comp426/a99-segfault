/*
    This script is intended to be used for user authentication and
    configuring gameplay settings (alternative modes, etc.)
*/

window.addEventListener("load" , function(){

    if (localStorage.getItem("username") === null){
        initializeForGuest() ; 
    }
    // When home page loads, add event to button click that sends user to game
    document.getElementById("launchDontStarve").onclick = function() {
        location.href = './game_logic/snake.html';
        localStorage.setItem("mode", "Don't Starve");
    }

    document.getElementById("launchObstacleCourse").onclick = function() {
        location.href = './game_logic/snake.html';
        localStorage.setItem("mode", "Obstacle Course");
    }

    const signupForm = document.getElementById("createAccountForm");
    signupForm.addEventListener( "submit" , function(event){
            event.preventDefault();
            signup() ;
        }
    );

    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener( "submit" , function(event){
            event.preventDefault();
            login() ;
        }
    );

    // Remove login/sign-up buttons from display if logged in
    if (localStorage.getItem("username") !== null && localStorage.getItem("username") !== "guest") {
        document.getElementById("loginButton").style.display = "none";
        document.getElementById("createAccount").style.display = "none";
    }

    function initializeForGuest(){

        const getGuestRequest = new XMLHttpRequest() ;
        getGuestRequest.open("GET" , "http://localhost:5000/app/user/guest") ;
        getGuestRequest.send() ;
        getGuestRequest.addEventListener("load" , function(event){
                localStorage.setItem("username" , "guest") ;
                const guestEmail = JSON.parse(getGuestRequest.response).email ;
                const guestObstacleHighScore = JSON.parse(getGuestRequest.response).obstacleHighScore;
                const guestStarveHighScore = JSON.parse(getGuestRequest.response).starveHighScore ;
                const guestStarveGamesPlayed = JSON.parse(getGuestRequest.response).starveGamesPlayed ; 
                const guestObstacleGamesPlayed = JSON.parse(getGuestRequest.response).obstacleGamesPlayed ; 
                localStorage.setItem("email" , guestEmail) ;
                localStorage.setItem("obstacleHighScore" , guestObstacleHighScore) ;
                localStorage.setItem("starveHighScore" , guestStarveHighScore) ;
                localStorage.setItem("starveGamesPlayed" , guestStarveGamesPlayed) ;
                localStorage.setItem("obstacleGamesPlayed" , guestObstacleGamesPlayed) ;
                console.log(guestStarveGamesPlayed) ; 
                console.log(guestObstacleGamesPlayed) ; 

            }
        ) ;
    }

    // While form is overlayed, add event listener to remove overlay if user clicks outside of the form
    document.addEventListener("click", function(event) {
        if (event.target == document.getElementById("loginButton")) {
            // Display login form
            document.getElementById("loginSection").style.display = "block";
            document.getElementById("createAccountSection").style.display = "none";
            window.formOverlayed = true;
        } else if (event.target == document.getElementById("createAccount")) {
            // Display account creation form
            document.getElementById("loginSection").style.display = "none";
            document.getElementById("createAccountSection").style.display = "block";
            window.formOverlayed = true;
        } else if (window.formOverlayed) {
            // Hide forms if user clicks outside area
            if (!loginForm.contains(event.target) && !createAccountForm.contains(event.target)) {
                document.getElementById("loginSection").style.display = "none";
                document.getElementById("createAccountSection").style.display = "none";
                window.formOverlayed = false;
            }
        }
    });

    function login(){
        const loginFormData = new FormData(loginForm) ;
        const loginInfo = new URLSearchParams(loginFormData) ;
        const inputtedUsername = loginFormData.get("username") ;
        const inputtedPassword = loginFormData.get("password") ;

        const verifyUsernameRequest = new XMLHttpRequest() ;
        verifyUsernameRequest.open("GET" , "http://localhost:5000/app/user/exists/" + inputtedUsername) ;
        verifyUsernameRequest.send() ;

        verifyUsernameRequest.addEventListener("load" , function(event){
            var isInDatabase = JSON.parse(verifyUsernameRequest.response)["EXISTS(SELECT 1 FROM userinfo WHERE username = '" + inputtedUsername + "')"] ==1;
            if(isInDatabase){
                const passwordCheckRequest = new XMLHttpRequest() ;
                passwordCheckRequest.open("GET" , "http://localhost:5000/app/user/" + inputtedUsername) ;
                passwordCheckRequest.send() ;
                passwordCheckRequest.addEventListener("load" , function(event){
                    const correctPassword = JSON.parse(passwordCheckRequest.response).password ;

                    if(inputtedPassword!=correctPassword){
                        alert("Incorrect Password") ;
                    }
                    else{
                        user_info = JSON.parse(passwordCheckRequest.response);
                        localStorage.setItem("username" , inputtedUsername) ;
                        localStorage.setItem("email" , user_info.email) ;
                        localStorage.setItem("obstacleHighScore" , user_info.obstacleHighScore) ;
                        localStorage.setItem("starveHighScore" , user_info.starveHighScore) ;
                        localStorage.setItem("obstacleHighScoreDB" , user_info.obstacleHighScore) ;
                        localStorage.setItem("starveHighScoreDB" , user_info.starveHighScore) ;
                        localStorage.setItem("starveGamesPlayed" , user_info.starveGamesPlayed) ; 
                        localStorage.setItem("obstacleGamesPlayed" , user_info.obstacleGamesPlayed) ; 
                        alert("Login succesful");
                        document.getElementById("loginSection").style.display = "none";
                        document.getElementById("createAccountSection").style.display = "none";
                        window.formOverlayed = false;

                        // Remove login/sign-up buttons from display
                        document.getElementById("loginButton").style.display = "none";
                        document.getElementById("createAccount").style.display = "none";
                    }

                } ) ;
            }
            else{
                alert("Invalid Username") ;
            }
        }) ;
    }

    function signup(){

        const signupFormData = new FormData(signupForm) ;
        const signupInfo = new URLSearchParams(signupFormData) ;
        const inputtedUsername = signupFormData.get("username") ;
        const inputtedPassword =  signupFormData.get("password") ;
        const inputtedEmail = signupFormData.get("email") ;
        if(inputtedUsername === "" || inputtedPassword === "" || inputtedEmail === ""){
            alert("Can't complete signup, you have a field empty") ; 
        }
        else{
            const requestVerification = new XMLHttpRequest() ;
            requestVerification.open("GET" , "http://localhost:5000/app/user/exists/" + inputtedUsername) ;
            requestVerification.send() ;
            requestVerification.addEventListener("load" , function(event){
                var isInDatabase = JSON.parse(requestVerification.response)["EXISTS(SELECT 1 FROM userinfo WHERE username = '" + inputtedUsername + "')"] ==1;
                if(!isInDatabase){
                    const sendRequest = new XMLHttpRequest() ;
                    sendRequest.open("POST" , "http://localhost:5000/app/new/" ) ;
                    sendRequest.send(signupInfo) ;
                    sendRequest.addEventListener("error" , function(event){
                        alert("Submission Unsuccesful! Please try again.") ;
                    }
                    ) ;
                    sendRequest.addEventListener("load" , function(event){
                        alert("Signed up!") ;
                    }) ; 
                }
                else{
                    alert("User is already in database") ;
                }
            } ) ; 
            requestVerification.addEventListener("error" , function(event){
                alert("Signup failed");
            }) ; 
        }

        
    };
});

function logout() {
    localStorage.clear();
}