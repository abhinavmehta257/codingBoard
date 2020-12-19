const router = require('express').Router();
const User = require("../model/User");
const bodyParser = require('body-parser');

dotenv = require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_KEY);

router.post('/create-checkout-session', async(req,res)=>{
    const session = await stripe.checkout.sessions.create({
        success_url:`http://${req.get('host')}/payment/success?id={CHECKOUT_SESSION_ID}`,
        cancel_url : `http://${req.get('host')}/payment/cancel`,
        payment_method_types : ['card'],
        mode:'subscription',
        allow_promotion_codes:true,
        line_items:[{
            price:process.env.PRICE_MONTHLY,
            quantity:1
        }]
    });
    res.json({
        id:session.id
    })
});

router.get('/success',auth, async (req,res) =>{
  if(req.query.id){
    const session = await stripe.checkout.sessions.retrieve(req.query.id).catch(err => console.log(err));
    customerId = session.customer;
    amount = session.amount_total/100;
    return res.render('payment_success',{customerId, amount});
  }
    res.render('payment_cancel');
});
router.get('/cancel',auth, async (req,res) =>{
  res.render('payment_cancel');
});


router.post("/stripe-webhook", async (req, res) => {
  let eventType;
  // Check if webhook signing is configured.
  const webhookSecret = 'whsec_djfUYH867VkjJu0zPljkykDhipBGedOs';
  if (webhookSecret) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];
    // console.log(signature);
    try {
      event = await stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        'whsec_djfUYH867VkjJu0zPljkykDhipBGedOs'
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    console.log(event);
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  switch (event.type) {
      case 'checkout.session.completed':
        // Payment is successful and the subscription is created.
        // You should provision the subscription.
        console.log('subscription completed');
        break;
      case 'invoice.paid':
        // Continue to provision the subscription as payments continue to be made.
        // Store the status in your database and check when a user accesses your service.
        // This approach helps you avoid hitting rate limits.
        break;
      case 'invoice.payment_failed':
        // The payment failed or the customer does not have a valid payment method.
        // The subscription becomes past_due. Notify your customer and send them to the
        // customer portal to update their payment information.
        break;
      default:
      // Unhandled event type
    }

  res.sendStatus(200);
});
module.exports = router;
