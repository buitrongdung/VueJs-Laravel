<?php

namespace App;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $table = 'employee';
    protected $visible = ['id', 'name', 'type_id', 'image', 'email', 'gender', 'account', 'phone'];

    protected $selectSql = "SELECT te.name AS type_name, e.* FROM employee AS e JOIN type_employee AS te ON e.type_id = te.id ORDER BY e.name";
    public static function getListEmp()
    {
        $instance = new static;
        $listEmp = DB::select($instance->selectSql);
        return $listEmp;
    }

    public static function getTypeEmp()
    {
        $listAll = DB::table('type_employee')->get();
        return $listAll;
    }
}
