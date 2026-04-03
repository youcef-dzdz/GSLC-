<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->truncate();
        DB::table('clients')->truncate();

        // Fetch role IDs — our roles table uses 'label' as the slug
        $roles = DB::table('roles')->pluck('id', 'label');

        $users = [
            [
                'nom'                => 'Brahimi',
                'prenom'             => 'Karim',
                'email'              => 'admin@nashco.dz',
                'password'           => Hash::make('password'),
                'role_id'            => $roles['admin'],
                'statut'             => 'ACTIF',
                'tentatives_echouees'=> 0,
                'created_at'         => now(),
                'updated_at'         => now(),
            ],
            [
                'nom'                => 'Benali',
                'prenom'             => 'Mourad',
                'email'              => 'directeur@nashco.dz',
                'password'           => Hash::make('password'),
                'role_id'            => $roles['directeur'],
                'statut'             => 'ACTIF',
                'tentatives_echouees'=> 0,
                'created_at'         => now(),
                'updated_at'         => now(),
            ],
            [
                'nom'                => 'Khelifi',
                'prenom'             => 'Samir',
                'email'              => 'commercial@nashco.dz',
                'password'           => Hash::make('password'),
                'role_id'            => $roles['commercial'],
                'statut'             => 'ACTIF',
                'tentatives_echouees'=> 0,
                'created_at'         => now(),
                'updated_at'         => now(),
            ],
            [
                'nom'                => 'Meguellati',
                'prenom'             => 'Yacine',
                'email'              => 'logistique@nashco.dz',
                'password'           => Hash::make('password'),
                'role_id'            => $roles['logistique'],
                'statut'             => 'ACTIF',
                'tentatives_echouees'=> 0,
                'created_at'         => now(),
                'updated_at'         => now(),
            ],
            [
                'nom'                => 'Rahmani',
                'prenom'             => 'Farid',
                'email'              => 'financier@nashco.dz',
                'password'           => Hash::make('password'),
                'role_id'            => $roles['financier'],
                'statut'             => 'ACTIF',
                'tentatives_echouees'=> 0,
                'created_at'         => now(),
                'updated_at'         => now(),
            ],
            [
                'nom'                => 'Hadj Aissa',
                'prenom'             => 'Nabil',
                'email'              => 'client@nashco.dz',
                'password'           => Hash::make('password'),
                'role_id'            => $roles['client'],
                'statut'             => 'ACTIF',
                'tentatives_echouees'=> 0,
                'created_at'         => now(),
                'updated_at'         => now(),
            ],
        ];

        foreach ($users as $userData) {
            DB::table('users')->insert($userData);
        }

        // Also fix role lookup — our roles table uses 'label' not 'slug'
        $roles = DB::table('roles')->pluck('id', 'label');

        // Create Client record for the client user
        $clientUser = DB::table('users')->where('email', 'client@nashco.dz')->first();
        $algerie    = DB::table('pays')->where('code_iso', 'DZ')->first();
        $adminUser  = DB::table('users')->where('email', 'admin@nashco.dz')->first();

        DB::table('clients')->insert([
            'user_id'            => $clientUser->id,
            'raison_sociale'     => 'SARL Import Express Mostaganem',
            'nif'                => '002712345678901',
            'nis'                => '27121234567',
            'rc'                 => 'RC/27/B/00123/2021',
            'adresse_siege'      => '12 Rue des Frères Bouadma, Mostaganem 27000',
            'ville'              => 'Mostaganem',
            'pays_id'            => $algerie->id,
            'type_client'        => 'ENTREPRISE',
            'rep_nom'            => 'Hadj Aissa',
            'rep_prenom'         => 'Nabil',
            'rep_role'           => 'Gérant',
            'rep_tel'            => '+213 550 12 34 56',
            'rep_email'          => 'n.hadjaissa@import-express-mosta.dz',
            'rep_adresse_perso'  => '5 Cité des Palmiers, Mostaganem',
            'statut'             => 'APPROUVE',
            'valide_par_user_id' => $adminUser->id,
            'date_validation'    => now(),
            'motif_rejet'        => null,
            'created_at'         => now(),
            'updated_at'         => now(),
        ]);

        $this->command->info('✅ 6 utilisateurs créés (admin, directeur, commercial, logistique, financier, client).');
        $this->command->info('✅ 1 fiche client créée pour client@nashco.dz.');
    }
}
