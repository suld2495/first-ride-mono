import fs from 'node:fs';
import path from 'node:path';

const routineWidgetSwiftPath = path.join(
  __dirname,
  '../../targets/routine-widget/RoutineWidget.swift',
);
const routineWidgetNativePath = path.join(
  __dirname,
  '../../widget/routine-widget-native.ts',
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
  it('downsamples remote character images before WidgetKit archives the timeline', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain('import ImageIO');
    expect(source).toContain(
      'private let characterWidgetImageMaxPixelSize: CGFloat = 512',
    );
    expect(source).toContain('CGImageSourceCreateThumbnailAtIndex');
    expect(source).toContain('return UIImage(cgImage: thumbnail).pngData()');
    expect(source).toContain('return downsampledImageData(data)');
  });

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

  it('supports medium and large weekly status layouts without the title', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain(
      '.supportedFamilies([.systemSmall, .systemMedium, .systemLarge])',
    );
    expect(source).toContain(
      '@Environment(\\.widgetFamily) private var widgetFamily',
    );
    expect(source).toContain('RoutineWidgetWeeklyStatusView');
    expect(source).toContain(
      'if widgetFamily == .systemMedium || widgetFamily == .systemLarge',
    );
    expect(source).toContain(
      'RoutineWidgetWeeklyStatusView(entry: entry, widgetFamily: widgetFamily)',
    );
    expect(source).toContain('let widgetFamily: WidgetFamily');
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

    expect(
      readIntConstant(source, 'mediumWeeklyStatusMaximumVisibleItemCount'),
    ).toBe(4);
    expect(source).toContain(
      'min(rawItemLimit, mediumWeeklyStatusMaximumVisibleItemCount)',
    );
  });

  it('uses the large widget height and limits the result to ten routine rows', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');
    const largeWidgetHeight = 345;
    const headerHeight = readNumberConstant(source, 'weeklyStatusHeaderHeight');
    const rowHeight = readNumberConstant(source, 'weeklyStatusRowHeight');
    const rowSpacing = readNumberConstant(
      source,
      'largeWeeklyStatusRowSpacing',
    );
    const topPadding = readNumberConstant(
      source,
      'largeWeeklyStatusTopPadding',
    );
    const visibleItemCount = Math.floor(
      (largeWidgetHeight - topPadding - headerHeight) /
        (rowHeight + rowSpacing),
    );

    expect(visibleItemCount).toBe(10);
    expect(
      readIntConstant(source, 'largeWeeklyStatusMaximumVisibleItemCount'),
    ).toBe(10);
    expect(source).toContain(
      'min(rawItemLimit, largeWeeklyStatusMaximumVisibleItemCount)',
    );
    expect(source).toContain(
      'let verticalInset = widgetFamily == .systemLarge ? largeWeeklyStatusTopPadding : 0',
    );
  });

  it('uses more generous row spacing in the large widget', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');
    const mediumRowSpacing = readNumberConstant(
      source,
      'weeklyStatusRowSpacing',
    );
    const largeRowSpacing = readNumberConstant(
      source,
      'largeWeeklyStatusRowSpacing',
    );

    expect(largeRowSpacing).toBeGreaterThan(mediumRowSpacing);
    expect(source).toContain(
      'let rowSpacing = weeklyStatusRowSpacingForCurrentFamily',
    );
    expect(source).toContain(
      'VStack(alignment: .leading, spacing: rowSpacing)',
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

  it('anchors medium weekly status rows using the maximum visible row count', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain(
      'let layoutItemCount = weeklyStatusLayoutItemCount(for: geometry.size.height, itemCount: visibleItems.count)',
    );
    expect(source).toContain(
      'let contentHeight = weeklyStatusContentHeight(itemCount: layoutItemCount)',
    );
    expect(source).toContain(
      '.padding(.top, weeklyStatusTopPadding(for: geometry.size.height, contentHeight: contentHeight))',
    );
    expect(source).toContain(
      'private func weeklyStatusLayoutItemCount(for widgetHeight: CGFloat, itemCount: Int) -> Int',
    );
    expect(source).toContain(
      'max(itemCount, weeklyStatusVisibleItemLimit(for: widgetHeight))',
    );
    expect(source).toContain(
      'private func weeklyStatusVisibleItemLimit(for widgetHeight: CGFloat) -> Int',
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

  it('top-aligns large weekly status rows with a fixed inset', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(readNumberConstant(source, 'largeWeeklyStatusTopPadding')).toBe(16);
    expect(source).toContain(`switch widgetFamily {
    case .systemLarge:
      return largeWeeklyStatusTopPadding
    default:
      return max(0, (widgetHeight - contentHeight) / 2)
    }`);
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

  it('exposes the routine and character widgets from one widget bundle', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain('@main');
    expect(source).toContain('struct FirstRideWidgetBundle: WidgetBundle');
    expect(source).toContain('RoutineWidget()');
    expect(source).toContain('CharacterStatusWidget()');
    expect(source).toContain('let kind = "CharacterStatusWidget"');
    expect(source).toContain('.supportedFamilies([.systemSmall])');
  });

  it('orders the widget gallery with the character first and routine sizes from small to large', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain(`struct FirstRideWidgetBundle: WidgetBundle {
  var body: some Widget {
    CharacterStatusWidget()
    RoutineWidget()
  }
}`);
    expect(source).toContain(
      '.supportedFamilies([.systemSmall, .systemMedium, .systemLarge])',
    );
  });

  it('renders the character URL over the background URL in the character widget', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain('struct CharacterWidgetSnapshot: Codable');
    expect(source).toContain('let characterImageUrl: String?');
    expect(source).toContain('let backgroundImageUrl: String?');
    expect(source).toContain('struct CharacterStatusWidgetEntryView: View');
    expect(source).toContain('CharacterWidgetRemoteImage');
    expect(source).toContain('.interpolation(.none)');
    expect(source).toContain('.scaledToFill()');
    expect(source).toContain('.scaledToFit()');
  });

  it('lays out the experience bubble, lower-centered character, and friend-style level pill', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');

    expect(source).toContain('CharacterExperienceBubble');
    expect(source).toContain('CharacterExperienceProgressBar');
    expect(source).toContain('CharacterLevelBadge');
    expect(source).toContain('.frame(minWidth: 40, minHeight: 20)');
    expect(source).toContain('.clipShape(Capsule())');
    expect(source).toContain('.padding(.trailing, 6)');
    expect(source).toContain('.padding(.bottom, 6)');
    expect(source).toContain('characterVerticalOffset');
  });

  it('places the speech bubble tail behind the bubble body', () => {
    const source = fs.readFileSync(routineWidgetSwiftPath, 'utf8');
    const bubbleSource = source.slice(
      source.indexOf('struct CharacterExperienceBubble: View'),
      source.indexOf('struct CharacterExperienceProgressBar: View'),
    );

    expect(bubbleSource).toContain('.background(alignment: .bottom)');
    expect(bubbleSource).not.toContain('.overlay(alignment: .bottom)');
  });

  it('stores and reloads the character widget independently', () => {
    const source = fs.readFileSync(routineWidgetNativePath, 'utf8');

    expect(source).toContain(
      "const CHARACTER_SNAPSHOT_KEY = 'characterSnapshot'",
    );
    expect(source).toContain(
      "const IOS_CHARACTER_WIDGET_KIND = 'CharacterStatusWidget'",
    );
    expect(source).toContain('saveCharacterWidgetSnapshot');
    expect(source).toContain(
      'ExtensionStorage.reloadWidget(IOS_CHARACTER_WIDGET_KIND)',
    );
  });
});
