import { expect, test } from '@playwright/test';

// Story 1 (the aha moment): a craftsman completes an inspection and the entry, the green
// status and the toast appear in the owner's phone preview without switching views.
test('S1: completed inspection appears in the owner preview in three clicks', async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('e2e-cleared')) {
      localStorage.clear();
      sessionStorage.setItem('e2e-cleared', '1');
    }
  });
  await page.goto('/betrieb');

  const preview = page.frameLocator('iframe[title="Eigentümer-Ansicht auf dem Handy"]');
  await expect(preview.getByText('Das steht als Nächstes an')).toBeVisible();

  let clicks = 0;
  const click = async (locator: ReturnType<typeof page.locator>) => {
    await locator.click();
    clicks += 1;
  };

  const started = Date.now();
  await click(page.getByRole('link', { name: /Prüfung elektrischer Anlagen – Lindenstraße 12/ }));
  await click(page.getByRole('button', { name: 'Abschließen', exact: true }));

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('switch')).toBeChecked();
  await expect(dialog.getByText('Nächste Prüfung in 4 Jahren')).toBeVisible();
  await expect(dialog.getByText('· Empfehlung')).toBeVisible();

  await click(dialog.getByRole('button', { name: 'Abschließen und übertragen' }));

  await expect(preview.getByText('Elektro Stosic hat einen Eintrag hinzugefügt')).toBeVisible();
  const entry = preview.locator('[data-entry-id="s1-elektro"]');
  await expect(entry).toBeVisible();
  await expect(entry.getByRole('button', { name: /Protokoll/ })).toBeVisible();
  await expect(entry.getByRole('button', { name: /Rechnung/ })).toBeVisible();
  await expect(entry.getByRole('button', { name: /Foto/ })).toHaveCount(3);
  // The new entry is the first one in the first group of the history.
  await expect(preview.locator('[data-gewerk-group]').first()).toHaveAttribute(
    'data-gewerk-group',
    'strom',
  );
  await expect(
    preview.locator('[data-gewerk-group="strom"] [data-entry-id]').first(),
  ).toHaveAttribute('data-entry-id', 's1-elektro');
  await expect(
    preview.locator('[data-gewerk-group="strom"]').getByText('in Ordnung'),
  ).toBeVisible();

  expect(clicks).toBe(3);
  expect(Date.now() - started).toBeLessThan(60_000);

  // The Einreichung cannot be completed a second time.
  await expect(page.getByRole('button', { name: 'Abschließen', exact: true })).toHaveCount(0);
  await expect(page.getByText('Ins Scheckheft von Familie Schneider übertragen')).toBeVisible();

  // State survives a reload.
  await page.reload();
  await expect(page.getByText('Ins Scheckheft von Familie Schneider übertragen')).toBeVisible();
});
