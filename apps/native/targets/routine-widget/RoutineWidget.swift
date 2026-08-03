import Foundation
import ImageIO
import SwiftUI
import UIKit
import WidgetKit

private let groupIdentifier = "group.com.mannal.firstride"
private let snapshotKey = "snapshot"
private let characterSnapshotKey = "characterSnapshot"
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
private let largeWeeklyStatusRowSpacing: CGFloat = 8
private let largeWeeklyStatusTopPadding: CGFloat = 16
private let weeklyStatusDotSize: CGFloat = 10
private let mediumWeeklyStatusMaximumVisibleItemCount = 4
private let largeWeeklyStatusMaximumVisibleItemCount = 10
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
private let characterWidgetFallbackBackgroundColor = Color(red: 0.82, green: 0.92, blue: 0.99)
private let characterWidgetExperienceColor = Color(red: 0.04, green: 0.48, blue: 0.86)
private let characterWidgetExperienceTrackColor = Color(red: 0.59, green: 0.80, blue: 0.94)
private let characterWidgetTextColor = Color(red: 0.08, green: 0.31, blue: 0.48)
private let characterWidgetRefreshInterval: TimeInterval = 6 * 60 * 60
private let characterWidgetImageRequestTimeout: TimeInterval = 8
private let characterWidgetImageMaxPixelSize: CGFloat = 512
private let characterVerticalOffset: CGFloat = 10

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

struct CharacterWidgetLevelBadgeStyle: Codable {
  let backgroundColor: String
  let textColor: String
}

struct CharacterWidgetSnapshot: Codable {
  let status: String
  let level: Int
  let currentExp: Int
  let expForNextLevel: Int
  let characterImageUrl: String?
  let backgroundImageUrl: String?
  let levelBadgeStyle: CharacterWidgetLevelBadgeStyle?

  static let signedOut = CharacterWidgetSnapshot(
    status: "signedOut",
    level: 1,
    currentExp: 0,
    expForNextLevel: 1,
    characterImageUrl: nil,
    backgroundImageUrl: nil,
    levelBadgeStyle: nil
  )

  static let preview = CharacterWidgetSnapshot(
    status: "ready",
    level: 4,
    currentExp: 6,
    expForNextLevel: 10,
    characterImageUrl: nil,
    backgroundImageUrl: nil,
    levelBadgeStyle: CharacterWidgetLevelBadgeStyle(
      backgroundColor: "#D2EBFF",
      textColor: "#145A92"
    )
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

struct CharacterWidgetEntry: TimelineEntry {
  let date: Date
  let snapshot: CharacterWidgetSnapshot
  let characterImageData: Data?
  let backgroundImageData: Data?
}

struct CharacterWidgetProvider: TimelineProvider {
  func placeholder(in context: Context) -> CharacterWidgetEntry {
    CharacterWidgetEntry(
      date: Date(),
      snapshot: .preview,
      characterImageData: nil,
      backgroundImageData: nil
    )
  }

  func getSnapshot(in context: Context, completion: @escaping (CharacterWidgetEntry) -> Void) {
    if context.isPreview {
      completion(placeholder(in: context))
      return
    }

    Task {
      completion(await makeEntry(date: Date(), snapshot: readSnapshot()))
    }
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<CharacterWidgetEntry>) -> Void) {
    Task {
      let now = Date()
      let entry = await makeEntry(date: now, snapshot: readSnapshot())
      let refreshDate = now.addingTimeInterval(characterWidgetRefreshInterval)

      completion(Timeline(entries: [entry], policy: .after(refreshDate)))
    }
  }

  private func readSnapshot() -> CharacterWidgetSnapshot {
    guard
      let userDefaults = UserDefaults(suiteName: groupIdentifier),
      let snapshotJson = userDefaults.string(forKey: characterSnapshotKey),
      let snapshotData = snapshotJson.data(using: .utf8),
      let snapshot = try? JSONDecoder().decode(CharacterWidgetSnapshot.self, from: snapshotData)
    else {
      return .signedOut
    }

    return snapshot
  }

  private func makeEntry(date: Date, snapshot: CharacterWidgetSnapshot) async -> CharacterWidgetEntry {
    async let characterImageData = loadImageData(from: snapshot.characterImageUrl)
    async let backgroundImageData = loadImageData(from: snapshot.backgroundImageUrl)

    return await CharacterWidgetEntry(
      date: date,
      snapshot: snapshot,
      characterImageData: characterImageData,
      backgroundImageData: backgroundImageData
    )
  }

  private func loadImageData(from urlString: String?) async -> Data? {
    guard
      let urlString,
      let url = URL(string: urlString),
      let scheme = url.scheme?.lowercased(),
      scheme == "https" || scheme == "http"
    else {
      return nil
    }

    var request = URLRequest(
      url: url,
      cachePolicy: .returnCacheDataElseLoad,
      timeoutInterval: characterWidgetImageRequestTimeout
    )
    request.setValue("image/*", forHTTPHeaderField: "Accept")

    do {
      let (data, response) = try await URLSession.shared.data(for: request)

      if let httpResponse = response as? HTTPURLResponse,
         !(200..<300).contains(httpResponse.statusCode) {
        return nil
      }

      return downsampledImageData(data)
    } catch {
      return nil
    }
  }

  private func downsampledImageData(_ data: Data) -> Data? {
    guard
      let source = CGImageSourceCreateWithData(data as CFData, nil),
      let thumbnail = CGImageSourceCreateThumbnailAtIndex(
        source,
        0,
        [
          kCGImageSourceCreateThumbnailFromImageAlways: true,
          kCGImageSourceCreateThumbnailWithTransform: true,
          kCGImageSourceThumbnailMaxPixelSize: characterWidgetImageMaxPixelSize,
        ] as CFDictionary
      )
    else {
      return nil
    }

    return UIImage(cgImage: thumbnail).pngData()
  }
}

struct CharacterStatusWidgetEntryView: View {
  let entry: CharacterWidgetEntry

  var body: some View {
    ZStack {
      characterBackground

      if entry.snapshot.status == "signedOut" {
        Text("로그인 해주세요")
          .font(.system(size: 13, weight: .semibold))
          .foregroundStyle(characterWidgetTextColor)
      } else {
        characterContent
      }
    }
    .characterWidgetBackground()
    .widgetURL(URL(string: "first-ride://"))
  }

  @ViewBuilder
  private var characterBackground: some View {
    if let data = entry.backgroundImageData {
      GeometryReader { geometry in
        CharacterWidgetRemoteImage(data: data, layout: .fill)
          .frame(width: geometry.size.width, height: geometry.size.height)
          .clipped()
      }
      Color.white.opacity(0.16)
    } else {
      characterWidgetFallbackBackgroundColor
    }
  }

  private var characterContent: some View {
    GeometryReader { geometry in
      let characterSize = min(geometry.size.width, geometry.size.height) * 0.55

      ZStack {
        if let data = entry.characterImageData {
          CharacterWidgetRemoteImage(data: data, layout: .fit)
            .frame(width: characterSize, height: characterSize)
            .position(
              x: geometry.size.width / 2,
              y: geometry.size.height * 0.56 + characterVerticalOffset
            )
        }

        CharacterExperienceBubble(
          currentExp: entry.snapshot.currentExp,
          expForNextLevel: entry.snapshot.expForNextLevel
        )
        .padding(.horizontal, 10)
        .padding(.top, 8)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)

        CharacterLevelBadge(
          level: entry.snapshot.level,
          style: entry.snapshot.levelBadgeStyle
        )
        .padding(.trailing, 6)
        .padding(.bottom, 6)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
      }
    }
  }
}

enum CharacterWidgetRemoteImageLayout {
  case fill
  case fit
}

struct CharacterWidgetRemoteImage: View {
  let data: Data
  let layout: CharacterWidgetRemoteImageLayout

  @ViewBuilder
  var body: some View {
    if let image = UIImage(data: data) {
      if layout == .fill {
        Image(uiImage: image)
          .resizable()
          .interpolation(.none)
          .scaledToFill()
      } else {
        Image(uiImage: image)
          .resizable()
          .interpolation(.none)
          .scaledToFit()
      }
    } else {
      Color.clear
    }
  }
}

struct CharacterExperienceBubble: View {
  let currentExp: Int
  let expForNextLevel: Int

  var body: some View {
    VStack(spacing: 3) {
      HStack(alignment: .firstTextBaseline, spacing: 4) {
        Text("경험치")
          .font(.system(size: 9, weight: .bold))

        Text("EXP \(currentExp) / \(expForNextLevel)")
          .font(.system(size: 9, weight: .semibold))

        Spacer(minLength: 0)
      }
      .foregroundStyle(characterWidgetTextColor)

      CharacterExperienceProgressBar(
        currentExp: currentExp,
        expForNextLevel: expForNextLevel
      )
      .frame(height: 7)
    }
    .padding(.horizontal, 8)
    .padding(.top, 6)
    .padding(.bottom, 7)
    .background(Color.white.opacity(0.92))
    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    .overlay(
      RoundedRectangle(cornerRadius: 12, style: .continuous)
        .stroke(characterWidgetExperienceColor, lineWidth: 2)
    )
    .background(alignment: .bottom) {
      CharacterExperienceBubbleTail()
        .fill(Color.white.opacity(0.92))
        .frame(width: 12, height: 7)
        .overlay(
          CharacterExperienceBubbleTail()
            .stroke(characterWidgetExperienceColor, lineWidth: 2)
        )
        .offset(y: 5)
    }
    .padding(.bottom, 5)
  }
}

struct CharacterExperienceProgressBar: View {
  let currentExp: Int
  let expForNextLevel: Int

  private var progress: CGFloat {
    let maximum = max(1, expForNextLevel)
    return min(1, max(0, CGFloat(currentExp) / CGFloat(maximum)))
  }

  var body: some View {
    GeometryReader { geometry in
      ZStack(alignment: .leading) {
        Capsule()
          .fill(characterWidgetExperienceTrackColor)

        Capsule()
          .fill(characterWidgetExperienceColor)
          .frame(width: geometry.size.width * progress)
      }
    }
  }
}

struct CharacterLevelBadge: View {
  let level: Int
  let style: CharacterWidgetLevelBadgeStyle?

  var body: some View {
    Text("Lv. \(level)")
      .font(.system(size: 10, weight: .semibold))
      .foregroundStyle(
        Color(hex: style?.textColor, fallback: characterWidgetTextColor)
      )
      .padding(.horizontal, 6)
      .frame(minWidth: 40, minHeight: 20)
      .background(
        Color(
          hex: style?.backgroundColor,
          fallback: characterWidgetFallbackBackgroundColor
        )
      )
      .clipShape(Capsule())
  }
}

struct CharacterExperienceBubbleTail: Shape {
  func path(in rect: CGRect) -> Path {
    var path = Path()
    path.move(to: CGPoint(x: rect.minX, y: rect.minY))
    path.addLine(to: CGPoint(x: rect.maxX, y: rect.minY))
    path.addLine(to: CGPoint(x: rect.midX, y: rect.maxY))
    path.closeSubpath()
    return path
  }
}

struct RoutineWidgetEntryView: View {
  @Environment(\.widgetFamily) private var widgetFamily

  var entry: RoutineProvider.Entry

  var body: some View {
    Group {
      if widgetFamily == .systemMedium || widgetFamily == .systemLarge {
        RoutineWidgetWeeklyStatusView(entry: entry, widgetFamily: widgetFamily)
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
  let widgetFamily: WidgetFamily

  var body: some View {
    GeometryReader { geometry in
      if entry.snapshot.status == "signedOut" || entry.snapshot.items.isEmpty {
        Text(entry.snapshot.message)
          .font(.system(size: 13, weight: .medium))
          .foregroundStyle(Color.secondary)
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
      } else {
        let visibleItems = visibleItems(for: geometry.size.height)
        let layoutItemCount = weeklyStatusLayoutItemCount(for: geometry.size.height, itemCount: visibleItems.count)
        let contentHeight = weeklyStatusContentHeight(itemCount: layoutItemCount)
        let rowSpacing = weeklyStatusRowSpacingForCurrentFamily
        let weekDateKeys = weekDateKeys(for: entry.date)
        let todayDateKey = routineDateKey(for: entry.date)
        VStack(alignment: .leading, spacing: rowSpacing) {
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
    let itemLimit = weeklyStatusVisibleItemLimit(for: widgetHeight)

    return Array(entry.snapshot.items.prefix(itemLimit))
  }

  private func weeklyStatusVisibleItemLimit(for widgetHeight: CGFloat) -> Int {
    let rawItemLimit = rawVisibleItemLimit(for: widgetHeight)

    switch widgetFamily {
    case .systemLarge:
      return min(rawItemLimit, largeWeeklyStatusMaximumVisibleItemCount)
    default:
      return min(rawItemLimit, mediumWeeklyStatusMaximumVisibleItemCount)
    }
  }

  private func rawVisibleItemLimit(for widgetHeight: CGFloat) -> Int {
    let rowSpacing = weeklyStatusRowSpacingForCurrentFamily
    let verticalInset = widgetFamily == .systemLarge ? largeWeeklyStatusTopPadding : 0
    let rowStride = weeklyStatusRowHeight + rowSpacing

    return max(0, Int((widgetHeight - verticalInset - weeklyStatusHeaderHeight) / rowStride))
  }

  private func weeklyStatusLayoutItemCount(for widgetHeight: CGFloat, itemCount: Int) -> Int {
    switch widgetFamily {
    case .systemLarge:
      return itemCount
    default:
      return max(itemCount, weeklyStatusVisibleItemLimit(for: widgetHeight))
    }
  }

  private func weeklyStatusContentHeight(itemCount: Int) -> CGFloat {
    weeklyStatusHeaderHeight + (weeklyStatusRowHeight + weeklyStatusRowSpacingForCurrentFamily) * CGFloat(itemCount)
  }

  private func weeklyStatusTopPadding(for widgetHeight: CGFloat, contentHeight: CGFloat) -> CGFloat {
    switch widgetFamily {
    case .systemLarge:
      return largeWeeklyStatusTopPadding
    default:
      return max(0, (widgetHeight - contentHeight) / 2)
    }
  }

  private var weeklyStatusRowSpacingForCurrentFamily: CGFloat {
    widgetFamily == .systemLarge ? largeWeeklyStatusRowSpacing : weeklyStatusRowSpacing
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

  return String(format: "%02d%02d%02d", year - shortYearOffset, month, day)
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

  @ViewBuilder
  func characterWidgetBackground() -> some View {
    if #available(iOSApplicationExtension 17.0, *) {
      self.containerBackground(characterWidgetFallbackBackgroundColor, for: .widget)
    } else {
      self.background(characterWidgetFallbackBackgroundColor)
    }
  }
}

struct RoutineWidget: Widget {
  let kind = "RoutineWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: RoutineProvider()) { entry in
      RoutineWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("이번 주 루틴")
    .description("이번 주 루틴 달성 상태를 확인합니다.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    .contentMarginsDisabled()
  }
}

struct CharacterStatusWidget: Widget {
  let kind = "CharacterStatusWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: CharacterWidgetProvider()) { entry in
      CharacterStatusWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("내 캐릭터")
    .description("캐릭터, 레벨, 경험치를 한눈에 확인합니다.")
    .supportedFamilies([.systemSmall])
    .contentMarginsDisabled()
  }
}

@main
struct FirstRideWidgetBundle: WidgetBundle {
  var body: some Widget {
    RoutineWidget()
    CharacterStatusWidget()
  }
}
