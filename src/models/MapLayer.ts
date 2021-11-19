export enum FillColor {
  CheckedHasData = "#38A397",
  CheckedNoData = "#88d0eb",
  NotChecked = "#FD9986",
  NoData = "#D7E9ED",
}

export enum OutlineColor {
  CheckedHasData = "#0E766A",
  CheckedNoData = "#007AEC",
  NotChecked = "#FD685B",
}

export interface MapLayer {
  id: string;
  color: FillColor;
  outline: OutlineColor;
  label: string;
}
