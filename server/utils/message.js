const moment = require('moment');

let generateMessage = (from, text, to) => {
  return {
    from,
    text,
    to,
    createdAt: moment().valueOf()
  };
};

module.exports = {generateMessage};
