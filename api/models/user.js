const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');


const Schema = mongoose.Schema

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Špatny email")
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Heslo nesmí obsahovat "password"')
            }
        }
    },
    member: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: Number,
        required: true
    }
});

UserSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

UserSchema.statics.findByCredentials = async (email, password) => {
    // console.log(`Hledám email ${email}, mám heslo ${password}`)
    const user = await User.findOne({email})
    if (!user) {
        // const error = 'Přihlášení selhalo - uživatel nenalezen'
        // console.log(error)
        return null
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        // const error = 'Přihlášení selhalo - údaje neodpovídají'
        // console.log(error)
        return null
    }
    return user
}

UserSchema.pre('save', async function (next) {

    const user = this
    //if (user.isModified('password')) {
    // umožníme uživateli uložit stejné heslo
    user.password = await bcrypt.hash(user.password, 12)
    //}
    next()
})

const User = mongoose.model('User', UserSchema)

module.exports = User