export interface VocDataRow extends Record<string, number | string> {
  location_id: string;
  location: string;
  code: string;
  region: string;
  income_group: string;
  epi_date: string;
  source_summary: string;
  government_tier: string;
  source_url: string;
  source_nid: string;
  local_version: string;
  any_variant_info: number;
  "total_b.1.1.7": number | string;
  "total_p.1": number | string;
  "total_b.1.351": number | string;
  "total_b.1.427": number | string;
  "total_b.1.429": number | string;
  "total_b.1.526": number | string;
  "total_b.1.525": number | string;
  "total_p.2": number | string;
  "total_b.1.526.1": number | string;
  "total_b.1.526.2": number | string;
  "total_b.1.1.519": number | string;
  "total_b.1.596": number | string;
  "total_b.1.1.318": number | string;
  "total_a.27": number | string;
  "total_b.1.617": number | string;
  "total_b.1.617.1": number | string;
  "total_b.1.617.2": number | string;
  "total_b.1.617.3": number | string;
  "total_ay.1": number | string;
  "total_ay.12": number | string;
  "total_ay.2": number | string;
  "total_ay.3": number | string;
  "total_ay.3.1": number | string;
  "total_p.3": number | string;
  total_breton_variant: number | string;
  "total_b.1.36.35": number | string;
  "total_c.36": number | string;
  "total_c.37": number | string;
  "total_b.1.1.333": number | string;
  "total_b.1.153": number | string;
  "total_b.1.177": number | string;
  "total_b.1.177.60": number | string;
  "total_b.1.258": number | string;
  "total_b.1.36": number | string;
  "total_b.1.620": number | string;
  "total_r.1": number | string;
  "total_b.1.160": number | string;
  "total_c.16": number | string;
  "total_a.23.1": number | string;
  "total_b.1.621": number | string;
  "total_b.1.214.2": number | string;
  "total_b.1.258.17": number | string;
  "total_b.1": number | string;
  "total_b.1.1": number | string;
  "total_b.1.2": number | string;
  "total_b.1.1.519__1": number | string;
  "total_b.1.427__1": number | string;
  "total_b.1.576": number | string;
  "total_b.1.243": number | string;
  "total_b.1.1.234": number | string;
  "total_b.1.1.348": number | string;
  "total_b.1.1.28.3": number | string;
  total_other_variants: number | string;
  total_sequencing_effort: number | string;
  time_series: number | string;
  geographic_detail: number | string;
  any_mutation_info: number | string;
  demographics_present: number | string;
  demographics_age: number | string;
  demographics_sex: number | string;
  demographics_race_ethnicity: number | string;
  hospitalizations_any_variant: number | string;
  hospitalizations_demographics: number | string;
  hospitalizations_age: number | string;
  deaths_any_variant: number | string;
  deaths_demographics: number | string;
  deaths_age: number | string;
  travel_status: number | string;
  breakthrough_status: string;
  sequence_provenance: string;
  source_frequency: string;
  source_status: string;
  extraction_status: string;
  id: string;
  notes: string;
}
