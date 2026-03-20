#!/usr/bin/env node

import { Command } from 'commander';
import { runTui } from './tui.js';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const program = new Command();

program
  .name('skill-installer')
  .description('Installs agent skills from known repositories.')
  .version('1.0.0');

program
  .command('start')
  .description('Start the interactive skill installer TUI')
  .action(async () => {
    try {
      await runTui();
    } catch (err) {
      console.error('Error running skill installer:', err);
      process.exit(1);
    }
  });

program
  .command('upgrade')
  .description('Upgrade the skill-installer by pulling the latest changes and rebuilding')
  .action(() => {
    try {
      // Get the path of the current file (dist/index.js) and navigate up to the project root
      const currentFilePath = fileURLToPath(import.meta.url);
      const projectRoot = join(dirname(currentFilePath), '..'); 
      
      console.log(`Starting upgrade in ${projectRoot}...`);
      
      console.log('Running git pull...');
      execSync('git pull', { cwd: projectRoot, stdio: 'inherit' });
      
      console.log('Running npm install...');
      execSync('npm install', { cwd: projectRoot, stdio: 'inherit' });
      
      console.log('Running npm run build...');
      execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
      
      console.log('✨ Upgrade complete!');
    } catch (err) {
      console.error('Upgrade failed:', err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

program.parse();
