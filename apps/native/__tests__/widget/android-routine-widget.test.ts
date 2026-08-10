import fs from 'node:fs';
import path from 'node:path';

const androidPluginPath = path.join(
  __dirname,
  '../../plugins/with-routine-share-android.js',
);
const androidWidgetPluginPath = path.join(
  __dirname,
  '../../plugins/routine-widget-android',
);
const widgetNativePath = path.join(
  __dirname,
  '../../widget/routine-widget-native.ts',
);

describe('Android routine widgets', () => {
  const readAndroidWidgetSource = (): string => {
    const sources = [fs.readFileSync(androidPluginPath, 'utf8')];

    for (const entry of fs.readdirSync(androidWidgetPluginPath, {
      recursive: true,
      withFileTypes: true,
    })) {
      if (!entry.isFile()) {
        continue;
      }

      sources.push(
        fs.readFileSync(path.join(entry.parentPath, entry.name), 'utf8'),
      );
    }

    return sources.join('\n');
  };

  it('registers separate routine and character widget providers', () => {
    const source = readAndroidWidgetSource();

    expect(source).toContain('RoutineWidgetProvider');
    expect(source).toContain('CharacterWidgetProvider');
    expect(source).toContain('android.appwidget.action.APPWIDGET_UPDATE');
    expect(source).toContain('@xml/routine_widget_info');
    expect(source).toContain('@xml/character_widget_info');
  });

  it('generates a responsive routine widget matching the iOS size families', () => {
    const source = readAndroidWidgetSource();

    expect(source).toContain('android:resizeMode="horizontal|vertical"');
    expect(source).toContain('android:targetCellWidth="2"');
    expect(source).toContain('android:targetCellHeight="2"');
    expect(source).toContain('ROUTINE_MEDIUM_WIDTH_DP = 250');
    expect(source).toContain('ROUTINE_LARGE_HEIGHT_DP = 250');
    expect(source).toContain('routine_widget_small');
    expect(source).toContain('routine_widget_weekly');
    expect(source).not.toContain('<Space');
    expect(source).toContain('MAX_MEDIUM_ROUTINES = 4');
    expect(source).toContain('MAX_LARGE_ROUTINES = 10');
  });

  it('renders routine completion dates and opens the app when tapped', () => {
    const source = readAndroidWidgetSource();

    expect(source).toContain('completedDates');
    expect(source).toContain('first-ride://');
    expect(source).toContain('setOnClickPendingIntent');
    expect(source).toContain('ACTION_DATE_CHANGED');
    expect(source).toContain('ACTION_TIMEZONE_CHANGED');
  });

  it('renders the character image, level, and experience from cached data', () => {
    const source = readAndroidWidgetSource();

    expect(source).toContain('characterImageUrl');
    expect(source).toContain('backgroundImageUrl');
    expect(source).toContain('currentExp');
    expect(source).toContain('expForNextLevel');
    expect(source).toContain('downloadWidgetImage');
    expect(source).toContain('character_widget');
  });

  it('writes both snapshots through the Android native module', () => {
    const source = fs.readFileSync(widgetNativePath, 'utf8');

    expect(source).toContain(
      'saveCharacterSnapshot: (snapshotJson: string) => Promise<void>',
    );
    expect(source).toContain('await nativeModule.saveCharacterSnapshot(');
    expect(source).toContain('JSON.stringify(snapshot)');
  });

  it('generates the native module and registers its React package', () => {
    const source = readAndroidWidgetSource();

    expect(source).toContain('class RoutineWidgetModule');
    expect(source).toContain('class RoutineWidgetPackage');
    expect(source).toContain('add(RoutineWidgetPackage())');
    expect(source).toContain('fun saveSnapshot');
    expect(source).toContain('fun saveCharacterSnapshot');
    expect(source).toContain('fun clearSnapshot');
  });

  it('serializes logout cleanup after character image writes', () => {
    const source = readAndroidWidgetSource();
    const clearSnapshotSource = source.slice(
      source.indexOf('fun clearSnapshot(promise: Promise)'),
      source.indexOf('override fun invalidate()'),
    );

    expect(clearSnapshotSource).toContain('imageExecutor.execute');
    expect(clearSnapshotSource).toContain('RoutineWidgetStore.clear');
  });
});
