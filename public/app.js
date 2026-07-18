// Checks if you are running locally; if not, points to your future Render server
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api/posts'
    : 'https://blog-righ.onrender.com'; 

const API_URL = '/api/posts';
const postForm = document.getElementById('post-form');
const blogContainer = document.getElementById('blog-container');

// 1. GET Request: Load and display all posts
async function fetchPosts() {
    try {
        const response = await fetch(API_URL);
        const posts = await response.json();
        
        if (posts.length === 0) {
            blogContainer.innerHTML = '<p>No posts yet. Write the first one above!</p>';
            return;
        }

        // Generate the HTML cards, attaching the post ID directly to the button actions
        blogContainer.innerHTML = posts.reverse().map(post => `
            <article>
                <h2>${post.title}</h2>
                <small>Published on: ${post.date}</small>
                <p>${post.content}</p>
                <div>
                    <button onclick="editPost(${post.id}, '${escapeHtml(post.title)}', '${escapeHtml(post.content)}')">Edit</button>
                    <button style="color: red;" onclick="deletePost(${post.id})">Delete</button>
                </div>
            </article>
        `).join('');
        
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

// Helper utility to safely escape quotes in strings passed to our button attributes
function escapeHtml(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// 2. POST Request: Submit a brand new post
postForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });

        if (response.ok) {
            postForm.reset();
            fetchPosts();
        }
    } catch (error) {
        console.error('Error submitting post:', error);
    }
});

// 3. DELETE Request: Remove a post by ID
async function deletePost(id) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchPosts(); // Refresh the page list
        } else {
            alert("Failed to delete post.");
        }
    } catch (error) {
        console.error('Error deleting post:', error);
    }
}

// 4. PUT Request: Update a post using pop-up prompts
async function editPost(id, oldTitle, oldContent) {
    const newTitle = prompt("Edit Post Title:", oldTitle);
    if (newTitle === null) return; // User canceled

    const newContent = prompt("Edit Post Content:", oldContent);
    if (newContent === null) return; // User canceled

    if (!newTitle.trim() || !newContent.trim()) {
        alert("Title and content cannot be empty.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle, content: newContent })
        });

        if (response.ok) {
            fetchPosts(); // Refresh the page list
        } else {
            alert("Failed to update post.");
        }
    } catch (error) {
        console.error('Error updating post:', error);
    }
}

// Run immediately on page load
window.addEventListener('DOMContentLoaded', fetchPosts);