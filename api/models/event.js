const mongoose = require('mongoose');
const Schema = mongoose.Schema

const EventsSchema = new Schema({
    title:{
        type: String,
        required: true,
        trim: true
    },
    start:{
        type:String,
        require:true
    },
    end:{
        type:String,
        require:true
    }
});

EventsSchema.virtual('url').get(function(){
    return '/event/' + this._id
});

const Event = mongoose.model('Event',EventsSchema);

module.exports = Event;
