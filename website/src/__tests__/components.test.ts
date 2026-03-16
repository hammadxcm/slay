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
    'src/styles/global.css',
    'src/styles/animations.css',
    'src/styles/terminal.css',
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
});

describe('ThemeToggle', () => {
  const toggle = readComponent('ThemeToggle');

  it('has sun and moon icons', () => {
    expect(toggle).toContain('theme-icon--sun');
    expect(toggle).toContain('theme-icon--moon');
  });

  it('toggles data-theme attribute', () => {
    expect(toggle).toContain('data-theme');
    expect(toggle).toContain('localStorage');
  });

  it('has accessible button', () => {
    expect(toggle).toContain('aria-label');
  });

  it('has aria-pressed toggle state', () => {
    expect(toggle).toContain('aria-pressed');
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
    const components = ['Layout', 'Navbar', 'Hero', 'Features', 'Install', 'Demo', 'Api', 'Footer'];
    for (const name of components) {
      expect(index).toContain(`import ${name} from`);
    }
  });

  it('renders components in correct order', () => {
    const order = ['Navbar', 'Hero', 'Features', 'Install', 'Demo', 'Api', 'Footer'];
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
