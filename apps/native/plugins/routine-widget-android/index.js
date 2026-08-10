/* global __dirname */

const {
  withAndroidManifest,
  withDangerousMod,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const ROUTINE_WIDGET_PROVIDERS = [
  {
    name: '.RoutineSmallWidgetProvider',
    metadataResource: '@xml/routine_widget_small_info',
    labelResource: '@string/routine_widget_small_name',
  },
  {
    name: '.RoutineMediumWidgetProvider',
    metadataResource: '@xml/routine_widget_medium_info',
    labelResource: '@string/routine_widget_medium_name',
  },
  {
    name: '.RoutineLargeWidgetProvider',
    metadataResource: '@xml/routine_widget_large_info',
    labelResource: '@string/routine_widget_large_name',
  },
];
const CHARACTER_WIDGET_PROVIDER = '.CharacterWidgetProvider';
const OBSOLETE_ROUTINE_WIDGET_PROVIDER = '.RoutineWidgetProvider';
const TEMPLATE_ROOT = path.join(__dirname, 'templates');

const ensureArray = (value) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

const addWidgetReceiver = (
  application,
  name,
  metadataResource,
  labelResource,
) => {
  const receivers = ensureArray(application.receiver);
  const existing = receivers.find(
    (receiver) => receiver.$?.['android:name'] === name,
  );
  const receiver = existing ?? { $: {} };

  receiver.$ = {
    ...receiver.$,
    'android:name': name,
    'android:exported': 'false',
    'android:label': labelResource,
  };
  receiver['intent-filter'] = [
    {
      action: [
        { $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } },
        { $: { 'android:name': 'android.intent.action.DATE_CHANGED' } },
        { $: { 'android:name': 'android.intent.action.TIMEZONE_CHANGED' } },
      ],
    },
  ];
  receiver['meta-data'] = [
    {
      $: {
        'android:name': 'android.appwidget.provider',
        'android:resource': metadataResource,
      },
    },
  ];

  if (!existing) {
    receivers.push(receiver);
  }
  application.receiver = receivers;
};

const copyDirectory = (source, destination, packageName) => {
  fs.mkdirSync(destination, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath, packageName);
      continue;
    }

    const contents = fs
      .readFileSync(sourcePath, 'utf8')
      .replaceAll('__PACKAGE_NAME__', packageName);
    fs.writeFileSync(destinationPath, contents);
  }
};

const copyPreviewAsset = (sourcePath, destinationPath) => {
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(sourcePath, destinationPath);
};

const injectRoutineWidgetPackage = (mainApplicationPath) => {
  if (!fs.existsSync(mainApplicationPath)) {
    return;
  }

  const source = fs.readFileSync(mainApplicationPath, 'utf8');

  if (source.includes('RoutineWidgetPackage()')) {
    return;
  }

  const applyMarker = 'PackageList(this).packages.apply {';
  const nextSource = source.includes(applyMarker)
    ? source.replace(
        applyMarker,
        `${applyMarker}\n              add(RoutineWidgetPackage())`,
      )
    : source.replace(
        'return packages',
        'packages.add(RoutineWidgetPackage())\n            return packages',
      );

  if (nextSource === source) {
    throw new Error('Could not register RoutineWidgetPackage');
  }

  fs.writeFileSync(mainApplicationPath, nextSource);
};

const withRoutineWidgetsAndroid = (config) => {
  config = withAndroidManifest(config, (manifestConfig) => {
    const application = manifestConfig.modResults.manifest.application?.[0];

    if (!application) {
      return manifestConfig;
    }

    application.receiver = ensureArray(application.receiver).filter(
      (receiver) =>
        receiver.$?.['android:name'] !== OBSOLETE_ROUTINE_WIDGET_PROVIDER,
    );
    ROUTINE_WIDGET_PROVIDERS.forEach(
      ({ name, metadataResource, labelResource }) => {
        addWidgetReceiver(application, name, metadataResource, labelResource);
      },
    );
    addWidgetReceiver(
      application,
      CHARACTER_WIDGET_PROVIDER,
      '@xml/character_widget_info',
      '@string/character_widget_name',
    );

    return manifestConfig;
  });

  return withDangerousMod(config, [
    'android',
    (dangerousConfig) => {
      const androidRoot = dangerousConfig.modRequest.platformProjectRoot;
      const packageName =
        dangerousConfig.android?.package ?? 'com.firstride.irura';
      const packagePath = packageName.replace(/\./g, '/');
      const sourceRoot = path.join(
        androidRoot,
        'app/src/main/java',
        packagePath,
      );
      const resourceRoot = path.join(androidRoot, 'app/src/main/res');

      fs.rmSync(path.join(resourceRoot, 'xml/routine_widget_info.xml'), {
        force: true,
      });

      copyDirectory(
        path.join(TEMPLATE_ROOT, 'kotlin'),
        sourceRoot,
        packageName,
      );
      copyDirectory(path.join(TEMPLATE_ROOT, 'res'), resourceRoot, packageName);
      copyPreviewAsset(
        path.join(
          dangerousConfig.modRequest.projectRoot,
          'targets/routine-widget/Assets.xcassets/WidgetPreviewCharacter.dataset/character.png',
        ),
        path.join(
          resourceRoot,
          'drawable-nodpi/routine_widget_preview_character.png',
        ),
      );
      copyPreviewAsset(
        path.join(
          dangerousConfig.modRequest.projectRoot,
          'targets/routine-widget/Assets.xcassets/WidgetPreviewBackground.dataset/background.png',
        ),
        path.join(
          resourceRoot,
          'drawable-nodpi/routine_widget_preview_background.png',
        ),
      );
      injectRoutineWidgetPackage(path.join(sourceRoot, 'MainApplication.kt'));

      return dangerousConfig;
    },
  ]);
};

module.exports = withRoutineWidgetsAndroid;
