// const express = require('express');
// const session = require('express-session');
// const app = express();

// // Middleware for session management
// app.use(
//   session({
//     secret: 'your-secret-key', // A secret key for session encryption
//     resave: false, // Don't save the session if it hasn't been modified
//     saveUninitialized: true, // Save new sessions
//   })
// );

// // Sample user data (usually fetched from a database)
// const users = [
//   { id: 1, username: 'user1', password: 'password1' },
//   { id: 2, username: 'user2', password: 'password2' },
// ];

// // Sample product data (usually fetched from a database)
// const products = [
//   { id: 1, name: 'Product 1', price: 10 },
//   { id: 2, name: 'Product 2', price: 20 },
//   // Add more products
// ];

// // Middleware for checking if a user is authenticated
// function isAuthenticated(req, res, next) {
//   if (req.session.user) {
//     return next(); // User is authenticated, proceed to the next middleware
//   }
//   res.redirect('/login'); // User is not authenticated, redirect to the login page
// }

// // Routes

// // Home page
// app.get('/', (req, res) => {
//   res.send('Welcome to the e-commerce website!');
// });

// // Login page
// app.get('/login', (req, res) => {
//   res.send('Please log in.');
// });

// // Login form submission
// app.post('/login', (req, res) => {
//   const { username, password } = req.body;
//   const user = users.find((u) => u.username === username && u.password === password);
//   if (user) {
//     req.session.user = user; // Store the authenticated user in the session
//     res.redirect('/dashboard');
//   } else {
//     res.redirect('/login');
//   }
// });

// // Dashboard (requires authentication)
// app.get('/dashboard', isAuthenticated, (req, res) => {
//   const user = req.session.user;
//   const shoppingCart = req.session.cart || []; // Retrieve the user's shopping cart from the session
//   res.send(`Welcome, ${user.username}!<br>Your Shopping Cart: ${JSON.stringify(shoppingCart)}`);
// });

// // Add product to the shopping cart
// app.post('/add-to-cart/:productId', isAuthenticated, (req, res) => {
//   const productId = parseInt(req.params.productId);
//   const product = products.find((p) => p.id === productId);
//   if (product) {
//     if (!req.session.cart) {
//       req.session.cart = []; // Initialize the shopping cart if it doesn't exist in the session
//     }
//     req.session.cart.push(product); // Add the selected product to the shopping cart
//   }
//   res.redirect('/dashboard');
// });

// // Logout
// app.get('/logout', (req, res) => {
//   req.session.destroy(); // Destroy the session to log out the user
//   res.redirect('/login');
// });

// // Start the server
// const PORT = process.env.PORT || 3004;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
