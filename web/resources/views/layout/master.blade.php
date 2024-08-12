<!doctype html>
<html lang="en">

    <head>
        <!--Header with default css-->
        @include('layout.head')

        <!--Title-->
        <title>@yield('title')</title>

        <!--Extra css-->
        @stack('css')
    </head>

    <body>
        <!--Start wrapper-->
        <div class="wrapper">
            <!--Main content-->
            <main class="page-content">@yield('main-content')</main>

            <!--start overlay-->
            <div class="overlay nav-toggle-icon"></div>
            <!--end overlay-->

            <!--Back To Top Button-->
            <a href="javaScript:;" class="back-to-top">
                <i class='bx bxs-up-arrow-alt'></i>
            </a>
        </div>
        <!--End wrapper-->

        <!--Footer with default js-->
        @include('layout.footer')

        <!--Extra js-->
        @stack('script')

    </body>

</html>