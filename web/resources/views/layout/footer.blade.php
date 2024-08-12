<script src="{{asset('admin/assets/js/bootstrap.bundle.min.js')}}"></script>
<script src="{{asset('admin/assets/js/jquery.min.js')}}"></script>
<script src="{{asset('admin/assets/plugins/simplebar/js/simplebar.min.js')}}"></script>
<script src="{{asset('admin/assets/plugins/metismenu/js/metisMenu.min.js')}}"></script>
<script src="{{asset('admin/assets/js/pace.min.js')}}"></script>
<script src="{{asset('admin/assets/js/app.js')}}"></script>
<script src="{{asset('admin/assets/plugins/datatable/js/jquery.dataTables.min.js')}}"></script>
<script src="{{asset('admin/assets/plugins/datatable/js/dataTables.bootstrap5.min.js')}}"></script>

<script src="{{asset('admin/assets/plugins/chartjs/js/Chart.min.js')}}"></script>
<script src="{{asset('admin/assets/plugins/chartjs/js/Chart.extension.js')}}"></script>
<script src="{{asset('admin/assets/plugins/apexcharts-bundle/js/apexcharts.min.js')}}"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.20.0/jquery.validate.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.3.0/js/bootstrap-datepicker.js"></script>

<script src="{{asset('admin/assets/js/index.js')}}"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>

<script src="{{asset('admin/assets/js/jquery.json-editor.min.js')}}"></script>

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