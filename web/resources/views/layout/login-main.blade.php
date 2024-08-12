<!doctype html>
<html lang="en">
    <head>
        <!-- Required meta tags -->
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" href="{{asset('admin/assets/images/cirkle-studio-favicon.webp')}}" type="image/png"/>

        <!-- Bootstrap CSS -->
        <link href="{{asset('admin/assets/css/bootstrap.min.css')}}" rel="stylesheet"/>
        <link href="{{asset('admin/assets/css/bootstrap-extended.css')}}" rel="stylesheet"/>
        <link href="{{asset('admin/assets/css/style.css')}}" rel="stylesheet"/>
        <link href="{{asset('admin/assets/css/icons.css')}}" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.css"/>

        <!-- loader-->
        <link href="{{asset('admin/assets/css/pace.min.css')}}" rel="stylesheet"/>

        <title>{{config('constants.admin_app_name')}} - Login</title>

        <style>
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

            i {
                font-size: large;
            }
        </style>
    </head>

    <body>
        <!--start wrapper-->
        <div class="wrapper">

            <!--start content-->
            <main class="authentication-content">
                <div class="container-fluid">
                    <div class="authentication-card">
                        <div class="card shadow rounded-0 overflow-hidden">
                            <div class="row g-0">
                                <div class="col-lg-6 bg-login d-flex align-items-center justify-content-center">
                                    <img src="{{asset('admin/assets/images/app-login-banner.jpg')}}" class="img-fluid" alt="">
                                </div>
                                <div class="col-lg-6">
                                    <div class="card-body p-4 p-sm-5">
                                        <h5 class="card-title mb-5">Sign In</h5>
                                        @yield('login-form')
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <!--end page main-->

        </div>
        <!--end wrapper-->

        <!--plugins-->
        <script src="{{asset('admin/assets/js/jquery.min.js')}}"></script>
        <script src="{{asset('admin/assets/js/pace.min.js')}}"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>

        @if (session()->has('success'))
            <script type="text/javascript">
                toastr.success("{!! Session::get('success') !!}");
            </script>
        @endif

        @if (session()->has('fail'))
            <script type="text/javascript">
                toastr.error("{!! Session::get('fail') !!}");
            </script>
        @endif

    </body>
</html>