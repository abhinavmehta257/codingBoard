const Joi = require('@hapi/joi');

const registerValidation = data =>{
const schema = Joi.object({
    first_name: Joi.string().min(6).required(),
    last_name: Joi.string().min(0).required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
    confirm_password:Joi.string().required().valid(Joi.ref('password')),
});

return schema.validate(data);
};

const loginValidation = data =>{
    const schema = Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    });
    
    return schema.validate(data);
};

const scheduleValidation = data =>{
    const schema = new Joi.object({
        topic:Joi.string().min(3).required(),
        lang: Joi.required(),
        date: Joi.date().required(),
        time: Joi.string().regex(/^([0-9]{2})\:([0-9]{2})$/)
    });

    return schema.validate(data);
}

module.exports.scheduleValidation = scheduleValidation;
module.exports.loginValidation = loginValidation;
module.exports.registerValidation = registerValidation;