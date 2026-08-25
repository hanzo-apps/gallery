// Drives the exported site the way a person does. Static output tells you a
// page rendered; only this tells you the controls on it still work.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };

const server = createServer((req, res) => {
  let p = join('out', decodeURIComponent(req.url.split('?')[0]));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  if (!existsSync(p) && existsSync(p + '.html')) p += '.html';
  if (!existsSync(p)) { res.statusCode = 404; p = 'out/404.html'; if (!existsSync(p)) return res.end('nf'); }
  res.setHeader('content-type', types[extname(p)] || 'application/octet-stream');
  res.end(readFileSync(p));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

let pass = 0, fail = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
  ok ? pass++ : fail++;
};
const go = async (path) => { await page.goto(base + path, { waitUntil: 'networkidle' }); await page.waitForTimeout(400); };

// ---- home ----------------------------------------------------------------
await go('/');
check('home: hero heading visible', await page.getByRole('heading', { name: 'Hanzo Templates Gallery' }).isVisible());
{
  const h1 = page.getByRole('heading', { name: 'Hanzo Templates Gallery' });
  // Display type rendered with the component's own leading, far shorter than
  // its glyphs, and came out sliced top and bottom. Leading must reach the size.
  const lead = await h1.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { size: parseFloat(cs.fontSize), line: parseFloat(cs.lineHeight) };
  });
  check('home: hero leading reaches its type size', lead.line >= lead.size,
    `${lead.size}px type / ${lead.line}px leading`);
  const painted = await h1.evaluate((el) => getComputedStyle(el).backgroundImage);
  check('home: hero carries its gradient', painted.includes('linear-gradient'));
}
check('home: six featured cards', (await page.locator('a[href^="/templates/"]').count()) >= 6);
{
  const card = page.locator('a[href^="/templates/"]').first();
  const title = card.getByRole('heading').first();
  const before = await title.evaluate((el) => getComputedStyle(el).color);
  await card.hover();
  await page.waitForTimeout(350);
  const after = await title.evaluate((el) => getComputedStyle(el).color);
  check('home: card title responds to hovering the card', before !== after, `${before} -> ${after}`);
  const img = card.locator('img').first();
  const scaled = await img.evaluate((el) => getComputedStyle(el).transform);
  check('home: card image leans in on hover', scaled !== 'none' && scaled !== 'matrix(1, 0, 0, 1, 0, 0)', scaled);
}
{
  const footers = await page.locator('footer').count();
  check('home: exactly one footer', footers === 1, `${footers}`);
}

// ---- gallery -------------------------------------------------------------
await go('/gallery');
const cardsNow = () => page.locator('h3').count();
check('gallery: families listed', (await cardsNow()) > 0);
{
  const all = await cardsNow();
  await page.getByPlaceholder('Search templates...').fill('dashboard');
  await page.waitForTimeout(400);
  const some = await cardsNow();
  check('gallery: search narrows the list', some > 0 && some < all, `${all} -> ${some}`);
  await page.getByPlaceholder('Search templates...').fill('');
  await page.waitForTimeout(300);
}
{
  await page.getByText('Simple', { exact: true }).click();
  await page.waitForTimeout(400);
  const simple = await page.locator('text=Deploy to Hanzo').count();
  check('gallery: view toggle switches to the simple grid', simple > 0, `${simple} cards`);
  await page.getByText('Grouped', { exact: true }).click();
  await page.waitForTimeout(400);
}
{
  const before = await cardsNow();
  await page.getByRole('button', { name: 'Dashboard', exact: true }).first().click();
  await page.waitForTimeout(400);
  const after = await cardsNow();
  check('gallery: category chip filters', after > 0 && after < before, `${before} -> ${after}`);
  await page.getByRole('button', { name: 'All', exact: true }).first().click();
  await page.waitForTimeout(300);
}
{
  await page.locator('text=Deploy to Hanzo').first().click();
  await page.waitForTimeout(600);
  const open = await page.getByText('Choose Deployment Method').isVisible().catch(() => false);
  check('gallery: deploy opens the fork dialog', open);
  if (open) {
    await page.getByRole('button').filter({ hasText: 'Deploy to Hanzo Cloud' }).first().click();
    await page.waitForTimeout(300);
    const armed = await page.getByText('Ready to deploy?').isVisible().catch(() => false);
    check('dialog: choosing a method arms the footer', armed);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    const gone = !(await page.getByText('Choose Deployment Method').isVisible().catch(() => false));
    check('dialog: escape closes it', gone);
  }
}

// ---- template ------------------------------------------------------------
await go('/templates/synapse');
check('template: heading visible', await page.getByRole('heading', { name: 'Synapse' }).first().isVisible());
{
  const shotBox = async () => (await page.locator('img[alt="Synapse"]').first().boundingBox());
  const desktop = await shotBox();
  await page.getByRole('button', { name: 'Mobile' }).click();
  await page.waitForTimeout(500);
  const mobile = await shotBox();
  check('template: size switch reshapes the capture', mobile.width < desktop.width,
    `${desktop.width | 0}px -> ${mobile.width | 0}px`);
  await page.getByRole('button', { name: 'Desktop' }).click();
  await page.waitForTimeout(300);
}
check('template: quick start shows the path', await page.getByText('cd apps/synapse').isVisible());

// ---- 404 -----------------------------------------------------------------
await go('/no-such-template');
check('404: offers a template', await page.getByText('How about this instead?').isVisible());
{
  const first = await page.locator('h4').first().textContent();
  await page.getByText('Show Another Random').click();
  await page.waitForTimeout(900);
  const second = await page.locator('h4').first().textContent();
  check('404: reroll picks again', typeof second === 'string' && second.length > 0, `${first} -> ${second}`);
}

// ---- responsive ----------------------------------------------------------
for (const [name, width] of [['phone', 390], ['tablet', 834]]) {
  await page.setViewportSize({ width, height: 900 });
  await go('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`${name}: no sideways scroll at ${width}px`, overflow <= 1, `overflow ${overflow}px`);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (errors.length) {
  console.log('console errors:');
  for (const e of [...new Set(errors)].slice(0, 10)) console.log('  ' + e);
}
await browser.close();
server.close();
process.exit(fail || errors.length ? 1 : 0);
