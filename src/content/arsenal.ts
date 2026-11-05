import type { ArsenalCluster } from './types';

/**
 * The Arsenal, grouped by discipline. Offensive security is the dominant
 * cluster — the largest `weight`, the most nodes, the deepest readouts.
 *
 * `depth` drives node size in the 3D view:
 *   core     — practiced daily, would bet the engagement on it
 *   working  — used in real operations and labs, still sharpening
 *   reading  — studied, labbed, not yet second nature
 */

export const arsenalDomainOrder = ['offensive-security', 'languages', 'infrastructure'] as const;

export const arsenal: ArsenalCluster[] = [
  /* ================================================================
     OFFENSIVE SECURITY — the dominant cluster.
  ================================================================ */
  {
    id: 'offsec',
    domain: 'offensive-security',
    name: 'Offensive Security',
    summary: 'The main practice. Adversary emulation, from read to fix.',
    weight: 1.0,
    nodes: [
      {
        id: 'red-team',
        label: 'Red teaming',
        use: 'Full kill-chain emulation — recon to objective — against a real adversary model.',
        depth: 'core',
        related: ['siege', 'telemetry-lab'],
      },
      {
        id: 'ad',
        label: 'Active Directory',
        use: 'Kerberos and delegation abuse, ADCS paths, attack-path analysis and lateral movement.',
        depth: 'core',
        related: ['bloodline'],
      },
      {
        id: 'access',
        label: 'Initial access & social engineering',
        use: 'Phishing simulation, pretexting, OSINT and payload delivery — authorized labs only.',
        depth: 'working',
      },
      {
        id: 'c2',
        label: 'C2 & tooling',
        use: 'Custom C2 design in the lab; Sliver, Cobalt Strike concepts, Metasploit, Impacket.',
        depth: 'core',
        related: ['siege'],
      },
      {
        id: 'evasion',
        label: 'Evasion research',
        use: 'AV/EDR behaviour analysis and telemetry, read from a detection-engineering mindset.',
        depth: 'working',
        related: ['telemetry-lab'],
      },
      {
        id: 're',
        label: 'Reverse engineering & malware analysis',
        use: 'Ghidra, IDA, x64dbg. Static and dynamic analysis, unpacking, behavioural tracing.',
        depth: 'working',
        related: ['sabot'],
      },
      {
        id: 'exploit',
        label: 'Exploit development',
        use: 'Memory corruption, ROP and fuzzing (AFL++, libFuzzer) — all in lab context.',
        depth: 'working',
        related: ['sabot'],
      },
      {
        id: 'web',
        label: 'Web & API security',
        use: 'OWASP Top 10, auth and session flaws, SSRF, deserialization, GraphQL, JWT attacks.',
        depth: 'core',
        related: ['zephyr'],
      },
      {
        id: 'network',
        label: 'Network & wireless',
        use: 'Protocol analysis, MITM in lab, Wireshark, segmentation and Wi-Fi assessment.',
        depth: 'working',
      },
      {
        id: 'cloud',
        label: 'Cloud & containers',
        use: 'AWS/Azure/GCP misconfiguration review, IAM abuse paths, K8s and Docker security.',
        depth: 'working',
      },
      {
        id: 'mobile',
        label: 'Mobile & hardware',
        use: 'Android/iOS testing basics, Frida, firmware extraction, UART/JTAG basics.',
        depth: 'reading',
      },
      {
        id: 'defense',
        label: 'Defensive literacy',
        use: 'Sigma/YARA rules, SIEM concepts, DFIR basics, hardening and threat modeling.',
        depth: 'core',
        related: ['telemetry-lab', 'bloodline'],
      },
    ],
  },

  /* ================================================================
     LANGUAGES — constellation grouped by use, in the brief's groups.
  ================================================================ */
  {
    id: 'lang-systems',
    domain: 'languages',
    name: 'Systems',
    summary: 'Memory-unsafe by default, so the safety is engineered.',
    weight: 0.72,
    nodes: [
      { id: 'c', label: 'C', use: 'Systems work and protocol impls where the ABI is the spec.', depth: 'core', related: ['sabot'] },
      { id: 'cpp', label: 'C++', use: 'Tooling and analysis where performance is the constraint.', depth: 'working' },
      { id: 'rust', label: 'Rust', use: 'The default for new tooling. Memory safety without a GC tax.', depth: 'core', related: ['siege', 'aurora-engine'] },
      { id: 'zig', label: 'Zig', use: 'Low-level tooling where the build should be legible too.', depth: 'reading' },
      { id: 'asm', label: 'x86-64 Assembly', use: 'Shellcode-adjacent work and reading what the compiler actually emitted.', depth: 'working', related: ['sabot'] },
    ],
  },
  {
    id: 'lang-app',
    domain: 'languages',
    name: 'Application & Backend',
    summary: 'Where the tooling and the services actually get built.',
    weight: 0.78,
    nodes: [
      { id: 'python', label: 'Python', use: 'Rapid tooling, analysis harnesses, glue that does not outlive its use.', depth: 'core' },
      { id: 'go', label: 'Go', use: 'Concurrent agents and services where a static binary wins.', depth: 'working', related: ['siege'] },
      { id: 'typescript', label: 'TypeScript', use: 'Everything user-facing, including this site. Types as documentation.', depth: 'core', related: ['aurora-engine', 'this-site', 'zephyr'] },
      { id: 'javascript', label: 'JavaScript', use: 'The runtime under everything above; browser internals too.', depth: 'core', related: ['aurora-engine', 'this-site'] },
      { id: 'java', label: 'Java', use: 'Reading enterprise surfaces and the occasional forced encounter.', depth: 'reading' },
      { id: 'kotlin', label: 'Kotlin', use: 'JVM tooling and Android work.', depth: 'reading' },
      { id: 'csharp', label: 'C#', use: 'Windows targets and managed-code tradecraft.', depth: 'working' },
      { id: 'php', label: 'PHP', use: 'Reading legacy surfaces; still where much of the web lives.', depth: 'reading' },
      { id: 'ruby', label: 'Ruby', use: 'Metasploit internals and quick scripts with good ergonomics.', depth: 'reading' },
      { id: 'sql', label: 'SQL', use: 'Querying, injection analysis and the data layer of every engagement.', depth: 'working' },
    ],
  },
  {
    id: 'lang-script',
    domain: 'languages',
    name: 'Scripting & Automation',
    summary: 'The glue. Written fast, meant to be deleted.',
    weight: 0.5,
    nodes: [
      { id: 'bash', label: 'Bash', use: 'Daily automation; the floor everything stands on.', depth: 'core' },
      { id: 'powershell', label: 'PowerShell', use: 'Windows tradecraft, detection surfaces, and endpoint scripting.', depth: 'working' },
      { id: 'lua', label: 'Lua', use: 'Neovim config and embedded scripting.', depth: 'working' },
      { id: 'nim', label: 'Nim', use: 'Offensive tooling experiments where a small native binary matters.', depth: 'reading' },
    ],
  },
  {
    id: 'lang-graphics',
    domain: 'languages',
    name: 'Graphics & Creative',
    summary: 'The other half of the practice. Same exactness, different output.',
    weight: 0.6,
    nodes: [
      { id: 'glsl', label: 'GLSL / WGSL shaders', use: 'The aurora, the trails, the Ø. Compute in service of look.', depth: 'core', related: ['aurora-engine', 'this-site'] },
      { id: 'webgl', label: 'WebGL', use: 'The render path under the whole site.', depth: 'core', related: ['this-site', 'aurora-engine'] },
      { id: 'three', label: 'Three.js', use: 'Scene graph, post-processing, and the depth-space layouts.', depth: 'core', related: ['this-site'] },
    ],
  },

  /* ================================================================
     INFRA & TOOLING — the smallest cluster.
  ================================================================ */
  {
    id: 'infra',
    domain: 'infrastructure',
    name: 'Infrastructure & Tooling',
    summary: 'The surfaces everything is built and deployed on.',
    weight: 0.56,
    nodes: [
      { id: 'linux', label: 'Linux', use: 'Kali for lab work, Arch daily, Debian for anything that must not break.', depth: 'core' },
      { id: 'windows-internals', label: 'Windows internals', use: 'The other target surface; understood to the service level.', depth: 'working' },
      { id: 'git', label: 'Git', use: 'The only version control. Deep enough to rescue the broken states.', depth: 'core' },
      { id: 'docker', label: 'Docker', use: 'Lab isolation and reproducible tool environments.', depth: 'working' },
      { id: 'terraform', label: 'Terraform', use: 'Infra as code for repeatable labs and the odd deployment.', depth: 'reading' },
      { id: 'ghactions', label: 'GitHub Actions', use: 'CI for the tooling and the site.', depth: 'working' },
      { id: 'cloudflare', label: 'Cloudflare', use: 'The edge for this site — Workers, Turnstile, the quiet parts.', depth: 'working', related: ['this-site'] },
      { id: 'vercel', label: 'Vercel', use: 'The fast ship path for the site.', depth: 'working', related: ['this-site'] },
      { id: 'neovim', label: 'Neovim', use: 'The editor. Configured to the point it is mostly Lua and intent.', depth: 'core' },
      { id: 'tmux', label: 'tmux', use: 'One session per engagement. Nothing important runs outside it.', depth: 'core' },
    ],
  },
];

/** Flat list of every node, for the keyboard-navigable fallback and tests. */
export const arsenalNodes = arsenal.flatMap((c) =>
  c.nodes.map((n) => ({ ...n, cluster: c.name, domain: c.domain })),
);
