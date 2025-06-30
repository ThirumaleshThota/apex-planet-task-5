const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const admin = require("firebase-admin");
const serviceAccount = require("./key.json"); // Make sure this path is correct

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve login.html as homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle signup form submission
app.post('/signupsubmit', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate fields
        if (!username || !email || !password) {
            return res.status(400).send("All fields are required!");
        }

        // Store in Firestore
        await db.collection("userdemo").add({
            username,
            email,
            password
        });

        console.log("✅ Signup successful:", email);

        // Redirect to login page after signup
        res.redirect('/');
    } catch (error) {
        console.error("❌ Error during signup:", error);
        res.status(500).send("Something went wrong during signup!");
    }
});

// Handle login form submission
app.post('/loginsubmit', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send("Email and password are required.");
        }

        const snapshot = await db.collection("userdemo")
            .where("email", "==", email)
            .where("password", "==", password)
            .get();


        // to connect the weather dashboard with login
        if (!snapshot.empty) {
            console.log("✅ Login successful:", email);
            return res.redirect('/Weather.html');

        }

        else {
            console.log("❌ Invalid login attempt:", email);
            res.status(401).send("Invalid email or password.");
        }
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).send("Login failed.");
    }
});





// Start the server
const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});