import { chromium } from 'playwright';
import fs from 'fs';

const out = 'D:/Airport OPs/target-project/.visual-qa';
fs.mkdirSync(out, { recursive: true });

const viewports = [
  { name: '320', width: 320, height: 720 },
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1366', width: 1366, height: 768 },
  { name: '1440', width: 1440, height: 900 },
];

async function login(page) {
  const user = page.locator('#auth-username');
  if (!(await user.count())) return false;
  // wait for auth gate visible
  await page.waitForSelector('#auth-username', { state: 'visible', timeout: 15000 }).catch(() => {});
  await user.fill('admin');
  await page.locator('#auth-password').fill('admin123');
  await page.locator('#auth-submit').click();
  await page.waitForSelector('#app-main', { state: 'visible', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(800);
  return true;
}

async function goPage(page, id) {
  await page.evaluate((p) => {
    if (typeof nav === 'function') nav(p);
  }, id);
  await page.waitForTimeout(700);
}

const browser = await chromium.launch();
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto('http://localhost:5181/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/login-${vp.name}.png`, fullPage: true });

  const ok = await login(page);
  if (ok) {
    await page.screenshot({ path: `${out}/dash-${vp.name}.png` });
    await goPage(page, 'orders');
    await page.screenshot({ path: `${out}/orders-${vp.name}.png` });

    if (vp.name === '1440' || vp.name === '375') {
      await goPage(page, 'passengers');
      await page.screenshot({ path: `${out}/passengers-${vp.name}.png` });
      await goPage(page, 'orders');
      await page.locator('#main-action-btn').click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${out}/modal-order-${vp.name}.png` });
      await page.keyboard.press('Escape').catch(() => {});
      // close overlay if open
      await page.evaluate(() => {
        document.querySelectorAll('.overlay.open').forEach((el) => el.classList.remove('open'));
      });
      await page.locator('#theme-toggle').click({ force: true }).catch(() => {});
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${out}/dark-dash-${vp.name}.png` });
    }
  }
  await page.close();
  console.log('done', vp.name);
}
await browser.close();
console.log('screenshots done');
