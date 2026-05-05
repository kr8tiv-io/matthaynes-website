export const siteMeta = {
  name: 'Matt Haynes',
  title: 'Matt Haynes | Founder, Operator, Designer',
  description:
    'Matt Haynes is a Costa Rica-based founder/operator building KR8TiV AI, KR8TiV Agency, Jarvis LifeOS, MeetYourKIN, and Aurora Ventures systems across AI, automation, growth, and venture execution.',
  url: 'https://matthaynes.fun/',
  image: 'https://matthaynes.fun/links-preview.png',
  email: 'mailto:lucidbloks@gmail.com',
  bookingUrl: 'https://cal.com/aurora-ventures',
  xUrl: 'https://x.com/aurora_ventures',
  githubUrl: 'https://github.com/Matt-Aurora-Ventures',
  linkedInUrl: 'https://www.linkedin.com/in/matthaynes88/'
};

export const sameAs = [
  'https://x.com/aurora_ventures',
  'https://x.com/kr8tivai',
  'https://x.com/meetyourkin',
  'https://linktr.ee/auroraventures',
  'https://github.com/Matt-Aurora-Ventures',
  'https://www.linkedin.com/in/matthaynes88/',
  'https://kr8tiv.ai/',
  'https://kr8tiv.io/',
  'https://jarvislife.io/',
  'https://meetyourkin.com/'
];

export const videos = [
  {
    id: 'origin',
    label: 'Origin',
    src: '/assets/media/hero-header.mp4',
    poster: '/assets/media/matt-volcano.jpg',
    section: 'hero'
  },
  {
    id: 'signal',
    label: 'Signal',
    src: '/assets/media/grok-abstract.mp4',
    section: 'systems'
  },
  {
    id: 'story',
    label: 'Story',
    src: '/assets/media/story-mid.mp4',
    section: 'manifesto'
  },
  {
    id: 'contact',
    label: 'Contact',
    src: '/assets/media/story-bottom.mp4',
    section: 'contact'
  }
];

export const chapters = [
  { id: 'hero', number: '01', label: 'Origin' },
  { id: 'manifesto', number: '02', label: 'Story' },
  { id: 'systems', number: '03', label: 'Systems' },
  { id: 'ventures', number: '04', label: 'Ventures' },
  { id: 'links-preview', number: '05', label: 'Library' },
  { id: 'contact', number: '06', label: 'Contact' }
];

export const quickLinks = [
  { label: 'Book a meeting', href: siteMeta.bookingUrl, group: 'Primary' },
  { label: 'Links library', href: '/links/', group: 'Primary' },
  { label: 'Email Matt', href: siteMeta.email, group: 'Primary' },
  { label: 'KR8TiV AI', href: 'https://kr8tiv.ai/', group: 'Companies' },
  { label: 'KR8TiV Agency', href: 'https://kr8tiv.io/', group: 'Companies' },
  { label: 'Jarvis LifeOS', href: 'https://jarvislife.io/', group: 'Companies' },
  { label: 'MeetYourKIN', href: 'https://meetyourkin.com/', group: 'Companies' },
  { label: 'GitHub', href: siteMeta.githubUrl, group: 'Public' },
  { label: 'X', href: siteMeta.xUrl, group: 'Public' },
  { label: 'LinkedIn', href: siteMeta.linkedInUrl, group: 'Public' }
];

export const ventures = [
  {
    name: 'KR8TiV AI',
    tag: 'AI and software agency',
    href: 'https://kr8tiv.ai/',
    repo: 'https://github.com/kr8tiv-ai',
    material: 'signal glass',
    body: 'Autonomous systems, automation infrastructure, and operator tooling for teams that need real output.'
  },
  {
    name: 'KR8TiV Agency',
    tag: 'Positioning and growth atelier',
    href: 'https://kr8tiv.io/',
    repo: 'https://github.com/kr8tiv-io',
    material: 'ink and blade',
    body: 'Founder narrative, GTM systems, launch architecture, and premium web surfaces.'
  },
  {
    name: 'Jarvis LifeOS',
    tag: 'Signal and execution stack',
    href: 'https://jarvislife.io/',
    repo: 'https://github.com/Matt-Aurora-Ventures/Jarvis',
    material: 'black terminal',
    body: 'Trading, life operations, and systems design for practical momentum.'
  },
  {
    name: 'MeetYourKIN',
    tag: 'Relationship intelligence',
    href: 'https://meetyourkin.com/',
    repo: 'https://x.com/meetyourkin',
    material: 'human context',
    body: 'Emotional context, communication clarity, and relationship insight as a product surface.'
  }
];

export const systems = [
  {
    title: 'Systems Designer',
    body: 'Interface, workflow, and narrative architecture built as one operating surface.'
  },
  {
    title: 'Venture Operator',
    body: 'Structure for ambiguous environments where timing, capital, and taste all matter.'
  },
  {
    title: 'AI Builder',
    body: 'Agents, automations, and mission-control tooling that replace chaos with leverage.'
  },
  {
    title: 'Public Builder',
    body: 'Build logs, repo trails, and visible process because momentum compounds in public.'
  }
];
