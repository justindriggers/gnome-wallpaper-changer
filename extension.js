const Lang = imports.lang;

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const Main = imports.ui.main;

const Self = imports.misc.extensionUtils.getCurrentExtension();
const Utils = Self.imports.utils;

const TIMER = {
  seconds: 0,
  minutes: 0,
  hours: 0,
  running: true,

  toSeconds: function () {
    return this.seconds + this.minutes * 60 + this.hours * 3600
  }
}

let changer;

function init() {
}

function enable() {
  changer = new WallpaperChanger();
}

function disable() {
}

const WallpaperChanger = new Lang.Class({
  Name: 'WallpaperChanger',

  _init: function () {
    this.settings = Utils.getSettings();
    this.settings.connect('changed::seconds', Lang.bind(this, this._applyTimer));
    this.settings.connect('changed::minutes', Lang.bind(this, this._applyTimer));
    this.settings.connect('changed::hours', Lang.bind(this, this._applyTimer));
    this.settings.connect('changed::provider', Lang.bind(this, this._applyProvider));

    this.settings.connect('changed::debug', Lang.bind(this, function () {
      Utils.DEBUG = this.settings.get_boolean('debug');
    }));
    Utils.DEBUG = this.settings.get_boolean('debug');
    Utils.debug('_init', this.__name__);

    this._applyProvider();
    this._applyTimer();
  },

  _nextWallpaper: function () {
    this.provider.next(Lang.bind(this, this._setWallpaper));
    this._resetTimer();
  },

  _applyProvider: function () {
    Utils.debug('_applyProvider', this.__name__);
    this.provider = Utils.getProvider(this.settings.get_string('provider'));
    this._nextWallpaper();
    this.provider.connect('wallpapers-changed', Lang.bind(this, function (provider) {
      if (provider === this.provider) {
        Utils.debug('wallpapers-changed signal received', this.__name__);
        this._nextWallpaper();
      }
    }));
  },

  _applyTimer: function () {
    Utils.debug('_applyTimer', this.__name__);
    TIMER.seconds = this.settings.get_int('seconds');
    TIMER.minutes = this.settings.get_int('minutes');
    TIMER.hours = this.settings.get_int('hours');

    this._resetTimer();
  },

  _resetTimer: function () {
    Utils.debug('_resetTimer', this.__name__);
    if (this.timer) {
      GLib.Source.remove(this.timer);
    }

    if (TIMER.running && TIMER.toSeconds() > 0) {
      Utils.debug('Set to ' + TIMER.toSeconds(), this.__name__);
      this.timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT,
        TIMER.toSeconds(),
        Lang.bind(this, function () {
          this._nextWallpaper();
          this.timer = null;
          return false;
        })
      );
    } else {
      this.timer = null;
    }
  },

  _setWallpaper: function (path) {
    Utils.debug('_setWallpaper', this.__name__);
    const background_setting = new Gio.Settings({ schema: 'org.gnome.desktop.background' });

    if (background_setting.is_writable('picture-uri')) {
      if (background_setting.set_string('picture-uri', 'file://' + path)) {
        Utils.debug(path, this.__name__);
        Gio.Settings.sync();
      } else {
        Utils.debug('Unable to set wallpaper', this.__name__)
      }
    } else {
      Utils.debug('Can\'t write to org.gnome.desktop.background', this.__name__);
    }

    const lockscreen_setting = new Gio.Settings({ schema: 'org.gnome.desktop.screensaver' });

    if (lockscreen_setting.is_writable('picture-uri')) {
      if (lockscreen_setting.set_string('picture-uri', 'file://' + path)) {
        Utils.debug(path, this.__name__);
        Gio.Settings.sync();
      } else {
        Utils.debug('Unable to set lockscreen wallpaper', this.__name__)
      }
    } else {
      Utils.debug('Can\'t write to org.gnome.desktop.screensaver', this.__name__);
    }
  }
});
