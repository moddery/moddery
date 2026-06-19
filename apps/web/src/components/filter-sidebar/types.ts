export interface FacetOption {
  description?: string | null;
  label?: string;
  value: string;
}

export type TagFacetOption =
  | {
      description?: string | null;
      kind: 'category';
      label?: string;
      value: string;
    }
  | {
      description?: string | null;
      kind: 'license';
      label?: string;
      value: string;
    }
  | {
      description?: string | null;
      kind: 'loader';
      label?: string;
      value: string;
    }
  | {
      description?: string | null;
      kind: 'version';
      label?: string;
      value: string;
    };
