const express = require('express');
const cors = require('cors');
const app = express();

// Allow your GitHub Pages frontend to communicate securely
app.use(cors({
    origin: 'https://dtdobbs8325-source.github.io'
}));

app.use(express.json());

// --- YOUR EXISTING BLOG API ROUTES ---
// (Make sure your app.get('/api/posts'), app.post, etc. routes sit right here)

// --- SINGLE PORT DECLARATION AT THE BOTTOM ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});