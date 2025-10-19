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

export interface ValidationResult {
  errors: string[];
  warnings: string[];
  is_valid: boolean;
}
