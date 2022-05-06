const express = require('express');
const Training = require('../models/training');
const authenticate = require('../../src/middleware/authenticate');
const User = require('../models/user');
const router = new express.Router()
//vykresleni formulře pro vytvoření treninku
router.get('/training/create', authenticate, async (req, res) => {
    const userID = {_id: req.session.user_id};
    const userRole = await User.findOne(userID, 'role');
    const training =await searchTraining(userID);
    if (!training) {
        res.status(500).send()
    }
    training.sort(function (a, b) {
        if (a.start < b.start) {
            return -1;
        }
        if (a.start > b.start) {
            return 1;
        }
        return 0;
    });
    if (userRole.role === 2) {

        res.render('trainingAdd-admin.hbs', {
            training: dateParseTrainings(training),
            message:''
        });
    }
    if (userRole.role === 1) {

        res.render('trainingAdd.hbs', {
            training: dateParseTrainings(training),
            message:''
        });
    }

});

//vytvoření treninku
router.post('/training/create', authenticate, async (req, res) => {
    const user_id = req.session.user_id;
    const user = await User.findOne({_id: req.session.user_id}, 'name');
    const {start, end} = req.body;
    if (start < end) {
        const training = new Training({
            title: "Trenink: " + user.name,
            start: start,
            end: end,
            owner: user_id
        })
        try {
            await training.save();
            res.status(201);
            res.redirect('/training/create');
        } catch (e) {
            res.status(400).send(e);
        }
    }
    else{
        const userID = {_id: req.session.user_id};
        const userRole = await User.findOne(userID, 'role');
        const training =await searchTraining(userID);
        if (!training) {
            res.status(500).send()
        }
        training.sort(function (a, b) {
            if (a.start < b.start) {
                return -1;
            }
            if (a.start > b.start) {
                return 1;
            }
            return 0;
        });
        if (userRole.role === 2) {

            res.render('trainingAdd-admin.hbs', {
                training: dateParseTrainings(training),
                message:'Konec nemuže být dříve než začátek'
            });
        }
        if (userRole.role === 1) {

            res.render('trainingAdd.hbs', {
                training: dateParseTrainings(training),
                message:'Konec nemuže být dříve než začátek'
            });
        }
    }
});

router.get('/:id/training/delete', authenticate, async (req, res) => {
    const delete_training_id = {_id: req.params.id, owner: req.session.user_id};
    try {
        const training = await Training.findOne(delete_training_id);
        if (!training) {
            return res.redirect('/training/create');
        }
        res.render('training_delete.hbs', {
            message: deleteMessageTraining(training),
            training: training,
        })
    } catch (e) {
        res.status(500).send();
    }
});

router.delete('/:id/training/delete', authenticate, async (req, res) => {
    const delete_training_id = {_id: req.params.id, owner: req.session.user_id};
    try {
        const training = await Training.findOneAndDelete(delete_training_id);
        if (!training) {
            return res.status(404).send()
        }
        res.redirect('/events/create');
    } catch (e) {
        res.status(500).send();
    }
});
router.get('/*', (req, res) => {
    res.render('404.hbs', {
        title: 'Chyba 404: stránka nenalezena'
    })
});
module.exports = router;

const dateParseTrainings = (trainings) => {
    for (let i = 0; i < trainings.length; i++) {
        const startArray = trainings[i].start.split("T");
        trainings[i].start = startArray[0] + ' ' + startArray[1];
        const endArray = trainings[i].end.split("T");
        trainings[i].end = endArray[0] + ' ' + endArray[1];
    }
    return trainings;
}
const deleteMessageTraining = (training) => {
    const startArray = training.start.split("T");
    const endArray = training.end.split("T");
    return 'Opravdu chete zmazat tento traning se začátkem: ' + startArray[0] + ' ' + startArray[1] + ' a koncem: ' + endArray[0] + ' ' + endArray[1];
}

async function searchTraining  (userID) {
    const search_data = {owner: userID};
    return Training.find(search_data);
}