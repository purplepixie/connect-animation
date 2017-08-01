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
}

function ConnectAnimation(canvas_id)
{
    var self = this;
    this.points = Array();
    this.canvas_id = canvas_id;
    this.canvas = null;
    this.context = null;

    this.bgColor = 'white';
    this.fgColor = '#c0c0c0';
    this.fgLinkColor = '#c0c0c0';
    this.fgLinkLightColor = '#c0e0c0';

    this.numPoints = 50;

    this.autoscale = false;
    this.xsize = 0;
    this.ysize = 0;

    this.xspeedmax = 10;
    this.yspeedmax = 10;

    this.links = true;
    this.linkmax = 150;
    this.linksolid = 75;

    this.running = false;
    this.interval = 50;
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
            size = 10;
            xv = Math.floor(Math.random() * (this.xspeedmax*2)) - this.xspeedmax + 1;
            yv = Math.floor(Math.random() * (this.yspeedmax*2)) - this.yspeedmax + 1;

            p = new Point(x,y,size,xv,yv);
            this.points.push(p);
        }

        this.clear();
        this.draw();
    }

    this.resize = function()
    {
        if (this.autoscale)
        {
            this.context.canvas.width = window.innerWidth;
            this.context.canvas.height = window.innerHeight;
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
            if (this.links)
            {
                for(z=i+1; z<this.points.length; z++)
                {
                    xd = this.points[i].x - this.points[z].x;
                    yd = this.points[i].y - this.points[z].y;
                    if (xd<0) xd=0-xd;
                    if (yd<0) yd=0-yd;
                    dist = Math.floor(Math.sqrt((xd*xd)+(yd*yd)));
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
                            rv = Math.floor(Math.random()*10)+1;
                            if (rv > 5)
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
            }
        }

        for(i=0; i<this.points.length; ++i)
        {
            this.context.beginPath();
            this.context.arc(this.points[i].x, this.points[i].y, Math.floor(this.points[i].size/2),0,2*Math.PI);
            this.context.fillStyle = this.fgColor;
            this.context.fill();
        }
    }

    this.poll = function()
    {
        for(i=0; i<self.points.length; ++i)
        {
            self.points[i].x += self.points[i].xv;
            self.points[i].y += self.points[i].yv;

            if (self.points[i].x > self.xsize)
                self.points[i].x = self.points[i].x - self.xsize;
            if (self.points[i].x < 0)
                self.points[i].x = self.points[i].x + self.xsize;
            if (self.points[i].y > self.ysize)
                self.points[i].y = self.points[i].y - self.ysize;
                if (self.points[i].y < 0)
                    self.points[i].y = self.points[i].y + self.ysize;
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
