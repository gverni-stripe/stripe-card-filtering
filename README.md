**Do you want to see this repo in action? Head over [here](https://stripe-card-filtering-demo.glitch.me/)**

# Card filtering 

At times merchants may want to block payments done through a specific card brand or funding type. Since, for compliance reasons, the PAN is provided by the end customer directly to Stripe (e.g. using Stripe Elements) merchants need a way to detect what card brand has been used before confirming the payment. 

This can be achieved using Radar rules, but in this repo we present some examples using: 
* Card Element
* Payment Element 

Below a comparison of the two methods


| Element | Pros | Cons |
| --- | --- | --- |
| `cardElement` |  <li>Card brand is recognised while typing (slightly better UX)</li><li>No beta feature needed</li> | <li>Card funding filtering not possible</li><li>Support for other payment methods requires more effort</li> |
| `paymentElement`   | <li>Easy to add other payment method</li><li>Advanced card filtering (e.g. funding)</li> | <li>Customer need to provide full card number and press pay </li><li>Credit card icon is shown as available</li><li>Beta feature</li> |

For a more in depth comparison of `cardElement` and `paymentElement` check [here](https://stripe.com/docs/payments/payment-card-element-comparison). 

## Use `cardElement` to filter by card brand(s)

This example leverage the [`card.on('change', handle)`](https://stripe.com/docs/js/element/events/on_change?type=cardElement) event handler. Every time there is a change in the `cardElement` the handler can use the [`event.brand`](https://stripe.com/docs/js/element/events/on_change?type=cardElement#element_on_change-handler-brand) to check what card brand has been provided by the customer, e.g: 

```
card.on('change', function (event) {
    if (event.brand === 'amex') {
      // Handle AMEX card
    }
    ...
})
```

Note that this is happening in realtime as soon as the card is recongised (e.g. no need for the customer to provide the full card number)

## Use `paymentElement` to filter by card brand(s) or funding type 

Note: This example uses a [beta feature](https://stripe.com/docs/payments/run-custom-actions-before-confirmation). Contact Stripe sale to enable the feature. 

In this example, the beta `updatePaymentIntent()` is used to fetch the payment intent after the card is provided and before it's confirmed. During this phase, the card attached to the payment intent can be checked, for example to see which brand the card is: 

```
if (result.paymentIntent.payment_method.card.brand === 'amex') {
  // Handle AMEX cards
}
```
# How to use this repo 

* Clone the repo locally 
* Copy `.env.example` to `'/server/.env`
* Fill in the values for the following variables (you can leave the rest as they are)
  * `STRIPE_PUBLISHABLE_KEY`
  * `STRIPE_SECRET_KEY`
* Install dependencies
```
cd server
npm install
```
* Run the server
``
(cd server)
npm start
``
* Open a browser to [`https//localhost:4242`](https//localhost:4242)

