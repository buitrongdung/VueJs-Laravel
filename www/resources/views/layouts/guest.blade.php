<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    @yield('head')

</head>
<body>
<div id="home-app">
    <!--Header-part-->
    <div id="header">
        <h1><a href="dashboard.html">Maruti Admin</a></h1>
    </div>
    <!--close-Header-part-->

    <!--top-Header-messaages-->
    <div class="btn-group rightzero"> <a class="top_message tip-left" title="Manage Files"><i class="icon-file"></i></a> <a class="top_message tip-bottom" title="Manage Users"><i class="icon-user"></i></a> <a class="top_message tip-bottom" title="Manage Comments"><i class="icon-comment"></i><span class="label label-important">5</span></a> <a class="top_message tip-bottom" title="Manage Orders"><i class="icon-shopping-cart"></i></a> </div>
    <!--close-top-Header-messaages-->

    <!--top-Header-menu-->
    <div id="user-nav" class="navbar navbar-inverse">
        <ul class="nav">
            <li class="" ><a title="" href="#"><i class="icon icon-user"></i> <span class="text"><?php if(Auth::check()) echo Auth::user(); ?></span></a></li>
            <li class=" dropdown" id="menu-messages"><a href="#" data-toggle="dropdown" data-target="#menu-messages" class="dropdown-toggle"><i class="icon icon-envelope"></i> <span class="text">Messages</span> <span class="label label-important">5</span> <b class="caret"></b></a>
                <ul class="dropdown-menu">
                    <li><a class="sAdd" title="" href="#">new message</a></li>
                    <li><a class="sInbox" title="" href="#">inbox</a></li>
                    <li><a class="sOutbox" title="" href="#">outbox</a></li>
                    <li><a class="sTrash" title="" href="#">trash</a></li>
                </ul>
            </li>
            <li class=""><a title="" href="#"><i class="icon icon-cog"></i> <span class="text">Settings</span></a></li>
            <li class="">
                <a href="{{ route('logout') }}"
                   onclick="event.preventDefault();
                                                     document.getElementById('logout-form').submit();">
                    <i class="icon icon-share-alt"></i><span class="text">Logout</span>
                </a>

                <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
                    {{ csrf_field() }}
                </form>
            </li>
        </ul>
    </div>
    <!--close-top-Header-menu-->

    <sidebar></sidebar>

    <div id="content">
        <div id="content-header">
            @yield('breadcrumbs')
        </div>
        <div class="container-fluid">
            @yield('content')
        </div>
    </div>
</div>

    @yield('footer')

    @yield('script')
</body>
</html>
