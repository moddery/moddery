import { FolderKanban } from 'lucide-react';

import { TaxonomyCategoryForm } from './taxonomy/TaxonomyCategoryForm.tsx';
import { TaxonomyGameVersionForm } from './taxonomy/TaxonomyGameVersionForm.tsx';
import { TaxonomyLicenseForm } from './taxonomy/TaxonomyLicenseForm.tsx';
import { useTaxonomyPanelState } from './taxonomy/useTaxonomyPanelState.ts';

export function TaxonomyPanel() {
  const state = useTaxonomyPanelState();

  return (
    <section className="mt-8 rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Taxonomy
          </h2>
          <p className="mt-1 text-sm text-muted">
            Manage category and game version rows used by discovery.
          </p>
        </div>
        <FolderKanban className="size-5 text-accent-icon" />
      </div>
      {state.message && (
        <p className="mt-3 text-sm font-semibold text-muted">{state.message}</p>
      )}

      <div className="mt-4 grid gap-5 lg:grid-cols-3">
        <TaxonomyCategoryForm
          busy={state.busy}
          categories={state.categories}
          categoryDescription={state.categoryDescription}
          categoryKind={state.categoryKind}
          categoryName={state.categoryName}
          categorySlug={state.categorySlug}
          onCategoryDescriptionChange={state.setCategoryDescription}
          onCategoryKindChange={state.setCategoryKind}
          onCategoryNameChange={state.setCategoryName}
          onCategorySlugChange={state.setCategorySlug}
          onSelect={state.fillCategory}
          onSubmit={(event) => void state.submitCategory(event)}
        />

        <TaxonomyGameVersionForm
          busy={state.busy}
          gameVersion={state.gameVersion}
          gameVersionActive={state.gameVersionActive}
          gameVersions={state.gameVersions}
          onGameVersionActiveChange={state.setGameVersionActive}
          onGameVersionChange={state.setGameVersion}
          onSubmit={(event) => void state.submitGameVersion(event)}
        />

        <TaxonomyLicenseForm
          busy={state.busy}
          licenseKey={state.licenseKey}
          licenseName={state.licenseName}
          licenseUrl={state.licenseUrl}
          licenses={state.licenses}
          onLicenseKeyChange={state.setLicenseKey}
          onLicenseNameChange={state.setLicenseName}
          onLicenseUrlChange={state.setLicenseUrl}
          onSelect={state.fillLicense}
          onSubmit={(event) => void state.submitLicense(event)}
        />
      </div>
    </section>
  );
}
