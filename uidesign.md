# uidesign.md — NASHCO / GSLC Design System
> This file is the single source of truth for all UI decisions.
> Claude Code must read this file before building any page or component.
> Never hardcode a color, spacing value, shadow, or font size that is not defined here.
> All values must be applied via Tailwind classes. Custom values are listed with their approved Tailwind arbitrary syntax.

---

## 🎨 Color Palette

### Brand Colors
| Token | Hex | Usage |
|---|---|---|
| `gold` | `#C8960A` | Active sidebar item, KPI accent (important), avatar bg, chart recent bars, panel links, rate values, scrollbar thumb, module group headers (logistique) |
| `gold-dark` | `#A87A08` | Scrollbar thumb hover |
| `gold-light` | `#FFF3C0` | KPI icon background (gold variant), role badge background |
| `gold-dark-text` | `#7A5800` | Role badge text, gold-light text contrast |
| `navy` | `#0D2A5E` | Primary text, page titles, KPI values, panel titles, button backgrounds, department avatars (COM/DIR) |

### Background Colors
| Token | Hex | Tailwind | Usage |
|---|---|---|---|
| `page-bg` | `#F4F9FF` | `bg-[#F4F9FF]` | Main content area background |
| `sidebar-bg` | `#EDF4FF` | `bg-[#EDF4FF]` | Sidebar background — never dark |
| `sidebar-hover` | `#D8ECFF` | `bg-[#D8ECFF]` | Sidebar item hover + scrollbar track |
| `topbar-bg` | `#FFFFFF` | `bg-white` | Topbar — always pure white |
| `card-bg` | `#FFFFFF` | `bg-white` | All cards, KPI cards, panels |
| `divider-subtle` | `#EEF5FF` | `bg-[#EEF5FF]` | Row dividers, skeleton loader bg |
| `table-header-bg` | `#F8FAFC` | `bg-[#F8FAFC]` | All table thead backgrounds |
| `page-header-bg` | `#EDF4FF` | `bg-[#EDF4FF]` | Page section header banners |

### Border Colors
| Token | Hex | Tailwind | Usage |
|---|---|---|---|
| `border-primary` | `#C5D8F5` | `border-[#C5D8F5]` | All card borders, sidebar border, topbar border, input borders, avatar pill |
| `border-table` | `#E2E8F0` | `border-[#E2E8F0]` | Table header bottom border, table row dividers |

### Text Colors
| Token | Hex | Tailwind | Usage |
|---|---|---|---|
| `text-primary` | `#0D2A5E` | `text-[#0D2A5E]` | Titles, values, strong labels, table header text |
| `text-secondary` | `#3A5A8A` | `text-[#3A5A8A]` | Sidebar items default, body text, module headers (admin) |
| `text-muted` | `#5A80BB` | `text-[#5A80BB]` | Sidebar subtitle, user role, secondary labels, module headers (finance) |
| `text-subtle` | `#88A8D0` | `text-[#88A8D0]` | Timestamps, meta text, section labels, chart legends, breadcrumb parent, NASHCO·GSLC brand text |
| `text-label` | `#6A90C0` | `text-[#6A90C0]` | KPI uppercase labels |

### Status / Semantic Colors
| Token | Hex | Usage |
|---|---|---|
| `status-online-bg` | `#E6F7F0` | System online badge background |
| `status-online-border` | `#A8DFC4` | System online badge border |
| `status-online-text` | `#2A8A5A` | System online badge text + dot, department avatars (FIN), module headers (commercial) |

### Semantic State Colors (Standardized)
| State | Type | Hex | Usage |
|---|---|---|---|
| **Success** | Background | `#F0FDF4` | Success/Create badge background |
| | Border | `#BBF7D0` | Success badge border |
| | Text | `#166534` | Success badge text |
| | Accent | `#10B981` | Success icons/accents (Tailwind emerald-500) |
| | Text Dark | `#2A8A5A` | Darker success text/module headers |
| **Error** | Background | `#FFF0F0` | Error/Delete badge background |
| | Bg Alt | `#FEE2E2` | Alternate error background (Tailwind red-100) |
| | Border | `#FECACA` | Error badge border |
| | Text | `#991B1B` | Error badge text |
| | Text Dark | `#8A2020` | Darker error text/module headers |
| | Accent | `#EF4444` | Error icons/accents (Tailwind red-500) |
| **Warning** | Background | `#FFFBEB` | Warning badge background |
| | Bg Alt | `#FEF3C7` | Alternate warning background (Tailwind amber-100) |
| | Accent | `#F59E0B` | Warning icons/accents (Tailwind amber-500) |
| | Text | `#92400E` | Warning badge text |
| **Info** | Background | `#EFF6FF` | Info/Login badge background |
| | Border | `#BFDBFE` | Info badge border |
| | Text | `#1E40AF` | Info badge text |
| | Accent | `#3B82F6` | Info icons/accents (Tailwind blue-500) |

### UI Neutrals
| Hex | Tailwind | Usage |
|---|---|---|
| `#F1F5F9` | `bg-[#F1F5F9]` | Slate-100 (Secondary BG) |
| `#E2E8F0` | `border-[#E2E8F0]` | Slate-200 (Table row dividers/Neutral border) |
| `#64748B` | `text-[#64748B]` | Slate-500 (Muted text/labels) |
| `#94A3B8` | `text-[#94A3B8]` | Slate-400 (Placeholder/Icons) |
| `#F0F7FF` | `bg-[#F0F7FF]` | Subtle blue background |
| `#F9FBFF` | `bg-[#F9FBFF]` | Very light blue background |

### Module Group Header Colors (flat — no gradients)
| Module | Header Bg | Text on header |
|---|---|---|
| admin | `#3A5A8A` | white |
| commercial | `#2A8A5A` | white |
| logistique | `#C8960A` | white |
| finance | `#5A80BB` | white |
| direction | `#8A2020` | white |

> **Rule:** All text/badges rendered ON TOP of a module group header must be `color: white`. Badges use `background: rgba(255,255,255,0.2)`.

### Department Avatar Colors (flat — no gradients)
| Dept code | Color | Usage |
|---|---|---|
| COM | `#0D2A5E` | navy |
| DIR | `#0D2A5E` | navy |
| FIN | `#2A8A5A` | green |
| LOG | `#C8960A` | gold |
| ADMIN | `#5A80BB` | medium blue |
| (none) | `#88A8D0` | subtle blue |

### Tag / Badge Colors
| Tag | Background | Text | Tailwind |
|---|---|---|---|
| LOGIN | `#E0EEFF` | `#1A4A9A` | `bg-[#E0EEFF] text-[#1A4A9A]` |
| SYSTEM | `#EEF5FF` | `#5A80BB` | `bg-[#EEF5FF] text-[#5A80BB]` |
| UPDATE | `#FFF3C0` | `#7A5800` | `bg-[#FFF3C0] text-[#7A5800]` |
| LOGOUT | `#FFF0F0` | `#8A2020` | `bg-[#FFF0F0] text-[#8A2020]` |
| CREATE | `#E6F7F0` | `#2A8A5A` | `bg-[#E6F7F0] text-[#2A8A5A]` |
| DELETE | `#FFF0F0` | `#8A2020` | `bg-[#FFF0F0] text-[#8A2020]` |

### KPI Accent Bar Rule
- **Gold accent** `#C8960A` → important / actionable metrics (revenue, users, key rates)
- **Blue accent** `#C5D8F5` → neutral / informational metrics (pending count, units)

---

## 📐 Layout & Spacing

### App Shell
| Element | Value | Tailwind |
|---|---|---|
| Layout | flex row, full height | `flex h-full` |
| Sidebar width | 210px fixed | `w-[210px] flex-shrink-0` |
| Main area | remaining width | `flex-1 flex flex-col overflow-hidden` |

### Sidebar
| Element | Value | Tailwind |
|---|---|---|
| Background | `#EDF4FF` | `bg-[#EDF4FF]` |
| Right border | 1px `#C5D8F5` | `border-r border-[#C5D8F5]` |
| Header padding | 16px 16px 14px | `px-4 pt-4 pb-[14px]` |
| Section label padding | 14px 16px 4px | `pt-[14px] px-4 pb-1` |
| Item padding | 8px 10px | `py-2 px-[10px]` |
| Item margin | 1px 8px | `my-px mx-2` |
| Item border radius | 8px | `rounded-lg` |
| Active item bg | `#C8960A` | `bg-[#C8960A]` |
| Active item text | white | `text-white` |
| Hover bg | `#D8ECFF` | `bg-[#D8ECFF]` |
| Scrollbar thumb | `#C8960A` | CSS: `background: #C8960A` |
| Scrollbar thumb hover | `#A87A08` | CSS: `background: #A87A08` |
| Scrollbar track | `#D8ECFF` | CSS: `background: #D8ECFF` |
| Footer padding | 12px 16px | `py-3 px-4` |

### Topbar
| Element | Value | Tailwind |
|---|---|---|
| Height | 52px | `h-[52px]` |
| Background | `#FFFFFF` | `bg-white` |
| Bottom border | 1px `#C5D8F5` | `border-b border-[#C5D8F5]` |
| Padding | 0 20px | `px-5` |
| Right items gap | 8px | `gap-2` |
| Left items gap | 16px | `gap-4` |

### Content Area
| Element | Value | Tailwind |
|---|---|---|
| Padding | 20px | `p-5` |
| Background | `#F4F9FF` | `bg-[#F4F9FF]` |
| Page title margin-bottom | 18px | `mb-[18px]` |

### KPI Grid
| Element | Value | Tailwind |
|---|---|---|
| Columns | 4 equal | `grid grid-cols-4` |
| Gap | 12px | `gap-3` |
| Margin-bottom | 16px | `mb-4` |
| Card padding | 14px 16px | `py-[14px] px-4` |
| Card border radius | 12px | `rounded-xl` |
| Accent bar height | 3px | `h-[3px]` |
| Icon wrap size | 34x34px | `w-[34px] h-[34px]` |
| Icon wrap border radius | 10px | `rounded-[10px]` |
| Icon position | absolute top-right | `absolute right-[14px] top-[14px]` |

### Panels Grid
| Element | Value | Tailwind |
|---|---|---|
| Columns | 2 equal | `grid grid-cols-2` |
| Gap | 12px | `gap-3` |
| Panel padding | 14px 16px | `py-[14px] px-4` |
| Panel border radius | 12px | `rounded-xl` |
| Panel header margin-bottom | 12px | `mb-3` |

---

## ✏️ Typography

| Element | Size | Weight | Color | Tailwind |
|---|---|---|---|---|
| Brand name | 14px | 800 | `#0D2A5E` | `text-sm font-extrabold text-[#0D2A5E]` |
| Brand subtitle | 10px | 400 | `#5A80BB` | `text-[10px] text-[#5A80BB]` |
| Sidebar section label | 9px | 700 | `#88A8D0` | `text-[9px] font-bold uppercase tracking-[1.2px] text-[#88A8D0]` |
| Sidebar item | 12px | 400 | `#3A5A8A` | `text-xs text-[#3A5A8A]` |
| Sidebar item (active) | 12px | 600 | `#FFFFFF` | `text-xs font-semibold text-white` |
| Topbar breadcrumb parent | 12px | 400 | `#88A8D0` | `text-xs text-[#88A8D0]` |
| Topbar breadcrumb current | 14px | 700 | `#0D2A5E` | `text-[14px] font-bold text-[#0D2A5E]` |
| Page title | 20px | 800 | `#0D2A5E` | `text-xl font-extrabold text-[#0D2A5E]` |
| Page date / subtitle | 11px | 400 | `#88A8D0` | `text-[11px] text-[#88A8D0]` |
| KPI label | 9px | 700 | `#6A90C0` | `text-[9px] font-bold uppercase tracking-[0.8px] text-[#6A90C0]` |
| KPI value | 26px | 800 | `#0D2A5E` | `text-[26px] font-extrabold text-[#0D2A5E] leading-none` |
| KPI meta | 10px | 400 | `#88A8D0` | `text-[10px] text-[#88A8D0]` |
| Panel title | 12px | 700 | `#0D2A5E` | `text-xs font-bold text-[#0D2A5E]` |
| Panel link | 10px | 600 | `#C8960A` | `text-[10px] font-semibold text-[#C8960A]` |
| Table header | 12px | 700 | `#0D2A5E` | `text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left` |
| Activity name | 11px | 600 | `#0D2A5E` | `text-[11px] font-semibold text-[#0D2A5E]` |
| Activity model | 9px | 400 | `#88A8D0` | `text-[9px] text-[#88A8D0]` |
| Activity tag | 9px | 700 | varies | `text-[9px] font-bold` |
| Activity time | 9px | 400 | `#88A8D0` | `text-[9px] text-[#88A8D0] whitespace-nowrap` |
| User name (footer) | 11px | 600 | `#0D2A5E` | `text-[11px] font-semibold text-[#0D2A5E]` |
| User role (footer) | 9px | 400 | `#5A80BB` | `text-[9px] text-[#5A80BB]` |
| Topbar date | 10px | 400 | `#88A8D0` | `text-[10px] text-[#88A8D0]` |

---

## 🧩 Component Patterns

### Topbar — Enterprise Layout
```tsx
<div className="bg-white border-b border-[#C5D8F5] px-5 h-[52px] flex items-center justify-between flex-shrink-0">
  {/* LEFT: Logo + Breadcrumb */}
  <div className="flex items-center gap-4">
    {/* Brand mark */}
    <button onClick={handleLogoClick} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', padding:0 }}>
      <img src="/images/nashco_logo Company.jpg" alt="NASHCO Logo" style={{ width:80, height:36, borderRadius:6, objectFit:'contain' }} />
    </button>
    {/* Breadcrumb + badges */}
    {user && breadcrumb && (
      <div className="flex items-center gap-[10px]">
        <div className="flex items-center">
          <span className="text-xs text-[#88A8D0]">{breadcrumb.parent}</span>
          <span className="text-[#C5D8F5] text-sm mx-[6px]">›</span>
          <span className="text-[14px] font-bold text-[#0D2A5E]">{pageTitle}</span>
        </div>
        <span className="text-[10px] font-bold px-[9px] py-[2px] rounded-full bg-[#FFF3C0] text-[#7A5800]">{roleBadge}</span>
        <span className="flex items-center gap-[5px] text-[10px] font-semibold text-[#2A8A5A] px-[9px] py-[2px] rounded-full bg-[#E6F7F0] border border-[#A8DFC4]">
          <span className="w-[6px] h-[6px] rounded-full bg-[#2A8A5A]" />
          {t('system.online')}
        </span>
      </div>
    )}
  </div>
  {/* RIGHT: Date + Lang + Bell + User pill */}
  <div className="flex items-center gap-2">
    <span className="text-[10px] text-[#88A8D0]">{date}</span>
    <LanguageSwitcher />
    <NotifButton />
    {/* User pill */}
    <div style={{ display:'flex', alignItems:'center', gap:7, border:'1px solid #C5D8F5', borderRadius:8, padding:'4px 10px 4px 4px', background:'white' }}>
      <span style={{ width:28, height:28, borderRadius:'50%', background:'#C8960A', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>{initials}</span>
      <div>
        <div style={{ fontSize:11, fontWeight:600, color:'#0D2A5E' }}>{name}</div>
        <div style={{ fontSize:9, color:'#5A80BB' }}>{role}</div>
      </div>
      <button onClick={logout} style={{ background:'none', border:'none', cursor:'pointer', color:'#88A8D0', fontSize:14, padding:'0 0 0 4px' }}>→</button>
    </div>
  </div>
</div>
```

### Sidebar Item (default)
```tsx
<div className="flex items-center gap-[9px] py-2 px-[10px] my-px mx-2 rounded-lg text-xs text-[#3A5A8A] cursor-pointer hover:bg-[#D8ECFF] hover:text-[#0D2A5E] transition-all duration-150">
  <span className="w-[5px] h-[5px] rounded-full bg-[#8AACC8] flex-shrink-0" />
  {label}
</div>
```

### Sidebar Item (active)
```tsx
<div className="flex items-center gap-[9px] py-2 px-[10px] my-px mx-2 rounded-lg text-xs font-semibold text-white bg-[#C8960A] cursor-pointer">
  <span className="w-[5px] h-[5px] rounded-full bg-white flex-shrink-0" />
  {label}
</div>
```

### Sidebar Section Label
```tsx
<div className="text-[9px] font-bold uppercase tracking-[1.2px] text-[#88A8D0] pt-[14px] px-4 pb-1">
  {section}
</div>
```

### Sidebar Scrollbar (CSS)
```css
aside::-webkit-scrollbar { width: 4px; }
aside::-webkit-scrollbar-track { background: #D8ECFF; }
aside::-webkit-scrollbar-thumb { background: #C8960A; border-radius: 4px; }
aside::-webkit-scrollbar-thumb:hover { background: #A87A08; }
```

### Sidebar User Footer
```tsx
<div className="mt-auto py-3 px-4 border-t border-[#C5D8F5] flex items-center gap-[9px]">
  <div className="w-[30px] h-[30px] rounded-full bg-[#C8960A] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
    {initials}
  </div>
  <div>
    <div className="text-[11px] font-semibold text-[#0D2A5E]">{name}</div>
    <div className="text-[9px] text-[#5A80BB]">{role}</div>
  </div>
  <span className="ml-auto text-[#88A8D0] cursor-pointer">→</span>
</div>
```

### Language Switcher
```tsx
<div className="flex gap-[3px]">
  {['FR', 'AR', 'EN'].map(lang => (
    <button key={lang} className={`text-[10px] px-2 py-1 rounded-md border font-medium transition-all ${
      active === lang ? 'bg-[#0D2A5E] text-white border-[#0D2A5E]' : 'border-[#C5D8F5] text-[#3A5A8A] bg-transparent'
    }`}>{lang}</button>
  ))}
</div>
```

### KPI Card — Gold (important metric)
```tsx
<div className="bg-white border border-[#C5D8F5] rounded-xl py-[14px] px-4 relative overflow-hidden">
  <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl bg-[#C8960A]" />
  <div className="absolute right-[14px] top-[14px] w-[34px] h-[34px] rounded-[10px] bg-[#FFF3C0] flex items-center justify-center text-[15px]">{icon}</div>
  <div className="text-[9px] font-bold uppercase tracking-[0.8px] text-[#6A90C0] mb-2">{label}</div>
  <div className="text-[26px] font-extrabold text-[#0D2A5E] leading-none">{value}</div>
  <div className="text-[10px] text-[#88A8D0] mt-1">{meta}</div>
</div>
```

### KPI Card — Blue (neutral metric)
```tsx
<div className="bg-white border border-[#C5D8F5] rounded-xl py-[14px] px-4 relative overflow-hidden">
  <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl bg-[#C5D8F5]" />
  <div className="absolute right-[14px] top-[14px] w-[34px] h-[34px] rounded-[10px] bg-[#EEF5FF] flex items-center justify-center text-[15px]">{icon}</div>
  <div className="text-[9px] font-bold uppercase tracking-[0.8px] text-[#6A90C0] mb-2">{label}</div>
  <div className="text-[26px] font-extrabold text-[#0D2A5E] leading-none">{value}</div>
  <div className="text-[10px] text-[#88A8D0] mt-1">{meta}</div>
</div>
```

### Table — Full Pattern
```tsx
<table className="w-full text-sm">
  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
    <tr>
      <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{header}</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-[#EEF5FF]">
    <tr className="hover:bg-[#F4F9FF] transition-colors">
      <td className="px-4 py-3 text-sm text-[#3A5A8A]">{cell}</td>
    </tr>
  </tbody>
</table>
```

### Module Group Header (dark bg — text must be white)
```tsx
<div style={{ background: moduleColor }} className="px-4 py-3 rounded-t-xl flex items-center justify-between">
  <div className="flex items-center gap-3">
    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
      style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
      {moduleCode}
    </span>
    <span className="text-sm font-bold uppercase tracking-wide" style={{ color: 'white' }}>
      {moduleLabel}
    </span>
  </div>
  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
    style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
    {count} permissions
  </span>
</div>
```

### Panel Card
```tsx
<div className="bg-white border border-[#C5D8F5] rounded-xl py-[14px] px-4">
  <div className="flex items-center justify-between mb-3">
    <span className="text-xs font-bold text-[#0D2A5E]">{title}</span>
    <span className="text-[10px] font-semibold text-[#C8960A] cursor-pointer">{linkText} →</span>
  </div>
  {children}
</div>
```

### Page Section Header Banner
```tsx
<div className="bg-[#EDF4FF] border-l-4 border-[#C8960A]" style={{ borderRadius: '0 16px 16px 0', padding: '20px 24px', marginBottom: 24 }}>
  {/* title, subtitle, actions */}
</div>
```

### Activity Row
```tsx
<div className="flex items-center gap-[10px] py-[7px] border-b border-[#EEF5FF] last:border-b-0">
  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: bulletColor }} />
  <div className="flex-1">
    <div className="text-[11px] font-semibold text-[#0D2A5E]">{name}</div>
    <div className="text-[9px] text-[#88A8D0]">{model}</div>
  </div>
  <ActivityTag type={type} />
  <span className="text-[9px] text-[#88A8D0] whitespace-nowrap">{time}</span>
</div>
```

### Activity Tag
```tsx
const tagStyles: Record<string, string> = {
  LOGIN:  'bg-[#E0EEFF] text-[#1A4A9A]',
  SYSTEM: 'bg-[#EEF5FF] text-[#5A80BB]',
  UPDATE: 'bg-[#FFF3C0] text-[#7A5800]',
  LOGOUT: 'bg-[#FFF0F0] text-[#8A2020]',
  CREATE: 'bg-[#E6F7F0] text-[#2A8A5A]',
  DELETE: 'bg-[#FFF0F0] text-[#8A2020]',
};
<span className={`text-[9px] px-[7px] py-[2px] rounded font-bold ${tagStyles[type] ?? 'bg-[#EEF5FF] text-[#5A80BB]'}`}>
  {type}
</span>
```

### Chart Bars (Recharts)
```tsx
// Gold  = recent data   → fill="#C8960A"
// Mid   = transition    → fill="#A0C0E8"
// Blue  = past data     → fill="#C5D8F5"
// Border radius: top only → borderRadius={[4, 4, 0, 0]}
```

### Skeleton Loader
```tsx
<div style={{ background: '#EEF5FF', borderRadius: 12, height: 88 }} />
// No gradients. No shimmer animation. Flat #EEF5FF only.
```

---

## 📏 Border Radius Scale

| Element | Radius | Tailwind |
|---|---|---|
| App shell | 14px | `rounded-[14px]` |
| Cards / panels | 12px | `rounded-xl` |
| Sidebar items | 8px | `rounded-lg` |
| Brand icon | 8px | `rounded-lg` |
| Language buttons | 6px | `rounded-md` |
| KPI icon wrap | 10px | `rounded-[10px]` |
| Activity tags | 4px | `rounded` |
| Role / status badges | pill | `rounded-full` |
| Avatar | circle | `rounded-full` |
| Notification button | 8px | `rounded-lg` |
| Avatar pill (topbar) | 8px | `border-radius: 8px` |

---

## 🚫 Forbidden Patterns

| Forbidden | Correct alternative |
|---|---|
| Any `linear-gradient(...)` anywhere | Flat colors only — no gradients ever |
| Dark sidebar or dark topbar | Sidebar `#EDF4FF`, topbar `#FFFFFF` always |
| `bg-gray-50`, `bg-blue-500` or any generic Tailwind color not in this palette | Use approved hex via arbitrary syntax |
| `style={{ background: '#0B1D3A' }}` or any unapproved inline color | Use `#0D2A5E` (navy) only |
| Spinner / loading circle (`animate-spin`) | Skeleton loader only — flat `#EEF5FF` bg |
| Raw API error rendered to user | Generic translated toast only |
| Missing accent bar on KPI card | Every KPI card must have the 3px top accent bar |
| Dark table headers | `bg-[#F8FAFC] border-b border-[#E2E8F0]` — text `text-[#0D2A5E] font-bold` |
| White text on `th` via global CSS | Global CSS `th { color }` must be `#0D2A5E`, never white |
| Text on dark module header without `color: white` | All text on dark module headers must be white |
| Department avatar gradients (`bg-gradient-to-br`) | Flat hex from department avatar table above |
| `#CFA030`, `#C9A646`, `#C9A84C` (wrong gold variants) | Only `#C8960A` is approved gold |
| `#0B1D3A`, `#0D1F3C`, `#1E3A8A` (unapproved dark navies) | Only `#0D2A5E` is approved navy |
| Any `style={{}}` color not in this file | Not approved — add to this file first, then use |

---

*Last updated: May 4, 2026*
*Design refactor Admin module completed — all patterns verified in production.*
*Any design change must be proposed here first, then applied across all components.*
*Next modules (Commercial, Logistique, Finance, Directeur) must follow this file from day one.*