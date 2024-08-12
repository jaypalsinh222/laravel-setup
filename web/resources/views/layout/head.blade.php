<!--Required meta tags-->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<!--Meta tags for block search indexing with noindex-->
<meta name="robots" content="noindex">
<meta name="googlebot" content="noindex">

<!--Favicon-->
<link rel="icon" href="{{asset('admin/assets/images/cirkle-studio-favicon.webp')}}"/>

<!--Plugins-->
<link href="{{asset('admin/assets/plugins/vectormap/jquery-jvectormap-2.0.2.css')}}" rel="stylesheet"/>
<link href="{{asset('admin/assets/plugins/simplebar/css/simplebar.css')}}" rel="stylesheet"/>
<link href="{{asset('admin/assets/plugins/perfect-scrollbar/css/perfect-scrollbar.css')}}" rel="stylesheet"/>
<link href="{{asset('admin/assets/plugins/metismenu/css/metisMenu.min.css')}}" rel="stylesheet"/>
<link href="{{asset('admin/assets/plugins/datatable/css/dataTables.bootstrap5.min.css')}}" rel="stylesheet"/>

<!--Bootstrap CSS-->
<link href="{{asset('admin/assets/css/bootstrap.min.css')}}" rel="stylesheet"/>
<link href="{{asset('admin/assets/css/bootstrap-extended.css')}}" rel="stylesheet"/>
<link href="{{asset('admin/assets/css/style.css')}}" rel="stylesheet"/>
<link href="{{asset('admin/assets/css/icons.css')}}" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.css"/>

<!--Loader-->
<link href="{{asset('admin/assets/css/pace.min.css')}}" rel="stylesheet"/>

<!--Theme Styles-->
<link href="{{asset('admin/assets/css/dark-theme.css')}}" rel="stylesheet"/>
<link href="{{asset('admin/assets/css/light-theme.css')}}" rel="stylesheet"/>
<link href="{{asset('admin/assets/css/semi-dark.css')}}" rel="stylesheet"/>
<link href="{{asset('admin/assets/css/header-colors.css')}}" rel="stylesheet"/>

<style>
    form input {
        background-color: #fff !important;
    }

    a {
        color: #35466b !important;
    }

    .page-item.active .page-link {
        z-index: 3;
        color: #fff !important;
        background-color: #35466b !important;
        border-color: #35466b !important;
    }

    .btn-primary {
        color: #fff !important;
        background-color: #35466b !important;
        border-color: #35466b !important;
    }

    .btn-primary:hover {
        color: #fff !important;
        background-color: #232f48 !important;
        border-color: #232f48 !important;
    }

    .btn-close {
        color: #35466b !important;
        background-color: transparent !important;
    }

    .btn-close:hover {
        color: #35466b !important;
        background-color: transparent !important;
    }

    .footer {
        position: absolute;
        left: 260px;
        right: 0;
        bottom: 0;
        padding: 0.7rem;
        color: #484444;
        background-color: #f7f8fa;
        border-top: 1px solid #e2e3e4;
        text-align: center;
        transition: .3s all;
    }

    .toggled .footer {
        left: 0;
    }

    .footer-container {
        position: relative;
        display: inline-block;
        width: 100%;
        bottom: 0;
    }

    .card {
        border-radius: 10px;
    }

    .btn i {
        margin-left: 0 !important;
    }
</style>