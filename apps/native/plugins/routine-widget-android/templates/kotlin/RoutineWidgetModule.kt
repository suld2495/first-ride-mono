package __PACKAGE_NAME__

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import org.json.JSONObject

class RoutineWidgetModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  private val imageExecutor: ExecutorService = Executors.newSingleThreadExecutor()

  override fun getName(): String = "RoutineWidget"

  @ReactMethod
  fun saveSnapshot(snapshotJson: String, promise: Promise) {
    try {
      JSONObject(snapshotJson)
      RoutineWidgetStore.saveRoutineSnapshot(reactContext, snapshotJson)
      RoutineWidgetProvider.updateAll(reactContext)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("ROUTINE_WIDGET_SAVE_FAILED", error)
    }
  }

  @ReactMethod
  fun saveCharacterSnapshot(snapshotJson: String, promise: Promise) {
    val snapshot = try {
      JSONObject(snapshotJson)
    } catch (error: Exception) {
      promise.reject("CHARACTER_WIDGET_INVALID_SNAPSHOT", error)
      return
    }

    imageExecutor.execute {
      try {
        RoutineWidgetStore.saveCharacterSnapshot(reactContext, snapshotJson)
        CharacterWidgetProvider.updateAll(reactContext)
        updateCachedImage(
          snapshot.optString("characterImageUrl").takeIf { it.isNotBlank() },
          RoutineWidgetStore.characterImageFile(reactContext),
        )
        updateCachedImage(
          snapshot.optString("backgroundImageUrl").takeIf { it.isNotBlank() },
          RoutineWidgetStore.backgroundImageFile(reactContext),
        )
        CharacterWidgetProvider.updateAll(reactContext)
        promise.resolve(null)
      } catch (error: Exception) {
        promise.reject("CHARACTER_WIDGET_SAVE_FAILED", error)
      }
    }
  }

  @ReactMethod
  fun clearSnapshot(promise: Promise) {
    imageExecutor.execute {
      try {
        RoutineWidgetStore.clear(reactContext)
        RoutineWidgetProvider.updateAll(reactContext)
        CharacterWidgetProvider.updateAll(reactContext)
        promise.resolve(null)
      } catch (error: Exception) {
        promise.reject("ROUTINE_WIDGET_CLEAR_FAILED", error)
      }
    }
  }

  override fun invalidate() {
    imageExecutor.shutdown()
    super.invalidate()
  }

  private fun updateCachedImage(url: String?, destination: File) {
    if (url == null) {
      destination.delete()
      return
    }

    val downloaded = downloadWidgetImage(url)

    if (downloaded == null) {
      destination.delete()
      Log.w(TAG, "Widget image download failed")
      return
    }

    val temporaryFile = File(destination.parentFile, "${destination.name}.tmp")
    val saved = try {
      FileOutputStream(temporaryFile).use { output ->
        downloaded.compress(Bitmap.CompressFormat.PNG, PNG_QUALITY, output)
      }
    } finally {
      downloaded.recycle()
    }

    if (!saved) {
      temporaryFile.delete()
      throw IllegalStateException("Could not persist widget image")
    }

    destination.delete()

    if (!temporaryFile.renameTo(destination)) {
      temporaryFile.delete()
      throw IllegalStateException("Could not persist widget image")
    }
  }

  private fun downloadWidgetImage(value: String): Bitmap? {
    val url = URL(value)

    if (url.protocol != "https" && url.protocol != "http") {
      return null
    }

    val connection = (url.openConnection() as HttpURLConnection).apply {
      connectTimeout = IMAGE_REQUEST_TIMEOUT_MS
      readTimeout = IMAGE_REQUEST_TIMEOUT_MS
      instanceFollowRedirects = true
    }

    return try {
      connection.connect()

      if (connection.responseCode !in 200..299) {
        return null
      }

      val contentLength = connection.contentLengthLong

      if (contentLength > MAX_IMAGE_BYTES) {
        return null
      }

      val bytes = connection.inputStream.use { input ->
        val output = ByteArrayOutputStream()
        val buffer = ByteArray(STREAM_BUFFER_SIZE)
        var totalBytes = 0

        while (true) {
          val readCount = input.read(buffer)

          if (readCount < 0) {
            break
          }

          totalBytes += readCount

          if (totalBytes > MAX_IMAGE_BYTES) {
            return null
          }

          output.write(buffer, 0, readCount)
        }

        output.toByteArray()
      }
      decodeScaledBitmap(bytes)
    } finally {
      connection.disconnect()
    }
  }

  private fun decodeScaledBitmap(bytes: ByteArray): Bitmap? {
    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    BitmapFactory.decodeByteArray(bytes, 0, bytes.size, bounds)

    if (bounds.outWidth <= 0 || bounds.outHeight <= 0) {
      return null
    }

    var sampleSize = 1

    while (
      bounds.outWidth / sampleSize > MAX_IMAGE_DIMENSION ||
      bounds.outHeight / sampleSize > MAX_IMAGE_DIMENSION
    ) {
      sampleSize *= 2
    }

    val options = BitmapFactory.Options().apply { inSampleSize = sampleSize }
    val decoded = BitmapFactory.decodeByteArray(bytes, 0, bytes.size, options)
      ?: return null
    val scale = minOf(
      1f,
      MAX_IMAGE_DIMENSION.toFloat() / maxOf(decoded.width, decoded.height),
    )

    if (scale >= 1f) {
      return decoded
    }

    val scaled = Bitmap.createScaledBitmap(
      decoded,
      maxOf(1, (decoded.width * scale).toInt()),
      maxOf(1, (decoded.height * scale).toInt()),
      false,
    )
    decoded.recycle()
    return scaled
  }

  companion object {
    private const val TAG = "RoutineWidget"
    private const val IMAGE_REQUEST_TIMEOUT_MS = 8_000
    private const val MAX_IMAGE_BYTES = 10 * 1024 * 1024
    private const val MAX_IMAGE_DIMENSION = 512
    private const val STREAM_BUFFER_SIZE = 32 * 1024
    private const val PNG_QUALITY = 100
  }
}
