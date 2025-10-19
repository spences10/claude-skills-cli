import chalk from 'chalk';

export const success = (msg: string) => console.log(`✅ ${msg}`);
export const error = (msg: string) => console.log(`❌ ${msg}`);
export const warning = (msg: string) => console.log(`⚠️  ${msg}`);
export const info = (msg: string) => console.log(`📋 ${msg}`);
export const step = (msg: string) => console.log(`  ${msg}`);
export const package_ = (msg: string) => console.log(`📦 ${msg}`);
export const upload = (msg: string) => console.log(`📤 ${msg}`);
export const search = (msg: string) => console.log(`🔍 ${msg}`);
