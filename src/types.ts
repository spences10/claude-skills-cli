export interface SkillMetadata {
  name: string;
  description: string;
  license?: string;
  'allowed-tools'?: string[];
  metadata?: Record<string, unknown>;
}

export interface InitOptions {
  name?: string;
  description?: string;
  path?: string;
  with_examples?: boolean;
}

export interface ValidateOptions {
  skill_path: string;
  strict?: boolean;
}

export interface PackageOptions {
  skill_path: string;
  output?: string;
  skip_validation?: boolean;
}

export interface StatsOptions {
  directory?: string;
}

export interface ValidationStats {
  word_count: number;
  estimated_tokens: number;
  line_count: number;
  description_length: number;
  description_tokens: number;
  code_blocks: number;
  sections: number;
  long_paragraphs: number;
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
  is_valid: boolean;
  stats?: ValidationStats;
}
