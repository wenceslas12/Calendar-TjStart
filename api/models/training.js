const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    start:{
        type:String,
        require:true
    },
    end:{
        type:String,
        require:true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

trainingSchema.virtual('url').get(function(){
    return '/training/' + this._id
});

const Training = mongoose.model('Training', trainingSchema);

module.exports = Training;