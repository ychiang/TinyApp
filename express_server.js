var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

var app = express()
app.use(cookieSession({
    name: 'session',
    keys: ['Bibbidi-Bobbidi-Boo'], 
    maxAge: 1 * 60 * 60 * 1000
}))

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const users = {
    "Fluffy": {
        id: "Fluffy",
        email: "fluffy@cottoncandy.com",
        password: bcrypt.hashSync("purple-monkey-dinosaur", 12)
    },
    "Puffy": {
        id: "Puffy",
        email: "puffy@magicland.com",
        password: bcrypt.hashSync("dishwasher-funk", 12)
    }
}

app.set("view engine", "ejs");

var urlDatabase = {
    "Fluffy": {
        "b2xVn2": "http://www.lighthouselabs.ca"
    },
    "Puffy": {
        "9sm5xK": "http://www.google.com",
    }
};

function generateRandomString() {
    var randomString = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++) {
        randomString += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return randomString;
}   

app.get("/urls/new", (req, res) => {
    if (req.session.user_id) {
        res.render("urls_new");
    } else {
        res.redirect("/login");
    }
});

app.post("/urls/new", (req, res) => {
    let shortURL = generateRandomString();
    if (urlDatabase.hasOwnProperty(req.session.user_id)) {
        urlDatabase[req.session.user_id][shortURL] = req.body.longURL;
    } else {
        urlDatabase[req.session.user_id] = {};
        urlDatabase[req.session.user_id][shortURL] = req.body.longURL;
    }
    res.redirect('http://localhost:8080/urls/');
});


app.get("/u/:id", (req, res) => {
    let longURL = urlDatabase[req.params.id];
    res.redirect(longURL);
});

app.get("/urls", (req, res) => {
    var urName = '';
    if (req.session.user_id) {
        var userId = req.session.user_id;
        var currentUser = users[userId];
        let templateVars = { urls: urlDatabase[userId], user: currentUser };
        res.render("urls_index", templateVars);   
    } else {
        let templateVars = { urls:{}, user: urName };
        res.render("urls_index", templateVars);
    }
});

app.get("/urls/:id", (req, res) => {

    var userId = req.session.user_id;
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
    if (!req.body.username || !req.body.password) {
        res.status(403);
        res.send("Incorrect Username or Password");
    } else {
        for (var key in users) {
            if (users[key].email === req.body.username && bcrypt.compareSync(req.body.password, users[key].password)) {
                req.session['user_id'] = users[key].id;
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
    } else {
        for (var key in users) {
            if (users[key].email === req.body.email) {
                res.status(400);
                res.send("User Already Exist, Please Login");
            }
        }
        users[userID] = {id:userID, email:req.body.email, password:bcrypt.hashSync(req.body.password, 12)};
        req.session['user_id'] = userID;
        res.redirect("/urls");
    }
});

app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.session.user_id][req.params.id];
    res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
    if (urlDatabase[req.session.user_id][req.params.id]) {
    urlDatabase[req.session.user_id][req.params.id] = req.body.longURL;  
    }
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    delete req.session['user_id'];
    delete req.session;
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
