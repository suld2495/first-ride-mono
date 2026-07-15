const {
  withAndroidManifest,
  withDangerousMod,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const SHARE_ACTIVITY_NAME = '.RoutineShareReceiverActivity';
const SHARE_TARGETS_RESOURCE = '@xml/routine_share_targets';
const SHARE_TARGET_CATEGORY = 'com.mannal.firstride.category.ROUTINE_SHARE';

const routineShareStoreSource = `package com.mannal.firstride

import android.content.Context
import org.json.JSONObject

object RoutineShareStore {
  private const val PREFS_NAME = "routine_share"
  private const val KEY_PENDING_SHARE = "pendingRoutineShare"

  fun savePendingShare(context: Context, payloadJson: String) {
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putString(KEY_PENDING_SHARE, payloadJson)
      .apply()
  }

  fun getPendingShare(context: Context): String? =
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getString(KEY_PENDING_SHARE, null)

  fun clearPendingShare(context: Context, sessionId: String? = null) {
    if (sessionId != null) {
      val current = getPendingShare(context)
      val currentSessionId = try {
        JSONObject(current ?: "{}").optString("sessionId", null)
      } catch (_: Exception) {
        null
      }

      if (currentSessionId != sessionId) {
        return
      }
    }

    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .remove(KEY_PENDING_SHARE)
      .apply()
  }
}
`;

const routineSharePackageSource = `package com.mannal.firstride

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class RoutineSharePackage : ReactPackage {
  override fun createNativeModules(
    reactContext: ReactApplicationContext
  ): List<NativeModule> = listOf(RoutineShareModule(reactContext))

  override fun createViewManagers(
    reactContext: ReactApplicationContext
  ): List<ViewManager<*, *>> = emptyList()
}
`;

const routineShareModuleSource = `package com.mannal.firstride

import android.content.Context
import android.content.Intent
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.graphics.drawable.Icon
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.json.JSONArray

class RoutineShareModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "RoutineShare"

  @ReactMethod
  fun publishShareTargets(targetsJson: String, promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N_MR1) {
        val shortcutManager =
          reactContext.getSystemService(Context.SHORTCUT_SERVICE) as ShortcutManager
        val shortcuts = createShortcuts(targetsJson)

        shortcutManager.dynamicShortcuts = shortcuts
      }

      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("ROUTINE_SHARE_TARGETS_FAILED", error)
    }
  }

  @ReactMethod
  fun clearShareTargets(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N_MR1) {
        val shortcutManager =
          reactContext.getSystemService(Context.SHORTCUT_SERVICE) as ShortcutManager

        shortcutManager.removeAllDynamicShortcuts()
      }

      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("ROUTINE_SHARE_CLEAR_TARGETS_FAILED", error)
    }
  }

  @ReactMethod
  fun getPendingShare(promise: Promise) {
    promise.resolve(RoutineShareStore.getPendingShare(reactContext))
  }

  @ReactMethod
  fun clearPendingShare(sessionId: String?, promise: Promise) {
    try {
      RoutineShareStore.clearPendingShare(reactContext, sessionId)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("ROUTINE_SHARE_CLEAR_PENDING_FAILED", error)
    }
  }

  private fun createShortcuts(targetsJson: String): List<ShortcutInfo> {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N_MR1) {
      return emptyList()
    }

    val targets = JSONArray(targetsJson)
    val shortcuts = mutableListOf<ShortcutInfo>()

    for (index in 0 until targets.length()) {
      val target = targets.getJSONObject(index)
      val routineId = target.getInt("id")
      val title = target.getString("title")
      val subtitle = target.optString("subtitle", "")
      val intent = Intent(reactContext, RoutineShareReceiverActivity::class.java)
        .setAction(Intent.ACTION_SEND)
        .setType("image/*")
        .putExtra(RoutineShareReceiverActivity.EXTRA_ROUTINE_ID, routineId)

      shortcuts.add(
        ShortcutInfo.Builder(reactContext, "routine-share-$routineId")
          .setShortLabel(title.take(MAX_SHORT_LABEL_LENGTH))
          .setLongLabel(if (subtitle.isNotBlank()) "$title - $subtitle" else title)
          .setIcon(Icon.createWithResource(reactContext, R.mipmap.ic_launcher))
          .setCategories(setOf(RoutineShareReceiverActivity.SHARE_TARGET_CATEGORY))
          .setIntent(intent)
          .setRank(index)
          .build(),
      )
    }

    return shortcuts
  }

  companion object {
    private const val MAX_SHORT_LABEL_LENGTH = 18
  }
}
`;

const routineShareReceiverSource = `package com.mannal.firstride

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.UUID

class RoutineShareReceiverActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    handleShareIntent(intent)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    handleShareIntent(intent)
  }

  private fun handleShareIntent(intent: Intent?) {
    val routineId = intent?.getIntExtra(EXTRA_ROUTINE_ID, 0) ?: 0

    if (routineId <= 0 || intent == null) {
      finish()
      return
    }

    val imageUris = extractImageUris(intent)

    if (imageUris.isEmpty()) {
      finish()
      return
    }

    val sessionId = UUID.randomUUID().toString()
    val images = JSONArray()
    val sessionDirectory = File(cacheDir, "routine-share/$sessionId").apply {
      mkdirs()
    }

    imageUris.take(MAX_SHARED_IMAGE_COUNT).forEachIndexed { index, uri ->
      contentResolver.openInputStream(uri)?.use { input ->
        val bytes = input.readBytes()
        val outputFile = File(sessionDirectory, "shared-$index")

        outputFile.outputStream().use { output -> output.write(bytes) }
        images.put(
          JSONObject()
            .put("uri", Uri.fromFile(outputFile).toString()),
        )
      }
    }

    if (images.length() == 0) {
      finish()
      return
    }

    val payload = JSONObject()
      .put("sessionId", sessionId)
      .put("routineId", routineId)
      .put("createdAt", System.currentTimeMillis().toString())
      .put("images", images)

    RoutineShareStore.savePendingShare(this, payload.toString())
    openRequestModal(routineId, sessionId)
    finish()
  }

  private fun extractImageUris(intent: Intent): List<Uri> {
    val uris = mutableListOf<Uri>()

    if (intent.action == Intent.ACTION_SEND_MULTIPLE) {
      intent.getParcelableArrayListExtra<Uri>(Intent.EXTRA_STREAM)?.let {
        uris.addAll(it)
      }
    }

    if (intent.action == Intent.ACTION_SEND) {
      intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)?.let {
        uris.add(it)
      }
    }

    val clipData = intent.clipData

    if (clipData != null) {
      for (index in 0 until clipData.itemCount) {
        clipData.getItemAt(index).uri?.let { uri ->
          if (!uris.contains(uri)) {
            uris.add(uri)
          }
        }
      }
    }

    return uris
  }

  private fun openRequestModal(routineId: Int, sessionId: String) {
    val deepLink = Uri.parse(
      "first-ride://modal?type=request&routineId=$routineId&shareSessionId=$sessionId",
    )
    val launchIntent = Intent(this, MainActivity::class.java)
      .setAction(Intent.ACTION_VIEW)
      .setData(deepLink)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)

    startActivity(launchIntent)
  }

  companion object {
    const val EXTRA_ROUTINE_ID = "com.mannal.firstride.extra.ROUTINE_ID"
    const val SHARE_TARGET_CATEGORY = "${SHARE_TARGET_CATEGORY}"
    private const val MAX_SHARED_IMAGE_COUNT = 3
  }
}
`;

const shareTargetsXml = `<?xml version="1.0" encoding="utf-8"?>
<shortcuts xmlns:android="http://schemas.android.com/apk/res/android">
  <share-target android:targetClass="com.mannal.firstride.RoutineShareReceiverActivity">
    <data android:mimeType="image/*" />
    <category android:name="${SHARE_TARGET_CATEGORY}" />
  </share-target>
</shortcuts>
`;

const ensureArray = (value) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

const hasMainLauncherFilter = (activity) =>
  ensureArray(activity['intent-filter']).some((filter) =>
    ensureArray(filter.action).some(
      (action) => action.$?.['android:name'] === 'android.intent.action.MAIN',
    ),
  );

const addShortcutsMetadata = (activity) => {
  const metadata = ensureArray(activity['meta-data']);
  const existing = metadata.find(
    (item) => item.$?.['android:name'] === 'android.app.shortcuts',
  );

  if (existing) {
    existing.$['android:resource'] = SHARE_TARGETS_RESOURCE;
  } else {
    metadata.push({
      $: {
        'android:name': 'android.app.shortcuts',
        'android:resource': SHARE_TARGETS_RESOURCE,
      },
    });
  }

  activity['meta-data'] = metadata;
};

const addShareReceiverActivity = (application) => {
  const activities = ensureArray(application.activity);
  const exists = activities.some(
    (activity) => activity.$?.['android:name'] === SHARE_ACTIVITY_NAME,
  );

  if (!exists) {
    activities.push({
      $: {
        'android:name': SHARE_ACTIVITY_NAME,
        'android:exported': 'true',
        'android:noHistory': 'true',
        'android:theme': '@style/Theme.App.SplashScreen',
      },
    });
  }

  application.activity = activities;
};

const injectRoutineSharePackage = (mainApplicationPath) => {
  if (!fs.existsSync(mainApplicationPath)) {
    return;
  }

  const source = fs.readFileSync(mainApplicationPath, 'utf8');

  if (source.includes('RoutineSharePackage()')) {
    return;
  }

  const nextSource = source.includes('packages.add(RoutineWidgetPackage())')
    ? source.replace(
        'packages.add(RoutineWidgetPackage())',
        'packages.add(RoutineWidgetPackage())\n            packages.add(RoutineSharePackage())',
      )
    : source.replace(
        'return packages',
        'packages.add(RoutineSharePackage())\n            return packages',
      );

  fs.writeFileSync(mainApplicationPath, nextSource);
};

const writeFile = (filePath, source) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, source);
};

const withRoutineShareAndroid = (config) => {
  config = withAndroidManifest(config, (manifestConfig) => {
    const application = manifestConfig.modResults.manifest.application?.[0];

    if (!application) {
      return manifestConfig;
    }

    ensureArray(application.activity).forEach((activity) => {
      if (hasMainLauncherFilter(activity)) {
        addShortcutsMetadata(activity);
      }
    });
    addShareReceiverActivity(application);

    return manifestConfig;
  });

  return withDangerousMod(config, [
    'android',
    (dangerousConfig) => {
      const androidRoot = dangerousConfig.modRequest.platformProjectRoot;
      const packageName =
        dangerousConfig.android?.package ?? 'com.mannal.firstride';
      const packagePath = packageName.replace(/\./g, '/');
      const sourceRoot = path.join(
        androidRoot,
        'app/src/main/java',
        packagePath,
      );

      writeFile(
        path.join(sourceRoot, 'RoutineShareStore.kt'),
        routineShareStoreSource,
      );
      writeFile(
        path.join(sourceRoot, 'RoutineSharePackage.kt'),
        routineSharePackageSource,
      );
      writeFile(
        path.join(sourceRoot, 'RoutineShareModule.kt'),
        routineShareModuleSource,
      );
      writeFile(
        path.join(sourceRoot, 'RoutineShareReceiverActivity.kt'),
        routineShareReceiverSource,
      );
      writeFile(
        path.join(
          androidRoot,
          'app/src/main/res/xml/routine_share_targets.xml',
        ),
        shareTargetsXml,
      );
      injectRoutineSharePackage(path.join(sourceRoot, 'MainApplication.kt'));

      return dangerousConfig;
    },
  ]);
};

module.exports = withRoutineShareAndroid;
