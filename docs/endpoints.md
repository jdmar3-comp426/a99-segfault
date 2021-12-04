# API Endpoints

### /app/

Confirms server and API are up and running

### app/new/

Creates a new user using provided arguments. Uses POST HTTP method

### /app/users/

Reads a list of all the users in the database and their information. Uses GET HTTP method.

### /app/user/:username
Reads a single user from the database using the username provided in the endpoint path

### /app/user/exists/:username

Checks if the username provided in the endpoint path currently exists in the database

### /app/update/user/:username

Updates the information for a username provided in the endpoint path using the provided arguments

### /app/delete/user/:username

Deletes the user with the username specified in the endpoint path from the database.
