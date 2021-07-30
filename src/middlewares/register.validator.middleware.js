const validator = (validatorSchema) => async  (req, res, next) => {

    try {
        await validatorSchema.validate(req.body)
        next()
    } catch (error) {
        const err = {
            message: error.errors[0],
            statusCode:400
        }
        next(err)
    }
}

module.exports = validator