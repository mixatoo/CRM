# Template Kit (عزل تام)

نسخة ثابتة ومستقلة من عناصر الواجهة — **ليست مربوطة بالمشروع**.

## الهيكل

```
src/template-kit/
├── primitives/     ← العناصر الأساسية (من design-system)
├── patterns/       ← العناصر المشتقة (جداول، قوائم، نماذج، clients-table)
└── README.md
```

### `primitives/` — القوالب الأساسية
نسخة من `src/design-system/` + الأدوات المساعدة:
- أزرار، حقول، جداول، pagination، badges
- `table-styles`, `DataTableColumnHeader`, `StickyDataTable`
- بدون أي `import` من `@/`

### `patterns/` — القوالب المشتقة
نسخة من `src/features/ui-templates/patterns/` + `clients-table/`:
- `tables/` — TemplateListTable، RowSelectionCheckbox
- `lists/` — ListToolbar، SortDropdownMenu، FacetListPicker
- `forms/`, `clients/`, `buttons/`
- `clients-table/` — خلايا جدول العملاء (AccountNameCell، badges، header UI)
- `stubs/` — بدائل معزولة لأجزاء المشروع (domain، forms) — **لا تستخدم في الإنتاج**

## قواعد العزل

1. **لا imports من `@/`** داخل `template-kit` — فقط مسارات نسبية داخل المجلد
2. **المشروع لا يستورد من `template-kit`** — التعديل في أي طرف لا ينعكس على الآخر
3. عند الانتهاء: احذف مجلد `src/template-kit/` بالكامل

## إعادة التوليد من المصدر

إذا حدّثت `design-system` أو `ui-templates` وتريد snapshot جديد:

```bash
node scripts/build-template-kit.mjs
node scripts/fix-template-kit-imports.mjs
```

## ملاحظة TypeScript

`template-kit` مستبعد من `tsconfig.app.json` حتى لا يؤثر على build المشروع.
هو مرجع للنسخ اليدوي وليس جزءاً من التطبيق الشغال.
