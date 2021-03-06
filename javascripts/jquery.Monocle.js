/*!
 * Monocle - A simple image zoom plugin for jQuery
 * Author: @felixtriller
 *
 * Version 1.1
 *
 * Copyright (c) 2012 TravelTrex GmbH
 *
 * Licensed under the LGPL License (LICENSE.txt).
 *
 * Thanks to the jQuery team for their awesome JavaScript library. 
 * Thanks to Brandon Aaron (http://brandonaaron.net) for his jQuery mousewheel plugin.
 *
 * CHANGELOG
 * Version 1.1 - 2012-10-30
 * - now using the whole window for zooming
 * - improved script behavior on window resize
 *
 * Version 1.0 - 2012-10-04
 * - initial release
 *
 * TODO
 * - zoom relative to mouse position
 * - disable controls when not usable
 * - simplify formulas
 */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, curly:true, browser:true, jquery:true, indent:4, maxerr:50, unused:true, onevar:false, white:false, camelcase:true, regexp:true, trailing:true, latedef:true, newcap:true */

;(function($, window, document, undefined){
    "use strict";

    /**
     * Construct
     */
    var Monocle = function(elem, options){
        this.elem = $(elem);    // this is our image
        this.options = options;
    };

    /**
     * Monocle prototype
     */
    Monocle.prototype = {
        defaults: {
            maxZoom: 5,
            responsive: true,
            animationSpeed: 300,
            keyboard: true
        },

        /**
         * Init variables, set dimensions, bind functions and events
         */
        init: function() {
            var self    = this;
            this.config = $.extend({}, this.defaults, this.options);

            this.zoomlevel  = 0;
            this.lock       = false;

            // VARIABLES

            // get div containing the image
            this.viewport   = this.elem.parent('div');
            this.viewportX  = this.viewport.offset().left;
            this.viewportY  = this.viewport.offset().top;

            // get dimensions of image and viewport
            this.imgWidth   = this.elem.width();
            this.imgHeight  = this.elem.height();
            this.imgRatio   = this.imgHeight / this.imgWidth;

            // set image
            this.reset();

            // GO GO GO!
            this.viewport.css({
                position: 'relative',
                overflow: 'hidden'
            });
            this.elem.removeAttr('alt')    // remove attributes to prevent tool tip in IE
                     .removeAttr('title')
                     .css({
                        top: 0,
                        left: 0,
                        position: 'relative'
                     })
                     .animate({
                        opacity: 1
                     }, this.config.animationSpeed)
                     .parent().addClass('monocle-loaded');


            // REGISTER BINDINGS

            // CONTROLS

            // zoom controls
            $('.monocle-zoom-in').bind('click', function(event) {
                event.preventDefault();

                self.zoom('in');
            });
            $('.monocle-zoom-out').bind('click', function(event) {
                event.preventDefault();

                self.zoom('out');
            });
            $('.monocle-zoom-fit').bind('click', function(event) {
                event.preventDefault();

                self.reset();
            });

            // movement controls
            $('.monocle-move-up, .monocle-move-right, .monocle-move-down, .monocle-move-left').bind('click', function(event) {
                event.preventDefault();

                self.move($(this).data('direction'));
            });

            // enable keyboard navigation
            if (this.config.keyboard) {
                $(document).keydown(function(event){
                    switch(event.which) {
                        case 37: // left
                        case (($.browser.opera) ? 52 : 100): // numblock 4
                            self.move('left');
                            break;

                        case 38: // up
                        case (($.browser.opera) ? 56 : 104): // numblock 8
                            self.move('up');
                            break;

                        case 39: // right
                        case (($.browser.opera) ? 54 : 102): // numblock 6
                            self.move('right');
                            break;

                        case 40: // down
                        case (($.browser.opera) ? 50 : 98):
                            self.move('down');
                            break;

                        // +
                        case 107:
                        case 171:
                        case 187:
                            if ($.browser.opera) {
                                return;
                            }
                            self.zoom('in');
                            break;

                        // -
                        case 109:
                        case 173:
                        case 189:
                            if ($.browser.opera) {
                                return;
                            }
                            self.zoom('out');
                            break;

                        case 45:
                        case 48 :
                        case 96:
                            self.reset();
                            break;

                        default: return;
                    }

                    event.preventDefault();
                });
            }

            // use mousewheel for zooming
            if ($.fn.mousewheel) {
                this.elem.bind('mousewheel', function(event, delta) {
                    event.preventDefault();

                    if (delta > 0) {
                        self.zoom('in');
                    } else {
                        self.zoom('out');
                    }
                });
            }

            // use double click for zooming in
            this.elem.bind('dblclick', function(event) {
                event.preventDefault();

                self.zoom('in');
            });

            // EVENTS

            // drag and drop magic
            this.elem.on('mousedown', function(event) {
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

            // fix drag and drop bug (IE?) when leaving the image while mousedown
            $(document).on('mouseup', function() {
                self.elem.removeClass('monocle-draggable');
            });

            // reload page on resize (kind of responsive)
            if (this.config.responsive) {
                var resizeTimer;

                $(window).bind('resize', function () {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(function() {
                        //document.location.reload(false);
                        self.reset();
                    }, 100);
                });
            }

            return this;
        },

        /**
         * Fit image dimensions to Viewport size, reset zoom level
         */
        reset: function() {
            this.viewWidth  = $(window).width();
            this.viewHeight = $(window).height();

            this.viewport.height(this.viewHeight);
            this.viewport.width(this.viewWidth);

            // set current image size
            this.curWidth  = this.viewWidth;
            this.curHeight = this.viewWidth * this.imgRatio;

            // @todo cleanup
            if (this.curHeight > $(window).height()) {
                this.curHeight  = $(window).height() - this.viewportY * 2;
                this.curWidth   = this.curHeight / this.imgRatio;
            }

            this.zoomStep = (this.imgWidth - this.curWidth) / this.config.maxZoom;

            this.zoomlevel  = 0;

            this.elem.stop(false, true).animate({
                width: this.curWidth,
                top: 0,
                left: 0
            } , this.config.animationSpeed);
        },

        /**
         * Zoom function, zooms in and out
         * @param  {string} direction can be in and out
         */
        zoom: function(direction) {
            var directionInt = 0;
                // self = this

            // check for animation lock
            if (this.lock) {
                return;
            }

            if (direction === 'in' && this.zoomlevel === this.config.maxZoom) {
                return;
            }

            if (direction === 'out' && this.zoomlevel === 0) {
                return;
            }

            // set zoomlock, disabled until zoom animate bug is fixed
            //this.lock = true;
            //setTimeout(function () {
            //    self.lock = false;
            //}, this.config.animationSpeed * 1.1);

            switch (direction) {
                case 'in':
                    this.zoomlevel++;
                    directionInt = -1;
                    break;
                case 'out':
                    this.zoomlevel--;
                    directionInt = 1;
                    break;
            }

            this.curWidth  = this.curWidth - this.zoomStep * (directionInt);
            this.curHeight = this.curHeight - this.zoomStep * (directionInt) * this.imgRatio;

            this.goTo(directionInt, directionInt, true);
        },

        /**
         * Helper function for up, right, down, left control
         * @param  {string} direction can be up, right, down, left
         */
        move: function(direction) {
            var horizontal  = 0,
                vertical    = 0,
                self        = this;

            // check for animation lock
            if (this.lock) {
                return;
            }

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

            // set lock
            this.lock = true;
            setTimeout(function () {
                self.lock = false;
            }, this.config.animationSpeed * 1.1);

            this.goTo(horizontal, vertical, false);
        },

        /**
         * Move position of image after checking for containment
         * @param  {int} horizontal direction of horizontal movement, can be 1 and -1
         * @param  {int} vertical   direction of vertical movement, can be 1 and -1
         * @param  {bool} isZooming called from zoom function?
         */
        goTo: function(horizontal, vertical, isZooming) {
            var curLeft     = parseFloat(this.elem.css('left')),
                curTop      = parseFloat(this.elem.css('top')),
                toLeft      = horizontal * parseFloat((this.zoomStep / 2)),
                toTop       = vertical * parseFloat(((this.zoomStep / 2) * this.imgRatio)),
                animationSpeed   = this.config.animationSpeed;

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

            // animation disabled (bug)
            if (isZooming) {
                animationSpeed = 0;
            }

            this.elem.stop(false, true).animate({
                left: "+=" + toLeft,
                top: "+=" + toTop,
                width: this.curWidth
            }, animationSpeed);
        }
    };

    Monocle.defaults = Monocle.prototype.defaults;

    /**
     * Register as jQuery plugin
     */
    $.fn.monocle = function(options) {
        return this.each(function() {
            $(this).bind('load', function() {
                new Monocle(this, options).init();
            });
        });
    };

})(jQuery, window , document);