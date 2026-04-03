<?php

return [
    'clients'    => ['view', 'create', 'edit', 'delete'],
    'demands'    => ['view', 'create', 'edit', 'delete'],
    'quotes'     => ['view', 'create', 'edit', 'approve'],
    'contracts'  => ['view', 'create', 'edit', 'approve'],
    'containers' => ['view', 'edit', 'transition'],
    'invoices'   => ['view', 'create', 'emit'],
    'payments'   => ['view', 'create'],
    'vessels'    => ['view', 'create', 'edit'],
    'movements'  => ['view'],
    'users'      => ['view', 'create', 'edit', 'block'],
    'audit'      => ['view'],
];
