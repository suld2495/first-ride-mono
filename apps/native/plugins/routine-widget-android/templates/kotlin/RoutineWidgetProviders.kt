package __PACKAGE_NAME__

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.res.ColorStateList
import android.content.res.Configuration
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.SpannableString
import android.text.Spanned
import android.text.style.StrikethroughSpan
import android.text.style.StyleSpan
import android.graphics.Typeface
import android.view.View
import android.widget.RemoteViews
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import org.json.JSONArray
import org.json.JSONObject

class RoutineWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetIds: IntArray,
  ) {
    appWidgetIds.forEach { appWidgetId ->
      render(context, appWidgetManager, appWidgetId)
    }
  }

  override fun onAppWidgetOptionsChanged(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetId: Int,
    newOptions: Bundle,
  ) {
    render(context, appWidgetManager, appWidgetId)
  }

  override fun onReceive(context: Context, intent: Intent) {
    super.onReceive(context, intent)

    if (
      intent.action == Intent.ACTION_DATE_CHANGED ||
      intent.action == Intent.ACTION_TIMEZONE_CHANGED
    ) {
      updateAll(context)
    }
  }

  private fun render(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetId: Int,
  ) {
    val options = appWidgetManager.getAppWidgetOptions(appWidgetId)
    val width = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH)
    val height = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT)
    val snapshot = RoutineWidgetRenderer.readSnapshot(context)
    val views = if (width >= ROUTINE_MEDIUM_WIDTH_DP) {
      RoutineWidgetRenderer.createWeeklyViews(
        context,
        snapshot,
        height >= ROUTINE_LARGE_HEIGHT_DP,
      )
    } else {
      RoutineWidgetRenderer.createSmallViews(context, snapshot, height)
    }

    appWidgetManager.updateAppWidget(appWidgetId, views)
  }

  companion object {
    const val ROUTINE_MEDIUM_WIDTH_DP = 250
    const val ROUTINE_LARGE_HEIGHT_DP = 250

    fun updateAll(context: Context) {
      val manager = AppWidgetManager.getInstance(context)
      val component = ComponentName(context, RoutineWidgetProvider::class.java)
      val ids = manager.getAppWidgetIds(component)

      ids.forEach { appWidgetId ->
        val provider = RoutineWidgetProvider()
        provider.render(context, manager, appWidgetId)
      }
    }
  }
}

class CharacterWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetIds: IntArray,
  ) {
    appWidgetIds.forEach { appWidgetId ->
      appWidgetManager.updateAppWidget(
        appWidgetId,
        RoutineWidgetRenderer.createCharacterViews(context),
      )
    }
  }

  companion object {
    fun updateAll(context: Context) {
      val manager = AppWidgetManager.getInstance(context)
      val component = ComponentName(context, CharacterWidgetProvider::class.java)
      val ids = manager.getAppWidgetIds(component)

      ids.forEach { appWidgetId ->
        manager.updateAppWidget(
          appWidgetId,
          RoutineWidgetRenderer.createCharacterViews(context),
        )
      }
    }
  }
}

private object RoutineWidgetRenderer {
  const val MAX_MEDIUM_ROUTINES = 4
  const val MAX_LARGE_ROUTINES = 10
  private const val SMALL_WIDGET_RESERVED_HEIGHT_DP = 68
  private const val SMALL_ROW_HEIGHT_DP = 21
  private const val FALLBACK_ACCENT_COLOR = "#8FAFEF"
  private const val FALLBACK_COUNT_BACKGROUND = "#E3F2FD"
  private const val FALLBACK_COUNT_TEXT = "#1565C0"
  private const val FALLBACK_DARK_COUNT_BACKGROUND = "#1565C0"
  private const val FALLBACK_DARK_COUNT_TEXT = "#BBDEFB"
  private val dayLabels = listOf("월", "화", "수", "목", "금", "토", "일")
  private val weeklyDayIds = listOf(
    R.id.weekly_day_monday,
    R.id.weekly_day_tuesday,
    R.id.weekly_day_wednesday,
    R.id.weekly_day_thursday,
    R.id.weekly_day_friday,
    R.id.weekly_day_saturday,
    R.id.weekly_day_sunday,
  )
  private val weeklyDotIds = listOf(
    R.id.weekly_dot_monday,
    R.id.weekly_dot_tuesday,
    R.id.weekly_dot_wednesday,
    R.id.weekly_dot_thursday,
    R.id.weekly_dot_friday,
    R.id.weekly_dot_saturday,
    R.id.weekly_dot_sunday,
  )

  fun readSnapshot(context: Context): JSONObject =
    RoutineWidgetStore.readRoutineSnapshot(context)
      ?.let { snapshot -> runCatching { JSONObject(snapshot) }.getOrNull() }
      ?: signedOutRoutineSnapshot()

  fun createSmallViews(
    context: Context,
    snapshot: JSONObject,
    heightDp: Int,
  ): RemoteViews {
    val views = RemoteViews(context.packageName, R.layout.routine_widget_small)
    val items = snapshot.optJSONArray("smallItems")
      ?: snapshot.optJSONArray("items")
      ?: JSONArray()
    val status = snapshot.optString("status")
    val isEmpty = items.length() == 0

    views.setTextViewText(
      R.id.routine_widget_title,
      snapshot.optString("title", "이번 주 루틴"),
    )
    views.removeAllViews(R.id.routine_widget_items)
    views.setViewVisibility(
      R.id.routine_widget_message,
      if (status == "signedOut" || isEmpty) View.VISIBLE else View.GONE,
    )
    views.setTextViewText(
      R.id.routine_widget_message,
      snapshot.optString("message", "로그인 해주세요"),
    )

    if (status != "signedOut" && !isEmpty) {
      val visibleCount = minOf(
        items.length(),
        maxOf(1, (heightDp - SMALL_WIDGET_RESERVED_HEIGHT_DP) / SMALL_ROW_HEIGHT_DP),
      )
      val isDark = isDarkMode(context)
      val countStyle = snapshot.optJSONObject("countLabelStyle")
      val countBackground = parseColor(
        if (isDark) countStyle?.optString("darkBackgroundColor") else countStyle?.optString("backgroundColor"),
        if (isDark) FALLBACK_DARK_COUNT_BACKGROUND else FALLBACK_COUNT_BACKGROUND,
      )
      val countText = parseColor(
        if (isDark) countStyle?.optString("darkTextColor") else countStyle?.optString("textColor"),
        if (isDark) FALLBACK_DARK_COUNT_TEXT else FALLBACK_COUNT_TEXT,
      )
      val todayKey = dateKey(Date())

      for (index in 0 until visibleCount) {
        val item = items.getJSONObject(index)
        val row = RemoteViews(context.packageName, R.layout.routine_widget_small_row)
        val isTodayDone = containsDate(item.optJSONArray("completedDates"), todayKey)
          || item.optBoolean("isTodayDone")
        val title = SpannableString(item.optString("title"))

        if (isTodayDone) {
          title.setSpan(
            StrikethroughSpan(),
            0,
            title.length,
            Spanned.SPAN_EXCLUSIVE_EXCLUSIVE,
          )
        }

        row.setTextViewText(
          R.id.routine_count_text,
          "${item.optInt("weeklyCount")}/${item.optInt("routineCount")}",
        )
        row.setTextColor(R.id.routine_count_text, countText)
        row.setImageViewBitmap(
          R.id.routine_count_background,
          roundedRectangleBitmap(context, 36, 18, 7, countBackground),
        )
        row.setTextViewText(R.id.routine_title, title)
        row.setTextColor(
          R.id.routine_title,
          resolveSystemTextColor(context, isTodayDone),
        )
        views.addView(R.id.routine_widget_items, row)
      }
    }

    views.setOnClickPendingIntent(R.id.routine_widget_root, openAppIntent(context, 1))
    return views
  }

  fun createWeeklyViews(
    context: Context,
    snapshot: JSONObject,
    isLarge: Boolean,
  ): RemoteViews {
    val views = RemoteViews(context.packageName, R.layout.routine_widget_weekly)
    val items = snapshot.optJSONArray("items") ?: JSONArray()
    val status = snapshot.optString("status")
    val isEmpty = items.length() == 0

    views.removeAllViews(R.id.weekly_content)
    views.setViewVisibility(
      R.id.weekly_message,
      if (status == "signedOut" || isEmpty) View.VISIBLE else View.GONE,
    )
    views.setTextViewText(
      R.id.weekly_message,
      snapshot.optString("message", "로그인 해주세요"),
    )

    if (status != "signedOut" && !isEmpty) {
      val weekKeys = weekDateKeys()
      val todayKey = dateKey(Date())
      val header = RemoteViews(context.packageName, R.layout.routine_widget_weekly_header)

      dayLabels.forEachIndexed { index, label ->
        val text = SpannableString(label)

        if (weekKeys[index] == todayKey) {
          text.setSpan(
            StyleSpan(Typeface.BOLD),
            0,
            text.length,
            Spanned.SPAN_EXCLUSIVE_EXCLUSIVE,
          )
        }
        header.setTextViewText(weeklyDayIds[index], text)
      }
      views.addView(R.id.weekly_content, header)

      val itemLimit = if (isLarge) MAX_LARGE_ROUTINES else MAX_MEDIUM_ROUTINES

      for (index in 0 until minOf(items.length(), itemLimit)) {
        val item = items.getJSONObject(index)
        val row = RemoteViews(context.packageName, R.layout.routine_widget_weekly_row)
        val accentColor = parseColor(
          if (isDarkMode(context)) item.optString("darkAccentColor") else item.optString("accentColor"),
          FALLBACK_ACCENT_COLOR,
        )
        val completedDates = item.optJSONArray("completedDates")

        row.setTextViewText(R.id.weekly_routine_title, item.optString("title"))
        weeklyDotIds.forEachIndexed { dayIndex, viewId ->
          val completed = containsDate(completedDates, weekKeys[dayIndex]) ||
            (weekKeys[dayIndex] == todayKey && item.optBoolean("isTodayDone"))
          row.setImageViewBitmap(
            viewId,
            circleBitmap(
              context,
              if (completed) accentColor else withAlpha(accentColor, 0.22f),
            ),
          )
        }
        views.addView(R.id.weekly_content, row)
      }
    }

    views.setOnClickPendingIntent(R.id.routine_weekly_root, openAppIntent(context, 2))
    return views
  }

  fun createCharacterViews(context: Context): RemoteViews {
    val views = RemoteViews(context.packageName, R.layout.character_widget)
    val snapshot = RoutineWidgetStore.readCharacterSnapshot(context)
      ?.let { value -> runCatching { JSONObject(value) }.getOrNull() }
    val isReady = snapshot?.optString("status") == "ready"

    views.setViewVisibility(
      R.id.character_widget_message,
      if (isReady) View.GONE else View.VISIBLE,
    )
    views.setViewVisibility(
      R.id.character_widget_content,
      if (isReady) View.VISIBLE else View.GONE,
    )

    if (isReady) {
      setCachedImage(
        views,
        R.id.character_widget_background,
        RoutineWidgetStore.backgroundImageFile(context),
      )
      setCachedImage(
        views,
        R.id.character_widget_character,
        RoutineWidgetStore.characterImageFile(context),
      )
      val currentExp = snapshot.optInt("currentExp").coerceAtLeast(0)
      val expForNextLevel = snapshot.optInt("expForNextLevel", 1).coerceAtLeast(1)
      val experienceStyle = snapshot.optJSONObject("experienceStyle")
      val levelStyle = snapshot.optJSONObject("levelBadgeStyle")
      val primaryColor = parseColor(
        experienceStyle?.optString("primaryColor"),
        "#107AD6",
      )
      val trackColor = parseColor(
        experienceStyle?.optString("trackColor"),
        "#A3D4FF",
      )

      views.setTextViewText(
        R.id.character_widget_experience,
        "EXP $currentExp / $expForNextLevel",
      )
      views.setTextColor(
        R.id.character_widget_experience,
        parseColor(experienceStyle?.optString("textColor"), "#2C5171"),
      )
      views.setProgressBar(
        R.id.character_widget_progress,
        expForNextLevel,
        minOf(currentExp, expForNextLevel),
        false,
      )
      views.setTextViewText(
        R.id.character_widget_level,
        "Lv. ${snapshot.optInt("level", 1).coerceAtLeast(1)}",
      )
      views.setTextColor(
        R.id.character_widget_level,
        parseColor(levelStyle?.optString("textColor"), "#145A92"),
      )

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        views.setColorStateList(
          R.id.character_widget_progress,
          "setProgressTintList",
          ColorStateList.valueOf(primaryColor),
        )
        views.setColorStateList(
          R.id.character_widget_progress,
          "setProgressBackgroundTintList",
          ColorStateList.valueOf(trackColor),
        )
        views.setColorStateList(
          R.id.character_widget_level,
          "setBackgroundTintList",
          ColorStateList.valueOf(
            parseColor(levelStyle?.optString("backgroundColor"), "#D2EBFF"),
          ),
        )
      }
    }

    views.setOnClickPendingIntent(R.id.character_widget_root, openAppIntent(context, 3))
    return views
  }

  private fun signedOutRoutineSnapshot(): JSONObject = JSONObject()
    .put("status", "signedOut")
    .put("title", "이번 주 루틴")
    .put("message", "로그인 해주세요")
    .put("items", JSONArray())

  private fun setCachedImage(views: RemoteViews, viewId: Int, file: java.io.File) {
    val bitmap = if (file.exists()) BitmapFactory.decodeFile(file.absolutePath) else null

    if (bitmap == null) {
      views.setViewVisibility(viewId, View.GONE)
    } else {
      views.setImageViewBitmap(viewId, bitmap)
      views.setViewVisibility(viewId, View.VISIBLE)
    }
  }

  private fun openAppIntent(context: Context, requestCode: Int): PendingIntent {
    val intent = Intent(context, MainActivity::class.java)
      .setAction(Intent.ACTION_VIEW)
      .setData(Uri.parse("first-ride://"))
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)

    return PendingIntent.getActivity(
      context,
      requestCode,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }

  private fun containsDate(values: JSONArray?, date: String): Boolean {
    if (values == null) {
      return false
    }

    for (index in 0 until values.length()) {
      if (values.optString(index) == date) {
        return true
      }
    }

    return false
  }

  private fun weekDateKeys(): List<String> {
    val calendar = Calendar.getInstance().apply {
      firstDayOfWeek = Calendar.MONDAY
      set(Calendar.HOUR_OF_DAY, 0)
      set(Calendar.MINUTE, 0)
      set(Calendar.SECOND, 0)
      set(Calendar.MILLISECOND, 0)
      val daysSinceMonday = (get(Calendar.DAY_OF_WEEK) + 5) % 7
      add(Calendar.DAY_OF_MONTH, -daysSinceMonday)
    }

    return List(dayLabels.size) { offset ->
      (calendar.clone() as Calendar).apply {
        add(Calendar.DAY_OF_MONTH, offset)
      }.time.let(::dateKey)
    }
  }

  private fun dateKey(date: Date): String =
    SimpleDateFormat("yyyy-MM-dd", Locale.US).format(date)

  private fun parseColor(value: String?, fallback: String): Int = try {
    Color.parseColor(value?.takeIf { it.isNotBlank() } ?: fallback)
  } catch (_: IllegalArgumentException) {
    Color.parseColor(fallback)
  }

  private fun isDarkMode(context: Context): Boolean =
    context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK ==
      Configuration.UI_MODE_NIGHT_YES

  private fun resolveSystemTextColor(context: Context, disabled: Boolean): Int {
    val attribute = if (disabled) android.R.attr.textColorSecondary else android.R.attr.textColorPrimary
    val values = context.obtainStyledAttributes(intArrayOf(attribute))

    return try {
      values.getColor(0, if (disabled) Color.GRAY else Color.BLACK)
    } finally {
      values.recycle()
    }
  }

  private fun withAlpha(color: Int, alpha: Float): Int =
    Color.argb(
      (255 * alpha).toInt(),
      Color.red(color),
      Color.green(color),
      Color.blue(color),
    )

  private fun circleBitmap(context: Context, color: Int): Bitmap {
    val size = dp(context, 10)
    val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
    Canvas(bitmap).drawCircle(
      size / 2f,
      size / 2f,
      size / 2f,
      Paint(Paint.ANTI_ALIAS_FLAG).apply { this.color = color },
    )
    return bitmap
  }

  private fun roundedRectangleBitmap(
    context: Context,
    widthDp: Int,
    heightDp: Int,
    radiusDp: Int,
    color: Int,
  ): Bitmap {
    val width = dp(context, widthDp)
    val height = dp(context, heightDp)
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    val radius = dp(context, radiusDp).toFloat()
    Canvas(bitmap).drawRoundRect(
      0f,
      0f,
      width.toFloat(),
      height.toFloat(),
      radius,
      radius,
      Paint(Paint.ANTI_ALIAS_FLAG).apply { this.color = color },
    )
    return bitmap
  }

  private fun dp(context: Context, value: Int): Int =
    (value * context.resources.displayMetrics.density).toInt().coerceAtLeast(1)
}
