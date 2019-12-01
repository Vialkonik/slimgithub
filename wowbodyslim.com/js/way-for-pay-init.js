/**
 * Handles only button clicks.
 */
$(document).on('click', 'button.payment-btn', function (e) {
  e.preventDefault();
  /** @see common\models\UserPayment status constants, these ones must be equal! */
  var btn = $(this),
    type = btn.data('type'),
    params = btn.data('params'),
    /** @see https://secure.wayforpay.com/server/pay-widget.js */
    wayForPay = new Wayforpay(),
    promoCode = $('input#promo-code').val();

  if (!!promoCode) {
    params['promo_code'] = promoCode;
  }

  // Make call to application action: 'payment/payment/proceed'
  jQuery.ajax({
    cache: false,
    type: 'POST',
    dataType: 'json',
    url: btn.data('url'),
    data: params,
    success: function (response) {
      if (response.success) {
        /** @param {object} data way for pay response data */
        if (type === 'trial' || response.fullDiscount) {
          window.location.replace(btn.data('success-url'));
        } else {
          var handler = function (data) {
                redirectToStatusPage(btn, data);
            },
            onUnknown = function (data) {
              console.error('Something went wrong. Response data:', data);
            };
          // params['straightWidget'] = true;
          wayForPay.run(params, handler, handler, handler, onUnknown);
        }
      }
    },
    error: function (response) {
      alert('Something went wrong.');
      console.error(response);
    }
  });
});

/**
 * Handles only button clicks.
 */
$(document).on('submit', '.payment-form', function (e) {
  e.preventDefault();
  /** @see common\models\UserPayment status constants, these ones must be equal! */
  var chosenEl = $('.payment-input input:checked', this);
  var isFreeFreeze = chosenEl.data('is_free');
  // console.log(chosenEl.data('is_free'));
  if (isFreeFreeze === 1) {
    var $popup = $('[data-popup-id="are-you-sure-common"]');
    var selectedLink = chosenEl.data('link');
    $popup.find('[data-free_freeze_confirm_link=1]').eq(0).attr('href', selectedLink);
    $popup.data('popup').open();
  } else {
    window.location.href = chosenEl.data('redirect');
  }
});

/* superglobal variables, :( */
var promoCertNameIsValid = false,
  promoCertEmailIsValid = false,
  isSubmitting = false;
$(document).on('afterValidateAttribute', '#promo-form-area', function(e, attr, msg) {
  e.preventDefault();
  var isName = attr.id == 'promocertform-name';
  var isEmail = attr.id == 'promocertform-email';
  if (msg.length === 0 && (isName || isEmail)) {
    if (isName) {
      promoCertNameIsValid = true;
    }
    if (isEmail) {
      promoCertEmailIsValid = true;
    }
    if (!isSubmitting && promoCertNameIsValid && promoCertEmailIsValid) {
      $('#payment-form-area').submit();
    }
  }
});

$(document).on('beforeSubmit', '.payment-confirmation-form', function (event) {
  event.preventDefault();
  /** @see common\models\UserPayment status constants, these ones must be equal! */
  var form = $(this),
    type = form.data('type'),
    params = form.data('params'),
    /** @see https://secure.wayforpay.com/server/pay-widget.js */
    wayForPay = new Wayforpay(),
    promoCode = $('input#promo-code').val(),
    friendEmail = $('input#paymentform-friendemail').val(),
    $emailField = $('input#promocertform-email'),
    $nameField = $('input#promocertform-name'),
    emailVal = $emailField.val(),
    nameVal = $nameField.val();

  var $promoForm = $('#promo-form-area');
  if (($promoForm.length > 0) && ($nameField.length > 0) && ($emailField.length > 0)) {
    if (!promoCertNameIsValid) {
      $promoForm.yiiActiveForm('validateAttribute', 'promocertform-name');
    }
    if (!promoCertEmailIsValid) {
      $promoForm.yiiActiveForm('validateAttribute', 'promocertform-email');
    }
    if ($nameField.hasClass('has-error') || $emailField.hasClass('has-error') || !promoCertEmailIsValid || !promoCertNameIsValid) {
      return false;
    }
  }
  isSubmitting = true;

  if (!!promoCode) {
    params['promo_code'] = promoCode;
  }
  if (!!friendEmail) {
    params['friend_email'] = friendEmail;
  }
  if (!!nameVal) {
    params['name'] = nameVal;
  }
  if (!!emailVal) {
    params['clientEmail'] = emailVal;
  }
  // Make call to application action: 'payment/payment/proceed'
  jQuery.ajax({
    cache: false,
    type: 'POST',
    dataType: 'json',
    url: form.data('url'),
    data: params,
    success: function (response) {
      if (response.success) {
        /** @param {object} data way for pay response data */
        if (type === 'trial' || response.fullDiscount) {
          window.location.replace(form.data('success-url'));
        } else {
          var handler = function (data) {
                redirectToStatusPage(form, data);
            },
            onUnknown = function (data) {
              console.error('Something went wrong. Response data:', data);
            };
          // params['straightWidget'] = true;
          wayForPay.run(params, handler, handler, handler, onUnknown);
          isSubmitting = false;
        }
      }
    },
    error: function (response) {
      alert('Something went wrong.');
      console.error(response);
    }
  });

  return false;
});

/**
 * @param {object} btn
 * @param btn
 * @param data
 */
function redirectToStatusPage(btn, data) {
  if (btn.data('success-url') != 'undefined') {
    // window.location.replace(btn.data('success-url'));
    _post(btn.data('success-url'), data);
  }
}

window.addEventListener("message", function (event) {
  var paymentButton = $('.payment-btn'),
    successUrl = paymentButton.data('success'),
    failUrl = paymentButton.data('fail');
  switch (event.data) {
    case "WfpWidgetEventClose": // on widget close
      var redirect = paymentButton.data('redirect');
      // reload page to obtain new order numbers.
      redirect ? window.location.replace(redirect) : location.reload();
      break;
    case "WfpWidgetEventApproved": // on success payment
      paymentButton.attr('data-redirect', successUrl);
      break;
    case "WfpWidgetEventDeclined": // on declined payment
      paymentButton.attr('data-redirect', failUrl);
      break;
    case "WfpWidgetEventPending": // on pending payment @todo make pending page
      paymentButton.attr('data-redirect', failUrl);
      break;
  }
});

function _post(path, params, method='post') {
  const form = document.createElement('form');
  form.method = method;
  form.action = path;

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = key;
      hiddenField.value = params[key];

      form.appendChild(hiddenField);
    }
  }

  document.body.appendChild(form);
  form.submit();
}