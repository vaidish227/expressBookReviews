const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let validusers = users.filter((user)=>{
        return user.username === username
      });
      if(validusers.length > 0){
        return true;
      } else {
        return false;
      }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
      });
      if(validusers.length > 0){
        return true;
      } else {
        return false;
      }
}

//only registered users can login
regd_users.post("/login", (req,res) => {

  const username = req.body.username;
  const password = req.body.password;  
  
  if (!username || !password) {
    return res.status(404).json({message: "Username and password are not provided correctly"});
  }

  if(authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
  
      req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. The user is not registered"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const currentUser = req.session.authorization.username;
    const review = req.query.review;
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(400).json({message: "Invalid ISBN"});
    }

    let bookReviews = books[isbn].reviews;

    if(!bookReviews[currentUser]) {
        bookReviews[currentUser] = review;
        return res.status(200).json({message: "Review added successfully"});
    }

    if (bookReviews.hasOwnProperty(currentUser)){
        bookReviews[currentUser] = review;
        return res.status(200).json({message: "Review modified successfully"});
      }  
    
});

//Delete a book review
regd_users.delete("/auth/review/:isbn", (req,res) => {

    const currentUser = req.session.authorization.username;
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(400).json({message: "Invalid ISBN"});
    }

    let bookReviews = books[isbn].reviews;

    if(Object.keys(bookReviews).length === 0) {
        return res.status(400).json({message: "No existing reviews"});
    } 

    if(!bookReviews[currentUser]) {
        return res.status(400).json({message: "Review not found for the given username"});
    }

    if (bookReviews.hasOwnProperty(currentUser)){
        delete books[isbn].reviews[currentUser];
        return res.status(200).json({message: "Review deleted successfully"});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
