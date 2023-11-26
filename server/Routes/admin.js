const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { route } = require('./main');

const adminLayout = '../views/layouts/admin'
const jwtSecret = process.env.JWT_SECRET


//check login
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token){
        return res.status(401).json({message: "unauthorized"});
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({message: 'unatuhorized'});
    }
}

//Admin- Login Page

router.get('/admin', async (req, res)=> {
    try {
        const locals = {
            title: "Admin",
            description: "Simple Blog created with NodeJs, Express and MongoDB"
        }

        res.render('admin/index', {locals, layout: adminLayout});
    } catch (error) {
        console.log(error);
    }
})

//Post/
//Admin - Check Login
router.post('/admin', async (req, res)=> {
    try {
        const {username, password} = req.body;
        
        const user = await User.findOne({username});

        if(!user){
            return res.status(401).json({message: 'Invalid Credentials'});
        }

        const isPwdValid = await bcrypt.compare(password, user.password);

        if(!isPwdValid){
            return res.status(401).json({message: 'Invalid Credentials'});
        }

        const token = jwt.sign({userId: user._id}, jwtSecret);
        res.cookie('token', token, {httpOnly: true});
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
})


//POST Admin - Dashboard
router.get('/dashboard',authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: 'Dashboard',
            description: 'Simple blog creataed with NodeJS, Express and MongoDB'
        }

        const data = await Post.find();
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);   
    }

});

// GET Admin - Create new post
router.get('/add-post',authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: 'Add Post',
            description: 'Simple blog creataed with NodeJS, Express and MongoDB'
        }

        const data = await Post.find();
        res.render('admin/add-post', {
            locals,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);   
    }
});

// POST Admin - Create new post
router.post('/add-post', authMiddleware, async (req, res) => {
    try {
        const newPost = new Post({
            title: req.body.title,
            body: req.body.body
        });

        await Post.create(newPost);
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});


//Post/
//Admin - register

router.post('/register', async (req, res) => {
    const {username, password} = req.body;
    const hashedPwd = await bcrypt.hash(password, 10);

    try {
        const user = await User.create({username, password: hashedPwd});
        res.status(201).json({message: 'User Created'}, user);
    } catch (error) {
        if(error.code === 11000){
            res.status(409).json({message: 'Alredy registered'});
        }
        res.status(500).json({message: 'Server not responding'});
    }
});

//GET Admin - Create New Post
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Edit Post",
            description: "Free NodeJs User Management System",
        };

        const data = await Post.findOne({_id: req.params.id});

        res.render('admin/edit-post', {
            locals,
            data, 
            layout: adminLayout
        })
    } catch (error) {
        console.log(error);
    }
});

//PUT Admin- Create New Post
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        });

        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});


//DELETE Admin - Delete Post
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

    try {
      await Post.deleteOne( { _id: req.params.id } );
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
  
  });


//GET Admin Logout
router.get('/logout', authMiddleware, (req, res) => {
    res.clearCookie('token');
    // res.send('<script>alert("Logout Successfully")</script>');
    res.redirect('/');
});
module.exports = router;