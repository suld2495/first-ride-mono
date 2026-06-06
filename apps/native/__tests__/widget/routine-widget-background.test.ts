import fs from 'node:fs';
import path from 'node:path';

const routineWidgetSwiftPath = path.join(
  __dirname,
  '../../targets/routine-widget/RoutineWidget.swift',
);

const readNumberConstant = (source: string, name: string) => {
  const match = source.match(
    new RegExp(`private let ${name}: CGFloat = (\\d+)`),
  );

  if (!match) {
    throw new Error(`Missing ${name}`);
  }

  return Number(match[1]);
};

const readIntConstant = (source: string, name: string) => {
  const match = source.match(new RegExp(`private let ${name} = (\\d+)`));

  if (!match) {
    throw new Error(`Missing ${name}`);
  }

  return Number(match[1]);
};

describe('routine widget background', () => {
  it('uses the iOS system background color', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain('Color(uiColor: .systemBackground)');
  });

  it('renders the count label colors from the widget snapshot', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain(
      'RoutineWidgetRow(item: item, currentDate: entry.date, countLabelStyle: entry.snapshot.countLabelStyle)',
    );
    expect(source).toContain(
      'let countLabelStyle: RoutineWidgetCountLabelStyle?',
    );
    expect(source).toContain('countLabelStyle?.backgroundColor');
    expect(source).toContain('countLabelStyle?.textColor');
  });

  it('uses dark count label colors in system dark mode', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain(
      '@Environment(\\.colorScheme) private var colorScheme',
    );
    expect(source).toContain('colorScheme == .dark');
    expect(source).toContain('countLabelStyle?.darkBackgroundColor');
    expect(source).toContain('countLabelStyle?.darkTextColor');
  });

  it('supports a medium weekly status layout without the title', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain(
      '.supportedFamilies([.systemSmall, .systemMedium])',
    );
    expect(source).toContain(
      '@Environment(\\.widgetFamily) private var widgetFamily',
    );
    expect(source).toContain('RoutineWidgetWeeklyStatusView');
    expect(source).toContain('if widgetFamily == .systemMedium');
  });

  it('renders weekly status columns from Monday through Sunday', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain(
      'private let weeklyStatusDayLabels = ["월", "화", "수", "목", "금", "토", "일"]',
    );
    expect(source).toContain('weekDateKeys(for: entry.date)');
    expect(source).toContain('let daysFromMonday = (weekday + 5) % 7');
    expect(source).toContain(
      'let monday = calendar.date(byAdding: .day, value: -daysFromMonday, to: startOfDay) ?? startOfDay',
    );
    expect(source).toContain(
      'item.successDate?.contains(dateKey) ?? (dateKey == currentDateKey && item.isTodayDone)',
    );
    expect(source).toContain('RoutineWidgetWeeklyStatusDot');
  });

  it('formats widget date keys as the API 6 digit YYMMDD value', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain(
      'return String(format: "%02d%02d%02d", year - shortYearOffset, month, day)',
    );
  });

  it('fits four routine rows in the medium widget height', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');
    const mediumWidgetHeight = 155;
    const headerHeight = readNumberConstant(source, 'weeklyStatusHeaderHeight');
    const rowHeight = readNumberConstant(source, 'weeklyStatusRowHeight');
    const rowSpacing = readNumberConstant(source, 'weeklyStatusRowSpacing');
    const contentHeight = headerHeight + (rowHeight + rowSpacing) * 4;

    expect(contentHeight).toBeLessThanOrEqual(mediumWidgetHeight);
  });

  it('limits medium weekly status to four routine rows', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(readIntConstant(source, 'weeklyStatusMaximumVisibleItemCount')).toBe(
      4,
    );
    expect(source).toContain(
      'min(visibleItemLimit(for: widgetHeight), weeklyStatusMaximumVisibleItemCount)',
    );
  });

  it('keeps medium weekly status rows compact enough for four routines', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain(
      'private let weeklyStatusHeaderHeight: CGFloat = 20',
    );
    expect(source).toContain('private let weeklyStatusRowHeight: CGFloat = 22');
    expect(source).toContain('private let weeklyStatusRowSpacing: CGFloat = 4');
    expect(source).toContain('private let weeklyStatusDotSize: CGFloat = 10');
  });

  it('adds half of the remaining medium widget height above the content', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain(
      'let contentHeight = weeklyStatusContentHeight(itemCount: visibleItems.count)',
    );
    expect(source).toContain(
      '.padding(.top, weeklyStatusTopPadding(for: geometry.size.height, contentHeight: contentHeight))',
    );
    expect(source).toContain(
      'private func weeklyStatusContentHeight(itemCount: Int) -> CGFloat',
    );
    expect(source).toContain(
      'private func weeklyStatusTopPadding(for widgetHeight: CGFloat, contentHeight: CGFloat) -> CGFloat',
    );
    expect(source).toContain(
      'return max(0, (widgetHeight - contentHeight) / 2)',
    );
    expect(source).toContain(
      '.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)',
    );
  });

  it('uses per-routine accent colors for weekly status dots', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain('let accentColor: String?');
    expect(source).toContain('let darkAccentColor: String?');
    expect(source).toContain('routineAccentColor(for: item, index: index)');
    expect(source).toContain('item.darkAccentColor');
    expect(source).toContain('item.accentColor');
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
