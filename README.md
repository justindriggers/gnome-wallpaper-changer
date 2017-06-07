# gnome-wallpaper-changer
GNOME extension to change wallpaper from providers

Forked from https://github.com/Jomik/gnome-wallpaper-changer

## Install instructions
```
git clone https://github.com/justindriggers/gnome-wallpaper-changer.git ~/.local/share/gnome-shell/extensions/wallpaper-changer@justindriggers.com
cd ~/.local/share/gnome-shell/extensions/wallpaper-changer@justindriggers.com
glib-compile-schemas ./schemas/
```

Relog and you are good to go!

## Folder provider
Looks, by default, for wallpapers in `~/wallpapers` and applies them at random.

## Wallhaven provider
As default SFW General pictures with the ratio 16x9 from wallhaven.cc and applies them to your pictures.
It downloads a page of pictures at once and deletes them as they are used.
