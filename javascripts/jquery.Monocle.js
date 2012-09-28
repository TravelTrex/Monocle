/*
 * Monocle - A simple image zoom plugin for jQuery
 * Author: @felixtriller
 *
 * Copyright (c) 2012 TravelTrex GmbH
 *
 * Licensed under the LGPL License (LICENSE.txt).
 *
 * Thanks to the jQuery team for their awesome JavaScript library. 
 * Thanks to Brandon Aaron (http://brandonaaron.net) for his jQuery Mousewheel plugin.
 *
 * Version 1.0
 *
 * TODO
 * - zoom relative to mouse position
 * - disable controls when not usable
 * - simplify formulas
 */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, curly:true, browser:true, jquery:true, indent:4, maxerr:50, unused:true, onevar:false, white:false, camelcase:true, regexp:true, trailing:true, latedef:true, newcap:true */

;(function( $, window, document, undefined ){
    "use strict";

    /*
     * Construct
     */
    var Monocle = function( elem, options ){
        this.elem = elem;
        this.$elem = $(elem);
        this.options = options;
    };

    /*
     * Monocle prototype
     */
    Monocle.prototype = {
        defaults: {
            message: 'Hello world!',
            zoomSpeed: 0,
            maxZoom: 6
        },

        /*
         * Init variables, set dimensions, bind functions and events
         */
        init: function() {
            var self    = this;
            this.config = $.extend({}, this.defaults, this.options);

            this.zoomlevel  = 0;
            this.zoomLock   = false;

            // VARIABLES

            // get div containing the image
            this.viewport   = $( this.$elem ).parent('div');
            this.viewportX  = this.viewport.offset().left;
            this.viewportY  = this.viewport.offset().top;

            // get dimensions of image and viewport
            this.imgWidth   = this.$elem.width();
            this.imgHeight  = this.$elem.height();
            this.imgRatio   = this.imgHeight / this.imgWidth;

            this.viewWidth  = this.viewport.width();
            this.viewHeight = this.viewport.height();

            // set current image
            this.curWidth  = this.imgWidth;
            this.curHeight = this.imgHeight;

            // set zoom step size based on image size and zoom levels
            this.zoomStep   = (this.imgWidth - this.viewWidth) / this.config.maxZoom;

            // fit image to viewport
            this.reset();

            // GO GO GO!
            this.$elem.animate({
                opacity: 1
            }, 1000);

            // BINDINGS

            // drag and drop magic
            this.$elem.on('mousedown', function(event) {
                event.preventDefault();

                $(this).addClass('monocle-draggable');

                var posX = $(this).offset().left - event.pageX,
                    posY = $(this).offset().top - event.pageY,
                    toX  = 0,
                    toY  = 0;

                // @todo: parents() or parent() ?
                $(this).parents().on('mousemove', function(event) {
                    event.preventDefault();

                    toX = event.pageX + posX,
                    toY = event.pageY + posY;

                    // containment
                    // @todo: cleaner solution?
                    // x-axis
                    if ((self.viewportX - toX - (self.curWidth - self.viewWidth)) > 0){
                        toX = self.viewportX - (self.curWidth - self.viewWidth);
                    }

                    if ((self.viewportX - toX) < 0) {
                        toX = self.viewportX;
                    }

                    // y-axis
                    if ((self.viewportY - toY - (self.curHeight - self.viewHeight)) > 0) {
                        toY = self.viewportY - (self.curHeight - self.viewHeight);
                    }

                    if ((self.viewportY - toY) < 0) {
                        toY = self.viewportY;
                    }

                    $('.monocle-draggable').offset({
                        left: toX,
                        top: toY
                    });
                });

            }).on('mouseup', function() {
                $(this).removeClass('monocle-draggable');
            });

            // fix drag and drop bug when leaving the image while mousedown
            $(document).on('mouseup', function() {
                self.$elem.removeClass('monocle-draggable');
            });

            // CONTROLS

            // zoom controls
            $('.monocle-zoom-in').bind('click', function(event) {
                event.preventDefault();

                self.zoomIn();
            });
            $('.monocle-zoom-out').bind('click', function(event) {
                event.preventDefault();

                self.zoomOut();
            });
            $('.monocle-zoom-fit').bind('click', function(event) {
                event.preventDefault();

                self.reset();
            });

            // movement controls
            $('.monocle-move-up, .monocle-move-right, .monocle-move-down, .monocle-move-left').bind('click', function(event) {
                event.preventDefault();

                self.goTo($(this).data('direction'));
            });

            // use mousewheel for zooming
            if ($.fn.mousewheel) {
                this.$elem.bind('mousewheel', function(event, delta) {
                    event.preventDefault();

                    if (delta > 0) {
                        self.zoomIn();
                    } else {
                        self.zoomOut();
                    }
                });
            }

            // use double click for zooming in
            this.$elem.bind('dblclick', function(event) {
                event.preventDefault();

                self.zoomIn();
            });

            return this;
        },

        /*
         * Set image dimensions to Viewport size, reset zoom level,
         * change Viewport height to fit aspect ratio of image
         */
        reset: function() {
            this.curWidth  = this.viewWidth;
            this.curHeight = this.viewWidth * this.imgRatio;

            this.zoomlevel  = 0;

            this.viewHeight = this.curHeight;
            this.viewport.height(this.curHeight);

            this.$elem.stop().animate({
                width: this.curWidth,
                top: 0,
                left: 0
            } , this.config.zoomSpeed);
        },

        /*
         * Zoom in function
         * @todo combine
         */
        zoomIn: function() {
            var self = this;

            if (this.zoomLock) {
                return;
            }

            if (this.zoomlevel < this.config.maxZoom) {
                // set zoomlock
                this.zoomLock = true;
                setTimeout(function () {
                    self.zoomLock = false;
                }, this.config.zoomSpeed * 1.1);

                this.zoomlevel++;

                this.curWidth  = this.viewWidth + this.zoomStep * this.zoomlevel;
                this.curHeight = this.viewWidth * this.imgRatio + this.zoomStep * this.zoomlevel * this.imgRatio;

                this.$elem.stop().animate({
                    top: "-=" + ((this.zoomStep / 2) * this.imgRatio),
                    left: "-=" + (this.zoomStep / 2),
                    width: this.curWidth
                } , this.config.zoomSpeed);
            }
        },

        /*
         * Zoom out function
         * @todo combine
         */
        zoomOut: function() {
            var self = this;

            if (this.zoomLock) {
                return;
            }

            if (this.zoomlevel > 0) {
                // set zoomlock
                this.zoomLock = true;
                setTimeout(function () {
                    self.zoomLock = false;
                }, this.config.zoomSpeed * 1.1);

                this.zoomlevel--;

                this.curWidth  = this.viewWidth + this.zoomStep * this.zoomlevel;
                this.curHeight = this.viewWidth * this.imgRatio + this.zoomStep * this.zoomlevel * this.imgRatio;

                var curLeft = parseFloat(this.$elem.css('left')),
                    curTop  = parseFloat(this.$elem.css('top')),
                    toLeft  = parseFloat((this.zoomStep / 2)),
                    toTop   = parseFloat(((this.zoomStep / 2) * this.imgRatio));

                // check for containment
                if ((this.curWidth - this.viewWidth + (curLeft + toLeft)) < 0) {
                    toLeft = toLeft + Math.abs((this.curWidth - this.viewWidth + (curLeft + toLeft)));
                }

                if ((curLeft + toLeft) > 0) {
                    toLeft = Math.abs(curLeft);
                }

                if ((this.curHeight - this.viewHeight + (curTop + toTop)) < 0) {
                    toTop = toTop + Math.abs((this.curHeight - this.viewHeight + (curTop + toTop)));
                }

                if ((curTop + toTop) > 0) {
                    toTop = Math.abs(curTop);
                }

                this.$elem.stop().animate({
                    left: "+=" + toLeft,
                    top: "+=" + toTop,
                    width: this.curWidth
                } , this.config.zoomSpeed);
            }
        },

        /*
         * Move relative
         */
        goTo: function(direction) {
            var horizontal  = 0,
                vertical    = 0;

            switch (direction) {
                case 'up':
                    vertical = 1;
                    break;
                case 'right':
                    horizontal = -1;
                    break;
                case 'down':
                    vertical = -1;
                    break;
                case 'left':
                    horizontal = 1;
                    break;
            }

            var curLeft = parseFloat(this.$elem.css('left')),
                curTop  = parseFloat(this.$elem.css('top')),
                toLeft  = horizontal * parseFloat((this.zoomStep / 2)),
                toTop   = vertical * parseFloat(((this.zoomStep / 2) * this.imgRatio));

            // check for containment
            if ((this.curWidth - this.viewWidth + (curLeft + toLeft)) < 0) {
                toLeft = toLeft + Math.abs((this.curWidth - this.viewWidth + (curLeft + toLeft)));
            }

            if ((curLeft + toLeft) > 0) {
                toLeft = Math.abs(curLeft);
            }

            if ((this.curHeight - this.viewHeight + (curTop + toTop)) < 0) {
                toTop = toTop + Math.abs((this.curHeight - this.viewHeight + (curTop + toTop)));
            }

            if ((curTop + toTop) > 0) {
                toTop = Math.abs(curTop);
            }

            this.$elem.stop().animate({
                left: "+=" + toLeft,
                top: "+=" + toTop,
                width: this.curWidth
            } , this.config.zoomSpeed);
        }
    };

    Monocle.defaults = Monocle.prototype.defaults;

    /*
     * Register as jQuery plugin
     */
    $.fn.monocle = function(options) {
        return this.each(function() {
            $(this).bind('load', function() {
                new Monocle(this, options).init();
            });
        });
    };

    //optional: window.Monocle = Monocle;

})( jQuery, window , document );