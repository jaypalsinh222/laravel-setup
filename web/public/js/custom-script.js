changeAppLanguage();
initializeDatePicker();
initializeTimePicker();

jQuery(document).ready(function ($) {
    // if ($('.initialize-collection-picker').length > 0) {
    //     initializeCollectionPicker("", 1);
    // }
    hideShowDeleteRuleBtn();
    selectDatesInDatePicker();

    // $(".time_picker").on("change", function(e) {
    //     console.log(e)
    //     console.log(this.val());
    //     console.log(e.value); // gets the input value
    //     console.log(e.time);  // gets the data-time value
    // });


    // ==========>  ERROR DEBUGGER SWITCH START     <==========
    // handle - change error debug status
    $(document).on('click', '.error_debug_switch', function (e) {
        e.preventDefault();

        const This = $(this);
        const val = This.val();
        const dataLink = This.attr('data-link');

        // console.log(val, dataLink)

        if (val == '0') {
            LoaderStart();

            errorDebuggerStatusAjaxCall(val, dataLink);
        } else {
            $("#error_debug_modal").attr('data-debug_status_url', dataLink);
            $("#error_debug_modal").attr('data-status', val);
            $('#error_debug_modal').show();
        }

    });

    $(document).on('click', 'button.close_error_debug_modal', function (e) {
        $("#error_debug_modal").hide();
    });

    $(document).on('click', 'button#confirm_error_debug_btn', function (e) {
        LoaderStart();

        errorDebuggerStatusAjaxCall($("#error_debug_modal").data('status'), $("#error_debug_modal").data('debug_status_url'));
    });
    // ==========>  ERROR DEBUGGER SWITCH END   <==========
    $('input[name=discount_type]').change(function () {
        var val = $(this).val();
        if (val == '1') {
            $('.percentage-discount-visible').show();
            $('.percentage-discount-hidden').hide();

        } else {
            $('.percentage-discount-visible').hide();
            $('.percentage-discount-hidden').show();
        }
        $('#discount_value').val('');
        $('#max_discount').val('');
    });

    // ==========>  DASHBOARD START     <==========
    // handle - searching
    $("#searching").keyup(function (e) {
        const search = $(this).val();
        const url = $(this).data("url");
        call(url, search);
    });

    // handle - clear search filed
    $(".Polaris-TextField__ClearButton").click(function (e) {
        e.preventDefault();
        $("#searching").val('').trigger('keyup');
    });

    // handle - pagination
    $(document).on('click', 'button.pagination_link_button', function (e) {
        const href = $(this).data('href');
        const page = href.substring(href.indexOf('=') + 1);
        call($('input[name=searching]').data('url'), $('input[name=searching]').val(), page);
        e.preventDefault();
    });

    // handle - change delivery customization status
    $(document).on('click', '.delivery_customization_status_change', function (e) {
        e.preventDefault();

        const This = $(this);
        const val = This.val();
        const dataLink = This.attr('data-link');
        const id = This.data('id');

        LoaderStart();
        $.ajax({
            url: dataLink, method: "POST", data: {value: val}, success: function (response) {
                LoaderStop();
                $("#critical_error_banner").hide();
                console.log(response);

                if (response.data >= 5) {
                    $("#customization_limit_banner").show();
                } else {
                    $("#customization_limit_banner").hide();
                }
                $("#status_popover_" + id).toggle();

                if (response.status === 200) {
                    $("#activeCustomizationsCounter").html(response.data);

                    ToastNotice(response.message);
                    if (val == '1') {
                        // This.prop('checked', false);
                        This.val('0');

                        $("#status_popover_text_" + id).text('Active');
                        $("#status_badge_text_" + id).text('Inactive');
                        $("#status_badge_" + id).removeClass('Polaris-Badge--toneSuccess');
                    } else {
                        // This.prop('checked', true);
                        This.val('1');

                        $("#status_popover_text_" + id).text('Inactive');
                        $("#status_badge_text_" + id).text('Active');
                        $("#status_badge_" + id).addClass('Polaris-Badge--toneSuccess');
                    }
                } else {
                    $("#critical_error_banner_title").html('');
                    $("#critical_error_banner_title").html(response.message);
                    $("#critical_error_banner").show();
                }
            },

            error: function () {
                ToastNotice('Something went wrong with delivery customization status.', true)
            }
        });
    });

    // handle - hide modal of create/edit delivery customization method
    $('.closeShopifyDeliveryCustomizationModal').on('click', function (e) {
        $('#shopifyDeliveryCustomizationForm').trigger("reset");
        $(".model_title").text("Create Delivery Customization");
        $("#delivery_customization_id").val("");
        $("#extension_type").val("");
        $("#createShopifyDeliveryCustomizationModal").hide();

        removeErrorMessages();
    });

    // handle - show modal of create/edit delivery customization method
    $(document).on('click', 'button.shopifyDeliveryCustomizationModalBtn', function (e) {
        $("#shopifyScriptTypeModal").show();
    });

    // handle - get delivery customization details and fill form in modal
    $(document).on('click', '.edit_delivery_customization', function (e) {
        e.preventDefault();
        const url = $(this).attr('data-url');
        // const extensionType = $(this).data("extension_type");
        LoaderStart();
        $.ajax({
            url: url,
            type: "GET",
            success: function (response) {
                LoaderStop();
                if (response.status === 200) {
                    $("#delivery_customization_id").val(response.data.delivery_customization.id)
                    $("#shopify_delivery_customization_title").val(response.data.delivery_customization.title)
                    $(".model_title").text("Update Delivery Customization");
                    $("#extension_type").val(response.data.delivery_customization.extension_type);

                    $("#create_del_cus_modal_badge_color").removeClass();
                    $("#create_del_cus_modal_badge_color").addClass("Polaris-Badge");
                    $("#create_del_cus_modal_badge_color").addClass(response.data.badge_color);
                    $("#create_del_cus_modal_badge_tag").html(response.data.badge_tag);

                    $("#create_customization_btn_title").html('');
                    $("#create_customization_btn_title").html('Update');

                    $("#createShopifyDeliveryCustomizationModal").show();
                    $("#customization_limit_banner").hide();
                } else {
                    ToastNotice("Oops, something went wrong, Please try again later!", true)
                }
            },
            error: function (response) {
                ToastNotice("Oops, something went wrong, Please try again later!", true)
            }
        });
    });

    // handle - submit create/edit delivery customization form
    $('#shopifyDeliveryCustomizationForm').on('submit', function (event) {
        event.preventDefault();
        const This = $(this);
        const formData = $(This).serializeArray();
        const isUpdate = $("#delivery_customization_id").val()
        $error = checkValidations();
        if (!$error) {
            LoaderStart();
            $.ajax({
                url: $(This).attr('action'),
                type: "POST",
                data: formData,
                success: function (response) {
                    LoaderStop();
                    if (response.status === 200) {
                        if (!isUpdate) {
                            redirectToPage('/delivery-customization/' + response.data.shopify_customization_id + '/add_edit_rule');
                        } else {
                            ToastNotice(response.message);
                            $('#title_' + response.data.id).html(response.data.title);
                            $('.closeShopifyDeliveryCustomizationModal').trigger('click');
                        }
                    } else {
                        $('.closeShopifyDeliveryCustomizationModal').trigger('click');
                        $("#critical_error_banner_title").html('');
                        $("#critical_error_banner_title").html(response.message);
                        $("#critical_error_banner").show();
                    }
                },
                error: function (response) {
                    ToastNotice("Oops, something went wrong, Please try again later!", true)
                }
            });
        }
    });

    // handle - hide modal of
    $('.closeShopifyScriptTypeModal').on('click', function (event) {
        $("#shopifyScriptTypeModal").hide();
    });

    $(document).on('click', '.add_edit_delivery_customization_rules', function (event) {
        event.preventDefault();
        const This = $(this);
        const id = This.attr('data-id');
        redirectToPage('/delivery-customization/' + id + '/add_edit_rule');
    });

    $(document).on('click', '.auto_update_customization_status', function (event) {
        event.preventDefault();
        const This = $(this);
        const id = This.attr('data-id');
        redirectToPage('/time-based/' + id);
    });

    $(document).on('click', '.select_customization_type', function (event) {
        event.preventDefault();
        $("#extension_type").val($(this).data('extension_type'));
        $("#shopify_scripts_method").val($(this).data('shopify_scripts_method'));

        $("#create_del_cus_modal_badge_color").removeClass();
        $("#create_del_cus_modal_badge_color").addClass("Polaris-Badge");
        $("#create_del_cus_modal_badge_color").addClass($(this).data('badge_color'));
        $("#create_del_cus_modal_badge_tag").html($(this).data('badge_tag'));

        $("#shopifyScriptTypeModal").hide();
        $("#createShopifyDeliveryCustomizationModal").show();
    });

    // handle - delete delivery customization method
    $(document).on('click', 'button.delete_delivery_customization_btn', function (event) {
        event.preventDefault();
        const This = $(this);
        $("#confirm_delete_modal").show();
        $("#confirm_delete_modal").attr('data-url', This.data('href'));
    });

    $(document).on('click', 'button.close_confirm_delete_modal', function (e) {
        $("#confirm_delete_modal").hide();
        $("#confirm_delete_modal").attr('data-url', '');
    });

    $(document).on('click', 'button#confirm_delete_btn', function (event) {
        LoaderStart();
        $.ajax({
            url: $("#confirm_delete_modal").data('url'),
            type: 'DELETE',
            success: function (response) {
                LoaderStop();
                if (response.status == 200) {
                    ToastNotice(response.message);
                    if ($("#confirm_delete_modal").data('is_reload')) {
                        pageReload();
                    } else {
                        redirectToPage('/delivery-customization');
                    }
                } else {
                    ToastNotice(response.message, true);
                }
            },
            error: function (response) {
                ToastNotice("Oops, something went wrong, Please try again later!", true)
            }
        });
    });

    $(document).on('click', 'button.shopifyShippingDiscountModalBtn', function (event) {
        $("#ShippingDiscountWarningBannner").show();
        $("#createShopifyShippingDiscountModal").show();
    });

    $('.closeShopifyShippingDiscountModal').on('click', function (event) {
        $(".shipping_discount_model_title").text("Create Delivery Customization");
        $("#shipping_discount_id").val("");
        $("#createShopifyShippingDiscountModal").hide();
        removeErrorMessages();
    });
    // ==========>  DASHBOARD END   <==========

    $(document).on('click', 'button.inside_delete_delivery_customization_btn', function (event) {
        event.preventDefault();
        const This = $(this);
        $.confirm({
            title: 'Confirm Delete',
            content: 'Are you sure you want to delete?',
            icon: 'fa fa-warning',
            animation: 'scale',
            closeAnimation: 'scale',
            closeIcon: true,
            opacity: 0.5,
            type: 'green',
            buttons: {
                'confirm': {
                    text: 'Confirm',
                    btnClass: 'btn-green',
                    action: function () {
                        LoaderStart();
                        $.ajax({
                            url: This.data('href'),
                            type: 'DELETE',
                            success: function (response) {
                                LoaderStop();
                                if (response.status == 200) {
                                    redirectToPage('/dashboard');
                                    ToastNotice(response.message)
                                } else {
                                    ToastNotice(response.message, true);
                                }
                            },
                            error: function (response) {
                                // ToastNotice("Oops, something went wrong, Please try again later!", true)
                            }
                        })
                    }
                },
                cancel: function () {
                },
            }
        });
    });
    // ==========>  DELIVERY CUSTOMIZATION START    <==========

    // ==========>  SORT TYPE START  <==========
    let sortRulesIndex = $("#sort_delivery_type_tbl tr").length;

    $(document).on('click', 'button#sort_add_condition', function (event) {
        event.preventDefault();
        $("#sort_delivery_type_tbl tr").each(function (i, el) {
            removeErrorMessages();
            if ($(el).find(".sort_rule_value").val() == "") {
                checkValidations();
                ToastNotice("You can't leave rule title blank !", true);
                counter = 0;
                return false;
            } else {
                counter = 1;
            }
        });

        if (counter == 1) {
            sortRulesIndex++;
            const itemRow = `
                <tr class="Polaris-DataTable__TableRow Polaris-DataTable--hoverable sort_rule_row" id="sort_rule_${sortRulesIndex}">
                    <td class="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn" scope="row">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="drag_icon">
                            <path fill="none" d="M0 0h24v24H0V0z"></path>
                            <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
                        </svg>
                    </td>
                    <td class="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                        <div class="Polaris-FormLayout">
                            <div class="Polaris-FormLayout__Item">
                                <div class="">
                                    <div class="Polaris-Connected">
                                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                            <div class="Polaris-TextField ">
                                                <input type="text" id="sort_rule_value[${sortRulesIndex}]" name="sort_rule_value[${sortRulesIndex}]" list="deliveryMethods" autocomplete="off" class="Polaris-TextField__Input sort_rule_value Polaris-required__Error sort_rate_txt">
                                                <div class="Polaris-TextField__Backdrop"></div>
                                            </div>
                                            <datalist id="deliveryMethods">
                                                <option value="Standard Shipping">Standard Shipping</option>
                                                <option value="Express Shipping">Express Shipping</option>
                                                <option value="Ground Shipping">Ground Shipping</option>
                                                <option value="Over Night Shipping">Over Night Shipping</option>
                                            </datalist>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                        <button class="Polaris-Button Polaris-Button--iconOnly sort_rule_remove_btn" type="button" onclick="deleteSortRule(${sortRulesIndex})" >
                            <span class="Polaris-Button__Content">
                                <span class="Polaris-Icon">
                                    <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path></svg>
                                </span>
                            </span>
                        </button>
                    </td>
                </tr>
            `;
            $("#sort_delivery_type_tbl").append(itemRow);
            hideShowDeleteRuleBtn();
        }
    });

    $("#sort_delivery_type_tbl").sortable();

    // handle - save delivery customization while shopify_scripts_method is sort
    $(document).on('click', 'button.save_sort_delivery_rule_btn', function (event) {
        event.preventDefault();
        let formData = $("#sort_rule_form").serializeArray();
        let sort_rule_value = [];
        i = 0;
        $('#sort_delivery_type_tbl tr').each(function (index, tr) {
            sort_rule_value[i++] = $(this).find('.sort_rule_value').val();
        });
        formData.push({
            name: "sort_rule_value", value: sort_rule_value
        });
        $error = checkValidations();
        if (!$error) {
            LoaderStart();
            $.ajax({
                url: $("#sort_rule_form").attr('action'),
                type: "POST",
                data: formData,
                success: function (response) {
                    LoaderStop();
                    if (response.status === 200) {
                        ToastNotice(response.message)
                        pageReload();
                    } else {
                        ToastNotice(response.message, true)
                    }
                }, error: function (response) {
                    ToastNotice(response.message, true);
                }
            });
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });

    $(document).on('click', 'button.save_new_sort_delivery_rule_btn', function (event) {
        event.preventDefault();
        let formData = $("#new_sort_rule_form").serializeArray();
        let new_sort_rule_value = '';
        $('#sort_delivery_type_tbl tr').each(function (index, tr) {
            new_sort_rule_value += (new_sort_rule_value != '' ? '|' : '') + $(this).find('.sort_rule_value').val()
        });
        formData.push({
            name: "sort_rule_value", value: new_sort_rule_value
        });
        $error = checkValidations();
        if (!$error) {
            LoaderStart();
            $.ajax({
                url: $("#new_sort_rule_form").attr('action'),
                type: "POST",
                data: formData,
                success: function (response) {
                    LoaderStop();
                    if (response.status === 200) {
                        ToastNotice(response.message)
                        pageReload();
                    } else {
                        ToastNotice(response.message, true)
                    }
                }, error: function (response) {
                    ToastNotice(response.message, true);
                }
            });
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });

    $(document).on('keypress', '.sort_rate_txt', function (event) {
        const key = event.which;
        if (key == 13)  // the enter key code
        {
            if ($("#ext11_tier_main_div").length > 0) {
                $(this).closest('.sort_delivery_type_tbl').closest(".Polaris-FormLayout").find("button.ext11_tier_add_condition_btn").click();
                $(this).closest('.sort_delivery_type_tbl').find("tr:last td:nth-child(2) input").focus();
            } else {
                $('button#sort_add_condition').click();
                $("#sort_delivery_type_tbl tr:last td:nth-child(2) input").focus();
                return false;
            }
        }
    });
    // ==========> SORT TYPE END <==========

    // ==========>          DELETE IF TYPE START            <==========
    // handle - save delivery customization while shopify_scripts_method is delete if
    $(document).on('click', 'button.save_delete_delivery_rule_btn', function (event) {
        event.preventDefault();
        const formData = $("#delete_rule_form").serializeArray();
        $error = checkValidations();
        if (!$error) {
            LoaderStart();
            $.ajax({
                url: $("#delete_rule_form").attr('action'),
                type: "POST",
                data: formData,
                success: function (response) {
                    LoaderStop();
                    if (response.status === 200) {
                        ToastNotice(response.message)
                        pageReload();
                    } else {
                        ToastNotice(response.message, true);
                    }
                },
                error: function (response) {
                    ToastNotice(response.message, true);
                }
            });
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });
    // ==========>          DELETE IF TYPE END          <==========

    // ==========>          CHANGE NAME / TRANSLATE TYPE START          <==========
    // handle - save delivery customization while shopify_scripts_method is change name
    $(document).on('click', 'button.save_change_delivery_rule_btn', function (event) {
        event.preventDefault();
        const formData = $("#change_rule_form").serializeArray();
        $error = checkValidations();
        if (!$error) {
            LoaderStart();
            $.ajax({
                url: $("#change_rule_form").attr('action'),
                type: "POST",
                data: formData,
                success: function (response) {
                    LoaderStop();
                    if (response.status === 200) {
                        ToastNotice(response.message)
                        pageReload();
                    } else {
                        ToastNotice(response.message, true)
                    }
                },
                error: function (response) {
                    ToastNotice(response.message, true);
                }
            });
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });

    let translateIndex = $(".translate_old_new_row").length - 1;
    let translateCounter = 0;
    // handle - add new rule of delivery customization with validations
    $(document).on('click', '#add_old_new_delivery_btn', function (event) {
        event.preventDefault();
        $error = checkTranslateOldNewValidations();
        if (!$error) {
            translateCounter = 1;
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
            translateCounter = 0;
        }

        if (translateCounter == 1) {
            translateIndex++;
            const html = `
                <div role="group" class="Polaris-FormLayout--condensed translate_old_new_row" id="translate_old_new_${translateIndex}" data-index="${translateIndex}">
                    <div class="Polaris-FormLayout__Items">
                        <div class="Polaris-FormLayout__Item">
                            <div class="Polaris-Connected">
                                <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                    <div class="Polaris-TextField">
                                        <input type="text" id="delivery_method_${translateIndex}_old" name="delivery_method[${translateIndex}][old]" autocomplete="off" placeholder="Old delivery method" value="" class="Polaris-TextField__Input Polaris-required__Error old translate_old_new_methods">
                                        <div class="Polaris-TextField__Backdrop"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="Polaris-FormLayout__Item">
                            <div class="Polaris-Connected">
                                <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                    <div class="Polaris-TextField">
                                        <input type="text" id="delivery_method_${translateIndex}_new" name="delivery_method[${translateIndex}][new]" autocomplete="off" placeholder="New delivery method" value="" class="Polaris-TextField__Input Polaris-required__Error new translate_old_new_methods">
                                        <div class="Polaris-TextField__Backdrop"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="Polaris-FormLayout__Item remove_translate_old_new_btn_div">
                            <div class="remove_old_new_btn" style="">
                                <button class="Polaris-Button Polaris-Button--iconOnly" type="button" id="remove_old_new_row" onclick="deleteOldNewTranslateRaw(${translateIndex})">
                                    <span class="Polaris-Button__Content">
                                        <span class="Polaris-Button__Icon">
                                            <span class="Polaris-Icon">
                                                <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path></svg>
                                            </span>
                                        </span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $("#translate_old_new_main_div").append(html);
            hideShowDeleteRuleBtn();
        }
    });

    $(document).on('click', 'button.save_translate_delivery_rule_btn', function (event) {
        event.preventDefault();
        const formData = $("#translate_rule_form").serializeArray();
        $error = checkValidations();
        if (!$error) {
            LoaderStart();
            $.ajax({
                url: $("#translate_rule_form").attr('action'),
                type: "POST",
                data: formData,
                success: function (response) {
                    LoaderStop();
                    if (response.status === 200) {
                        ToastNotice(response.message)
                        pageReload();
                    } else {
                        ToastNotice(response.message, true)
                    }
                },
                error: function (response) {
                    ToastNotice(response.message, true);
                }
            });
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });
    // ==========>          CHANGE NAME TYPE END            <==========

    // ==========>          TIER START          <==========
    let tierRuleCounter = 0;
    $(document).on('click', '#add_tier_rule', function (event) {
        event.preventDefault();
        const mainIndex = $(this).closest('.tier').data('tier_index')
        const tierRuleIndex = $(this).parents(".tier_main_div").find('.tier_rule_row').last().data('tier_rule_index') + 1;
        $error = checkValidations();
        if (!$error) {
            tierRuleCounter = 1;
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
            tierRuleCounter = 0;
        }

        if (tierRuleCounter == 1) {
            const html = `
                <div class="tier_rule_row" id="tier_${mainIndex}_rule_row_${tierRuleIndex}" data-tier_rule_index="${tierRuleIndex}">
                        <div class="Polaris-FormLayout__Items product_remove_list cs_divider line_divider" >
                            <div class="Polaris-FormLayout__Item"></div>
                        </div>
                    <div class="delivery_rule_wrapper">
                        <div class="delete_button">
                            <a href="javascript:void(0)" onclick="deleteTierRuleRow(${mainIndex}, ${tierRuleIndex})" title="Remove">
                                <span>
                                    <svg fill="white" viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true" height="15px" width="15px">
                                        <path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path>
                                    </svg>
                                </span>
                            </a>
                        </div>
                        <div class="Polaris-FormLayout">
                            <div role="group" class="Polaris-FormLayout--grouped">
                                <div class="Polaris-FormLayout__Items">
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="Polaris-TextField">
                                            <input type="number" id="tier_${mainIndex}_rule_min_${tierRuleIndex}" class="Polaris-TextField__Input rule_value Polaris-required__Error Polaris-start_range__Error start_range tier_range_input" value="0" autocomplete="off" placeholder="Start Range">
                                            <div class="Polaris-TextField__Backdrop"></div>
                                        </div>
                                    </div>

                                    <div class="Polaris-FormLayout__Item">
                                        <div class="Polaris-TextField">
                                            <input type="number" id="tier_${mainIndex}_rule_max_${tierRuleIndex}" class="Polaris-TextField__Input rule_value end_range tier_range_input" value="" autocomplete="off" placeholder="End Range">
                                            <div class="Polaris-TextField__Backdrop"></div>
                                        </div>
                                    </div>

                                    <input type="hidden" id="tier_${mainIndex}_rule_value_${tierRuleIndex}" name="tier[${mainIndex}][value][${tierRuleIndex}][value]" class="Polaris-TextField__Input tier_range_value" value="0=">

                                    <div class="Polaris-FormLayout__Item">
                                        <div class="Polaris-TextField">
                                            <input type="text" data-role="tagsinput" id="tier_${mainIndex}_rule_method_${tierRuleIndex}" name="tier[${mainIndex}][value][${tierRuleIndex}][method]" value="" class="Polaris-TextField__Input rule_value Polaris-required__Error inputtag" placeholder="Enter Delivery Methods">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $(this).closest(".tier").find("#append_tier_rules_div").append(html);
            bootstrapTagsInputReinitialize();
            hideShowDeleteRuleBtn();
        }
    });

    if ($(".tier").length >= 2) {
        $('#add_tier_btn_div').hide();
    }

    let tierIndex = $(".tier").length - 1;
    let tierCounter = 0;
    // handle - add new rule of delivery customization with validations
    $(document).on('click', '#add_tier_btn', function (event) {
        event.preventDefault();
        const beforeAppendRowSelectedRuleTypes = getSelectedRuleTypes();
        $error = checkValidations();
        if (!$error) {
            tierCounter = 1;
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
            tierCounter = 0;
        }
        if (tierCounter == 1) {
            tierIndex++;
            const html = `
                <div class="tier" id="tier_${tierIndex}" data-tier_index="${tierIndex}">
                    <div class="Polaris-FormLayout__Items product_remove_list cs_divider line_divider" >
                        <div class="Polaris-FormLayout__Item"></div>
                    </div>
                    <div style="padding: 10px; border-radius: 10px; border: 1px solid #dfdfdf;">
                        <div class="Polaris-FormLayout">
                            <div role="group" class="Polaris-FormLayout--grouped">
                                <div class="Polaris-FormLayout__Items">
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-Select">
                                                <select id="tier_type_${tierIndex}" name="tier[${tierIndex}][type]" class="Polaris-Select__Input rule_type Polaris-required__Error" aria-invalid="false">
                                                    <option value="" selected>Select Tier Type</option>
                                                    <option value="0" ${beforeAppendRowSelectedRuleTypes.includes("0") ? "disabled" : ""}>Total Amount</option>
                                                    <option value="1"${beforeAppendRowSelectedRuleTypes.includes("1") ? "disabled" : ""}>Subtotal Amount</option>
                                                </select>
                                                <div class="Polaris-Select__Content" aria-hidden="true">
                                                    <span class="Polaris-Select__SelectedOption">Select Tier Type</span>
                                                    <span class="Polaris-Select__Icon">
                                                        <span class="Polaris-Icon">
                                                              <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                              <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                        </span>
                                                    </span>
                                                </div>
                                                <div class="Polaris-Select__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="Polaris-FormLayout__Item" style="max-width: 10px;min-width: 1.7rem!important;">
                                        <div class="delete_tier_btn_div">
                                            <button class="Polaris-Button Polaris-Button--critical Polaris-Button--plain delete_tier_btn" type="button" onclick="deleteTier(${tierIndex})">
                                                <span class="Polaris-Icon" style="margin-top:7px;"><svg viewBox="0 0 20 20" class="Icon_Icon__Dm3QW" style="width: 20px; height: 20px;"><path d="M10 20c-5.514 0-10-4.486-10-10s4.486-10 10-10 10 4.486 10 10-4.486 10-10 10zm-4-11a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-8z"></path></svg></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr>
                        <div id="append_tier_rules_div" class="append_tier_rules_div">
                            <div class="tier_rule_row" id="tier_${tierIndex}_rule_row_0" data-tier_rule_index="0">
                                <div class="delivery_rule_wrapper">
                                    <div class="delete_button" style="display: none">
                                        <a href="javascript:void(0)" onclick="deleteTierRuleRow(${tierIndex},0)" title="Remove">
                                            <span>
                                                <svg fill="white" viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true" height="15px" width="15px">
                                                    <path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path>
                                                </svg>
                                            </span>
                                        </a>
                                    </div>
                                    <div class="Polaris-FormLayout">
                                        <div role="group" class="Polaris-FormLayout--grouped">
                                            <div class="Polaris-FormLayout__Items">
                                                <div class="Polaris-FormLayout__Item">
                                                    <div class="Polaris-TextField">
                                                        <input type="number" id="tier_${tierIndex}_rule_min_0" class="Polaris-TextField__Input rule_value Polaris-required__Error Polaris-start_range__Error start_range tier_range_input" value="0" autocomplete="off" placeholder="Start Range">
                                                        <div class="Polaris-TextField__Backdrop"></div>
                                                    </div>
                                                </div>

                                                <div class="Polaris-FormLayout__Item">
                                                    <div class="Polaris-TextField">
                                                        <input type="number" id="tier_${tierIndex}_rule_max_0" class="Polaris-TextField__Input rule_value end_range tier_range_input" value="" autocomplete="off" placeholder="End Range">
                                                        <div class="Polaris-TextField__Backdrop"></div>
                                                    </div>
                                                </div>

                                                <input type="hidden" id="tier_${tierIndex}_rule_value_0" name="tier[${tierIndex}][value][0][value]" class="Polaris-TextField__Input tier_range_value" value="0=">

                                                <div class="Polaris-FormLayout__Item">
                                                    <div class="Polaris-TextField">
                                                        <input type="text" data-role="tagsinput" id="tier_${tierIndex}_rule_method_0" name="tier[${tierIndex}][value][0][method]" value="" class="Polaris-TextField__Input rule_value Polaris-required__Error inputtag" placeholder="Enter Delivery Methods">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <hr>
                            <button class="Polaris-Button Polaris-Button--primary" type="button" id="add_tier_rule">
                                <span class="Polaris-Icon" style="margin-right:10px;"><svg viewBox="0 0 20 20" class="Icon_Icon__Dm3QW" style="width: 20px; height: 20px;"><path d="M0 10c0 5.514 4.486 10 10 10s10-4.486 10-10-4.486-10-10-10-10 4.486-10 10zm5 0a1 1 0 0 1 1-1h3v-3a1 1 0 1 1 2 0v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3h-3a1 1 0 0 1-1-1z"></path></svg></span>
                                <span class="Polaris-Button__Content"><span class="Polaris-Button__Text">Add Tier Rule</span></span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            $("#tier_main_div").append(html);
            bootstrapTagsInputReinitialize();
            hideShowDeleteRuleBtn();
        }
    });

    $(document).on('keyup', '.tier_range_input', function (e) {
        const startRangVal = parseFloat($(this).closest(".Polaris-FormLayout__Items").find(".start_range").val());
        let endRangVal = parseFloat($(this).closest(".Polaris-FormLayout__Items").find(".end_range").val());
        if (!endRangVal) {
            $(this).closest(".Polaris-FormLayout__Items").find(".tier_range_value").val(`${startRangVal}=`);
        } else {
            $(this).closest(".Polaris-FormLayout__Items").find(".tier_range_value").val(`${startRangVal}=${endRangVal}`);
        }
    });

    $(document).on('click', 'button.save_e3_rules_btn', function (event) {
        // $(".on-click-disable").attr("disabled", true);
        event.preventDefault();
        const formData = $("#e3_rule_form").serializeArray();
        $error = checkValidations();
        if (!$error) {
            LoaderStart();
            $.ajax({
                url: $("#e3_rule_form").attr('action'),
                type: "POST",
                data: formData,
                success: function (response) {
                    LoaderStop();
                    if (response.status === 200) {
                        ToastNotice(response.message)
                        pageReload();
                    } else {
                        ToastNotice(response.message, true)
                    }
                }, error: function (response) {
                    ToastNotice(response.message, true)
                }
            });
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });
    // ==========>          TIER END            <==========

    // ==========>          EXT-9 HIDE TIER SET-2 START         <==========
    $(document).on('change', '.ext9_tier_rule_type', function (event) {
        event.preventDefault();
        const This = $(this);
        const currentRuleType = This.val();

        let placeholder = ``;
        let ruleConditions = `
            <option value="2" selected>Contains</option>
            <option value="3">Does not contains</option>
        `;

        if (currentRuleType === '7') {
            placeholder = `Enter product tag`;
            ruleConditions += `
                <option value="9">Contains all</option>
                <option value="10">Does not contains all</option>
            `;
        } else if (currentRuleType === '22') {
            placeholder = `Enter company name`;
        }

        const html = `
                <div class="ext9_tier_rule_row" id="ext9_tier_0_rule_row_0" data-ext9_tier_rule_index="0">
                    <div class="Polaris-FormLayout__Items product_remove_list cs_divider line_divider" >
                        <div class="Polaris-FormLayout__Item"></div>
                    </div>
                    <div class="delivery_rule_wrapper">
                        <div class="delete_button">
                            <a href="javascript:void(0)" onclick="deleteExt9TierRuleRow(0, 0)" title="Remove">
                                <span>
                                    <svg fill="white" viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true" height="15px" width="15px">
                                        <path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path>
                                    </svg>
                                </span>
                            </a>
                        </div>
                        <div class="Polaris-FormLayout">
                            <div role="group" class="Polaris-FormLayout--grouped">
                                <div class="Polaris-FormLayout__Item">
                                    <div class="">
                                        <div class="Polaris-Select">
                                            <select id="ext9_tier_0_rule_new_condition_0" name="ext9_tier[0][value][0][new_conditions]" class="Polaris-Select__Input rule_condition Polaris-required__Error" aria-invalid="false">
                                                ${ruleConditions}
                                            </select>
                                            <div class="Polaris-Select__Content" aria-hidden="true">
                                                <span class="Polaris-Select__SelectedOption">Contains</span>
                                                <span class="Polaris-Select__Icon">
                                                    <span class="Polaris-Icon">
                                                          <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                          <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                    </span>
                                                </span>
                                            </div>
                                            <div class="Polaris-Select__Backdrop"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="Polaris-FormLayout__Item">
                                    <div class="Polaris-TextField">
                                        <input type="text" data-role="tagsinput" id="ext9_tier_0_rule_tag_0" name="ext9_tier[0][value][0][tag]" value="" class="Polaris-TextField__Input rule_value Polaris-required__Error inputtag" placeholder="${placeholder}">
                                    </div>
                                </div>
                                <div class="Polaris-FormLayout__Item">
                                    <div class="Polaris-TextField">
                                        <input type="text" data-role="tagsinput" id="ext9_tier_0_rule_method_0" name="ext9_tier[0][value][0][method]" value="" class="Polaris-TextField__Input rule_value Polaris-required__Error inputtag" placeholder="Enter Delivery Methods">
                                    </div>
                                </div>
                                <div class="Polaris-FormLayout__Item">
                                    <div class="Polaris-LegacyStack Polaris-LegacyStack--distributionFillEvenly">
                                        <div class="Polaris-LegacyStack__Item">
                                            <label class="Polaris-Choice Polaris-RadioButton__ChoiceLabel" for="ext9_tier_0_rule_condition_0_0">
                                                <span class="Polaris-Choice__Control">
                                                    <span class="Polaris-RadioButton">
                                                        <input type="radio" id="ext9_tier_0_rule_condition_0_0" name="ext9_tier[0][value][0][condition]" class="Polaris-RadioButton__Input" aria-describedby="optionalHelpText" value="1" checked>
                                                        <span class="Polaris-RadioButton__Backdrop"></span>
                                                    </span>
                                                </span>
                                                <span class="Polaris-Choice__Label">
                                                    <span>Stack</span>
                                                </span>
                                            </label>
                                        </div>
                                        <div class="Polaris-LegacyStack__Item">
                                            <label class="Polaris-Choice Polaris-RadioButton__ChoiceLabel" for="ext9_tier_0_rule_condition_0_1">
                                                <span class="Polaris-Choice__Control">
                                                    <span class="Polaris-RadioButton">
                                                        <input type="radio" id="ext9_tier_0_rule_condition_0_1" name="ext9_tier[0][value][0][condition]" class="Polaris-RadioButton__Input" aria-describedby="optionalHelpText" value="2">
                                                        <span class="Polaris-RadioButton__Backdrop"></span>
                                                    </span>
                                                </span>
                                                <span class="Polaris-Choice__Label">
                                                    <span>Terminate</span>
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        $(this).closest(".ext9_tier").find("#append_ext9_tier_rules_div").html(html);
        bootstrapTagsInputReinitialize();
        hideShowDeleteRuleBtn();
    });

    $(document).on('click', 'button#add_ext9_tier_rule', function (event) {
        event.preventDefault();
        const mainIndex = $(this).closest('.ext9_tier').data('ext9_tier_index');
        const tierRuleIndex = $(this).parents(".ext9_tier_main_div").find('.ext9_tier_rule_row').last().data('ext9_tier_rule_index') + 1;
        const currentRuleType = $('.ext9_tier_rule_type').val();
        // console.log('currentRuleType '+ currentRuleType);
        const isError = checkValidations();

        let placeholder = ``;
        let ruleConditions = `
            <option value="2" selected>Contains</option>
            <option value="3">Does not contains</option>
        `;
        if (currentRuleType === '7') {
            placeholder = `Enter product tag`;
            ruleConditions += `
                <option value="9">Contains all</option>
                <option value="10">Does not contains all</option>
            `;
        } else if (currentRuleType === '22') {
            placeholder = `Enter company name`;
        }

        if (!isError) {
            const html = `
                <div class="ext9_tier_rule_row" id="ext9_tier_${mainIndex}_rule_row_${tierRuleIndex}" data-ext9_tier_rule_index="${tierRuleIndex}">
                    <div class="Polaris-FormLayout__Items product_remove_list cs_divider line_divider" >
                        <div class="Polaris-FormLayout__Item"></div>
                    </div>
                    <div class="delivery_rule_wrapper">
                        <div class="delete_button">
                            <a href="javascript:void(0)" onclick="deleteExt9TierRuleRow(${mainIndex}, ${tierRuleIndex})" title="Remove">
                                <span>
                                    <svg fill="white" viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true" height="15px" width="15px">
                                        <path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path>
                                    </svg>
                                </span>
                            </a>
                        </div>
                        <div class="Polaris-FormLayout">
                            <div role="group" class="Polaris-FormLayout--grouped">
                                <div class="Polaris-FormLayout__Item">
                                    <div class="">
                                        <div class="Polaris-Select">
                                            <select id="ext9_tier_${mainIndex}_rule_new_condition_${tierRuleIndex}" name="ext9_tier[${mainIndex}][value][${tierRuleIndex}][new_conditions]" class="Polaris-Select__Input ext9_tier_rule_condition Polaris-required__Error" aria-invalid="false">
                                                ${ruleConditions}
                                            </select>
                                            <div class="Polaris-Select__Content" aria-hidden="true">
                                                <span class="Polaris-Select__SelectedOption">Contains</span>
                                                <span class="Polaris-Select__Icon">
                                                    <span class="Polaris-Icon">
                                                          <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                          <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                    </span>
                                                </span>
                                            </div>
                                            <div class="Polaris-Select__Backdrop"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="Polaris-FormLayout__Item">
                                    <div class="Polaris-TextField">
                                        <input type="text" data-role="tagsinput" id="ext9_tier_${mainIndex}_rule_tag_${tierRuleIndex}" name="ext9_tier[${mainIndex}][value][${tierRuleIndex}][tag]" value="" class="Polaris-TextField__Input rule_value Polaris-required__Error inputtag" placeholder="${placeholder}">
                                    </div>
                                </div>
                                <div class="Polaris-FormLayout__Item">
                                    <div class="Polaris-TextField">
                                        <input type="text" data-role="tagsinput" id="ext9_tier_${mainIndex}_rule_method_${tierRuleIndex}" name="ext9_tier[${mainIndex}][value][${tierRuleIndex}][method]" value="" class="Polaris-TextField__Input rule_value Polaris-required__Error inputtag" placeholder="Enter Delivery Methods">
                                    </div>
                                </div>
                                <div class="Polaris-FormLayout__Item">
                                    <div class="Polaris-LegacyStack Polaris-LegacyStack--distributionFillEvenly">
                                        <div class="Polaris-LegacyStack__Item">
                                            <label class="Polaris-Choice Polaris-RadioButton__ChoiceLabel" for="ext9_tier_${mainIndex}_rule_condition_${tierRuleIndex}_0">
                                                <span class="Polaris-Choice__Control">
                                                    <span class="Polaris-RadioButton">
                                                        <input type="radio" id="ext9_tier_${mainIndex}_rule_condition_${tierRuleIndex}_0" name="ext9_tier[${mainIndex}][value][${tierRuleIndex}][condition]" class="Polaris-RadioButton__Input" aria-describedby="optionalHelpText" value="1" checked>
                                                        <span class="Polaris-RadioButton__Backdrop"></span>
                                                    </span>
                                                </span>
                                                <span class="Polaris-Choice__Label">
                                                    <span>Stack</span>
                                                </span>
                                            </label>
                                        </div>
                                        <div class="Polaris-LegacyStack__Item">
                                            <label class="Polaris-Choice Polaris-RadioButton__ChoiceLabel" for="ext9_tier_${mainIndex}_rule_condition_${tierRuleIndex}_1">
                                                <span class="Polaris-Choice__Control">
                                                    <span class="Polaris-RadioButton">
                                                        <input type="radio" id="ext9_tier_${mainIndex}_rule_condition_${tierRuleIndex}_1" name="ext9_tier[${mainIndex}][value][${tierRuleIndex}][condition]" class="Polaris-RadioButton__Input" aria-describedby="optionalHelpText" value="2">
                                                        <span class="Polaris-RadioButton__Backdrop"></span>
                                                    </span>
                                                </span>
                                                <span class="Polaris-Choice__Label">
                                                    <span>Terminate</span>
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $(this).closest(".ext9_tier").find("#append_ext9_tier_rules_div").append(html);
            bootstrapTagsInputReinitialize();
            hideShowDeleteRuleBtn();
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });

    $(document).on('click', 'button.save_ext9_hide_rule_btn', function (event) {
        // $(".on-click-disable").attr("disabled", true);
        event.preventDefault();
        const formData = $("#ext9_tier_form").serializeArray();
        $error = checkValidations();
        if (!$error) {
            LoaderStart();
            $.ajax({
                url: $("#ext9_tier_form").attr('action'),
                type: "POST",
                data: formData,
                success: function (response) {
                    LoaderStop();
                    if (response.status === 200) {
                        ToastNotice(response.message)
                        pageReload();
                    } else {
                        ToastNotice(response.message, true)
                    }
                }, error: function (response) {
                    ToastNotice(response.message, true)
                }
            });
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });
    // ==========>          EXT-9 HIDE TIER SET-2 END           <==========

    // ==========>          EXT-8 HIDE TIER START           <==========
    $(document).on('click', 'button.ext8_add_condition_btn', function (event) {
        event.preventDefault();
        const tierIndex = $(this).closest('.ext8_tier').data('ext8_tier_index');
        const tierRuleIndex = $(this).closest(".ext8_tier").find('.ext8_tier_rule_rows').last().data('ext8_tier_rule_rows_index') + 1;
        $error = checkValidations();
        if (!$error) {
            const html = `
                <div id="ext8_tier_${tierIndex}_rule_rows_${tierRuleIndex}" class="ext8_tier_rule_rows" data-ext8_tier_rule_rows_index="${tierRuleIndex}">
                    <div class="Polaris-FormLayout__Items product_remove_list cs_divider line_divider" >
                        <div class="Polaris-FormLayout__Item"></div>
                    </div>
                    <div class="delivery_rule_wrapper">
                        <div class="delete_button">
                            <a href="javascript:void(0)" onclick="deleteTierRuleRow(${tierIndex}, ${tierRuleIndex})" title="Remove">
                                <span>
                                    <svg fill="white" viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true" height="15px" width="15px">
                                        <path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path>
                                    </svg>
                                </span>
                            </a>
                        </div>
                        <div class="Polaris-FormLayout">
                            <div role="group" class="Polaris-FormLayout--grouped">
                                <div class="Polaris-FormLayout__Items">
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="Polaris-TextField">
                                            <input type="number" id="tier_${tierIndex}_rule_min_${tierRuleIndex}" class="Polaris-TextField__Input rule_value Polaris-required__Error Polaris-start_range__Error start_range tier_range_input" value="0" autocomplete="off" placeholder="Start Range">
                                            <div class="Polaris-TextField__Backdrop"></div>
                                        </div>
                                    </div>

                                    <div class="Polaris-FormLayout__Item">
                                        <div class="Polaris-TextField">
                                            <input type="number" id="tier_${tierIndex}_rule_max_${tierRuleIndex}" class="Polaris-TextField__Input rule_value end_range tier_range_input" value="" autocomplete="off" placeholder="End Range">
                                            <div class="Polaris-TextField__Backdrop"></div>
                                        </div>
                                    </div>

                                    <input type="hidden" id="tier_${tierIndex}_rule_value_${tierRuleIndex}" name="tier[${tierIndex}][value][${tierRuleIndex}][value]" class="Polaris-TextField__Input tier_range_value" value="0=">

                                    <div class="Polaris-FormLayout__Item">
                                        <div class="Polaris-TextField">
                                            <input type="text" data-role="tagsinput" id="tier_${tierIndex}_rule_method_${tierRuleIndex}" name="tier[${tierIndex}][value][${tierRuleIndex}][method]" value="" class="Polaris-TextField__Input rule_value Polaris-required__Error inputtag" placeholder="Enter Delivery Methods">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $(this).closest('.ext8_tier').find('.ext8_tier_append_rules_div').append(html);
            bootstrapTagsInputReinitialize();
            hideShowDeleteRuleBtn();
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });

    // add new tier button click event
    $(document).on('click', 'button#ext8_add_new_tier_btn', function (event) {
        event.preventDefault();
        const tierIndex = $(".ext8_tier_main_div").find('.ext8_tier').last().data('ext8_tier_index') + 1;
        $error = checkValidations();
        if (!$error) {
            const allCountries = $(".all_countries").data("all_countries");
            let allCountriesOptionHtml = ``;
            $.each(allCountries, function (code, country) {
                allCountriesOptionHtml += `<option value="${code}">${country}</option>`
            });
            const deliveryIncludeOptions = $("#ext8_tier_main_div").data("delivery_include");
            let deliveryIncludeOptionHtml = ``;
            $.each(deliveryIncludeOptions, function (code, option) {
                deliveryIncludeOptionHtml += `
                    <li class="Polaris-Box" role="presentation">
                        <button id="delivery_include_${option.value}" value="${option.value}" type="button" class="Polaris-ActionList__Item Polaris-ActionList--default ext8_delivery_include" role="menuitem">
                            <div class="Polaris-HorizontalStack" style="--pc-horizontal-stack-block-align: center; --pc-horizontal-stack-wrap: wrap; --pc-horizontal-stack-gap-xs: var(--p-space-4);">
                                <span class="Polaris-ActionList__Text">
                                    <div id="delivery_include_title_${option.value}" class="Polaris-Box">${option.title}</div>
                                    <span class="Polaris-Text--root Polaris-Text--subdued">${option.description}</span>
                                </span>
                            </div>
                        </button>
                    </li>
                `;
            });

            const deliveryMethodTypeOptions = $("#ext8_tier_main_div").data("delivery_method_type");
            let deliveryMethodTypeOptionHtml = ``;
            $.each(deliveryMethodTypeOptions, function (code, option) {
                deliveryMethodTypeOptionHtml += `
                    <div class="Polaris-FormLayout__Item" style="margin-top: 0">
                        <div class="Polaris-Bleed" style="--pc-bleed-margin-block-end-xs:var(--p-space-0);--pc-bleed-margin-inline-start-xs:var(--p-space-0);--pc-bleed-margin-inline-end-xs:var(--p-space-0)">
                            <label class="Polaris-Choice" for="ext8_tier_delivery_method_type_${tierIndex}_${option.id}">
                                <span class="Polaris-Choice__Control">
                                    <span class="Polaris-RadioButton">
                                        <input id="ext8_tier_delivery_method_type_${tierIndex}_${option.id}" name="tier[${tierIndex}][delivery_method_type]" type="radio" class="Polaris-RadioButton__Input" ${option.is_checked} value="${option.value}">
                                        <span class="Polaris-RadioButton__Backdrop"></span>
                                    </span>
                                </span>
                                <span class="Polaris-Choice__Label">
                                    <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">${option.display_name}</span>
                                </span>
                            </label>
                        </div>
                    </div>
                `;
            });

            const ruleHTML = `
                <div id="ext8_tier_${tierIndex}" class="ext8_tier" data-ext8_tier_index="${tierIndex}">
                    <hr>
                    <div style="border-radius: 10px; border: 1px solid #dfdfdf;">
                        <input type="hidden" id="ext8_tier_delivery_tier_id_${tierIndex}" name="tier[${tierIndex}][delivery_tier_id]" value="">
                        <div style="padding: 15px;">
                            <div class="Polaris-Layout__AnnotationWrapper">
                                <div class="Polaris-Layout__Annotation">
                                    <div class="Polaris-TextContainer">
                                        <h2 class="Polaris-Heading Polaris-Text--headingMd">Customization Rules</h2>
                                        <p class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--subdued">
                                            You can set one condition single time only.
                                        </p>
                                    </div>
                                </div>
                                <div class="Polaris-Layout__AnnotationContent">
                                    <div class="Polaris-ShadowBevel" style="--pc-shadow-bevel-z-index:32;--pc-shadow-bevel-content-xs:&quot;&quot;;--pc-shadow-bevel-box-shadow-xs:var(--p-shadow-100);--pc-shadow-bevel-border-radius-xs:var(--p-border-radius-300)">
                                        <div class="Polaris-Box" style="--pc-box-background:var(--p-color-bg-surface);--pc-box-min-height:100%;--pc-box-overflow-x:hidden;--pc-box-overflow-y:hidden;--pc-box-padding-block-end-xs:var(--p-space-400);--pc-box-padding-block-start-xs:var(--p-space-400);--pc-box-padding-inline-start-xs:var(--p-space-400);--pc-box-padding-inline-end-xs:var(--p-space-400)">
                                            <div>
                                                <div class="Polaris-FormLayout">
                                                    <div class="Polaris-FormLayout__Item">
                                                        <div class="Polaris-TextField">
                                                            <select id="ext8_tier_country_code_${tierIndex}" name="tier[${tierIndex}][country_code][]" class="form-control country_code Polaris-required__Error" multiple="multiple">
                                                                <option value="_">All</option>
                                                                ${allCountriesOptionHtml}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div class="Polaris-FormLayout__Item">
                                                        <div class="Polaris-TextField">
                                                            <input type="text" id="ext8_tier_province_code_${tierIndex}" name="tier[${tierIndex}][province_code]" class="Polaris-TextField__Input ext8_province_code inputtag" data-role="tagsinput" placeholder="Enter Province Code">
                                                        </div>
                                                        <p class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--subdued">
                                                            <i>You have to add 2 digit province/state code in "<strong>ISO 3166-1 alpha-2</strong>" format. Allow multiple.</i>
                                                        </p>
                                                    </div>
                                                    <div class="Polaris-FormLayout__Item">
                                                        <div class="">
                                                            <div class="Polaris-Select">
                                                                <select id="ext8_tier_rule_type_${tierIndex}" name="tier[${tierIndex}][rule_type]" class="Polaris-Select__Input ext8_tier_rule_type Polaris-required__Error" aria-invalid="false">
                                                                    <option value="" selected>Select Tier Type</option>
                                                                    <option value="0">Total Amount</option>
                                                                    <option value="1">Subtotal Amount</option>
                                                                    <option value="40">Original Product Amount</option>
                                                                    <option value="2">Total Weight</option>
                                                                    <option value="16">Collection Quantity</option>
                                                                    <option value="17">Total Quantity</option>
                                                                    <option value="28">Collection Total</option>
                                                                </select>
                                                                <div class="Polaris-Select__Content" aria-hidden="true">
                                                                    <span class="Polaris-Select__SelectedOption">Select Tier Type</span>
                                                                    <span class="Polaris-Select__Icon">
                                                                        <span class="Polaris-Icon">
                                                                              <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                                              <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                                        </span>
                                                                    </span>
                                                                </div>
                                                                <div class="Polaris-Select__Backdrop"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="collection_picker_div"></div>
                                                    <div class="Polaris-FormLayout__Item">
                                                        <div class="delivery_include_div">
                                                            <input type="hidden" id="ext8_tier_delivery_include_${tierIndex}" name="tier[${tierIndex}][delivery_include]" class="delivery_include_input" value="1">

                                                            <button class="Polaris-Button ext8_tier_toggle_delivery_include_popup_button" type="button" tabindex="0" aria-expanded="true" style="width: 100%">
                                                                <span class="Polaris-Button__Content">
                                                                    <span  class="Polaris-Button__Text delivery_include_btn_title">Hide selected below</span>
                                                                    <span class="Polaris-Button__Icon">
                                                                        <div class="">
                                                                            <span class="Polaris-Icon">
                                                                                <span class="Polaris-Text--root Polaris-Text--visuallyHidden"></span>
                                                                                <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
                                                                                    <path fill-rule="evenodd" d="M6.24 8.2a.75.75 0 0 1 1.06.04l2.7 2.908 2.7-2.908a.75.75 0 1 1 1.1 1.02l-3.25 3.5a.75.75 0 0 1-1.1 0l-3.25-3.5a.75.75 0 0 1 .04-1.06Z"></path>
                                                                                </svg>
                                                                            </span>
                                                                        </div>
                                                                    </span>
                                                                </span>
                                                            </button>
                                                            <div  class="delivery_include_popover_div" style="display: none">
                                                                <div class="Polaris-PositionedOverlay Polaris-Popover__PopoverOverlay Polaris-Popover__PopoverOverlay--open" style="background: #fff">
                                                                    <div class="Polaris-Popover" data-polaris-overlay="true">
                                                                        <div class="Polaris-Popover__FocusTracker" tabindex="0"></div>
                                                                        <div class="Polaris-Popover__ContentContainer">
                                                                            <div tabindex="-1" class="Polaris-Popover__Content">
                                                                                <div class="Polaris-Popover__Pane Polaris-Scrollable Polaris-Scrollable--vertical Polaris-Scrollable--horizontal" data-polaris-scrollable="true">
                                                                                    <div class="Polaris-Box">
                                                                                        <ul class="Polaris-Box Polaris-Box--listReset" role="menu" tabindex="-1" style="--pc-box-padding-block-end-xs: var(--p-space-2); --pc-box-padding-block-start-xs: var(--p-space-2); --pc-box-padding-inline-start-xs: var(--p-space-2); --pc-box-padding-inline-end-xs: var(--p-space-2);">
                                                                                            ${deliveryIncludeOptionHtml}
                                                                                        </ul>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="Polaris-Popover__FocusTracker" tabindex="0"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="Polaris-FormLayout__Item">
                                                        <div class="Polaris-FormLayout__Item" style="margin-bottom: 0">
                                                            <div class="Polaris-Labelled__LabelWrapper">
                                                                <div class="Polaris-Label">
                                                                    <label id="" for="" class="Polaris-Label__Text">Delivery methods name match :</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div role="group" class="Polaris-FormLayout--condensed">
                                                            <div class="Polaris-FormLayout__Items">
                                                                ${deliveryMethodTypeOptionHtml}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <hr>
                                                <div id="ext8_tier_${tierIndex}_append_rules_div" class="ext8_tier_append_rules_div" data-ext8_tier_append_rules_index="${tierIndex}">
                                                    <div id="ext8_tier_${tierIndex}_rule_rows_0" class="ext8_tier_rule_rows" data-ext8_tier_rule_rows_index="0">
                                                        <div class="delivery_rule_wrapper">
                                                            <div class="delete_button" style="display: none">
                                                                <a href="javascript:void(0)" onclick="deleteTierRuleRow(${tierIndex},0)" title="Remove">
                                                                    <span>
                                                                        <svg fill="white" viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true" height="15px" width="15px">
                                                                            <path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path>
                                                                        </svg>
                                                                    </span>
                                                                </a>
                                                            </div>
                                                            <div class="Polaris-FormLayout">
                                                                <div role="group" class="Polaris-FormLayout--grouped">
                                                                    <div class="Polaris-FormLayout__Items">
                                                                        <div class="Polaris-FormLayout__Item">
                                                                            <div class="Polaris-TextField">
                                                                                <input type="number" id="tier_${tierIndex}_rule_min_0" class="Polaris-TextField__Input rule_value Polaris-required__Error Polaris-start_range__Error start_range tier_range_input" value="0" autocomplete="off" placeholder="Start Range">
                                                                                <div class="Polaris-TextField__Backdrop"></div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="Polaris-FormLayout__Item">
                                                                            <div class="Polaris-TextField">
                                                                                <input type="number" id="tier_${tierIndex}_rule_max_0" class="Polaris-TextField__Input rule_value end_range tier_range_input" value="" autocomplete="off" placeholder="End Range">
                                                                                <div class="Polaris-TextField__Backdrop"></div>
                                                                            </div>
                                                                        </div>
                                                                        <input type="hidden" id="tier_${tierIndex}_rule_value_0" name="tier[${tierIndex}][value][0][value]" class="Polaris-TextField__Input tier_range_value" value="0=">
                                                                        <div class="Polaris-FormLayout__Item">
                                                                            <div class="Polaris-TextField">
                                                                                <input type="text" data-role="tagsinput" id="tier_${tierIndex}_rule_method_0" name="tier[${tierIndex}][value][0][method]" value="" class="Polaris-TextField__Input rule_value Polaris-required__Error inputtag" placeholder="Enter Delivery Methods">
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div  class="ext8_tier_add_rule_btn_div">
                                                    <hr>
                                                    <div class="Polaris-FormLayout">
                                                        <div role="group" class="Polaris-FormLayout--grouped">
                                                            <div class="Polaris-FormLayout__Items">
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <button  class="Polaris-Button Polaris-Button--primary ext8_add_condition_btn" type="button">
                                                                        <span class="Polaris-Button__Content">
                                                                            <span class="Polaris-Button__Text">Add Condition</span>
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <button class="Polaris-Button Polaris-Button--primary Polaris-Button--critical delete_tier_btn_ext8" type="button" style="float: right" onclick="deleteTier(${tierIndex})">
                                                                        <span class="Polaris-Button__Content">
                                                                            <span class="Polaris-Button__Text">Delete Sub Rule</span>
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $(".ext8_tier_main_div").append(ruleHTML);
            bootstrapTagsInputReinitialize();
            initializeSelect2();
            hideShowDeleteRuleBtn();
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });

    $(document).on('change', '.ext8_tier_rule_type', function (event) {
        const This = $(this);
        const selectedExt8RuleType = This.val();
        let collectionHtml = '';
        if (selectedExt8RuleType === '16' || selectedExt8RuleType === '28') {
            const tierIndex = This.closest('.ext8_tier').data('ext8_tier_index');
            collectionHtml = `
                <div class="Polaris-FormLayout__Item">
                    <div class="">
                        <div class="Polaris-TextField collection_id_div" data-id="${tierIndex}" data-id_prefix="ext8_tier_collection_">
                            <input type="text" data-role="tagsinput" id="ext8_tier_collection_${tierIndex}" name="tier[${tierIndex}][collection]" data-selected_collections="[]" class="Polaris-TextField__Input rule_value Polaris-required__Error open_collection_picker inputtag">
                        </div>
                    </div>
                </div>
            `;
        }
        This.closest(".Polaris-FormLayout").find(".collection_picker_div").html(collectionHtml);
        bootstrapTagsInputReinitialize();
    });

    $(document).on('click', 'button.ext8_tier_toggle_delivery_include_popup_button', function (event) {
        const THIS = $(this);
        THIS.closest('.delivery_include_div').find('.delivery_include_popover_div').toggle();
    });

    $(document).on('click', '.ext8_delivery_include', function (event) {
        const THIS = $(this);
        const val = THIS.val();
        THIS.closest('.delivery_include_div').find(".delivery_include_popover_div").toggle();
        THIS.closest('.delivery_include_div').find(".delivery_include_input").val(val);
        const title = $("#delivery_include_title_" + val).html();
        THIS.closest('.delivery_include_div').find(".delivery_include_btn_title").html(title);
    });

    $(document).on('click', 'button.save_ext8_hide_tier_rule_btn', function (event) {
        event.preventDefault();
        const formData = $("#ext8_tier_form").serializeArray();
        $error = checkValidations();
        if (!$error) {
            LoaderStart();
            $.ajax({
                url: $("#ext8_tier_form").attr('action'),
                type: "POST",
                data: formData,
                success: function (response) {
                    LoaderStop();
                    if (response.status === 200) {
                        ToastNotice(response.message)
                        pageReload();
                    } else {
                        ToastNotice(response.message, true)
                    }
                }, error: function (response) {
                    ToastNotice(response.message, true)
                }
            });
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });
    // ==========>          EXT-8 HIDE TIER END         <==========

    // ==========>          EXT-7 HIDE TIER START           <==========
    // condition_type radio button change event
    $(document).on('change', '.ext7_tier_condition_type', function (event) {
        const discount_type = $(this).val() == '0' ? "and" : "or";
        $(this).closest('.ext7_tier_append_rules_div').find('.ext7_tier_rule_rows').find(".prefix").text(discount_type);
    });

    // add new tier button click event
    $(document).on('click', 'button#ext7_add_new_tier_btn', function (event) {
        event.preventDefault();
        const tierIndex = $(".ext7_tier_main_div").find('.ext7_tier').last().data('ext7_tier_index') + 1;
        $error = checkValidations();
        if (!$error) {
            const selectedTypes = [];
            $(".ext7_tier_main_div").find('.ext7_tier').each(function (i, el) {
                $(el).find(".ext7_tier_rule_type").each(function () {
                    selectedTypes.push($(this).val());
                });
            });
            let cartHasAnyItemGroup = `
                <option value="3">SKU</option>
                <option value="16">Choose Collection</option>
            `;
            let customerGroup = `
                <option value="13">Customer tags</option>
                <option value="14">Total Spend</option>
            `;
            if (selectedTypes.includes("16") && !selectedTypes.includes("13")) {
                cartHasAnyItemGroup = `
                    <option value="3">SKU</option>
                    <option value="16" disabled>Choose Collection</option>
                `;
                customerGroup = `
                    <option value="13">Customer tags</option>
                    <option value="14">Total Spend</option>
                `;
            } else if (selectedTypes.includes("13") && !selectedTypes.includes("16")) {
                cartHasAnyItemGroup = `
                    <option value="3">SKU</option>
                    <option value="16">Choose Collection</option>
                `;
                customerGroup = `
                    <option value="13" disabled>Customer tags</option>
                    <option value="14">Total Spend</option>
                `;
            } else if (selectedTypes.includes("16") && selectedTypes.includes("13")) {
                cartHasAnyItemGroup = `
                    <option value="3">SKU</option>
                    <option value="16" disabled>Choose Collection</option>
                `;
                customerGroup = `
                    <option value="13" disabled>Customer tags</option>
                    <option value="14">Total Spend</option>
                `;
            }

            const ruleHTML = `
                <div id="ext7_tier_${tierIndex}" class="ext7_tier" data-ext7_tier_index="${tierIndex}">
                    <hr>
                    <div style="border-radius: 10px; border: 1px solid #dfdfdf;">
                        <input type="hidden" id="ext7_tier_delivery_tier_id_${tierIndex}" name="tier[${tierIndex}][delivery_tier_id]" value="">
                        <div style="padding: 15px;">
                            <div class="Polaris-Layout__AnnotationWrapper" style="padding-bottom: 10px;">
                                <div class="Polaris-Layout__Annotation">
                                    <div class="Polaris-TextContainer">
                                        <h2 class="Polaris-Heading Polaris-Text--headingMd">Enter Delivery Method</h2>
                                        <div class="Polaris-Layout__AnnotationDescription"></div>
                                    </div>
                                </div>
                                <div class="Polaris-Layout__AnnotationContent">
                                    <div class="Polaris-ShadowBevel" style="--pc-shadow-bevel-z-index:32;--pc-shadow-bevel-content-xs:&quot;&quot;;--pc-shadow-bevel-box-shadow-xs:var(--p-shadow-100);--pc-shadow-bevel-border-radius-xs:var(--p-border-radius-300)">
                                        <div class="Polaris-Box" style="--pc-box-background:var(--p-color-bg-surface);--pc-box-min-height:100%;--pc-box-overflow-x:hidden;--pc-box-overflow-y:hidden;--pc-box-padding-block-end-xs:var(--p-space-400);--pc-box-padding-block-start-xs:var(--p-space-400);--pc-box-padding-inline-start-xs:var(--p-space-400);--pc-box-padding-inline-end-xs:var(--p-space-400)">
                                            <div class="Polaris-FormLayout">
                                                <div class="Polaris-FormLayout__Item">
                                                    <div class="">
                                                        <div class="Polaris-Labelled__LabelWrapper">
                                                            <div class="Polaris-Label">
                                                                <label id="PolarisTextField1Label" for="PolarisTextField1" class="Polaris-Label__Text">Delivery methods name match :</label>
                                                            </div>
                                                        </div>
                                                        <div class="Polaris-InlineStack" style="--pc-inline-stack-wrap:nowrap">
                                                            <div class="" style="width: 33.33%;">
                                                                <div class="Polaris-Bleed" style="--pc-bleed-margin-block-end-xs:var(--p-space-0);--pc-bleed-margin-inline-start-xs:var(--p-space-0);--pc-bleed-margin-inline-end-xs:var(--p-space-0)">
                                                                    <label class="Polaris-Choice" for="ext7_tier_delivery_method_type_${tierIndex}_d_m_type_contains">
                                                                        <span class="Polaris-Choice__Control">
                                                                            <span class="Polaris-RadioButton">
                                                                                <input id="ext7_tier_delivery_method_type_${tierIndex}_d_m_type_contains" name="tier[${tierIndex}][delivery_method_type]" type="radio" class="Polaris-RadioButton__Input" value="1">
                                                                                <span class="Polaris-RadioButton__Backdrop"></span>
                                                                            </span>
                                                                        </span>
                                                                        <span class="Polaris-Choice__Label">
                                                                            <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">Contains</span>
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <div class="" style="width: 33.33%;">
                                                                <div class="Polaris-Bleed" style="--pc-bleed-margin-block-end-xs:var(--p-space-0);--pc-bleed-margin-inline-start-xs:var(--p-space-0);--pc-bleed-margin-inline-end-xs:var(--p-space-0)">
                                                                    <label class="Polaris-Choice" for="ext7_tier_delivery_method_type_${tierIndex}_d_m_type_exact_case">
                                                                        <span class="Polaris-Choice__Control">
                                                                            <span class="Polaris-RadioButton">
                                                                                <input id="ext7_tier_delivery_method_type_${tierIndex}_d_m_type_exact_case" name="tier[${tierIndex}][delivery_method_type]" type="radio" class="Polaris-RadioButton__Input" checked="" value="2">
                                                                                <span class="Polaris-RadioButton__Backdrop"></span>
                                                                            </span>
                                                                        </span>
                                                                        <span class="Polaris-Choice__Label">
                                                                            <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">Exact (Case-Sensitive)</span>
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <div class="" style="width: 33.33%;">
                                                                <div class="Polaris-Bleed" style="--pc-bleed-margin-block-end-xs:var(--p-space-0);--pc-bleed-margin-inline-start-xs:var(--p-space-0);--pc-bleed-margin-inline-end-xs:var(--p-space-0)">
                                                                    <label class="Polaris-Choice" for="ext7_tier_delivery_method_type_${tierIndex}_d_m_type_exact_non_case">
                                                                        <span class="Polaris-Choice__Control">
                                                                            <span class="Polaris-RadioButton">
                                                                                <input id="ext7_tier_delivery_method_type_${tierIndex}_d_m_type_exact_non_case" name="tier[${tierIndex}][delivery_method_type]" type="radio" class="Polaris-RadioButton__Input" value="3">
                                                                                <span class="Polaris-RadioButton__Backdrop"></span>
                                                                            </span>
                                                                        </span>
                                                                        <span class="Polaris-Choice__Label">
                                                                            <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">Exact (Non Case)</span>
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr>
                                            <div class="Polaris-FormLayout">
                                                <div role="group" class="Polaris-FormLayout--grouped">
                                                    <div class="Polaris-FormLayout__Items">
                                                        <div class="Polaris-FormLayout__Item">
                                                            <div class="Polaris-Connected">
                                                                <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                                    <div class="Polaris-TextField delivery_method_div">
                                                                        <input type="text" id="ext7_tier_delivery_method_${tierIndex}" name="tier[${tierIndex}][delivery_method]" class="Polaris-TextField__Input ext7_tier_delivery_method Polaris-required__Error inputtag" data-role="tagsinput" autocomplete="off" placeholder="Ex. Standard" value="">
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style="padding-left: 22px;">
                                                            <div class="Polaris-Labelled__HelpText" id="PolarisTextField1HelpText">
                                                                <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--break Polaris-Text--subdued">
                                                                    <span>Delivery method name that you have set up on the store's settings.</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="Polaris-FormLayout__Item">
                                                    <div class="Polaris-FormLayout">
                                                        <div role="group" class="Polaris-FormLayout--condensed">
                                                            <div class="Polaris-FormLayout__Items">
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <div class="">
                                                                        <label class="Polaris-Choice Polaris-RadioButton__ChoiceLabel" for="ext7_tier_hide_show_0_${tierIndex}">
                                                                            <span class="Polaris-Choice__Control">
                                                                                <span class="Polaris-RadioButton">
                                                                                    <input id="ext7_tier_hide_show_0_${tierIndex}" name="tier[${tierIndex}][hide_show]" type="radio" class="Polaris-RadioButton__Input ext7_tier_hide_show" aria-describedby="disabledHelpText" checked value="0">
                                                                                    <span class="Polaris-RadioButton__Backdrop"></span>
                                                                                </span>
                                                                            </span>
                                                                            <span class="Polaris-Choice__Label">
                                                                                <span>Hide</span>
                                                                            </span>
                                                                        </label>
                                                                        <div class="Polaris-Choice__Descriptions">
                                                                            <div class="Polaris-Choice__HelpText" id="disabledHelpText">
                                                                                <span class="Polaris-Text--root Polaris-Text--subdued">Hide method when the below conditions match</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <div class="">
                                                                        <label class="Polaris-Choice Polaris-RadioButton__ChoiceLabel" for="ext7_tier_hide_show_1_${tierIndex}">
                                                                            <span class="Polaris-Choice__Control">
                                                                                <span class="Polaris-RadioButton">
                                                                                    <input id="ext7_tier_hide_show_1_${tierIndex}" name="tier[${tierIndex}][hide_show]" type="radio" class="Polaris-RadioButton__Input ext7_tier_hide_show" aria-describedby="disabledHelpText" value="1">
                                                                                    <span class="Polaris-RadioButton__Backdrop"></span>
                                                                                </span>
                                                                            </span>
                                                                            <span class="Polaris-Choice__Label">
                                                                                <span>Show</span>
                                                                            </span>
                                                                        </label>
                                                                        <div class="Polaris-Choice__Descriptions">
                                                                            <div class="Polaris-Choice__HelpText" id="disabledHelpText">
                                                                                <span class="Polaris-Text--root Polaris-Text--subdued">Show method when the below conditions match</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="Polaris-FormLayout__Item operation_type_div">
                                                    <label class="Polaris-Choice Polaris-Checkbox__ChoiceLabel" for="ext7_tier_operation_type_${tierIndex}">
                                                        <span class="Polaris-Choice__Control">
                                                            <span class="Polaris-Checkbox">
                                                                <input id="ext7_tier_operation_type_${tierIndex}" name="tier[${tierIndex}][operation_type]" type="checkbox" class="Polaris-Checkbox__Input ext7_tier_operation_type" aria-invalid="false" role="checkbox" aria-checked="false" value="1">
                                                                <span class="Polaris-Checkbox__Backdrop"></span>
                                                                <span class="Polaris-Checkbox__Icon">
                                                                    <span class="Polaris-Icon">
                                                                        <span class="Polaris-Text--root Polaris-Text--visuallyHidden"></span>
                                                                        <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
                                                                            <path fill-rule="evenodd" d="M14.03 7.22a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 1 1 1.06-1.06l1.72 1.72 3.97-3.97a.75.75 0 0 1 1.06 0Z"></path>
                                                                        </svg>
                                                                    </span>
                                                                </span>
                                                            </span>
                                                        </span>
                                                        <span class="Polaris-Choice__Label">
                                                            <span>Default hide?</span>
                                                        </span>
                                                    </label>
                                                    <div class="Polaris-Choice__Descriptions">
                                                        <div class="Polaris-Choice__HelpText" id="disabledHelpText">
                                                            <span class="Polaris-Text--root Polaris-Text--subdued">This option helps while using customer-based or shipping-method-based rule setup on one-page checkout</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="Polaris-Layout__AnnotationWrapper">
                                <div class="Polaris-Layout__Annotation">
                                    <div class="Polaris-TextContainer">
                                        <h2 class="Polaris-Heading Polaris-Text--headingMd">Customization Rules</h2>
                                        <p class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--subdued">
                                            You can set one condition single time only.
                                        </p>
                                    </div>
                                </div>
                                <div class="Polaris-Layout__AnnotationContent">
                                    <div class="Polaris-ShadowBevel" style="--pc-shadow-bevel-z-index:32;--pc-shadow-bevel-content-xs:&quot;&quot;;--pc-shadow-bevel-box-shadow-xs:var(--p-shadow-100);--pc-shadow-bevel-border-radius-xs:var(--p-border-radius-300)">
                                        <div class="Polaris-Box" style="--pc-box-background:var(--p-color-bg-surface);--pc-box-min-height:100%;--pc-box-overflow-x:hidden;--pc-box-overflow-y:hidden;--pc-box-padding-block-end-xs:var(--p-space-400);--pc-box-padding-block-start-xs:var(--p-space-400);--pc-box-padding-inline-start-xs:var(--p-space-400);--pc-box-padding-inline-end-xs:var(--p-space-400)">
                                            <div>
                                                <div id="ext7_tier_${tierIndex}_append_rules_div" class="ext7_tier_append_rules_div" data-ext7_tier_append_rules_index="0">
                                                    <div class="Polaris-FormLayout">
                                                        <div role="group" class="Polaris-FormLayout--grouped">
                                                            <div class="Polaris-FormLayout__Items">
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <div class="Polaris-Bleed" style="--pc-bleed-margin-block-end-xs:var(--p-space-0);--pc-bleed-margin-inline-start-xs:var(--p-space-0);--pc-bleed-margin-inline-end-xs:var(--p-space-0)">
                                                                        <label class="Polaris-Choice" for="ext7_tier_all_below_condition_${tierIndex}">
                                                                            <span class="Polaris-Choice__Control">
                                                                                <span class="Polaris-RadioButton">
                                                                                    <input id="ext7_tier_all_below_condition_${tierIndex}" name="tier[${tierIndex}][condition_type]" type="radio" class="Polaris-RadioButton__Input ext7_tier_condition_type" checked value="0">
                                                                                    <span class="Polaris-RadioButton__Backdrop"></span>
                                                                                </span>
                                                                            </span>
                                                                            <span class="Polaris-Choice__Label"><span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">All Below</span></span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <div class="Polaris-Bleed" style="--pc-bleed-margin-block-end-xs:var(--p-space-0);--pc-bleed-margin-inline-start-xs:var(--p-space-0);--pc-bleed-margin-inline-end-xs:var(--p-space-0)">
                                                                        <label class="Polaris-Choice" for="ext7_tier_any_below_condition_${tierIndex}">
                                                                            <span class="Polaris-Choice__Control">
                                                                                <span class="Polaris-RadioButton">
                                                                                    <input id="ext7_tier_any_below_condition_${tierIndex}" name="tier[${tierIndex}][condition_type]" type="radio" class="Polaris-RadioButton__Input ext7_tier_condition_type" value="1">
                                                                                    <span class="Polaris-RadioButton__Backdrop"></span>
                                                                                </span>
                                                                            </span>
                                                                            <span class="Polaris-Choice__Label"><span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">Any Below</span></span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <hr>
                                                    <div id="conditions_main_div" class="conditions_main_div">
                                                        <div id="ext7_tier_${tierIndex}_rule_rows_0" class="ext7_tier_rule_rows" data-ext7_tier_rule_rows_index="0">
                                                            <div class="delivery_rule_wrapper">
                                                                <div class="delete_button" style="display: none">
                                                                    <a href="javascript:void(0)" onclick="deleteTierRuleRowExt7(0, 0, this)" title="Remove">
                                                                        <span>
                                                                            <svg fill="white" viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true" height="15px" width="15px">
                                                                                <path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path>
                                                                            </svg>
                                                                        </span>
                                                                    </a>
                                                                </div>
                                                                <div class="Polaris-FormLayout">
                                                                    <div role="group" class="Polaris-FormLayout--grouped">
                                                                        <div class="Polaris-FormLayout__Items">
                                                                            <div class="Polaris-FormLayout__Item">
                                                                                <div class="">
                                                                                    <div class="Polaris-Select">
                                                                                        <select id="ext7_tier_${tierIndex}_rule_type_0" name="tier[${tierIndex}][rule][0][type]" class="Polaris-Select__Input ext7_tier_rule_type Polaris-required__Error" aria-invalid="false">
                                                                                            <option value="" selected>Select Rule Type</option>
                                                                                            <optgroup label="Cart Details">
                                                                                                <option value="0">Total Amount</option>
                                                                                                <option value="1">Subtotal Amount</option>
                                                                                                <option value="2">Total Weight</option>
                                                                                                <option value="17">Total Quantity</option>
                                                                                            </optgroup>
                                                                                            <optgroup label="Cart Has Any Items">
                                                                                                <!--<option value="3">SKU</option>-->
                                                                                                <!--<option value="16">Choose Collection</option>-->
                                                                                                ${cartHasAnyItemGroup}
                                                                                            </optgroup>
                                                                                            <optgroup label="Address">
                                                                                                <option value="8">Country</option>
                                                                                                <option value="9">Province Code / State Code</option>
                                                                                                <option value="10">Zip Code / Postal Code</option>
                                                                                                <option value="11">City / Area</option>
                                                                                                <option value="12">Address Line</option>
                                                                                            </optgroup>
                                                                                            <optgroup label="Customer">
                                                                                                <!--<option value="13">Customer tags</option>-->
                                                                                                <!--<option value="14">Total Spend</option>-->
                                                                                                ${customerGroup}
                                                                                            </optgroup>
                                                                                        </select>
                                                                                        <div class="Polaris-Select__Content" aria-hidden="true">
                                                                                            <span class="Polaris-Select__SelectedOption">Select Rule Type</span>
                                                                                            <span class="Polaris-Select__Icon">
                                                                                                <span class="Polaris-Icon">
                                                                                                    <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                                                                    <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                                                                </span>
                                                                                            </span>
                                                                                        </div>
                                                                                        <div class="Polaris-Select__Backdrop"></div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="Polaris-FormLayout__Item">
                                                                                <div class="">
                                                                                    <div class="Polaris-Select">
                                                                                        <select id="ext7_tier_${tierIndex}_rule_condition_0" name="tier[${tierIndex}][rule][0][condition]" class="Polaris-Select__Input ext7_tier_rule_condition Polaris-required__Error" aria-invalid="false">
                                                                                            <option value="" selected>Select Rule Condition</option>
                                                                                            <option value="0">Greater than or equals</option>
                                                                                            <option value="1">Less than or equals</option>
                                                                                        </select>
                                                                                        <div class="Polaris-Select__Content" aria-hidden="true">
                                                                                            <span class="Polaris-Select__SelectedOption option_text">Select Rule Condition</span>
                                                                                            <span class="Polaris-Select__Icon">
                                                                                                <span class="Polaris-Icon">
                                                                                                    <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                                                                    <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                                                                </span>
                                                                                            </span>
                                                                                        </div>
                                                                                        <div class="Polaris-Select__Backdrop"></div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="Polaris-FormLayout__Item">
                                                                                <div class="">
                                                                                    <div class="Polaris-Connected">
                                                                                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                                                            <div class="ext7_tier_rule_value_div">
                                                                                                <div class="Polaris-TextField">
                                                                                                    <input type="text" id="ext7_tier_${tierIndex}_rule_value_0" name="tier[${tierIndex}][rule][0][value]" class="Polaris-TextField__Input ext7_tier_rule_value Polaris-required__Error">
                                                                                                    <div class="Polaris-TextField__Backdrop removeTagInput"></div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div  class="ext7_tier_add_rule_btn_div">
                                                    <hr>
                                                    <div class="Polaris-FormLayout">
                                                        <div role="group" class="Polaris-FormLayout--grouped">
                                                            <div class="Polaris-FormLayout__Items">
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <button  class="Polaris-Button Polaris-Button--primary ext7_tier_add_rule_btn" type="button">
                                                                        <span class="Polaris-Button__Content">
                                                                            <span class="Polaris-Button__Text">Add Condition</span>
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <button class="Polaris-Button Polaris-Button--critical delete_tier_btn_ext7" onclick="deleteTierExt7(${tierIndex})" type="button" style="float: right">
                                                                        <span class="Polaris-Button__Content">
                                                                            <span class="Polaris-Button__Text">Delete Sub Rule</span>
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            $(".ext7_tier_main_div").append(ruleHTML);
            bootstrapTagsInputReinitialize();
            hideShowDeleteRuleBtn();
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });

    $(document).on('click', '.ext7_tier_hide_show', function (event) {
        const This = $(this);
        if (This.val() == '1') {
            This.closest(".Polaris-Layout__AnnotationContent").find(".operation_type_div").hide();
            // This.closest(".Polaris-Card__Section").find(".ext7_tier_operation_type").prop('checked', false);
        } else {
            This.closest(".Polaris-Layout__AnnotationContent").find(".operation_type_div").show();
        }
    });

    // add new rule in specific tier button click event
    $(document).on('click', '.ext7_tier_add_rule_btn', function (event) {
        event.preventDefault();
        const beforeAppendRowSelectedRuleTypes = getSelectedRuleTypesExt7(this);
        const tierIndex = $(this).closest('.ext7_tier').data('ext7_tier_index');
        const tierRuleIndex = $(this).closest(".ext7_tier").find('.ext7_tier_rule_rows').last().data('ext7_tier_rule_rows_index') + 1;
        $error = checkValidations();
        if (!$error) {
            const checked = $(this).closest('.ext7_tier').find('.ext7_tier_condition_type:checked').val() == '0' ? "and" : "or";
            const selectedTypes = [];
            $(".ext7_tier_main_div").find('.ext7_tier').each(function (i, el) {
                $(el).find(".ext7_tier_rule_type").each(function () {
                    selectedTypes.push($(this).val());
                });
            });

            let cartHasAnyItemGroupOptions = `
                <option value="3" ${beforeAppendRowSelectedRuleTypes.includes("3") ? "disabled" : ""}>SKU</option>
                <option value="16" ${beforeAppendRowSelectedRuleTypes.includes("16") ? "disabled" : ""}>Choose Collection</option>
            `;
            let customerGroupOptions = `
                <option value="13" ${beforeAppendRowSelectedRuleTypes.includes("13") ? "disabled" : ""}>Customer tags</option>
                <option value="14" ${beforeAppendRowSelectedRuleTypes.includes("14") ? "disabled" : ""}>Total Spend</option>
            `;

            if (selectedTypes.includes("16") && !selectedTypes.includes("13")) {
                cartHasAnyItemGroupOptions = `
                    <option value="3" ${beforeAppendRowSelectedRuleTypes.includes("3") ? "disabled" : ""}>SKU</option>
                    <option value="16" disabled>Choose Collection</option>
                `;
                customerGroupOptions = `
                    <option value="13" ${beforeAppendRowSelectedRuleTypes.includes("13") ? "disabled" : ""}>Customer tags</option>
                    <option value="14" ${beforeAppendRowSelectedRuleTypes.includes("14") ? "disabled" : ""}>Total Spend</option>
                `;
            } else if (selectedTypes.includes("13") && !selectedTypes.includes("16")) {
                cartHasAnyItemGroupOptions = `
                    <option value="3" ${beforeAppendRowSelectedRuleTypes.includes("3") ? "disabled" : ""}>SKU</option>
                    <option value="16" ${beforeAppendRowSelectedRuleTypes.includes("16") ? "disabled" : ""}>Choose Collection</option>
                `;
                customerGroupOptions = `
                    <option value="13" disabled>Customer tags</option>
                    <option value="14" ${beforeAppendRowSelectedRuleTypes.includes("14") ? "disabled" : ""}>Total Spend</option>
                `;
            } else if (selectedTypes.includes("16") && selectedTypes.includes("13")) {
                cartHasAnyItemGroupOptions = `
                    <option value="3" ${beforeAppendRowSelectedRuleTypes.includes("3") ? "disabled" : ""}>SKU</option>
                    <option value="16" disabled>Choose Collection</option>
                `;
                customerGroupOptions = `
                    <option value="13" disabled>Customer tags</option>
                    <option value="14" ${beforeAppendRowSelectedRuleTypes.includes("14") ? "disabled" : ""}>Total Spend</option>
                `;
            }

            let typeOptionsHtml = `
                <optgroup label="Cart Details">
                    <option value="0" ${beforeAppendRowSelectedRuleTypes.includes("0") ? "disabled" : ""}>Total Amount</option>
                    <option value="1" ${beforeAppendRowSelectedRuleTypes.includes("1") ? "disabled" : ""}>Subtotal Amount</option>
                    <option value="2" ${beforeAppendRowSelectedRuleTypes.includes("2") ? "disabled" : ""}>Total Weight</option>
                    <option value="17" ${beforeAppendRowSelectedRuleTypes.includes("17") ? "disabled" : ""}>Total Quantity</option>
                </optgroup>
                <optgroup label="Cart Has Any Items">
                    <!--<option value="3" ${beforeAppendRowSelectedRuleTypes.includes("3") ? "disabled" : ""}>SKU</option>-->
                    <!--<option value="16" ${beforeAppendRowSelectedRuleTypes.includes("16") ? "disabled" : ""}>Choose Collection</option>-->
                    ${cartHasAnyItemGroupOptions}
                </optgroup>
                <optgroup label="Address">
                    <option value="8" ${beforeAppendRowSelectedRuleTypes.includes("8") ? "disabled" : ""}>Country</option>
                    <option value="9" ${beforeAppendRowSelectedRuleTypes.includes("9") ? "disabled" : ""}>Province Code / State Code</option>
                    <option value="10" ${beforeAppendRowSelectedRuleTypes.includes("10") ? "disabled" : ""}>Zip Code / Postal Code</option>
                    <option value="11" ${beforeAppendRowSelectedRuleTypes.includes("11") ? "disabled" : ""}>City / Area</option>
                    <option value="12" ${beforeAppendRowSelectedRuleTypes.includes("12") ? "disabled" : ""}>Address Line</option>
                </optgroup>
                <optgroup label="Customer">
                    <!--<option value="13" ${beforeAppendRowSelectedRuleTypes.includes("13") ? "disabled" : ""}>Customer tags</option>-->
                    <!--<option value="14" ${beforeAppendRowSelectedRuleTypes.includes("14") ? "disabled" : ""}>Total Spend</option>-->
                    ${customerGroupOptions}
                </optgroup>
            `;

            const ruleHTML = `
                <div id="ext7_tier_${tierIndex}_rule_rows_${tierRuleIndex}" class="ext7_tier_rule_rows" data-ext7_tier_rule_rows_index="${tierRuleIndex}">
                    <div class="Polaris-FormLayout__Items product_remove_list cs_divider line_divider">
                         <div class="Polaris-FormLayout__Item">
                             <span class="seperator-line prefix">${checked}</span>
                         </div>
                    </div>
                    <div class="delivery_rule_wrapper">
                        <div class="delete_button" style="display: none">
                            <a href="javascript:void(0)" onclick="deleteTierRuleRowExt7(${tierIndex}, ${tierRuleIndex}, this)" title="Remove">
                                <span>
                                    <svg fill="white" viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true" height="15px" width="15px">
                                        <path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path>
                                    </svg>
                                </span>
                            </a>
                        </div>
                        <div class="Polaris-FormLayout">
                            <div role="group" class="Polaris-FormLayout--grouped">
                                <div class="Polaris-FormLayout__Items">
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-Select">
                                                <select id="ext7_tier_${tierIndex}_rule_type_${tierRuleIndex}" name="tier[${tierIndex}][rule][${tierRuleIndex}][type]" class="Polaris-Select__Input ext7_tier_rule_type Polaris-required__Error" aria-invalid="false">
                                                    <option value="" selected>Select Rule Type</option>
                                                    ${typeOptionsHtml}
                                                </select>
                                                <div class="Polaris-Select__Content" aria-hidden="true">
                                                    <span class="Polaris-Select__SelectedOption">Select Rule Type</span>
                                                    <span class="Polaris-Select__Icon">
                                                        <span class="Polaris-Icon">
                                                              <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                              <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                        </span>
                                                    </span>
                                                </div>
                                                <div class="Polaris-Select__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-Select">
                                                <select id="ext7_tier_${tierIndex}_rule_condition_${tierRuleIndex}" name="tier[${tierIndex}][rule][${tierRuleIndex}][condition]" class="Polaris-Select__Input ext7_tier_rule_condition Polaris-required__Error" aria-invalid="false">
                                                    <option value="" selected>Select Rule Condition</option>
                                                    <option value="0">Greater than or equals</option>
                                                    <option value="1">Less than or equals</option>
                                                </select>
                                                <div class="Polaris-Select__Content" aria-hidden="true">
                                                    <span class="Polaris-Select__SelectedOption option_text">Select Rule Condition</span>
                                                    <span class="Polaris-Select__Icon">
                                                        <span class="Polaris-Icon">
                                                          <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                          <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                        </span>
                                                    </span>
                                                </div>
                                                <div class="Polaris-Select__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-Connected">
                                                <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                    <div class="ext7_tier_rule_value_div">
                                                        <div class="Polaris-TextField">
                                                            <input type="text" id="ext7_tier_${tierIndex}_rule_value_${tierRuleIndex}" name="tier[${tierIndex}][rule][${tierRuleIndex}][value]" class="Polaris-TextField__Input ext7_tier_rule_value Polaris-required__Error">
                                                            <div class="Polaris-TextField__Backdrop removeTagInput"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            $(this).closest('.ext7_tier').find('.ext7_tier_append_rules_div').find('.conditions_main_div').append(ruleHTML);
            bootstrapTagsInputReinitialize();
            hideShowDeleteRuleBtn();
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });

    // rule type select box change event
    $(document).on('change', '.ext7_tier_rule_type', function (e) {
        const currentSelectedRuleType = $(this).val();
        const selectedRuleTypeIndex = $(this).closest('.ext7_tier_rule_rows').data('ext7_tier_rule_rows_index');
        const selectedRuleTierIndex = $(this).closest('.ext7_tier').data('ext7_tier_index');
        hideShowAddRuleButtonExt7(this);

        let options = '<option value="" disabled>Select Rule Condition</option>';
        let ruleTypeHtml = `
            <div class="Polaris-TextField">
                <input type="text" data-role="tagsinput" id="ext7_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input ext7_tier_rule_value Polaris-required__Error inputtag">
            </div>
        `;
        if (currentSelectedRuleType === '0' || currentSelectedRuleType === '1' || currentSelectedRuleType === '2' || currentSelectedRuleType === '17' || currentSelectedRuleType === '14') {
            var Class = "price_input";
            options += `
                <option value="0" selected>Greater than or equals</option>
                <option value="1">Less than or equals</option>
            `;
            ruleTypeHtml = `
                <div class="Polaris-TextField">
                    <input type="text" id="ext7_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input ext7_tier_rule_value Polaris-required__Error ${Class}">
                    <div class="Polaris-TextField__Backdrop"></div>
                </div>
            `;
        } else if (currentSelectedRuleType === '8' || currentSelectedRuleType === '9' || currentSelectedRuleType === '10' || currentSelectedRuleType === '11' || currentSelectedRuleType === '12' || currentSelectedRuleType === '13') {
            options += `
                <option value="2" selected>Contains</option>
                <option value="3">Does not contains</option>
            `;
        } else if (currentSelectedRuleType === '16') {
            options += `
                <option value="2" selected>Contains</option>
                <option value="3">Does not contains all</option>
                <option value="9">Contains all</option>
                <option value="10">Does not contains</option>
            `;
        } else if (currentSelectedRuleType === '3') {
            options += `
                <option value="2" selected>Contains</option>
                <option value="3">Does not contains all</option>
                <option value="10">Does not contains</option>
            `;
        }

        $(this).parents('.Polaris-FormLayout__Items').find('.ext7_tier_rule_condition').html(options).prop("selectedIndex", 1).trigger('change');
        // $(this).parents('.Polaris-FormLayout__Items').find('.rule_condition').prop("selectedIndex", 1).trigger('change');
//         $(this).parents('.delivery_rule_wrapper').find('#collection_qty_main_div').remove();

        if (currentSelectedRuleType === '2') {
            const weightUnit = $("#ext7_tier_main_div").data("weight_unit")
            ruleTypeHtml = `
                <div class="Polaris-TextField">
                    <input type="text" id="ext7_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input ext7_tier_rule_value Polaris-required__Error price_input">
                    <div class="Polaris-TextField__Backdrop"></div>
                </div>
                <div class="Polaris-Labelled__HelpText" id="PolarisTextField1HelpText">
                    <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--break Polaris-Text--subdued">
                        <span>Please enter weight in <strong>${weightUnit}</strong>.</span>
                    </span>
                </div>
            `;
        } else if (currentSelectedRuleType === '16') {
            ruleTypeHtml = `
                <div class="Polaris-TextField collection_id_div" data-id="ext7_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}">
                    <input type="text" data-role="tagsinput" id="ext7_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input ext7_tier_rule_value Polaris-required__Error open_collection_picker inputtag">
                </div>
            `;
        } else if (currentSelectedRuleType === '8') {
            const allCountries = $(".all_countries").data("all_countries");
            let allCountriesOptionHtml = "";
            $.each(allCountries, function (code, country) {
                allCountriesOptionHtml += `<option value="${code}">${country}</option>`
            });
            ruleTypeHtml = `
                <div class="Polaris-TextField">
                    <select id="ext7_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value][]" class="form-control ext7_tier_rule_value country_code Polaris-required__Error" multiple="multiple">
                    ${allCountriesOptionHtml}
                    </select>
                </div>
            `;
        } else if (currentSelectedRuleType === '9') {
            ruleTypeHtml = `
                <div class="Polaris-TextField">
                    <input type="text" data-role="tagsinput" id="ext7_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input ext7_tier_rule_value Polaris-required__Error inputtag">
                </div>
                <div class="Polaris-Labelled__HelpText" id="PolarisTextField1HelpText">
                    <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--break Polaris-Text--subdued">
                        <span>You have to add 2 digit province/state code in "<strong>ISO 3166-1 alpha-2</strong>" format. Allow multiple.</span>
                    </span>
                </div>
            `;
        } else if (currentSelectedRuleType === '10') {
            ruleTypeHtml += `
                <p class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--subdued">
                    <i>Please add a '*' sign to compare the start with. ex. 123*, H1H*, 3*</i>
                </p>
            `;
        }
        $(this).parents('.Polaris-FormLayout__Items').find(".ext7_tier_rule_value_div").html(ruleTypeHtml);
        bootstrapTagsInputReinitialize();
        initializeSelect2();
    });

    $(document).on('click', 'button.save_ext_7_hide_tier_rule_btn', function (event) {
        // $(".on-click-disable").attr("disabled", true);
        event.preventDefault();
        const formData = $("#ext7_tier_form").serializeArray();
        $error = checkValidations();
        if (!$error) {
            LoaderStart();
            $.ajax({
                url: $("#ext7_tier_form").attr('action'),
                type: "POST",
                data: formData,
                success: function (response) {
                    LoaderStop();
                    if (response.status === 200) {
                        ToastNotice(response.message)
                        pageReload();
                    } else {
                        ToastNotice(response.message, true)
                    }
                }, error: function (response) {
                    ToastNotice(response.message, true)
                }
            });
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });
    // ==========>          EXT-7 HIDE TIER END         <==========

    // ==========>          EXT-10 HIDE SET1 MULTIPLE START         <==========
    // condition_type radio button change event
    $(document).on('change', '.ext10_tier_condition_type', function (e) {
        const discount_type = $(this).val() == '0' ? "and" : "or";
        $(this).closest('.ext10_tier_append_rules_div').find('.ext10_tier_rule_rows').find(".prefix").text(discount_type);
    });

    // add new tier button click event
    $(document).on('click', 'button#ext10_add_new_tier_btn', function (event) {
        event.preventDefault();
        const tierIndex = $(".ext10_tier_main_div").find('.ext10_tier').last().data('ext10_tier_index') + 1;
        $error = checkValidations();

        if (!$error) {
            const ruleHTML = `
                <div id="ext10_tier_${tierIndex}" class="ext10_tier" data-ext10_tier_index="${tierIndex}">
                    <hr>
                    <div style="border-radius: 10px; border: 1px solid #dfdfdf;">
                        <input type="hidden" id="ext10_tier_delivery_tier_id_${tierIndex}" name="tier[${tierIndex}][delivery_tier_id]" value="">
                        <div style="padding: 15px;">
                            <div class="Polaris-Layout__AnnotationWrapper" style="padding-bottom: 10px;">
                                <div class="Polaris-Layout__Annotation">
                                    <div class="Polaris-TextContainer">
                                        <h2 class="Polaris-Heading Polaris-Text--headingMd">Enter Delivery Method</h2>
                                        <div class="Polaris-Layout__AnnotationDescription"></div>
                                    </div>
                                </div>
                                <div class="Polaris-Layout__AnnotationContent">
                                    <div class="Polaris-ShadowBevel" style="--pc-shadow-bevel-z-index:32;--pc-shadow-bevel-content-xs:&quot;&quot;;--pc-shadow-bevel-box-shadow-xs:var(--p-shadow-100);--pc-shadow-bevel-border-radius-xs:var(--p-border-radius-300)">
                                        <div class="Polaris-Box" style="--pc-box-background:var(--p-color-bg-surface);--pc-box-min-height:100%;--pc-box-overflow-x:hidden;--pc-box-overflow-y:hidden;--pc-box-padding-block-end-xs:var(--p-space-400);--pc-box-padding-block-start-xs:var(--p-space-400);--pc-box-padding-inline-start-xs:var(--p-space-400);--pc-box-padding-inline-end-xs:var(--p-space-400)">
                                            <div class="Polaris-FormLayout">
                                                <div class="Polaris-FormLayout__Item">
                                                    <div class="">
                                                        <div class="Polaris-Labelled__LabelWrapper">
                                                            <div class="Polaris-Label">
                                                                <label id="PolarisTextField1Label" for="PolarisTextField1" class="Polaris-Label__Text">Delivery methods name match :</label>
                                                            </div>
                                                        </div>
                                                        <div class="Polaris-InlineStack" style="--pc-inline-stack-wrap:nowrap">
                                                            <div class="" style="width: 33.33%;">
                                                                <div class="Polaris-Bleed" style="--pc-bleed-margin-block-end-xs:var(--p-space-0);--pc-bleed-margin-inline-start-xs:var(--p-space-0);--pc-bleed-margin-inline-end-xs:var(--p-space-0)">
                                                                    <label class="Polaris-Choice" for="ext10_tier_delivery_method_type_${tierIndex}_d_m_type_contains">
                                                                        <span class="Polaris-Choice__Control">
                                                                            <span class="Polaris-RadioButton">
                                                                                <input id="ext10_tier_delivery_method_type_${tierIndex}_d_m_type_contains" name="tier[${tierIndex}][delivery_method_type]" type="radio" class="Polaris-RadioButton__Input" value="1">
                                                                                <span class="Polaris-RadioButton__Backdrop"></span>
                                                                            </span>
                                                                        </span>
                                                                        <span class="Polaris-Choice__Label">
                                                                            <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">Contains</span>
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <div class="" style="width: 33.33%;">
                                                                <div class="Polaris-Bleed" style="--pc-bleed-margin-block-end-xs:var(--p-space-0);--pc-bleed-margin-inline-start-xs:var(--p-space-0);--pc-bleed-margin-inline-end-xs:var(--p-space-0)">
                                                                    <label class="Polaris-Choice" for="ext10_tier_delivery_method_type_${tierIndex}_d_m_type_exact_case">
                                                                        <span class="Polaris-Choice__Control">
                                                                            <span class="Polaris-RadioButton">
                                                                                <input id="ext10_tier_delivery_method_type_${tierIndex}_d_m_type_exact_case" name="tier[${tierIndex}][delivery_method_type]" type="radio" class="Polaris-RadioButton__Input" checked="" value="2">
                                                                                <span class="Polaris-RadioButton__Backdrop"></span>
                                                                            </span>
                                                                        </span>
                                                                        <span class="Polaris-Choice__Label">
                                                                            <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">Exact (Case-Sensitive)</span>
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <div class="" style="width: 33.33%;">
                                                                <div class="Polaris-Bleed" style="--pc-bleed-margin-block-end-xs:var(--p-space-0);--pc-bleed-margin-inline-start-xs:var(--p-space-0);--pc-bleed-margin-inline-end-xs:var(--p-space-0)">
                                                                    <label class="Polaris-Choice" for="ext10_tier_delivery_method_type_${tierIndex}_d_m_type_exact_non_case">
                                                                        <span class="Polaris-Choice__Control">
                                                                            <span class="Polaris-RadioButton">
                                                                                <input id="ext10_tier_delivery_method_type_${tierIndex}_d_m_type_exact_non_case" name="tier[${tierIndex}][delivery_method_type]" type="radio" class="Polaris-RadioButton__Input" value="3">
                                                                                <span class="Polaris-RadioButton__Backdrop"></span>
                                                                            </span>
                                                                        </span>
                                                                        <span class="Polaris-Choice__Label">
                                                                            <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">Exact (Non Case)</span>
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr>
                                            <div class="Polaris-FormLayout">
                                                <div role="group" class="Polaris-FormLayout--grouped">
                                                    <div class="Polaris-FormLayout__Items">
                                                        <div class="Polaris-FormLayout__Item">
                                                            <div class="Polaris-Connected">
                                                                <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                                    <div class="Polaris-TextField delivery_method_div">
                                                                        <input type="text" id="ext10_tier_delivery_method_${tierIndex}" name="tier[${tierIndex}][delivery_method]" class="Polaris-TextField__Input ext10_tier_delivery_method Polaris-required__Error inputtag" data-role="tagsinput" autocomplete="off" placeholder="Ex. Standard" value="">
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style="padding-left: 22px;">
                                                            <div class="Polaris-Labelled__HelpText" id="PolarisTextField1HelpText">
                                                                <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--break Polaris-Text--subdued">
                                                                    <span>Delivery method name that you have set up on the store's settings.</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="Polaris-FormLayout__Item">
                                                    <div class="Polaris-FormLayout">
                                                        <div role="group" class="Polaris-FormLayout--condensed">
                                                            <div class="Polaris-FormLayout__Items">
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <div class="">
                                                                        <label class="Polaris-Choice Polaris-RadioButton__ChoiceLabel" for="ext10_tier_hide_show_0_${tierIndex}">
                                                                            <span class="Polaris-Choice__Control">
                                                                                <span class="Polaris-RadioButton">
                                                                                    <input id="ext10_tier_hide_show_0_${tierIndex}" name="tier[${tierIndex}][hide_show]" type="radio" class="Polaris-RadioButton__Input ext10_tier_hide_show" aria-describedby="disabledHelpText" checked value="0">
                                                                                    <span class="Polaris-RadioButton__Backdrop"></span>
                                                                                </span>
                                                                            </span>
                                                                            <span class="Polaris-Choice__Label">
                                                                                <span>Hide</span>
                                                                            </span>
                                                                        </label>
                                                                        <div class="Polaris-Choice__Descriptions">
                                                                            <div class="Polaris-Choice__HelpText" id="disabledHelpText">
                                                                                <span class="Polaris-Text--root Polaris-Text--subdued">Hide method when the below conditions match</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <div class="">
                                                                        <label class="Polaris-Choice Polaris-RadioButton__ChoiceLabel" for="ext10_tier_hide_show_1_${tierIndex}">
                                                                            <span class="Polaris-Choice__Control">
                                                                                <span class="Polaris-RadioButton">
                                                                                    <input id="ext10_tier_hide_show_1_${tierIndex}" name="tier[${tierIndex}][hide_show]" type="radio" class="Polaris-RadioButton__Input ext10_tier_hide_show" aria-describedby="disabledHelpText" value="1">
                                                                                    <span class="Polaris-RadioButton__Backdrop"></span>
                                                                                </span>
                                                                            </span>
                                                                            <span class="Polaris-Choice__Label">
                                                                                <span>Show</span>
                                                                            </span>
                                                                        </label>
                                                                        <div class="Polaris-Choice__Descriptions">
                                                                            <div class="Polaris-Choice__HelpText" id="disabledHelpText">
                                                                                <span class="Polaris-Text--root Polaris-Text--subdued">Show method when the below conditions match</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="Polaris-FormLayout__Item operation_type_div">
                                                    <label class="Polaris-Choice Polaris-Checkbox__ChoiceLabel" for="ext10_tier_operation_type_${tierIndex}">
                                                        <span class="Polaris-Choice__Control">
                                                            <span class="Polaris-Checkbox">
                                                                <input id="ext10_tier_operation_type_${tierIndex}" name="tier[${tierIndex}][operation_type]" type="checkbox" class="Polaris-Checkbox__Input ext10_tier_operation_type" aria-invalid="false" role="checkbox" aria-checked="false" value="1">
                                                                <span class="Polaris-Checkbox__Backdrop"></span>
                                                                <span class="Polaris-Checkbox__Icon">
                                                                    <span class="Polaris-Icon">
                                                                        <span class="Polaris-Text--root Polaris-Text--visuallyHidden"></span>
                                                                        <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
                                                                            <path fill-rule="evenodd" d="M14.03 7.22a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 1 1 1.06-1.06l1.72 1.72 3.97-3.97a.75.75 0 0 1 1.06 0Z"></path>
                                                                        </svg>
                                                                    </span>
                                                                </span>
                                                            </span>
                                                        </span>
                                                        <span class="Polaris-Choice__Label">
                                                            <span>Default hide?</span>
                                                        </span>
                                                    </label>
                                                    <div class="Polaris-Choice__Descriptions">
                                                        <div class="Polaris-Choice__HelpText" id="disabledHelpText">
                                                            <span class="Polaris-Text--root Polaris-Text--subdued">This option helps while using customer-based or shipping-method-based rule setup on one-page checkout</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="Polaris-Layout__AnnotationWrapper">
                                <div class="Polaris-Layout__Annotation">
                                    <div class="Polaris-TextContainer">
                                        <h2 class="Polaris-Heading Polaris-Text--headingMd">Customization Rules</h2>
                                        <p class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--subdued">
                                            You can set one condition single time only.
                                        </p>
                                    </div>
                                </div>
                                <div class="Polaris-Layout__AnnotationContent">
                                    <div class="Polaris-ShadowBevel" style="--pc-shadow-bevel-z-index:32;--pc-shadow-bevel-content-xs:&quot;&quot;;--pc-shadow-bevel-box-shadow-xs:var(--p-shadow-100);--pc-shadow-bevel-border-radius-xs:var(--p-border-radius-300)">
                                        <div class="Polaris-Box" style="--pc-box-background:var(--p-color-bg-surface);--pc-box-min-height:100%;--pc-box-overflow-x:hidden;--pc-box-overflow-y:hidden;--pc-box-padding-block-end-xs:var(--p-space-400);--pc-box-padding-block-start-xs:var(--p-space-400);--pc-box-padding-inline-start-xs:var(--p-space-400);--pc-box-padding-inline-end-xs:var(--p-space-400)">
                                            <div>
                                                <div id="ext10_tier_${tierIndex}_append_rules_div" class="ext10_tier_append_rules_div" data-ext10_tier_append_rules_index="0">
                                                    <div class="Polaris-FormLayout">
                                                        <div role="group" class="Polaris-FormLayout--grouped">
                                                            <div class="Polaris-FormLayout__Items">
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <div class="Polaris-Bleed" style="--pc-bleed-margin-block-end-xs:var(--p-space-0);--pc-bleed-margin-inline-start-xs:var(--p-space-0);--pc-bleed-margin-inline-end-xs:var(--p-space-0)">
                                                                        <label class="Polaris-Choice" for="ext10_tier_all_below_condition_${tierIndex}">
                                                                            <span class="Polaris-Choice__Control">
                                                                                <span class="Polaris-RadioButton">
                                                                                    <input id="ext10_tier_all_below_condition_${tierIndex}" name="tier[${tierIndex}][condition_type]" type="radio" class="Polaris-RadioButton__Input ext10_tier_condition_type" checked value="0">
                                                                                    <span class="Polaris-RadioButton__Backdrop"></span>
                                                                                </span>
                                                                            </span>
                                                                            <span class="Polaris-Choice__Label"><span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">All Below</span></span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <div class="Polaris-Bleed" style="--pc-bleed-margin-block-end-xs:var(--p-space-0);--pc-bleed-margin-inline-start-xs:var(--p-space-0);--pc-bleed-margin-inline-end-xs:var(--p-space-0)">
                                                                        <label class="Polaris-Choice" for="ext10_tier_any_below_condition_${tierIndex}">
                                                                            <span class="Polaris-Choice__Control">
                                                                                <span class="Polaris-RadioButton">
                                                                                    <input id="ext10_tier_any_below_condition_${tierIndex}" name="tier[${tierIndex}][condition_type]" type="radio" class="Polaris-RadioButton__Input ext10_tier_condition_type" value="1">
                                                                                    <span class="Polaris-RadioButton__Backdrop"></span>
                                                                                </span>
                                                                            </span>
                                                                            <span class="Polaris-Choice__Label"><span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">Any Below</span></span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <hr>
                                                    <div id="conditions_main_div" class="conditions_main_div">
                                                        <div id="ext10_tier_${tierIndex}_rule_rows_0" class="ext10_tier_rule_rows" data-ext10_tier_rule_rows_index="0">
                                                            <div class="delivery_rule_wrapper">
                                                                <div class="delete_button" style="display: none">
                                                                    <a href="javascript:void(0)" onclick="deleteTierRuleRowExt7(0, 0, this)" title="Remove">
                                                                        <span>
                                                                            <svg fill="white" viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true" height="15px" width="15px">
                                                                                <path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path>
                                                                            </svg>
                                                                        </span>
                                                                    </a>
                                                                </div>
                                                                <div class="Polaris-FormLayout">
                                                                    <div role="group" class="Polaris-FormLayout--grouped">
                                                                        <div class="Polaris-FormLayout__Items">
                                                                            <div class="Polaris-FormLayout__Item">
                                                                                <div class="">
                                                                                    <div class="Polaris-Select">
                                                                                        <select id="ext10_tier_${tierIndex}_rule_type_0" name="tier[${tierIndex}][rule][0][type]" class="Polaris-Select__Input ext10_tier_rule_type Polaris-required__Error" aria-invalid="false">
                                                                                            <option value="" selected>Select Rule Type</option>
                                                                                            <optgroup label="Cart Details">
                                                                                                <option value="0">Total Amount</option>
                                                                                                <option value="1">Subtotal Amount</option>
                                                                                                <option value="2">Total Weight</option>
                                                                                                <option value="41">Any Item Weight</option>
                                                                                                <option value="42">Any Item Total Weight</option>
                                                                                                <option value="17">Total Quantity</option>
                                                                                            </optgroup>
                                                                                            <optgroup label="Cart Has Any Items">
                                                                                                <option value="3">SKU</option>
                                                                                                <option value="43">Any SKU Quantity</option>
                                                                                                <option value="44">All SKU Quantity</option>
                                                                                                <option value="16">Choose Collection</option>
                                                                                            </optgroup>
                                                                                            <optgroup label="Address">
                                                                                                <option value="8">Country</option>
                                                                                                <option value="9">Province Code / State Code</option>
                                                                                                <option value="10">Zip Code / Postal Code</option>
                                                                                                <option value="11">City / Area</option>
                                                                                                <option value="12">Address Line</option>
                                                                                                <option value="45">Address Line 1 Character Count</option>
                                                                                                <option value="46">Address Line 2 Character Count</option>
                                                                                            </optgroup>
                                                                                            <optgroup label="Customer">
                                                                                                <option value="13">Customer tags</option>
                                                                                                <option value="14">Total Spend</option>
                                                                                            </optgroup>
                                                                                            <optgroup label="Shipping Method">
                                                                                                <option value="35">Shipping Method Title</option>
                                                                                            </optgroup>
                                                                                        </select>
                                                                                        <div class="Polaris-Select__Content" aria-hidden="true">
                                                                                            <span class="Polaris-Select__SelectedOption">Select Rule Type</span>
                                                                                            <span class="Polaris-Select__Icon">
                                                                                                <span class="Polaris-Icon">
                                                                                                    <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                                                                    <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                                                                </span>
                                                                                            </span>
                                                                                        </div>
                                                                                        <div class="Polaris-Select__Backdrop"></div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="Polaris-FormLayout__Item">
                                                                                <div class="">
                                                                                    <div class="Polaris-Select">
                                                                                        <select id="ext10_tier_${tierIndex}_rule_condition_0" name="tier[${tierIndex}][rule][0][condition]" class="Polaris-Select__Input ext10_tier_rule_condition Polaris-required__Error" aria-invalid="false">
                                                                                            <option value="" selected>Select Rule Condition</option>
                                                                                            <option value="0">Greater than or equals</option>
                                                                                            <option value="1">Less than or equals</option>
                                                                                        </select>
                                                                                        <div class="Polaris-Select__Content" aria-hidden="true">
                                                                                            <span class="Polaris-Select__SelectedOption option_text">Select Rule Condition</span>
                                                                                            <span class="Polaris-Select__Icon">
                                                                                                <span class="Polaris-Icon">
                                                                                                    <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                                                                    <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                                                                </span>
                                                                                            </span>
                                                                                        </div>
                                                                                        <div class="Polaris-Select__Backdrop"></div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="Polaris-FormLayout__Item">
                                                                                <div class="">
                                                                                    <div class="Polaris-Connected">
                                                                                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                                                            <div class="ext10_tier_rule_value_div">
                                                                                                <div class="Polaris-TextField">
                                                                                                    <input type="text" id="ext10_tier_${tierIndex}_rule_value_0" name="tier[${tierIndex}][rule][0][value]" class="Polaris-TextField__Input ext10_tier_rule_value Polaris-required__Error">
                                                                                                    <div class="Polaris-TextField__Backdrop removeTagInput"></div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div class="extra_fields_wrapper"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <hr>
                                                    <div class="Polaris-FormLayout">
                                                        <div role="group" class="Polaris-FormLayout--grouped">
                                                            <div class="Polaris-FormLayout__Items">
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <div class="">
                                                                        <label class="Polaris-Choice Polaris-RadioButton__ChoiceLabel" for="ext10_tier_${tierIndex}_stack">
                                                                            <span class="Polaris-Choice__Control">
                                                                                <span class="Polaris-RadioButton">
                                                                                    <input id="ext10_tier_${tierIndex}_stack" name="tier[${tierIndex}][stack_terminate]" type="radio" class="Polaris-RadioButton__Input ext10_tier_stack_terminate" aria-describedby="disabledHelpText" checked value="1">
                                                                                    <span class="Polaris-RadioButton__Backdrop"></span>
                                                                                </span>
                                                                            </span>
                                                                            <span class="Polaris-Choice__Label">
                                                                                <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">Stack</span>
                                                                            </span>
                                                                        </label>
                                                                        <div class="Polaris-Choice__Descriptions">
                                                                            <div class="Polaris-Choice__HelpText" id="disabledHelpText">
                                                                                <span class="Polaris-Text--root Polaris-Text--subdued">Continue checking following rules.</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <div class="">
                                                                        <label class="Polaris-Choice Polaris-RadioButton__ChoiceLabel" for="ext10_tier_${tierIndex}_terminate">
                                                                            <span class="Polaris-Choice__Control">
                                                                                <span class="Polaris-RadioButton">
                                                                                    <input id="ext10_tier_${tierIndex}_terminate" name="tier[${tierIndex}][stack_terminate]" type="radio" class="Polaris-RadioButton__Input ext10_tier_stack_terminate" aria-describedby="disabledHelpText" value="2">
                                                                                    <span class="Polaris-RadioButton__Backdrop"></span>
                                                                                </span>
                                                                            </span>
                                                                            <span class="Polaris-Choice__Label">
                                                                                <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">Terminate</span>
                                                                            </span>
                                                                        </label>
                                                                        <div class="Polaris-Choice__Descriptions">
                                                                            <div class="Polaris-Choice__HelpText" id="disabledHelpText">
                                                                                <span class="Polaris-Text--root Polaris-Text--subdued">If this rule becomes executed, following rules will not execute.</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div  class="ext10_tier_add_rule_btn_div">
                                                    <hr>
                                                    <div class="Polaris-FormLayout">
                                                        <div role="group" class="Polaris-FormLayout--grouped">
                                                            <div class="Polaris-FormLayout__Items">
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <button  class="Polaris-Button Polaris-Button--primary ext10_tier_add_rule_btn" type="button">
                                                                        <span class="Polaris-Button__Content">
                                                                            <span class="Polaris-Button__Text">Add Condition</span>
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <button class="Polaris-Button Polaris-Button--primary Polaris-Button--critical delete_tier_btn_ext10" onclick="deleteTierExt10(${tierIndex})" type="button" style="float: right">
                                                                        <span class="Polaris-Button__Content">
                                                                            <span class="Polaris-Button__Text">Delete Sub Rule</span>
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            $(".ext10_tier_main_div").append(ruleHTML);
            bootstrapTagsInputReinitialize();
            hideShowDeleteRuleBtn();
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });

    $(document).on('click', '.ext10_tier_hide_show', function (e) {
        const This = $(this);
        if (This.val() == '1') {
            This.closest(".Polaris-Layout__AnnotationContent").find(".operation_type_div").hide();
            // This.closest(".Polaris-Card__Section").find(".ext10_tier_operation_type").prop('checked', false);
        } else {
            This.closest(".Polaris-Layout__AnnotationContent").find(".operation_type_div").show();
        }
    });

    // add new rule in specific tier button click event
    $(document).on('click', '.ext10_tier_add_rule_btn', function (e) {
        e.preventDefault();
        const beforeAppendRowSelectedRuleTypes = getSelectedRuleTypesExt10(this);
        const tierIndex = $(this).closest('.ext10_tier').data('ext10_tier_index');
        const tierRuleIndex = $(this).closest(".ext10_tier").find('.ext10_tier_rule_rows').last().data('ext10_tier_rule_rows_index') + 1;
        $error = checkValidations();

        if (!$error) {
            const checked = $(this).closest('.ext10_tier').find('.ext10_tier_condition_type:checked').val() == '0' ? "and" : "or";
            const ruleHTML = `
                <div id="ext10_tier_${tierIndex}_rule_rows_${tierRuleIndex}" class="ext10_tier_rule_rows" data-ext10_tier_rule_rows_index="${tierRuleIndex}">
                    <div class="Polaris-FormLayout__Items product_remove_list cs_divider line_divider">
                         <div class="Polaris-FormLayout__Item">
                             <span class="seperator-line prefix">${checked}</span>
                         </div>
                    </div>
                    <div class="delivery_rule_wrapper">
                        <div class="delete_button" style="display: none">
                            <a href="javascript:void(0)" onclick="deleteTierRuleRowExt10(${tierIndex}, ${tierRuleIndex}, this)" title="Remove">
                                <span>
                                    <svg fill="white" viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true" height="15px" width="15px">
                                        <path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path>
                                    </svg>
                                </span>
                            </a>
                        </div>
                        <div class="Polaris-FormLayout">
                            <div role="group" class="Polaris-FormLayout--grouped">
                                <div class="Polaris-FormLayout__Items">
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-Select">
                                                <select id="ext10_tier_${tierIndex}_rule_type_${tierRuleIndex}" name="tier[${tierIndex}][rule][${tierRuleIndex}][type]" class="Polaris-Select__Input ext10_tier_rule_type Polaris-required__Error" aria-invalid="false">
                                                    <option value="" selected>Select Rule Type</option>
                                                    <optgroup label="Cart Details">
                                                        <option value="0">Total Amount</option>
                                                        <option value="1">Subtotal Amount</option>
                                                        <option value="2">Total Weight</option>
                                                        <option value="41">Any Item Weight</option>
                                                        <option value="42">Any Item Total Weight</option>
                                                        <option value="17">Total Quantity</option>
                                                    </optgroup>
                                                    <optgroup label="Cart Has Any Items">
                                                        <option value="3">SKU</option>
                                                        <option value="43">Any SKU Quantity</option>
                                                        <option value="44">All SKU Quantity</option>
                                                        <option value="16">Choose Collection</option>
                                                    </optgroup>
                                                    <optgroup label="Address">
                                                        <option value="8">Country</option>
                                                        <option value="9">Province Code / State Code</option>
                                                        <option value="10">Zip Code / Postal Code</option>
                                                        <option value="11">City / Area</option>
                                                        <option value="12">Address Line</option>
                                                        <option value="45">Address Line 1 Character Count</option>
                                                        <option value="46">Address Line 2 Character Count</option>
                                                    </optgroup>
                                                    <optgroup label="Customer">
                                                        <option value="13">Customer tags</option>
                                                        <option value="14">Total Spend</option>
                                                    </optgroup>
                                                    <optgroup label="Shipping Method">
                                                        <option value="35">Shipping Method Title</option>
                                                    </optgroup>
                                                </select>
                                                <div class="Polaris-Select__Content" aria-hidden="true">
                                                    <span class="Polaris-Select__SelectedOption">Select Rule Type</span>
                                                    <span class="Polaris-Select__Icon">
                                                        <span class="Polaris-Icon">
                                                              <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                              <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                        </span>
                                                    </span>
                                                </div>
                                                <div class="Polaris-Select__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-Select">
                                                <select id="ext10_tier_${tierIndex}_rule_condition_${tierRuleIndex}" name="tier[${tierIndex}][rule][${tierRuleIndex}][condition]" class="Polaris-Select__Input ext10_tier_rule_condition Polaris-required__Error" aria-invalid="false">
                                                    <option value="" selected>Select Rule Condition</option>
                                                    <option value="0">Greater than or equals</option>
                                                    <option value="1">Less than or equals</option>
                                                </select>
                                                <div class="Polaris-Select__Content" aria-hidden="true">
                                                    <span class="Polaris-Select__SelectedOption option_text">Select Rule Condition</span>
                                                    <span class="Polaris-Select__Icon">
                                                        <span class="Polaris-Icon">
                                                          <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                          <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                        </span>
                                                    </span>
                                                </div>
                                                <div class="Polaris-Select__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-Connected">
                                                <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                    <div class="ext10_tier_rule_value_div">
                                                        <div class="Polaris-TextField">
                                                            <input type="text" id="ext10_tier_${tierIndex}_rule_value_${tierRuleIndex}" name="tier[${tierIndex}][rule][${tierRuleIndex}][value]" class="Polaris-TextField__Input ext10_tier_rule_value Polaris-required__Error">
                                                            <div class="Polaris-TextField__Backdrop removeTagInput"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="extra_fields_wrapper"></div>
                        </div>
                    </div>
                </div>
            `;
            $(this).closest('.ext10_tier').find('.ext10_tier_append_rules_div').find('.conditions_main_div').append(ruleHTML);
            bootstrapTagsInputReinitialize();
            hideShowDeleteRuleBtn();
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });

    // rule type select box change event
    $(document).on('change', '.ext10_tier_rule_type', function (e) {
        const currentSelectedRuleType = $(this).val();
        const selectedRuleTypeIndex = $(this).closest('.ext10_tier_rule_rows').data('ext10_tier_rule_rows_index');
        const selectedRuleTierIndex = $(this).closest('.ext10_tier').data('ext10_tier_index');
        let skuQtyHtml = ``;

        // hideShowAddRuleButtonExt10(this);

        let options = '<option value="" disabled>Select Rule Condition</option>';
        let ruleTypeHtml = `
            <div class="Polaris-TextField">
                <input type="text" data-role="tagsinput" id="ext10_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input ext10_tier_rule_value Polaris-required__Error inputtag">
            </div>`;

        if (currentSelectedRuleType === '0' || currentSelectedRuleType === '1' || currentSelectedRuleType === '2' || currentSelectedRuleType === '14' || currentSelectedRuleType === '17' || currentSelectedRuleType === '41' || currentSelectedRuleType === '42' || currentSelectedRuleType === '45' || currentSelectedRuleType === '46') {
            // if ($.inArray(currentSelectedRuleType, ['0','1','2','14','17','41','42']) >= 1) {
            var Class = "price_input";
            options += `
                <option value="0" selected>Greater than or equals</option>
                <option value="1">Less than or equals</option>
            `;
            if (currentSelectedRuleType === '0' || currentSelectedRuleType === '17' || currentSelectedRuleType === '45' || currentSelectedRuleType === '46') {
                options += `<option value="11">Equals to</option>`;
            }
            ruleTypeHtml = `
                <div class="Polaris-TextField">
                    <input type="text" id="ext10_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input ext10_tier_rule_value Polaris-required__Error ${Class}">
                    <div class="Polaris-TextField__Backdrop"></div>
                </div>
            `;
        } else if (currentSelectedRuleType === '8' || currentSelectedRuleType === '9' || currentSelectedRuleType === '10' || currentSelectedRuleType === '11' || currentSelectedRuleType === '12' || currentSelectedRuleType === '13' || currentSelectedRuleType === '35') {
            // } else if ($.inArray(currentSelectedRuleType, ['8','9','10','11','12','13','35']) >= 1) {
            options += `
                <option value="2" selected>Contains</option>
                <option value="3">Does not contains</option>
            `;
            if (currentSelectedRuleType === '35') {
                options += `
                    <option value="11">Equals to</option>
                    <option value="12">Does not equals to</option>
                `;
            }
        } else if (currentSelectedRuleType === '16') {
            options += `
                <option value="2" selected>Contains</option>
                <option value="3">Does not contains all</option>
                <option value="9">Contains all</option>
                <option value="10">Does not contains</option>
            `;
        } else if (currentSelectedRuleType === '3' || currentSelectedRuleType === '43' || currentSelectedRuleType === '44') {
            options += `<option value="2" selected>Contains</option>`;
            if (currentSelectedRuleType === '3') {
                options += `
                    <option value="3">Does not contains all</option>
                    <option value="9">Contains all</option>
                `;
            }
            options += `<option value="10">Does not contains</option>`;
        }
        // console.log($.inArray(currentSelectedRuleType, ['3','43','44']) >= 1, currentSelectedRuleType)

        $(this).parents('.Polaris-FormLayout__Items').find('.ext10_tier_rule_condition').html(options).prop("selectedIndex", 1).trigger('change');
        // $(this).parents('.Polaris-FormLayout__Items').find('.rule_condition').prop("selectedIndex", 1).trigger('change');
//         $(this).parents('.delivery_rule_wrapper').find('#collection_qty_main_div').remove();

        if (currentSelectedRuleType === '2' || currentSelectedRuleType === '41' || currentSelectedRuleType === '42') {
            const weightUnit = $("#ext10_tier_main_div").data("weight_unit")
            ruleTypeHtml = `
                <div class="Polaris-TextField">
                    <input type="text" id="ext10_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input ext10_tier_rule_value Polaris-required__Error price_input">
                    <div class="Polaris-TextField__Backdrop"></div>
                </div>
                <div class="Polaris-Labelled__HelpText" id="PolarisTextField1HelpText">
                    <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--break Polaris-Text--subdued">
                        <span>Please enter weight in <strong>${weightUnit}</strong>.</span>
                    </span>
                </div>
            `;
        } else if (currentSelectedRuleType === '16') {
            ruleTypeHtml = `
                <div class="Polaris-TextField collection_id_div" data-main_id="${selectedRuleTierIndex}" data-sub_id="${selectedRuleTypeIndex}">
                    <input type="text" data-role="tagsinput" id="ext10_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value]" data-selected_collections="[]" class="Polaris-TextField__Input ext10_tier_rule_value Polaris-required__Error open_collection_picker inputtag">
                </div>
            `;
        } else if (currentSelectedRuleType === '8') {
            const allCountries = $(".all_countries").data("all_countries");
            let allCountriesOptionHtml = "";
            $.each(allCountries, function (code, country) {
                allCountriesOptionHtml += `<option value="${code}">${country}</option>`
            });
            ruleTypeHtml = `
                <div class="Polaris-TextField">
                    <select id="ext10_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value][]" class="form-control ext10_tier_rule_value country_code Polaris-required__Error" multiple="multiple">
                    ${allCountriesOptionHtml}
                    </select>
                </div>
            `;
        } else if (currentSelectedRuleType === '9') {
            ruleTypeHtml = `
                <div class="Polaris-TextField">
                    <input type="text" data-role="tagsinput" id="ext10_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input ext10_tier_rule_value Polaris-required__Error inputtag">
                </div>
                <div class="Polaris-Labelled__HelpText" id="PolarisTextField1HelpText">
                    <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--break Polaris-Text--subdued">
                        <span>You have to add 2 digit province/state code in "<strong>ISO 3166-1 alpha-2</strong>" format. Allow multiple.</span>
                    </span>
                </div>
            `;
        } else if (currentSelectedRuleType === '10') {
            ruleTypeHtml += `
                <p class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--subdued">
                    <i>Please add a '*' sign to compare the start with. ex. 123*, H1H*, 3*</i>
                </p>
            `;
        } else if (currentSelectedRuleType === '43' || currentSelectedRuleType === '44') {
            skuQtyHtml = `
                    <div role="group" class="Polaris-FormLayout--grouped">
                        <div class="Polaris-FormLayout__Items">
                            <div class="Polaris-FormLayout__Item">
                                <div class="">
                                    <div class="Polaris-Select">
                                        <select id="ext10_tier_${selectedRuleTierIndex}_sku_qty_condition_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][sku_qty_condition]" class="Polaris-Select__Input Polaris-required__Error" aria-invalid="false">
                                            <option value="0" selected>Greater than or equals</option>
                                            <option value="1">Less than or equals</option>
                                        </select>
                                        <div class="Polaris-Select__Content" aria-hidden="true">
                                            <span class="Polaris-Select__SelectedOption">Greater than or equals</span>
                                            <span class="Polaris-Select__Icon">
                                                <span class="Polaris-Icon">
                                                      <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                      <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                </span>
                                            </span>
                                        </div>
                                        <div class="Polaris-Select__Backdrop">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="Polaris-FormLayout__Item">
                                <div class="">
                                    <div class="Polaris-Connected">
                                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                            <div class="Polaris-TextField">
                                                <input type="number" id="ext10_tier_${selectedRuleTierIndex}_sku_qty_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][sku_qty_value]" autocomplete="off" class="Polaris-TextField__Input Polaris-required__Error" value="" placeholder="Quantity">
                                                <div class="Polaris-TextField__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
        }

        $(this).parents('.Polaris-FormLayout__Items').find(".ext10_tier_rule_value_div").html(ruleTypeHtml);
        $(this).closest('.Polaris-FormLayout').find('.extra_fields_wrapper').html(skuQtyHtml);
        bootstrapTagsInputReinitialize();
        initializeSelect2();
    });

    $(document).on('click', 'button.save_ext_10_hide_tier_rule_btn', function (e) {
        // $(".on-click-disable").attr("disabled", true);
        e.preventDefault();
        const formData = $("#ext10_tier_form").serializeArray();
        $error = checkValidations();
        if (!$error) {
            LoaderStart();
            $.ajax({
                url: $("#ext10_tier_form").attr('action'),
                type: "POST",
                data: formData,
                success: function (response) {
                    LoaderStop();
                    if (response.status === 200) {
                        ToastNotice(response.message)
                        pageReload();
                    } else {
                        ToastNotice(response.message, true)
                    }
                }, error: function (response) {
                    ToastNotice(response.message, true)
                }
            });
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });
    // ==========>  EXT-10 HIDE SET1 MULTIPLE END           <==========

    // ==========>  EXT-12 RENAME MULTIPLE START            <==========
    // condition_type radio button change event
    $(document).on('change', '.ext12_tier_condition_type', function (event) {
        const discount_type = $(this).val() == '0' ? "and" : "or";
        $(this).closest('.ext12_tier_append_rules_div').find('.ext12_tier_rule_rows').find(".prefix").text(discount_type);
    });

    /* click event of "Add New Rule" button */
    $(document).on('click', 'button#ext12_add_new_tier_btn', function (event) {
        event.preventDefault();
        const tierIndex = $(".ext12_tier_main_div").find('.ext12_tier').last().data('ext12_tier_index') + 1;

        $error = checkValidations();
        if (!$error) {
            const selectedTypes = [];
            $(".ext12_tier_main_div").find('.ext12_tier').each(function (i, el) {
                $(el).find(".ext12_tier_rule_type").each(function () {
                    selectedTypes.push($(this).val());
                });
            });

            const conditionTypes = $(".ext12_tier_main_div").data("condition_type");
            let conditionTypeTypeRadioButtonsHtml = ``;
            $.each(conditionTypes, function (index, item) {
                conditionTypeTypeRadioButtonsHtml += `
                    <div class="Polaris-FormLayout__Item">
                        <div class="Polaris-Bleed" style="--pc-bleed-margin-block-end-xs:var(--p-space-0);--pc-bleed-margin-inline-start-xs:var(--p-space-0);--pc-bleed-margin-inline-end-xs:var(--p-space-0)">
                            <label class="Polaris-Choice" for="ext12_tier_${item.value}_${tierIndex}">
                                <span class="Polaris-Choice__Control">
                                    <span class="Polaris-RadioButton">
                                        <input id="ext12_tier_${item.value}_${tierIndex}" name="tier[${tierIndex}][condition_type]" type="radio" class="Polaris-RadioButton__Input ext12_tier_condition_type" ${item.default} value="${item.value}">
                                        <span class="Polaris-RadioButton__Backdrop"></span>
                                    </span>
                                </span>
                                <span class="Polaris-Choice__Label">
                                    <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">${item.title}</span>
                                </span>
                            </label>
                        </div>
                    </div>
                `;
            });

            const ruleHTML = `
                <div id="ext12_tier_${tierIndex}" class="ext12_tier" data-ext12_tier_index="${tierIndex}">
                    <hr>
                    <div style="border-radius: 10px; border: 1px solid #dfdfdf">
                        <input type="hidden" id="ext12_tier_delivery_tier_id_${tierIndex}" name="tier[${tierIndex}][delivery_tier_id]" value="">
                        <div style="padding: 15px;">
                            <div class="Polaris-Layout__AnnotationWrapper" style="padding-bottom: 10px;">
                                <div class="Polaris-Layout__Annotation">
                                    <div class="Polaris-TextContainer">
                                        <h2 class="Polaris-Heading Polaris-Text--headingMd">Delivery Customization Rules</h2>
                                    </div>
                                </div>
                                <div class="Polaris-Layout__AnnotationContent">
                                    <div class="Polaris-ShadowBevel" style="--pc-shadow-bevel-z-index:32;--pc-shadow-bevel-content-xs:&quot;&quot;;--pc-shadow-bevel-box-shadow-xs:var(--p-shadow-100);--pc-shadow-bevel-border-radius-xs:var(--p-border-radius-300)">
                                        <div class="Polaris-Box" style="--pc-box-background:var(--p-color-bg-surface);--pc-box-min-height:100%;--pc-box-overflow-x:hidden;--pc-box-overflow-y:hidden;--pc-box-padding-block-end-xs:var(--p-space-400);--pc-box-padding-block-start-xs:var(--p-space-400);--pc-box-padding-inline-start-xs:var(--p-space-400);--pc-box-padding-inline-end-xs:var(--p-space-400)">
                                            <div class="">
                                                <div id="ext12_tier_${tierIndex}_append_rules_div" class="ext12_tier_append_rules_div" data-ext12_tier_append_rules_index="0">
                                                    <div class="Polaris-FormLayout">
                                                        <div role="group" class="Polaris-FormLayout--grouped">
                                                            <div class="Polaris-FormLayout__Items">
                                                                ${conditionTypeTypeRadioButtonsHtml}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <hr>
                                                    <div id="conditions_main_div" class="conditions_main_div">
                                                        <div id="ext12_tier_${tierIndex}_rule_rows_0" class="ext12_tier_rule_rows" data-ext12_tier_rule_rows_index="0">
                                                            <div class="delivery_rule_wrapper">
                                                                <div class="delete_button" style="display: none">
                                                                    <a href="javascript:void(0)" onclick="deleteTierRuleRowExt12(${tierIndex}, 0, this)" title="Remove">
                                                                        <span>
                                                                            <svg fill="white" viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true" height="15px" width="15px">
                                                                                <path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path>
                                                                            </svg>
                                                                        </span>
                                                                    </a>
                                                                </div>
                                                                <div class="Polaris-FormLayout">
                                                                    <div role="group" class="Polaris-FormLayout--grouped">
                                                                        <div class="Polaris-FormLayout__Items">
                                                                            <div class="Polaris-FormLayout__Item">
                                                                                <div class="">
                                                                                    <div class="Polaris-Select">
                                                                                        <select id="ext12_tier_${tierIndex}_rule_type_0" name="tier[${tierIndex}][rule][0][type]" class="Polaris-Select__Input ext12_tier_rule_type Polaris-required__Error" aria-invalid="false">
                                                                                            <option value="">Select Rule Type</option>
                                                                                            <optgroup label="Cart Details">
                                                                                                <option value="0">Total Amount</option>
                                                                                                <option value="1">Subtotal Amount</option>
                                                                                                <option value="2">Total Weight</option>
                                                                                            </optgroup>
                                                                                            <optgroup label="Cart Has Any Items">
                                                                                                <option value="3">SKU</option>
                                                                                                <option value="16">Choose Collection</option>
                                                                                            </optgroup>
                                                                                            <optgroup label="Address">
                                                                                                <option value="8">Country</option>
                                                                                                <option value="9">Province Code / State Code</option>
                                                                                                <option value="10">Zip Code / Postal Code</option>
                                                                                            </optgroup>
                                                                                            <optgroup label="Customer">
                                                                                                <option value="13">Customer tags</option>
                                                                                            </optgroup>
                                                                                            <optgroup label="Date / Time">
                                                                                                <option value="36">Date</option>
<!--                                                                                                <option value="37">Day of Week</option>-->
                                                                                                <option value="38" ${selectedTypes.includes("38") ? "disabled" : ""}>Time</option>
<!--                                                                                                <option value="39">Between Day & Time</option>-->
                                                                                            </optgroup>
                                                                                        </select>
                                                                                        <div class="Polaris-Select__Content" aria-hidden="true">
                                                                                            <span class="Polaris-Select__SelectedOption">Select Rule Type</span>
                                                                                            <span class="Polaris-Select__Icon">
                                                                                                <span class="Polaris-Icon">
                                                                                                      <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                                                                      <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                                                                </span>
                                                                                            </span>
                                                                                        </div>
                                                                                        <div class="Polaris-Select__Backdrop"></div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="Polaris-FormLayout__Item">
                                                                                <div class="">
                                                                                    <div class="Polaris-Select">
                                                                                        <select id="ext12_tier_${tierIndex}_rule_condition_0" name="tier[${tierIndex}][rule][0][condition]" class="Polaris-Select__Input ext12_tier_rule_condition Polaris-required__Error" aria-invalid="false">
                                                                                            <option value="" selected>Select Rule Condition</option>
                                                                                            <option value="0">Greater than or equals</option>
                                                                                            <option value="1">Less than or equals</option>
                                                                                        </select>
                                                                                        <div class="Polaris-Select__Content" aria-hidden="true">
                                                                                            <span class="Polaris-Select__SelectedOption option_text">Select Rule Condition</span>
                                                                                            <span class="Polaris-Select__Icon">
                                                                                                <span class="Polaris-Icon">
                                                                                                  <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                                                                  <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                                                                </span>
                                                                                            </span>
                                                                                        </div>
                                                                                        <div class="Polaris-Select__Backdrop"></div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="Polaris-FormLayout__Item">
                                                                                <div class="">
                                                                                    <div class="Polaris-Connected">
                                                                                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                                                            <div class="ext12_tier_rule_value_div">
                                                                                                <div class="Polaris-TextField">
                                                                                                    <input type="text" id="ext12_tier_${tierIndex}_rule_value_0" name="tier[${tierIndex}][rule][0][value]" class="Polaris-TextField__Input ext12_tier_rule_value Polaris-required__Error">
                                                                                                    <div class="Polaris-TextField__Backdrop removeTagInput"></div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <hr>
                                                <div class="Polaris-FormLayout">
                                                    <div role="group" class="Polaris-FormLayout--grouped">
                                                        <div class="Polaris-FormLayout__Items">
                                                            <div class="Polaris-FormLayout__Item ext12_tier_add_rule_btn_div">
                                                                <button class="Polaris-Button Polaris-Button--primary ext12_tier_add_rule_btn" type="button">
                                                                    <span class="Polaris-Button__Content">
                                                                        <span class="Polaris-Button__Text">Add Condition</span>
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="Polaris-Layout__AnnotationWrapper" style="padding-bottom: 10px;">
                                <div class="Polaris-Layout__Annotation">
                                    <div class="Polaris-TextContainer">
                                        <h2 class="Polaris-Heading Polaris-Text--headingMd">Re-order delivery Methods</h2>
                                        <p class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--subdued">Add delivery methods and re-order it.</p>
                                    </div>
                                </div>
                                <div class="Polaris-Layout__AnnotationContent">
                                    <div class="Polaris-ShadowBevel" style="--pc-shadow-bevel-z-index:32;--pc-shadow-bevel-content-xs:&quot;&quot;;--pc-shadow-bevel-box-shadow-xs:var(--p-shadow-100);--pc-shadow-bevel-border-radius-xs:var(--p-border-radius-300)">
                                        <div class="Polaris-Box" style="--pc-box-background:var(--p-color-bg-surface);--pc-box-min-height:100%;--pc-box-overflow-x:hidden;--pc-box-overflow-y:hidden;--pc-box-padding-block-end-xs:var(--p-space-400);--pc-box-padding-block-start-xs:var(--p-space-400);--pc-box-padding-inline-start-xs:var(--p-space-400);--pc-box-padding-inline-end-xs:var(--p-space-400)">
                                            <div class="Polaris-FormLayout">
                                                <div class="Polaris-FormLayout__Item">
                                                    <div class="translate_old_new_main_div">
                                                        <div id="ext12_tier_${tierIndex}_rule_row_0" role="group" class="Polaris-FormLayout--condensed ext12_tier_rule_row" data-ext12_tier_rule_row_index="0">
                                                            <div class="Polaris-FormLayout__Items">
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <div class="Polaris-Connected">
                                                                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                                            <div class="Polaris-TextField">
                                                                                <input type="text" id="" name="tier[${tierIndex}][delivery_method][0][old]" class="Polaris-TextField__Input old_delivery_method Polaris-required__Error" autocomplete="off" placeholder="Old delivery method" value="">
                                                                                <div class="Polaris-TextField__Backdrop"></div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <div class="Polaris-Connected">
                                                                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                                            <div class="Polaris-TextField">
                                                                                <input type="text" id="" name="tier[${tierIndex}][delivery_method][0][new]" class="Polaris-TextField__Input new_delivery_method Polaris-required__Error" autocomplete="off" placeholder="New delivery method" value="">
                                                                                <div class="Polaris-TextField__Backdrop"></div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="Polaris-FormLayout__Item remove_translate_old_new_btn_div">
                                                                    <div class="remove_old_new_btn" style="display: none">
                                                                        <button class="Polaris-Button Polaris-Button--iconOnly" type="button" id="" onclick="deleteExt12Rule(${tierIndex}, 0)">
                                                                            <span class="Polaris-Button__Content">
                                                                                <span class="Polaris-Button__Icon">
                                                                                    <span class="Polaris-Icon">
                                                                                        <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
                                                                                            <path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path>
                                                                                        </svg>
                                                                                    </span>
                                                                                </span>
                                                                            </span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="Polaris-FormLayout__Item">
                                                    <hr>
                                                    <div class="Polaris-FormLayout">
                                                        <div role="group" class="Polaris-FormLayout--grouped">
                                                            <div class="Polaris-FormLayout__Items">
                                                                <div class="Polaris-FormLayout__Item ext12_tier_add_condition_div">
                                                                    <button type="button" id="" class="Polaris-Button Polaris-Button--primary ext12_tier_add_condition_btn">
                                                                        <span class="Polaris-Button__Content">
                                                                            <span class="Polaris-Button__Text">Add Delivery Methods</span>
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <button class="Polaris-Button Polaris-Button--primary Polaris-Button--critical delete_tier_btn_ext12" onclick="deleteTierExt12(${tierIndex})" type="button" style="float: right;">
                                                                        <span class="Polaris-Button__Content">
                                                                            <span class="Polaris-Button__Text">Delete Sub Rule</span>
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            $(".ext12_tier_main_div").append(ruleHTML);

            bootstrapTagsInputReinitialize();
            initializeSelect2();
            hideShowDeleteRuleBtn();
            initializeSortable();
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });

    /* click event of close "confirm sort always" model */
    $(document).on('click', '.close_confirm_always_modal', function (event) {
        event.preventDefault();
        $("#ext12_tier_always_1").prop('checked', false);
        $("#ext12_tier_always_0").prop('checked', true);
        $("#confirm_always_modal").hide();
    });

    /* click event of confirm "confirm sort always" model */
    $(document).on('click', '#confirm_always_btn', function (event) {
        event.preventDefault();

        const closestRuleWrapper = $("#rules_main_wrapper_div");
        closestRuleWrapper.find(".ext12_tier_rule_type, .ext12_tier_rule_condition, .ext12_tier_rule_value").removeClass("Polaris-required__Error");
        closestRuleWrapper.hide();
        $("#ext12_add_new_tier_btn_div").hide();

        $('.ext12_tier').each(function () {
            // console.log(typeof($(this).data("ext11_tier_index")));
            if ($(this).data("ext12_tier_index") > 0) {
                $(this).remove();
            }
        });

        $("#confirm_always_modal").hide();
    });

    /* change event of "sort conditionally, sort always" radio button */
    $(document).on('change', '.ext12_tier_always', function (event) {
        const This = $(this);
        const currentValue = This.val();
        // const closestRuleWrapper = This.closest(".ext11_tier").find(".rules_main_wrapper_div");
        const closestRuleWrapper = $("#rules_main_wrapper_div");

        if (currentValue === '1') {
            if ($(".ext12_tier_append_rules_div").length > 1) {
                // console.log('show pop-up');
                $("#confirm_always_modal").show();
                event.preventDefault();
            } else {
                closestRuleWrapper.find(".ext12_tier_rule_type, .ext12_tier_rule_condition, .ext12_tier_rule_value").removeClass("Polaris-required__Error");
                closestRuleWrapper.hide();
                $("#ext12_add_new_tier_btn_div").hide();
            }
        } else if (currentValue === '0') {
            closestRuleWrapper.find(".ext12_tier_rule_type, .ext12_tier_rule_condition, .ext12_tier_rule_value").addClass("Polaris-required__Error");
            closestRuleWrapper.show();
            $("#ext12_add_new_tier_btn_div").show();
        }

        bootstrapTagsInputReinitialize();
    });

    $(document).on('click', '.ext12_tier_add_condition_btn', function (e) {
        e.preventDefault();

        const This = $(this);
        const mainIndex = This.closest('.ext12_tier').data('ext12_tier_index');
        const subIndex = This.closest(".ext12_tier").find('.ext12_tier_rule_row').last().data('ext12_tier_rule_row_index') + 1;

        let isValidationDetected = false;
        removeErrorMessages();
        This.closest(".ext12_tier").find('.translate_old_new_main_div').each(function (i, el) {
            removeErrorMessages();
            $(el).find(".Polaris-required__Error").each(function (i, inner_elem) {
                if ($(inner_elem).val() == "") {
                    checkValidationWithinElement($(this).closest(".ext12_tier").find('.translate_old_new_main_div'));

                    ToastNotice("Required fields are missing OR Invalid Input added!", true);
                    isValidationDetected = true;
                    return false;
                }
            });
        });

        // const isError = checkInSectionValidations("translate_old_new_main_div");
        // $error = checkValidations();
        // if (!$error) {
        if (!isValidationDetected) {
            const itemRow = `
                <div id="ext12_tier_${mainIndex}_rule_row_${subIndex}" role="group" class="Polaris-FormLayout--condensed ext12_tier_rule_row" data-ext12_tier_rule_row_index="${subIndex}">
                    <div class="Polaris-FormLayout__Items">
                        <div class="Polaris-FormLayout__Item">
                            <div class="Polaris-Connected">
                                <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                    <div class="Polaris-TextField">
                                        <input type="text" id="" name="tier[${mainIndex}][delivery_method][${subIndex}][old]" class="Polaris-TextField__Input old_delivery_method Polaris-required__Error" autocomplete="off" placeholder="Old delivery method" value="">
                                        <div class="Polaris-TextField__Backdrop"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="Polaris-FormLayout__Item">
                            <div class="Polaris-Connected">
                                <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                    <div class="Polaris-TextField">
                                        <input type="text" id="" name="tier[${mainIndex}][delivery_method][${subIndex}][new]" class="Polaris-TextField__Input new_delivery_method Polaris-required__Error" autocomplete="off" placeholder="New delivery method" value="">
                                        <div class="Polaris-TextField__Backdrop"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="Polaris-FormLayout__Item remove_translate_old_new_btn_div">
                            <div class="remove_old_new_btn" style="display: none">
                                <button class="Polaris-Button Polaris-Button--iconOnly remove_old_new_row" type="button" id="" onclick="deleteExt12Rule(${mainIndex}, ${subIndex})">
                                    <span class="Polaris-Button__Content">
                                        <span class="Polaris-Button__Icon">
                                            <span class="Polaris-Icon">
                                                <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
                                                    <path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path>
                                                </svg>
                                            </span>
                                        </span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            This.closest(".ext12_tier").find(".translate_old_new_main_div").append(itemRow);
            hideShowDeleteRuleBtn();
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });

    // add new rule in specific tier button click event
    $(document).on('click', '.ext12_tier_add_rule_btn', function (e) {
        e.preventDefault();

        const beforeAppendRowSelectedRuleTypes = getSelectedRuleTypesExt12(this);
        const This = $(this);
        const tierIndex = This.closest('.ext12_tier').data('ext12_tier_index');
        const tierRuleIndex = This.closest(".ext12_tier").find('.ext12_tier_rule_rows').last().data('ext12_tier_rule_rows_index') + 1;

        let isValidationDetected = false;
        removeErrorMessages();
        This.closest(".ext12_tier").find('.ext12_tier_append_rules_div').each(function (i, el) {
            removeErrorMessages();
            $(el).find(".Polaris-required__Error").each(function (i, inner_elem) {
                if ($(inner_elem).val() == "") {
                    checkValidationWithinElement($(this).closest(".ext12_tier").find('.ext12_tier_append_rules_div'));

                    ToastNotice("Required fields are missing OR Invalid Input added!", true);
                    isValidationDetected = true;
                    return false;
                }
                // else {
                //     if (($(el).find(".end_range").val() && $(el).find(".start_range").val() && (parseFloat($(el).find(".start_range").val()) >= parseFloat($(el).find(".end_range").val())))) {
                //         //showErrorBanner();
                //         $(el).find(".end_range").parent().addClass('Polaris-TextField--error');
                //         $(el).find(".end_range").closest('.Polaris-FormLayout__Item').append(fieldError('End range must be greater than End Range.'));
                //
                //         ToastNotice("Required fields are missing OR Invalid Input added!", true);
                //         isValidationDetected = true;
                //         return false;
                //     }
                //     isValidationDetected = false;
                // }
            });
        });

        const isError = checkInSectionValidations("ext12_tier_rule_rows");
        // $error = checkValidations();
        // if (!$error) {
        if (!isError) {
            const checked = $(this).closest('.ext12_tier').find('.ext12_tier_condition_type:checked').val() == '0' ? "and" : "or";
            const selectedTypes = [];
            $(".ext12_tier_main_div").find('.ext12_tier').each(function (i, el) {
                $(el).find(".ext12_tier_rule_type").each(function () {
                    selectedTypes.push($(this).val());
                });
            });

            const ruleHTML = `
                <div id="ext12_tier_${tierIndex}_rule_rows_${tierRuleIndex}" class="ext12_tier_rule_rows" data-ext12_tier_rule_rows_index="${tierRuleIndex}">
                    <div class="Polaris-FormLayout__Items product_remove_list cs_divider line_divider">
                         <div class="Polaris-FormLayout__Item">
                             <span class="seperator-line prefix">${checked}</span>
                         </div>
                    </div>
                    <div class="delivery_rule_wrapper">
                        <div class="delete_button" style="display: none">
                            <a href="javascript:void(0)" onclick="deleteTierRuleRowExt12(${tierIndex}, ${tierRuleIndex}, this)" title="Remove">
                                <span>
                                    <svg fill="white" viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true" height="15px" width="15px">
                                        <path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path>
                                    </svg>
                                </span>
                            </a>
                        </div>
                        <div class="Polaris-FormLayout">
                            <div role="group" class="Polaris-FormLayout--grouped">
                                <div class="Polaris-FormLayout__Items">
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-Select">
                                                <select id="ext12_tier_${tierIndex}_rule_type_${tierRuleIndex}" name="tier[${tierIndex}][rule][${tierRuleIndex}][type]" class="Polaris-Select__Input ext12_tier_rule_type Polaris-required__Error" aria-invalid="false">
                                                    <option value="" selected>Select Rule Type</option>
                                                    <optgroup label="Cart Details">
                                                        <option value="0" ${beforeAppendRowSelectedRuleTypes.includes("0") ? "disabled" : ""}>Total Amount</option>
                                                        <option value="1" ${beforeAppendRowSelectedRuleTypes.includes("1") ? "disabled" : ""}>Subtotal Amount</option>
                                                        <option value="2" ${beforeAppendRowSelectedRuleTypes.includes("2") ? "disabled" : ""}>Total Weight</option>
                                                    </optgroup>
                                                    <optgroup label="Cart Has Any Items">
                                                        <option value="3" ${beforeAppendRowSelectedRuleTypes.includes("3") ? "disabled" : ""}>SKU</option>
                                                        <option value="16" ${beforeAppendRowSelectedRuleTypes.includes("16") ? "disabled" : ""}>Choose Collection</option>
                                                    </optgroup>
                                                    <optgroup label="Address">
                                                        <option value="8" ${beforeAppendRowSelectedRuleTypes.includes("8") ? "disabled" : ""}>Country</option>
                                                        <option value="9" ${beforeAppendRowSelectedRuleTypes.includes("9") ? "disabled" : ""}>Province Code / State Code</option>
                                                        <option value="10" ${beforeAppendRowSelectedRuleTypes.includes("10") ? "disabled" : ""}>Zip Code / Postal Code</option>
                                                    </optgroup>
                                                    <optgroup label="Customer">
                                                        <option value="13" ${beforeAppendRowSelectedRuleTypes.includes("13") ? "disabled" : ""}>Customer tags</option>
                                                    </optgroup>
                                                    <optgroup label="Date / Time">
                                                        <option value="36" ${beforeAppendRowSelectedRuleTypes.includes("36") ? "disabled" : ""}>Date</option>
<!--                                                        <option value="37">Day of Week</option>-->
                                                        <option value="38" ${beforeAppendRowSelectedRuleTypes.includes("38") ? "disabled" : selectedTypes.includes("38") ? "disabled" : ""}>Time</option>
<!--                                                        <option value="39">Between Day & Time</option>-->
                                                    </optgroup>
                                                </select>
                                                <div class="Polaris-Select__Content" aria-hidden="true">
                                                    <span class="Polaris-Select__SelectedOption">Select Rule Type</span>
                                                    <span class="Polaris-Select__Icon">
                                                        <span class="Polaris-Icon">
                                                              <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                              <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                        </span>
                                                    </span>
                                                </div>
                                                <div class="Polaris-Select__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-Select">
                                                <select id="ext12_tier_${tierIndex}_rule_condition_${tierRuleIndex}" name="tier[${tierIndex}][rule][${tierRuleIndex}][condition]" class="Polaris-Select__Input ext12_tier_rule_condition Polaris-required__Error" aria-invalid="false">
                                                    <option value="" selected>Select Rule Condition</option>
                                                    <option value="0">Greater than or equals</option>
                                                    <option value="1">Less than or equals</option>
                                                </select>
                                                <div class="Polaris-Select__Content" aria-hidden="true">
                                                    <span class="Polaris-Select__SelectedOption option_text">Select Rule Condition</span>
                                                    <span class="Polaris-Select__Icon">
                                                        <span class="Polaris-Icon">
                                                          <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                          <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                        </span>
                                                    </span>
                                                </div>
                                                <div class="Polaris-Select__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-Connected">
                                                <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                    <div class="ext12_tier_rule_value_div">
                                                        <div class="Polaris-TextField">
                                                            <input type="text" id="ext12_tier_${tierIndex}_rule_value_${tierRuleIndex}" name="tier[${tierIndex}][rule][${tierRuleIndex}][value]" class="Polaris-TextField__Input ext12_tier_rule_value Polaris-required__Error">
                                                            <div class="Polaris-TextField__Backdrop removeTagInput"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $(this).closest('.ext12_tier').find('.ext12_tier_append_rules_div').find('.conditions_main_div').append(ruleHTML);
            bootstrapTagsInputReinitialize();
            hideShowDeleteRuleBtn();
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });

    // rule type select box change event
    $(document).on('change', '.ext12_tier_rule_type', function (e) {
        const currentSelectedRuleType = $(this).val();
        const selectedRuleTypeIndex = $(this).closest('.ext12_tier_rule_rows').data('ext12_tier_rule_rows_index');
        const selectedRuleTierIndex = $(this).closest('.ext12_tier').data('ext12_tier_index');

        hideShowAddRuleButtonExt10(this);

        let options = '<option value="" disabled>Select Rule Condition</option>';
        let ruleTypeHtml = `
            <div class="Polaris-TextField">
                <input type="text" data-role="tagsinput" id="ext12_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input ext12_tier_rule_value Polaris-required__Error inputtag">
            </div>`;

        if (currentSelectedRuleType === '0' || currentSelectedRuleType === '1' || currentSelectedRuleType === '2' || currentSelectedRuleType === '14' || currentSelectedRuleType === '17' || currentSelectedRuleType === '38') {
            options += `
                <option value="0" selected>Greater than or equals</option>
                <option value="1">Less than or equals</option>
            `;
            if (currentSelectedRuleType === '38') {
                options += `<option value="6">Between</option>`;
            }
            ruleTypeHtml = `
                <div class="Polaris-TextField">
                    <input type="text" id="ext12_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input ext12_tier_rule_value Polaris-required__Error price_input">
                    <div class="Polaris-TextField__Backdrop"></div>
                </div>`;
        } else if (currentSelectedRuleType === '8' || currentSelectedRuleType === '9' || currentSelectedRuleType === '10' || currentSelectedRuleType === '11' || currentSelectedRuleType === '12' || currentSelectedRuleType === '13' || currentSelectedRuleType === '36') {
            options += `
                <option value="2" selected>Contains</option>
                <option value="3">Does not contains</option>
            `;
        } else if (currentSelectedRuleType === '16') {
            options += `
                <option value="2" selected>Contains</option>
                <option value="3">Does not contains all</option>
                <option value="9">Contains all</option>
                <option value="10">Does not contains</option>
            `;
        } else if (currentSelectedRuleType === '3') {
            options += `
                <option value="2" selected>Contains</option>
                <option value="3">Does not contains all</option>
                <option value="10">Does not contains</option>
            `;
        }

        $(this).parents('.Polaris-FormLayout__Items').find('.ext12_tier_rule_condition').html(options).prop("selectedIndex", 1).trigger('change');
        // $(this).parents('.Polaris-FormLayout__Items').find('.rule_condition').prop("selectedIndex", 1).trigger('change');

//         $(this).parents('.delivery_rule_wrapper').find('#collection_qty_main_div').remove();

        if (currentSelectedRuleType === '2') {
            const weightUnit = $("#ext12_tier_main_div").data("weight_unit")
            ruleTypeHtml = `<div class="Polaris-TextField">
                                <input type="text" id="ext12_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input ext12_tier_rule_value Polaris-required__Error price_input">
                                <div class="Polaris-TextField__Backdrop"></div>
                            </div>
                            <div class="Polaris-Labelled__HelpText" id="PolarisTextField1HelpText">
                                <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--break Polaris-Text--subdued">
                                    <span>Please enter weight in <strong>${weightUnit}</strong>.</span>
                                </span>
                            </div>`;
        } else if (currentSelectedRuleType === '16') {
            ruleTypeHtml = `<div class="Polaris-TextField collection_id_div" data-main_id="${selectedRuleTierIndex}" data-sub_id="${selectedRuleTypeIndex}">
                                <input type="text" data-role="tagsinput" id="ext12_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value]" data-selected_collections="[]" class="Polaris-TextField__Input ext12_tier_rule_value Polaris-required__Error open_collection_picker inputtag">
                            </div>`;
        } else if (currentSelectedRuleType === '8') {
            const allCountries = $(".all_countries").data("all_countries");
            let allCountriesOptionHtml = "";

            $.each(allCountries, function (code, country) {
                allCountriesOptionHtml += `<option value="${code}">${country}</option>`
            })

            ruleTypeHtml = `<div class="Polaris-TextField">
                                <select id="ext12_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value][]" class="form-control ext12_tier_rule_value country_code Polaris-required__Error" multiple="multiple">
                                ${allCountriesOptionHtml}
                                </select>
                            </div>`;
        } else if (currentSelectedRuleType === '9') {
            ruleTypeHtml = `<div class="Polaris-TextField">
                                <input type="text" data-role="tagsinput" id="ext12_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input ext12_tier_rule_value Polaris-required__Error inputtag">
                            </div>
                            <div class="Polaris-Labelled__HelpText" id="PolarisTextField1HelpText">
                                <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--break Polaris-Text--subdued">
                                    <span>You have to add 2 digit province/state code in "<strong>ISO 3166-1 alpha-2</strong>" format. Allow multiple.</span>
                                </span>
                            </div>`;
        } else if (currentSelectedRuleType === '10') {
            ruleTypeHtml += `<p class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--subdued">
                                <i>Please add a '*' sign to compare the start with. ex. 123*, H1H*, 3*</i>
                            </p>`;
        } else if (currentSelectedRuleType === '36') {
            ruleTypeHtml = `
                <div class="Polaris-TextField date_picker_div">
                    <input type="text" id="ext12_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input ext12_tier_rule_value date_picker Polaris-required__Error inputtag date_input_taginput" data-role="tagsinput" autocomplete="off">
                </div>
            `;
        } else if (currentSelectedRuleType === '38') {
            ruleTypeHtml = `
                <div class="Polaris-FormLayout">
                    <div role="group" class="Polaris-FormLayout--grouped">
                        <div class="Polaris-FormLayout__Items">
                            <div class="Polaris-FormLayout__Item">
                                <div class="">
                                    <div class="Polaris-TextField">
                                        <input type="text" id="ext12_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}_start_time" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value][start_time]" class="Polaris-TextField__Input ext12_tier_rule_value time_picker start_time_picker Polaris-required__Error" placeholder="Select start time">
                                        <div class="Polaris-TextField__Backdrop"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="Polaris-FormLayout__Item hide_element">
                                <div class="">
                                    <div class="Polaris-TextField">
                                        <input type="text" id="ext12_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}_end_time" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value][end_time]" class="Polaris-TextField__Input time_picker end_time_picker" placeholder="Select end time">
                                        <div class="Polaris-TextField__Backdrop"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        $(this).parents('.Polaris-FormLayout__Items').find(".ext12_tier_rule_value_div").html(ruleTypeHtml);
        bootstrapTagsInputReinitialize();
        initializeSelect2();
        initializeDatePicker();
        initializeTimePicker();
    });

    $(document).on('change', '.ext12_tier_rule_condition', function (e) {
        const currentSelectedRuleCondition = $(this).val();
        // console.log('currentSelectedRuleCondition - ' + currentSelectedRuleCondition);
        const currentSelectedRuleType = $(this).closest('.Polaris-FormLayout__Items').find('.ext12_tier_rule_type').val();
        // console.log('currentSelectedRuleType - ' + currentSelectedRuleType);
        const selectedRuleTierIndex = $(this).closest('.ext12_tier').data('ext12_tier_index');
        // console.log('selectedRuleTierIndex - ' + selectedRuleTierIndex);
        const selectedRuleTypeIndex = $(this).closest('.ext12_tier_rule_rows').data('ext12_tier_rule_rows_index');
        // console.log('selectedRuleTypeIndex - ' + selectedRuleTypeIndex);

        let ruleValueHtml = '';

        if (currentSelectedRuleType === '38') {
            if (currentSelectedRuleCondition === '0') {
                ruleValueHtml = `
                    <div class="Polaris-FormLayout">
                        <div role="group" class="Polaris-FormLayout--grouped">
                            <div class="Polaris-FormLayout__Items">
                                <div class="Polaris-FormLayout__Item">
                                    <div class="">
                                        <div class="Polaris-TextField">
                                            <input type="text" id="ext12_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}_start_time" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value][start_time]" class="Polaris-TextField__Input ext12_tier_rule_value time_picker start_time_picker Polaris-required__Error" placeholder="Select start time">
                                            <div class="Polaris-TextField__Backdrop"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="Polaris-FormLayout__Item hide_element">
                                    <div class="">
                                        <div class="Polaris-TextField">
                                            <input type="text" id="ext12_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}_end_time" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value][end_time]" class="Polaris-TextField__Input time_picker end_time_picker" placeholder="Select end time">
                                            <div class="Polaris-TextField__Backdrop"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else if (currentSelectedRuleCondition === '1') {
                ruleValueHtml = `
                    <div class="Polaris-FormLayout">
                        <div role="group" class="Polaris-FormLayout--grouped">
                            <div class="Polaris-FormLayout__Items">
                                <div class="Polaris-FormLayout__Item hide_element">
                                    <div class="">
                                        <div class="Polaris-TextField">
                                            <input type="text" id="ext12_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}_start_time" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value][start_time]" class="Polaris-TextField__Input time_picker start_time_picker" placeholder="Select start time">
                                            <div class="Polaris-TextField__Backdrop"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="Polaris-FormLayout__Item">
                                    <div class="">
                                        <div class="Polaris-TextField">
                                            <input type="text" id="ext12_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}_end_time" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value][end_time]" class="Polaris-TextField__Input ext12_tier_rule_value time_picker end_time_picker Polaris-required__Error" placeholder="Select end time">
                                            <div class="Polaris-TextField__Backdrop"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else if (currentSelectedRuleCondition === '6') {
                ruleValueHtml = `
                    <div class="Polaris-FormLayout">
                        <div role="group" class="Polaris-FormLayout--grouped">
                            <div class="Polaris-FormLayout__Items">
                                <div class="Polaris-FormLayout__Item">
                                    <div class="">
                                        <div class="Polaris-TextField">
                                            <input type="text" id="ext12_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}_start_time" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value][start_time]" class="Polaris-TextField__Input ext12_tier_rule_value time_picker start_time_picker Polaris-required__Error" placeholder="Select start time">
                                            <div class="Polaris-TextField__Backdrop"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="Polaris-FormLayout__Item">
                                    <div class="">
                                        <div class="Polaris-TextField">
                                            <input type="text" id="ext12_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}_end_time" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value][end_time]" class="Polaris-TextField__Input ext12_tier_rule_value time_picker end_time_picker Polaris-required__Error" placeholder="Select end time">
                                            <div class="Polaris-TextField__Backdrop"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }

            $(this).parents('.Polaris-FormLayout__Items').find(".ext12_tier_rule_value_div").html(ruleValueHtml);
            bootstrapTagsInputReinitialize();
            initializeSelect2();
            initializeDatePicker();
            initializeTimePicker();
        }
    });

    $(document).on('click', 'button.save_ext12_rename_multiple_form', function (e) {
        // $(".on-click-disable").attr("disabled", true);
        e.preventDefault();
        const formData = $("#ext12_rename_multiple_form").serializeArray();
        $error = checkValidations();
        if (!$error) {
            LoaderStart();
            $.ajax({
                url: $("#ext12_rename_multiple_form").attr('action'), type: "POST", data: formData,
                success: function (response) {
                    LoaderStop();
                    if (response.status === 200) {
                        ToastNotice(response.message)
                        pageReload();
                    } else {
                        ToastNotice(response.message, true)
                    }
                }, error: function (response) {
                    ToastNotice(response.message, true)
                }
            });
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });
    // ==========>          EXT-12 RENAME MULTIPLE END          <==========

    // ==========>          EXT-11 SORT MULTIPLE START          <==========
    /* click event of "Add New Rule" button */
    $(document).on('click', 'button#ext11_add_new_tier_btn', function (e) {
        e.preventDefault();
        const tierIndex = $(".ext11_tier_main_div").find('.ext11_tier').last().data('ext11_tier_index') + 1;
        $error = checkValidations();

        if (!$error) {
            const selectedTypes = [];
            $(".ext11_tier_main_div").find('.ext11_tier').each(function (i, el) {
                $(el).find(".ext11_tier_rule_type").each(function () {
                    selectedTypes.push($(this).val());
                });
            });

            const sortTypes = $(".ext11_tier_main_div").data("sort_type");
            let sortTypeRadioButtonsHtml = ``;
            $.each(sortTypes, function (index, sortType) {
                sortTypeRadioButtonsHtml += `
                    <div class="Polaris-Grid-Cell Polaris-Grid-Cell--cell_6ColumnXs Polaris-Grid-Cell--cell_3ColumnSm Polaris-Grid-Cell--cell_3ColumnMd Polaris-Grid-Cell--cell_6ColumnLg Polaris-Grid-Cell--cell_6ColumnXl">
                        <label class="Polaris-Choice" for="ext11_tier_sort_type_${tierIndex}_${sortType.value}">
                            <span class="Polaris-Choice__Control">
                                <span class="Polaris-RadioButton">
                                    <input type="radio" id="ext11_tier_sort_type_${tierIndex}_${sortType.value}" name="tier[${tierIndex}][sort_type]" class="Polaris-RadioButton__Input" ${sortType.default} value="${sortType.value}">
                                    <span class="Polaris-RadioButton__Backdrop"></span>
                                </span>
                            </span>
                            <span class="Polaris-Choice__Label">
                                <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">${sortType.title}</span>
                            </span>
                        </label>
                    </div>
                `;
            });
            const deliveryMethodTypes = $(".ext11_tier_main_div").data("delivery_method_type");
            let deliveryMethodTypeRadioButtonsHtml = ``;

            $.each(deliveryMethodTypes, function (index, deliveryMethodType) {
                deliveryMethodTypeRadioButtonsHtml += `
                    <div class="Polaris-Grid-Cell Polaris-Grid-Cell--cell_6ColumnXs Polaris-Grid-Cell--cell_3ColumnSm Polaris-Grid-Cell--cell_3ColumnMd Polaris-Grid-Cell--cell_6ColumnLg Polaris-Grid-Cell--cell_6ColumnXl">
                        <label class="Polaris-Choice" for="ext11_tier_delivery_method_type_${tierIndex}_${deliveryMethodType.id}">
                            <span class="Polaris-Choice__Control">
                                <span class="Polaris-RadioButton">
                                    <input type="radio" id="ext11_tier_delivery_method_type_${tierIndex}_${deliveryMethodType.id}" name="tier[${tierIndex}][delivery_method_type]" class="Polaris-RadioButton__Input" ${deliveryMethodType.is_checked} value="${deliveryMethodType.value}">
                                    <span class="Polaris-RadioButton__Backdrop"></span>
                                </span>
                            </span>
                            <span class="Polaris-Choice__Label">
                                <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">${deliveryMethodType.display_name}</span>
                            </span>
                        </label>
                    </div>
                `;
            });

            const ruleHTML = `
                <div id="ext11_tier_${tierIndex}" class="ext11_tier" data-ext11_tier_index="${tierIndex}">
                    <hr>
                    <div style="border-radius: 10px; border: 1px solid #dfdfdf">
                        <input type="hidden" id="ext11_tier_delivery_tier_id_${tierIndex}" name="tier[${tierIndex}][delivery_tier_id]" value="">
                        <div style="padding: 15px;">
                            <div class="Polaris-Layout__AnnotationWrapper" style="padding-bottom: 10px;">
                                <div class="Polaris-Layout__Annotation">
                                    <div class="Polaris-TextContainer">
                                        <h2 class="Polaris-Heading Polaris-Text--headingMd">Delivery Customization Rules</h2>
                                    </div>
                                </div>
                                <div class="Polaris-Layout__AnnotationContent">
                                    <div class="Polaris-ShadowBevel" style="--pc-shadow-bevel-z-index:32;--pc-shadow-bevel-content-xs:&quot;&quot;;--pc-shadow-bevel-box-shadow-xs:var(--p-shadow-100);--pc-shadow-bevel-border-radius-xs:var(--p-border-radius-300)">
                                        <div class="Polaris-Box" style="--pc-box-background:var(--p-color-bg-surface);--pc-box-min-height:100%;--pc-box-overflow-x:hidden;--pc-box-overflow-y:hidden;--pc-box-padding-block-end-xs:var(--p-space-400);--pc-box-padding-block-start-xs:var(--p-space-400);--pc-box-padding-inline-start-xs:var(--p-space-400);--pc-box-padding-inline-end-xs:var(--p-space-400)">
                                            <div class="">
                                                <div id="ext11_tier_${tierIndex}_append_rules_div" class="ext11_tier_append_rules_div" data-ext11_tier_append_rules_index="0">
                                                    <div id="conditions_main_div" class="conditions_main_div">
                                                        <div id="ext11_tier_${tierIndex}_rule_rows_0" class="ext11_tier_rule_rows" data-ext11_tier_rule_rows_index="0">
                                                            <div class="delivery_rule_wrapper">
                                                                <div class="delete_button" style="display: none">
                                                                    <a href="javascript:void(0)" onclick="deleteTierRuleRowExt11(${tierIndex}, 0, this)" title="Remove">
                                                                        <span>
                                                                            <svg fill="white" viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true" height="15px" width="15px">
                                                                                <path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path>
                                                                            </svg>
                                                                        </span>
                                                                    </a>
                                                                </div>
                                                                <div class="Polaris-FormLayout">
                                                                    <div role="group" class="Polaris-FormLayout--grouped">
                                                                        <div class="Polaris-FormLayout__Items">
                                                                            <div class="Polaris-FormLayout__Item">
                                                                                <div class="">
                                                                                    <div class="Polaris-Select">
                                                                                        <select id="ext11_tier_${tierIndex}_rule_type_0" name="tier[${tierIndex}][rule][0][type]" class="Polaris-Select__Input ext11_tier_rule_type Polaris-required__Error" aria-invalid="false">
                                                                                            <option value="">Select Rule Type</option>
                                                                                            <optgroup label="Cart Details">
                                                                                                <option value="0" selected>Total Amount</option>
                                                                                            </optgroup>
                                                                                            <optgroup label="Address">
                                                                                                <option value="8">Country</option>
                                                                                            </optgroup>
                                                                                            <option value="22">B2B Company Name</option>
                                                                                            <optgroup label="Date / Time">
                                                                                                <option value="36">Date</option>
                                                                                                <option value="38" ${selectedTypes.includes("38") ? "disabled" : ""}>Time</option>
                                                                                            </optgroup>
                                                                                        </select>
                                                                                        <div class="Polaris-Select__Content" aria-hidden="true">
                                                                                            <span class="Polaris-Select__SelectedOption">Total Amount</span>
                                                                                            <span class="Polaris-Select__Icon">
                                                                                                <span class="Polaris-Icon">
                                                                                                      <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                                                                      <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                                                                </span>
                                                                                            </span>
                                                                                        </div>
                                                                                        <div class="Polaris-Select__Backdrop"></div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="Polaris-FormLayout__Item">
                                                                                <div class="">
                                                                                    <div class="Polaris-Select">
                                                                                        <select id="ext11_tier_${tierIndex}_rule_condition_0" name="tier[${tierIndex}][rule][0][condition]" class="Polaris-Select__Input ext11_tier_rule_condition Polaris-required__Error" aria-invalid="false">
                                                                                            <option value="">Select Rule Condition</option>
                                                                                            <option value="0" selected>Greater than or equals</option>
                                                                                            <option value="1">Less than or equals</option>
                                                                                        </select>
                                                                                        <div class="Polaris-Select__Content" aria-hidden="true">
                                                                                            <span class="Polaris-Select__SelectedOption option_text">Greater than or equals</span>
                                                                                            <span class="Polaris-Select__Icon">
                                                                                                <span class="Polaris-Icon">
                                                                                                  <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                                                                  <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                                                                </span>
                                                                                            </span>
                                                                                        </div>
                                                                                        <div class="Polaris-Select__Backdrop"></div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="Polaris-FormLayout__Item">
                                                                                <div class="">
                                                                                    <div class="Polaris-Connected">
                                                                                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                                                            <div class="ext11_tier_rule_value_div">
                                                                                                <div class="Polaris-TextField">
                                                                                                    <input type="text" id="ext11_tier_${tierIndex}_rule_value_0" name="tier[${tierIndex}][rule][0][value]" class="Polaris-TextField__Input ext11_tier_rule_value Polaris-required__Error">
                                                                                                    <div class="Polaris-TextField__Backdrop removeTagInput"></div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <hr>
                                                <div class="Polaris-FormLayout">
                                                    <div role="group" class="Polaris-FormLayout--grouped">
                                                        <div class="Polaris-FormLayout__Items">
                                                            <div class="Polaris-FormLayout__Item ext11_tier_add_rule_btn_div">
                                                                <button class="Polaris-Button Polaris-Button--primary ext11_tier_add_rule_btn" type="button">
                                                                    <span class="Polaris-Button__Content">
                                                                        <span class="Polaris-Button__Text">Add Condition</span>
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="Polaris-Layout__AnnotationWrapper" style="padding-bottom: 10px;">
                                <div class="Polaris-Layout__Annotation">
                                    <div class="Polaris-TextContainer">
                                        <h2 class="Polaris-Heading Polaris-Text--headingMd">Re-order Delivery Methods</h2>
                                        <p class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--subdued">Add delivery methods and re-order it.</p>
                                    </div>
                                </div>
                                <div class="Polaris-Layout__AnnotationContent">
                                    <div class="Polaris-ShadowBevel" style="--pc-shadow-bevel-z-index:32;--pc-shadow-bevel-content-xs:&quot;&quot;;--pc-shadow-bevel-box-shadow-xs:var(--p-shadow-100);--pc-shadow-bevel-border-radius-xs:var(--p-border-radius-300)">
                                        <div class="Polaris-Box" style="--pc-box-background:var(--p-color-bg-surface);--pc-box-min-height:100%;--pc-box-overflow-x:hidden;--pc-box-overflow-y:hidden;--pc-box-padding-block-end-xs:var(--p-space-400);--pc-box-padding-block-start-xs:var(--p-space-400);--pc-box-padding-inline-start-xs:var(--p-space-400);--pc-box-padding-inline-end-xs:var(--p-space-400)">
                                            <div class="Polaris-FormLayout">
                                                <div class="Polaris-FormLayout__Item">
                                                    <div class="">
                                                        <div class="Polaris-Labelled__LabelWrapper">
                                                            <div class="Polaris-Label">
                                                                <label id="" for="" class="">Sorting Order :</label>
                                                            </div>
                                                        </div>
                                                        <div class="Polaris-Grid">
                                                           ${sortTypeRadioButtonsHtml}
                                                        </div>
                                                    </div>
                                                </div>
                                                <hr>
                                                <div class="Polaris-FormLayout__Item">
                                                    <div class="">
                                                        <div class="Polaris-Labelled__LabelWrapper">
                                                            <div class="Polaris-Label">
                                                                <label id="" for="" class="">Delivery methods name match :</label>
                                                            </div>
                                                        </div>
                                                        <div class="Polaris-Grid">
                                                            ${deliveryMethodTypeRadioButtonsHtml}
                                                        </div>
                                                    </div>
                                                    <hr>
                                                </div>
                                                <div class="Polaris-FormLayout__Item">
                                                    <div class="Polaris-ShadowBevel" style="--pc-shadow-bevel-z-index:32;--pc-shadow-bevel-content-xs:&quot;&quot;;--pc-shadow-bevel-box-shadow-xs:var(--p-shadow-100);--pc-shadow-bevel-border-radius-xs:var(--p-border-radius-300)">
                                                        <div class="">
                                                            <div class="Polaris-DataTable Polaris-DataTable__ShowTotals">
                                                                <div class="Polaris-DataTable__ScrollContainer">
                                                                    <table class="Polaris-DataTable__Table">
                                                                        <thead>
                                                                        <tr>
                                                                            <th style="width: 56px;" data-polaris-header-cell="true" class="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header" scope="col"></th>
                                                                            <th data-polaris-header-cell="true" class="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header" scope="col">Title</th>
                                                                            <th style="width: 45px;" data-polaris-header-cell="true" class="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header" scope="col"></th>
                                                                        </tr>
                                                                        </thead>
                                                                        <tbody class="sort_delivery_type_tbl">
                                                                        <tr id="ext11_tier_${tierIndex}_rule_row_0" class="Polaris-DataTable__TableRow Polaris-DataTable--hoverable ext11_tier_rule_row" data-ext11_tier_rule_row_index="0">
                                                                            <td class="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn" scope="row">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="drag_icon">
                                                                                    <path fill="none" d="M0 0h24v24H0V0z"></path>
                                                                                    <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
                                                                                </svg>
                                                                            </td>
                                                                            <td class="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                                                                <div class="Polaris-FormLayout">
                                                                                    <div class="Polaris-FormLayout__Item">
                                                                                        <div class="">
                                                                                            <div class="Polaris-Connected">
                                                                                                <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                                                                    <div class="Polaris-TextField">
                                                                                                        <input type="text" translate="no" id="" name="tier[${tierIndex}][delivery_method][0]" list="deliveryMethods" autocomplete="off" class="Polaris-TextField__Input sort_rule_value Polaris-required__Error sort_rate_txt" value="">
                                                                                                        <div class="Polaris-TextField__Backdrop"></div>
                                                                                                    </div>
                                                                                                    <datalist id="deliveryMethods">
                                                                                                        <option value="Standard Shipping">Standard Shipping</option>
                                                                                                        <option value="Express Shipping">Express Shipping</option>
                                                                                                        <option value="Ground Shipping">Ground Shipping</option>
                                                                                                        <option value="Over Night Shipping">Over Night Shipping</option>
                                                                                                    </datalist>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td class="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                                                                <button class="Polaris-Button Polaris-Button--iconOnly sort_rule_remove_btn" type="button" onclick="deleteExt11Rule(${tierIndex}, 0)" style="display: none">
                                                                                    <span class="Polaris-Button__Content">
                                                                                        <span class="Polaris-Button__Icon">
                                                                                            <span class="Polaris-Icon">
                                                                                                <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path></svg>
                                                                                            </span>
                                                                                        </span>
                                                                                    </span>
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="Polaris-FormLayout__Item">
                                                    <hr>
                                                    <div class="Polaris-FormLayout">
                                                        <div role="group" class="Polaris-FormLayout--grouped">
                                                            <div class="Polaris-FormLayout__Items">
                                                                <div class="Polaris-FormLayout__Item ext11_tier_add_condition_div">
                                                                    <button type="button" id="" class="Polaris-Button Polaris-Button--primary ext11_tier_add_condition_btn">
                                                                        <span class="Polaris-Button__Content">
                                                                            <span class="Polaris-Button__Text">Add Delivery Methods</span>
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                                <div class="Polaris-FormLayout__Item">
                                                                    <button class="Polaris-Button Polaris-Button--primary Polaris-Button--critical delete_tier_btn_ext11" onclick="deleteTierExt11(${tierIndex})" type="button" style="float: right;">
                                                                        <span class="Polaris-Button__Content">
                                                                            <span class="Polaris-Button__Text">Delete Sub Rule</span>
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            $(".ext11_tier_main_div").append(ruleHTML);

            bootstrapTagsInputReinitialize();
            initializeSelect2();
            hideShowDeleteRuleBtn();
            initializeSortable();
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });

    /* click event of close "confirm sort always" model */
    $(document).on('click', '.close_confirm_always_modal', function (event) {
        event.preventDefault();
        $("#ext11_tier_always_1").prop('checked', false);
        $("#ext11_tier_always_0").prop('checked', true);
        $("#confirm_always_modal").hide();
    });

    /* click event of confirm "confirm sort always" model */
    $(document).on('click', '#confirm_always_btn', function (event) {
        event.preventDefault();

        const closestRuleWrapper = $("#rules_main_wrapper_div");
        closestRuleWrapper.find(".ext11_tier_rule_type, .ext11_tier_rule_condition, .ext11_tier_rule_value").removeClass("Polaris-required__Error");
        closestRuleWrapper.hide();
        $("#ext11_add_new_tier_btn_div").hide();

        $('.ext11_tier').each(function () {
            // console.log(typeof($(this).data("ext11_tier_index")));
            if ($(this).data("ext11_tier_index") > 0) {
                $(this).remove();
            }
        });

        $("#confirm_always_modal").hide();
    });

    /* change event of "sort conditionally, sort always" radio button */
    $(document).on('change', '.ext11_tier_always', function (event) {
        const This = $(this);
        const currentValue = This.val();
        // const closestRuleWrapper = This.closest(".ext11_tier").find(".rules_main_wrapper_div");
        const closestRuleWrapper = $("#rules_main_wrapper_div");

        if (currentValue === '1') {
            if ($(".ext11_tier_append_rules_div").length > 1) {
                // console.log('show pop-up');
                $("#confirm_always_modal").show();
                event.preventDefault();
            } else {
                closestRuleWrapper.find(".ext11_tier_rule_type, .ext11_tier_rule_condition, .ext11_tier_rule_value").removeClass("Polaris-required__Error");
                closestRuleWrapper.hide();
                $("#ext11_add_new_tier_btn_div").hide();
            }
        } else if (currentValue === '0') {
            closestRuleWrapper.find(".ext11_tier_rule_type, .ext11_tier_rule_condition, .ext11_tier_rule_value").addClass("Polaris-required__Error");
            closestRuleWrapper.show();
            $("#ext11_add_new_tier_btn_div").show();
        }

        bootstrapTagsInputReinitialize();
    });

    /* click event of "Add Delivery Methods" button */
    $(document).on('click', 'button.ext11_tier_add_condition_btn', function (e) {
        e.preventDefault();

        const This = $(this);
        const mainIndex = This.closest('.ext11_tier').data('ext11_tier_index');
        const subIndex = This.closest(".ext11_tier").find('.ext11_tier_rule_row').length;

        let isValidationDetected = false;
        removeErrorMessages();
        This.closest(".ext11_tier").find('.sort_delivery_type_tbl').each(function (i, el) {
            removeErrorMessages();
            $(el).find(".Polaris-required__Error").each(function (i, inner_elem) {
                if ($(inner_elem).val() == "") {
                    checkValidationWithinElement($(this).closest(".ext11_tier").find('.sort_delivery_type_tbl'));

                    ToastNotice("Required fields are missing OR Invalid Input added!", true);
                    isValidationDetected = true;
                    return false;
                }
            });
        });

        // const isError = checkInSectionValidations("sort_delivery_type_tbl");
        if (!isValidationDetected) {
            const itemRow = `
                <tr id="ext11_tier_${mainIndex}_rule_row_${subIndex}" class="Polaris-DataTable__TableRow Polaris-DataTable--hoverable ext11_tier_rule_row" data-ext11_tier_rule_row_index="${subIndex}">
                    <td class="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn" scope="row">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="drag_icon">
                            <path fill="none" d="M0 0h24v24H0V0z"></path>
                            <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
                        </svg>
                    </td>
                    <td class="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                        <div class="Polaris-FormLayout">
                            <div class="Polaris-FormLayout__Item">
                                <div class="">
                                    <div class="Polaris-Connected">
                                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                            <div class="Polaris-TextField ">
                                                <input type="text" translate="no" id="" name="tier[${mainIndex}][delivery_method][${subIndex}]" list="deliveryMethods" autocomplete="off" class="Polaris-TextField__Input sort_rule_value Polaris-required__Error sort_rate_txt">
                                                <div class="Polaris-TextField__Backdrop"></div>
                                            </div>
                                            <datalist id="deliveryMethods">
                                                <option value="Standard Shipping">Standard Shipping</option>
                                                <option value="Express Shipping">Express Shipping</option>
                                                <option value="Ground Shipping">Ground Shipping</option>
                                                <option value="Over Night Shipping">Over Night Shipping</option>
                                            </datalist>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                        <button class="Polaris-Button Polaris-Button--iconOnly sort_rule_remove_btn" type="button" onclick="deleteExt11Rule(${mainIndex},${subIndex})">
                            <span class="Polaris-Button__Content">
                                <span class="Polaris-Button__Icon">
                                    <span class="Polaris-Icon">
                                        <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path></svg>
                                    </span>
                                </span>
                            </span>
                        </button>
                    </td>
                </tr>`;

            This.closest(".ext11_tier").find(".sort_delivery_type_tbl").append(itemRow);
            hideShowDeleteRuleBtn();
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });

    $(".sort_delivery_type_tbl").sortable();

    // add new rule in specific tier button click event
    $(document).on('click', '.ext11_tier_add_rule_btn', function (event) {
        event.preventDefault();

        const beforeAppendRowSelectedRuleTypes = getSelectedRuleTypesExt11(this);

        const This = $(this);
        const tierIndex = This.closest('.ext11_tier').data('ext11_tier_index');
        const tierRuleIndex = This.closest(".ext11_tier").find('.ext11_tier_rule_rows').last().data('ext11_tier_rule_rows_index') + 1;

        let isValidationDetected = false;
        removeErrorMessages();
        This.closest(".ext11_tier").find('.ext11_tier_append_rules_div').each(function (i, el) {
            removeErrorMessages();
            $(el).find(".Polaris-required__Error").each(function (i, inner_elem) {
                if ($(inner_elem).val() == "") {
                    checkValidationWithinElement($(this).closest(".ext11_tier").find('.ext11_tier_append_rules_div'));

                    ToastNotice("Required fields are missing OR Invalid Input added!", true);
                    isValidationDetected = true;
                    return false;
                }
                // else {
                //     if (($(el).find(".end_range").val() && $(el).find(".start_range").val() && (parseFloat($(el).find(".start_range").val()) >= parseFloat($(el).find(".end_range").val())))) {
                //         //showErrorBanner();
                //         $(el).find(".end_range").parent().addClass('Polaris-TextField--error');
                //         $(el).find(".end_range").closest('.Polaris-FormLayout__Item').append(fieldError('End range must be greater than End Range.'));
                //
                //         ToastNotice("Required fields are missing OR Invalid Input added!", true);
                //         isValidationDetected = true;
                //         return false;
                //     }
                //     isValidationDetected = false;
                // }
            });
        });

        // const isError = checkInSectionValidations("ext11_tier_rule_rows");
        if (!isValidationDetected) {
            let selectedTypes = [];
            $(".ext12_tier_main_div").find('.ext12_tier').each(function (i, el) {
                $(el).find(".ext12_tier_rule_type").each(function () {
                    selectedTypes.push($(this).val());
                });
            });

            const ruleHTML = `
                <div id="ext11_tier_${tierIndex}_rule_rows_${tierRuleIndex}" class="ext11_tier_rule_rows" data-ext11_tier_rule_rows_index="${tierRuleIndex}">
                    <div class="Polaris-FormLayout__Items product_remove_list cs_divider line_divider">
                         <div class="Polaris-FormLayout__Item">
                             <span class="seperator-line prefix">and</span>
                         </div>
                    </div>
                    <div class="delivery_rule_wrapper">
                        <div class="delete_button" style="display: none">
                            <a href="javascript:void(0)" onclick="deleteTierRuleRowExt11(${tierIndex}, ${tierRuleIndex}, this)" title="Remove">
                                <span>
                                    <svg fill="white" viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true" height="15px" width="15px">
                                        <path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path>
                                    </svg>
                                </span>
                            </a>
                        </div>
                        <div class="Polaris-FormLayout">
                            <div role="group" class="Polaris-FormLayout--grouped">
                                <div class="Polaris-FormLayout__Items">
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-Select">
                                                <select id="ext11_tier_${tierIndex}_rule_type_${tierRuleIndex}" name="tier[${tierIndex}][rule][${tierRuleIndex}][type]" class="Polaris-Select__Input ext11_tier_rule_type Polaris-required__Error" aria-invalid="false">
                                                    <option value="" selected>Select Rule Type</option>
                                                    <optgroup label="Cart Details">
                                                        <option value="0" ${beforeAppendRowSelectedRuleTypes.includes("0") ? "disabled" : ""}>Total Amount</option>
                                                    </optgroup>
                                                    <optgroup label="Address">
                                                        <option value="8" ${beforeAppendRowSelectedRuleTypes.includes("8") ? "disabled" : ""}>Country</option>
                                                    </optgroup>
                                                    <option value="22" ${beforeAppendRowSelectedRuleTypes.includes("22") ? "disabled" : ""}>B2B Company name</option>
                                                    <optgroup label="Date / Time">
                                                        <option value="36" ${beforeAppendRowSelectedRuleTypes.includes("36") ? "disabled" : ""}>Date</option>
                                                        <option value="38" ${beforeAppendRowSelectedRuleTypes.includes("38") ? "disabled" : selectedTypes.includes("38") ? "disabled" : ""}>Time</option>
                                                    </optgroup>
                                                </select>
                                                <div class="Polaris-Select__Content" aria-hidden="true">
                                                    <span class="Polaris-Select__SelectedOption">Select Rule Type</span>
                                                    <span class="Polaris-Select__Icon">
                                                        <span class="Polaris-Icon">
                                                              <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                              <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                        </span>
                                                    </span>
                                                </div>
                                                <div class="Polaris-Select__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-Select">
                                                <select id="ext11_tier_${tierIndex}_rule_condition_${tierRuleIndex}" name="tier[${tierIndex}][rule][${tierRuleIndex}][condition]" class="Polaris-Select__Input ext11_tier_rule_condition Polaris-required__Error" aria-invalid="false">
                                                    <option value="" selected>Select Rule Condition</option>
                                                    <option value="0">Greater than or equals</option>
                                                    <option value="1">Less than or equals</option>
                                                </select>
                                                <div class="Polaris-Select__Content" aria-hidden="true">
                                                    <span class="Polaris-Select__SelectedOption option_text">Select Rule Condition</span>
                                                    <span class="Polaris-Select__Icon">
                                                        <span class="Polaris-Icon">
                                                          <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                          <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                        </span>
                                                    </span>
                                                </div>
                                                <div class="Polaris-Select__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-Connected">
                                                <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                    <div class="ext11_tier_rule_value_div">
                                                        <div class="Polaris-TextField">
                                                            <input type="text" id="ext11_tier_${tierIndex}_rule_value_${tierRuleIndex}" name="tier[${tierIndex}][rule][${tierRuleIndex}][value]" class="Polaris-TextField__Input ext11_tier_rule_value Polaris-required__Error">
                                                            <div class="Polaris-TextField__Backdrop removeTagInput"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            $(this).closest('.ext11_tier').find('.ext11_tier_append_rules_div').find('.conditions_main_div').append(ruleHTML);
            bootstrapTagsInputReinitialize();

            hideShowDeleteRuleBtn();
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });

    // rule type select box change event
    $(document).on('change', '.ext11_tier_rule_type', function (e) {
        const currentSelectedRuleType = $(this).val();
        const selectedRuleTypeIndex = $(this).closest('.ext11_tier_rule_rows').data('ext11_tier_rule_rows_index');
        const selectedRuleTierIndex = $(this).closest('.ext11_tier').data('ext11_tier_index');

        hideShowAddRuleButtonExt11(this);

        let options = '<option value="" disabled>Select Rule Condition</option>';
        let ruleTypeHtml = `
            <div class="Polaris-TextField">
                <input type="text" data-role="tagsinput" id="ext11_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input ext11_tier_rule_value Polaris-required__Error inputtag">
            </div>
        `;

        if (currentSelectedRuleType === '0' || currentSelectedRuleType === '38') {
            options += `
                <option value="0" selected>Greater than or equals</option>
                <option value="1">Less than or equals</option>
            `;
            if (currentSelectedRuleType === '38') {
                options += `<option value="6">Between</option>`;
            }
            ruleTypeHtml = `
                <div class="Polaris-TextField">
                    <input type="text" id="ext11_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input ext11_tier_rule_value Polaris-required__Error price_input">
                    <div class="Polaris-TextField__Backdrop"></div>
                </div>
            `;
        } else if (currentSelectedRuleType === '8' || currentSelectedRuleType === '36') {
            options += `
                <option value="2" selected>Contains</option>
                <option value="3">Does not contains</option>
            `;
        } else if (currentSelectedRuleType === '22') {
            options += `
                <option value="2" selected>Contains</option>
                <option value="3">Does not contains</option>
                <option value="7">Has any value</option>
                <option value="8">Is Null</option>
            `;
        }

        $(this).parents('.Polaris-FormLayout__Items').find('.ext11_tier_rule_condition').html(options).prop("selectedIndex", 1).trigger('change');
        // $(this).parents('.Polaris-FormLayout__Items').find('.rule_condition').prop("selectedIndex", 1).trigger('change');

        if (currentSelectedRuleType === '8') {
            const allCountries = $(".all_countries").data("all_countries");
            let allCountriesOptionHtml = ``;
            $.each(allCountries, function (code, country) {
                allCountriesOptionHtml += `<option value="${code}">${country}</option>`
            });
            ruleTypeHtml = `
                <div class="Polaris-TextField">
                    <select id="ext11_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value][]" class="form-control ext11_tier_rule_value country_code Polaris-required__Error" multiple="multiple">
                    ${allCountriesOptionHtml}
                    </select>
                </div>
            `;
        }else if (currentSelectedRuleType === '36') {
            ruleTypeHtml = `
                <div class="Polaris-TextField date_picker_div">
                    <input type="text" id="ext11_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input ext11_tier_rule_value date_picker Polaris-required__Error inputtag date_input_taginput" data-role="tagsinput" autocomplete="off">
                </div>
            `;
        } else if (currentSelectedRuleType === '38') {
            ruleTypeHtml = `
                <div class="Polaris-FormLayout">
                    <div role="group" class="Polaris-FormLayout--grouped">
                        <div class="Polaris-FormLayout__Items">
                            <div class="Polaris-FormLayout__Item">
                                <div class="">
                                    <div class="Polaris-TextField">
                                        <input type="text" id="ext11_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}_start_time" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value][start_time]" class="Polaris-TextField__Input ext11_tier_rule_value time_picker start_time_picker Polaris-required__Error" placeholder="Select start time">
                                        <div class="Polaris-TextField__Backdrop"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="Polaris-FormLayout__Item hide_element">
                                <div class="">
                                    <div class="Polaris-TextField">
                                        <input type="text" id="ext11_tier_${selectedRuleTierIndex}_rule_value_${selectedRuleTypeIndex}_end_time" name="tier[${selectedRuleTierIndex}][rule][${selectedRuleTypeIndex}][value][end_time]" class="Polaris-TextField__Input time_picker end_time_picker" placeholder="Select end time">
                                        <div class="Polaris-TextField__Backdrop"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        $(this).parents('.Polaris-FormLayout__Items').find(".ext11_tier_rule_value_div").html(ruleTypeHtml);
        bootstrapTagsInputReinitialize();
        initializeSelect2();
        initializeDatePicker();
        initializeTimePicker();
    });

    $(document).on('change', '.ext11_tier_rule_condition', function (e) {
        let ruleValueHtml;

        const currentSelectedRuleCondition = $(this).val();
        const currentSelectedRuleType = $(this).closest('.ext11_tier_rule_rows').find('.ext11_tier_rule_type').val();
        const selectedRuleTypeIndex = $(this).closest('.ext11_tier_rule_rows').attr('data-ext11_tier_rule_rows_index');
        const selectedTierIndex = $(this).closest('.ext11_tier_append_rules_div').attr('data-ext11_tier_append_rules_index');

        if ($("#ext11_tier_main_div").data("extension_type") === 12) {
            if (currentSelectedRuleType === '22' || currentSelectedRuleType === '38') {
                if (currentSelectedRuleType === '22'){
                    if ($.inArray(currentSelectedRuleCondition, ['7', '8']) >= 0) {
                        ruleValueHtml = `
                            <div class="Polaris-TextField" style="display: none">
                                <input type="text" data-role="tagsinput" id="ext11_tier_${selectedTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedTierIndex}][rule][${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input inputtag">
                            </div>
                        `;
                    } else if ($.inArray(currentSelectedRuleCondition, ['2', '3']) >= 0) {
                        ruleValueHtml = `
                            <div class="Polaris-TextField" >
                                <input type="text" data-role="tagsinput" id="ext11_tier_${selectedTierIndex}_rule_value_${selectedRuleTypeIndex}" name="tier[${selectedTierIndex}][rule][${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input Polaris-required__Error inputtag">
                            </div>
                        `;
                    }
                } else if (currentSelectedRuleType === '38'){
                    ruleValueHtml = `
                        <div class="Polaris-FormLayout">
                            <div role="group" class="Polaris-FormLayout--grouped">
                                <div class="Polaris-FormLayout__Items">
                                    <div class="Polaris-FormLayout__Item ${currentSelectedRuleCondition === '1' ? 'hide_element' : ''}">
                                        <div class="">
                                            <div class="Polaris-TextField">
                                                <input type="text" id="ext11_tier_${selectedTierIndex}_rule_value_${selectedRuleTypeIndex}_start_time" name="tier[${selectedTierIndex}][rule][${selectedRuleTypeIndex}][value][start_time]" class="Polaris-TextField__Input time_picker start_time_picker ${currentSelectedRuleCondition === '1' ? '' : 'ext11_tier_rule_value Polaris-required__Error'}" placeholder="Select start time">
                                                <div class="Polaris-TextField__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="Polaris-FormLayout__Item ${currentSelectedRuleCondition === '0' ? 'hide_element' : ''}">
                                        <div class="">
                                            <div class="Polaris-TextField">
                                                <input type="text" id="ext11_tier_${selectedTierIndex}_rule_value_${selectedRuleTypeIndex}_end_time" name="tier[${selectedTierIndex}][rule][${selectedRuleTypeIndex}][value][end_time]" class="Polaris-TextField__Input time_picker end_time_picker ${currentSelectedRuleCondition === '0' ? '' : 'ext11_tier_rule_value Polaris-required__Error'}" placeholder="Select end time">
                                                <div class="Polaris-TextField__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }

                $(this).parents('.Polaris-FormLayout__Items').find(".ext11_tier_rule_value_div").html(ruleValueHtml);
                bootstrapTagsInputReinitialize();
                initializeSelect2();
                initializeDatePicker();
                initializeTimePicker();
            }
        }
    });

    /* click event of "Create / Update" button */
    $(document).on('click', 'button.save_ext11_sort_rules', function (e) {
        e.preventDefault();

        const formData = $("#ext11_sort_form").serializeArray();

        $error = checkValidations();

        if (!$error) {
            LoaderStart();

            $.ajax({
                url: $("#ext11_sort_form").attr('action'), type: "POST", data: formData,

                success: function (response) {
                    LoaderStop();

                    if (response.status === 200) {
                        ToastNotice(response.message)
                        pageReload();
                    } else {
                        ToastNotice(response.message, true)
                    }
                }, error: function (response) {
                    ToastNotice(response.message, true)
                }
            });
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });
    // ==========>          EXT-11 SORT MULTIPLE END            <==========

    // ==========>          TIME BASED TIER START           <==========
    $(document).on('change', '.time_based_tier_type', function (e) {
        const THIS = $(this);

        const days = $('#time_based_main_layout').data('days');
        const time = $('#time_based_main_layout').data('time');

        let timeOptionHtml = '';
        $.each(time, function (key, time) {
            timeOptionHtml += `<option value="${time}">${time}</option>`
        })

        let html = '';

        if (THIS.val() == '1') {
            let dayCheckboxesHtml = '';
            $.each(days, function (key, day) {
                dayCheckboxesHtml += `
                    <div class="Polaris-LegacyStack__Item">
                        <div class="">
                            <label class="Polaris-Choice Polaris-Checkbox__ChoiceLabel" for="type_1_day_${key}">
                                <span class="Polaris-Choice__Control">
                                    <span class="Polaris-Checkbox">
                                        <input type="checkbox" id="type_1_day_${key}" name="time_based_tier[day][]" class="Polaris-Checkbox__Input time_based_tier_day" ${day.is_checked} value="${day.value}" aria-invalid="false" role="checkbox" aria-checked="false">
                                        <span class="Polaris-Checkbox__Backdrop"></span>
                                        <span class="Polaris-Checkbox__Icon">
                                            <span class="Polaris-Icon">
                                                <span class="Polaris-Text--root Polaris-Text--visuallyHidden"></span>
                                                <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
                                                    <path fill-rule="evenodd" d="M14.03 7.22a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 1 1 1.06-1.06l1.72 1.72 3.97-3.97a.75.75 0 0 1 1.06 0Z"></path>
                                                </svg>
                                            </span>
                                        </span>
                                    </span>
                                </span>
                                <span class="Polaris-Choice__Label">
                                    <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">${day.title}</span>
                                </span>
                            </label>
                        </div>
                    </div>
                `;
            });

            html = `
                <div class="Polaris-LegacyStack Polaris-LegacyStack--distributionFill">
                    ${dayCheckboxesHtml}
                </div>
                <hr>
                <div class="Polaris-FormLayout">
                    <div role="group" class="Polaris-FormLayout--grouped">
                        <div class="Polaris-FormLayout__Items">
                            <div class="Polaris-FormLayout__Item">
                                <div>
                                    <div class="Polaris-Labelled__LabelWrapper">
                                        <div class="Polaris-Label">
                                            <label id="type_1_start_time_label" for="type_1_start_time" class="Polaris-Text--regular">Start time</label>
                                        </div>
                                    </div>
                                    <select id="type_1_start_time" name="time_based_tier[start_time]" class="form-control start_time Polaris-required__Error" aria-invalid="false">
                                        <option value="">Select start time</option>
                                        ${timeOptionHtml}
                                    </select>
                                </div>
                            </div>

                            <div class="Polaris-FormLayout__Item">
                                <div>
                                    <div class="Polaris-Labelled__LabelWrapper">
                                        <div class="Polaris-Label">
                                            <label id="type_1_end_time_label" for="type_1_end_time" class="Polaris-Text--regular">End time</label>
                                        </div>
                                    </div>
                                    <select id="type_1_end_time" name="time_based_tier[end_time]" class="form-control end_time Polaris-required__Error" aria-invalid="false">
                                        <option value="">Select end time</option>
                                        ${timeOptionHtml}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            let dayOptionHtml = '';
            $.each(days, function (key, day) {
                dayOptionHtml += `<option value="${day.value}">${day.title}</option>`
            })

            html = `
                <div class="Polaris-FormLayout">
                    <div role="group" class="Polaris-FormLayout--grouped">
                        <div class="Polaris-FormLayout__Items">
                            <div class="Polaris-FormLayout__Item">
                                <div class="Polaris-FormLayout">
                                    <div class="Polaris-FormLayout__Item">
                                        <div>
                                            <div class="Polaris-Labelled__LabelWrapper">
                                                <div class="Polaris-Label">
                                                    <label id="type_2_start_day_label" for="type_2_start_day" class="Polaris-Text--regular">Start day</label>
                                                </div>
                                            </div>
                                            <select id="type_2_start_day" name="time_based_tier[start][day]" class="form-control start_day Polaris-required__Error" aria-invalid="false">
                                                <option value="">Select start day</option>
                                                ${dayOptionHtml}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="Polaris-FormLayout__Item">
                                        <div>
                                            <div class="Polaris-Labelled__LabelWrapper">
                                                <div class="Polaris-Label">
                                                    <label id="type_2_start_time_label" for="type_2_start_time" class="Polaris-Text--regular">Start time</label>
                                                </div>
                                            </div>
                                            <select id="type_2_start_time" name="time_based_tier[start][time]" class="form-control start_time Polaris-required__Error" aria-invalid="false">
                                                <option value="">Select start time</option>
                                                ${timeOptionHtml}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="Polaris-FormLayout__Item">
                                <div class="Polaris-FormLayout">
                                    <div class="Polaris-FormLayout__Item">
                                        <div>
                                            <div class="Polaris-Labelled__LabelWrapper">
                                                <div class="Polaris-Label">
                                                    <label id="type_2_end_daylabel" for="type_2_end_day" class="Polaris-Text--regular">End day</label>
                                                </div>
                                            </div>
                                            <select id="type_2_end_day" name="time_based_tier[end][day]" class="form-control end_day Polaris-required__Error" aria-invalid="false">
                                            <option value="">Select end day</option>
                                                ${dayOptionHtml}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="Polaris-FormLayout__Item">
                                        <div>
                                            <div class="Polaris-Labelled__LabelWrapper">
                                                <div class="Polaris-Label">
                                                    <label id="type_2_end_time_label" for="type_2_end_time" class="Polaris-Text--regular">End time</label>
                                                </div>
                                            </div>
                                            <select id="type_2_end_time" name="time_based_tier[end][time]" class="form-control end_time Polaris-required__Error" aria-invalid="false">
                                                <option value="">Select end time</option>
                                                ${timeOptionHtml}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        $('#time_based_tier_content').html('');
        $('#time_based_tier_content').html(html);

        initializeSelect2();
    });

    $(document).on('click', 'button.time_based_form_save_btn', function (e) {
        // $(".on-click-disable").attr("disabled", true);
        e.preventDefault();

        const formData = $("#time_based_tier_form").serializeArray();

        $error = checkValidations();

        if (!$error) {
            LoaderStart();

            $.ajax({
                url: $("#time_based_tier_form").attr('action'), type: "POST", data: formData,

                success: function (response) {
                    // console.log(response);
                    LoaderStop();

                    if (response.status === 200) {
                        ToastNotice(response.message)
                        pageReload();
                    } else {
                        ToastNotice(response.message, true)
                    }
                }, error: function (response) {
                    ToastNotice(response.message, true)
                }
            });
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });
    // ==========>          TIME BASED TIER END         <==========

    $(document).on('click', 'button.save_e2_rules_btn', function (e) {
        e.preventDefault();

        const formData = $("#e2_rule_form").serializeArray();

        $error = checkValidations();

        if (!$error) {
            LoaderStart();

            $.ajax({
                url: $("#e2_rule_form").attr('action'), type: "POST", data: formData,

                success: function (response) {
                    LoaderStop();
                    // console.log(response)

                    if (response.status === 200) {
                        ToastNotice(response.message)
                        pageReload();
                    } else {
                        ToastNotice(response.message, true);
                    }
                }, error: function (response) {
                    ToastNotice(response.message, true);
                }
            });
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });

    $(document).on('click', '#toggle_delivery_include_popup_button', function (e) {
        // console.log($("#delivery_include").val());
        $("#delivery_include_popover_div").toggle();
    });

    $(document).on('click', '#toggle_e_delivery_include_popup_button', function (e) {
        // console.log($("#delivery_include").val());
        $("#e_delivery_include_popover_div").toggle();
    });

    $(document).on('click', '.delivery_include', function (e) {
        e.preventDefault();

        $("#delivery_include_popover_div").toggle();

        const This = $(this);
        const val = This.val();
        $("#delivery_include").val(val);

        const title = $("#delivery_include_title_" + val).html();
        $("#delivery_include_btn_title").html(title);
        // console.log(val, title, $("#delivery_include").val());


        if (val == 3 || val == 4 || val == 5) {
            $("#delivery_method_main_div").hide();
            $("#delivery_method").removeClass('Polaris-required__Error');
        } else {
            $("#delivery_method_main_div").show();
            $("#delivery_method").addClass('Polaris-required__Error');
        }
    });

    $(document).on('click', '.e_delivery_include', function (e) {
        e.preventDefault();

        $("#e_delivery_include_popover_div").toggle();

        const This = $(this);
        const val = This.val();
        $("#e_delivery_include").val(val);

        const title = $("#e_delivery_include_title_" + val).html();
        $("#e_delivery_include_btn_title").html(title);

        if (val == 3 || val == 4 || val == 5) {
            $("#e_delivery_method_main_div").hide();
            // $("#delivery_method").removeClass('Polaris-required__Error');
        } else {
            $("#e_delivery_method_main_div").show();
            // $("#delivery_method").addClass('Polaris-required__Error');
        }
    });

    $('input[name="condition_type"]').change(function (e) {
        e.preventDefault();
        const discount_type = $(this).val();
        $(".prefix").text(discount_type);

        let conditionTitle = discount_type == "and" ? "All" : "Any";
        $(".condition_title").text(conditionTitle);
    });

    $('input[name="hide_always"]').change(function (e) {
        const This = $(this);

        if (This.val() == '0') {
            $(".always_selected_div").show();
            $(".rule_type").addClass("Polaris-required__Error");
            $(".rule_condition").addClass("Polaris-required__Error");
            $(".rule_value").addClass("Polaris-required__Error");
        } else {
            $(".always_selected_div").hide();
            $(".rule_type").removeClass("Polaris-required__Error");
            $(".rule_condition").removeClass("Polaris-required__Error");
            $(".rule_value").removeClass("Polaris-required__Error");
        }
    });

    $(document).on('change', 'input[name="collection_qty_check"]', function (e) {
        e.preventDefault();

        let collectionQtyHtml = '';
        if (this.checked) {
            collectionQtyHtml = `<div id="collection_qty_div">
                                    <div class="Polaris-FormLayout">
                                        <div role="group" class="Polaris-FormLayout--condensed">
                                            <div class="Polaris-FormLayout__Items">
                                                <div class="Polaris-FormLayout__Item">
                                                    <div class="">
                                                        <div class="Polaris-Connected">
                                                            <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                                <div class="Polaris-TextField">
                                                                    <input id="collection_qty" name="collection_qty" autocomplete="off" class="Polaris-TextField__Input" type="number" aria-labelledby="PolarisTextField1Label" aria-invalid="false" value="">
                                                                    <div class="Polaris-TextField__Backdrop">
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="Polaris-FormLayout__Item">
                                                    <div class="Polaris-Bleed" style="--pc-bleed-margin-block-end-xs:var(--p-space-0);--pc-bleed-margin-inline-start-xs:var(--p-space-0);--pc-bleed-margin-inline-end-xs:var(--p-space-0)">
                                                        <label class="Polaris-Choice" for="per_collection">
                                                            <span class="Polaris-Choice__Control">
                                                                <span class="Polaris-RadioButton">
                                                                    <input id="per_collection" name="collection_qty_condition" type="radio" class="Polaris-RadioButton__Input" checked value="1">
                                                                    <span class="Polaris-RadioButton__Backdrop"></span>
                                                                </span>
                                                            </span>
                                                            <span class="Polaris-Choice__Label"><span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">Per Collection</span></span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="Polaris-FormLayout__Item">
                                                    <div class="Polaris-Bleed" style="--pc-bleed-margin-block-end-xs:var(--p-space-0);--pc-bleed-margin-inline-start-xs:var(--p-space-0);--pc-bleed-margin-inline-end-xs:var(--p-space-0)">
                                                        <label class="Polaris-Choice" for="per_line_item">
                                                            <span class="Polaris-Choice__Control">
                                                                <span class="Polaris-RadioButton">
                                                                    <input id="per_line_item" name="collection_qty_condition" type="radio" class="Polaris-RadioButton__Input" value="2">
                                                                    <span class="Polaris-RadioButton__Backdrop"></span>
                                                                </span>
                                                            </span>
                                                            <span class="Polaris-Choice__Label"><span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">Per Line Item</span></span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
        } else {
            $("#collection_qty_div").remove();
        }

        $(this).parents('#collection_qty_main_div').append(collectionQtyHtml);
    });

    initializeSelect2();

    let totalLength = 12;
    // if ($("#append_rules").data("extension_type") == 3) {
    //     totalLength = 19;
    // } else
    if ($("#append_rules").data("extension_type") == 5) {
        totalLength = 9;
    } else if ($("#append_rules").data("extension_type") == 6) {
        totalLength = 12;
    } else if ($("#append_rules").data("extension_type") == 7) {
        totalLength = 2;
    }

    if ($("#append_rules").data("extension_type") != 3){
        if ($(".rule_rows").length >= totalLength) {
            $('#add_condition_div').hide();
        }
    }

    let i = $(".rule_rows").length - 1;
    let counter = 0;

    /*handle - add new rule of delivery customization with validations*/
    $(document).on('click', '#add_condition', function (e) {
        e.preventDefault();

        const beforeAppendRowSelectedRuleTypes = getSelectedRuleTypes();

        removeErrorMessages();
        $(".rule_rows").each(function (i, el) {
            removeErrorMessages();

            if ($(el).find(".ext6_tier_rule_type").val() == "" || $(el).find(".rule_condition").val() == "" || $(el).find(".rule_value").val() == "" || $(el).find(".rule_value_key").val() == "" || $(el).find(".end_range").val() == "" || $(el).find(".start_range").val() == "") {
                checkValidations();

                ToastNotice("Required fields are missing OR Invalid Input added!", true);
                counter = 0;
                return false;
            } else {
                if (($(el).find(".end_range").val() && $(el).find(".start_range").val() && (parseFloat($(el).find(".start_range").val()) >= parseFloat($(el).find(".end_range").val())))) {
                    showErrorBanner();
                    $(el).find(".end_range").parent().addClass('Polaris-TextField--error');
                    $(el).find(".end_range").closest('.Polaris-FormLayout__Item').append(fieldError('End range must be greater than End Range.'));

                    ToastNotice("Required fields are missing OR Invalid Input added!", true);
                    counter = 0;
                    return false;
                }
                counter = 1;
            }
        });

        // $error = checkValidations();
        //
        // if (!$error) {
        //     counter = 1;
        // } else {
        //     ToastNotice("Required fields are missing OR Invalid Input added!", true);
        //     counter = 0;
        // }

        if (counter == 1) {
            i++;
            let checked = $('input[name="condition_type"]:checked').val();
            if ($("#append_rules").data("extension_type") == 7) {
                checked = 'or';
            }

            let typeOptionsHtml = "";
            if ($("#append_rules").data("extension_type") == 3) {
                typeOptionsHtml = `
                    <optgroup label="Cart Details">
                        <option value="0">Total Amount</option>
                        <option value="1">Subtotal Amount</option>
                        <option value="17">Total Quantity</option>
                        <option value="18">Total Discount</option>
                        <option value="24">Discount Percentage</option>
                    </optgroup>
                    <optgroup label="Cart Has Any Items">
                        <option value="16">Choose Collection</option>
                        <option value="28">Collection Total</option>
                        <option value="31">Variant Title</option>
                        <option value="19">Any cost per line item (multiply qty)</option>
                        <option value="25">Any cost per line item (each qty)</option>
                        <option value="26">All line items(multiply qty)</option>
                        <option value="27">All line items(each qty)</option>
                    </optgroup>
                    <optgroup label="Address">
                        <option value="8">Country</option>
                        <option value="10">Zip Code / Postal Code</option>
                        <option value="12">Address Line</option>
                    </optgroup>
                    <optgroup label="Customer">
                        <option value="13">Customer tags</option>
                    </optgroup>
                    <optgroup label="Date / Time">
                        <option value="36">Date</option>
                        <option value="37">Day of Week</option>
                        <option value="38" ${beforeAppendRowSelectedRuleTypes.includes("38") ? "disabled" : ""} ${beforeAppendRowSelectedRuleTypes.includes("39") ? "disabled" : ""}>Time</option>
                        <option value="39" ${beforeAppendRowSelectedRuleTypes.includes("39") ? "disabled" : ""} ${beforeAppendRowSelectedRuleTypes.includes("38") ? "disabled" : ""}>Between Day & Time</option>
                    </optgroup>
                `;
            } else if ($("#append_rules").data("extension_type") == 5) {
                typeOptionsHtml = `
                    <optgroup label="Cart Details">
                        <option value="0" ${beforeAppendRowSelectedRuleTypes.includes("0") ? "disabled" : ""}>Total Amount</option>
                        <option value="1" ${beforeAppendRowSelectedRuleTypes.includes("1") ? "disabled" : ""}>Subtotal Amount</option>
                        <option value="2" ${beforeAppendRowSelectedRuleTypes.includes("2") ? "disabled" : ""}>Total Weight</option>
                        <!--<option value="17" ${beforeAppendRowSelectedRuleTypes.includes("17") ? "disabled" : ""}>Total Quantity</option>-->
                    </optgroup>
                    <optgroup label="Cart Has Any Items">
                        <option value="3" ${beforeAppendRowSelectedRuleTypes.includes("3") ? "disabled" : ""}>SKU</option>
                        <!--<option value="4" ${beforeAppendRowSelectedRuleTypes.includes("4") ? "disabled" : ""}>Specific Product / Product ID</option>-->
                        <option value="16" ${beforeAppendRowSelectedRuleTypes.includes("16") ? "disabled" : ""}>Choose Collection</option>
                        <!--<option value="5" ${beforeAppendRowSelectedRuleTypes.includes("5") ? "disabled" : ""}>Product Type</option>-->
                        <!--<option value="6" ${beforeAppendRowSelectedRuleTypes.includes("6") ? "disabled" : ""}>Product Vendor</option>-->
                        <!--<option value="7" ${beforeAppendRowSelectedRuleTypes.includes("7") ? "disabled" : ""}>Product Has Tag</option>-->
                    </optgroup>
                    <optgroup label="Address">
                        <option value="8" ${beforeAppendRowSelectedRuleTypes.includes("8") ? "disabled" : ""}>Country</option>
                        <option value="9" ${beforeAppendRowSelectedRuleTypes.includes("9") ? "disabled" : ""}>Province Code / State Code</option>
                        <option value="10" ${beforeAppendRowSelectedRuleTypes.includes("10") ? "disabled" : ""}>Zip Code / Postal Code</option>
                        <!--<option value="11" ${beforeAppendRowSelectedRuleTypes.includes("11") ? "disabled" : ""}>City / Area</option>-->
                        <!--<option value="12" ${beforeAppendRowSelectedRuleTypes.includes("12") ? "disabled" : ""}>Address Line</option>-->
                    </optgroup>
                    <optgroup label="Customer">
                        <option value="13" ${beforeAppendRowSelectedRuleTypes.includes("13") ? "disabled" : ""}>Customer tags</option>
                        <!--<option value="14" ${beforeAppendRowSelectedRuleTypes.includes("14") ? "disabled" : ""}>Total Spend</option>-->
                        <!--<option value="15" ${beforeAppendRowSelectedRuleTypes.includes("15") ? "disabled" : ""}>Total Order</option>-->
                    </optgroup>
                `;
            } else if ($("#append_rules").data("extension_type") == 6) {
                typeOptionsHtml = `
                    <option value="0" ${beforeAppendRowSelectedRuleTypes.includes("0") ? "disabled" : ""}>Total Amount</option>
                    <option value="16" ${beforeAppendRowSelectedRuleTypes.includes("16") ? "disabled" : ""}>Choose Collection</option>
                    <option value="20" ${beforeAppendRowSelectedRuleTypes.includes("20") ? "disabled" : ""}>Cart Attribute</option>
                    <option value="21" ${beforeAppendRowSelectedRuleTypes.includes("21") ? "disabled" : ""}>Line Property</option>
                    <option value="22" ${beforeAppendRowSelectedRuleTypes.includes("22") ? "disabled" : ""}>B2B Company name</option>
                    <option value="23" ${beforeAppendRowSelectedRuleTypes.includes("23") ? "disabled" : ""}>Locale / language</option>
                    <option value="31" ${beforeAppendRowSelectedRuleTypes.includes("31") ? "disabled" : ""}>Variant Title</option>
                    <option value="32" ${beforeAppendRowSelectedRuleTypes.includes("32") ? "disabled" : ""}>Subscription Id</option>
                    <optgroup label="Metafield">
                        <option value="33" ${beforeAppendRowSelectedRuleTypes.includes("33") ? "disabled" : ""}>Variant metafield</option>
                        <option value="34" ${beforeAppendRowSelectedRuleTypes.includes("34") ? "disabled" : ""}>Product metafield</option>
                    </optgroup>
                    <option value="9" ${beforeAppendRowSelectedRuleTypes.includes("9") ? "disabled" : ""}>Province Code / State Code</option>
                    <option value="10" ${beforeAppendRowSelectedRuleTypes.includes("10") ? "disabled" : ""}>Zip Code / Postal Code</option>
                `;
            } else if ($("#append_rules").data("extension_type") == 7) {
                typeOptionsHtml = `
                    <option value="8" ${beforeAppendRowSelectedRuleTypes.includes("8") ? "disabled" : ""}>Country</option>
                    <option value="20" ${beforeAppendRowSelectedRuleTypes.includes("20") ? "disabled" : ""}>Cart Attribute</option>
                `;
            } else {
                typeOptionsHtml = `
                    <optgroup label="Cart Details">
                        <option value="0" ${beforeAppendRowSelectedRuleTypes.includes("0") ? "disabled" : ""}>Total Amount</option>
                        <option value="1" ${beforeAppendRowSelectedRuleTypes.includes("1") ? "disabled" : ""}>Subtotal Amount</option>
                        <option value="2" ${beforeAppendRowSelectedRuleTypes.includes("2") ? "disabled" : ""}>Total Weight</option>
                        <!--<option value="17" ${beforeAppendRowSelectedRuleTypes.includes("17") ? "disabled" : ""}>Total Quantity</option>-->
                    </optgroup>
                    <optgroup label="Cart Has Any Items">
                        <option value="3" ${beforeAppendRowSelectedRuleTypes.includes("3") ? "disabled" : ""}>SKU</option>
                        <!--<option value="4" ${beforeAppendRowSelectedRuleTypes.includes("4") ? "disabled" : ""}>Specific Product / Product ID</option>-->
                        <option value="16" ${beforeAppendRowSelectedRuleTypes.includes("16") ? "disabled" : ""}>Choose Collection</option>
                        <!--<option value="5" ${beforeAppendRowSelectedRuleTypes.includes("5") ? "disabled" : ""}>Product Type</option>-->
                        <!--<option value="6" ${beforeAppendRowSelectedRuleTypes.includes("6") ? "disabled" : ""}>Product Vendor</option>-->
                        <!--<option value="7" ${beforeAppendRowSelectedRuleTypes.includes("7") ? "disabled" : ""}>Product Has Tag</option>-->
                    </optgroup>
                    <optgroup label="Address">
                        <option value="8" ${beforeAppendRowSelectedRuleTypes.includes("8") ? "disabled" : ""}>Country</option>
                        <option value="9" ${beforeAppendRowSelectedRuleTypes.includes("9") ? "disabled" : ""}>Province Code / State Code</option>
                        <option value="10" ${beforeAppendRowSelectedRuleTypes.includes("10") ? "disabled" : ""}>Zip Code / Postal Code</option>
                        <option value="11" ${beforeAppendRowSelectedRuleTypes.includes("11") ? "disabled" : ""}>City / Area</option>
                        <option value="12" ${beforeAppendRowSelectedRuleTypes.includes("12") ? "disabled" : ""}>Address Line</option>
                    </optgroup>
                    <optgroup label="Customer">
                        <option value="13" ${beforeAppendRowSelectedRuleTypes.includes("13") ? "disabled" : ""}>Customer tags</option>
                        <option value="14" ${beforeAppendRowSelectedRuleTypes.includes("14") ? "disabled" : ""}>Total Spend</option>
                        <!--<option value="15" ${beforeAppendRowSelectedRuleTypes.includes("15") ? "disabled" : ""}>Total Order</option>-->
                    </optgroup>
                `;
            }
            const itemRow = `
                <div class="rule_rows" id="${i}">
                    <div class="Polaris-FormLayout__Items product_remove_list cs_divider line_divider" id="condition_type_row_${i}">
                         <div class="Polaris-FormLayout__Item">
                             <span class="seperator-line prefix">${checked}</span>
                         </div>
                    </div>
                    <div class="delivery_rule_wrapper">
                        <div class="delete_button">
                            <a href="javascript:void(0)" onclick="deleteRuleRow(${i})" title="Remove">
                                <span>
                                    <svg fill="white" viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true" height="15px" width="15px">
                                        <path d="M8 3.994c0-1.101.895-1.994 2-1.994s2 .893 2 1.994h4c.552 0 1 .446 1 .997a1 1 0 0 1-1 .997h-12c-.552 0-1-.447-1-.997s.448-.997 1-.997h4zm-3 10.514v-6.508h2v6.508a.5.5 0 0 0 .5.498h1.5v-7.006h2v7.006h1.5a.5.5 0 0 0 .5-.498v-6.508h2v6.508a2.496 2.496 0 0 1-2.5 2.492h-5c-1.38 0-2.5-1.116-2.5-2.492z"></path>
                                    </svg>
                                </span>
                            </a>
                        </div>
                        <div class="Polaris-FormLayout">
                            <div role="group" class="Polaris-FormLayout--grouped">
                                <div class="Polaris-FormLayout__Items">
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-Select">
                                                <select id="rule_type_${i}" name="rule[${i}][type]" class="Polaris-Select__Input rule_type Polaris-required__Error" aria-invalid="false">
                                                    <option value="" selected>Select Rule Type</option>
                                                    ${typeOptionsHtml}
                                                </select>
                                                <div class="Polaris-Select__Content" aria-hidden="true">
                                                    <span class="Polaris-Select__SelectedOption">Select Rule Type</span>
                                                    <span class="Polaris-Select__Icon">
                                                        <span class="Polaris-Icon">
                                                              <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                              <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                        </span>
                                                    </span>
                                                </div>
                                                <div class="Polaris-Select__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-Select">
                                                <select id="rule_condition_${i}" name="rule[${i}][condition]" class="Polaris-Select__Input rule_condition Polaris-required__Error" aria-invalid="false">
                                                    <option value="" selected>Select Rule Condition</option>
                                                    <option value="0">Greater than or equals</option>
                                                    <option value="1">Less than or equals</option>
                                                </select>
                                                <div class="Polaris-Select__Content" aria-hidden="true">
                                                    <span class="Polaris-Select__SelectedOption option_text">Select Rule Condition</span>
                                                    <span class="Polaris-Select__Icon">
                                                        <span class="Polaris-Icon">
                                                            <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                            <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                        </span>
                                                    </span>
                                                </div>
                                                <div class="Polaris-Select__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-Connected">
                                                <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                    <div class="rule_value_div">
                                                        <div class="Polaris-TextField">
                                                            <input type="number" id="rule_value_${i}" name="rule[${i}][value]" class="Polaris-TextField__Input rule_value Polaris-required__Error div-tagInput">
                                                            <div class="Polaris-TextField__Backdrop removeTagInput"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="extra_fields_wrapper" class="extra_fields_wrapper"></div>
                        </div>
                    </div>
                </div>
            `;

            $("#append_rules").append(itemRow);
            hideShowDeleteRuleBtn();
        }
    });

    $(document).on('change', '.rule_type', function (e) {
        const currentSelectedRuleType = $(this).val();
        const selectedRuleTypeIndex = $(this).parents('.rule_rows').attr('id');

        disabledSelectedRuleTypesInEachSelectBoxAndHideShowAddRuleButton();

        let options = '<option value="" disabled>Select Rule Condition</option>';

        let ruleTypeHtml = `<div class="Polaris-TextField">
                                        <input type="text" data-role="tagsinput" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input rule_value Polaris-required__Error inputtag">
                                    </div>`;

        // if (currentSelectedRuleType == '0' || currentSelectedRuleType == '1' || currentSelectedRuleType == '2' || currentSelectedRuleType == '14' || currentSelectedRuleType == '17' || currentSelectedRuleType == '18' || currentSelectedRuleType == '19' || currentSelectedRuleType == '24' || currentSelectedRuleType == '25' || currentSelectedRuleType == '26' || currentSelectedRuleType == '27') {
        if ($.inArray(currentSelectedRuleType, ['0', '1', '2', '14', '17', '18', '19', '24', '25', '26', '27', '38']) >= 0) {
            // '0','1','2','14','15'
            let Class = "price_input";
            options += `<option value="0" selected>Greater than or equals</option>
                        <option value="1">Less than or equals</option>`;

            // if ($("#append_rules").data("extension_type") == 3 && (currentSelectedRuleType == '0' || currentSelectedRuleType == '1' || currentSelectedRuleType == '18' || currentSelectedRuleType == '24')) {
            if ($("#append_rules").data("extension_type") == 3 && ($.inArray(currentSelectedRuleType, ['0', '1', '18', '24', '38']) >= 0)) {
                options += `<option value="6" >Between</option>`;
                Class = 'price_input_allow_dash';
            }

            ruleTypeHtml = `<div class="Polaris-TextField">
                                <input type="text" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input rule_value Polaris-required__Error  ${Class}">
                                <div class="Polaris-TextField__Backdrop"></div>
                            </div>`
            // } else if (currentSelectedRuleType == '3' || currentSelectedRuleType == '8' || currentSelectedRuleType == '9' || currentSelectedRuleType == '10' || currentSelectedRuleType == '11' || currentSelectedRuleType == '12' || currentSelectedRuleType == '13' || currentSelectedRuleType == '16' || currentSelectedRuleType == '28' || currentSelectedRuleType == '20' || currentSelectedRuleType == '21' || currentSelectedRuleType == '22' || currentSelectedRuleType == '23' || currentSelectedRuleType == '29' || currentSelectedRuleType == '30' || currentSelectedRuleType == '31' || currentSelectedRuleType == '32' || currentSelectedRuleType == '33' || currentSelectedRuleType == '34') {
        } else if ($.inArray(currentSelectedRuleType, ['3', '8', '9', '10', '11', '12', '13', '16', '20', '21', '22', '23', '28', '29', '30', '31', '32', '33', '34', '36', '37', '39']) >= 0) {
            // '3','4','5','6','7','8','9','11','12','13','16'
            options += `
                <option value="2" selected>Contains</option>
                <option value="3">Does not contains</option>
            `;
            if ($("#append_rules").data("extension_type") === 3 && currentSelectedRuleType === '31') {
                options += `
                    <option value="9">Contains all</option>
                    <option value="10">Does not contains all</option>
                    <option value="11">Equals to</option>
                    <option value="12">Does not equals to</option>
                `;
            }

            // if ($("#append_rules").data("extension_type") == 1 && currentSelectedRuleType == '16') {
            if (($.inArray($("#append_rules").data("extension_type"), [1, 5]) >= 0) && currentSelectedRuleType === '16') {
                options += `<option value="9">Contains all</option>`;
            }
            // if ($("#append_rules").data("extension_type") == 5 && currentSelectedRuleType == '16') {
            //     options += `<option value="9">Contains all</option>`;
            // }

            // if ($("#append_rules").data("extension_type") == 6 && (currentSelectedRuleType == '20' || currentSelectedRuleType == '21' || currentSelectedRuleType == '22' || currentSelectedRuleType == '32' || currentSelectedRuleType == '33' || currentSelectedRuleType == '34')) {
            if (($("#append_rules").data("extension_type") == 6 || $("#append_rules").data("extension_type") == 7) && ($.inArray(currentSelectedRuleType, ['20', '21', '22', '32', '33', '34']) >= 0)) {
                options += `<option value="7">Has any value</option>
                            <option value="8">Is Null</option>`;

                // if (currentSelectedRuleType == '21' || currentSelectedRuleType == '32' || currentSelectedRuleType == '33' || currentSelectedRuleType == '34') {
                if ($.inArray(currentSelectedRuleType, ['21', '32', '33', '34']) >= 0) {
                    options += `<option value="13">Is Null All</option>`;
                }
                // if (currentSelectedRuleType == '33' || currentSelectedRuleType == '34') {
                if ($.inArray(currentSelectedRuleType, ['33', '34']) >= 0) {
                    options += `
                        <option value="0">Greater than or equals</option>
                        <option value="1">Less than or equals</option>
                    `;
                }
                if (currentSelectedRuleType === '21') {
                    options += `<option value="9">Contains all</option>`;
                }
                if ($.inArray(currentSelectedRuleType, ['21', '32', '33', '34']) >= 0) {
                    options += `<option value="10">Does not contains all</option>`;
                }
            }
            if ($("#append_rules").data("extension_type") == 6 && currentSelectedRuleType == '31') {
                options += `
                    <option value="10">Does not contains all</option>
                `;
            }
        }
        $(this).parents('.Polaris-FormLayout__Items').find('.rule_condition').html(options).prop("selectedIndex", 1).trigger('change');
        // $(this).parents('.Polaris-FormLayout__Items').find('.rule_condition').prop("selectedIndex", 1).trigger('change');

        $(this).parents('.delivery_rule_wrapper').find('#collection_qty_main_div').remove();

        let totalByCollectionHtml = ``;

        if (currentSelectedRuleType === '2') {
            const weightUnit = $("#append_rules").data("weight_unit")
            ruleTypeHtml = `
                <div class="Polaris-TextField">
                    <input type="text" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input rule_value Polaris-required__Error price_input">
                    <div class="Polaris-TextField__Backdrop"></div>
                </div>
                <div class="Polaris-Labelled__HelpText" id="PolarisTextField1HelpText">
                    <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--break Polaris-Text--subdued">
                        <span>Please enter weight in <strong>${weightUnit}</strong>.</span>
                    </span>
                </div>
            `;
        } else if (currentSelectedRuleType === '18') {
            ruleTypeHtml = `<div class="Polaris-TextField ">
                                <input type="text" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input rule_value Polaris-required__Error price_input">
                                <div class="Polaris-TextField__Backdrop"></div>
                            </div>
                            <p class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--subdued">
                                <i>Currently Shopify does not provide tax amounts, so a total discount only works if you have "included tax in prices". (Once we get an update from Shopify, It will be fixed.)</i>
                            </p>`;
        }
            // else if (currentSelectedRuleType == '4') {
            //     ruleTypeHtml = `<div class="Polaris-TextField product_id_div">
            //                         <input type="text" data-role="tagsinput" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input rule_value Polaris-required__Error open_product_picker inputtag">
            //                     </div>`;
        // }
        else if (currentSelectedRuleType === '16' || currentSelectedRuleType === '28') {
            ruleTypeHtml = `
                <div class="Polaris-TextField collection_id_div" data-id="rule_value_${selectedRuleTypeIndex}">
                    <input type="text" data-role="tagsinput" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" data-selected_collections="[]" class="Polaris-TextField__Input rule_value Polaris-required__Error open_collection_picker inputtag">
                </div>
            `;

            if (currentSelectedRuleType === '28') {
                totalByCollectionHtml = `
                    <div role="group" class="Polaris-FormLayout--grouped">
                        <div class="Polaris-FormLayout__Items">
                            <div class="Polaris-FormLayout__Item">
                                <div class="">
                                    <div class="Polaris-Select">
                                        <select id="collection_total_condition_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][collection_total_condition]" class="Polaris-Select__Input Polaris-required__Error" aria-invalid="false">
                                            <option value="0" selected>Greater than or equals</option>
                                            <option value="1">Less than or equals</option>
                                        </select>
                                        <div class="Polaris-Select__Content" aria-hidden="true">
                                            <span class="Polaris-Select__SelectedOption">Greater than or equals</span>
                                            <span class="Polaris-Select__Icon">
                                                <span class="Polaris-Icon">
                                                      <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
                                                      <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M7.676 9h4.648c.563 0 .879-.603.53-1.014l-2.323-2.746a.708.708 0 0 0-1.062 0l-2.324 2.746c-.347.411-.032 1.014.531 1.014Zm4.648 2h-4.648c-.563 0-.878.603-.53 1.014l2.323 2.746c.27.32.792.32 1.062 0l2.323-2.746c.349-.411.033-1.014-.53-1.014Z"></path></svg>
                                                </span>
                                            </span>
                                        </div>
                                        <div class="Polaris-Select__Backdrop">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="Polaris-FormLayout__Item">
                                <div class="">
                                    <div class="Polaris-Connected">
                                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                            <div class="Polaris-TextField">
                                                <input type="number" id="collection_total_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][collection_total_value]" autocomplete="off" class="Polaris-TextField__Input Polaris-required__Error" value="" placeholder="Amount">
                                                <div class="Polaris-TextField__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }

            // const collectionQtyHtml = `<div id="collection_qty_main_div">
            //                                 <div id="check_qty_div">
            //                                     <label class="Polaris-Choice" for="collection_qty_check">
            //                                         <span class="Polaris-Choice__Control">
            //                                             <span class="Polaris-Checkbox">
            //                                                 <input id="collection_qty_check" name="collection_qty_check" type="checkbox" class="Polaris-Checkbox__Input" aria-invalid="false" role="checkbox" aria-checked="false" value="1">
            //                                                 <span class="Polaris-Checkbox__Backdrop"></span>
            //                                                 <span class="Polaris-Checkbox__Icon">
            //                                                     <span class="Polaris-Icon">
            //                                                         <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
            //                                                         <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M14.723 6.237a.94.94 0 0 1 .053 1.277l-5.366 6.193a.834.834 0 0 1-.611.293.83.83 0 0 1-.622-.264l-2.927-3.097a.94.94 0 0 1 0-1.278.82.82 0 0 1 1.207 0l2.297 2.43 4.763-5.498a.821.821 0 0 1 1.206-.056Z"></path></svg>
            //                                                     </span>
            //                                                 </span>
            //                                             </span>
            //                                         </span>
            //                                         <span class="Polaris-Choice__Label">
            //                                         <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">Check quantity with this collection</span>
            //                                         </span>
            //                                     </label>
            //                                 </div>
            //                            </div>`;
            //
            // $(this).parents('.delivery_rule_wrapper').append(collectionQtyHtml);
        } else if (currentSelectedRuleType === '8') {
            const allCountries = $(".all_countries").data("all_countries");
            let allCountriesOptionHtml = "";
            if ($("#append_rules").data("extension_type") === 7) {
                allCountriesOptionHtml = `<option value="_">All</option>`;
            }

            $.each(allCountries, function (code, country) {
                allCountriesOptionHtml += `<option value="${code}">${country}</option>`
            })

            ruleTypeHtml = `
                <div class="Polaris-TextField">
                    <select class="form-control rule_value country_code Polaris-required__Error" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value][]" multiple="multiple">
                    ${allCountriesOptionHtml}
                    </select>
                </div>
            `;
        } else if (currentSelectedRuleType === '38') {
            ruleTypeHtml = `
                <div class="Polaris-FormLayout">
                    <div role="group" class="Polaris-FormLayout--grouped">
                        <div class="Polaris-FormLayout__Items">
                            <div class="Polaris-FormLayout__Item">
                                <div class="">
                                    <div class="Polaris-TextField">
                                        <input type="text" id="rule_value_${selectedRuleTypeIndex}_start_time" name="rule[${selectedRuleTypeIndex}][value][start_time]" class="Polaris-TextField__Input rule_value time_picker start_time_picker Polaris-required__Error" placeholder="Select start time">
                                        <div class="Polaris-TextField__Backdrop"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="Polaris-FormLayout__Item hide_element">
                                <div class="">
                                    <div class="Polaris-TextField">
                                        <input type="text" id="rule_value_${selectedRuleTypeIndex}_end_time" name="rule[${selectedRuleTypeIndex}][value][end_time]" class="Polaris-TextField__Input time_picker end_time_picker" placeholder="Select end time">
                                        <div class="Polaris-TextField__Backdrop"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (currentSelectedRuleType === '39') {
            const allDays = $("#append_rules").data("day_of_week");
            let allDaysOptionHtml = "";

            $.each(allDays, function (code, day) {
                allDaysOptionHtml += `<option value="${code}">${day}</option>`
            })

            ruleTypeHtml = `
                <div class="Polaris-FormLayout">
                    <div role="group" class="Polaris-FormLayout--grouped">
                        <div class="Polaris-FormLayout__Items">
                            <div class="Polaris-FormLayout__Item">
                                <div class="">
                                    <div class="Polaris-TextField">
                                        <select id="rule_value_${selectedRuleTypeIndex}_start_day" name="rule[${selectedRuleTypeIndex}][value][start_day]" class="form-control rule_value start_day Polaris-required__Error">
                                            <option value="">Select start day</option>
                                            ${allDaysOptionHtml}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="Polaris-FormLayout__Item">
                                <div class="">
                                    <div class="Polaris-TextField">
                                        <select id="rule_value_${selectedRuleTypeIndex}_end_day" name="rule[${selectedRuleTypeIndex}][value][end_day]" class="form-control rule_value end_day Polaris-required__Error">
                                            <option value="">Select end day</option>
                                            ${allDaysOptionHtml}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="Polaris-FormLayout__Items">
                            <div class="Polaris-FormLayout__Item">
                                <div class="">
                                    <div class="Polaris-TextField">
                                        <input type="text" id="rule_value_${selectedRuleTypeIndex}_start_time" name="rule[${selectedRuleTypeIndex}][value][start_time]" class="Polaris-TextField__Input rule_value time_picker start_time_picker Polaris-required__Error" placeholder="Select start time">
                                        <div class="Polaris-TextField__Backdrop"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="Polaris-FormLayout__Item">
                                <div class="">
                                    <div class="Polaris-TextField">
                                        <input type="text" id="rule_value_${selectedRuleTypeIndex}_end_time" name="rule[${selectedRuleTypeIndex}][value][end_time]" class="Polaris-TextField__Input time_picker rule_value end_time_picker Polaris-required__Error" placeholder="Select end time">
                                        <div class="Polaris-TextField__Backdrop"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (currentSelectedRuleType === '37') {
            const allDays = $("#append_rules").data("day_of_week");
            let allDaysOptionHtml = "";

            $.each(allDays, function (code, day) {
                allDaysOptionHtml += `<option value="${code}">${day}</option>`
            })

            ruleTypeHtml = `
                <div class="Polaris-TextField">
                    <select id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value][]" multiple class="form-control rule_value day_of_week Polaris-required__Error">
                        ${allDaysOptionHtml}
                    </select>
                </div>
            `;
        } else if (currentSelectedRuleType === '36') {
            ruleTypeHtml = `
                <div class="Polaris-TextField date_picker_div">
                    <input type="text" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input rule_value date_picker Polaris-required__Error inputtag date_input_taginput" data-role="tagsinput" autocomplete="off">
<!--                    <div class="Polaris-TextField__Backdrop"></div>-->
                </div>
            `;
        } else if (currentSelectedRuleType === '9') {
            ruleTypeHtml = `
                <div class="Polaris-TextField">
                    <input type="text" data-role="tagsinput" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input rule_value Polaris-required__Error inputtag">
                </div>
                <div class="Polaris-Labelled__HelpText" id="PolarisTextField1HelpText">
                    <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--break Polaris-Text--subdued">
                        <span>You have to add 2 digit province/state code in "<strong>ISO 3166-1 alpha-2</strong>" format. Allow multiple.</span>
                    </span>
                </div>
            `;
        } else if (currentSelectedRuleType === '20' || currentSelectedRuleType === '21') {
            ruleTypeHtml = `
                <div class="Polaris-FormLayout">
                    <div class="Polaris-FormLayout__Item">
                        <div class="">
                            <div class="Polaris-Connected">
                                <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                    <div class="Polaris-TextField">
                                        <input type="text" id="rule_value_key_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][key]" class="Polaris-TextField__Input rule_value_key Polaris-required__Error" autocomplete="off" placeholder="Key" value="">
                                        <div class="Polaris-TextField__Backdrop"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="Polaris-FormLayout__Item">
                        <div class="">
                            <div class="Polaris-Connected">
                                <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                    <div class="Polaris-TextField">
                                        <input type="text" data-role="tagsinput" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input rule_value Polaris-required__Error inputtag">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (currentSelectedRuleType === '33' || currentSelectedRuleType === '34') {
            ruleTypeHtml = `
                <div class="Polaris-FormLayout">
                    <div class="Polaris-FormLayout__Item">
                        <div class="Polaris-FormLayout">
                            <div role="group" class="Polaris-FormLayout--condensed">
                                <div class="Polaris-FormLayout__Items">
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="Polaris-Connected">
                                            <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                <div class="Polaris-TextField">
                                                    <input type="text" translate="no" id="rule_value_namespace_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][namespace]" class="Polaris-TextField__Input rule_value_namespace Polaris-required__Error" autocomplete="off" placeholder="Namespace" value="">
                                                    <div class="Polaris-TextField__Backdrop"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="Polaris-Connected">
                                            <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                <div class="Polaris-TextField">
                                                    <input type="text" translate="no" id="rule_value_key_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][key]" class="Polaris-TextField__Input rule_value_key Polaris-required__Error" autocomplete="off" placeholder="Key" value="">
                                                    <div class="Polaris-TextField__Backdrop"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="Polaris-FormLayout__Item">
                        <div class="">
                            <div class="Polaris-Connected">
                                <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                    <div class="Polaris-TextField">
                                        <input type="text" translate="no" data-role="tagsinput" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input rule_value Polaris-required__Error inputtag">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (currentSelectedRuleType === '22') {
            ruleTypeHtml += `
                <p class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--subdued">
                    <i>Company name must be exact with case-sensitive.</i>
                </p>
            `;
        } else if (currentSelectedRuleType === '23') {
            const allLanguages = $(".all_languages").data("all_languages");
            let allLanguagesOptionHtml = "";

            $.each(allLanguages, function (code, language) {
                allLanguagesOptionHtml += `<option value="${code}">${language}</option>`
            });

            ruleTypeHtml = `
                <div class="Polaris-TextField">
                    <select class="form-control rule_value language_code Polaris-required__Error" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value][]" multiple="multiple">
                    ${allLanguagesOptionHtml}
                    </select>
                </div>
            `;
        } else if (currentSelectedRuleType === '10') {
            ruleTypeHtml += `
                <p class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--subdued">
                    <i>Please add a '*' sign to compare the start with. ex. 123*, H1H*, 3*</i>
                </p>
            `;
        }

        $(this).parents('.Polaris-FormLayout__Items').find(".rule_value_div").html(ruleTypeHtml);
        $(this).parents('.Polaris-FormLayout').find('.extra_fields_wrapper').html(totalByCollectionHtml);

        bootstrapTagsInputReinitialize();

        initializeSelect2();
        initializeDatePicker();
        initializeTimePicker();
    });

    $(document).on('keypress', '.price_input_allow_dash', function (event) {
        if (event.which != 61 && event.which != 46 && ((event.which < 48 || event.which > 57) && (event.which != 0 && event.which != 8))) {
            event.preventDefault();
        }
    });

    $(document).on('change', '.rule_condition', function (e) {

        let ruleTypeHtml;
        const currentSelectedRuleValue = $(this).val();
        const currentSelectedRuleType = $(this).closest('.rule_rows').find('.rule_type').val();
        const selectedRuleTypeIndex = $(this).closest('.rule_rows').attr('id');

        // if (currentSelectedRuleType == '0' || currentSelectedRuleType == '1' || currentSelectedRuleType == '18' || currentSelectedRuleType == '24') {
        if ($.inArray(currentSelectedRuleType, ['0', '1', '18', '24']) >= 0) {
            //$(this).closest('.Polaris-FormLayout__Items').find('.between-input-div').remove();
            ruleTypeHtml = `
                <div class="Polaris-TextField ">
                    <input type="text" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input rule_value Polaris-required__Error price_input">
                    <div class="Polaris-TextField__Backdrop"></div>
                </div>
            `;
            if (currentSelectedRuleValue === '6') {
                ruleTypeHtml = `
                    <div class="Polaris-FormLayout between-input-div">
                        <div role="group" class="Polaris-FormLayout--grouped">
                            <div class="Polaris-FormLayout__Items">
                                <div class="Polaris-FormLayout__Item">
                                    <div class="">
                                        <div class="Polaris-Connected">
                                            <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                <div class="Polaris-TextField">
                                                    <input autocomplete="off" class="Polaris-TextField__Input rule_value Polaris-required__Error Polaris-start_range__Error price_input start_range range_inputs" type="text" placeholder="Start Range" value="">
                                                    <div class="Polaris-TextField__Backdrop"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="Polaris-FormLayout__Item">
                                    <div class="">
                                        <div class="Polaris-Connected">
                                            <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                <div class="Polaris-TextField">
                                                    <input autocomplete="off" class="Polaris-TextField__Input rule_value Polaris-required__Error Polaris-end_range__Error price_input end_range range_inputs" type="text" placeholder="End Range" value="">
                                                    <div class="Polaris-TextField__Backdrop"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <input type="hidden" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input range_value" value="">
                    </div>
                `;
            }

            if (currentSelectedRuleType === '18') {
                ruleTypeHtml += `
                    <p class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--subdued">
                        <i>Currently, Shopify does not provide tax amounts, so a total discount only works if you have "included tax in prices". (Once we get an update from Shopify, It will be fixed.)</i>
                    </p>
                `;
            }

            $(this).parents('.Polaris-FormLayout__Items').find(".rule_value_div").html(ruleTypeHtml);

            bootstrapTagsInputReinitialize();
            initializeSelect2();
        }

        if ($("#append_rules").data("extension_type") === 3) {
            if (currentSelectedRuleType === '38') {
                if (currentSelectedRuleValue === '0') {
                    ruleTypeHtml = `
                        <div class="Polaris-FormLayout">
                            <div role="group" class="Polaris-FormLayout--grouped">
                                <div class="Polaris-FormLayout__Items">
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-TextField">
                                                <input type="text" id="rule_value_${selectedRuleTypeIndex}_start_time" name="rule[${selectedRuleTypeIndex}][value][start_time]" class="Polaris-TextField__Input time_picker start_time_picker rule_value Polaris-required__Error" placeholder="Select start time">
                                                <div class="Polaris-TextField__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="Polaris-FormLayout__Item hide_element">
                                        <div class="">
                                            <div class="Polaris-TextField">
                                                <input type="text" id="rule_value_${selectedRuleTypeIndex}_end_time" name="rule[${selectedRuleTypeIndex}][value][end_time]" class="Polaris-TextField__Input time_picker end_time_picker" placeholder="Select end time">
                                                <div class="Polaris-TextField__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else if (currentSelectedRuleValue === '1') {
                    ruleTypeHtml = `
                        <div class="Polaris-FormLayout">
                            <div role="group" class="Polaris-FormLayout--grouped">
                                <div class="Polaris-FormLayout__Items">
                                    <div class="Polaris-FormLayout__Item hide_element">
                                        <div class="">
                                            <div class="Polaris-TextField">
                                                <input type="text" id="rule_value_${selectedRuleTypeIndex}_start_time" name="rule[${selectedRuleTypeIndex}][value][start_time]" class="Polaris-TextField__Input time_picker start_time_picker" placeholder="Select start time">
                                                <div class="Polaris-TextField__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-TextField">
                                                <input type="text" id="rule_value_${selectedRuleTypeIndex}_end_time" name="rule[${selectedRuleTypeIndex}][value][end_time]" class="Polaris-TextField__Input time_picker end_time_picker rule_value Polaris-required__Error" placeholder="Select end time">
                                                <div class="Polaris-TextField__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    ruleTypeHtml = `
                        <div class="Polaris-FormLayout">
                            <div role="group" class="Polaris-FormLayout--grouped">
                                <div class="Polaris-FormLayout__Items">
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-TextField">
                                                <input type="text" id="rule_value_${selectedRuleTypeIndex}_start_time" name="rule[${selectedRuleTypeIndex}][value][start_time]" class="Polaris-TextField__Input time_picker start_time_picker rule_value Polaris-required__Error" placeholder="Select start time">
                                                <div class="Polaris-TextField__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="Polaris-FormLayout__Item">
                                        <div class="">
                                            <div class="Polaris-TextField">
                                                <input type="text" id="rule_value_${selectedRuleTypeIndex}_end_time" name="rule[${selectedRuleTypeIndex}][value][end_time]" class="Polaris-TextField__Input time_picker end_time_picker rule_value Polaris-required__Error" placeholder="Select end time">
                                                <div class="Polaris-TextField__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            }

            $(this).parents('.Polaris-FormLayout__Items').find(".rule_value_div").html(ruleTypeHtml);

            bootstrapTagsInputReinitialize();
            initializeTimePicker();
        }

        let ruleValueHtml = `
            <div class="Polaris-FormLayout__Item">
                <div class="Polaris-Connected">
                    <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                        <div class="Polaris-TextField">
                            <input type="text" translate="no" data-role="tagsinput" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input rule_value Polaris-required__Error inputtag">
                        </div>
                    </div>
                </div>
            </div>
        `;

        // if (currentSelectedRuleValue == '0' || currentSelectedRuleValue == '1') {
        if ($.inArray(currentSelectedRuleValue, ['0', '1']) >= 0) {
            ruleValueHtml = `
                <div class="Polaris-FormLayout__Item">
                    <div class="Polaris-Connected">
                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                            <div class="Polaris-TextField">
                                <input type="text" translate="no" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input rule_value price_input Polaris-required__Error">
                                <div class="Polaris-TextField__Backdrop"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            // } else if (currentSelectedRuleValue == '7' || currentSelectedRuleValue == '8' || currentSelectedRuleValue == '13') {
        } else if ($.inArray(currentSelectedRuleValue, ['7', '8', '13']) >= 0) {
            ruleValueHtml = `
                <div class="Polaris-FormLayout__Item" style="display: none">
                    <div class="Polaris-Connected">
                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                            <div class="Polaris-TextField">
                                <input type="text" translate="no" data-role="tagsinput" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        if ($("#append_rules").data("extension_type") === 6 || $("#append_rules").data("extension_type") === 7) {
            // if (currentSelectedRuleType == '20' || currentSelectedRuleType == '21') {
            if ($.inArray(currentSelectedRuleType, ['20', '21']) >= 0) {
                // if (currentSelectedRuleValue == '7' || currentSelectedRuleValue == '8' || currentSelectedRuleValue == '13') {
                if ($.inArray(currentSelectedRuleValue, ['7', '8', '13']) >= 0) {
                    ruleTypeHtml = `
                        <div class="Polaris-FormLayout">
                            <div class="Polaris-FormLayout__Item">
                                <div class="">
                                    <div class="Polaris-Connected">
                                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                            <div class="Polaris-TextField">
                                                <input type="text" id="rule_value_key_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][key]" class="Polaris-TextField__Input rule_value_key Polaris-required__Error" autocomplete="off" placeholder="Key" value="">
                                                <div class="Polaris-TextField__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="Polaris-FormLayout__Item" style="display: none">
                                <div class="">
                                    <div class="Polaris-Connected">
                                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                            <div class="Polaris-TextField">
                                                <input type="text" data-role="tagsinput" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    // } else if (currentSelectedRuleValue == '2' || currentSelectedRuleValue == '3') {
                } else if ($.inArray(currentSelectedRuleValue, ['2', '3', '9', '10']) >= 0) {
                    ruleTypeHtml = `
                        <div class="Polaris-FormLayout">
                            <div class="Polaris-FormLayout__Item">
                                <div class="">
                                    <div class="Polaris-Connected">
                                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                            <div class="Polaris-TextField">
                                                <input type="text" id="rule_value_key_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][key]" class="Polaris-TextField__Input rule_value_key Polaris-required__Error" autocomplete="off" placeholder="Key" value="">
                                                <div class="Polaris-TextField__Backdrop"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="Polaris-FormLayout__Item">
                                <div class="">
                                    <div class="Polaris-Connected">
                                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                            <div class="Polaris-TextField">
                                                <input type="text" data-role="tagsinput" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input rule_value Polaris-required__Error inputtag">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            } else if (currentSelectedRuleType === '22') {
                // if (currentSelectedRuleValue == '7' || currentSelectedRuleValue == '8') {
                if ($.inArray(currentSelectedRuleValue, ['7', '8']) >= 0) {
                    ruleTypeHtml = `
                        <div class="Polaris-TextField" style="display: none">
                            <input type="text" data-role="tagsinput" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input inputtag">
                        </div>
                    `;
                    // } else if (currentSelectedRuleValue == '2' || currentSelectedRuleValue == '3') {
                } else if ($.inArray(currentSelectedRuleValue, ['2', '3']) >= 0) {
                    ruleTypeHtml = `
                        <div class="Polaris-TextField">
                            <input type="text" data-role="tagsinput" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input rule_value Polaris-required__Error inputtag">
                        </div>
                        <p class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--subdued">
                            <i>Company name must be exact with case-sensitive.</i>
                        </p>
                    `;
                }
            } else if (currentSelectedRuleType === '32') {
                // if (currentSelectedRuleValue == '7' || currentSelectedRuleValue == '8' || currentSelectedRuleValue == '13') {
                if ($.inArray(currentSelectedRuleValue, ['7', '8', '13']) >= 0) {
                    ruleTypeHtml = `
                        <div class="Polaris-TextField" style="display: none">
                            <input type="text" data-role="tagsinput" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input inputtag">
                        </div>
                    `;
                    // } else if (currentSelectedRuleValue == '2' || currentSelectedRuleValue == '3') {
                } else if ($.inArray(currentSelectedRuleValue, ['2', '3']) >= 0) {
                    ruleTypeHtml = `
                        <div class="Polaris-TextField">
                            <input type="text" data-role="tagsinput" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input rule_value Polaris-required__Error inputtag">
                        </div>
                    `;
                }
                // } else if (currentSelectedRuleType == '33' || currentSelectedRuleType == '34') {
            } else if ($.inArray(currentSelectedRuleType, ['33', '34']) >= 0) {
                // if (currentSelectedRuleValue == '7' || currentSelectedRuleValue == '8' || currentSelectedRuleValue == '13') {
                if ($.inArray(currentSelectedRuleValue, ['7', '8', '13']) >= 0) {
                    ruleTypeHtml = `
                        <div class="Polaris-FormLayout">
                            <div class="Polaris-FormLayout__Item">
                                <div class="Polaris-FormLayout">
                                    <div role="group" class="Polaris-FormLayout--condensed">
                                        <div class="Polaris-FormLayout__Items">
                                            <div class="Polaris-FormLayout__Item">
                                                <div class="Polaris-Connected">
                                                    <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                        <div class="Polaris-TextField">
                                                            <input type="text" translate="no" id="rule_value_namespace_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][namespace]" class="Polaris-TextField__Input rule_value_namespace Polaris-required__Error" autocomplete="off" placeholder="Namespace" value="">
                                                            <div class="Polaris-TextField__Backdrop"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="Polaris-FormLayout__Item">
                                                <div class="Polaris-Connected">
                                                    <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                        <div class="Polaris-TextField">
                                                            <input type="text" translate="no" id="rule_value_key_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][key]" class="Polaris-TextField__Input rule_value_key Polaris-required__Error" autocomplete="off" placeholder="Key" value="">
                                                            <div class="Polaris-TextField__Backdrop"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            ${ruleValueHtml}
                        </div>
                    `;
                    // } else if (currentSelectedRuleValue == '0' || currentSelectedRuleValue == '1' || currentSelectedRuleValue == '2' || currentSelectedRuleValue == '3') {
                } else if ($.inArray(currentSelectedRuleValue, ['0', '1', '2', '3']) >= 0) {
                    ruleTypeHtml = `
                        <div class="Polaris-FormLayout">
                            <div class="Polaris-FormLayout__Item">
                                <div class="Polaris-FormLayout">
                                    <div role="group" class="Polaris-FormLayout--condensed">
                                        <div class="Polaris-FormLayout__Items">
                                            <div class="Polaris-FormLayout__Item">
                                                <div class="Polaris-Connected">
                                                    <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                        <div class="Polaris-TextField">
                                                            <input type="text" translate="no" id="rule_value_namespace_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][namespace]" class="Polaris-TextField__Input rule_value_namespace Polaris-required__Error" autocomplete="off" placeholder="Namespace" value="">
                                                            <div class="Polaris-TextField__Backdrop"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="Polaris-FormLayout__Item">
                                                <div class="Polaris-Connected">
                                                    <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                        <div class="Polaris-TextField">
                                                            <input type="text" translate="no" id="rule_value_key_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][key]" class="Polaris-TextField__Input rule_value_key Polaris-required__Error" autocomplete="off" placeholder="Key" value="">
                                                            <div class="Polaris-TextField__Backdrop"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            ${ruleValueHtml}
                        </div>
                    `;
                }
            }

            $(this).parents('.Polaris-FormLayout__Items').find(".rule_value_div").html(ruleTypeHtml);
            bootstrapTagsInputReinitialize();
        }

        if ($("#append_rules").data("extension_type") === 12) {

            if (currentSelectedRuleType === '22') {
                // if (currentSelectedRuleValue == '7' || currentSelectedRuleValue == '8') {
                if ($.inArray(currentSelectedRuleValue, ['7', '8']) >= 0) {
                    ruleTypeHtml = `
                        <div class="Polaris-TextField" style="display: none">
                            <input type="text" data-role="tagsinput" id="rule_value_${selectedRuleTypeIndex}" name="rule[${selectedRuleTypeIndex}][value]" class="Polaris-TextField__Input inputtag">
                        </div>
                    `;
                    // } else if (currentSelectedRuleValue == '2' || currentSelectedRuleValue == '3') {
                }
            }

            $(this).parents('.Polaris-FormLayout__Items').find(".rule_value_div").html(ruleTypeHtml);
            bootstrapTagsInputReinitialize();
        }
    });

    /*handle - rule_condition and rule_value as per rule_type selection*/

    $('.date_picker_div input.date_picker').show().css('visibility', 'hidden');
    $(document).on('click', '.date_picker_div', function (e) {
        $(this).find('.date_picker').trigger('focus');
    })

    $(document).on('keyup', '.range_inputs', function (e) {
        const startRangVal = parseFloat($(this).closest(".Polaris-FormLayout__Items").find(".start_range").val());
        const endRangVal = parseFloat($(this).closest(".Polaris-FormLayout__Items").find(".end_range").val());

        if (startRangVal < endRangVal) {
            $(this).closest(".between-input-div").find(".range_value").val(`${startRangVal}=${endRangVal}`);
        } else {
            $(this).closest(".between-input-div").find(".range_value").val("");
        }
    });

    // // below both handle - open product resource picker when user click bootstrap-tagsinput, when product_id rule type is selected
    // $(document).on('click', '.product_id_div .bootstrap-tagsinput', function (e) {
    //     $('.open_product_picker').trigger('click');
    // });
    // $(document).on('click', '.open_product_picker', function (e) {
    //     const ruleValueId = $(this).attr("id");
    //     initProductPicker(ruleValueId);
    //
    //     $("#" + ruleValueId).on('beforeItemRemove', function (event) {
    //         event.cancel = true;
    //         initProductPicker(ruleValueId);
    //     });
    // });
    // // handle - open product resource picker at edit time when user remove button from bootstrap-tagsinput
    // $('span[data-role="remove"]').click(function () {
    //     if ($(this).closest('.Polaris-TextField').hasClass('product_id_div')) {
    //         $('.open_product_picker').trigger('click');
    //     }
    // });

    $(document).on('click', '.collection_id_div .bootstrap-tagsinput', function (e) {
        if ($("#ext8_tier_main_div").data("extension_type")) {
            const id = $(this).closest('.collection_id_div').data('id');
            const idPrefix = $(this).closest('.collection_id_div').data('id_prefix');

            openCollectionPicker(id, idPrefix)
        } else if ($("#ext10_tier_main_div").data("extension_type") == '11') {
            const mainId = $(this).closest('.collection_id_div').data('main_id');
            const subId = $(this).closest('.collection_id_div').data('sub_id');

            openCollectionPickerForMultipleTypeExt(`ext10_tier_${mainId}_rule_value_${subId}`)
        } else if ($("#ext12_tier_main_div").data("extension_type") == '13') {
            const mainId = $(this).closest('.collection_id_div').data('main_id');
            const subId = $(this).closest('.collection_id_div').data('sub_id');

            openCollectionPickerForMultipleTypeExt(`ext12_tier_${mainId}_rule_value_${subId}`)
        } else {
            $(this).closest('.Polaris-Connected').find('.open_collection_picker').trigger('click');
        }
    });

    $(document).on('click', '.open_collection_picker', function (e) {
        const ruleValueId = $(this).attr("id");
        deliveryCustomizationRulesCollection = [];

        initializeCollectionPicker(ruleValueId);

        $("#" + ruleValueId).on('beforeItemRemove', function (event) {
            event.cancel = true;
            initializeCollectionPicker(ruleValueId);
        });
    });

    // $('span[data-role="remove"]').click(function (e) {
    $(document).on('click', 'span[data-role="remove"]', function (e) {
        if ($(this).closest('.Polaris-TextField').hasClass('date_picker_div')) {
            $(".date_picker").on('beforeItemRemove', function (event) {
                event.cancel = true;
                $('.date_picker').trigger('focus');
            });
        }

        if ($(this).closest('.Polaris-TextField').hasClass('collection_id_div')) {
            if ($("#ext8_tier_main_div").data("extension_type")) {
                const id = $(this).closest('.collection_id_div').data('id');
                const idPrefix = $(this).closest('.collection_id_div').data('id_prefix');

                openCollectionPicker(id, idPrefix)
            } else if ($("#ext10_tier_main_div").data("extension_type") == '11') {
                const mainId = $(this).closest('.collection_id_div').data('main_id');
                const subId = $(this).closest('.collection_id_div').data('sub_id');

                openCollectionPickerForMultipleTypeExt(`ext10_tier_${mainId}_rule_value_${subId}`)
            } else if ($("#ext12_tier_main_div").data("extension_type") == '13') {
                const mainId = $(this).closest('.collection_id_div').data('main_id');
                const subId = $(this).closest('.collection_id_div').data('sub_id');

                openCollectionPickerForMultipleTypeExt(`ext12_tier_${mainId}_rule_value_${subId}`)
            } else {
                $(this).closest('.Polaris-Connected').find('.open_collection_picker').trigger('click');
            }
        }
    });

    $('.redirect_to_settings_page').click(function (event) {
        redirectToPage('/settings');
        event.preventDefault();
    });

    // handle - save delivery customization and update metafield
    $(document).on('click', '.save_shipping_discount_rule', function (e) {
        // $(".on-click-disable").attr("disabled", true);
        e.preventDefault();

        const formData = $("#shipping_discount_rule_form").serializeArray();

        $error = checkValidations();

        if (!$error) {
            LoaderStart();

            $.ajax({
                url: $("#shipping_discount_rule_form").attr('action'), type: "POST", data: formData,

                success: function (response) {
                    LoaderStop();

                    if (response.status === 200) {
                        ToastNotice(response.message);
                        pageReload();
                    } else {
                        ToastNotice(response.message, true);
                    }
                }, error: function (response) {
                    ToastNotice(response.message, true);
                }
            });
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });

    $(document).on('click', 'button.save_e5_rules_btn', function (e) {
        // $(".on-click-disable").attr("disabled", true);
        e.preventDefault();

        const formData = $("#e5_rule_form").serializeArray();

        $error = checkValidations();

        if (!$error) {
            LoaderStart();

            $.ajax({
                url: $("#e5_rule_form").attr('action'), type: "POST", data: formData,

                success: function (response) {
                    LoaderStop();

                    if (response.status === 200) {
                        ToastNotice(response.message)
                        pageReload();
                    } else {
                        ToastNotice(response.message, true);
                    }
                }, error: function (response) {
                    ToastNotice(response.message, true);
                }
            });
        } else {
            ToastNotice("Required fields are missing OR Invalid Input added!", true);
        }
    });
    // --------------------------------------------------------------- delivery CUSTOMIZATION END ----------------------------------------------------------------------------

    // --------------------------------------------------------------- delivery CUSTOMIZATION SETTINGS START -----------------------------------------------------------------
    // Enabled / Disabled App Status Setting
    $(document).on('click', '.setting_app_status_change', function (e) {
        LoaderStart();

        const This = $(this);
        const val = This.val();
        const dataLink = This.data('link');

        $.ajax({
            url: dataLink, method: "POST", data: {status: val}, success: function (response) {
                LoaderStop();
                if (response.status === 200) {
                    ToastNotice(response.message);
                    if (val == '1') {
                        $("#app_status_disable_banner").hide();
                    }
                }
                if (response.status === 422) {
                    ToastNotice("Something went wrong.", true);
                }
            }, error: function () {
                ToastNotice("Something went wrong.", true);
            }
        });
    });

    $(document).on('click', '#save_settings', function (e) {
        // $(".on-click-disable").attr("disabled", true);
        e.preventDefault();

        const formData = $("#setting_form").serializeArray();

        LoaderStart();
        $.ajax({
            url: $("#setting_form").attr('action'), type: "POST", data: formData,

            success: function (response) {
                LoaderStop();
                if (response.status === 200) {
                    ToastNotice(response.message);
                    pageReload();
                } else {
                    ToastNotice(response.message, true);
                }
            }, error: function (response) {
                ToastNotice('Oops, something went wrong!', true);
            }
        });
    });
    // --------------------------------------------------------------- delivery CUSTOMIZATION SETTINGS END -------------------------------------------------------------------
    $(document).on('click', '.hide_warning_banner', function (event) {
        $("#customization_limit_banner").toggle();
    });

    /* (Badge) */
    $(document).on('click', '.toggle_status_popover', function (event) {
        const id = $(this).data('id');
        $("#status_popover_" + id).toggle();
    });

    /* Active/Inactive customization status (Radio Button - customization-status-view.blade.php) */
    $(document).on('change', '.customizationStatus', function (event) {
        event.preventDefault();

        const This = $(this);
        const val = This.val();
        const url = This.data('link');

        LoaderStart();
        $.ajax({
            url: url, method: "POST", data: {status: val}, success: function (response) {
                LoaderStop();

                if (response.status === 200) {
                    ToastNotice(response.message);
                } else {
                    $("#critical_error_banner_title").html('');
                    $("#critical_error_banner_title").html(response.message);
                    $("#critical_error_banner").show();

                    if (val == '1') {
                        $("#status_0").prop('checked', true);
                    } else {
                        $("#status_1").prop('checked', true);
                    }
                }
            }, error: function () {
                ToastNotice('Something went wrong!', true)
            }
        });
    });
});

function checkValidationWithinElement(element) {
    console.log(element);
    const errorElement = $(element).find('.Polaris-required__Error:not(pre)');
    $(errorElement).each(function () {
        if ($(this).hasClass('country_code') || $(this).hasClass('language_code')) {
            if ($(this).val().length == 0) {
                //showErrorBanner();

                $(this).siblings('.select2-container--default').find('.select2-selection').addClass('error');
                $(this).closest('.Polaris-FormLayout__Item').append(fieldError('This field is required.'));
            }
        } else {
            if ($(this).val().trim() == '') {
                //showErrorBanner();

                if ($(this).hasClass("inputtag")) {
                    $(this).parent().find('.bootstrap-tagsinput').addClass('error');
                } else {
                    $(this).parent().addClass('Polaris-TextField--error');
                }

                $(this).closest('.Polaris-FormLayout__Item').append(fieldError('This field is required.'));
            }
        }
    });

    const startRangeElement = $(element).find('.Polaris-start_range__Error:not(pre)');
    $(startRangeElement).each(function () {
        if (parseFloat($(this).closest('.Polaris-FormLayout__Items').find('.start_range').val()) >= parseFloat($(this).closest('.Polaris-FormLayout__Items').find('.end_range').val())) {
            //showErrorBanner();
            $(this).closest('.Polaris-FormLayout__Items').find(".end_range").parent().addClass('Polaris-TextField--error');
            $(this).closest('.Polaris-FormLayout__Items').find(".end_range").closest('.Polaris-FormLayout__Item').append(fieldError('End range must be greater than Start Range.'));
        }
    });
}

function checkInSectionValidations(section) {
    $isValidationOccure = false;
    removeErrorMessages();
    $("." + section).each(function (i, el) {
        // removeErrorMessages();
        $(el).find(".Polaris-required__Error").each(function (i, el) {
            if ($(this).val() == "") {
                checkValidations();

                $isValidationOccure = true;
            }
        });
    });

    return $isValidationOccure;
}

function redirectToPage(url) {
    appRedirectUrl(url);
}

function errorDebuggerStatusAjaxCall(val, dataLink) {
    $.ajax({
        url: dataLink, method: "POST", data: {value: val}, success: function (response) {
            LoaderStop();

            if (response.status == 200) {
                ToastNotice(response.message)
                if (val == '1') {
                    $("#debug_status_1").prop('checked', true);
                } else {
                    $("#debug_status_0").prop('checked', true);
                }

                pageReload();
                $('button.close_error_debug_modal').trigger('click');
            } else {
                ToastNotice(response.message, true);
            }
        }, error: function (response) {
            ToastNotice("Oops, something went wrong, Please try again later!", true)
        }
    });
}

// let offerProduct = [];
// function initProductPicker(ruleIndex) {
//     const selected = $("#selected-products").data("selected_products");
//     let pickerProduct = offerProduct.map(cl => {
//         return {
//             id: cl.graphqlid,
//         }
//     });
//
//     let ResourcePicker = actions.ResourcePicker;
//     const productPicker = ResourcePicker.create(app, {
//         resourceType: ResourcePicker.ResourceType.Product,
//         options: {
//             initialSelectionIds: (selected) ? selected : pickerProduct, // initialSelectionIds: pickerProduct,
//             showVariants: false,
//         },
//     });
//
//     productPicker.subscribe(ResourcePicker.Action.SELECT, (selectPayload) => {
//         let selectedProducts = selectPayload.selection;
//         $("#" + ruleIndex).tagsinput('removeAll');
//         offerProduct = selectedProducts.map(product => {
//             let productId = product.id.replace('gid://shopify/Product/', '');
//             $("#" + ruleIndex).tagsinput('add', productId);
//             return {
//                 id: productId, graphqlid: product.id,
//             }
//         });
//         $("#selected-products").data("selected_products", "");
//     });
//     productPicker.dispatch(ResourcePicker.Action.OPEN);
// }

function openCollectionPicker(id, idPrefix) {
    initializeMultipleCollectionPicker(idPrefix + id);

    $("#" + idPrefix + id).on('beforeItemRemove', function (event) {
        event.cancel = true;
        initializeMultipleCollectionPicker(idPrefix + id);
    });
}

function openCollectionPickerForMultipleTypeExt(ruleIndex) {
    initializeMultipleCollectionPicker(ruleIndex);

    $("#" + ruleIndex).on('beforeItemRemove', function (event) {
        event.cancel = true;
        initializeMultipleCollectionPicker(ruleIndex);
    });
}

let afterSubscribePickerSelectedIds = [];
function initializeMultipleCollectionPicker(ruleIndex, close = 0) {
    let selected = $("#" + ruleIndex).data("selected_collections");
    const collectionPicker = ResourcePicker.create(app, {
        resourceType: ResourcePicker.ResourceType.Collection, options: {
            initialSelectionIds: selected, // initialSelectionIds: pickerCollection,
            showVariants: false,
        },
    });
    collectionPicker.dispatch(ResourcePicker.Action.OPEN);
    if (close == 1) {
        collectionPicker.cancel();
    }
    collectionPicker.subscribe(ResourcePicker.Action.SELECT, (selectPayload) => {
        let selectedCollections = selectPayload.selection;
        $("#" + ruleIndex).tagsinput('removeAll');
        afterSubscribePickerSelectedIds = selectedCollections.map(collection => {
            let collectionId = collection.id.replace('gid://shopify/Collection/', '');
            $("#" + ruleIndex).tagsinput('add', collectionId);
            return {
                id: collection.id,
            }
        });
        $("#" + ruleIndex).data("selected_collections", afterSubscribePickerSelectedIds);
    });
}

let deliveryCustomizationRulesCollection = [];
function initializeCollectionPicker(ruleIndex, close = 0) {
    console.log(ruleIndex);
    let selected = $("#" + ruleIndex).data("selected_collections");
    const collectionPicker = ResourcePicker.create(app, {
        resourceType: ResourcePicker.ResourceType.Collection, options: {
            initialSelectionIds: selected, // initialSelectionIds: pickerCollection,
            showVariants: false,
        },
    });
    collectionPicker.dispatch(ResourcePicker.Action.OPEN);
    if (close == 1) {
        collectionPicker.cancel();
    }
    collectionPicker.subscribe(ResourcePicker.Action.SELECT, (selectPayload) => {
        let selectedCollections = selectPayload.selection;
        $("#" + ruleIndex).tagsinput('removeAll');
        deliveryCustomizationRulesCollection = selectedCollections.map(collection => {
            let collectionId = collection.id.replace('gid://shopify/Collection/', '');
            $("#" + ruleIndex).tagsinput('add', collectionId);
            return {
                id: collection.id,
            }
        });
        $("#" + ruleIndex).data("selected_collections", deliveryCustomizationRulesCollection);
    });

    // const selected = $("#selected-collections").data("selected_collections");
    //
    // let pickerCollection = deliveryCustomizationRulesCollection.map(cl => {
    //     return {
    //         id: cl.graphqlid,
    //     }
    // });
    //
    // let ResourcePicker = actions.ResourcePicker;
    //
    // const collectionPicker = ResourcePicker.create(app, {
    //     resourceType: ResourcePicker.ResourceType.Collection, options: {
    //         initialSelectionIds: (selected) ? selected : pickerCollection, // initialSelectionIds: pickerCollection,
    //         showVariants: false,
    //     },
    // });
    //
    // collectionPicker.dispatch(ResourcePicker.Action.OPEN);
    //
    // if (close == 1) {
    //     collectionPicker.cancel();
    // }
    //
    // collectionPicker.subscribe(ResourcePicker.Action.SELECT, (selectPayload) => {
    //     let selectedCollections = selectPayload.selection;
    //
    //     $("#" + ruleIndex).tagsinput('removeAll');
    //
    //     deliveryCustomizationRulesCollection = selectedCollections.map(collection => {
    //         let collectionId = collection.id.replace('gid://shopify/Collection/', '');
    //         $("#" + ruleIndex).tagsinput('add', collectionId);
    //         return {
    //             id: collectionId, graphqlid: collection.id,
    //         }
    //     });
    //     $("#selected-collections").data("selected_collections", "");
    // });
    //
    // collectionPicker.subscribe(ResourcePicker.Action.CANCEL, () => {
    //     // Picker was cancelled
    // });
}

function initializeDatePicker() {
    let minDate = new Date();
    $('.date_picker').datepicker({
        language: 'en', // dateFormat: 'yyyy-mm-dd',
        multipleDates: true, minDate: minDate, onSelect: function (formattedDate, date, inst) {
            bootstrapTagsInputReinitialize();
            $('.date_picker_div input.date_picker').show().css('visibility', 'hidden');
        }
    });
}

function initializeTimePicker() {
    $('.time_picker').mdtimepicker({
        is24hour: true, timeFormat: 'hh:mm:ss',
    });
    $('.time_picker').mdtimepicker().on('timechanged', function (e) {
    });
}

function selectDatesInDatePicker() {
    $('.date_picker').each(function (t, v){
        let _this = $(this);
        let selectedDates = $(this).val();
        if (selectedDates) {
            selectedDates = selectedDates.split(',');
            $.each(selectedDates, function (index, value) {
                _this.datepicker().data('datepicker').selectDate(new Date(value + 'T00:00:01'));
            });
        }
    });
}

function initializeSelect2() {
    $('.country_code').select2({
        placeholder: "Select country",
    });

    $('.day_of_week').select2({
        placeholder: "Select day",
    });

    $('.language_code').select2({
        placeholder: "Select language",
    });

    $('.start_time').select2({
        placeholder: "Select start time",
    });
    $('.end_time').select2({
        placeholder: "Select end time",
    });

    $('.start_day').select2({
        placeholder: "Select start day",
    });
    $('.end_day').select2({
        placeholder: "Select end day",
    });
}

function bootstrapTagsInputReinitialize() {
    let tag = $('input[data-role="tagsinput"]');
    tag.tagsinput("destroy");
    tag.tagsinput();

    $(".bootstrap-tagsinput").attr("translate", "no");
}

function deleteRuleRow(id) {
    $("#" + id).remove();
    hideShowDeleteRuleBtn();
    disabledSelectedRuleTypesInEachSelectBoxAndHideShowAddRuleButton();
}

// functions used for extension 7 start
function deleteTierExt7(tierId) {
    $("#ext7_tier_" + tierId).remove();
    hideShowDeleteRuleBtn();
}

function deleteTierRuleRowExt7(tierId, tierRuleId, element) {
    const newElement = $(element).parents(".ext7_tier_append_rules_div");
    $("#ext7_tier_" + tierId + "_rule_rows_" + tierRuleId).remove();
    hideShowDeleteRuleBtn();
    hideShowAddRuleButtonExt7(newElement);
}

function getSelectedRuleTypesExt7(element) {
    let selectedTypes = [];
    $(element).closest('.ext7_tier').find(".ext7_tier_rule_type").each(function (i, el) {
        selectedTypes.push($(this).val());
    });
    return selectedTypes;
}

function hideShowAddRuleButtonExt7(element) {
    const getAllSelectedRuleTypes = getSelectedRuleTypesExt7(element);

    const selectedTypes = [];
    $(".ext7_tier_main_div").find('.ext7_tier').each(function (i, el) {
        $(el).find(".ext7_tier_rule_type").each(function () {
            selectedTypes.push($(this).val());
        });
    });

    if (selectedTypes.includes("16") && !selectedTypes.includes("13")) {
        getAllSelectedRuleTypes.push("16");
    } else if (selectedTypes.includes("13") && !selectedTypes.includes("16")) {
        getAllSelectedRuleTypes.push("13");
    } else if (selectedTypes.includes("16") && selectedTypes.includes("13")) {
        getAllSelectedRuleTypes.push("13");
        getAllSelectedRuleTypes.push("16");
    }

    let allRuleTypes = ['0', '1', '2', '17', '3', '8', '9', '10', '11', '12', '13', '14', '16'];
    if (getAllSelectedRuleTypes.every(elem => allRuleTypes.includes(elem)) && getAllSelectedRuleTypes.length === allRuleTypes.length) {
        $(element).closest('.ext7_tier').find('.ext7_tier_add_rule_btn_div').hide();
    } else {
        $(element).closest('.ext7_tier').find('.ext7_tier_add_rule_btn_div').show();
    }

    // Enabled / Disabled selected options
    $(element).closest('.ext7_tier').find(".ext7_tier_rule_type").each(function () {
        $(this).find("option").prop("disabled", false);
        $(this).find("option").filter(function () {
            return getAllSelectedRuleTypes.indexOf($(this).val()) !== -1;
        }).not("[value='" + $(this).val() + "']").prop("disabled", true);
    });
}

// functions used for extension 7 end
function initializeSortable() {
    $(".sort_delivery_type_tbl").sortable();
}

function deleteExt11Rule(mainIndex, subIndex) {
    $("#ext11_tier_" + mainIndex + "_rule_row_" + subIndex).remove();
    hideShowDeleteRuleBtn();
}

function deleteTierExt11(tierId) {
    $("#ext11_tier_" + tierId).remove();
    hideShowDeleteRuleBtn();
}

function deleteTierRuleRowExt11(tierId, tierRuleId, element) {
    const newElement = $(element).parents(".ext11_tier_append_rules_div");
    $("#ext11_tier_" + tierId + "_rule_rows_" + tierRuleId).remove();
    hideShowDeleteRuleBtn();
    hideShowAddRuleButtonExt11(newElement);
}

function getSelectedRuleTypesExt11(element) {
    let selectedTypes = [];
    $(element).closest('.ext11_tier').find(".ext11_tier_rule_type").each(function (i, el) {
        selectedTypes.push($(this).val());
    });
    return selectedTypes;
}

function hideShowAddRuleButtonExt11(element) {
    const getAllSelectedRuleTypes = getSelectedRuleTypesExt11(element);

    const selectedTypes = [];
    $(".ext11_tier_main_div").find('.ext11_tier').each(function (i, el) {
        $(el).find(".ext11_tier_rule_type").each(function () {
            selectedTypes.push($(this).val());
        });
    });

    if (selectedTypes.includes("38")) {
        getAllSelectedRuleTypes.push("38");
    }

    let allRuleTypes = ['0', '8', '22', '36', '38'];
    if (getAllSelectedRuleTypes.every(elem => allRuleTypes.includes(elem)) && getAllSelectedRuleTypes.length === allRuleTypes.length) {
        $(element).closest('.ext11_tier').find('.ext11_tier_add_rule_btn_div').hide();
    } else {
        $(element).closest('.ext11_tier').find('.ext11_tier_add_rule_btn_div').show();
    }

    // Enabled / Disabled selected options
    $(element).closest('.ext11_tier').find(".ext11_tier_rule_type").each(function () {
        $(this).find("option").prop("disabled", false);

        $(this).find("option").filter(function () {
            return getAllSelectedRuleTypes.indexOf($(this).val()) !== -1;
        }).not("[value='" + $(this).val() + "']").prop("disabled", true);
    });
}


function deleteTierExt10(tierId) {
    $("#ext10_tier_" + tierId).remove();
    hideShowDeleteRuleBtn();
}

function deleteTierRuleRowExt10(tierId, tierRuleId, element) {
    const newElement = $(element).parents(".ext10_tier_append_rules_div");

    $("#ext10_tier_" + tierId + "_rule_rows_" + tierRuleId).remove();
    hideShowDeleteRuleBtn();
    // hideShowAddRuleButtonExt10(newElement);
}

function getSelectedRuleTypesExt10(element) {
    let selectedTypes = [];
    $(element).closest('.ext10_tier').find(".ext10_tier_rule_type").each(function (i, el) {
        selectedTypes.push($(this).val());
    });
    return selectedTypes;
}

function hideShowAddRuleButtonExt10(element) {
    const getAllSelectedRuleTypes = getSelectedRuleTypesExt10(element);

    let allRuleTypes = ['0', '1', '2', '17', '3', '8', '9', '10', '11', '12', '13', '14', '16', '35', '41', '42', '45', '46'];
    if (getAllSelectedRuleTypes.every(elem => allRuleTypes.includes(elem)) && getAllSelectedRuleTypes.length === allRuleTypes.length) {
        $(element).closest('.ext10_tier').find('.ext10_tier_add_rule_btn_div').hide();
    } else {
        $(element).closest('.ext10_tier').find('.ext10_tier_add_rule_btn_div').show();
    }

    // Enabled / Disabled selected options
    $(element).closest('.ext10_tier').find(".ext10_tier_rule_type").each(function () {
        $(this).find("option").prop("disabled", false);

        $(this).find("option").filter(function () {
            return getAllSelectedRuleTypes.indexOf($(this).val()) !== -1;
        }).not("[value='" + $(this).val() + "']").prop("disabled", true);
    });
}


function deleteTierExt12(tierId) {
    $("#ext12_tier_" + tierId).remove();
    hideShowDeleteRuleBtn();
}

function deleteExt12Rule(mainIndex, subIndex) {
    $("#ext12_tier_" + mainIndex + "_rule_row_" + subIndex).remove();
    hideShowDeleteRuleBtn();
}

function deleteTierRuleRowExt12(tierId, tierRuleId, element) {
    const newElement = $(element).parents(".ext12_tier_append_rules_div");

    $("#ext12_tier_" + tierId + "_rule_rows_" + tierRuleId).remove();
    hideShowDeleteRuleBtn();

    hideShowAddRuleButtonExt12(newElement);
}

function getSelectedRuleTypesExt12(element) {
    let selectedTypes = [];
    $(element).closest('.ext12_tier').find(".ext12_tier_rule_type").each(function (i, el) {
        selectedTypes.push($(this).val());
    });
    return selectedTypes;
}

function hideShowAddRuleButtonExt12(element) {
    const getAllSelectedRuleTypes = getSelectedRuleTypesExt12(element);

    const selectedTypes = [];
    $(".ext12_tier_main_div").find('.ext12_tier').each(function (i, el) {
        $(el).find(".ext12_tier_rule_type").each(function () {
            selectedTypes.push($(this).val());
        });
    });

    if (selectedTypes.includes("38")) {
        getAllSelectedRuleTypes.push("38");
    }

    let allRuleTypes = ['0', '1', '2', '3', '8', '9', '10', '13', '16', '36', '38'];
    if (getAllSelectedRuleTypes.every(elem => allRuleTypes.includes(elem)) && getAllSelectedRuleTypes.length === allRuleTypes.length) {
        $(element).closest('.ext12_tier').find('.ext12_tier_add_rule_btn_div').hide();
    } else {
        $(element).closest('.ext12_tier').find('.ext12_tier_add_rule_btn_div').show();
    }

    // Enabled / Disabled selected options
    $(element).closest('.ext12_tier').find(".ext12_tier_rule_type").each(function () {
        $(this).find("option").prop("disabled", false);

        $(this).find("option").filter(function () {
            return getAllSelectedRuleTypes.indexOf($(this).val()) !== -1;
        }).not("[value='" + $(this).val() + "']").prop("disabled", true);
    });
}


function deleteTier(id) {
    $("#tier_" + id).remove();

    $("#ext8_tier_" + id).remove();

    hideShowDeleteRuleBtn();
    disabledSelectedRuleTypesInEachSelectBoxAndHideShowAddRuleButton();
}

function deleteTierRuleRow(mainId, id) {
    $("#tier_" + mainId + "_rule_row_" + id).remove();
    $("#ext8_tier_" + mainId + "_rule_rows_" + id).remove();

    hideShowDeleteRuleBtn();
    // disabledSelectedRuleTypesInEachSelectBoxAndHideShowAddRuleButton();
}

function deleteExt9TierRuleRow(mainId, tierId) {
    $("#ext9_tier_" + mainId + "_rule_row_" + tierId).remove();

    hideShowDeleteRuleBtn();
}

function deleteOldNewTranslateRaw(id) {
    $("#translate_old_new_" + id).remove();
    hideShowDeleteRuleBtn();
    // disabledSelectedRuleTypesInEachSelectBoxAndHideShowAddRuleButton();
}

function deleteSortRule(id) {
    $("#sort_rule_" + id).remove();
    hideShowDeleteRuleBtn();
}

function hideShowDeleteRuleBtn() {
    if ($(".rule_rows").length < 2) {
        $(".rule_rows").first().find(".delete_button").hide();
    } else {
        $(".rule_rows").first().find(".delete_button").show();
    }

    if ($(".sort_rule_row").length < 2) {
        $(".sort_rule_row").first().find(".sort_rule_remove_btn").hide();
    } else {
        $(".sort_rule_row").first().find(".sort_rule_remove_btn").show();
    }

    $('.append_tier_rules_div').each(function (i, el) {
        if ($(el).find(".delete_button").length < 2) {
            $(el).first().find(".delete_button").hide();
        } else {
            $(el).first().find(".delete_button").show();
        }
    });


    if ($(".translate_old_new_row").length < 2) {
        $(".translate_old_new_row").first().find(".remove_old_new_btn").hide();
    } else {
        $(".translate_old_new_row").first().find(".remove_old_new_btn").show();
    }

    if ($(".tier").length < 2) {
        $(".tier").first().find(".delete_tier_btn_div").hide();
    } else {
        $(".tier").first().find(".delete_tier_btn_div").show();
    }


    // hide/show delete button of rule/condition of tiers extension 7
    $('.ext7_tier_append_rules_div').each(function (i, el) {
        if ($(el).find(".delete_button").length < 2) {
            $(el).first().find(".delete_button").hide();
        } else {
            $(el).first().find(".delete_button").show();
        }
    });

    // hide/show delete button of tier extension 7
    if ($(".ext7_tier").length < 2) {
        $(".ext7_tier").first().find(".delete_tier_btn_ext7").hide();
    } else {
        $(".ext7_tier").first().find(".delete_tier_btn_ext7").show();
    }


    $('.ext8_tier_append_rules_div').each(function (i, el) {
        if ($(el).find(".delete_button").length < 2) {
            $(el).first().find(".delete_button").hide();
        } else {
            $(el).first().find(".delete_button").show();
        }
    });

    // hide/show delete button of tier extension 8
    if ($(".ext8_tier").length < 2) {
        $(".ext8_tier").first().find(".delete_tier_btn_ext8").hide();
    } else {
        $(".ext8_tier").first().find(".delete_tier_btn_ext8").show();
    }


    $('.append_ext9_tier_rules_div').each(function (i, el) {
        if ($(el).find(".delete_button").length < 2) {
            $(el).first().find(".delete_button").hide();
        } else {
            $(el).first().find(".delete_button").show();
        }
    });

    // hide/show delete button of rule/condition of tiers extension 7
    $('.ext10_tier_append_rules_div').each(function (i, el) {
        if ($(el).find(".delete_button").length < 2) {
            $(el).first().find(".delete_button").hide();
        } else {
            $(el).first().find(".delete_button").show();
        }
    });

    // hide/show delete button of tier extension 7
    if ($(".ext10_tier").length < 2) {
        $(".ext10_tier").first().find(".delete_tier_btn_ext10").hide();
    } else {
        $(".ext10_tier").first().find(".delete_tier_btn_ext10").show();
    }

    // hide/show delete button of rule/condition of tiers extension 7
    $('.ext12_tier_append_rules_div').each(function (i, el) {
        if ($(el).find(".delete_button").length < 2) {
            $(el).first().find(".delete_button").hide();
        } else {
            $(el).first().find(".delete_button").show();
        }
    });

    // hide/show delete button of tier extension 7
    if ($(".ext12_tier").length < 2) {
        $(".ext12_tier").first().find(".delete_tier_btn_ext12").hide();
    } else {
        $(".ext12_tier").first().find(".delete_tier_btn_ext12").show();
    }

    $('.translate_old_new_main_div').each(function (i, el) {
        if ($(el).find(".ext12_tier_rule_row").length < 2) {
            $(el).first().find(".remove_old_new_btn").hide();
        } else {
            $(el).first().find(".remove_old_new_btn").show();
        }
    });


    // hide/show delete button of rule/condition of tiers extension 7
    $('.ext11_tier_append_rules_div').each(function (i, el) {
        if ($(el).find(".delete_button").length < 2) {
            $(el).first().find(".delete_button").hide();
        } else {
            $(el).first().find(".delete_button").show();
        }
    });

    // hide/show delete button of tier extension 7
    if ($(".ext11_tier").length < 2) {
        $(".ext11_tier").first().find(".delete_tier_btn_ext11").hide();
    } else {
        $(".ext11_tier").first().find(".delete_tier_btn_ext11").show();
    }

    $('.sort_delivery_type_tbl').each(function (i, el) {
        if ($(el).find(".ext11_tier_rule_row").length < 2) {
            $(el).first().find(".sort_rule_remove_btn").hide();
        } else {
            $(el).first().find(".sort_rule_remove_btn").show();
        }
    });
}

function disabledSelectedRuleTypesInEachSelectBoxAndHideShowAddRuleButton() {
    let getAllSelectedRuleTypes = getSelectedRuleTypes();
    // console.log(getAllSelectedRuleTypes);

    // Hide / Show Add condition button
    // const allRuleTypes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];
    let allRuleTypes = ['0', '1', '2', '3', '8', '9', '10', '11', '12', '13', '14', '16'];
    if ($("#append_rules").data("extension_type") === 3) {
        // if (getAllSelectedRuleTypes.includes("16")) {
        //     getAllSelectedRuleTypes.push("28");
        //     allRuleTypes = ['0', '1', '8', '10', '12', '13', '16', '17', '18', '19', '24', '25', '26', '27', '31', '36', '37', '38', '39'];
        // }
        // if (getAllSelectedRuleTypes.includes("28")) {
        //     getAllSelectedRuleTypes.push("16");
        //     allRuleTypes = ['0', '1', '8', '10', '12', '13', '17', '18', '19', '24', '25', '26', '27', '28', '31', '36', '37', '38', '39'];
        // }
        if (getAllSelectedRuleTypes.includes("38")) {
            // allRuleTypes = ['0', '1', '8', '10', '12', '13', '16', '17', '18', '19', '24', '25', '26', '27', '28', '31', '36', '37', '38'];
            // getAllSelectedRuleTypes.push("39");
            getAllSelectedRuleTypes = ['38', '39'];
            allRuleTypes = [];
        }
        if (getAllSelectedRuleTypes.includes("39")) {
            // allRuleTypes = ['0', '1', '8', '10', '12', '13', '16', '17', '18', '19', '24', '25', '26', '27', '28', '31', '36', '37', '39'];
            // getAllSelectedRuleTypes.push("38");
            getAllSelectedRuleTypes = ['38', '39'];
            allRuleTypes = [];
        }
    } else if ($("#append_rules").data("extension_type") === 5) {
        allRuleTypes = ['0', '1', '2', '3', '8', '9', '10', '13', '16'];
    } else if ($("#append_rules").data("extension_type") === 6) {
        allRuleTypes = ['0', '10', '16', '20', '21', '22', '23', '31', '32', '33', '34'];
    } else if ($("#append_rules").data("extension_type") === 7) {
        allRuleTypes = ['8', '20'];
    } else if ($("#tier_main_div").data("extension_type") === 4) {
        allRuleTypes = ['0', '1'];
    }

    if (getAllSelectedRuleTypes.every(elem => allRuleTypes.includes(elem)) && getAllSelectedRuleTypes.length === allRuleTypes.length) {
        $('#add_condition_div').hide();
        $('#add_tier_btn_div').hide();
    } else {
        $('#add_condition_div').show();
        $('#add_tier_btn_div').show();
    }

    // Enabled / Disabled selected options
    console.log(getAllSelectedRuleTypes);
    $(".rule_type").each(function () {
        $(this).find("option").prop("disabled", false);
        $(this).find("option").filter(function () {
            return getAllSelectedRuleTypes.indexOf($(this).val()) !== -1;
        }).not("[value='" + $(this).val() + "']").prop("disabled", true);
    });
}

function getSelectedRuleTypes() {
    let arr1 = [];
    $(".rule_type").each(function (i, el) {
        arr1.push($(this).val());
    });
    return arr1;
}

function showErrorBanner() {
    $("#critical_error_banner_title").html('Required fields are missing OR Invalid Input added!');
    $("#critical_error_banner").show();
}

function hideErrorBanner() {
    $("#critical_error_banner").hide();
}

function checkValidations() {
    const errorElement = $('.Polaris-required__Error:not(pre)');
    const startRangeElement = $('.Polaris-start_range__Error:not(pre)');
    $error = false;
    removeErrorMessages();
    $(errorElement).each(function () {
        if ($(this).hasClass('country_code') || $(this).hasClass('language_code') || $(this).hasClass('day_of_week')) {
            if ($(this).val().length == 0) {
                showErrorBanner();
                $(this).siblings('.select2-container--default').find('.select2-selection').addClass('error');
                $(this).closest('.Polaris-FormLayout__Item').append(fieldError('This field is required.'));
                $error = true;
            }
        } else {
            if ($(this).val().trim() == '') {
                showErrorBanner();

                if ($(this).hasClass("inputtag")) {
                    $(this).parent().find('.bootstrap-tagsinput').addClass('error');
                } else {
                    $(this).parent().addClass('Polaris-TextField--error');
                }

                $(this).closest('.Polaris-FormLayout__Item').append(fieldError('This field is required.'));
                // $(this).closest('.Polaris-TextField').after(fieldError('This field is required.'));
                $error = true;
            }
        }
    });

    $(startRangeElement).each(function () {
        // if (parseFloat($(this).closest('.Polaris-FormLayout__Items').find('.start_range').val()) >= parseFloat($(this).closest('.Polaris-FormLayout__Items').find('.end_range').val())) {
        if (parseFloat($(this).closest('.Polaris-FormLayout__Items').find('.start_range').val()) > parseFloat($(this).closest('.Polaris-FormLayout__Items').find('.end_range').val())) {
            showErrorBanner();
            $(this).closest('.Polaris-FormLayout__Items').find(".end_range").parent().addClass('Polaris-TextField--error');
            $(this).closest('.Polaris-FormLayout__Items').find(".end_range").closest('.Polaris-FormLayout__Item').append(fieldError('End range must be greater than Start Range.'));
            $error = true;
        }
    });
    return $error;
}

function checkTranslateOldNewValidations() {
    const errorElement = $('.translate_old_new_methods:not(pre)');
    $error = false;
    removeErrorMessages();
    $(errorElement).each(function () {
        if ($(this).val().trim() == '') {
            showErrorBanner();
            if ($(this).hasClass("inputtag")) {
                $(this).parent().find('.bootstrap-tagsinput').addClass('error');
            } else {
                $(this).parent().addClass('Polaris-TextField--error');
            }
            $(this).closest('.Polaris-FormLayout__Item').append(fieldError('This field is required.'));
            $error = true;
        }
    });
    return $error;
}

function checkShippingDiscountValidation() {
    const errorElement = $('.Polaris-required__Error-Shipping:not(pre)');
    $error = false;
    removeErrorMessages();
    $(errorElement).each(function () {
        if ($(this).val().trim() == '') {
            $(this).parent().addClass('Polaris-TextField--error');
            $(this).closest('.Polaris-FormLayout__Item').append(fieldError('This field is required.'));
            $error = true;
        }
    });
    return $error;
}

function removeErrorMessages() {
    $(document).find('.Polaris-Labelled__Error').remove()
    $(document).find('.Polaris-TextField--error').removeClass('Polaris-TextField--error')
    $(document).find('.bootstrap-tagsinput').removeClass('error')
    $(document).find('.select2-selection').removeClass('error')
    hideErrorBanner();
}

function fieldError(message) {
    return `<div class="Polaris-Labelled__Error">
                <div class="Polaris-InlineError">
                    <div class="Polaris-InlineError__Icon">
                        <span class="Polaris-Icon">
                            <span class="Polaris-Text--root Polaris-Text--visuallyHidden"></span>
                            <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
                                <path d="M10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Z"></path>
                                <path d="M11 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path>
                                <path fill-rule="evenodd" d="M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-1.5 0a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z"></path>
                            </svg>
                        </span>
                    </div>
                    ${message}
                </div>
            </div>`;
}

function call(url, search = "", page = "") {
    $.ajax({
        type: "GET", url: url, data: {search: search, page: page},

        success: function (response) {
            $('#render_view').html('');
            $('#render_view').html(response);
        }
    });
}

