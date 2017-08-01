/**
 * connect.js
 *
 * Purplepixie Connect Animation - https://github.com/purplepixie/connect-animation
 *
 * Licence: GNU GPL v3
 */

function Point(ix, iy, is, ixv, iyv)
{
    this.x = ix;
    this.y = iy;
    this.size = is;
    this.xv = ixv;
    this.yv = iyv;
    this.col = null;
}

function ConnectAnimation(canvas_id)
{
    this.numPoints = 40;    // number of points

    this.autoscale = false; // automatically scale to screen (otherwise scale manually)
    this.autofind = false; // autofind the height and width from canvas (when set via CSS etc) - overriden if autoscale is set

    this.xsize = 0; // xsize and ysize are for manually setting size (otherwise set auto)
    this.ysize = 0;

    this.xspeedmax = 10; // maximum X velocity of points
    this.yspeedmax = 10; // maximum Y velocity of points

    this.minsize = 6; // minimum point size
    this.maxsize = 16; // maximum point size

    this.bgColor = 'white'; // background colour
    this.fgColor = '#c0c0c0'; // foreground colour (fill for points when not rainbow)
    this.fgLinkColor = '#c0c0c0'; // link (solid) colour
    this.fgLinkLightColor = '#c0e0c0'; // 'lightning' colour

    this.links = true; // show links
    this.linkmax = 200; // maximim distance (at which point 'lightning appears')
    this.linksolid = 75; // solid link distance

    this.interval = 50; // polling interval (ms)

    this.lowR = 150; // for rainbow 'low' and 'high' values for R, G, B
    this.highR = 255;
    this.lowG = 150;
    this.highG = 255;
    this.lowB = 150;
    this.highB = 255;


    this.rainbow = true; // rainbow mode on / off

    this.collision = true; // collision mode on / off

    this.bothbounce = true; // bounce both items on collision

    this.edgewrap = false; // 'wrap' the edges (off bottom appear top) of if false "bounce" off the wall

    // "Private" Gubbins

    var self = this;
    this.points = Array();
    this.canvas_id = canvas_id;
    this.canvas = null;
    this.context = null;

    this.rangeR = this.highR - this.lowR;
    this.rangeG = this.highG - this.lowG;
    this.rangeB = this.highB - this.lowB;

    this.running = false;
    this.intervalvar = null;


    this.setup = function()
    {
        this.canvas = document.getElementById(this.canvas_id);
        this.context = this.canvas.getContext('2d');

        this.resize();

        for(i=0; i<this.numPoints; ++i)
        {
            x = Math.floor((Math.random() * this.xsize));
            y = Math.floor((Math.random() * this.ysize));
            sizerange = this.maxsize - this.minsize;
            size=this.maxsize;
            if (sizerange>0)
            {
                    size = Math.floor(Math.random()*sizerange)+this.minsize;
            }
            xv = Math.floor(Math.random() * (this.xspeedmax*2)) - this.xspeedmax + 1;
            yv = Math.floor(Math.random() * (this.yspeedmax*2)) - this.yspeedmax + 1;

            p = new Point(x,y,size,xv,yv);

            if (this.rainbow)
            {
                r = Math.floor(Math.random()*this.rangeR)+this.lowR;
                g = Math.floor(Math.random()*this.rangeG)+this.lowG;
                b = Math.floor(Math.random()*this.rangeB)+this.lowB;
                p.col = "rgb("+r+","+g+","+b+")";
            }

            this.points.push(p);
        }

        this.clear();
        this.draw();
    }

    this.resize = function()
    {
        if (this.autoscale)
        {
            this.context.canvas.width = window.innerWidth-1;
            this.context.canvas.height = window.innerHeight-1;
            this.xsize = this.context.canvas.width;
            this.ysize = this.context.canvas.height;
        }
        else if (this.autofind)
        {
            this.xsize = this.context.canvas.width;
            this.ysize = this.context.canvas.height;
        }
        else
        {
            this.context.canvas.width = this.xsize;
            this.context.canvas.height = this.ysize;
        }
    }

    this.clear = function()
    {
        this.context.beginPath();
        this.context.rect(0,0,this.xsize,this.ysize);
        this.context.fillStyle=this.bgColor;
        this.context.fill();
    }

    this.draw = function()
    {
        for(i=0; i<this.points.length; ++i)
        {
            if (this.links || this.collision)
            {
                for(z=i+1; z<this.points.length; z++)
                {
                    xd = this.points[i].x - this.points[z].x;
                    yd = this.points[i].y - this.points[z].y;
                    if (xd<0) xd=0-xd;
                    if (yd<0) yd=0-yd;
                    dist = Math.floor(Math.sqrt((xd*xd)+(yd*yd)));

                    if (this.links)
                    {
                        if (dist <= this.linkmax)
                        {
                            if (dist <= this.linksolid)
                            {
                                // SOLID
                                this.context.beginPath();
                                this.context.strokeStyle = this.fgLinkColor;
                                this.context.moveTo(this.points[i].x,this.points[i].y);
                                this.context.lineTo(this.points[z].x,this.points[z].y);
                                this.context.stroke();
                            }
                            else
                            {
                                // LIGHTNING!
                                perc = 100-Math.floor((dist-this.linksolid)/(this.linkmax-this.linksolid)*100);
                                rv = Math.floor(Math.random()*100)+1;
                                if (perc > rv)
                                {
                                    this.context.beginPath();
                                    this.context.strokeStyle = this.fgLinkLightColor;
                                    this.context.moveTo(this.points[i].x,this.points[i].y);
                                    this.context.lineTo(this.points[z].x,this.points[z].y);
                                    this.context.stroke();
                                }
                            }
                        }
                    }

                    if (this.collision && dist <= Math.floor((this.points[i].size+this.points[z].size)/2))
                    {
                        if (this.bothbounce)
                        {
                            this.bounce(i);
                            this.bounce(z);
                        }
                        else
                        {
                            b = i;
                            if (this.points[z].size > this.points[i].size)
                                b=z;
                            this.bounce(b);
                        }
                    }
                }
            }
        }

        for(i=0; i<this.points.length; ++i)
        {
            this.context.beginPath();
            this.context.arc(this.points[i].x, this.points[i].y, Math.floor(this.points[i].size/2),0,2*Math.PI);
            this.context.fillStyle = this.points[i].col == null ? this.fgColor : this.points[i].col;
            this.context.fill();
        }
    }

    this.bounce = function(i)
    {
        this.points[i].xv = 0-this.points[i].xv;
        this.points[i].yx = 0-this.points[i].yv;
    }

    this.poll = function()
    {
        for(i=0; i<self.points.length; ++i)
        {
            self.points[i].x += self.points[i].xv;
            self.points[i].y += self.points[i].yv;

            if (self.edgewrap)
            {
                if (self.points[i].x > self.xsize)
                    self.points[i].x = self.points[i].x - self.xsize;
                else if (self.points[i].x < 0)
                    self.points[i].x = self.points[i].x + self.xsize;

                if (self.points[i].y > self.ysize)
                    self.points[i].y = self.points[i].y - self.ysize;
                else if (self.points[i].y < 0)
                    self.points[i].y = self.points[i].y + self.ysize;
            }
            else
            {
                if (self.points[i].x > self.xsize)
                {
                    self.points[i].x = self.xsize;
                    self.points[i].xv = 0-self.points[i].xv;
                }
                else if (self.points[i].x < 0)
                {
                    self.points[i].x = 0;
                    self.points[i].xv = 0-self.points[i].xv;
                }

                if (self.points[i].y > self.ysize)
                {
                    self.points[i].y = self.ysize;
                    self.points[i].yv = 0-self.points[i].yv;
                }
                else if (self.points[i].y < 0)
                {
                    self.points[i].y = 0;
                    self.points[i].yv = 0-self.points[i].yv;
                }
            }
        }

        self.clear();
        self.draw();
    }

    this.start = function()
    {
        this.running = true;
        this.intervalvar = setInterval(this.poll, this.interval);
    }

    this.stop = function()
    {
        clearInterval(this.intervalvar);
        this.running = false;
    }
}
