import { cn } from '../lib/cn.ts';
import { CategoryPanel } from './filter-sidebar/CategoryPanel.tsx';
import { GameVersionPanel } from './filter-sidebar/GameVersionPanel.tsx';
import { LicensePanel } from './filter-sidebar/LicensePanel.tsx';
import { LoaderPanel } from './filter-sidebar/LoaderPanel.tsx';
import { TagsPanel } from './filter-sidebar/TagsPanel.tsx';
import {
  type FacetOption,
  type TagFacetOption,
} from './filter-sidebar/types.ts';

interface FilterSidebarProps {
  tagOptions: TagFacetOption[];
  versionOptions: FacetOption[];
  loaderOptions: FacetOption[];
  licenseOptions: FacetOption[];
  categoryOptions: FacetOption[];
  selectedTags: Set<string>;
  selectedVersions: Set<string>;
  selectedLoaders: Set<string>;
  selectedLicenses: Set<string>;
  selectedCategories: Set<string>;
  onToggleTag: (tag: TagFacetOption) => void;
  onToggleVersion: (value: string) => void;
  onToggleLoader: (value: string) => void;
  onToggleLicense: (value: string) => void;
  onToggleCategory: (value: string) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  className?: string;
}

export type { FacetOption, TagFacetOption };

export function FilterSidebar({
  tagOptions,
  versionOptions,
  loaderOptions,
  licenseOptions,
  categoryOptions,
  selectedTags,
  selectedVersions,
  selectedLoaders,
  selectedLicenses,
  selectedCategories,
  onToggleTag,
  onToggleVersion,
  onToggleLoader,
  onToggleLicense,
  onToggleCategory,
  onClearAll,
  hasActiveFilters,
  className,
}: FilterSidebarProps) {
  return (
    <div
      className={cn(
        'scrollbar-none flex flex-col gap-4 lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:pr-1',
        className,
      )}
    >
      <div className="flex items-center justify-between px-1 pb-1">
        <h2 className="font-display text-base font-extrabold text-ink">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-bold text-ink transition-colors hover:text-accent-icon"
          >
            Clear all
          </button>
        )}
      </div>

      <TagsPanel
        options={tagOptions}
        selected={selectedTags}
        onToggle={onToggleTag}
      />
      <LoaderPanel
        options={loaderOptions}
        selected={selectedLoaders}
        onToggle={onToggleLoader}
      />
      <GameVersionPanel
        options={versionOptions}
        selected={selectedVersions}
        onToggle={onToggleVersion}
      />
      <LicensePanel
        options={licenseOptions}
        selected={selectedLicenses}
        onToggle={onToggleLicense}
      />
      <CategoryPanel
        options={categoryOptions}
        selected={selectedCategories}
        onToggle={onToggleCategory}
      />
    </div>
  );
}
