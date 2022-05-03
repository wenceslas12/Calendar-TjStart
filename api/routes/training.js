const express = require('express');
const Training = require('../models/training');
const authenticate = require('../../src/middleware/authenticate');
const User = require('../models/user');
const router = new express.Router()

//vykresleni formulře pro vytvoření treninku
router.get('/training/create', authenticate, async (req,res) =>{
    const userID = {_id: req.session.user_id};
    const userRole = await User.findOne(userID, 'role');
    const search_data = { owner: req.session.user_id};
    const training = await Training.find(search_data);
    if (!training) {
        res.status(500).send()
    }
    if(userRole.role === 2){
        res.render('trainingAdd-admin.hbs',{
            training:training
        });
    } if(userRole.role === 1){
        res.render('trainingAdd.hbs',{
        training:training
    });}

});

//vytvoření treninku
router.post('/training/create', authenticate,async (req,res) => {
    const user_id = req.session.user_id;
    const user = await User.findOne({_id:req.session.user_id}, 'name');
    const {start, end} = req.body;
    const training = new Training({
        title: "Trenink: " + user.name,
        start:start,
        end: end,
        owner: user_id
    })
    try {
        await training.save();
        res.status(201);
        res.redirect('/training/create');
    }catch (e) {
        res.status(400).send(e);
    }
});

router.get('/:id/training/delete',authenticate,async (req,res) =>{
    const delete_training_id = {_id: req.params.id ,owner: req.session.user_id };
    try {
        const training = await Training.findOne(delete_training_id);
        if(!training){
            return res.redirect('/training/create');
        }
        res.render('training_delete.hbs',{
            message:'Opravdu chete zmazat tento traning se začátkem: ' + training.start  + ' a koncem: ' + training.end,
            training: training,
        })
    }catch (e){
        res.status(500).send();
    }
});

router.delete('/:id/training/delete', authenticate,async (req,res)=>{
    const delete_training_id = {_id: req.params.id, owner: req.session.user_id};
    try {
        const training = await Training.findOneAndDelete(delete_training_id);
        if (!training){
            return res.status(404).send()
        }
        res.redirect('/events/create');
    }catch (e){
        res.status(500).send();
    }
});
router.get('/*', (req,res) =>{
    res.render('404.hbs', {
    title: 'Chyba 404: stránka nenalezena'
})});
module.exports = router;

