/**
* index.js
* This is your main app entry point
*/

const express = require('express');
const bodyParser = require("body-parser");
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//////////////////// Login functionality start////////////////////////
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');
app.use(session({
    secret: 'cm2040',
    resave: false,
    saveUninitialized: false, 
    cookie: { secure: false } 
  }));

app.get('/login', (req, res) => {
    res.render('login', { message: '' });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const checkUserQuery = "SELECT * FROM users WHERE email = ?";
    console.error(password, email);


    global.db.get(checkUserQuery, [email], (err, user) => {
        if (err) {
            console.error(err.message);
            res.render('login', { message: "An error occurred. Please try again." });
        } else if (!user) {
            console.error('no user exists with that email');
            res.render('login', { message: "Incorrect email or password." });
        } else {
            bcrypt.compare(password, user.password, function(err, result) {
                if (result) {
                    console.error('login succesful');

                    req.session.user_id = user.user_id;
                    res.redirect('/author');
                } else {
                    console.error('incorrect password');

                    res.render('login', { message: "Incorrect email or password." });
                }
            });
        }
    });
});

app.get('/register', (req, res) => {
    res.render('register', { message: '' });
});

app.post('/register', (req, res) => {
    const { email, full_name, password } = req.body;
    const checkUserQuery = "SELECT * FROM users WHERE email = ?";

    global.db.get(checkUserQuery, [email], (err, user) => {
        if (err) {
            console.error(err.message);
            res.render('register', { message: "An error occurred. Please try again." });
        } else if (user) {
            res.render('register', { message: "Email already registered. Please log in or use a different email." });
        } else {
            bcrypt.hash(password, saltRounds, function(hashErr, hash) {
                if (hashErr) {
                    console.error(hashErr.message);
                    res.render('register', { message: "An error occurred during registration. Please try again." });
                } else {
                    const insertUserQuery = "INSERT INTO users (email, full_name, password) VALUES (?, ?, ?)";
                    global.db.run(insertUserQuery, [email, full_name, hash], function(insertErr) {
                        if (insertErr) {
                            console.error(insertErr.message);
                            res.render('register', { message: "An error occurred during registration. Please try again." });
                        } else {
                            req.session.user_id = this.lastID;
                            res.redirect('/author');
                        }
                    });
                }
            });
        }
    });
});


function isAuthenticated(req, res, next) {
    if (req.session.user_id) {
        next();
    } else {
        console.error('session not authorised');
        res.redirect('/login');
    }
}

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

//////////////////// Login functionality end////////////////////////

// Set up express, body-parser, and EJS
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// Set up SQLite
global.db = new sqlite3.Database('./database.db', (err) => {
    if(err){
        console.error(err.message);
        process.exit(1);
    } else {
        console.log("Database connected");
        global.db.run("PRAGMA foreign_keys=ON");
    }
});

// Handle requests to the home page 
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/author', isAuthenticated, (req, res) => {
    // Fetch blog settings
    const settingsQuery = "SELECT * FROM blog_settings WHERE setting_id = 1"; // Assuming you have a single settings row

    global.db.get(settingsQuery, [], (err, settings) => {
        if (err) {
            console.error(err.message);
            res.redirect('/');
        } else {
            // Fetch published articles
            const publishedQuery = "SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC";
            // Fetch draft articles
            const draftQuery = "SELECT * FROM blog_posts WHERE status = 'draft' ORDER BY created_at DESC";

            // Execute both queries for articles
            global.db.all(publishedQuery, [], (err, publishedArticles) => {
                if (err) {
                    console.error(err.message);
                    res.redirect('/');
                } else {
                    global.db.all(draftQuery, [], (err, draftArticles) => {
                        if (err) {
                            console.error(err.message);
                            res.redirect('/');
                        } else {
                            // Render the Author Home Page with the list of articles and settings
                            res.render('author-home', {
                                blogTitle: settings.blog_title,
                                authorName: settings.author_name,
                                publishedArticles: publishedArticles,
                                draftArticles: draftArticles
                            });
                        }
                    });
                }
            });
        }
    });
});

app.get('/author/settings', (req, res) => {
    const settingsQuery = "SELECT * FROM blog_settings WHERE setting_id = 1"; // Assuming you have a single settings row

    global.db.get(settingsQuery, [], (err, settings) => {
        if (err) {
            console.error(err.message);
            res.redirect('/author');
        } else {
            res.render('author-settings', {
                blogTitle: settings.blog_title,
                authorName: settings.author_name
            });
        }
    });
});

app.post('/author/settings/update', (req, res) => {
    const { blogTitle, authorName } = req.body;
    
    const updateSettingsQuery = "UPDATE blog_settings SET blog_title = ?, author_name = ? WHERE setting_id = 1"; // Assuming a single settings row

    global.db.run(updateSettingsQuery, [blogTitle, authorName], function(err) {
        if (err) {
            console.error(err.message);
            res.redirect('/author/settings');
        } else {
            res.redirect('/author');
        }
    });
});

// Route for the Reader Home Page
app.get('/reader', (req, res) => {
    const settingsQuery = "SELECT * FROM blog_settings WHERE setting_id = 1";
    const publishedQuery = "SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC";

    global.db.get(settingsQuery, [], (err, settings) => {
        if (err) {
            console.error(err.message);
            res.redirect('/');
        } else {
            global.db.all(publishedQuery, [], (err, publishedArticles) => {
                if (err) {
                    console.error(err.message);
                    res.redirect('/');
                } else {
                    res.render('reader-home', {
                        blogTitle: settings.blog_title,
                        authorName: settings.author_name,
                        publishedArticles: publishedArticles
                    });
                }
            });
        }
    });
});

// Route for the Reader Article Page
app.get('/reader/article/:id', (req, res) => {
    // Increment the read count for the article
    const incrementViewCount = "UPDATE blog_posts SET read_count = read_count + 1 WHERE post_id = ? AND status = 'published'";
    
    global.db.run(incrementViewCount, [req.params.id], function(err) {
        if (err) {
            console.error(err.message);
            return res.redirect('/reader');
        }

        // Once the view count has been incremented, get the article and comments
        const articleQuery = "SELECT * FROM blog_posts WHERE post_id = ? AND status = 'published'";
        const commentsQuery = "SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC";

        global.db.get(articleQuery, [req.params.id], (err, article) => {
            if (err || !article) {
                console.error(err ? err.message : "Article not found");
                return res.redirect('/reader');
            } else {
                global.db.all(commentsQuery, [req.params.id], (err, comments) => {
                    if (err) {
                        console.error(err.message);
                        return res.redirect('/reader');
                    } else {
                        // Render the reader-article page and pass the updated article and comments
                        res.render('reader-article', {
                            article: article,
                            comments: comments
                        });
                    }
                });
            }
        });
    });
});

// Handle Like Action
app.post('/reader/article/:id/like', (req, res) => {
    const updateLikeQuery = "UPDATE blog_posts SET like_count = like_count + 1 WHERE post_id = ?";
    
    global.db.run(updateLikeQuery, [req.params.id], function(err) {
        if (err) {
            console.error(err.message);
        }
        res.redirect('/reader/article/' + req.params.id);
    });
});

// Handle Comments on Posts
app.post('/reader/article/:id/comment', (req, res) => {
    const { commenterName, commentText } = req.body;
    const insertCommentQuery = "INSERT INTO comments (post_id, commenter_name, comment_text) VALUES (?, ?, ?)";

    global.db.run(insertCommentQuery, [req.params.id, commenterName, commentText], function(err) {
        if (err) {
            console.error(err.message);
        }
        res.redirect('/reader/article/' + req.params.id);
    });
});



// Route to create a new draft article and redirect to edit
app.get('/author/create', (req, res) => {
    const insertDraftQuery = "INSERT INTO blog_posts (title, content, author_id, status) VALUES (?, ?, ?, 'draft')";
    const defaultTitle = "New Title";
    const defaultContent = "Write your article here...";
    const authorId = 1; // Replace with the current user's ID

    global.db.run(insertDraftQuery, [defaultTitle, defaultContent, authorId], function(err) {
        if (err) {
            console.error(err.message);
            res.redirect('/author');
        } else {
            const newDraftId = this.lastID;
            res.redirect(`/author/edit/${newDraftId}`);
        }
    });
});

// Route for the Author Edit Article Page
app.get('/author/edit/:id', (req, res) => {
    const query = "SELECT * FROM blog_posts WHERE post_id = ?";
    global.db.get(query, [req.params.id], (err, row) => {
        if (err) {
            console.error(err.message);
            res.redirect('/author');
        } else {
            if (row) {
                // Render the edit page with the draft article's data
                res.render('author-edit-article', {
                    articleId: req.params.id,
                    articleTitle: row.title,
                    articleContent: row.content,
                    createdAt: row.created_at,
                    lastModified: row.updated_at
                });
            } else {
                res.redirect('/author');
            }
        }
    });
});

app.post('/author/edit/:id', (req, res) => {
    const { title, content } = req.body;
    const articleId = req.params.id;
        // Ensure title is not null or empty
        if (!title || title.trim() === '') {
            // Handle error: Title is required
            return res.redirect('/author/edit/' + req.params.id);
        }

    const updateQuery = "UPDATE blog_posts SET title = ?, content = ?, updated_at = datetime('now') WHERE post_id = ?";
    global.db.run(updateQuery, [title, content, articleId], function(err) {
        if (err) {
            console.error(err.message);
            res.redirect('/author/edit/' + articleId);
        } else {
            res.redirect('/author');
        }
    });
});

// Delete article route
app.post('/author/delete/:id', (req, res) => {
    const postId = req.params.id;
    const deleteCommentsQuery = "DELETE FROM comments WHERE post_id = ?";
    const deleteLikesQuery = "DELETE FROM likes WHERE post_id = ?";

    // First, delete associated comments
    global.db.run(deleteCommentsQuery, [postId], (err) => {
        if (err) {
            console.error(err.message);
            return res.redirect('/author');
        }

        // Next, delete associated likes
        global.db.run(deleteLikesQuery, [postId], (err) => {
            if (err) {
                console.error(err.message);
                return res.redirect('/author');
            }

            // Finally, delete the blog post
            const deletePostQuery = "DELETE FROM blog_posts WHERE post_id = ?";
            global.db.run(deletePostQuery, [postId], (err) => {
                if (err) {
                    console.error(err.message);
                    return res.redirect('/author');
                }

                res.redirect('/author');
            });
        });
    });
});

// Publish article route
app.post('/author/publish/:id', (req, res) => {
    const publishQuery = "UPDATE blog_posts SET status = 'published', published_at = datetime('now') WHERE post_id = ?";
    global.db.run(publishQuery, [req.params.id], (err) => {
        if (err) {
            console.error(err.message);
            res.redirect('/author');
        } else {
            res.redirect('/author');
        }
    });
    
});


// Add all the route handlers in usersRoutes to the app under the path /users
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

// Make the web application listen for HTTP requests
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});