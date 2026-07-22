import ImageIO
import UIKit
import UniformTypeIdentifiers
import UserNotifications

private let appGroupIdentifier = "group.com.mannal.firstride"
private let shareTargetsKey = "routineShareTargetsV2"
private let pendingShareKey = "pendingRoutineShare"
private let maximumSharedImageCount = 3
private let maximumSharedImageBytes = 10 * 1024 * 1024
private let maximumSharedImagePixels: Int64 = 60_000_000
private let jpegCompressionQuality = 0.85
private let allowedImageTypeIdentifiers: Set<String> = [
  "public.jpeg",
  "public.png",
  "public.heic",
  "public.heif",
  "org.webmproject.webp",
]

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
  let width: Int
  let height: Int
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
      provider.loadFileRepresentation(forTypeIdentifier: UTType.image.identifier) { [weak self] url, _ in
        defer { group.leave() }

        guard let self, let url, let image = self.createShareImage(from: url) else {
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

  private func createShareImage(from sourceURL: URL) -> RoutineShareImage? {
    guard
      let fileSize = try? sourceURL.resourceValues(forKeys: [.fileSizeKey]).fileSize,
      fileSize > 0,
      fileSize <= maximumSharedImageBytes
    else {
      return nil
    }

    let sourceOptions = [kCGImageSourceShouldCache: false] as CFDictionary

    guard
      let imageSource = CGImageSourceCreateWithURL(sourceURL as CFURL, sourceOptions),
      let imageType = CGImageSourceGetType(imageSource) as String?,
      allowedImageTypeIdentifiers.contains(imageType),
      let properties = CGImageSourceCopyPropertiesAtIndex(
        imageSource,
        0,
        sourceOptions
      ) as? [CFString: Any],
      let width = (properties[kCGImagePropertyPixelWidth] as? NSNumber)?.int64Value,
      let height = (properties[kCGImagePropertyPixelHeight] as? NSNumber)?.int64Value,
      width > 0,
      height > 0,
      width <= maximumSharedImagePixels / height
    else {
      return nil
    }

    let thumbnailOptions = [
      kCGImageSourceCreateThumbnailFromImageAlways: true,
      kCGImageSourceCreateThumbnailWithTransform: true,
      kCGImageSourceThumbnailMaxPixelSize: 4096,
      kCGImageSourceShouldCacheImmediately: true,
    ] as CFDictionary

    guard let thumbnail = CGImageSourceCreateThumbnailAtIndex(
      imageSource,
      0,
      thumbnailOptions
    ) else {
      return nil
    }

    let outputURL = sharedImageDirectory()
      .appendingPathComponent("\(UUID().uuidString).jpg")

    guard let destination = CGImageDestinationCreateWithURL(
      outputURL as CFURL,
      UTType.jpeg.identifier as CFString,
      1,
      nil
    ) else {
      return nil
    }

    let destinationOptions = [
      kCGImageDestinationLossyCompressionQuality: jpegCompressionQuality,
    ] as CFDictionary

    CGImageDestinationAddImage(destination, thumbnail, destinationOptions)

    guard CGImageDestinationFinalize(destination) else {
      try? FileManager.default.removeItem(at: outputURL)
      return nil
    }

    guard
      let outputSize = try? outputURL.resourceValues(forKeys: [.fileSizeKey]).fileSize,
      outputSize > 0,
      outputSize <= maximumSharedImageBytes
    else {
      try? FileManager.default.removeItem(at: outputURL)
      return nil
    }

    return RoutineShareImage(
      uri: outputURL.absoluteString,
      width: thumbnail.width,
      height: thumbnail.height
    )
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

enum ShareError: LocalizedError {
  case noImages

  var errorDescription: String? {
    switch self {
    case .noImages:
      return "지원하지 않거나 너무 큰 이미지입니다."
    }
  }
}
