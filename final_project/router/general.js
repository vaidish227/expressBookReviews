const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {

  let username = req.body.username;
  let password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Username and password are not provided correctly"});
  }

  if(!isValid(username)) {
      users.push({"username":username, "password" : password});
      return res.status(200).json({ message: "user registered successfully.", users });
  } else {
    return res.status(404).json({message: "Username already exists"});
  }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
   res.send(JSON.stringify({books}, null, 4));
});

public_users.get('/asyncBooks', async function (req, res) {

    try {
        let response = await axios.get("http://localhost:5000/");
        return res.status(200).json(response.data);
        
      } catch (error) {
        return res.status(500).json({message: "Error getting book list"});
      }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.json(books[isbn]);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
 });

 public_users.get('/asyncBooks/isbn/:isbn', async function (req, res) {
  let {isbn} = req.params;
  axios.get(`http://localhost:5000/isbn/${isbn}`)
  .then(function(response){
    return res.status(200).json(response.data);
  })
  .catch(function(error){
      return res.status(500).json({message: "Error while fetching book details with ISBN"})
  })
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author.toLowerCase();
    const filteredBooks = Object.values(books).filter(book => book.author.toLowerCase().includes(author));
    if(filteredBooks.length > 0){
        return res.status(200).json(filteredBooks);
    }
    else{
        return res.status(404).json({message: "Book not found"});  
    }
        
});

public_users.get("/asyncBooks/author/:author", function (req,res) {
    let {author} = req.params;
    axios.get(`http://localhost:5000/author/${author}`)
    .then(function(response){
      return res.status(200).json(response.data);
    })
    .catch(function(error){
        return res.status(500).json({message: "Error while fetching book details with author"})
    })
  });

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.toLowerCase();
    const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(title));
    if(filteredBooks.length > 0){
        return res.status(200).json(filteredBooks);
    }
    else{
        return res.status(404).json({message: "Book not found"});  
    }

});

public_users.get('/asyncBooks/title/:title', async function (req, res) {
    let {title} = req.params;
    try {
        let response = await axios.get(`http://localhost:5000/title/${title}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({message: "Error while fetching book details with title"});
      }
   
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
