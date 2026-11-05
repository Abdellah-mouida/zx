/**
 * Navigation, page metadata and the terminal command set.
 * Routes and their labels live here, never inline in the nav component.
 */

export interface Route {
  path: string;
  /** Visible label in the nav. */
  label: string;
  /** Aurora mood (DESIGN.md §7.3). */
  mood: 'calm' | 'drift' | 'dense' | 'quiet' | 'signal';
  /** Mono micro-label in the nav, e.g. "/PROJECTS". */
  prompt: string;
}

export const routes: Route[] = [
  { path: '/', label: 'Home', mood: 'calm', prompt: '/home' },
  { path: '/projects', label: 'Projects', mood: 'drift', prompt: '/projects' },
  { path: '/arsenal', label: 'Arsenal', mood: 'dense', prompt: '/arsenal' },
  { path: '/about', label: 'About', mood: 'quiet', prompt: '/about' },
  { path: '/contact', label: 'Contact', mood: 'signal', prompt: '/contact' },
];

export const navRoutes = routes;

/**
 * Terminal commands (hacker mode). The registry that the terminal and its
 * autocomplete both read. Behaviour lives in the terminal component; this
 * is only the vocabulary and the help text.
 */
export interface CommandSpec {
  name: string;
  usage: string;
  /** One dry line for `help`. */
  help: string;
  /** Hidden commands do not list in `help` but still autocomplete. */
  hidden?: boolean;
}

export const commands: CommandSpec[] = [
  { name: 'help', usage: 'help', help: 'You are reading it.' },
  { name: 'whoami', usage: 'whoami', help: 'You already know.' },
  { name: 'ls', usage: 'ls projects', help: 'List projects.' },
  { name: 'open', usage: 'open <project>', help: 'Open a case study.' },
  { name: 'goto', usage: 'goto <page>', help: 'Navigate. home, projects, arsenal, about, contact.' },
  { name: 'theme', usage: 'theme', help: 'Toggle terminal theme.' },
  { name: 'clear', usage: 'clear', help: 'Clear the buffer.' },
  { name: 'history', usage: 'history', help: 'This session, so far.' },
  { name: 'sudo', usage: 'sudo <anything>', help: 'sudo: permission denied. obviously.' },
  { name: 'exit', usage: 'exit', help: 'Leave the terminal.' },
  // Easter eggs — hidden from help, still real.
  { name: 'sudo', usage: 'sudo make me a sandwich', help: '', hidden: true },
  { name: 'z', usage: 'z', help: '', hidden: true },
  { name: 'ping', usage: 'ping', help: '', hidden: true },
];

export const terminalPrompt = 'zeroox@void:~$';

/** Banner printed when the terminal opens. */
export const terminalBanner = [
  'ZEROOX — private console',
  'type `help`. there are five things here that are not on the surface.',
];
