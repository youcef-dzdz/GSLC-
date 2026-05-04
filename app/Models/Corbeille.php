<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Corbeille extends Model
{
    use HasFactory;

    protected $table = 'corbeille';

    protected $fillable = [
        'model_type',
        'model_id',
        'snapshot',
        'deleted_by',
        'deleted_by_name',
        'deleted_by_email',
        'deleted_by_role',
        'deleted_by_ip',
        'deleted_at_audit',
        'expires_at',
        'restored_at',
        'restored_by',
        'restored_by_name',
        'restored_by_email',
        'restored_by_ip',
    ];

    protected function casts(): array
    {
        return [
            'snapshot'         => 'array',
            'expires_at'       => 'datetime',
            'deleted_at_audit' => 'datetime',
            'restored_at'      => 'datetime',
        ];
    }
}
