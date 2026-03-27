<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeNotification extends Model
{
    use HasFactory;

    protected $table = 'types_notification';

    protected $fillable = [
        'code',
        'libelle',
        'priorite',
        'canal_defaut',
        'template_message',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'actif' => 'boolean',
        ];
    }

    // Un type a plusieurs notifications
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}