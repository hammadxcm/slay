import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(import.meta.dirname, '..');

function readComponent(name: string): string {
  const path = resolve(ROOT, 'components', `${name}.astro`);
  return readFileSync(path, 'utf-8');
}

function readFile(relativePath: string): string {
  return readFileSync(resolve(ROOT, '..', relativePath), 'utf-8');
}

describe('project structure', () => {
  const requiredFiles = [
    'src/pages/index.astro',
    'src/layouts/Layout.astro',
    'src/components/Navbar.astro',
    'src/components/Hero.astro',
    'src/components/Terminal.astro',
    'src/components/Features.astro',
    'src/components/Install.astro',
    'src/components/Demo.astro',
    'src/components/Api.astro',
    'src/components/Footer.astro',
    'src/components/ThemeToggle.astro',
    'src/components/Logo.astro',
    'src/components/LanguageSwitcher.astro',
    'src/components/Stats.astro',
    'src/components/Comparison.astro',
    'src/components/Marquee.astro',
    'src/styles/global.css',
    'src/styles/themes.css',
    'src/styles/theme-transitions.css',
    'src/styles/animations.css',
    'src/styles/terminal.css',
    'src/scripts/theme-effects.ts',
    'src/integrations/server-logger.ts',
    'src/i18n/index.ts',
    'src/i18n/translations/en.ts',
    'src/pages/[locale]/index.astro',
    'public/favicon.svg',
    'astro.config.mjs',
    'tsconfig.json',
    'package.json',
  ];

  it.each(requiredFiles)('has %s', (file) => {
    expect(existsSync(resolve(ROOT, '..', file))).toBe(true);
  });
});

describe('Layout', () => {
  const layout = readFileSync(resolve(ROOT, 'layouts', 'Layout.astro'), 'utf-8');

  it('sets charset and viewport meta tags', () => {
    expect(layout).toContain('charset="utf-8"');
    expect(layout).toContain('name="viewport"');
  });

  it('loads Inter and JetBrains Mono fonts', () => {
    expect(layout).toContain('Inter');
    expect(layout).toContain('JetBrains+Mono');
  });

  it('includes IntersectionObserver for scroll reveals', () => {
    expect(layout).toContain('IntersectionObserver');
    expect(layout).toContain('.reveal');
  });

  it('imports all CSS files', () => {
    expect(layout).toContain('global.css');
    expect(layout).toContain('themes.css');
    expect(layout).toContain('theme-transitions.css');
    expect(layout).toContain('animations.css');
    expect(layout).toContain('terminal.css');
  });

  it('has theme flash prevention script', () => {
    expect(layout).toContain('script is:inline');
    expect(layout).toContain('localStorage');
    expect(layout).toContain('data-theme');
  });

  it('supports RTL for Arabic', () => {
    expect(layout).toContain('dir=');
    expect(layout).toContain('rtl');
  });

  it('accepts locale prop', () => {
    expect(layout).toContain('locale');
    expect(layout).toContain('lang=');
  });

  it('has parallax scroll variable', () => {
    expect(layout).toContain('--scroll');
  });

  it('has scroll progress bar', () => {
    expect(layout).toContain('scroll-progress');
    expect(layout).toContain('scaleX');
  });

  it('has mouse spotlight effect', () => {
    expect(layout).toContain('spotlight');
    expect(layout).toContain('mousemove');
    expect(layout).toContain('--mx');
    expect(layout).toContain('--my');
  });

  it('has ambient gradient blobs', () => {
    expect(layout).toContain('ambient');
    expect(layout).toContain('ambient-blob');
  });

  it('has theme canvas element', () => {
    expect(layout).toContain('theme-canvas');
    expect(layout).toContain('theme-effects');
  });

  it('has Open Graph meta tags', () => {
    expect(layout).toContain('og:title');
    expect(layout).toContain('og:description');
    expect(layout).toContain('og:type');
    expect(layout).toContain('og:url');
    expect(layout).toContain('og:image');
    expect(layout).toContain('og:site_name');
    expect(layout).toContain('og:locale');
  });

  it('has Twitter card meta tags', () => {
    expect(layout).toContain('twitter:card');
    expect(layout).toContain('summary_large_image');
    expect(layout).toContain('twitter:title');
    expect(layout).toContain('twitter:description');
    expect(layout).toContain('twitter:image');
  });

  it('has canonical URL support', () => {
    expect(layout).toContain('canonicalUrl');
    expect(layout).toContain('rel="canonical"');
  });

  it('has hreflang tags for all locales', () => {
    expect(layout).toContain('hreflang');
    expect(layout).toContain('x-default');
    expect(layout).toContain('rel="alternate"');
  });

  it('has JSON-LD structured data', () => {
    expect(layout).toContain('application/ld+json');
    expect(layout).toContain('SoftwareApplication');
    expect(layout).toContain('DeveloperApplication');
    expect(layout).toContain('Hammad Khan');
  });

  it('has robots meta tag', () => {
    expect(layout).toContain('name="robots"');
    expect(layout).toContain('index, follow');
  });

  it('has skip-to-content link', () => {
    expect(layout).toContain('skip-link');
    expect(layout).toContain('#main-content');
    expect(layout).toContain('Skip to content');
  });
});

describe('Navbar', () => {
  const navbar = readComponent('Navbar');

  it('has all navigation links', () => {
    expect(navbar).toContain('#features');
    expect(navbar).toContain('#install');
    expect(navbar).toContain('#demos');
    expect(navbar).toContain('#api');
  });

  it('links to GitHub', () => {
    expect(navbar).toContain('github.com/hammadxcm/slay');
  });

  it('has blur backdrop styling', () => {
    expect(navbar).toContain('backdrop-filter');
  });

  it('has hamburger menu for mobile', () => {
    expect(navbar).toContain('hamburger');
    expect(navbar).toContain('is-open');
    expect(navbar).toContain('max-width: 768px');
  });

  it('includes Logo component', () => {
    expect(navbar).toContain("import Logo from './Logo.astro'");
  });

  it('includes ThemeToggle component', () => {
    expect(navbar).toContain("import ThemeToggle from './ThemeToggle.astro'");
  });

  it('includes LanguageSwitcher component', () => {
    expect(navbar).toContain("import LanguageSwitcher from './LanguageSwitcher.astro'");
  });

  it('accepts locale prop', () => {
    expect(navbar).toContain('locale');
  });

  it('has aria-label on brand link', () => {
    expect(navbar).toContain('aria-label="slay home"');
  });

  it('has sr-only text for external GitHub link', () => {
    expect(navbar).toContain('sr-only');
    expect(navbar).toContain('opens in new tab');
  });

  it('closes on Escape key', () => {
    expect(navbar).toContain('Escape');
  });

  it('has aria-hidden on navbar-links', () => {
    expect(navbar).toContain('aria-hidden');
  });

  it('has scroll-aware navbar state', () => {
    expect(navbar).toContain('.navbar.scrolled');
    expect(navbar).toContain('scrollY');
  });

  it('has active section indicator', () => {
    expect(navbar).toContain('.nav-link.active');
    expect(navbar).toContain('IntersectionObserver');
    expect(navbar).toContain('rootMargin');
  });
});

describe('Hero', () => {
  const hero = readComponent('Hero');

  it('has headline text', () => {
    expect(hero).toContain('hero.title.line1');
    expect(hero).toContain('hero.title.line2');
  });

  it('uses gradient text on tagline', () => {
    expect(hero).toContain('gradient-text');
  });

  it('has CTA buttons', () => {
    expect(hero).toContain('#install');
    expect(hero).toContain('hero.cta.github');
    expect(hero).toContain('github.com/hammadxcm/slay');
  });

  it('has terminal animation elements', () => {
    expect(hero).toContain('anim-typing');
    expect(hero).toContain('anim-bullet');
    expect(hero).toContain('anim-explosion');
    expect(hero).toContain('anim-killed');
  });

  it('includes animated glow background', () => {
    expect(hero).toContain('hero-glow');
    expect(hero).toContain('animation: glow');
  });

  it('replays animation on interval with cycling scenarios', () => {
    expect(hero).toContain('setInterval');
    expect(hero).toContain('restartAnimations');
    expect(hero).toContain('scenarios');
    expect(hero).toContain('scenarioIndex');
  });

  it('has shake effect on explosion', () => {
    expect(hero).toContain('shake');
  });

  it('uses cubic-bezier for bullet animation', () => {
    expect(hero).toContain('cubic-bezier');
  });

  it('has parallax glow', () => {
    expect(hero).toContain('--scroll');
  });

  it('has multi-color hero glow', () => {
    expect(hero).toContain('radial-gradient(ellipse at 40% 50%');
    expect(hero).toContain('radial-gradient(ellipse at 60% 40%');
  });

  it('has button shimmer effect', () => {
    expect(hero).toContain('.btn--primary::after');
    expect(hero).toContain('shimmer');
  });

  it('is responsive', () => {
    expect(hero).toContain('max-width: 768px');
    expect(hero).toContain('max-width: 480px');
  });

  it('respects prefers-reduced-motion in JS', () => {
    expect(hero).toContain('prefers-reduced-motion');
    expect(hero).toContain('matchMedia');
  });

  it('has aria-hidden on hero-terminal', () => {
    expect(hero).toContain('aria-hidden="true"');
    expect(hero).toContain('hero-terminal');
  });

  it('has aria-live on rotating word for screen readers', () => {
    expect(hero).toContain('aria-live="polite"');
    expect(hero).toContain('aria-atomic="true"');
  });

  it('has per-theme synonym map', () => {
    expect(hero).toContain('themeSynonyms');
    expect(hero).toContain('dark:');
    expect(hero).toContain('blood:');
    expect(hero).toContain('arctic:');
    expect(hero).toContain('nebula:');
    expect(hero).toContain('matrix:');
    expect(hero).toContain('synthwave:');
  });

  it('listens for themechange event', () => {
    expect(hero).toContain('themechange');
    expect(hero).toContain('CustomEvent');
  });

  it('uses variable glow color', () => {
    expect(hero).toContain('--glow-color');
  });
});

describe('Terminal', () => {
  const terminal = readComponent('Terminal');

  it('renders three traffic light dots', () => {
    expect(terminal).toContain('terminal-dot--red');
    expect(terminal).toContain('terminal-dot--yellow');
    expect(terminal).toContain('terminal-dot--green');
  });

  it('accepts title prop', () => {
    expect(terminal).toContain('terminal-title');
    expect(terminal).toContain('{title}');
  });

  it('has a slot for content', () => {
    expect(terminal).toContain('<slot />');
  });

  it('has aria-hidden on decorative dots', () => {
    const dotMatches = terminal.match(/terminal-dot[^"]*" aria-hidden="true"/g);
    expect(dotMatches).toHaveLength(3);
  });
});

describe('Features', () => {
  const features = readComponent('Features');

  it('has 12 feature cards', () => {
    const matches = features.match(/features\.\w+\.title/g);
    expect(matches).toHaveLength(12);
  });

  it('includes key feature translation keys', () => {
    expect(features).toContain('features.tui.title');
    expect(features).toContain('features.animations.title');
    expect(features).toContain('features.zero.title');
    expect(features).toContain('features.cross.title');
    expect(features).toContain('features.watch.title');
    expect(features).toContain('features.profiles.title');
    expect(features).toContain('features.ranges.title');
    expect(features).toContain('features.portinfo.title');
  });

  it('uses scroll-reveal', () => {
    expect(features).toContain('feature-card reveal');
  });

  it('uses 3-column grid with responsive fallbacks', () => {
    expect(features).toContain('repeat(3, 1fr)');
    expect(features).toContain('repeat(2, 1fr)');
    expect(features).toContain('grid-template-columns: 1fr');
  });

  it('has hover transform', () => {
    expect(features).toContain('translateY(-4px)');
  });

  it('uses standardized breakpoints', () => {
    expect(features).toContain('max-width: 1024px');
    expect(features).toContain('max-width: 480px');
  });

  it('has feature-icon--{id} class pattern for each card', () => {
    const ids = [
      'tui',
      'kill',
      'graceful',
      'watch',
      'tree',
      'json',
      'labels',
      'zero',
      'cross',
      'profiles',
      'ranges',
      'portinfo',
    ];
    for (const id of ids) {
      expect(features).toContain(`feature-icon--${id}`);
    }
  });

  it('has inline SVGs via set:html', () => {
    expect(features).toContain('<svg');
    expect(features).toContain('set:html');
    expect(features).toContain('viewBox="0 0 24 24"');
  });

  it('has command preview element', () => {
    expect(features).toContain('feature-cmd');
    expect(features).toContain('font-family: var(--font-mono)');
  });

  it('has unique CSS keyframe animations for icon hover effects', () => {
    expect(features).toContain('@keyframes icon-blink');
    expect(features).toContain('@keyframes icon-rotate');
    expect(features).toContain('@keyframes icon-breathe');
    expect(features).toContain('@keyframes icon-blink-eye');
    expect(features).toContain('@keyframes icon-spread');
    expect(features).toContain('@keyframes icon-bounce');
    expect(features).toContain('@keyframes icon-swing');
    expect(features).toContain('@keyframes icon-flash');
    expect(features).toContain('@keyframes icon-slide');
    expect(features).toContain('@keyframes icon-expand');
    expect(features).toContain('@keyframes icon-pulse');
  });

  it('respects prefers-reduced-motion for icon animations', () => {
    expect(features).toContain('prefers-reduced-motion: reduce');
    expect(features).toContain('animation: none !important');
  });
});

describe('Install', () => {
  const install = readComponent('Install');

  it('has npx command', () => {
    expect(install).toContain('npx slay-port 3000');
  });

  it('has global install command', () => {
    expect(install).toContain('npm i -g slay-port');
  });

  it('has API import command', () => {
    expect(install).toContain("import { findByPort, killProcess } from 'slay-port'");
  });

  it('has pnpm commands', () => {
    expect(install).toContain('pnpm dlx slay-port 3000');
    expect(install).toContain('pnpm add -g slay-port');
  });

  it('has yarn commands', () => {
    expect(install).toContain('yarn dlx slay-port 3000');
    expect(install).toContain('yarn global add slay-port');
  });

  it('has bun commands', () => {
    expect(install).toContain('bunx slay-port 3000');
    expect(install).toContain('bun add -g slay-port');
  });

  it('has WAI-ARIA tabs pattern for package managers', () => {
    expect(install).toContain('role="tab"');
    expect(install).toContain('aria-selected');
    expect(install).toContain('aria-controls');
    expect(install).toContain('role="tabpanel"');
    expect(install).toContain('aria-labelledby');
    expect(install).toContain('role="tablist"');
  });

  it('has keyboard navigation for tabs', () => {
    expect(install).toContain('ArrowRight');
    expect(install).toContain('ArrowLeft');
  });

  it('has copy-to-clipboard buttons', () => {
    expect(install).toContain('copy-btn');
    expect(install).toContain('navigator.clipboard.writeText');
  });

  it('has minimum touch targets for copy buttons', () => {
    expect(install).toContain('min-width: 44px');
    expect(install).toContain('min-height: 44px');
  });

  it('is responsive', () => {
    expect(install).toContain('@media');
    expect(install).toContain('max-width: 768px');
  });

  it('has aria-live region for copy feedback', () => {
    expect(install).toContain('aria-live="polite"');
    expect(install).toContain('copy-status');
  });
});

describe('Demo', () => {
  const demo = readComponent('Demo');

  it('has fifteen demo scenarios across four tabs', () => {
    expect(demo).toContain('Basic Kill');
    expect(demo).toContain('Interactive Mode');
    expect(demo).toContain('Watch Mode');
    expect(demo).toContain('Force Kill');
    expect(demo).toContain('Graceful Shutdown');
    expect(demo).toContain('Multi-port');
    expect(demo).toContain('Dry Run');
    expect(demo).toContain('Process Tree');
    expect(demo).toContain('JSON Output');
    expect(demo).toContain('UDP Ports');
    expect(demo).toContain('All Listeners');
    expect(demo).toContain('Verbose Mode');
    expect(demo).toContain('Init Config');
    expect(demo).toContain('Run Profile');
    expect(demo).toContain('Port Range');
  });

  it('uses Terminal component', () => {
    expect(demo).toContain("import Terminal from './Terminal.astro'");
  });

  it('has WAI-ARIA tabs pattern', () => {
    expect(demo).toContain('role="tab"');
    expect(demo).toContain('aria-selected');
    expect(demo).toContain('aria-controls');
    expect(demo).toContain('role="tabpanel"');
    expect(demo).toContain('aria-labelledby');
    expect(demo).toContain('aria-label="Demo categories"');
  });

  it('has four tab categories', () => {
    expect(demo).toContain('demos.tab.basic');
    expect(demo).toContain('demos.tab.advanced');
    expect(demo).toContain('demos.tab.output');
    expect(demo).toContain('demos.tab.profiles');
  });

  it('has staggered animation delays', () => {
    expect(demo).toContain('--delay');
  });

  it('is responsive', () => {
    expect(demo).toContain('max-width: 768px');
  });

  it('supports keyboard navigation for tabs', () => {
    expect(demo).toContain('ArrowRight');
    expect(demo).toContain('ArrowLeft');
    expect(demo).toContain('Home');
    expect(demo).toContain('End');
  });
});

describe('Api', () => {
  const api = readComponent('Api');

  it('documents key exports', () => {
    expect(api).toContain('findByPort');
    expect(api).toContain('killProcess');
    expect(api).toContain('findAllListening');
    expect(api).toContain('enrichLabel');
  });

  it('has code example', () => {
    expect(api).toContain('slay-port');
  });

  it('uses 2-column grid', () => {
    expect(api).toContain('1fr 1fr');
  });

  it('is responsive', () => {
    expect(api).toContain('max-width: 768px');
  });
});

describe('Footer', () => {
  const footer = readComponent('Footer');

  it('links to GitHub, npm, and license', () => {
    expect(footer).toContain('github.com/hammadxcm/slay');
    expect(footer).toContain('npmjs.com/package/slay-port');
    expect(footer).toContain('MIT License');
  });

  it('credits Hammad Khan', () => {
    expect(footer).toContain('footer.made');
  });

  it('has 3-column layout', () => {
    expect(footer).toContain('footer-left');
    expect(footer).toContain('footer-center');
    expect(footer).toContain('footer-right');
    expect(footer).toContain('grid-template-columns: 1fr 1fr 1fr');
  });

  it('has Star on GitHub button', () => {
    expect(footer).toContain('footer-star-btn');
    expect(footer).toContain('footer.star');
  });

  it('links to portfolio', () => {
    expect(footer).toContain('hk.fyniti.co.uk');
  });

  it('links to GitHub profile', () => {
    expect(footer).toContain('@hammadxcm');
  });

  it('has gradient top border', () => {
    expect(footer).toContain('border-image');
    expect(footer).toContain('linear-gradient');
  });

  it('uses Logo component', () => {
    expect(footer).toContain("import Logo from './Logo.astro'");
  });

  it('has aria-hidden on star SVG', () => {
    expect(footer).toContain('aria-hidden="true"');
  });

  it('has sr-only text for external links', () => {
    expect(footer).toContain('sr-only');
    expect(footer).toContain('opens in new tab');
  });

  it('has animated gradient border', () => {
    expect(footer).toContain('gradient-border-flow');
    expect(footer).toContain('.footer::before');
  });

  it('has animated link underlines on hover', () => {
    expect(footer).toContain('.footer-link::after');
    expect(footer).toContain('scaleX(0)');
    expect(footer).toContain('scaleX(1)');
  });
});

describe('ThemeToggle', () => {
  const toggle = readComponent('ThemeToggle');

  it('has theme dropdown menu', () => {
    expect(toggle).toContain('theme-dropdown');
    expect(toggle).toContain('theme-option');
  });

  it('has menu roles for accessibility', () => {
    expect(toggle).toContain('role="menu"');
    expect(toggle).toContain('role="menuitem"');
  });

  it('has aria-haspopup and aria-expanded', () => {
    expect(toggle).toContain('aria-haspopup="true"');
    expect(toggle).toContain('aria-expanded');
  });

  it('toggles data-theme attribute', () => {
    expect(toggle).toContain('data-theme');
    expect(toggle).toContain('localStorage');
  });

  it('has accessible button', () => {
    expect(toggle).toContain('aria-label');
  });

  it('uses View Transitions API with data-theme-transition', () => {
    expect(toggle).toContain('startViewTransition');
    expect(toggle).toContain('data-theme-transition');
  });

  it('has all 9 theme options', () => {
    expect(toggle).toContain("id: 'dark'");
    expect(toggle).toContain("id: 'light'");
    expect(toggle).toContain("id: 'blood'");
    expect(toggle).toContain("id: 'synthwave'");
    expect(toggle).toContain("id: 'matrix'");
    expect(toggle).toContain("id: 'cyberpunk'");
    expect(toggle).toContain("id: 'gruvbox'");
    expect(toggle).toContain("id: 'arctic'");
    expect(toggle).toContain("id: 'nebula'");
  });

  it('dispatches themechange custom event', () => {
    expect(toggle).toContain('themechange');
    expect(toggle).toContain('CustomEvent');
  });

  it('has keyboard navigation', () => {
    expect(toggle).toContain('ArrowDown');
    expect(toggle).toContain('ArrowUp');
    expect(toggle).toContain('Escape');
  });

  it('has inline SVG icons for each theme', () => {
    expect(toggle).toContain('theme-icon');
    expect(toggle).toContain('theme-option-icon');
    expect(toggle).toContain('<svg');
    expect(toggle).toContain('set:html');
  });

  it('has random theme button', () => {
    expect(toggle).toContain('theme-random');
    expect(toggle).toContain('Random theme');
    expect(toggle).toContain('allThemeIds');
    expect(toggle).toContain('Math.random');
  });

  it('has aria-controls on toggle button', () => {
    expect(toggle).toContain('aria-controls="theme-dropdown"');
  });

  it('has data-theme-color on menu items', () => {
    expect(toggle).toContain('data-theme-color');
  });
});

describe('Logo', () => {
  const logo = readComponent('Logo');

  it('has SVG crosshair elements', () => {
    expect(logo).toContain('<svg');
    expect(logo).toContain('<circle');
    expect(logo).toContain('<line');
  });

  it('has reticle pulse animation', () => {
    expect(logo).toContain('reticle-pulse');
  });

  it('has hover rotation', () => {
    expect(logo).toContain('rotate(360deg)');
  });

  it('is 28x28 pixels', () => {
    expect(logo).toContain('width="28"');
    expect(logo).toContain('height="28"');
  });
});

describe('LanguageSwitcher', () => {
  const switcher = readComponent('LanguageSwitcher');

  it('has dropdown with language options', () => {
    expect(switcher).toContain('lang-dropdown');
    expect(switcher).toContain('lang-option');
  });

  it('includes all 10 languages', () => {
    expect(switcher).toContain('English');
    expect(switcher).toContain('中文');
    expect(switcher).toContain('हिन्दी');
    expect(switcher).toContain('Español');
    expect(switcher).toContain('العربية');
    expect(switcher).toContain('Français');
    expect(switcher).toContain('বাংলা');
    expect(switcher).toContain('Português');
    expect(switcher).toContain('Русский');
    expect(switcher).toContain('日本語');
  });

  it('links to locale paths', () => {
    expect(switcher).toContain("lang.code === 'en' ? '/' : `/${lang.code}/`");
  });

  it('has aria-haspopup and aria-expanded', () => {
    expect(switcher).toContain('aria-haspopup="true"');
    expect(switcher).toContain('aria-expanded');
  });

  it('has menu roles', () => {
    expect(switcher).toContain('role="menu"');
    expect(switcher).toContain('role="menuitem"');
  });
});

describe('Stats', () => {
  const stats = readComponent('Stats');

  it('has six stat items including dynamic', () => {
    expect(stats).toContain('stats.downloads');
    expect(stats).toContain('stats.stars');
    expect(stats).toContain('stats.deps');
    expect(stats).toContain('stats.platforms');
    expect(stats).toContain('stats.tests');
    expect(stats).toContain('stats.languages');
  });

  it('has animated counters', () => {
    expect(stats).toContain('stat-number');
    expect(stats).toContain('data-target');
    expect(stats).toContain('IntersectionObserver');
  });

  it('fetches dynamic stats from npm and GitHub APIs', () => {
    expect(stats).toContain('data-api');
    expect(stats).toContain('api.npmjs.org');
    expect(stats).toContain('api.github.com');
    expect(stats).toContain('fetchDynamicStats');
    expect(stats).toContain('Promise.allSettled');
  });

  it('has loading state for dynamic stats', () => {
    expect(stats).toContain('loading');
    expect(stats).toContain('pulse-stat');
  });

  it('has scroll-reveal', () => {
    expect(stats).toContain('reveal');
  });

  it('is responsive', () => {
    expect(stats).toContain('max-width: 768px');
  });

  it('respects prefers-reduced-motion', () => {
    expect(stats).toContain('prefers-reduced-motion');
  });

  it('has aria-label for accessibility', () => {
    expect(stats).toContain('aria-label');
  });

  it('has staggered entrance delays', () => {
    expect(stats).toContain('--delay');
  });

  it('has accent glow on hover', () => {
    expect(stats).toContain('color-mix');
  });
});

describe('Comparison', () => {
  const comparison = readComponent('Comparison');

  it('has old way and new way sections', () => {
    expect(comparison).toContain('comparison.old');
    expect(comparison).toContain('comparison.new');
  });

  it('shows terminal commands', () => {
    expect(comparison).toContain('lsof');
    expect(comparison).toContain('slay 3000');
  });

  it('uses Terminal component', () => {
    expect(comparison).toContain("import Terminal from './Terminal.astro'");
  });

  it('has scroll-reveal', () => {
    expect(comparison).toContain('reveal');
  });

  it('is responsive', () => {
    expect(comparison).toContain('max-width: 768px');
  });

  it('has section heading with gradient text', () => {
    expect(comparison).toContain('gradient-text');
    expect(comparison).toContain('comparison.heading');
  });
});

describe('Marquee', () => {
  const marquee = readComponent('Marquee');

  it('lists supported technologies', () => {
    expect(marquee).toContain('Node.js');
    expect(marquee).toContain('Python');
    expect(marquee).toContain('Docker');
    expect(marquee).toContain('PostgreSQL');
  });

  it('has infinite scroll animation', () => {
    expect(marquee).toContain('marquee-scroll');
    expect(marquee).toContain('marquee-track');
  });

  it('is aria-hidden for accessibility', () => {
    expect(marquee).toContain('aria-hidden="true"');
  });

  it('has fade mask', () => {
    expect(marquee).toContain('mask-image');
  });

  it('respects prefers-reduced-motion', () => {
    expect(marquee).toContain('prefers-reduced-motion');
  });

  it('has brand icons from CDN', () => {
    expect(marquee).toContain('marquee-icon');
    expect(marquee).toContain('cdn.simpleicons.org');
  });
});

describe('i18n', () => {
  it('has English translations', () => {
    const en = readFileSync(resolve(ROOT, 'i18n', 'translations', 'en.ts'), 'utf-8');
    expect(en).toContain('nav.features');
    expect(en).toContain('hero.title.line1');
    expect(en).toContain('footer.tagline');
  });

  it('has translation helper', () => {
    const index = readFileSync(resolve(ROOT, 'i18n', 'index.ts'), 'utf-8');
    expect(index).toContain('getTranslation');
    expect(index).toContain('locales');
  });

  const translationLocales = ['zh', 'hi', 'es', 'ar', 'fr', 'bn', 'pt', 'ru', 'ja'];
  it.each(translationLocales)('has %s translation file', (loc) => {
    expect(existsSync(resolve(ROOT, 'i18n', 'translations', `${loc}.ts`))).toBe(true);
  });
});

describe('index page', () => {
  const index = readFileSync(resolve(ROOT, 'pages', 'index.astro'), 'utf-8');

  it('imports all components', () => {
    const components = [
      'Layout',
      'Navbar',
      'Hero',
      'Features',
      'Install',
      'Demo',
      'Api',
      'Footer',
      'Stats',
      'Comparison',
      'Marquee',
    ];
    for (const name of components) {
      expect(index).toContain(`import ${name} from`);
    }
  });

  it('renders components in correct order', () => {
    const order = [
      'Navbar',
      'Hero',
      'Marquee',
      'Stats',
      'Features',
      'Comparison',
      'Install',
      'Demo',
      'Api',
      'Footer',
    ];
    let lastIndex = -1;
    for (const name of order) {
      const idx = index.indexOf(`<${name}`);
      expect(idx).toBeGreaterThan(lastIndex);
      lastIndex = idx;
    }
  });

  it('passes locale prop', () => {
    expect(index).toContain('locale={locale}');
  });

  it('has main-content id on main element', () => {
    expect(index).toContain('id="main-content"');
  });
});

describe('locale page', () => {
  const localePage = readFileSync(resolve(ROOT, 'pages', '[locale]', 'index.astro'), 'utf-8');

  it('has getStaticPaths', () => {
    expect(localePage).toContain('getStaticPaths');
  });

  it('passes locale to components', () => {
    expect(localePage).toContain('locale={locale}');
  });

  it('has main-content id on main element', () => {
    expect(localePage).toContain('id="main-content"');
  });
});

describe('themes.css', () => {
  const themes = readFileSync(resolve(ROOT, 'styles', 'themes.css'), 'utf-8');

  it('has all 7 additional theme selectors', () => {
    expect(themes).toContain('[data-theme="blood"]');
    expect(themes).toContain('[data-theme="arctic"]');
    expect(themes).toContain('[data-theme="nebula"]');
    expect(themes).toContain('[data-theme="synthwave"]');
    expect(themes).toContain('[data-theme="matrix"]');
    expect(themes).toContain('[data-theme="cyberpunk"]');
    expect(themes).toContain('[data-theme="gruvbox"]');
  });

  it('defines core CSS variables for each theme', () => {
    expect(themes).toContain('--bg:');
    expect(themes).toContain('--glow-color:');
    expect(themes).toContain('--ambient-blob-opacity:');
    expect(themes).toContain('--spotlight-color:');
    expect(themes).toContain('--gradient-text:');
    expect(themes).toContain('--nav-bg-scrolled:');
  });
});

describe('theme-transitions.css', () => {
  const transitions = readFileSync(resolve(ROOT, 'styles', 'theme-transitions.css'), 'utf-8');

  it('has view-transition selectors', () => {
    expect(transitions).toContain('view-transition-old(root)');
    expect(transitions).toContain('view-transition-new(root)');
  });

  it('has all theme transition animations', () => {
    expect(transitions).toContain('theme-morph');
    expect(transitions).toContain('warm-fade');
    expect(transitions).toContain('blood-drip');
    expect(transitions).toContain('frost-crystallize');
    expect(transitions).toContain('cosmic-swirl');
    expect(transitions).toContain('vhs-wipe');
    expect(transitions).toContain('glitch-dissolve');
    expect(transitions).toContain('hologram-glitch');
    expect(transitions).toContain('tv-static');
  });

  it('has data-theme-transition selectors for each theme', () => {
    expect(transitions).toContain('[data-theme-transition="dark"]');
    expect(transitions).toContain('[data-theme-transition="light"]');
    expect(transitions).toContain('[data-theme-transition="blood"]');
    expect(transitions).toContain('[data-theme-transition="arctic"]');
    expect(transitions).toContain('[data-theme-transition="nebula"]');
    expect(transitions).toContain('[data-theme-transition="synthwave"]');
    expect(transitions).toContain('[data-theme-transition="matrix"]');
    expect(transitions).toContain('[data-theme-transition="cyberpunk"]');
    expect(transitions).toContain('[data-theme-transition="gruvbox"]');
  });

  it('has prefers-reduced-motion override', () => {
    expect(transitions).toContain('prefers-reduced-motion: reduce');
    expect(transitions).toContain('animation: none !important');
  });
});

describe('blob variables', () => {
  const global = readFileSync(resolve(ROOT, 'styles', 'global.css'), 'utf-8');
  const themes = readFileSync(resolve(ROOT, 'styles', 'themes.css'), 'utf-8');

  it('defines --blob-1, --blob-2, --blob-3 in :root', () => {
    expect(global).toContain('--blob-1:');
    expect(global).toContain('--blob-2:');
    expect(global).toContain('--blob-3:');
  });

  it('uses blob variables in ambient blob selectors', () => {
    expect(global).toContain('var(--blob-1)');
    expect(global).toContain('var(--blob-2)');
    expect(global).toContain('var(--blob-3)');
  });

  it('has blob overrides in divergent themes', () => {
    expect(themes).toContain('--blob-1: #0369a1');
    expect(themes).toContain('--blob-3: #b967ff');
    expect(themes).toContain('--blob-3: #39ff14');
    expect(themes).toContain('--blob-3: #ffd700');
    expect(themes).toContain('--blob-2: #fabd2f');
  });
});

describe('CSS styles', () => {
  const global = readFileSync(resolve(ROOT, 'styles', 'global.css'), 'utf-8');
  const animations = readFileSync(resolve(ROOT, 'styles', 'animations.css'), 'utf-8');
  const terminal = readFileSync(resolve(ROOT, 'styles', 'terminal.css'), 'utf-8');

  it('defines CSS custom properties', () => {
    expect(global).toContain('--bg:');
    expect(global).toContain('--red:');
    expect(global).toContain('--green:');
    expect(global).toContain('--yellow:');
    expect(global).toContain('--cyan:');
    expect(global).toContain('--font-sans:');
    expect(global).toContain('--font-mono:');
    expect(global).toContain('--glass-bg:');
    expect(global).toContain('--glass-border:');
    expect(global).toContain('--glow-color:');
    expect(global).toContain('--ambient-blob-opacity:');
    expect(global).toContain('--spotlight-color:');
    expect(global).toContain('--nav-bg-scrolled:');
    expect(global).toContain('--gradient-text:');
  });

  it('has light theme variables', () => {
    expect(global).toContain('[data-theme="light"]');
    expect(global).toContain('--bg: #fafafa');
  });

  it('has prefers-reduced-motion support', () => {
    expect(global).toContain('prefers-reduced-motion');
    expect(global).toContain('animation-duration: 0.01ms');
  });

  it('has RTL support', () => {
    expect(global).toContain('[dir="rtl"]');
  });

  it('has grid utility classes', () => {
    expect(global).toContain('.grid-3');
    expect(global).toContain('.grid-2');
  });

  it('uses standardized breakpoints', () => {
    expect(global).toContain('max-width: 1024px');
    expect(global).toContain('max-width: 768px');
    expect(global).toContain('max-width: 480px');
  });

  it('has responsive breakpoints in global styles', () => {
    expect(global).toContain('@media');
  });

  it('has .sr-only utility class', () => {
    expect(global).toContain('.sr-only');
    expect(global).toContain('clip: rect(0, 0, 0, 0)');
  });

  it('has :focus-visible styles', () => {
    expect(global).toContain(':focus-visible');
    expect(global).toContain('outline: 2px solid var(--cyan)');
    expect(global).toContain('outline-offset: 2px');
  });

  it('has ambient gradient blob styles', () => {
    expect(global).toContain('.ambient');
    expect(global).toContain('.ambient-blob');
    expect(global).toContain('filter: blur(120px)');
  });

  it('has mouse spotlight styles', () => {
    expect(global).toContain('.spotlight');
    expect(global).toContain('--mx');
    expect(global).toContain('--my');
  });

  it('has scroll progress bar styles', () => {
    expect(global).toContain('.scroll-progress');
    expect(global).toContain('scaleX(0)');
  });

  it('has skip-link styles', () => {
    expect(global).toContain('.skip-link');
    expect(global).toContain('.skip-link:focus');
  });

  it('defines all keyframe animations', () => {
    expect(animations).toContain('@keyframes typing');
    expect(animations).toContain('@keyframes bullet-fly');
    expect(animations).toContain('@keyframes slide-up');
    expect(animations).toContain('@keyframes fade-in');
    expect(animations).toContain('@keyframes glow');
    expect(animations).toContain('@keyframes scale-in');
    expect(animations).toContain('@keyframes slide-in-left');
    expect(animations).toContain('@keyframes slide-in-right');
    expect(animations).toContain('@keyframes shake');
    expect(animations).toContain('@keyframes crosshair-rotate');
    expect(animations).toContain('@keyframes reticle-pulse');
    expect(animations).toContain('@keyframes shimmer');
    expect(animations).toContain('@keyframes float');
    expect(animations).toContain('@keyframes marquee-scroll');
    expect(animations).toContain('@keyframes pulse-glow');
    expect(animations).toContain('@keyframes blob-float');
    expect(animations).toContain('@keyframes gradient-border-flow');
  });

  it('has reveal class for scroll animations', () => {
    expect(animations).toContain('.reveal');
    expect(animations).toContain('.reveal.visible');
  });

  it('has staggered delay support in reveal', () => {
    expect(animations).toContain('var(--delay, 0s)');
  });

  it('defines terminal chrome styles', () => {
    expect(terminal).toContain('.terminal');
    expect(terminal).toContain('.terminal-header');
    expect(terminal).toContain('.terminal-body');
    expect(terminal).toContain('.terminal-dot');
  });

  it('has tab styles', () => {
    expect(terminal).toContain('.demo-tabs');
    expect(terminal).toContain('.demo-tab-content');
  });

  it('has scanline effect', () => {
    expect(terminal).toContain('scanline');
  });

  it('has responsive terminal styles', () => {
    expect(terminal).toContain('@media');
  });
});

describe('astro config', () => {
  const config = readFileSync(resolve(ROOT, '..', 'astro.config.mjs'), 'utf-8');

  it('sets correct site URL', () => {
    expect(config).toContain('slay.fyniti.co.uk');
  });

  it('has i18n configuration', () => {
    expect(config).toContain('i18n');
    expect(config).toContain('defaultLocale');
    expect(config).toContain('locales');
  });

  it('has sitemap integration', () => {
    expect(config).toContain('sitemap');
    expect(config).toContain('integrations');
  });
});

describe('favicon', () => {
  const favicon = readFileSync(resolve(ROOT, '..', 'public', 'favicon.svg'), 'utf-8');

  it('is valid SVG', () => {
    expect(favicon).toContain('<svg');
    expect(favicon).toContain('</svg>');
  });

  it('uses red color scheme', () => {
    expect(favicon).toContain('#ff6b6b');
  });

  it('has crosshair elements', () => {
    expect(favicon).toContain('<circle');
    expect(favicon).toContain('<line');
  });
});

describe('theme-effects.ts', () => {
  const effects = readFileSync(resolve(ROOT, 'scripts', 'theme-effects.ts'), 'utf-8');

  it('exports initThemeEffects', () => {
    expect(effects).toContain('export function initThemeEffects');
  });

  it('has Mote interface with base and optional fields', () => {
    expect(effects).toContain('interface Mote');
    expect(effects).toContain('x: number');
    expect(effects).toContain('y: number');
    expect(effects).toContain('drift: number');
    expect(effects).toContain('glowSpeed: number');
  });

  it('has MOTE_DEFAULTS and mote() factory', () => {
    expect(effects).toContain('MOTE_DEFAULTS');
    expect(effects).toContain('function mote(');
    expect(effects).toContain('...MOTE_DEFAULTS');
  });

  it('has drawTrail shared helper', () => {
    expect(effects).toContain('function drawTrail(');
    expect(effects).toContain('createLinearGradient');
  });

  it('has drawGlowDot shared helper with default params', () => {
    expect(effects).toContain('function drawGlowDot(');
    expect(effects).toContain('glowMul = 0.12');
    expect(effects).toContain('coreMul = 0.5');
  });

  it('has all 7 effect configs', () => {
    expect(effects).toContain('const bloodRain');
    expect(effects).toContain('const neonSparks');
    expect(effects).toContain('const cosmicDust');
    expect(effects).toContain('const snowfall');
    expect(effects).toContain('const fireflies');
    expect(effects).toContain('function drawRetroGrid');
    expect(effects).toContain('function drawMatrixRain');
  });

  it('has themeEffects record for all 9 themes', () => {
    expect(effects).toContain('dark: { effect: null');
    expect(effects).toContain('light: { effect: null');
    expect(effects).toContain("blood: { effect: 'bloodRain'");
    expect(effects).toContain("synthwave: { effect: 'retroGrid'");
    expect(effects).toContain("matrix: { effect: 'matrixRain'");
    expect(effects).toContain("cyberpunk: { effect: 'neonSparks'");
    expect(effects).toContain("gruvbox: { effect: 'fireflies'");
    expect(effects).toContain("arctic: { effect: 'snowfall'");
    expect(effects).toContain("nebula: { effect: 'cosmicDust'");
  });

  it('has flat effectMap with all 7 entries', () => {
    expect(effects).toContain('Effect Registry (flat)');
    expect(effects).toContain('retroGrid:');
    expect(effects).toContain('matrixRain:');
    expect(effects).toContain('bloodRain:');
    expect(effects).toContain('neonSparks:');
    expect(effects).toContain('cosmicDust:');
    expect(effects).toContain('snowfall:');
    expect(effects).toContain('fireflies:');
  });

  it('caches currentEntry for draw loop', () => {
    expect(effects).toContain('let currentEntry');
    expect(effects).toContain('currentEntry.color');
  });

  it('uses mote() factory in effect spawns', () => {
    const moteCallCount =
      (effects.match(/return mote\(/g) || []).length +
      (effects.match(/=> *\n? *mote\(/g) || []).length;
    expect(moteCallCount).toBeGreaterThanOrEqual(5);
  });

  it('uses drawTrail in neonSparks', () => {
    const neonSection = effects.slice(effects.indexOf('Effect: Neon Sparks'));
    expect(neonSection).toContain('drawTrail(');
  });

  it('uses drawGlowDot in cosmicDust and fireflies', () => {
    const cosmicSection = effects.slice(effects.indexOf('Effect: Cosmic Dust'));
    expect(cosmicSection).toContain('drawGlowDot(');
    const fireflySection = effects.slice(effects.indexOf('Effect: Fireflies'));
    expect(fireflySection).toContain('drawGlowDot(');
  });

  it('respects prefers-reduced-motion', () => {
    expect(effects).toContain('prefersReducedMotion');
    expect(effects).toContain('prefers-reduced-motion');
  });

  it('handles visibility changes', () => {
    expect(effects).toContain('visibilitychange');
    expect(effects).toContain('document.hidden');
    expect(effects).toContain('cancelAnimationFrame');
  });

  it('supports touch device optimization', () => {
    expect(effects).toContain('isTouchDevice');
    expect(effects).toContain('ontouchstart');
    expect(effects).toContain('* 0.6');
  });

  it('listens for themechange event', () => {
    expect(effects).toContain('themechange');
    expect(effects).toContain('switchEffect');
  });

  it('has MoteEffectConfig interface', () => {
    expect(effects).toContain('interface MoteEffectConfig');
    expect(effects).toContain('count:');
    expect(effects).toContain('spawn:');
    expect(effects).toContain('update:');
    expect(effects).toContain('draw:');
  });

  it('has EffectName union type', () => {
    expect(effects).toContain('type EffectName');
    expect(effects).toContain("'bloodRain'");
    expect(effects).toContain("'matrixRain'");
    expect(effects).toContain("'retroGrid'");
  });
});

describe('server-logger.ts', () => {
  const logger = readFileSync(resolve(ROOT, 'integrations', 'server-logger.ts'), 'utf-8');

  it('exports default function', () => {
    expect(logger).toContain('export default function serverLogger');
  });

  it('returns AstroIntegration object', () => {
    expect(logger).toContain('AstroIntegration');
    expect(logger).toContain("name: 'slay-server-logger'");
  });

  it('hooks into astro:server:start', () => {
    expect(logger).toContain("'astro:server:start'");
  });

  it('formats local and network URLs', () => {
    expect(logger).toContain('localhost');
    expect(logger).toContain('address.port');
    expect(logger).toContain('address.family');
  });

  it('handles IPv6 addresses', () => {
    expect(logger).toContain('IPv6');
    expect(logger).toContain('[${address.address}]');
  });

  it('uses ANSI color codes', () => {
    expect(logger).toContain('\\x1b[');
    expect(logger).toContain('BOLD');
    expect(logger).toContain('RED');
    expect(logger).toContain('GREEN');
    expect(logger).toContain('CYAN');
    expect(logger).toContain('RESET');
  });
});

describe('i18n module', () => {
  const index = readFileSync(resolve(ROOT, 'i18n', 'index.ts'), 'utf-8');

  it('imports all 10 locale translation files', () => {
    const locales = ['ar', 'bn', 'en', 'es', 'fr', 'hi', 'ja', 'pt', 'ru', 'zh'];
    for (const loc of locales) {
      expect(index).toContain(`import ${loc} from`);
    }
  });

  it('has translations record with all locales', () => {
    expect(index).toContain('const translations');
    expect(index).toContain('Record<string, Record<string, string>>');
  });

  it('exports getTranslation with fallback logic', () => {
    expect(index).toContain('export function getTranslation');
    expect(index).toContain('translations[locale] || translations.en');
    expect(index).toContain('translations.en[key] || key');
  });

  it('exports locales array and Locale type', () => {
    expect(index).toContain('export const locales');
    expect(index).toContain('export type Locale');
    expect(index).toContain('as const');
  });
});

describe('i18n translation parity', () => {
  const en = readFileSync(resolve(ROOT, 'i18n', 'translations', 'en.ts'), 'utf-8');
  const enKeys = [...en.matchAll(/'([^']+)':/g)].map((m) => m[1]);

  const locales = ['zh', 'hi', 'es', 'ar', 'fr', 'bn', 'pt', 'ru', 'ja'];

  it.each(locales)('%s has all English translation keys', (loc) => {
    const content = readFileSync(resolve(ROOT, 'i18n', 'translations', `${loc}.ts`), 'utf-8');
    for (const key of enKeys) {
      expect(content).toContain(`'${key}'`);
    }
  });

  it.each(locales)('%s has no extra keys beyond English', (loc) => {
    const content = readFileSync(resolve(ROOT, 'i18n', 'translations', `${loc}.ts`), 'utf-8');
    const locKeys = [...content.matchAll(/'([^']+)':/g)].map((m) => m[1]);
    for (const key of locKeys) {
      expect(enKeys).toContain(key);
    }
  });
});

describe('animations.css theme integration', () => {
  const animations = readFileSync(resolve(ROOT, 'styles', 'animations.css'), 'utf-8');

  it('uses color-mix with var(--red) in pulse keyframe', () => {
    expect(animations).toContain('color-mix(in srgb, var(--red)');
    expect(animations).toContain('@keyframes pulse');
  });

  it('uses color-mix with var(--red) in pulse-glow keyframe', () => {
    const pulseGlow = animations.slice(animations.indexOf('@keyframes pulse-glow'));
    expect(pulseGlow).toContain('color-mix(in srgb, var(--red)');
  });

  it('does not contain hardcoded rgba(255, 107, 107)', () => {
    expect(animations).not.toContain('rgba(255, 107, 107');
  });
});

describe('theme-transitions.css z-index dedup', () => {
  const transitions = readFileSync(resolve(ROOT, 'styles', 'theme-transitions.css'), 'utf-8');

  it('has shared z-index base rules', () => {
    const beforeFirstTheme = transitions.slice(0, transitions.indexOf('[data-theme-transition='));
    expect(beforeFirstTheme).toContain('::view-transition-old(root)');
    expect(beforeFirstTheme).toContain('z-index: 1');
    expect(beforeFirstTheme).toContain('::view-transition-new(root)');
    expect(beforeFirstTheme).toContain('z-index: 2');
  });

  it('theme-specific selectors do not repeat z-index', () => {
    const themeBlocks = transitions.slice(transitions.indexOf('[data-theme-transition='));
    const reducedMotion = themeBlocks.indexOf('@media (prefers-reduced-motion');
    const onlyThemes = themeBlocks.slice(0, reducedMotion > 0 ? reducedMotion : undefined);
    expect(onlyThemes).not.toContain('z-index');
  });
});

describe('global.css no --accent bug', () => {
  const global = readFileSync(resolve(ROOT, 'styles', 'global.css'), 'utf-8');

  it('does not reference undefined var(--accent)', () => {
    expect(global).not.toContain('var(--accent)');
  });
});
