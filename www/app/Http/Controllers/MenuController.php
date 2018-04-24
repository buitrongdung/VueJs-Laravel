<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Menu;
use App\TypeMenu;

class MenuController extends Controller
{
    public function index()
    {
        $getAll = TypeMenu::all();
        return $getAll;
    }
    public function getCategory ($id)
    {
        $menu = TypeMenu::find($id)->menu;
        if ($menu->isEmpty()) {
            return response('No menu', 404);
        }
        return $menu;
    }

}
