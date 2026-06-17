export interface FacetOption {
  value: string;
}

export type TagFacetOption =
  | { kind: 'category'; value: string }
  | { kind: 'loader'; value: string }
  | { kind: 'version'; value: string };
