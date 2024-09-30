// Import the Express module
const express = require('express');
const bodyParser = require('body-parser')


// Create an instance of Express
const app = express();
// Middleware for parsing JSON bodies
app.use(bodyParser.text())

// Define the port where the app will listen
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
//app.use(express.json());

 
// Define a GET endpoint at /api/data
app.get('/api/data', (req, res) => {
    res.json({
        message: 'Hello, this is your data!',
        success: true
    });
    console.log(req);
});
// Define a POST endpoint at /api/message
//app.post('/api/message', (req, res) => {
    app.post('/api/data', (req, res) => {
    const { message } = req.body; // Destructure the 'message' from the request body

    // Log the message to the console
    console.log('Message received:', req.body);

    // Respond back with a success message
    res.json({
        status: 'success',
        receivedMessage: message
    });
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
