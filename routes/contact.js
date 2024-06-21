const express = require('express');
const router = express.Router();

// GET request handler for rendering the contact form
router.get('/', (req, res) => {
    res.render('contact'); // Assuming you have a view engine configured
});

// POST request handler for submitting the contact form
router.post('/submit_contact_form', (req, res) => {
    // Assuming you're using body-parser middleware to parse form data
    const { name, email, message } = req.body;

    // Here you can perform any desired action with the form data
    // For example, you could save it to a database, send an email, etc.
    console.log('Received form submission:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Message:', message);

    // Respond to the client
    res.send('Form submission received. Thank you!');
});

module.exports = router;