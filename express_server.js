var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require('cookie-parser')

var app = express()
app.use(cookieParser())

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

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
    if (req.cookies)
     {urName = req.cookies.username;}
    console.log('UserName in urls : ', urName);
    let templateVars = { urls: urlDatabase , username : urName};
    res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
    let templateVars = { 
        shortURL: req.params.id, 
        longURL: urlDatabase[req.params.id] 
    };
    res.render("urls_show", templateVars);
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
    res.cookie('username', req.body.username);
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    // console.log("LOGGED OUT", req.body.username);
    res.clearCookie('username', req.body.username);
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