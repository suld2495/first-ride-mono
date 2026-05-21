import SwiftUI
import WidgetKit

private let groupIdentifier = "group.com.mannal.firstride"
private let snapshotKey = "snapshot"
private let widgetPadding: CGFloat = 20
private let titleHeight: CGFloat = 18
private let titleSpacing: CGFloat = 6
private let routineRowHeight: CGFloat = 18
private let minimumRoutineRowSpacing: CGFloat = 3

struct RoutineWidgetItem: Codable, Identifiable {
  let id: Int
  let title: String
  let weeklyCount: Int
  let routineCount: Int
  let isTodayDone: Bool
}

struct RoutineWidgetSnapshot: Codable {
  let status: String
  let title: String
  let message: String
  let items: [RoutineWidgetItem]
  let remainingCount: Int

  static let signedOut = RoutineWidgetSnapshot(
    status: "signedOut",
    title: "이번 주 루틴",
    message: "로그인 해주세요",
    items: [],
    remainingCount: 0
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
          .foregroundStyle(Color(red: 0.13, green: 0.13, blue: 0.13))
          .lineLimit(1)
          .frame(height: titleHeight, alignment: .center)

        if entry.snapshot.status == "signedOut" || entry.snapshot.items.isEmpty {
          Spacer(minLength: 0)
          Text(entry.snapshot.message)
            .font(.system(size: 13, weight: .medium))
            .foregroundStyle(Color(red: 0.46, green: 0.46, blue: 0.46))
            .frame(maxWidth: .infinity, alignment: .center)
          Spacer(minLength: 0)
        } else {
          let visibleItems = visibleItems(for: geometry.size.height)
          VStack(alignment: .leading, spacing: rowSpacing(for: geometry.size.height, itemCount: visibleItems.count)) {
            ForEach(visibleItems) { item in
              RoutineWidgetRow(item: item)
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
  let item: RoutineWidgetItem

  var body: some View {
    HStack(spacing: 6) {
      Text("\(item.weeklyCount)/\(item.routineCount)")
        .font(.system(size: 10, weight: .bold))
        .foregroundStyle(Color(red: 0.08, green: 0.40, blue: 0.75))
        .frame(width: 36, height: routineRowHeight)
        .background(Color(red: 0.89, green: 0.95, blue: 0.99))
        .clipShape(RoundedRectangle(cornerRadius: 7, style: .continuous))

      Text(item.title)
        .font(.system(size: 12, weight: .medium))
        .foregroundStyle(Color(red: 0.26, green: 0.26, blue: 0.26))
        .lineLimit(1)
        .overlay(
          item.isTodayDone
            ? Rectangle()
                .fill(Color(red: 0.46, green: 0.46, blue: 0.46))
                .frame(height: 1)
            : nil
        )
    }
    .frame(height: routineRowHeight)
  }
}

extension View {
  @ViewBuilder
  func routineWidgetBackground() -> some View {
    if #available(iOSApplicationExtension 17.0, *) {
      self.containerBackground(.white, for: .widget)
    } else {
      self.background(Color.white)
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
