const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
module.exports = async function(email,token) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  try {
    // let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'SendPulse',
      auth: {
        user: 'codingboards@gmail.com', // generated ethereal user
        pass: 'K8NGGSktdHR55', // generated ethereal password
      },
    }); 
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Fred Foo 👻" <admin@codingboards.com>', // sender address
      to: email, // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: `<b>Hello world?  <a href='http://localhost:3000/email/verify?id=${token}'></b>`, // html body
    });
    console.log('Mail sent to ', email);
    // console.log("Message sent: %s", info.messageId);
    // // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
    // // Preview only available when sending through an Ethereal account
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  } catch (error) {
      console.log(error);
  }
  
}
