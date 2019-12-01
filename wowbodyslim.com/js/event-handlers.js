(function (window, document, $) {
  'use strict';

  /**
   * Shortcut for $(document).on(...)
   *
   * @param events
   * @param selector
   * @param data
   * @param fn
   */
  function on(events, selector, data, fn) {
    $(document).on(events, selector, data, fn);
  }

    /**
     * Make a POST request with browser regular form POST functionality
     * @param path
     * @param params
     * @param method
     */
  function post(path, params, method = 'post') {
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
  }

  /**
   * Validate photoload inputs and enable\disable submit btn
   */
  function validatePhotoInputs(element = null) {
    // check that current page is the page with reports form
    if ($('#form-week-report').length == 0 && $('#form-wizard-measurements').length == 0) {
      return null;
    }
    if (element === null) {
      return null;
    }
    var originalElement = $.clone(element);
    // set element for case when method calls from body load event
    if (element === null) {
      element = $('#form-week-report').length == 0
        ? $('#form-wizard-measurements')
        : $('#form-week-report');
    }

    var valid = true;
    $(':input', element).not('[type="submit"]').not('[data-display_datepick_inp]')
        // .not('#measurements-fullfacephoto')
        // .not('#measurements-sideviewphoto')
        .each(function (i, el) {
          if (!$(el).val()) {
            valid = false;
            return null;
          }
        });
    // additional check for week report when filled (and not last in level)
    var skipCheck = valid
        && $(element).find('#measurements-fullfacephoto').length < 1
        && $(element).find('#measurements-sideviewphoto').length < 1
        && originalElement == null;
    if (skipCheck) {
      return null;
    }

    valid
        ? $(':input[type="submit"]', element).removeClass('is-disabled')
        : $(':input[type="submit"]', element).not('.is-disabled').addClass('is-disabled');
  }

  $(document).ready(function() {
    validatePhotoInputs();
  });

  /**
   * Handle personal data form loading event.
   */
  on('settings:data-form-loaded', function () {
    reInitSelect();
    reInitTel();
  });

  /**
   * Handle availability of "Save changes" button in personal data form.
   */
  on('keypress change', '#data-form :input', function () {
    var valid = true,
      form = $(this).parents('form'),
      submit = $('button', form);
    $('.form-control, form-control-select', form).each(function () {
      valid &= !!$(this).val();
    });
    valid ? submit.removeClass('is-disabled') : submit.addClass('is-disabled');
  });

  /**
   * Handle notification form checkbox toggling.
   */
  on('change', '#notification-form :input', function () {
    $(this).parents('form').submit();
  });

  /**
   * Handles upload avatar button.
   */
  on('click', '.js-save-upload', function () {
    $(this).parents('form').submit();
  });

  /**
   * Handles search form reset on articles page.
   */
  on('click', '.icon-reset.is-active', function () {
    var el = $(this);
    el.siblings('input').val('');
    el.removeClass('is-active');
    el.parents('form')[0].submit();
  });

  /**
   * Handles 'form-week-report' form on '/my-data' page and
   * 'form-wizard-measurements' form on '/wizard/step/measurements'
   */
  on('keyup change', '#form-week-report, #form-wizard-measurements', function () {
    validatePhotoInputs(this);
  });
  /**
   * Handle useful notification close button click.
   */
  on('click', '.panel__tooltip-close', function () {
    $.post('/useful/notification/solve-notification').fail(function (data) {console.log(data)});
  });
    /**
     * Handler for one click payments
     */
  on('click', '[data-one_click_pay_url]', function () {
      var $btn = $(this);
      var url = $btn.data('one_click_pay_url');
      $btn.addClass('is-disabled');
      $.post(url).fail(function (data) {
        console.log(data);
      }).success(function(response) {
        var acsUrl = response.d3AcsUrl;
        var d3Md = response.d3Md;
        var d3Pareq = response.d3Pareq;
        var statusUrl = $btn.data('status_url');

        post(acsUrl, {
            MD: d3Md,
            PaReq: d3Pareq,
            TermUrl: statusUrl
        });
      });
      return false;
  });
  /**
   * Handle avatar upload in dashboard.
   */
  on('change', '.form-avatar-image', function (e) {
    e.preventDefault();
    var that = this;
    jQuery.ajax({
      url: that.action,
      cache: false,
      type: 'post',
      data: {'avatar-image': $('input.avatar-image', that).val()},
      success: function (response) {
        console.log(response);
        parseResponse(response);
      },
      error: function (response) {
        console.log(response.responseText);
      }
    });
  });
  /**
   * Promocode form
   */
  on('submit', '#promocode-form', function (e) {
    e.preventDefault();
    var that = this;
    jQuery.ajax({
      url: that.action,
      cache: false,
      type: 'post',
      data: $(that).serialize(),
      success: function (response) {
        parseResponse(JSON.parse(response));
      },
      error: function () {
        alert('Something went, please contact us, so that we help you to solve this problem!');
      }
    });
  });
  /**
   * Exercise video ended event handler.
   */
  on('exercise-video-ended', 'body', function () {
    var next = $('.program__col ul li.is-active').next('li');
    if (next.length > 0) {
      next.find('a').click();
    }
  });

  /**
   * Handles "Unfreeze" button on setting freeze page when program is frozen.
   */
  on('click', '.unfreeze', function (e) {
    e.preventDefault();
    var that = $(this);
    jQuery.ajax({
      url: that.data('action'),
      cache: false,
      type: 'post',
      data: {'confirmed': true}
      //success: function (response) {
      //  parseResponse(JSON.parse(response));
      //},
      //error: function () {
      //  alert('Something went, please contact us, so that we help you to solve this problem!');
      //}
    });
  });
  /**
   * Handles "Later" button in make measurements modal.
   */
  on('click', '.make-measurements-later', function (e) {
    e.preventDefault();
    $.post($(this).data('action'));
  });

  on('click', '.toggle-link', function(e) {
    var url = $(e.target).attr('href');
    var topOffset = $('.program__title').eq(0).offset().top;
    $.pjax({url: url, container: '#exercises-pjax-container', scrollTo: topOffset})
  });

  on('pjax:success', function(e) {
      var target = e.target;
      if (target.id === 'exercises-pjax-container') {
          window.PublicAPI.refreshProgramPage();
          window.PublicAPI.refreshPopup();
          $('html, body').animate({scrollTop: $('.program__title').eq(0).offset().top}, 1000);
      }
  })
}(window, document, jQuery));
