# Introducing Monocle
An easy-to-use jQuery plugin for viewing big images.

Monocle was designed to showcase high resolution ski area maps on our websites. An intuitive user interface, zooming and drag and drop capabilities provide an overview of the whole area, next to the possibility to discover small details on the big maps.

Available controls (next to the graphical controls):
 * moving the image with drag and drop and the arrow keys (normal and numblock)
 * zooming in an out with the mouse wheel and plus and minus keys
 * fit to view port with pressing "0"

Should work in Google Chrome, Safari, Mozilla Firefox 3.6+, Opera 10+ and Microsoft Internet Explorer 8+.

## How do I use it?
Include JavaScripts and the CSS

```html
<script src="javascripts/jquery-1.8.0.min.js"></script>
<script src="javascripts/jquery.mousewheel.js"></script>
<script src="javascripts/jquery.Monocle.js"></script>

<link rel="stylesheet" href="stylesheets/Monocle.css">

<script type="text/javascript">
    jQuery(function() {
        jQuery('.monocle-image').monocle();
    });
</script>
```

The markup should look like this

```html
<div class="monocle">
    <img src="http://upload.wikimedia.org/wikipedia/commons/d/db/K%C3%B6lner_Dom_nachts.jpg" alt="Monocle image" class="monocle-image">
    <div class="monocle-controls">
        <span class="monocle-control monocle-move-up" data-direction="up"></span>
        <span class="monocle-control monocle-move-right" data-direction="right"></span>
        <span class="monocle-control monocle-move-down" data-direction="down"></span>
        <span class="monocle-control monocle-move-left" data-direction="left"></span>
        <span class="monocle-control monocle-zoom-in"></span>
        <span class="monocle-control monocle-zoom-out"></span>
        <span class="monocle-control monocle-zoom-fit"></span>
    </div>
</div>
```

This is a early version of Monocle which needs some cleanup and refactoring.

## Changelog
 * _2012.10.30 - 1.1_
    * Monocle is now using the whole window while zooming
    * Improved script behavior on window resize
 * _2012.10.05 - 1.0_
    * Initial release

## Credits and License
Monocle is licensed under the LGPL License (LICENSE.txt) and therefore free to use.

Thanks to the jQuery team for their awesome JavaScript library.  
Thanks to Brandon Aaron (http://brandonaaron.net) for his jQuery Mousewheel plugin.