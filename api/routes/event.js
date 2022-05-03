const express = require('express');
const router = express.Router();
const Event = require("../models/event");
const authenticate = require('../../src/middleware/authenticate');
const User = require('../models/user');


router.get('/events/create', authenticate, async (req, res, next) => {
    const userID = {_id: req.session.user_id};
    const user = await User.findOne(userID, 'role');

    if (user.role === 2) {
        Event.find({}, {})
            .exec((err, list_Event) => {
                if (err) {
                    return next(err);
                }
                //seřazení eventů podle datumu
                list_Event.sort(function (a, b) {
                    if (a.start < b.start) {
                        return -1;
                    }
                    if (a.start > b.start) {
                        return 1;
                    }
                    return 0;
                });

                res.render('events-form.hbs', {
                    title: 'vytvoření akce',
                    buttonComand: "Vytvořit", events: list_Event
                })
            })
    }
    if (user.role === 1) {
        res.render('notPermission.hbs', {});
    }
});

router.post('/events/create', (req, res,next) => {
    const description = req.body.description;
    const start = req.body.start;
    const end = req.body.end;
    const event = new Event({
        title: description, start: start, end: end
    })

    event.save(err => {
        if (err) {
            return next(err)
        }
        res.redirect('/events/create');
    })
});

//formulař pro vymazání eventu
router.get('/event/:id/delete',authenticate,async (req,res) =>{
    const userID = {_id: req.session.user_id};
    const userRole = await User.findOne(userID, 'role');
    const delete_event_id = {_id: req.params.id};
    try {
        const event = await Event.findOne(delete_event_id);
        if(!event){
            return res.redirect('events-form.hbs');
        }
        if(userRole.role === 2){
            res.render('events_delete.hbs',{
                message:'Opravdu chete zmazat tento event: ' + event.title ,
                event: event,
            });
        }if(userRole.role === 1){
            res.render('notPermission.hbs', {});
        }

    }catch (e){
        res.status(500).send();
    }
});
//vymazání eventu
router.delete('/event/:id/event/delete', authenticate,async (req,res)=>{
    console.log("aaaaaaaaaaaaaa")
    const delete_event_id = {_id: req.params.id};
    try {
        const event = await Event.findOneAndDelete(delete_event_id);
        if (!event){
            return res.status(404).send()
        }
        res.redirect('/events/create');
    }catch (e){
        res.status(500).send();
    }
});

//formuluř pro upravu eventu
router.get('/event/:id/update',authenticate,async (req,res) =>{
    const userID = {_id: req.session.user_id};
    const userRole = await User.findOne(userID, 'role');
    const delete_event_id = {_id: req.params.id};
    try {
        const event = await Event.findOne(delete_event_id);
        if(!event){
            return res.redirect('events-form.hbs');
        }
        if(userRole.role === 2){ res.render('events_update.hbs',{
            event: event,
            buttonComand:'aktualizovat'
        })
        }if(userRole.role === 1){
            res.render('notPermission.hbs', {});
        }

    }catch (e){
        res.status(500).send();
    }
});
//aktualzicae eventu
router.patch('/event/:id/event/update',authenticate,async (req,res) =>{
    const update_event_id = {_id: req.params.id};
    const update_options = {useFindAndModify: false, new: true, runValidators: true}
    try {
        const event = await Event.findOneAndUpdate(update_event_id,req.body,update_options);
        if(!event){
            return res.status(404).send();
        }
        res.redirect('/events/create');
    }catch (e){
        res.status(500).send();
    }
});


module.exports = router;
