export interface SkillSource {
  name: string;
  description: string;
  repoUrl: string; // The URL to clone
  isFolderInRepo?: boolean; // If true, the skill is a subdirectory in a monorepo
  folderPath?: string; // If it's a monorepo, the folder to copy.
}

// GitHub API types
interface GithubContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  url: string;
  html_url: string;
  download_url: string | null;
}

const SKILL_REPOSITORIES = [
  { owner: 'anthropics', repo: 'skills', path: 'skills' },
  { owner: 'garrytan', repo: 'gstack', path: '.agents/skills' },
  { owner: 'openai', repo: 'skills', path: 'skills/.curated' }
];

/**
 * Fetches skills from known repositories based on a deterministic configuration.
 */
export async function fetchAvailableSkills(): Promise<SkillSource[]> {
  const skills: SkillSource[] = [];

  for (const r of SKILL_REPOSITORIES) {
    try {
      const fetchedSkills = await fetchReposFromGithub(r.owner, r.repo, r.path);
      skills.push(...fetchedSkills);
    } catch (err) {
      console.error(`Error fetching skills from ${r.owner}/${r.repo}:`, err instanceof Error ? err.message : err);
    }
  }

  return skills;
}

async function fetchReposFromGithub(owner: string, repo: string, path: string = ''): Promise<SkillSource[]> {
  const sources: SkillSource[] = [];
  const urlPath = path ? `/${path}` : '';
  const url = `https://api.github.com/repos/${owner}/${repo}/contents${urlPath}`;
  
  // Note: Unauthenticated github API has strict rate limits. In production, we'd want user tokens if possible.
  const response = await fetch(url, { headers: { 'User-Agent': 'skill-installer' }});
  
  if (!response.ok) {
    throw new Error(`Failed to fetch from GitHub: ${response.statusText}`);
  }

  const contents: GithubContent[] = await response.json();
  
  for (const item of contents) {
    // If it's a directory and doesn't start with a dot, we assume it's a skill
    if (item.type === 'dir' && !item.name.startsWith('.')) {
      sources.push({
        name: item.name,
        description: `Skill from ${owner}/${repo}`,
        repoUrl: `https://github.com/${owner}/${repo}.git`,
        isFolderInRepo: true,
        folderPath: item.path,
      });
    }
  }

  return sources;
}
