<?php
namespace App\Enums;

enum ContactObjet: string
{
    case DEMANDE_LOCATION = 'demande_location';
    case DEMANDE_DEVIS = 'demande_devis';
    case SUIVI_EXPEDITION = 'suivi_expedition';
    case INFORMATION_SERVICES = 'information_services';
    case RECLAMATION = 'reclamation';
    case AUTRE = 'autre';
}
