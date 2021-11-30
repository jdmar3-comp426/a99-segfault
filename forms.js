window.addEventListener("load" , function(){

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






/*



        const sendRequest = new XMLHttpRequest() ; 

        const loginInfo = new URLSearchParams(new FormData(loginForm)) ;

        sendRequest.addEventListener("load" , function(event){
            alert("You've Logged in") ; 
        })

        sendRequest.addEventListener("error" , function(event){
            alert("Submission Unsuccesful! Please try again.") ; 
        }
        ) ; 
  
        
        
        sendRequest.open("POST" , "http://localhost:5000/app/new/" ) ; 
        sendRequest.send(signupInfo) ; 
    }
*/
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
    /*
    function getData(){ 
        const sendRequest = new XMLHttpRequest() ;
        sendRequest.open("GET" , "http://localhost:5000/app/users/" ) ; 
        sendRequest.addEventListener("load" , function(event){
            return JSON.parse(sendRequest.response)[0]["user"];
        }) ; 
        sendRequest.send() ; 
    }
    */
/*
    function sendData(){
        const formUsername = new FormData(form).get("user") ; 
        getData().then((response)=>{
            const formUsername = new FormData(form).get("user") ;
            if(formUsername!=response){
                alert("Wrong username");
            }
        })
        */
        /*
        const promise = new Promise((resolve,reject) => {
            resolve("hello") ; 
        })
        promise.then((response) =>{
            console.log(response)
        })
        const sendRequest = new XMLHttpRequest() ; 

        const signupInfo = new URLSearchParams(new FormData(form)) ;
        //console.log(new FormData(form).get("user")) ;  Gets the username plugged into the form 
        //if(new FormData(form).get("user") == "imubarek"){
        //    alert("SUCESS") ; 
        //}

        sendRequest.addEventListener("load" , function(event){
            alert("Your account was created!") ; 
        })

        sendRequest.addEventListener("error" , function(event){
            alert("Submission Unsuccesful! Please try again.") ; 
        }
        ) ; 
        
        
        
        sendRequest.open("POST" , "http://localhost:5000/app/new/" ) ; 
        sendRequest.send(signupInfo) ; 
        
    }
    */
/*
    function getData(button){ 
        const promise = new Promise((resolve,reject) => {
            const sendRequest = new XMLHttpRequest() ;
            sendRequest.open("GET" , "http://localhost:5000/app/users/" ) ;
            sendRequest.addEventListener("load" , function(event){
                resolve(JSON.parse(sendRequest.response)[0]["user"]);
            }) ; 
            sendRequest.send() ;
        })
        return promise ; 
    }
    */

/*
    function getData(button){ 
        const p = new Promise(function(resolve,reject){
            const sendRequest = new XMLHttpRequest() ;
            sendRequest.open("GET" , "http://localhost:5000/app/users/") ;
            sendRequest.addEventListener("load" , function(event){
                resolve(JSON.parse(sendRequest.response)[0]["user"]) ; 
            })
            sendRequest.send() ;
        }) ; 

        return p ; 

    }
*/

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

/*
    const button = document.getElementById("getdata") ; 
    button.addEventListener("click" , function(event){
        button.innerHTML = getData() ;
    })   
*/
    //if(getData(button)){
    //    console.log("TRUE") ; 
    //} 
    //else{
    //    console.log("FALSE") ; 
    //}
    //button.addEventListener("click",function(event){
    //    event.preventDefault() ; 
    //    getData(button); 
    //}) ; 
}

) ;





//const paragraphText = document.getElementById("information") ; 
    //paragraphText.innerHTML = getData() ;