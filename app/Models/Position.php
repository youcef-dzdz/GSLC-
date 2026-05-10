<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasCorbeille;

class Position extends Model
{
    use SoftDeletes, HasCorbeille;
    protected $fillable = ['title', 'description', 'department_id'];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function users()
    {
        return $this->hasMany(User::class, 'position_id');
    }
}
