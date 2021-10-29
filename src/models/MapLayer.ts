export enum FillColor {
  CheckedHasData = "#29b1ea",
  CheckedNoData = "#88d0eb",
  NotChecked = "#FD9986",
}

export enum OutlineColor {
  CheckedHasData = "#0074ab",
  CheckedNoData = "#007AEC",
  NotChecked = "#FD685B",
}

export interface MapLayer {
  id: string;
  color: FillColor;
  outline: OutlineColor;
  label: string;
}
