import fs from 'node:fs';
import path from 'node:path';

const NATIVE_ROOT = path.resolve(__dirname, '../..');
const androidPluginSource = fs.readFileSync(
  path.join(NATIVE_ROOT, 'plugins/with-routine-share-android.js'),
  'utf8',
);
const iosShareSource = fs.readFileSync(
  path.join(NATIVE_ROOT, 'targets/routine-share/ShareViewController.swift'),
  'utf8',
);

describe('routine share targets', () => {
  it('keeps the iOS routine list vertically scrollable', () => {
    expect(iosShareSource).toContain('private let tableView = UITableView');
    expect(iosShareSource).toContain(
      'tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor)',
    );
  });

  it('limits Android dynamic shortcuts to the capacity of the current device', () => {
    expect(androidPluginSource).toContain(
      'createShortcuts(targetsJson)\n          .take(shortcutManager.maxShortcutCountPerActivity)',
    );
  });
});
