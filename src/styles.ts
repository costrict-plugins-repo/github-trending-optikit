import { Options } from 'boxen';
import chalk from 'chalk';

export const boxenOptions: Options = {
  padding: { top: 1, bottom: 1, left: 3, right: 3 },
  margin: { top: 1, bottom: 0, left: 1, right: 1 },
  borderStyle: 'round',
  borderColor: 'cyan',
};

export function createBanner(version: string): string {
  const greeting = chalk.white.bold('Hello ^_^');
  const logo = chalk.cyan.bold('OptiKit CLI');
  const ver = chalk.gray(` v${version}`);
  const tagline = chalk.white('Flutter & Opticore Toolkit');
  const divider = chalk.gray('─────────────────────────');

  return `${greeting}\n${divider}\n${logo}${ver}\n${tagline}`;
}

export const bannerBoxOptions: Options = {
  padding: { top: 1, bottom: 1, left: 3, right: 3 },
  margin: { top: 1, bottom: 0, left: 1, right: 1 },
  borderStyle: 'round',
  borderColor: 'cyan',
  textAlignment: 'center',
};

export const icons = {
  success: chalk.green('✔'),
  error: chalk.red('✖'),
  warning: chalk.yellow('⚠'),
  info: chalk.cyan('ℹ'),
  arrow: chalk.cyan('→'),
  dot: chalk.gray('·'),
  star: chalk.yellow('★'),
  rocket: '🚀',
  package: '📦',
  phone: '📱',
  wrench: '🔧',
  check: '✅',
  cross: '❌',
  clock: '⏱',
} as const;

export const divider = chalk.gray('─'.repeat(50));

export function sectionHeader(title: string): void {
  console.log();
  console.log(chalk.cyan.bold(`  ${title}`));
  console.log(chalk.gray(`  ${'─'.repeat(title.length + 4)}`));
}
