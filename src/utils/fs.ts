import { chmodSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export function ensure_dir(path: string): void {
	mkdirSync(path, { recursive: true });
}

export function write_file(path: string, content: string): void {
	ensure_dir(dirname(path));
	writeFileSync(path, content, 'utf-8');
}

export function make_executable(path: string): void {
	chmodSync(path, 0o755);
}

export function to_title_case(kebab_case: string): string {
	return kebab_case
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export function is_kebab_case(str: string): boolean {
	return /^[a-z0-9-]+$/.test(str);
}

export function is_lowercase(str: string): boolean {
	return str === str.toLowerCase();
}
