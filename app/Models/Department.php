<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasCorbeille;

class Department extends Model
{
    use SoftDeletes, HasCorbeille;
    protected $fillable = ['name', 'code', 'description', 'responsable_id'];

    public function responsable()
    {
        return $this->belongsTo(User::class, 'responsable_id');
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
