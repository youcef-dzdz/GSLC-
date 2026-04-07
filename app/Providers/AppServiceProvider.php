<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        View::composer('*', function ($view) {
            $lang   = session('gslc_lang', 'fr');
            $isRtl  = $lang === 'ar';

            $dict = [
                // ── Layout / sidebar ────────────────────────────────────
                'Dashboard'          => ['fr' => 'Dashboard',         'en' => 'Dashboard',         'ar' => 'لوحة القيادة'],
                'Clients'            => ['fr' => 'Clients',           'en' => 'Customers',         'ar' => 'العملاء'],
                'Demandes'           => ['fr' => 'Demandes',          'en' => 'Requests',          'ar' => 'الطلبات'],
                'Devis'              => ['fr' => 'Devis',             'en' => 'Quotes',            'ar' => 'عروض الأسعار'],
                'Contrats'           => ['fr' => 'Contrats',          'en' => 'Contracts',         'ar' => 'العقود'],
                'Mes Demandes'       => ['fr' => 'Mes Demandes',      'en' => 'My Requests',       'ar' => 'طلباتي'],
                'Mes Devis'          => ['fr' => 'Mes Devis',         'en' => 'My Quotes',         'ar' => 'عروضي'],
                'Mes Contrats'       => ['fr' => 'Mes Contrats',      'en' => 'My Contracts',      'ar' => 'عقودي'],
                'Mes Factures'       => ['fr' => 'Mes Factures',      'en' => 'My Invoices',       'ar' => 'فواتيري'],
                'Mes Conteneurs'     => ['fr' => 'Mes Conteneurs',    'en' => 'My Containers',     'ar' => 'حاوياتي'],
                'Déconnexion'        => ['fr' => 'Déconnexion',       'en' => 'Logout',            'ar' => 'تسجيل الخروج'],
                'Pages'              => ['fr' => 'Pages',             'en' => 'Pages',             'ar' => 'الصفحات'],
                'Rechercher...'      => ['fr' => 'Rechercher...',     'en' => 'Search...',         'ar' => 'بحث...'],
                'Succès'             => ['fr' => 'Succès',            'en' => 'Success',           'ar' => 'نجاح'],

                // ── Common actions / labels ─────────────────────────────
                'Voir'               => ['fr' => 'Voir',              'en' => 'View',              'ar' => 'عرض'],
                'Actions'            => ['fr' => 'Actions',           'en' => 'Actions',           'ar' => 'الإجراءات'],
                'Statut'             => ['fr' => 'Statut',            'en' => 'Status',            'ar' => 'الحالة'],
                'Référence'          => ['fr' => 'Référence',         'en' => 'Reference',         'ar' => 'المرجع'],
                'Date'               => ['fr' => 'Date',              'en' => 'Date',              'ar' => 'التاريخ'],
                'Montant'            => ['fr' => 'Montant',           'en' => 'Amount',            'ar' => 'المبلغ'],
                'Type'               => ['fr' => 'Type',              'en' => 'Type',              'ar' => 'النوع'],
                'Filtrer'            => ['fr' => 'Filtrer',           'en' => 'Filter',            'ar' => 'تصفية'],
                'Réinitialiser'      => ['fr' => 'Réinitialiser',     'en' => 'Reset',             'ar' => 'إعادة تعيين'],
                'Tous les statuts'   => ['fr' => 'Tous les statuts',  'en' => 'All statuses',      'ar' => 'جميع الحالات'],
                'Portail client NASHCO' => ['fr' => 'Portail client NASHCO', 'en' => 'NASHCO Client Portal', 'ar' => 'بوابة عملاء NASHCO'],
                'Tout voir'          => ['fr' => 'Tout voir',         'en' => 'View all',          'ar' => 'عرض الكل'],
                'Aucun élément à afficher pour le moment.' => [
                    'fr' => 'Aucun élément à afficher pour le moment.',
                    'en' => 'No items to display at the moment.',
                    'ar' => 'لا توجد عناصر للعرض في الوقت الحالي.',
                ],

                // ── Dashboard ───────────────────────────────────────────
                'Bienvenue'          => ['fr' => 'Bienvenue',         'en' => 'Welcome',           'ar' => 'مرحباً'],
                'Portail client NASHCO —' => ['fr' => 'Portail client NASHCO —', 'en' => 'NASHCO Client Portal —', 'ar' => 'بوابة عملاء NASHCO —'],
                'Total soumis'       => ['fr' => 'Total soumis',      'en' => 'Total submitted',   'ar' => 'إجمالي المقدمة'],
                'Contrats actifs'    => ['fr' => 'Contrats actifs',   'en' => 'Active contracts',  'ar' => 'العقود النشطة'],
                'En vigueur'         => ['fr' => 'En vigueur',        'en' => 'In force',          'ar' => 'سارية المفعول'],
                'Factures ouvertes'  => ['fr' => 'Factures ouvertes', 'en' => 'Open invoices',     'ar' => 'الفواتير المفتوحة'],
                'En attente de paiement' => ['fr' => 'En attente de paiement', 'en' => 'Pending payment', 'ar' => 'في انتظار الدفع'],
                'Solde dû'           => ['fr' => 'Solde dû',          'en' => 'Balance due',       'ar' => 'الرصيد المستحق'],
                'DZD restant'        => ['fr' => 'DZD restant',       'en' => 'DZD remaining',     'ar' => 'دج متبقية'],
                'Dernières demandes' => ['fr' => 'Dernières demandes','en' => 'Latest requests',   'ar' => 'آخر الطلبات'],
                'Aucune demande soumise' => ['fr' => 'Aucune demande soumise', 'en' => 'No requests submitted', 'ar' => 'لا توجد طلبات مقدمة'],
                'Actions rapides'    => ['fr' => 'Actions rapides',   'en' => 'Quick actions',     'ar' => 'إجراءات سريعة'],
                'Nouvelle demande'   => ['fr' => 'Nouvelle demande',  'en' => 'New request',       'ar' => 'طلب جديد'],
                'Mes demandes'       => ['fr' => 'Mes demandes',      'en' => 'My requests',       'ar' => 'طلباتي'],
                'Mes devis'          => ['fr' => 'Mes devis',         'en' => 'My quotes',         'ar' => 'عروضي'],
                'Mes factures'       => ['fr' => 'Mes factures',      'en' => 'My invoices',       'ar' => 'فواتيري'],
                'Mes conteneurs'     => ['fr' => 'Mes conteneurs',    'en' => 'My containers',     'ar' => 'حاوياتي'],

                // ── Demands page ────────────────────────────────────────
                'Mes demandes d\'importation' => ['fr' => 'Mes demandes d\'importation', 'en' => 'My import requests', 'ar' => 'طلبات الاستيراد الخاصة بي'],
                'N° dossier...'      => ['fr' => 'N° dossier...',     'en' => 'File no...',        'ar' => 'رقم الملف...'],
                'N° Dossier'         => ['fr' => 'N° Dossier',        'en' => 'File No.',          'ar' => 'رقم الملف'],
                'Priorité'           => ['fr' => 'Priorité',          'en' => 'Priority',          'ar' => 'الأولوية'],
                'Soumis le'          => ['fr' => 'Soumis le',         'en' => 'Submitted on',      'ar' => 'تاريخ التقديم'],
                'Détail'             => ['fr' => 'Détail',            'en' => 'Detail',            'ar' => 'التفاصيل'],
                'Normale'            => ['fr' => 'Normale',           'en' => 'Normal',            'ar' => 'عادية'],
                'Soumettre une demande' => ['fr' => 'Soumettre une demande', 'en' => 'Submit a request', 'ar' => 'تقديم طلب'],

                // ── Quotes page ─────────────────────────────────────────
                'Consultez et gérez vos devis' => ['fr' => 'Consultez et gérez vos devis', 'en' => 'View and manage your quotes', 'ar' => 'عرض وإدارة عروض الأسعار'],
                'Conteneurs'         => ['fr' => 'Conteneurs',        'en' => 'Containers',        'ar' => 'الحاويات'],
                'Montant TTC'        => ['fr' => 'Montant TTC',       'en' => 'Total incl. VAT',   'ar' => 'المبلغ شامل الضريبة'],
                'En attente'         => ['fr' => 'En attente',        'en' => 'Pending',           'ar' => 'قيد الانتظار'],
                'En négociation'     => ['fr' => 'En négociation',    'en' => 'Under negotiation', 'ar' => 'قيد التفاوض'],
                'Accepté'            => ['fr' => 'Accepté',           'en' => 'Accepted',          'ar' => 'مقبول'],
                'Refusé'             => ['fr' => 'Refusé',            'en' => 'Rejected',          'ar' => 'مرفوض'],
                'Modifié'            => ['fr' => 'Modifié',           'en' => 'Modified',          'ar' => 'معدّل'],
                'Expiré'             => ['fr' => 'Expiré',            'en' => 'Expired',           'ar' => 'منتهي الصلاحية'],
                'Brouillon'          => ['fr' => 'Brouillon',         'en' => 'Draft',             'ar' => 'مسودة'],
                'Annulé'             => ['fr' => 'Annulé',            'en' => 'Cancelled',         'ar' => 'ملغى'],
                'Accepter'           => ['fr' => 'Accepter',          'en' => 'Accept',            'ar' => 'قبول'],
                'Rejeter'            => ['fr' => 'Rejeter',           'en' => 'Reject',            'ar' => 'رفض'],
                'Modifier'           => ['fr' => 'Modifier',          'en' => 'Modify',            'ar' => 'تعديل'],
                'Les devis apparaîtront ici une fois générés par notre équipe.' => [
                    'fr' => 'Les devis apparaîtront ici une fois générés par notre équipe.',
                    'en' => 'Quotes will appear here once generated by our team.',
                    'ar' => 'ستظهر عروض الأسعار هنا بمجرد إنشائها من قبل فريقنا.',
                ],

                // ── Contracts page ──────────────────────────────────────
                'Suivi de vos contrats d\'importation' => ['fr' => 'Suivi de vos contrats d\'importation', 'en' => 'Track your import contracts', 'ar' => 'متابعة عقود الاستيراد الخاصة بك'],
                'Référence contrat'  => ['fr' => 'Référence contrat', 'en' => 'Contract ref.',     'ar' => 'مرجع العقد'],
                'Date début'         => ['fr' => 'Date début',        'en' => 'Start date',        'ar' => 'تاريخ البدء'],
                'Date fin'           => ['fr' => 'Date fin',          'en' => 'End date',          'ar' => 'تاريخ الانتهاء'],
                'Montant total'      => ['fr' => 'Montant total',     'en' => 'Total amount',      'ar' => 'المبلغ الإجمالي'],
                'À signer'           => ['fr' => 'À signer',          'en' => 'To sign',           'ar' => 'للتوقيع'],
                'Actif'              => ['fr' => 'Actif',             'en' => 'Active',            'ar' => 'نشط'],
                'Terminé'            => ['fr' => 'Terminé',           'en' => 'Completed',         'ar' => 'منتهي'],
                'Résilié'            => ['fr' => 'Résilié',           'en' => 'Terminated',        'ar' => 'مفسوخ'],
                'Suspendu'           => ['fr' => 'Suspendu',          'en' => 'Suspended',         'ar' => 'معلق'],
                'Signer'             => ['fr' => 'Signer',            'en' => 'Sign',              'ar' => 'توقيع'],
                'Vos contrats apparaîtront ici après acceptation d\'un devis.' => [
                    'fr' => 'Vos contrats apparaîtront ici après acceptation d\'un devis.',
                    'en' => 'Your contracts will appear here after a quote is accepted.',
                    'ar' => 'ستظهر عقودك هنا بعد قبول عرض سعر.',
                ],

                // ── Invoices page ───────────────────────────────────────
                'Historique et téléchargement de vos factures' => ['fr' => 'Historique et téléchargement de vos factures', 'en' => 'Invoice history and downloads', 'ar' => 'سجل الفواتير والتنزيلات'],
                'N° Facture'         => ['fr' => 'N° Facture',        'en' => 'Invoice No.',       'ar' => 'رقم الفاتورة'],
                'Émission'           => ['fr' => 'Émission',          'en' => 'Issue date',        'ar' => 'تاريخ الإصدار'],
                'Échéance'           => ['fr' => 'Échéance',          'en' => 'Due date',          'ar' => 'تاريخ الاستحقاق'],
                'Montant HT'         => ['fr' => 'Montant HT',        'en' => 'Amount excl. VAT',  'ar' => 'المبلغ بدون ضريبة'],
                'TVA 19%'            => ['fr' => 'TVA 19%',           'en' => 'VAT 19%',           'ar' => 'الضريبة 19٪'],
                'En retard'          => ['fr' => 'En retard',         'en' => 'Overdue',           'ar' => 'متأخرة'],
                'Payée'              => ['fr' => 'Payée',             'en' => 'Paid',              'ar' => 'مدفوعة'],
                'Émise'              => ['fr' => 'Émise',             'en' => 'Issued',            'ar' => 'صادرة'],
                'Annulée'            => ['fr' => 'Annulée',           'en' => 'Cancelled',         'ar' => 'ملغاة'],
                'Vos factures apparaîtront ici une fois générées par notre équipe financière.' => [
                    'fr' => 'Vos factures apparaîtront ici une fois générées par notre équipe financière.',
                    'en' => 'Your invoices will appear here once generated by our finance team.',
                    'ar' => 'ستظهر فواتيرك هنا بمجرد إنشائها من قبل فريقنا المالي.',
                ],

                // ── Containers page ─────────────────────────────────────
                'Suivi de vos conteneurs en location' => ['fr' => 'Suivi de vos conteneurs en location', 'en' => 'Track your rented containers', 'ar' => 'متابعة الحاويات المؤجرة'],
                'Taille'             => ['fr' => 'Taille',            'en' => 'Size',              'ar' => 'الحجم'],
                'État'               => ['fr' => 'État',              'en' => 'Condition',         'ar' => 'الحالة'],
                'Propriétaire'       => ['fr' => 'Propriétaire',      'en' => 'Owner',             'ar' => 'المالك'],
                'Disponible'         => ['fr' => 'Disponible',        'en' => 'Available',         'ar' => 'متاحة'],
                'En location'        => ['fr' => 'En location',       'en' => 'On rent',           'ar' => 'مؤجرة'],
                'En transit'         => ['fr' => 'En transit',        'en' => 'In transit',        'ar' => 'في العبور'],
                'En maintenance'     => ['fr' => 'En maintenance',    'en' => 'In maintenance',    'ar' => 'في الصيانة'],
                'Réservé'            => ['fr' => 'Réservé',           'en' => 'Reserved',          'ar' => 'محجوزة'],
                'Hors service'       => ['fr' => 'Hors service',      'en' => 'Out of service',    'ar' => 'خارج الخدمة'],
                'Les conteneurs associés à vos contrats apparaîtront ici.' => [
                    'fr' => 'Les conteneurs associés à vos contrats apparaîtront ici.',
                    'en' => 'Containers linked to your contracts will appear here.',
                    'ar' => 'ستظهر الحاويات المرتبطة بعقودك هنا.',
                ],

                // ── Status labels (demands) ─────────────────────────────
                'SOUMISE'            => ['fr' => 'Soumise',           'en' => 'Submitted',         'ar' => 'مقدمة'],
                'EN_COURS'           => ['fr' => 'En cours',          'en' => 'In progress',       'ar' => 'جاري المعالجة'],
                'TRAITEE'            => ['fr' => 'Traitée',           'en' => 'Processed',         'ar' => 'معالجة'],
                'ANNULEE'            => ['fr' => 'Annulée',           'en' => 'Cancelled',         'ar' => 'ملغاة'],
                'URGENTE'            => ['fr' => 'URGENTE',           'en' => 'URGENT',            'ar' => 'عاجل'],
            ];

            $t = fn (string $key) => $dict[$key][$lang] ?? $key;

            $view->with([
                'lang'   => $lang,
                'isRtl'  => $isRtl,
                't'      => $t,
            ]);
        });
    }
}
