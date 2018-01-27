var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require('cookie-parser')

const bcrypt = require('bcrypt');
const password = "purple-monkey-dinosaur"; // you will probably this from req.params
const hashedPassword = bcrypt.hashSync(password, 12);

var app = express()
app.use(cookieParser())

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const users = {
    "Fluffy": {
        id: "Fluffy",
        email: "fluffy@cottoncandy.com",
        password: "purple-monkey-dinosaur"
    },
    "Puffy": {
        id: "Puffy",
        email: "puffy@magicland.com",
        password: "dishwasher-funk"
    }
}

app.set("view engine", "ejs");

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com",
};

function generateRandomString() {
    var randomString = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++) {
        randomString += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return randomString;
}   
// console.log(generateRandomString());

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get("/u/:id", (req, res) => {
    let longURL = urlDatabase[req.params.id];

    // handle if the longURL doesnt exist un urlDatabase
    res.redirect(longURL);
});

app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect('http://localhost:8080/urls/' + shortURL);
});

app.get("/urls", (req, res) => {
    var urName = '';
    if (req.cookies.user_id) {
        console.log("cookies are there");
        var userId = req.cookies.user_id;
        //to get the complete user from the users objects
        var currentUser = users[userId];
        //console.log('UserName in urls : ', urName);
        let templateVars = { urls: urlDatabase, user: currentUser };
        res.render("urls_index", templateVars);   
    } else {
        let templateVars = { urls: urlDatabase, user: urName };
        res.render("urls_index", templateVars);
    }
    //  {urName = req.cookies.username;}
});

app.get("/urls/:id", (req, res) => {

    var userId = req.cookies.user_id;
    var currentUser = users[userId];

    let templateVars = { 
        shortURL: req.params.id, 
        longURL: urlDatabase[req.params.id],
        user: currentUser   
    };
    res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    console.log("we are in post login");
    if (!req.body.username || !req.body.password) {
        res.status(403);
        res.send("Incorrect Username or Password");
    } else {
        console.log("all is good");
        for (var key in users) {
            if (users[key].email === req.body.username && users[key].password === req.body.password) {
                res.cookie("user_id", users[key].id);
                res.redirect("/urls");
            } 
        }
        res.status(403);
        res.send("Incorrect Username or Password");
    }
});

app.post("/register", (req, res) => {
    let userID = generateRandomString();
    if (!req.body.email || !req.body.password) {
       res.status(400);
       res.send("Please Fill All Fields!");
       //Need to make it res.render to a new ejs page then redirect back to sign up page 
    } else {
        users[userID] = {id:userID, email:req.body.email, password:req.body.password};
        console.log(users);
        res.cookie('user_id', userID);
        res.redirect("urls");
    }
});

app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
    // console.log("post to urls/id/update");
    if (urlDatabase[req.params.id]) {
        // console.log("database updated");
    urlDatabase[req.params.id] = req.body.longURL;  
    }
    res.redirect("/urls");
});

app.post("/login", (req, res) => {
    // console.log("req.body.username", req.body.username);
    res.cookie('user_id', req.body.username);
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    // console.log("LOGGED OUT", req.body.username);
    res.clearCookie('user_id', req.body.username);
    res.redirect("/urls");
});

app.get("/", (req, res) => {
    res.end("Hello!");
});

app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});
