const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Events = require('../models/event');
const authenticate = require('../../src/middleware/authenticate');
const Training = require('../models/training');
const bcrypt = require("bcryptjs");

router.get('/register', (req, res) => {
    res.render('register.hbs');
});
//  registrování uživatele
router.post('/register', async (req, res) => {
    const {name, email, password, member} = req.body
    const role = 1;
    const user = new User({name, email, password, member, role})
    try {
        await user.save()
        res.status(201)
        res.redirect('/users')
    } catch (e) {
        res.status(400)
        res.redirect('/register')
    }
})

router.get('/', authenticate, async (req, res, next) => {
    const events = await Events.find({}, {_id: 0, title: 1, start: 1, end: 1})
    const trainings = await Training.find({}, {_id: 0, title: 1, start: 1, end: 1});
    const list_events = [...trainings, ...events];
    const userID = {_id: req.session.user_id};
    const user = await User.findOne(userID, 'role');
    if (user.role === 2) {
        res.render('index-admin.hbs', {
            events: list_events,
        })
    }
    if (user.role === 1) {
        res.render('index.hbs', {
            events: list_events,
        })
    }
});

//zobrazení formuláře pro přidaní nového člena
router.get('/addNewUser', authenticate, async (req, res, next) => {
    const userID = {_id: req.session.user_id};
    const user = await User.findOne(userID, 'role');
    if (user.role === 2) {
        User.find({}, {})
            .exec((err, list_User) => {
                    if (err) {
                        return next(err);
                    }
                    res.render('newUser.hbs', {
                        title: 'uživatelé',
                        users: list_User
                    });
                }
            )
    }
    if (user.role === 1) {
        res.render('notPermission.hbs', {});
    }
});

//uložení nového uživatele
router.post('/addNewUser', authenticate, async (req, res) => {
    const {name, email, member, password, role} = req.body;
    const user = new User({name, email, password, member, role});

    try {
        await user.save();
        res.status(201);
        res.redirect('/addNewUser');
    } catch (e) {
        res.status(400);
        res.redirect('/addNewUser');
    }

});
//formulař pro aktualzici samostatně
router.get('/updateUser', authenticate, async (req, res, next) => {
    const userID = {_id: req.session.user_id};
    const userRole = await User.findOne(userID, 'role');
    const search_user = {_id: req.session.user_id};
    try {
        const user = await User.findOne(search_user, 'name email');
        if (!user) {
            res.status(404);
            return res.redirect('/login');
        }
        if (userRole.role === 2) {
            res.render('me-admin.hbs', {
                title: 'Aktualizace uživatele',
                user: user
            });
        }
        if (userRole.role === 1) {
            res.render('me.hbs', {
                title: 'Aktualizace uživatele',
                user: user
            });
        }

    } catch (e) {
        res.status(500);
        res.redirect('login');
    }
});
//aktualizce samostatně
router.patch('/updateUser/update', authenticate, async (req, res) => {
    //const { name, password}  = req.body
    const search_user = {_id: req.session.user_id}
    const update_options = {useFindAndModify: false, new: true, runValidators: true}
    const name = req.body.name;
    const email = req.body.email;
    const member = req.body.member;
    const role = req.body.role;
    const password = await bcrypt.hash(req.body.password, 12);
    const updated_user = {
        name: name,
        email: email,
        member: member,
        role: role,
        password: password
    };
    try {
        const user = await User.findOneAndUpdate(search_user, updated_user, update_options)
        if (!user) {
            res.status(404)
            return res.redirect('/users')
        }
        res.status(200)
        res.redirect('/updateUser');
    } catch (e) {
        res.status(400)
        res.redirect('/')
    }
})
//login formulř
router.get('/users', (req, res) => {
    res.render('login.hbs', {
        title: 'Přihlášení uživatele'
    });
});
//přihlašení uživatele
router.post('/users', async (req, res) => {
    const {email, password} = req.body;
    try {
        const foundUser = await User.findByCredentials(email, password);
        if (!foundUser) {
            res.status(400);
            return res.redirect('/users');
        }
        // console.log(foundUser);
        req.session.user_id = foundUser._id;
        res.status(200);
        res.redirect('/');
    } catch (e) {
        res.status(400);
        res.redirect('/users');
    }
});

//odhlašení uživatele
router.get('/logout', authenticate, (req, res) => {
    req.session.user_id = null;
    res.redirect('/users');
});

//formulař pro vymazaní uživtatele
router.get('/:id/delete', authenticate, async (req, res) => {
    const userID = {_id: req.session.user_id};
    const userRole = await User.findOne(userID, 'role');
    const delete_user_id = {_id: req.params.id};
    try {
        const user = await User.findOne(delete_user_id);
        if (!user) {
            return res.redirect('/addNewUser');
        }
        if(userRole.role === 2){
            res.render('user_delete.hbs', {
                message: 'Opravdu chcete tohoto uživatele zmazat: ' + user.name,
                user: user,
            })
        }if(userRole.role === 1){
            res.render('notPermission.hbs', {});
        }
    } catch (e) {
        res.status(500).send();
    }
});
//vamazaní uživatele
router.delete('/:id/user/delete', authenticate, async (req, res) => {

    const delete_user_id = {_id: req.params.id};
    try {
        const user = await User.findOneAndDelete(delete_user_id);

        if (!user) {
            return res.status(404).send();
        }
        res.redirect('/addNewUser');
    } catch (e) {
        res.status(500).send
    }
});
//formulař aktualizace uživatele
router.get('/:id/update', authenticate, async (req, res) => {
    const userID = {_id: req.session.user_id};
    const userRole = await User.findOne(userID, 'role');
    const update_user_id = {_id: req.params.id};
    try {
        const user = await User.findOne(update_user_id);
        if (!user) {
            res.status(404);
            return res.redirect('/addNewUser');
        }
        if(userRole.role === 2){
            res.render('user_update.hbs', {
            user: user,
        });
        }if(userRole.role === 1){
            res.render('notPermission.hbs', {});
        }

    } catch (e) {
        res.status(500);
        res.redirect('addNewUser');
    }
});
//aktualizace uživatele
router.patch('/:id/user/update', authenticate, async (req, res) => {
    const update_user_id = {_id: req.params.id};
    const update_options = {useFindAndModify: false, new: true, runValidators: true}
    const name = req.body.name;
    const email = req.body.email;
    const member = req.body.member;
    const role = req.body.role;
    const password = await bcrypt.hash(req.body.password, 12);
    const updated_user = {
        name: name,
        email: email,
        member: member,
        role: role,
        password: password
    };

    try {
        const user = await User.findOneAndUpdate(update_user_id, updated_user, update_options);
        if (!user) {
            return res.status(404).send();
        }
        res.redirect('/addNewUser');
    } catch (e) {
        res.status(400).send(e);
    }
});

module.exports = router;