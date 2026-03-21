import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';

export type AgentName = 'Claude Code' | 'Gemini CLI' | 'Google Antigravity' | 'OpenAI Codex' | 'OpenClaw';

export interface AgentInfo {
  name: AgentName;
  skillsPath: string;
  isInstalled: boolean;
}

export function detectAgents(): AgentInfo[] {
  const home = homedir();

  const agents: AgentInfo[] = [
    {
      name: 'Claude Code',
      skillsPath: join(home, '.claude', 'skills'),
      isInstalled: false, // We will evaluate this below
    },
    {
      name: 'Gemini CLI',
      skillsPath: join(home, '.gemini', 'skills'),
      isInstalled: false,
    },
    {
      name: 'Google Antigravity',
      skillsPath: join(home, '.gemini', 'antigravity', 'skills'),
      isInstalled: false,
    },
    {
      name: 'OpenAI Codex',
      skillsPath: join(home, '.agents', 'skills'),
      isInstalled: false,
    },
    {
      name: 'OpenClaw',
      skillsPath: join(home, '.openclaw', 'skills'),
      isInstalled: false,
    }
  ];

  for (const agent of agents) {
    if (existsSync(agent.skillsPath)) {
      agent.isInstalled = true;
    }
  }

  return agents;
}
