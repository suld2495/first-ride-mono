import MobileCoreServices
import UIKit
import UniformTypeIdentifiers
import UserNotifications

private let appGroupIdentifier = "group.com.mannal.firstride"
private let shareTargetsKey = "routineShareTargetsV2"
private let pendingShareKey = "pendingRoutineShare"
private let maximumSharedImageCount = 3

struct RoutineShareTarget: Codable {
  let id: Int
  let title: String
  let subtitle: String
}

struct RoutineShareTargetsPayload: Codable {
  let version: Int
  let status: String
  let generatedAt: String
  let targets: [RoutineShareTarget]
}

struct RoutineShareImage: Codable {
  let uri: String
}

struct RoutineSharePayload: Codable {
  let sessionId: String
  let routineId: Int
  let createdAt: String
  let images: [RoutineShareImage]
}

final class ShareViewController: UIViewController {
  private let tableView = UITableView(frame: .zero, style: .insetGrouped)
  private let emptyLabel = UILabel()
  private var targets: [RoutineShareTarget] = []
  private var isSignedIn = false
  private var isProcessing = false

  override func viewDidLoad() {
    super.viewDidLoad()

    title = "인증할 루틴"
    view.backgroundColor = .systemBackground
    let payload = loadTargetsPayload()
    isSignedIn = payload?.status == "signedIn"
    targets = isSignedIn ? payload?.targets ?? [] : []
    configureTableView()
    configureEmptyLabel()
  }

  private func configureTableView() {
    tableView.translatesAutoresizingMaskIntoConstraints = false
    tableView.dataSource = self
    tableView.delegate = self
    tableView.register(UITableViewCell.self, forCellReuseIdentifier: "RoutineCell")
    view.addSubview(tableView)

    NSLayoutConstraint.activate([
      tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
      tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
      tableView.topAnchor.constraint(equalTo: view.topAnchor),
      tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
    ])
  }

  private func configureEmptyLabel() {
    emptyLabel.translatesAutoresizingMaskIntoConstraints = false
    if isSignedIn {
      emptyLabel.text = "인증 가능한 이번 주 루틴이 없습니다."
    } else {
      emptyLabel.text = "로그인 후 이용할 수 있습니다."
    }
    emptyLabel.textAlignment = .center
    emptyLabel.textColor = .secondaryLabel
    emptyLabel.font = .systemFont(ofSize: 15, weight: .medium)
    emptyLabel.isHidden = !targets.isEmpty
    view.addSubview(emptyLabel)

    NSLayoutConstraint.activate([
      emptyLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
      emptyLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),
      emptyLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor),
    ])
  }

  private func loadTargetsPayload() -> RoutineShareTargetsPayload? {
    guard
      let defaults = UserDefaults(suiteName: appGroupIdentifier),
      let targetsJson = defaults.string(forKey: shareTargetsKey),
      let data = targetsJson.data(using: .utf8),
      let payload = try? JSONDecoder().decode(RoutineShareTargetsPayload.self, from: data),
      payload.version == 2
    else {
      return nil
    }

    return payload
  }

  private func handleSelection(_ target: RoutineShareTarget) {
    guard !isProcessing else {
      return
    }

    isProcessing = true
    tableView.isUserInteractionEnabled = false

    loadSharedImages { [weak self] images in
      guard let self else {
        return
      }

      guard !images.isEmpty else {
        self.extensionContext?.cancelRequest(withError: ShareError.noImages)
        return
      }

      let sessionId = UUID().uuidString
      let payload = RoutineSharePayload(
        sessionId: sessionId,
        routineId: target.id,
        createdAt: ISO8601DateFormatter().string(from: Date()),
        images: images
      )

      self.savePayload(payload)
      self.openContainingApp(routineId: target.id, sessionId: sessionId)
    }
  }

  private func savePayload(_ payload: RoutineSharePayload) {
    guard
      let defaults = UserDefaults(suiteName: appGroupIdentifier),
      let data = try? JSONEncoder().encode(payload),
      let json = String(data: data, encoding: .utf8)
    else {
      return
    }

    defaults.set(json, forKey: pendingShareKey)
    defaults.synchronize()
  }

  private func loadSharedImages(completion: @escaping ([RoutineShareImage]) -> Void) {
    let providers = extensionContext?.inputItems
      .compactMap { $0 as? NSExtensionItem }
      .flatMap { $0.attachments ?? [] }
      .filter { $0.hasItemConformingToTypeIdentifier(UTType.image.identifier) }
      .prefix(maximumSharedImageCount) ?? []
    let group = DispatchGroup()
    let lock = NSLock()
    var images: [RoutineShareImage] = []

    for provider in providers {
      group.enter()
      provider.loadItem(forTypeIdentifier: UTType.image.identifier, options: nil) { [weak self] item, _ in
        defer { group.leave() }

        guard let self, let image = self.createShareImage(from: item) else {
          return
        }

        lock.lock()
        images.append(image)
        lock.unlock()
      }
    }

    group.notify(queue: .main) {
      completion(Array(images.prefix(maximumSharedImageCount)))
    }
  }

  private func createShareImage(from item: NSSecureCoding?) -> RoutineShareImage? {
    let data: Data?

    if let url = item as? URL {
      data = try? Data(contentsOf: url)
    } else if let imageData = item as? Data {
      data = imageData
    } else if let image = item as? UIImage {
      data = image.jpegData(compressionQuality: 0.92)
    } else {
      data = nil
    }

    guard let data else {
      return nil
    }

    let sessionDirectory = sharedImageDirectory()
    let fileURL = sessionDirectory.appendingPathComponent("\(UUID().uuidString).source")

    do {
      try data.write(to: fileURL, options: [.atomic])
      return RoutineShareImage(uri: fileURL.absoluteString)
    } catch {
      return nil
    }
  }

  private func sharedImageDirectory() -> URL {
    let container = FileManager.default.containerURL(
      forSecurityApplicationGroupIdentifier: appGroupIdentifier
    ) ?? FileManager.default.temporaryDirectory
    let directory = container.appendingPathComponent("routine-share", isDirectory: true)

    try? FileManager.default.createDirectory(
      at: directory,
      withIntermediateDirectories: true
    )

    return directory
  }

  private func openContainingApp(routineId: Int, sessionId: String) {
    guard let url = URL(
      string: "first-ride:///modal?type=request&routineId=\(routineId)&shareSessionId=\(sessionId)"
    ) else {
      extensionContext?.completeRequest(returningItems: nil)
      return
    }

    extensionContext?.open(url) { [weak self] opened in
      guard let self else {
        return
      }

      if opened {
        self.extensionContext?.completeRequest(returningItems: nil)
        return
      }

      self.scheduleOpenAppNotification(routineId: routineId, sessionId: sessionId)
      self.presentOpenAppFallbackAlert()
    }
  }

  private func scheduleOpenAppNotification(routineId: Int, sessionId: String) {
    let content = UNMutableNotificationContent()

    content.title = "이루라에서 계속하기"
    content.body = "앱을 열어 사진 인증 요청을 완료해주세요."
    content.userInfo = [
      "type": "request",
      "routineId": routineId,
      "shareSessionId": sessionId,
    ]

    let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
    let request = UNNotificationRequest(
      identifier: "routine-share-\(sessionId)",
      content: content,
      trigger: trigger
    )

    UNUserNotificationCenter.current().add(request)
  }

  private func presentOpenAppFallbackAlert() {
    let alert = UIAlertController(
      title: "이루라에서 계속하기",
      message: "이루라 앱을 열면 인증 요청 화면으로 이어집니다.",
      preferredStyle: .alert
    )

    alert.addAction(UIAlertAction(title: "확인", style: .default) { [weak self] _ in
      self?.extensionContext?.completeRequest(returningItems: nil)
    })

    present(alert, animated: true)
  }

}

extension ShareViewController: UITableViewDataSource {
  func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    targets.count
  }

  func tableView(
    _ tableView: UITableView,
    cellForRowAt indexPath: IndexPath
  ) -> UITableViewCell {
    let cell = tableView.dequeueReusableCell(withIdentifier: "RoutineCell", for: indexPath)
    let target = targets[indexPath.row]
    var content = cell.defaultContentConfiguration()

    content.text = target.title
    content.secondaryText = target.subtitle
    content.image = UIImage(systemName: "checkmark.seal")
    cell.contentConfiguration = content
    cell.accessoryType = .disclosureIndicator
    return cell
  }
}

extension ShareViewController: UITableViewDelegate {
  func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    tableView.deselectRow(at: indexPath, animated: true)
    handleSelection(targets[indexPath.row])
  }
}

enum ShareError: Error {
  case noImages
}
