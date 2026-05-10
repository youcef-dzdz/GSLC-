<?php
$admin = \App\Models\User::where('email', 'admin@nashco.dz')->first();
if ($admin) {
    $admin->email = 'gslc.admin@gmail.com';
    $admin->password = bcrypt('Gslcadmin1990@');
    $admin->save();
    echo "Admin updated: " . $admin->email;
} else {
    echo "Admin not found";
}
