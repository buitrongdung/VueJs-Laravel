<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class TypeMenu extends Model
{
    protected $table = 'type_menu';
    protected $visible = ['id', 'alias', 'name'];
    public $timestamps = false;

    public function menu ()
    {
        return $this->hasMany('App\Menu', 'id_type', 'id');
    }
}
