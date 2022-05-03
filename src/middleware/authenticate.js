const authenticate = async (req, res, next) => {
    if (!req.session.user_id) {
        return res.status(401).redirect('/users')
    }
    next()    
}

module.exports = authenticate