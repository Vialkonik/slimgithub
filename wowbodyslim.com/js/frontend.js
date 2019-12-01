function parseResponse(response) {
    var delay = response.delay ? response.delay : 0;
    setTimeout(function () {
        if (response.replaces instanceof Array) {
            for (var i = 0, ilen = response.replaces.length; i < ilen; i++) {
                $(response.replaces[i].what).replaceWith(response.replaces[i].data);
            }
        }
        if (response.append instanceof Array) {
            for (i = 0, ilen = response.append.length; i < ilen; i++) {
                $(response.append[i].what).append(response.append[i].data);
            }
        }
        if (response.content instanceof Array) {
            for (i = 0, ilen = response.content.length; i < ilen; i++) {
                $(response.content[i].what).html(response.content[i].data);
            }
        }
        if (response.add_class instanceof Array) {
            for (i = 0, ilen = response.add_class.length; i < ilen; i++) {
                $(response.add_class[i].what).addClass(response.add_class[i].data);
            }
        }
        if (response.js) {
            $("body").append(response.js);
        }
        if (response.refresh) {
            window.location.reload(true);
        }
        if (response.redirect) {
            window.location.href = response.redirect;
        }
    }, delay)
}

function replaces(response) {
    for (var i = 0, ilen = response.replaces.length; i < ilen; i++) {
        $(response.replaces[i].what).replaceWith(response.replaces[i].data);
    }
}

function executeAjaxRequest(url, data, type, successCallback, completeCallback) {
    var csrfParam = $('meta[name="csrf-param"]').attr('content');
    var csrfToken = $('meta[name="csrf-token"]').attr('content');

    var postData = {};
    if (!type) {
        type = 'GET';
        postData[csrfParam] = csrfToken;
    }
    postData = data ? $.extend(postData, data) : postData;

    jQuery.ajax({
        'cache': false,
        'type': type,
        'dataType': 'json',
        'data': postData,
        'success': successCallback ? successCallback : function (response) {
            parseResponse(response);
        },
        'error': function (response) {
            alert(response.responseText);
        },
        'beforeSend': function () {
        },
        'complete': completeCallback ? completeCallback : function () {
        },
        'url': url
    });
}

$(function () {
    $(document).on('click', '.ajax-link', function (event) {
        event.preventDefault();
        var that = this;
        if ($(that).data('confirm') && !confirm($(that).data('confirm'))) {
            return false;
        }
        var url = $(that).data('url') ? $(that).data('url') : that.href;
        var submitType = $(that).data('submit_type') ? $(that).data('submit_type') : 'GET';
        executeAjaxRequest(url, $(that).data('params'), submitType);
    });

    $(document).on('submit', '.ajax-form', function (event) {
        event.preventDefault();
        var blockClass = 'is-submitting';
        var that = this;

        if (that.classList.contains(blockClass)) {
            return false; // skip if form already submitting data
        }
        that.classList.add(blockClass);

        var formData = new FormData(that);
        jQuery.ajax({
            'cache': false,
            'type': 'POST',
            'dataType': 'json',
            'data': formData,
            'processData': false,
            'contentType': false,
            'success': function (response) {
                parseResponse(response);
                that.classList.remove(blockClass);
            },
            'error': function (response) {
                console.log(response.responseText);
            },
            'beforeSend': function () {
            },
            'complete': function () {
            },
            'url': that.action
        });
    });

    $(document).on("click", ".form-submit", function (e) {
        e.preventDefault();
        var form = $(this).parents('form');
        if (form.length) {
            form.submit();
        } else {
            var formId = $(this).data('id');
            $('#' + formId).submit();
        }
    });

    $(document).on('click', '.sharing a.soc-item, a.soc-item_fb, a.soc-item_vk, a.soc-item_twitter', function (event) {
        var that = $(this);
        if (!that.parents('header, footer').length) {
            event.preventDefault();
            var loc = that.attr('data-url') ? that.attr('data-url') : window.location.href;
            var url = encodeURIComponent(loc);
            switch (true) {
                case that.hasClass('soc-item_fb'):
                    sharePopup('https://www.facebook.com/sharer/sharer.php?' + 'u=' + url);
                    break;
                case that.hasClass('soc-item_twitter'):
                    sharePopup('http://twitter.com/share?url=' + url);
                    break;
                case that.hasClass('soc-item_vk'):
                    sharePopup('http://vk.com/share.php?url=' + url);
                    break;
            }
        }
    });

    $(document).on("click", ".js-to-cart", function (e) {
        e.preventDefault();
        var colorId = null, sizeId = null;
        $('input[name=prod-color]').each(function () {
            if ($(this).prop('checked')) {
                colorId = $(this).val();
            }
        });
        $('input[name=prod-size]').each(function () {
            if ($(this).prop('checked')) {
                sizeId = $(this).val();
            }
        });
        var data = {
            id: colorId,
            size: sizeId
        };
        executeAjaxRequest($(this).data('url'), data, 'get')
    });

    $(document).on('click', 'a.print-btn', function (event) {
        event.preventDefault();

        window.print();
    });

    // Set full phone number
    $(document).on('beforeSubmit', '#registration-form, #data-form', function () {
        var phoneInput = $('.form-control-tel');
        phoneInput.val($('.selected-dial-code')[0].innerText + phoneInput.val());
    });

    // training status bar with hearts - solve training event
    $(document).on('click', '[data-solve_training]', function(e) {
        e.preventDefault();

        var $link = $(this);
        if ($link.data('can_solve') != '1') {
            return;
        }

        executeAjaxRequest($link.attr('href'), {
            day: $link.data('day'),
            num: $link.data('num'),
        }, 'post', function(response) {
            if ($link.data('animation_enabled') == '1') {
                PublicAPI.initTrainStatAnim(function() {
                    setTimeout(function() {
                        parseResponse(response);
                    }, 1000);
                });
            } else {
                parseResponse(response);
                var $currentDayItem = $('.train-stat__item.is-active');
                if ($currentDayItem.length > 0) {
                    $currentDayItem.addClass('is-completed');
                }
            }
        });
    });

    /* currency change event */
    $(document).on('click', '[data-currency_change_url_param]', function (e) {
        var currencyUrlParam = $(this).data('currency_change_url_param');
        var currencyCode = $(this).data('currency-name');
        var $paymentButtons = $('[data-base_pay_url]');
        $paymentButtons.each(function() {
            var baseUrl = $(this).data('base_pay_url');
            var url = baseUrl + '?' + currencyUrlParam + '=' + currencyCode;
            $(this).attr('href', url);
        });

        var $radioInputs = $('.payment-form input[data-redirect]');
        $radioInputs.each(function() {
            var baseUrl = $(this).data('base_pay_url');
            var url = baseUrl + '?' + currencyUrlParam + '=' + currencyCode;
            $(this).data('redirect', url);
        });
    });

    /* calculator page */
    $(document).on('change', 'input[data-weight_field], input[data-wrist_field], input[data-height_field], input[data-age_field], input[data-gender_field]', function(e) {
        var $form = $('[data-calculator_form_result]').eq(0);
        var addInput = function($form, inputName, value) {
            $existingInput = $form.find('input[name=' + inputName + ']').eq(0);
            if ($form.find('input[name=' + inputName + ']').length === 1) {
                $existingInput.val(value);
            } else {
                $('<input>').attr({
                    type: 'hidden',
                    name: inputName,
                    value: value
                }).appendTo($form);
            }
        };

        addInput($form, 'weight', $('[data-weight_field]').eq(0).val());
        addInput($form, 'height', $('[data-height_field]').eq(0).val());
        addInput($form, 'wrist', $('[data-wrist_field]').eq(0).val());
        addInput($form, 'age', $('[data-age_field]').eq(0).val());
        addInput($form, 'gender', $('[data-gender_field]:checked').eq(0).val());
    });

    /* home page - scroll to prices block */
    $(document).on('click', '[data-scroll_to_block]', function(e) {
        e.preventDefault();

        var block = $(this).data('scroll_to_block');
        $('html, body').animate({
            scrollTop: $('[data-block_to_scroll="' + block + '"]').offset().top
        }, 1000);
    });

    // nutrition status bar with hearts - solve nutrition event
    $(document).on('click', '.js-apple-bar-btn', function(e) {
        e.preventDefault();

        var $link = $(this);
        executeAjaxRequest($link.data('url'), {
            status: $link.data('status'),
        }, 'post', function(response) {
            var $currentDayItem = $('.apple-bar__list-item.is-active');
            if ($currentDayItem.length > 0) {
                $currentDayItem.addClass(response.status);
            }
        });
    });

    /* recipes auth popup */
    $(document).on('click', '[data-recipes_login_btn]', function (e) {
        e.preventDefault();
        var form = $(this).closest('form');
        form.submit();
    });
});

function sharePopup(url) {
    window.open(
        url,
        '',
        'top=' + ($(window).height() / 2 - 125) + ',left=' + ($(window).width() / 2 - 275) + ',toolbar=0,status=0,width=550,height=255'
    );
}
