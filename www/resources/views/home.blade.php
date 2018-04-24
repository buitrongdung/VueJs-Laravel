@extends('layouts.guest')
@section('head')
    <title>{{ config('app.title') }}</title>
    <meta property="og:type" content="article" />
    <meta property="og:title" content="{{ config('app.title') }}" />
    <meta property="og:url" content="{{ config('app.url') }}" />
    <meta property="og:site_name" content="{{ config('app.name') }}" />

    <meta id="csrf-token" name="csrf-token" value="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ asset('/css/app.css') }}" />
@endsection

@section('breadcrumbs')
    <breadcrumbs></breadcrumbs>
@endsection


@section('content')
    <router-view></router-view>
    <vue-progress-bar></vue-progress-bar>
@endsection

@section('script')

    <script src="{{mix('/js/manifest.js')}}"></script>
    <script src="{{mix('/js/vendor.js')}}"></script>
    <script src="{{mix('/js/app.js')}}"></script>


    <!--javascript-->
    <script type="text/javascript" src="{{asset('js/sys/jquery.min.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/sys/bootstrap.min.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/sys/jquery.ui.custom.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/sys/bootstrap-colorpicker.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/sys/bootstrap-datepicker.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/sys/jquery.uniform.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/sys/select2.min.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/sys/jquery.dataTables.min.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/sys/maruti.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/sys/maruti.tables.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/sys/maruti.form_common.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/sys/jquery-ui.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/tinymce/tinymce.js')}}"></script>
@endsection

@section('footer')
    <div class="row-fluid">
        <div id="footer" class="span12"> 2012 &copy; Marutii Admin. Brought to you by <a href="http://themedesigner.in">Themedesigner.in</a> </div>
    </div>
@endsection
