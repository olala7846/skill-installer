import * as p from '@clack/prompts';
import pc from 'picocolors';
import { existsSync } from 'fs';
import { join } from 'path';
import { detectAgents } from './agents.js';
import { fetchAvailableSkills, SkillSource } from './fetcher.js';
import { installSkills } from './installer.js';

export async function runTui() {
  p.intro(pc.bgCyan(pc.black(' Agent Skill Installer ')));

  const agents = detectAgents();
  const installedAgents = agents.filter(a => a.isInstalled);

  if (installedAgents.length === 0) {
    p.log.warn('No supported agents detected on your system. Skills might not install correctly.');
  } else {
    p.log.info(`Detected agents: ${installedAgents.map(a => pc.green(a.name)).join(', ')}`);
  }

  const spinner = p.spinner();
  spinner.start('Fetching available skills from repositories...');
  
  const skills = await fetchAvailableSkills();
  spinner.stop('Available skills fetched!');

  if (skills.length === 0) {
    p.log.error('Could not find any skills to install.');
    process.exit(1);
  }

  const options = skills.map((skill) => {
    // Check if it's already installed in any of the active agents
    const isInstalled = installedAgents.some(agent => existsSync(join(agent.skillsPath, skill.name)));
    const installedLabel = isInstalled ? pc.gray(' (Installed)') : '';

    return {
      value: skill,
      label: `${skill.name}${installedLabel}`,
      hint: isInstalled ? `Already installed, select to upgrade. ${skill.description}` : skill.description
    };
  });

  const selectedSkills = await p.multiselect({
    message: 'Select the skills you want to install or upgrade:',
    options: options,
    required: false
  });

  if (p.isCancel(selectedSkills)) {
    p.cancel('Cancelled installation.');
    process.exit(0);
  }

  const skillsToInstall = selectedSkills as SkillSource[];

  if (skillsToInstall.length === 0) {
    p.log.info('No skills selected. Exiting.');
    process.exit(0);
  }

  // Pick target agent to install to if multiple are installed
  let targetAgent = installedAgents[0];
  if (installedAgents.length > 1) {
     const agentSelection = await p.select({
       message: 'Which agent would you like to install these skills for?',
       options: installedAgents.map(a => ({ value: a, label: a.name })),
     });
     
     if (p.isCancel(agentSelection)) {
       p.cancel('Cancelled.');
       process.exit(0);
     }
     targetAgent = agentSelection as any;
  } else if (installedAgents.length === 0) {
     p.log.error('Cannot proceed without a target agent.');
     process.exit(1);
  }

  p.log.info(`Installing skills for ${targetAgent.name}...`);
  await installSkills(skillsToInstall, targetAgent);

  p.outro(pc.green('Done!'));
}
