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
	format?: 'text' | 'json';
}

export interface PackageOptions {
	skill_path: string;
	output?: string;
	skip_validation?: boolean;
}

export interface StatsOptions {
	directory?: string;
}

export interface InstallOptions {
	skill_name?: string;
	force?: boolean;
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

export interface HardLimitValidation {
	name: {
		length: number;
		limit: number;
		valid: boolean;
		error: string | null;
	};
	description: {
		length: number;
		limit: number;
		valid: boolean;
		error: string | null;
	};
}

export interface NameFormatValidation {
	name: string;
	format_valid: boolean;
	directory_name: string;
	matches_directory: boolean;
	errors: string[];
}

export interface YAMLValidation {
	valid: boolean;
	has_frontmatter: boolean;
	parse_error: string | null;
	missing_fields: string[];
}

export interface PathFormatValidation {
	invalid_paths: Array<{
		line_number: number;
		path: string;
		error: string;
		suggested_fix: string;
	}>;
}

export interface StructuredValidation {
	hard_limits: HardLimitValidation;
	name_format: NameFormatValidation;
	yaml_validation: YAMLValidation;
	path_format: PathFormatValidation;
}

export interface ValidationResult {
	errors: string[];
	warnings: string[];
	is_valid: boolean;
	stats?: ValidationStats;
	validation?: StructuredValidation;
}
