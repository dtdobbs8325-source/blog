const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

// Allow your GitHub Pages frontend to communicate securely
app.use(cors({
    origin: 'https://dtdobbs8325-source.github.io'
}));

app.use(express.json());

// Path to the JSON file where posts will be stored dynamically
const DATA_FILE = path.join(__dirname, 'posts.json');

// Helper function to read posts from the JSON file safely
function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error("Error reading data file:", error);
        return [];
    }
}

// Helper function to write posts to the JSON file safely
function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing to data file:", error);
    }
}

// 1. GET: Fetch all blog posts
app.get('/api/posts', (req, res) => {
    const posts = readData();
    res.json(posts);
});

// 2. POST: Create a brand new blog post
app.post('/api/posts', (req, res) => {
    const posts = readData();
    const newPost = {
        id: Date.now(), // Unique timestamp ID
        title: req.body.title,
        content: req.body.content,
        date: new Date().toLocaleDateString()
    };
    posts.push(newPost);
    writeData(posts);
    res.status(201).json(newPost);
});

// 3. PUT: Update an existing post by ID
app.put('/api/posts/:id', (req, res) => {
    const posts = readData();
    const postId = parseInt(req.params.id);
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex !== -1) {
        posts[postIndex].title = req.body.title;
        posts[postIndex].content = req.body.content;
        writeData(posts);
        res.json(posts[postIndex]);
    } else {
        res.status(404).json({ message: "Post not found" });
    }
});

// 4. DELETE: Remove a post by ID
app.delete('/api/posts/:id', (req, res) => {
    const posts = readData();
    const postId = parseInt(req.params.id);
    const updatedPosts = posts.filter(p => p.id !== postId);

    if (posts.length !== updatedPosts.length) {
        writeData(updatedPosts);
        res.json({ message: "Post deleted successfully" });
    } else {
        res.status(404).json({ message: "Post not found" });
    }
});

// --- SINGLE PORT DECLARATION AT THE BOTTOM ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});