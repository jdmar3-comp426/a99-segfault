/*
    This script is intended to be used for user authentication and
    configuring gameplay settings (alternative modes, etc.)
*/



window.addEventListener("load" , function(){

    // When home page loads, add event to button click that sends user to game
    document.getElementById("launchGame").onclick = function() {
        location.href = './game_logic/snake.html';
    }

    const signupForm = document.getElementById("signup") ; 
    signupForm.addEventListener( "submit" , function(event){
        event.preventDefault(); 
        signup() ; 
    }
    ); 

    const loginForm = document.getElementById("login") ; 
    loginForm.addEventListener( "submit" , function(event){
        event.preventDefault(); 
        login() ; 
    }
    ); 

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
                    console.log("Correct: " + correctPassword) ; 
                    console.log("Inputted: " + inputtedPassword) ; 
                    if(inputtedPassword!=correctPassword){
                        alert("Login Failed") ; 
                    }
                    else{
                        alert("Login succesful") ; 
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
                })
            }
            else{
                alert("User is already in database") ; 
            }
            console.log(JSON.parse(requestVerification.response)["EXISTS(SELECT 1 FROM userinfo WHERE username = '" + inputtedUsername + "')"] == 1); 
        })
        requestVerification.addEventListener("error" , function(event){
            alert("Signup failed"); 
        })
    }

}

) ;
