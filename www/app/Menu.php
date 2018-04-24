<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Menu extends Model
{
    protected $table = 'menu';

    protected $visible = ['id', 'name', 'image', 'id_type'];
    public $timestamps = false;
//    protected $appends = ['time'];

//    public function getTimeAttribute()
//    {
//        return $this->created_at->timestamp;
//    }

    public function typeMenu ()
    {
        return $this->belongsTo('App\TypeMenu', 'id', 'id_type');
    }

    public static function numMenu()
    {
        $instance =  new static;
        return DB::table($instance->table)->count();
    }

    public static function getAll()
    {
        $instance = new static;
        return DB::table($instance->table)->all();
    }
}
