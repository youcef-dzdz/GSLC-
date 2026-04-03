@extends('layouts.gslc')
@section('page_title', 'Permissions — ' . $user->prenom . ' ' . $user->nom)

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Permissions de l'agent</h1>
        <p class="text-sm text-[#6B7280]">{{ $user->prenom }} {{ $user->nom }} — {{ $user->role?->nom_role }}</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('blade.admin.users') }}"
           class="bg-white border border-[#CBD5E1] text-[#0D1F3C] hover:bg-[#F0F4F8] rounded-lg px-3 py-2 text-sm transition-colors flex items-center gap-2">
            <i class="fas fa-arrow-left text-[#CFA030]"></i> Retour
        </a>
        <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
    </div>
</div>

<div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-3">
    <i class="fas fa-info-circle text-amber-500 mt-0.5 flex-shrink-0"></i>
    <div>
        <p class="text-sm font-medium text-amber-800">Agent : accès granulaire</p>
        <p class="text-xs text-amber-700 mt-0.5">
            Les agents ont uniquement les permissions explicitement cochées ci-dessous.
            Les responsables ont toujours accès complet à leur service.
        </p>
    </div>
</div>

<form method="POST" action="{{ route('blade.admin.users.permissions.save', $user->id) }}">
    @csrf

    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-5">
        @php
            $resourceLabels = [
                'clients'    => ['label' => 'Clients',      'icon' => 'fa-building'],
                'demands'    => ['label' => 'Demandes',     'icon' => 'fa-inbox'],
                'quotes'     => ['label' => 'Devis',        'icon' => 'fa-file-alt'],
                'contracts'  => ['label' => 'Contrats',     'icon' => 'fa-file-contract'],
                'containers' => ['label' => 'Conteneurs',   'icon' => 'fa-box'],
                'invoices'   => ['label' => 'Factures',     'icon' => 'fa-file-invoice'],
                'payments'   => ['label' => 'Paiements',    'icon' => 'fa-credit-card'],
                'vessels'    => ['label' => 'Navires',      'icon' => 'fa-ship'],
                'movements'  => ['label' => 'Mouvements',  'icon' => 'fa-exchange-alt'],
                'users'      => ['label' => 'Utilisateurs', 'icon' => 'fa-users'],
                'audit'      => ['label' => 'Audit',        'icon' => 'fa-history'],
            ];
            $actionLabels = [
                'view'       => 'Consulter',
                'create'     => 'Créer',
                'edit'       => 'Modifier',
                'delete'     => 'Supprimer',
                'approve'    => 'Approuver',
                'emit'       => 'Émettre',
                'transition' => 'Changer statut',
                'block'      => 'Bloquer/Débloquer',
            ];
        @endphp

        @foreach($allPermissions as $resource => $actions)
        @php $meta = $resourceLabels[$resource] ?? ['label' => ucfirst($resource), 'icon' => 'fa-circle']; @endphp
        <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div class="bg-[#0D1F3C] px-4 py-2.5 flex items-center gap-2">
                <i class="fas {{ $meta['icon'] }} text-[#CFA030] text-sm"></i>
                <span class="text-white text-sm font-semibold">{{ $meta['label'] }}</span>
                <button type="button" onclick="toggleGroup('{{ $resource }}')"
                        class="ml-auto text-xs text-[#CFA030] hover:text-white transition-colors">
                    Tout / Rien
                </button>
            </div>
            <div class="p-4 space-y-2.5" id="group-{{ $resource }}">
                @foreach($actions as $action)
                @php
                    $key = "{$resource}.{$action}";
                    $isChecked = isset($userPermissions[$key]) ? (bool) $userPermissions[$key]->valeur : false;
                @endphp
                <label class="flex items-center gap-2.5 cursor-pointer group">
                    <input type="checkbox" name="permissions[{{ $key }}]" value="1"
                           class="perm-{{ $resource }} w-4 h-4 rounded text-[#1A4A8C] border-[#CBD5E1] focus:ring-[#1A4A8C] cursor-pointer"
                           {{ $isChecked ? 'checked' : '' }}>
                    <span class="text-sm text-[#374151] group-hover:text-[#0D1F3C]">
                        {{ $actionLabels[$action] ?? ucfirst($action) }}
                    </span>
                </label>
                @endforeach
            </div>
        </div>
        @endforeach
    </div>

    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 flex items-center justify-between">
        <div class="flex gap-3">
            <button type="button" onclick="selectAll(true)"
                    class="text-xs text-[#1A4A8C] hover:text-[#0D1F3C] underline">Tout sélectionner</button>
            <span class="text-[#CBD5E1]">|</span>
            <button type="button" onclick="selectAll(false)"
                    class="text-xs text-[#6B7280] hover:text-[#0D1F3C] underline">Tout désélectionner</button>
        </div>
        <button type="submit"
                class="bg-[#CFA030] hover:bg-[#b8881f] text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-save"></i> Enregistrer les permissions
        </button>
    </div>
</form>

@push('scripts')
<script>
function toggleGroup(resource) {
    const boxes = document.querySelectorAll('.perm-' + resource);
    const anyChecked = Array.from(boxes).some(b => b.checked);
    boxes.forEach(b => b.checked = !anyChecked);
}
function selectAll(state) {
    document.querySelectorAll('input[type="checkbox"]').forEach(b => b.checked = state);
}
</script>
@endpush

@endsection
