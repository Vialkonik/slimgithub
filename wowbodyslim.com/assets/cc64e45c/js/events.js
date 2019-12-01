$(function () {
    if (typeof ga === 'function') {
        $(document).on('click', '[data-ga_calculate_ev]', function (e) {
            ga('send', {hitType: 'event', eventCategory: 'marketing', eventAction: 'calculator', eventLabel: 'calculate'});
        });

        $(document).on('click', '[data-ga_calc_submit_ev]', function (e) {
            ga('send', {hitType: 'event', eventCategory: 'marketing', eventAction: 'calculator', eventLabel: 'submit'});
        });

        /* lead magnet pages */
        $(document).on('click', '[data-ga_lead_magnet_page_click_ev]', function (e) {
            ga('send', {hitType: 'event', eventCategory: 'Plan', eventAction: 'Pitanie', eventLabel: 'click'});
        });

        $(document).ready(function(e) {
            if ($('[data-ga_lead_magnet_page_submit_ev]').length >= 1) {
                ga('send', {hitType: 'event', eventCategory: 'Plan', eventAction: 'Pitanie', eventLabel: 'submit'});
            }
        });

        /* no sugar popup */
        $(document).on('click', '[data-ga_no_sugar_btn_click_ev]', function (e) {
            ga('send', {hitType: 'event', eventCategory: 'marketing', eventAction: 'no-sugar', eventLabel: 'click'});
        });

        /* home top screen line */
        $(document).on('click', '[data-ga_home_line_btn_click_ev]', function (e) {
            var variation = $(this).data('ga_home_line_btn_click_ev');
            ga('send', {hitType: 'event', eventCategory: 'marketing', eventAction: 'home-line-click', eventLabel: variation});
        });

        /* recipes auth popup */
        $(document).on('click', '[data-ga_recipes_auth_register_btn]', function (e) {
            var variation = $(this).data('ga_recipes_auth_register_btn');
            ga('send', {hitType: 'event', eventCategory: 'marketing', eventAction: 'recipes-auth-popup-register-click', eventLabel: variation});
        });
    }
});

/* GLOBALS */

/* no sugar popup */
function openedNoSugarPopup() {
    if (typeof ga === 'function') {
        ga('send', {hitType: 'event', eventCategory: 'marketing', eventAction: 'no-sugar', eventLabel: 'open-popup'});
    }
}

/* home top screen line */
function homeLineShowed(variation) {
    if (typeof ga === 'function') {
        ga('send', {hitType: 'event', eventCategory: 'marketing', eventAction: 'home-line-show', eventLabel: variation});
    }
}

/* nutrition lead magnet popup */
function showedNutritionLeadMagnetPopup(variation) {
    if (typeof ga === 'function') {
        ga('send', {hitType: 'event', eventCategory: 'marketing', eventAction: 'nutrition-lead-magnet-popup-showed', eventLabel: variation});
    }
}

function submitedNutritionLeadMagnetPopup(variation) {
    if (typeof ga === 'function') {
        ga('send', {hitType: 'event', eventCategory: 'marketing', eventAction: 'nutrition-lead-magnet-popup-submit', eventLabel: variation});
    }
}

/* recipes auth popup */
function showedRecipesAuthPopup(variation) {
    if (typeof ga === 'function') {
        ga('send', {hitType: 'event', eventCategory: 'marketing', eventAction: 'recipes-auth-popup-showed', eventLabel: variation});
    }
}