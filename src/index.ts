#!/usr/bin/env node

import { Command } from 'commander';
import { runTui } from './tui.js';

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

program.parse();
