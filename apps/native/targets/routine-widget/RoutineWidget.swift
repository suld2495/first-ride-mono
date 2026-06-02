import SwiftUI
import WidgetKit

private let groupIdentifier = "group.com.mannal.firstride"
private let snapshotKey = "snapshot"
private let widgetPadding: CGFloat = 20
private let titleHeight: CGFloat = 18
private let titleSpacing: CGFloat = 6
private let routineRowHeight: CGFloat = 18
private let minimumRoutineRowSpacing: CGFloat = 3
private let weeklyStatusHorizontalPadding: CGFloat = 24
private let weeklyStatusHeaderHeight: CGFloat = 20
private let weeklyStatusNameColumnWidth: CGFloat = 150
private let weeklyStatusRowHeight: CGFloat = 22
private let weeklyStatusRowSpacing: CGFloat = 4
private let weeklyStatusDotSize: CGFloat = 10
private let weeklyStatusMaximumVisibleItemCount = 4
private let weeklyStatusDayLabels = ["월", "화", "수", "목", "금", "토", "일"]
private let shortYearOffset = 2000
private let dailyRefreshEntryCount = 8
private let fallbackCountLabelBackgroundColor = Color(red: 0.89, green: 0.95, blue: 0.99)
private let fallbackCountLabelTextColor = Color(red: 0.08, green: 0.40, blue: 0.75)
private let fallbackRoutineAccentColors = [
  Color(red: 0.56, green: 0.69, blue: 0.94),
  Color(red: 1.00, green: 0.82, blue: 0.48),
  Color(red: 0.95, green: 0.55, blue: 0.55),
  Color(red: 0.60, green: 0.84, blue: 0.56),
  Color(red: 0.78, green: 0.65, blue: 1.00),
  Color(red: 0.49, green: 0.85, blue: 0.83),
]

struct RoutineWidgetItem: Codable, Identifiable {
  let id: Int
  let title: String
  let weeklyCount: Int
  let routineCount: Int
  let successDate: [String]?
  let isTodayDone: Bool
  let accentColor: String?
  let darkAccentColor: String?
}

struct RoutineWidgetCountLabelStyle: Codable {
  let backgroundColor: String
  let textColor: String
  let darkBackgroundColor: String?
  let darkTextColor: String?
}

struct RoutineWidgetSnapshot: Codable {
  let status: String
  let title: String
  let message: String
  let items: [RoutineWidgetItem]
  let smallItems: [RoutineWidgetItem]?
  let remainingCount: Int
  let countLabelStyle: RoutineWidgetCountLabelStyle?

  static let signedOut = RoutineWidgetSnapshot(
    status: "signedOut",
    title: "이번 주 루틴",
    message: "로그인 해주세요",
    items: [],
    smallItems: nil,
    remainingCount: 0,
    countLabelStyle: nil
  )
}

struct RoutineEntry: TimelineEntry {
  let date: Date
  let snapshot: RoutineWidgetSnapshot
}

struct RoutineProvider: TimelineProvider {
  func placeholder(in context: Context) -> RoutineEntry {
    RoutineEntry(date: Date(), snapshot: .signedOut)
  }

  func getSnapshot(in context: Context, completion: @escaping (RoutineEntry) -> Void) {
    completion(RoutineEntry(date: Date(), snapshot: readSnapshot()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<RoutineEntry>) -> Void) {
    let now = Date()
    let snapshot = readSnapshot()
    let midnightEntries = nextMidnightEntries(after: now, snapshot: snapshot)
    let entries = [RoutineEntry(date: now, snapshot: snapshot)] + midnightEntries
    let refreshDate = midnightEntries.last?.date ?? nextMidnight(after: now)

    completion(Timeline(entries: entries, policy: .after(refreshDate)))
  }

  private func readSnapshot() -> RoutineWidgetSnapshot {
    guard
      let userDefaults = UserDefaults(suiteName: groupIdentifier),
      let snapshotJson = userDefaults.string(forKey: snapshotKey),
      let snapshotData = snapshotJson.data(using: .utf8),
      let snapshot = try? JSONDecoder().decode(RoutineWidgetSnapshot.self, from: snapshotData)
    else {
      return .signedOut
    }

    return snapshot
  }

  private func nextMidnightEntries(after date: Date, snapshot: RoutineWidgetSnapshot) -> [RoutineEntry] {
    var entries: [RoutineEntry] = []
    var cursor = date

    for _ in 0..<dailyRefreshEntryCount {
      let midnight = nextMidnight(after: cursor)
      entries.append(RoutineEntry(date: midnight, snapshot: snapshot))
      cursor = midnight
    }

    return entries
  }

  private func nextMidnight(after date: Date) -> Date {
    Calendar.autoupdatingCurrent.nextDate(
      after: date,
      matching: DateComponents(hour: 0, minute: 0, second: 0),
      matchingPolicy: .nextTime
    ) ?? date.addingTimeInterval(24 * 60 * 60)
  }
}

struct RoutineWidgetEntryView: View {
  @Environment(\.widgetFamily) private var widgetFamily

  var entry: RoutineProvider.Entry

  var body: some View {
    Group {
      if widgetFamily == .systemMedium {
        RoutineWidgetWeeklyStatusView(entry: entry)
      } else {
        smallWidgetBody
      }
    }
    .routineWidgetBackground()
    .widgetURL(URL(string: "first-ride://"))
  }

  private var smallWidgetBody: some View {
    GeometryReader { geometry in
      VStack(alignment: .leading, spacing: titleSpacing) {
        Text(entry.snapshot.title)
          .font(.system(size: 15, weight: .bold))
          .foregroundStyle(Color.primary)
          .lineLimit(1)
          .frame(height: titleHeight, alignment: .center)

        if entry.snapshot.status == "signedOut" || entry.snapshot.items.isEmpty {
          Spacer(minLength: 0)
          Text(entry.snapshot.message)
            .font(.system(size: 13, weight: .medium))
            .foregroundStyle(Color.secondary)
            .frame(maxWidth: .infinity, alignment: .center)
          Spacer(minLength: 0)
        } else {
          let visibleItems = visibleItems(for: geometry.size.height)
          VStack(alignment: .leading, spacing: rowSpacing(for: geometry.size.height, itemCount: visibleItems.count)) {
            ForEach(visibleItems) { item in
              RoutineWidgetRow(item: item, currentDate: entry.date, countLabelStyle: entry.snapshot.countLabelStyle)
            }
          }
        }
      }
      .padding(widgetPadding)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
  }

  private func visibleItems(for widgetHeight: CGFloat) -> [RoutineWidgetItem] {
    let items = entry.snapshot.smallItems ?? entry.snapshot.items

    return Array(items.prefix(visibleItemLimit(for: widgetHeight)))
  }

  private func rowSpacing(for widgetHeight: CGFloat, itemCount: Int) -> CGFloat {
    guard itemCount > 1 else {
      return minimumRoutineRowSpacing
    }

    let spacingItemCount = max(itemCount, visibleItemLimit(for: widgetHeight))
    let verticalPadding = widgetPadding * 2
    let availableListHeight = widgetHeight - verticalPadding - titleHeight - titleSpacing
    let occupiedRowHeight = routineRowHeight * CGFloat(spacingItemCount)
    let availableSpacing = availableListHeight - occupiedRowHeight

    return max(minimumRoutineRowSpacing, availableSpacing / CGFloat(spacingItemCount - 1))
  }

  private func visibleItemLimit(for widgetHeight: CGFloat) -> Int {
    let verticalPadding = widgetPadding * 2
    let availableListHeight = widgetHeight - verticalPadding - titleHeight - titleSpacing
    let rowStride = routineRowHeight + minimumRoutineRowSpacing

    return max(0, Int((availableListHeight + minimumRoutineRowSpacing) / rowStride))
  }
}

struct RoutineWidgetWeeklyStatusView: View {
  let entry: RoutineProvider.Entry

  var body: some View {
    GeometryReader { geometry in
      if entry.snapshot.status == "signedOut" || entry.snapshot.items.isEmpty {
        Text(entry.snapshot.message)
          .font(.system(size: 13, weight: .medium))
          .foregroundStyle(Color.secondary)
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
      } else {
        let visibleItems = visibleItems(for: geometry.size.height)
        let contentHeight = weeklyStatusContentHeight(itemCount: visibleItems.count)
        let weekDateKeys = weekDateKeys(for: entry.date)
        let todayDateKey = routineDateKey(for: entry.date)
        VStack(alignment: .leading, spacing: weeklyStatusRowSpacing) {
          RoutineWidgetWeeklyStatusHeader(currentDateKey: todayDateKey, weekDateKeys: weekDateKeys)
          ForEach(Array(visibleItems.enumerated()), id: \.element.id) { index, item in
            RoutineWidgetWeeklyStatusRow(
              item: item,
              index: index,
              currentDateKey: todayDateKey,
              weekDateKeys: weekDateKeys
            )
          }
        }
        .padding(.horizontal, weeklyStatusHorizontalPadding)
        .padding(.top, weeklyStatusTopPadding(for: geometry.size.height, contentHeight: contentHeight))
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
      }
    }
  }

  private func visibleItems(for widgetHeight: CGFloat) -> [RoutineWidgetItem] {
    let itemLimit = min(visibleItemLimit(for: widgetHeight), weeklyStatusMaximumVisibleItemCount)

    return Array(entry.snapshot.items.prefix(itemLimit))
  }

  private func visibleItemLimit(for widgetHeight: CGFloat) -> Int {
    let rowStride = weeklyStatusRowHeight + weeklyStatusRowSpacing

    return max(0, Int((widgetHeight - weeklyStatusHeaderHeight) / rowStride))
  }

  private func weeklyStatusContentHeight(itemCount: Int) -> CGFloat {
    weeklyStatusHeaderHeight + (weeklyStatusRowHeight + weeklyStatusRowSpacing) * CGFloat(itemCount)
  }

  private func weeklyStatusTopPadding(for widgetHeight: CGFloat, contentHeight: CGFloat) -> CGFloat {
    return max(0, (widgetHeight - contentHeight) / 2)
  }
}

struct RoutineWidgetWeeklyStatusHeader: View {
  let currentDateKey: String
  let weekDateKeys: [String]

  var body: some View {
    HStack(spacing: 0) {
      Color.clear
        .frame(width: weeklyStatusNameColumnWidth, height: weeklyStatusHeaderHeight)

      ForEach(Array(weeklyStatusDayLabels.enumerated()), id: \.offset) { index, label in
        let isToday = weekDateKeys.indices.contains(index) && weekDateKeys[index] == currentDateKey
        Text(label)
          .font(.system(size: 12, weight: isToday ? .bold : .semibold))
          .foregroundStyle(isToday ? Color.primary : Color.secondary)
          .frame(maxWidth: .infinity, minHeight: weeklyStatusHeaderHeight)
          .background(
            isToday
              ? Color.secondary.opacity(0.18)
              : Color.clear
          )
          .clipShape(RoundedRectangle(cornerRadius: 7, style: .continuous))
      }
    }
  }
}

struct RoutineWidgetWeeklyStatusRow: View {
  @Environment(\.colorScheme) private var colorScheme

  let item: RoutineWidgetItem
  let index: Int
  let currentDateKey: String
  let weekDateKeys: [String]

  var body: some View {
    let accentColor = routineAccentColor(for: item, index: index)
    HStack(spacing: 0) {
      Text(item.title)
        .font(.system(size: 13, weight: .semibold))
        .foregroundStyle(Color.primary)
        .lineLimit(1)
        .frame(width: weeklyStatusNameColumnWidth, height: weeklyStatusRowHeight, alignment: .leading)

      ForEach(Array(weekDateKeys.enumerated()), id: \.offset) { _, dateKey in
        let isCompleted = item.successDate?.contains(dateKey) ?? (dateKey == currentDateKey && item.isTodayDone)
        RoutineWidgetWeeklyStatusDot(isCompleted: isCompleted, accentColor: accentColor)
          .frame(maxWidth: .infinity, minHeight: weeklyStatusRowHeight)
      }
    }
  }

  private func routineAccentColor(for item: RoutineWidgetItem, index: Int) -> Color {
    Color(
      hex: colorScheme == .dark ? item.darkAccentColor : item.accentColor,
      fallback: fallbackRoutineAccentColor(for: index)
    )
  }
}

struct RoutineWidgetWeeklyStatusDot: View {
  let isCompleted: Bool
  let accentColor: Color

  var body: some View {
    Circle()
      .fill(isCompleted ? accentColor : accentColor.opacity(0.22))
      .frame(width: weeklyStatusDotSize, height: weeklyStatusDotSize)
  }
}

struct RoutineWidgetRow: View {
  @Environment(\.colorScheme) private var colorScheme

  let item: RoutineWidgetItem
  let currentDate: Date
  let countLabelStyle: RoutineWidgetCountLabelStyle?

  private var countLabelBackgroundColor: Color {
    Color(
      hex: colorScheme == .dark
        ? countLabelStyle?.darkBackgroundColor
        : countLabelStyle?.backgroundColor,
      fallback: fallbackCountLabelBackgroundColor
    )
  }

  private var countLabelTextColor: Color {
    Color(
      hex: colorScheme == .dark
        ? countLabelStyle?.darkTextColor
        : countLabelStyle?.textColor,
      fallback: fallbackCountLabelTextColor
    )
  }

  private var titleTextColor: Color {
    isDoneToday ? Color.gray.opacity(0.55) : Color.primary
  }

  private var isDoneToday: Bool {
    guard let successDate = item.successDate else {
      return item.isTodayDone
    }

    return successDate.contains(routineDateKey(for: currentDate))
  }

  var body: some View {
    HStack(spacing: 6) {
      Text("\(item.weeklyCount)/\(item.routineCount)")
        .font(.system(size: 10, weight: .bold))
        .foregroundStyle(countLabelTextColor)
        .frame(width: 36, height: routineRowHeight)
        .background(countLabelBackgroundColor)
        .clipShape(RoundedRectangle(cornerRadius: 7, style: .continuous))

      Text(item.title)
        .font(.system(size: 12, weight: .medium))
        .foregroundStyle(titleTextColor)
        .lineLimit(1)
        .overlay(
          isDoneToday
            ? Rectangle()
                .fill(Color.secondary)
                .frame(height: 1)
            : nil
        )
    }
    .frame(height: routineRowHeight)
  }
}

private func routineDateKey(for date: Date) -> String {
  let components = Calendar.autoupdatingCurrent.dateComponents([.year, .month, .day], from: date)

  guard
    let year = components.year,
    let month = components.month,
    let day = components.day
  else {
    return ""
  }

  return String(format: "%02d%02d%d", year - shortYearOffset, month, day)
}

private func weekDateKeys(for currentDate: Date) -> [String] {
  let calendar = Calendar.autoupdatingCurrent
  let startOfDay = calendar.startOfDay(for: currentDate)
  let weekday = calendar.component(.weekday, from: startOfDay)
  let daysFromMonday = (weekday + 5) % 7
  let monday = calendar.date(byAdding: .day, value: -daysFromMonday, to: startOfDay) ?? startOfDay

  return (0..<weeklyStatusDayLabels.count).map { offset in
    let date = calendar.date(byAdding: .day, value: offset, to: monday) ?? monday
    return routineDateKey(for: date)
  }
}

private func fallbackRoutineAccentColor(for index: Int) -> Color {
  fallbackRoutineAccentColors[index % fallbackRoutineAccentColors.count]
}

extension Color {
  init(hex: String?, fallback: Color) {
    guard let hex else {
      self = fallback
      return
    }

    let normalizedHex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
    var value: UInt64 = 0

    guard normalizedHex.count == 6, Scanner(string: normalizedHex).scanHexInt64(&value) else {
      self = fallback
      return
    }

    self = Color(
      red: Double((value >> 16) & 0xFF) / 255.0,
      green: Double((value >> 8) & 0xFF) / 255.0,
      blue: Double(value & 0xFF) / 255.0
    )
  }
}

extension View {
  @ViewBuilder
  func routineWidgetBackground() -> some View {
    if #available(iOSApplicationExtension 17.0, *) {
      self.containerBackground(Color(uiColor: .systemBackground), for: .widget)
    } else {
      self.background(Color(uiColor: .systemBackground))
    }
  }
}

@main
struct RoutineWidget: Widget {
  let kind = "RoutineWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: RoutineProvider()) { entry in
      RoutineWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("이번 주 루틴")
    .description("이번 주 루틴 달성 상태를 확인합니다.")
    .supportedFamilies([.systemSmall, .systemMedium])
    .contentMarginsDisabled()
  }
}
