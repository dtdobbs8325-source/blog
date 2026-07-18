const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to handle JSON data and serve your front-end files
app.use(express.json());
app.use(express.static('public')); // Puts your HTML/CSS/JS in a folder named 'public'

// Allow your GitHub Pages frontend to securely communicate with this server
app.use(cors({
    origin: 'https://dtdobbs8325-source.github.io'
}));

app.use(express.json());

const JSON_FILE = path.join(__dirname, 'posts.json');

// ... your existing routes (/api/posts, etc.) ...

// CRITICAL: Use the environment port Render assigns, fallback to 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// 1. GET ROUTE: Delivers all blog posts to the front end
app.get('/api/posts', (req, res) => {
    fs.readFile(JSON_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).send("Error reading posts.");
        res.json(JSON.parse(data));
    });
});

// 2. POST ROUTE: Receives a new post and saves it to the JSON file
app.post('/api/posts', (req, res) => {
    fs.readFile(JSON_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).send("Error reading posts.");
        
        const posts = JSON.parse(data);
        const newPost = {
            id: Date.now(), // Simple unique ID
            title: req.body.title,
            content: req.body.content,
            date: new Date().toISOString().split('T')[0]
        };
        
        posts.push(newPost);
        
        // Write the updated array back to the file
        fs.writeFile(JSON_FILE, JSON.stringify(posts, null, 2), (err) => {
            if (err) return res.status(500).send("Error saving post.");
            res.status(201).json(newPost);
        });
    });
});

// 3. PUT ROUTE: Update an existing post by its ID
app.put('/api/posts/:id', (req, res) => {
    const targetId = parseInt(req.params.id);
    
    fs.readFile(JSON_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).send("Error reading posts.");
        
        let posts = JSON.parse(data);
        const postIndex = posts.findIndex(p => p.id === targetId);
        
        if (postIndex === -1) return res.status(404).send("Post not found.");
        
        // Update the content fields, preserving the original ID and date
        posts[postIndex].title = req.body.title;
        posts[postIndex].content = req.body.content;
        
        fs.writeFile(JSON_FILE, JSON.stringify(posts, null, 2), (err) => {
            if (err) return res.status(500).send("Error updating post.");
            res.json(posts[postIndex]);
        });
    });
});

// 4. DELETE ROUTE: Remove a post by its ID
app.delete('/api/posts/:id', (req, res) => {
    const targetId = parseInt(req.params.id);
    
    fs.readFile(JSON_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).send("Error reading posts.");
        
        let posts = JSON.parse(data);
        const filteredPosts = posts.filter(p => p.id !== targetId);
        
        if (posts.length === filteredPosts.length) {
            return res.status(404).send("Post not found.");
        }
        
        fs.writeFile(JSON_FILE, JSON.stringify(filteredPosts, null, 2), (err) => {
            if (err) return res.status(500).send("Error deleting post.");
            res.status(204).send(); // 204 means Success, No Content to send back
        });
    });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));