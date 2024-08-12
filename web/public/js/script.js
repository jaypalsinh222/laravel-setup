jQuery(document).ready(function ($) {

    // $(document).ajaxError(function(xhr, status, error){
    //    dd(status);
    //    dd(status.status);
    //    dd(status.responseJSON.message);
    // });

    $.ajaxSetup({
        headers: $headerObjects
    });

    $('.polaris-tabList button, .tabnextBtn').click(function () {
        var tabC = $(this).data('list');
        $('.polaris-tabList button').removeClass('active');
        $('.' + tabC).addClass('active');
        $('.polaris-tabPanel').removeClass('active');
        $('#' + tabC).addClass('active');
        $("html, body").animate({scrollTop: 0}, "slow");
    });

    $(document).on('change', '.Polaris-Select__Input', function () {
        $(this).parent().find('.Polaris-Select__SelectedOption').html($(this).find('option:selected').text());
    });

    $(document).on('click', 'a.direct_link_button', function (e) {
        var href = $(this).attr('href');
        window.top.location.href = href;
        e.preventDefault();
    });

    $(document).on('click', 'a.link_new_tab', function (e) {
        var href = $(this).attr('href');
        window.open(href);
        e.preventDefault();
    });

    $(document).on('click', 'button.link_new_tab', function (e) {
        var href = $(this).data('href');
        window.open(href);
        e.preventDefault();
    });

    $(document).on('click', 'a.link_button', function (e) {
        var href = $(this).attr('href');
        appRedirectUrl(href);
        e.preventDefault();
    });

    $(document).on('click', 'button.link_button', function (e) {
        var href = $(this).data('href');
        appRedirectUrl(href);
        e.preventDefault();
    });

    $(document).on('keypress', '.price_input', function (event) {
        if ((event.which != 46 || $(this).val().indexOf('.') != -1) &&
            ((event.which < 48 || event.which > 57) &&
                (event.which != 0 && event.which != 8))) {
            event.preventDefault();
        }

        var text = $(this).val();

        if ((text.indexOf('.') != -1) &&
            (text.substring(text.indexOf('.')).length > 2) &&
            (event.which != 0 && event.which != 8) &&
            ($(this)[0].selectionStart >= text.length - 2)) {
            event.preventDefault();
        }
    });

    $(document).on('keypress', '.max-inputlength', function (e) {
        var length = $(this).data('max');
        var valueLength = $(this).val().length;

        if (length == undefined || length == "") {
            length = 20;
        }

        if (valueLength > (length - 1)) {
            return false;
        }
    });

    $(document).on('keypress', '.disabled_space', function (e) {
        if (e.which == 32) {
            return false;
        }
    });

    $(document).on('keypress', '.numberonly', function (e) {
        //if the letter is not digit then display error and don't type anything

        if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
            //display error message
            return false;
        }
    });

    $(document).on('keyup', '.numberonly', function (e) {
        var val = $(this).val();
        var zero = $(this).data('zero');
        if (val <= 0 && val != "" && zero != '1') {
            $(this).val(1);
        }
    });

    $(document).on('keyup', '#min_qty', function (e) {
        var val = $(this).val();
        var maxValue = $('#max_qty').val();
        if (parseInt(val) >= parseInt(maxValue)) {
            $('#max_qty').val(val);
        }
    });

    $(document).on('keyup', '#max_qty', function (e) {
        var val = $(this).val();
        var minValue = $('#min_qty').val();
        if (parseInt(val) <= parseInt(minValue)) {
            $('#max_qty').val(minValue);
        }
    });

    $(document).on('click', '.copy_icon', function (e) {
        e.preventDefault();
        var This = $(this);
        var copy = This.data('copy');
        var dummy = $('<input>').val(copy).appendTo(This.parent()).select();
        //dummy.focus();
        document.execCommand('copy');
        This.text('copied');
        setTimeout(function () {
            This.text('copy');
        }, 1000);
        dummy.remove();
    });

    $('.update_app_button').click(function (e) {
        //appRedirectUrl($authurl);
        window.top.location.href = $authurl;
        e.preventDefault();
    });
});


function LoaderStart() {
    $('.Polaris-Ajax_spinner').fadeIn(100);
}

function LoaderStop() {
    $('.Polaris-Ajax_spinner').fadeOut(100);
}

function checkNumberFormat(value) {
    var numberRegex = /.*?(\d+)(?:\.(\d{1,2}))?.*/;

    if (numberRegex.test(value)) {
        return true;
    } else {
        return false;
    }
}

function pageReload() {
    window.location.reload();
}

function dd(...value) {
    console.log(...value);
}

function isValidSearch(str) {
    return !/[~`!@#$%\^&*()+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
}

function ToastNotice(message, isError = false) {
    var toastOptions = {
        message: message,
        duration: 5000,
        isError: isError,
    };

    var toastNotice = Toast.create(app, toastOptions);
    toastNotice.dispatch(Toast.Action.SHOW);
}

function goBack() {
    var BackLink = $('.backlink').data('backurl');
    appRedirectUrl(BackLink);
}

function moneyConversion(price) {
    var Price = parseFloat(price);
    var moneyArray = ['{{amount}}', '{{amount_no_decimals}}', '{{amount_with_comma_separator}}', '{{amount_no_decimals_with_comma_separator}}', '{{amount_with_apostrophe_separator}}'];
    var separator = ",";
    $.each(moneyArray, function (i, value) {
        if ($moneyFormat.includes(value)) {
            // echo "<br>".$key;
            if (i == 1 || i == 3) {
                Price = Price.toFixed();
            } else {
                Price = Price.toFixed(2).toLocaleString();
            }

            if (i == '4') {
                separator = "'";
            }

            Price = $moneyFormat.replaceAll(value, numberWithCommas(Price, separator));
        }
    });
    return Price;
}

function numberWithCommas(number, separator = ',') {
    var parts = number.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join(".");
}
