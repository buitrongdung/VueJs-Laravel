<?php
/**
 * Created by PhpStorm.
 * User: Dzung
 * Date: 05-Apr-18
 * Time: 11:28 PM
 */

namespace App\Http\Controllers;
use App\Employee;


class EmployeeController extends Controller
{
    public function index()
    {
        $all = Employee::getListEmp();
        return $all;
    }

    public function getType()
    {
        $all = Employee::getTypeEmp();
        return $all;
    }

}