document.addEventListener('DOMContentLoaded', async () => {
  // Load the publishable key from the server. The publishable key
  // is set in your .env file.
  const {publishableKey} = await fetch('/config').then((r) => r.json());
  if (!publishableKey) {
    addMessage(
      'No publishable key returned from the server. Please check `.env` and try again'
    );
    alert('Please set your Stripe publishable API key in the .env file');
  }

  const stripe = Stripe(publishableKey, {
    apiVersion: '2020-08-27',
  });

  function setLoading(loading) {
    // reenable the form.
    submitted = loading;
    if (loading) {
      form.querySelector('#card-error').style.display = 'none';
    }
    form.querySelector('button').disabled = loading;
  }

  // On page load, we create a PaymentIntent on the server so that we have its clientSecret to
  // initialize the instance of Elements below. The PaymentIntent settings configure which payment
  // method types to display in the PaymentElement.
  const {error: backendError, clientSecret} = await fetch(
    '/create-payment-intent'
  ).then((r) => r.json());
  if (backendError) {
    addMessage(backendError.message);
  }
  addMessage(`Client secret returned.`);

  // Initialize Stripe Elements with the PaymentIntent's clientSecret,
  // then mount the payment element.
  var elements = stripe.elements();
  var style = {
    base: {
      color: '#32325d',
      fontFamily: 'Arial, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#32325d',
      },
    },
    invalid: {
      fontFamily: 'Arial, sans-serif',
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  };

  var card = elements.create('card', {style: style});
  // Stripe injects an iframe into the DOM
  card.mount('#card-element');

  card.on('change', function (event) {
    if (event.brand === 'amex') {
      // Display error message
      form.querySelector('#card-error').style.display = 'initial';
      form.querySelector('#card-error').textContent =
        'AMEX not supported. Please use another card';
      document.querySelector('button').disabled = true;
      return;
    } else {
      form.querySelector('#card-error').style.display = 'none';
    }

    // Disable the Pay button if there are no card details in the Element
    document.querySelector('button').disabled = event.empty;
    document.querySelector('#card-error').textContent = event.error
      ? event.error.message
      : '';
  });

  var form = document.getElementById('payment-form');
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    setLoading(true);
    // Confirm the card payment given the clientSecret
    // from the payment intent that was just created on
    // the server.
    const {error: stripeError} = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
      }
    });

    if (stripeError) {
      addMessage(stripeError.message);
      setLoading(false);
      return;
    }

    // Redirect to success page 
    window.location.href = `${window.location.origin}/return.html?payment_intent_client_secret=${clientSecret}&redirect_status=succeeded`
  });