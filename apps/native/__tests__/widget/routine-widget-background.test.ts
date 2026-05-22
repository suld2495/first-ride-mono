import fs from 'node:fs';
import path from 'node:path';

const routineWidgetSwiftPath = path.join(
  __dirname,
  '../../targets/routine-widget/RoutineWidget.swift',
);

describe('routine widget background', () => {
  it('uses the iOS system background color', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain('Color(uiColor: .systemBackground)');
  });

  it('renders the count label colors from the widget snapshot', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain(
      'RoutineWidgetRow(item: item, countLabelStyle: entry.snapshot.countLabelStyle)',
    );
    expect(source).toContain('let countLabelStyle: RoutineWidgetCountLabelStyle?');
    expect(source).toContain('countLabelStyle?.backgroundColor');
    expect(source).toContain('countLabelStyle?.textColor');
  });

  it('uses dark count label colors in system dark mode', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain('@Environment(\\.colorScheme) private var colorScheme');
    expect(source).toContain('colorScheme == .dark');
    expect(source).toContain('countLabelStyle?.darkBackgroundColor');
    expect(source).toContain('countLabelStyle?.darkTextColor');
  });

  it('uses system text colors outside the count label', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain('.foregroundStyle(Color.primary)');
    expect(source).toContain('.foregroundStyle(Color.secondary)');
    expect(source).not.toContain(
      '.foregroundStyle(Color(red: 0.13, green: 0.13, blue: 0.13))',
    );
    expect(source).not.toContain(
      '.foregroundStyle(Color(red: 0.26, green: 0.26, blue: 0.26))',
    );
  });
});
