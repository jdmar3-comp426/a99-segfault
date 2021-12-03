// add event listeners for account form data

window.addEventListener("load", function(event) {
    document.getElementById("username").innerHTML = localStorage.getItem("username");
});