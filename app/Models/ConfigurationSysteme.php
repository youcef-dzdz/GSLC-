<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConfigurationSysteme extends Model
{
    use HasFactory;

    protected $table = 'configuration_systeme';

    protected $fillable = [
        'cle',
        'valeur',
        'type_valeur',
        'description',
        'modifiable',
    ];

    protected function casts(): array
    {
        return [
            'modifiable' => 'boolean',
        ];
    }

    // Méthode utilitaire pour récupérer une valeur par clé
    public static function getValeur(string $cle, $defaut = null)
    {
        $config = self::where('cle', $cle)->first();
        if (!$config) return $defaut;

        return match($config->type_valeur) {
            'INTEGER' => (int) $config->valeur,
            'DECIMAL' => (float) $config->valeur,
            'BOOLEAN' => filter_var($config->valeur, FILTER_VALIDATE_BOOLEAN),
            default   => $config->valeur,
        };
    }
}