/*
 * Monocle - A simple image zoom plugin for jQuery
 * Author: @felixtriller
 */

;(function( $, window, document, undefined ){
    "use strict";

    // our plugin constructor
    var Monocle = function( elem, options ){
        this.elem = elem;
        this.$elem = $(elem);
        this.options = options;
    };

    // the plugin prototype
    Monocle.prototype = {
        defaults: {
            message: 'Hello world!',
            maxZoom: 9
        },

        init: function() {
            var self    = this;
            this.config = $.extend({}, this.defaults, this.options);

            this.zoomlevel  = 0;

            this.viewport   = $( this.$elem ).parent('div');

            this.viewportX  = this.viewport.offset().left;
            this.viewportY  = this.viewport.offset().top;

            this.imgWidth   = this.$elem.width();
            this.imgHeight  = this.$elem.height();
            this.imgRatio   = this.imgHeight / this.imgWidth;

            this.currWidth  = this.imgWidth;
            this.currHeight = this.imgHeight;

            this.viewWidth  = this.viewport.width();
            this.viewHeight = this.viewport.height();
            this.viewRatio  = this.viewHeight / this.viewWidth;

            this.zoomStep   = (this.imgWidth - this.viewWidth) / this.config.maxZoom;

            this.$elem.on('mousedown', function(event) {
                $(this).addClass('monocle-draggable');

                var posX = $(this).offset().left - event.pageX,
                    posY = $(this).offset().top - event.pageY,
                    toX  = 0,
                    toY  = 0;

                $(this).parents().on('mousemove', function(event) {
                    toX = event.pageX + posX,
                    toY = event.pageY + posY;

                    /*console.log('toX' + toX);
                    console.log('toY' + toY);
                    console.log('event.pageX' + event.pageX);
                    console.log('event.pageY' + event.pageY);*/

                    //if ((self.viewportX - toX) < 0)
                    //if (((self.viewportX - toX + self.currWidth - self.viewWidth) > 0) || (self.viewportX - toX) < 0)
                    if ((self.currWidth - self.viewWidth) < 0)
                        toX = self.viewportX;

                    if ((self.viewportY - toY) < 0)
                    //if (((self.viewportY - toY + self.currHeight - self.viewHeight) > 0) || (self.viewportY - toY) < 0)
                        toY = self.viewportY;

                    $('.monocle-draggable').offset({
                        left: toX,
                        top: toY
                    }).on('mouseup', function() {
                        $(this).removeClass('monocle-draggable');
                    });
                });

                event.preventDefault();
            }).on('mouseup', function() {
                $(this).removeClass('monocle-draggable');
            });

            this.fitViewport();

            $('.monocle-zoomin').bind('click', function() {
                self.zoomIn();
            });
            $('.monocle-zoomout').bind('click', function() {
                self.zoomOut();
            });

            this.$elem.bind('mousewheel', function(event, delta) {
                console.log(delta);
                if (delta > 0) {
                    self.zoomIn();
                } else {
                    self.zoomOut();
                }
            });

            return this;
        },

        fitViewport: function() {
            this.currWidth  = this.viewWidth;
            this.currHeight = this.viewWidth * this.imgRatio;
            this.viewHeight = this.currHeight;
            this.viewport.height(this.currHeight);
            this.zoomlevel  = 0;

            this.$elem.width(this.currWidth);
            // .height(this.viewWidth * this.imgRatio)
        },

        zoomIn: function() {
            if (this.zoomlevel < this.config.maxZoom) {
                this.zoomlevel++;

                this.currWidth  = this.viewWidth + this.zoomStep * this.zoomlevel;
                this.currHeight = this.viewWidth * this.imgRatio + this.zoomStep * this.zoomlevel * this.imgRatio;

                this.$elem.stop().animate({
                    width: this.currWidth,
                    left: "-=" + (this.zoomStep / 2),
                    top: "-=" + ((this.zoomStep / 2) * this.imgRatio)
                } , 0);

                /*this.$elem.animate({
                    width: this.viewWidth + this.zoomStep * this.zoomlevel
                }, {
                    duration: 2000, queue: false
                });
                this.$elem.animate({
                    left: "-=" + (this.zoomStep / 2)
                }, {
                    duration: 2000, queue: false
                });
                this.$elem.animate({
                    top: "-=" + ((this.zoomStep / 2)* this.imgRatio)
                }, {
                    duration: 2000, queue: false
                });*/

                ////console.log(this.zoomlevel);
            }
        },

        zoomOut: function() {
            if (this.zoomlevel > 0) {
                this.zoomlevel--;

                this.currWidth  = this.viewWidth + this.zoomStep * this.zoomlevel;
                this.currHeight = this.viewWidth * this.imgRatio + this.zoomStep * this.zoomlevel * this.imgRatio;

                this.$elem.stop().animate({
                    width: this.currWidth,
                    left: "+=" + (this.zoomStep / 2),
                    top: "+=" + ((this.zoomStep / 2) * this.imgRatio)
                } , 0);

                /*this.$elem.animate({
                    width: this.viewWidth + this.zoomStep * this.zoomlevel
                }, {
                    duration: 200, queue: false
                });
                this.$elem.animate({
                    left: "+=" + (this.zoomStep / 2)
                }, {
                    duration: 200, queue: false
                });
                this.$elem.animate({
                    top: "+=" + ((this.zoomStep / 2) * this.imgRatio)
                }, {
                    duration: 200, queue: false
                });*/

                //console.log(this.zoomlevel);
            }
        }
    }

    Monocle.defaults = Monocle.prototype.defaults;

    $.fn.monocle = function(options) {
        return this.each(function() {
            new Monocle(this, options).init();
        });
    };

    //optional: window.Monocle = Monocle;

})( jQuery, window , document );