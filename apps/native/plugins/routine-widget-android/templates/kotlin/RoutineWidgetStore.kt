package __PACKAGE_NAME__

import android.content.Context
import java.io.File

object RoutineWidgetStore {
  private const val PREFERENCES_NAME = "routine_widget"
  private const val ROUTINE_SNAPSHOT_KEY = "snapshot"
  private const val CHARACTER_SNAPSHOT_KEY = "characterSnapshot"
  private const val IMAGE_DIRECTORY = "routine-widgets"
  private const val CHARACTER_IMAGE_FILE = "character.png"
  private const val BACKGROUND_IMAGE_FILE = "background.png"

  fun saveRoutineSnapshot(context: Context, snapshotJson: String) {
    preferences(context)
      .edit()
      .putString(ROUTINE_SNAPSHOT_KEY, snapshotJson)
      .apply()
  }

  fun readRoutineSnapshot(context: Context): String? =
    preferences(context).getString(ROUTINE_SNAPSHOT_KEY, null)

  fun saveCharacterSnapshot(context: Context, snapshotJson: String) {
    preferences(context)
      .edit()
      .putString(CHARACTER_SNAPSHOT_KEY, snapshotJson)
      .apply()
  }

  fun readCharacterSnapshot(context: Context): String? =
    preferences(context).getString(CHARACTER_SNAPSHOT_KEY, null)

  fun characterImageFile(context: Context): File =
    File(imageDirectory(context), CHARACTER_IMAGE_FILE)

  fun backgroundImageFile(context: Context): File =
    File(imageDirectory(context), BACKGROUND_IMAGE_FILE)

  fun clear(context: Context) {
    preferences(context).edit().clear().apply()
    imageDirectory(context).deleteRecursively()
  }

  private fun preferences(context: Context) =
    context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)

  private fun imageDirectory(context: Context): File =
    File(context.filesDir, IMAGE_DIRECTORY).apply { mkdirs() }
}
