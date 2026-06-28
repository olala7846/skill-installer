import { simpleGit } from 'simple-git';
import { join } from 'path';
import { cpSync, existsSync, mkdirSync } from 'fs';
import * as p from '@clack/prompts';
import { SkillSource } from './fetcher.js';
import { AgentInfo } from './agents.js';

export async function installSkills(skills: SkillSource[], targetAgent: AgentInfo) {
  const git = simpleGit();

  // Ensure target skills directory exists
  if (!existsSync(targetAgent.skillsPath)) {
    mkdirSync(targetAgent.skillsPath, { recursive: true });
  }

  for (const skill of skills) {
    const skillPath = join(targetAgent.skillsPath, skill.name);
    const spinner = p.spinner();

    if (existsSync(skillPath)) {
      spinner.start(`Updating ${skill.name}...`);
      try {
        if (skill.localPath) {
          cpSync(skill.localPath, skillPath, { recursive: true, force: true });
        } else {
          await simpleGit(skillPath).pull();
        }
        spinner.stop(`Updated ${skill.name} successfully.`);
      } catch (err) {
         spinner.stop(`Failed to update ${skill.name}.`);
         p.log.error(`Error: ${err instanceof Error ? err.message : err}`);
      }
    } else {
      spinner.start(`Installing ${skill.name}...`);
      try {
        if (skill.localPath) {
          cpSync(skill.localPath, skillPath, { recursive: true });
          spinner.stop(`Installed ${skill.name}.`);
        } else if (skill.isFolderInRepo && skill.folderPath) {
          // It's a subdirectory inside a monorepo.
          // simple-git doesn't natively support sparse checkout easily in a single command,
          // but we can just clone the whole repo in a temp dir and copy the folder,
          // OR since most of these "skills" repos aren't massive, 
          // we can just clone into the target folder directly and the skill is technically the subfolder.
          // Actually, if we're installing into ~/.gemini/antigravity/skills/skill-name,
          // the tool needs it to be directly there. 
          // For now, let's just do a sparse clone using git directly, or simpleGit raw commands.
          
          await git.clone(skill.repoUrl, skillPath, [
             '--depth', '1',
             '--filter=blob:none',
             '--sparse'
          ]);
          await simpleGit(skillPath).raw(['sparse-checkout', 'set', skill.folderPath]);
          spinner.stop(`Installed ${skill.name} (sparse).`);
        } else {
          // Standard full repo clone
           await git.clone(skill.repoUrl, skillPath, ['--depth', '1']);
           spinner.stop(`Installed ${skill.name}.`);
        }
      } catch (err) {
        spinner.stop(`Failed to install ${skill.name}.`);
        p.log.error(`Error: ${err instanceof Error ? err.message : err}`);
      }
    }
  }
}
