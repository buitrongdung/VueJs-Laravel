@extends('layouts.no-sidebar')

@section('title')
    <title>Maruti Admin</title><meta charset="UTF-8" />
@endsection

@section('head')
    <meta id="csrf-token" name="csrf-token" value="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ asset('css/app.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/login.css') }}" />
@endsection

@section('content')
    <div id="loginbox">
        <form id="loginform" class="form-vertical" method="post" action="{{route('login')}}">
                {{ csrf_field() }}
            <div class="control-group normal_text"> <h3><img src="img/logo.png" alt="Logo" /></h3></div>
            <div class="control-group">
                <div class="controls">
                    <div class="main_input_box">
                        <span class="add-on"><i class="icon-user"></i></span><input type="email" placeholder="Email" name="email" id="email" />
                    </div>
                </div>
            </div>
            <div class="control-group">
                <div class="controls">
                    <div class="main_input_box">
                        <span class="add-on"><i class="icon-lock"></i></span><input type="password" placeholder="Password" name="password" id="password" />
                    </div>
                </div>
            </div>
            <div class="control-group">
                <div class="controls">
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" name="remember" {{ old('remember') ? 'checked' : '' }}> Remember Me
                        </label>
                    </div>
                </div>
            </div>
            <div class="form-actions">
                <span class="pull-left"><a href="#" class="flip-link btn btn-inverse" id="to-recover">Lost password?</a></span>
                <span class="pull-right"><input type="submit" class="btn btn-success" value="Login" /></span>
            </div>
        </form>
        <form id="recoverform" action="#" class="form-vertical">
            <p class="normal_text">Enter your e-mail address below and we will send you instructions how to recover a password.</p>

            <div class="controls">
                <div class="main_input_box">
                    <span class="add-on"><i class="icon-envelope"></i></span><input type="text" placeholder="E-mail address" />
                </div>
            </div>

            <div class="form-actions">
                <span class="pull-left"><a href="#" class="flip-link btn btn-inverse" id="to-login">&laquo; Back to login</a></span>
                <span class="pull-right"><input type="submit" class="btn btn-info" value="Recover" /></span>
            </div>
        </form>
    </div>
@endsection

@section('script')
<!--javascript-->
<script src="{{mix('/js/manifest.js')}}"></script>
<script src="{{mix('/js/vendor.js')}}"></script>
<script src="{{mix('/js/app.js')}}"></script>
<script type="text/javascript" src="{{asset('js/sys/jquery.min.js')}}"></script>
<script type="text/javascript" src="{{asset('js/sys/login.js')}}"></script>
@endsection
