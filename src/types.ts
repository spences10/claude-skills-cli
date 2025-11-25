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

export type ValidationMode = 'strict' | 'lenient' | 'loose';

export interface ValidateOptions {
	skill_path: string;
	strict?: boolean;
	format?: 'text' | 'json';
	lenient?: boolean;
	loose?: boolean;
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

export interface DoctorOptions {
	skill_path: string;
}

export interface AddHookOptions {
	local?: boolean;
	project?: boolean;
	type?:
		| 'simple-inline'
		| 'simple-script'
		| 'forced-eval'
		| 'llm-eval';
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

export interface PathFormatIssue {
	line_number: number;
	path: string;
	error: string;
	suggested_fix: string;
}

export interface PathFormatValidation {
	invalid_paths: PathFormatIssue[];
}

export interface TriggerPhraseAnalysis {
	has_explicit_trigger: boolean;
	trigger_phrase: string | null;
	trigger_type: 'specific' | 'generic' | 'missing';
}

export interface UserPhrasingAnalysis {
	style_checks: {
		is_third_person: boolean;
		uses_gerund_form: boolean;
		is_action_oriented: boolean;
	};
	issues: Array<{
		type: 'first_person' | 'passive_voice' | 'vague';
		text: string;
		suggestion: string;
	}>;
}

export interface KeywordAnalysis {
	description_keywords: string[];
	content_keywords: string[];
	overlap: string[];
	description_only: string[];
	content_only: string[];
}

export interface AlignmentAnalysis {
	severity: 'good' | 'moderate' | 'critical';
	description_focus: string[];
	content_focus: string[];
	matches: string[];
	mismatches: string[];
	explanation: string;
}

export interface TriggeringValidation {
	trigger_phrase: TriggerPhraseAnalysis;
	user_phrasing: UserPhrasingAnalysis;
	keywords: KeywordAnalysis;
	alignment: AlignmentAnalysis;
}

export interface ReferenceNesting {
	file: string;
	references: string[];
	depth: number;
	warning: string | null;
}

export interface ProgressiveDisclosureValidation {
	skill_md_size: {
		lines: number;
		words: number;
		tokens: number;
		exceeds_line_limit: boolean;
		exceeds_word_limit: boolean;
	};
	references: {
		files_found: string[];
		files_referenced: string[];
		missing_files: string[];
		orphaned_files: string[];
		nesting: ReferenceNesting[];
		max_nesting_depth: number;
	};
}

export interface StructuredValidation {
	hard_limits: HardLimitValidation;
	name_format: NameFormatValidation;
	yaml_validation: YAMLValidation;
	path_format: PathFormatValidation;
	triggering?: TriggeringValidation;
	progressive_disclosure?: ProgressiveDisclosureValidation;
}

export interface ValidationResult {
	errors: string[];
	warnings: string[];
	is_valid: boolean;
	stats?: ValidationStats;
	validation?: StructuredValidation;
}
