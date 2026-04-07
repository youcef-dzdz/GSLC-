<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Enums\ContactObjet;
use App\Enums\ContactStatut;

class ContactMessage extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'nom_complet',
        'entreprise',
        'email',
        'objet',
        'message',
        'statut',
        'ip_address',
    ];

    protected $casts = [
        'objet' => ContactObjet::class,
        'statut' => ContactStatut::class,
        'lu_le' => 'datetime',
    ];

    public function scopeUnread($query)
    {
        return $query->where('statut', ContactStatut::NON_LU);
    }

    public function markAsRead(User $user)
    {
        $this->statut = ContactStatut::LU;
        $this->lu_par = $user->id;
        $this->lu_le = now();
        $this->save();
    }

    public function reader()
    {
        return $this->belongsTo(User::class, 'lu_par');
    }
}
