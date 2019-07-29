import assert from 'assert';
import { convenience } from './convenience';

export const codeEditorIndependence = (my, isMobile) => async () => {
  const { page, navClick } = convenience(my, isMobile);

  // Enter full editor mode.
  await navClick('.test-toggle-editor');
  await navClick('.test-editor-files-section');
  await navClick('.test-editor-file-entry-index-html');
  await navClick('.test-enter-full-editor');

  // Editor (sidebar) should still be open at this point.
  await page.waitFor('.test-editor');

  // If we close the editor (sidebar),
  await navClick('.test-toggle-editor');
  assert.equal(await page.$('.test-editor'), null);

  // the code editor should remain open,
  await page.waitFor('.test-code-editor');

  // and in full edit mode.
  assert.equal(await page.$('.test-viewer'), null);

  // When we exit full code editor mode,
  await (await page.waitFor('.test-exit-full-editor')).click();

  // the editor (sidebar) should remain closed.
  assert.equal(await page.$('.test-editor'), null);

  // Even in mini mode,
  await navClick('.test-enter-mini-from-viewer');

  // the editor (sidebar) should remain closed
  assert.equal(await page.$('.test-editor'), null);

  // while the code editor remains open.
  await page.waitFor('.test-code-editor');

  // Return to home state (wait for navigation to avoid race condition).
  await navClick('.test-exit-full-editor');
  await navClick('.test-close-code-editor');
};
