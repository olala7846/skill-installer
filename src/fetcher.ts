import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

export interface SkillSource {
  name: string;
  description: string;
  repoUrl: string; // The URL to clone
  isFolderInRepo?: boolean; // If true, the skill is a subdirectory in a monorepo
  folderPath?: string; // If it's a monorepo, the folder to copy.
}

const SKILL_REPOSITORIES = [
  { owner: 'anthropics', repo: 'skills', path: 'skills' },
  { owner: 'garrytan', repo: 'gstack', path: '.agents/skills' },
  { owner: 'openai', repo: 'skills', path: 'skills/.curated' }
];

/**
 * Fetches skills from known repositories by locally prioritizing a git cache.
 */
export async function fetchAvailableSkills(): Promise<SkillSource[]> {
  const skills: SkillSource[] = [];
  const cacheDir = path.join(os.homedir(), '.skill-installer', 'repos');

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  for (const r of SKILL_REPOSITORIES) {
    const repoPath = path.join(cacheDir, r.owner, r.repo);
    const repoUrl = `https://github.com/${r.owner}/${r.repo}.git`;
    
    try {
      if (!fs.existsSync(repoPath)) {
        // Clone new repo (shallow copy for speed)
        fs.mkdirSync(path.join(cacheDir, r.owner), { recursive: true });
        execSync(`git clone --depth 1 ${repoUrl} ${r.repo}`, { 
          cwd: path.join(cacheDir, r.owner),
          stdio: 'ignore'
        });
      } else {
        // Pull latest from existing local cache silently
        execSync('git pull --quiet', { cwd: repoPath, stdio: 'ignore' });
      }

      // Read local folder contents
      const skillsDir = r.path ? path.join(repoPath, r.path) : repoPath;
      
      if (fs.existsSync(skillsDir)) {
        const entries = fs.readdirSync(skillsDir, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.isDirectory() && !entry.name.startsWith('.')) {
            let description = `Skill from ${r.owner}/${r.repo}`;
            
            // Proactively parse SKILL.md front-matter
            const skillMdPath = path.join(skillsDir, entry.name, 'SKILL.md');
            if (fs.existsSync(skillMdPath)) {
              const content = fs.readFileSync(skillMdPath, 'utf8');
              const match = content.match(/^description:\s*(.+)$/m);
              if (match && match[1]) {
                description = match[1].trim();
              }
            }
            
            skills.push({
              name: entry.name,
              description,
              repoUrl,
              isFolderInRepo: true,
              folderPath: path.join(r.path, entry.name),
            });
          }
        }
      }
    } catch (err) {
      console.error(`Error syncing or parsing cache for ${r.owner}/${r.repo}:`, err instanceof Error ? err.message : err);
    }
  }

  return skills;
}
