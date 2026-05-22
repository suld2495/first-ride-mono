import SwiftUI
import WidgetKit

private let groupIdentifier = "group.com.mannal.firstride"
private let snapshotKey = "snapshot"
private let widgetPadding: CGFloat = 20
private let titleHeight: CGFloat = 18
private let titleSpacing: CGFloat = 6
private let routineRowHeight: CGFloat = 18
private let minimumRoutineRowSpacing: CGFloat = 3
private let fallbackCountLabelBackgroundColor = Color(red: 0.89, green: 0.95, blue: 0.99)
private let fallbackCountLabelTextColor = Color(red: 0.08, green: 0.40, blue: 0.75)

struct RoutineWidgetItem: Codable, Identifiable {
  let id: Int
  let title: String
  let weeklyCount: Int
  let routineCount: Int
  let isTodayDone: Bool
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
  let remainingCount: Int
  let countLabelStyle: RoutineWidgetCountLabelStyle?

  static let signedOut = RoutineWidgetSnapshot(
    status: "signedOut",
    title: "이번 주 루틴",
    message: "로그인 해주세요",
    items: [],
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
    let entry = RoutineEntry(date: Date(), snapshot: readSnapshot())
    completion(Timeline(entries: [entry], policy: .never))
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
}

struct RoutineWidgetEntryView: View {
  var entry: RoutineProvider.Entry

  var body: some View {
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
              RoutineWidgetRow(item: item, countLabelStyle: entry.snapshot.countLabelStyle)
            }
          }
        }
      }
      .padding(widgetPadding)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
    .routineWidgetBackground()
    .widgetURL(URL(string: "first-ride://"))
  }

  private func visibleItems(for widgetHeight: CGFloat) -> [RoutineWidgetItem] {
    let verticalPadding = widgetPadding * 2
    let availableListHeight = widgetHeight - verticalPadding - titleHeight - titleSpacing
    let rowStride = routineRowHeight + minimumRoutineRowSpacing
    let visibleCount = max(0, Int((availableListHeight + minimumRoutineRowSpacing) / rowStride))

    return Array(entry.snapshot.items.prefix(visibleCount))
  }

  private func rowSpacing(for widgetHeight: CGFloat, itemCount: Int) -> CGFloat {
    guard itemCount > 1 else {
      return minimumRoutineRowSpacing
    }

    let verticalPadding = widgetPadding * 2
    let availableListHeight = widgetHeight - verticalPadding - titleHeight - titleSpacing
    let occupiedRowHeight = routineRowHeight * CGFloat(itemCount)
    let availableSpacing = availableListHeight - occupiedRowHeight

    return max(minimumRoutineRowSpacing, availableSpacing / CGFloat(itemCount - 1))
  }
}

struct RoutineWidgetRow: View {
  @Environment(\.colorScheme) private var colorScheme

  let item: RoutineWidgetItem
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
        .foregroundStyle(Color.primary)
        .lineLimit(1)
        .overlay(
          item.isTodayDone
            ? Rectangle()
                .fill(Color.secondary)
                .frame(height: 1)
            : nil
        )
    }
    .frame(height: routineRowHeight)
  }
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
    .supportedFamilies([.systemSmall])
    .contentMarginsDisabled()
  }
}
