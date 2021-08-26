import * as svg from "./SVGHelper.js";

export default class Graph{

    constructor (data){
        this.lineHeight=11;
        this.fontSize=10;
        this.cellWidth=20;
        this.lineWidth=2;
        this.tzOverride=false;
        this.showSun=true;
        this.showMoon=true;
        this.showTwilight=true;

        this.data=data;

    }

    display(){
        this.xoffset=this.fontSize*6;
        this.yoffset=this.fontSize;
        this.maxDev=this.cellWidth*3;

        this.displayData(this.data);
    }
    
    getX(hour){
        const t=this.cellWidth*hour+this.xoffset;
        return t;
    }

    getY(i){
        return i*this.lineHeight+this.yoffset;
    }

    hourToHour(hour,tz){
        if(this.tzOverride!=false){
            tz=this.tzOverride;
        }
        let h=hour-tz-12;
        while(h<0)h+=24;
        while(h>24)h-=24;

        return h;
    }

    formatTime(date){
        let hours=date.getHours();
        let min=date.getMinutes();

        if(hours<10)hours="0"+hours;
        if(min<10)min="0"+min;

        return hours+":"+min;
    }

    initCanvas(){
        const canvas=document.createElement("CANVAS");
        this.canvas=canvas;
        canvas.addEventListener("mousemove",this.graphPopup);
        this.ctx = canvas.getContext("2d");
        const ctx=this.ctx;

        canvas.width=this.getX(24);
        canvas.height=this.getY(this.data.length-2);

        ctx.beginPath();
        ctx.fillStyle="#225";
        ctx.fillRect(this.xoffset,0,canvas.width,canvas.height);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle="white";
        ctx.fillRect(this.getX(24),0,this.getX(24)+(10*6*2),canvas.height);
        ctx.fill();
        
        ctx.imageSmoothingEnabled = true;

        return canvas;
    }

    displayData(data){
        const canvas=this.initCanvas();

        for(let i=0;i<data.length-2;i++){
            const d=data[i];
            const dn=data[i+1];

            this.drawDateLabel(d.date,i);
            this.drawSun(d,dn,i);
            this.drawMoon(d,dn,i);

        }
        this.graphOther();
        this.drawGrid();
        document.getElementById("output").appendChild(canvas);
    }

    drawDateLabel(date,i){
        const formattedDate=(date.getYear()+1900)+"-"+(date.getMonth()+1)+"-"+date.getDate();
        this.ctx.font=this.fontSize+"px sans-serif";
        this.ctx.fillStyle="rgb(150,150,150)";
        if(date.getDate()==1){
            this.ctx.font="bold "+this.fontSize+"px sans-serif";
            this.ctx.fillStyle="rgb(0,0,0)";
        }

        if(date.getDate()==1 || this.lineHeight>this.fontSize){
            this.ctx.textAlign="right";
            this.ctx.fillText(formattedDate,this.xoffset-5,this.getY(i));
        }
    }

    drawMoon(d,dn,i){
        if(!this.showMoon)return;

        const ctx=this.ctx;
        const x0=this.getX(0);
        const x24=this.getX(24)
        const y=this.getY(i);
        const y2=this.getY(i+1)

        let moonR1=this.getX(this.hourToHour(d.moonRST[1],d.tz));
        let moonS1=this.getX(this.hourToHour(d.moonRST[2],d.tz));
        let moonR2=this.getX(this.hourToHour(dn.moonRST[1],dn.tz));
        let moonS2=this.getX(this.hourToHour(dn.moonRST[2],dn.tz));

        //const moonColor="rgba(255,255,255,.5)";
        const moonColor="rgba(255,255,255,"+d.moonIllunination/4.0+")";
        if(moonR1>moonS1 && Math.abs(moonR1-moonR2)>this.maxDev){
            this.poly(moonColor,ctx,x0,y,moonS1,y,moonS2,y2,moonR2,y2);
        } else if(moonR1<moonS1){
            if(Math.abs(moonS1-moonS2)>this.maxDev){
                moonS2=x24;
            }
            this.poly(moonColor,ctx,moonR1,y,moonS1,y,moonS2,y2,moonR2,y2);
        } else {
            this.poly(moonColor,ctx,x0,y,moonS1,y,moonS2,y2,x0,y2);
            this.poly(moonColor,ctx,x24,y,moonR1,y,moonR2,y2,x24,y2);
        }
    }

    drawSun(d,dn,i){
        const ctx=this.ctx;
        const x0=this.getX(0);
        const x24=this.getX(24)
        const y=this.getY(i);
        const y2=this.getY(i+1)

        const sunR1=this.getX(this.hourToHour(d.sunRST[1],d.tz));
        const sunS1=this.getX(this.hourToHour(d.sunRST[2],d.tz));
        const sunR2=this.getX(this.hourToHour(dn.sunRST[1],dn.tz));
        const sunS2=this.getX(this.hourToHour(dn.sunRST[2],dn.tz));

        const twiR1=this.getX(this.hourToHour(d.astroTwilightRST[1],d.tz));
        const twiS1=this.getX(this.hourToHour(d.astroTwilightRST[2],d.tz));
        const twiR2=this.getX(this.hourToHour(dn.astroTwilightRST[1],dn.tz));
        const twiS2=this.getX(this.hourToHour(dn.astroTwilightRST[2],dn.tz));

        //const sunColor="rgb(175,175,0)";
        const sunColor="rgb(100,100,200)";

        if(d.sunRST[3]<=-1){
            //TODO: artic circle
            //never up
            //>=1 always up
        }
        if(this.showSun){
            if(Math.abs(sunR1-sunR2)>this.maxDev){
                this.poly(sunColor,ctx,x0,y,sunS1,y,sunS2,y2,x0,y2);
            }else if(Math.abs(sunS1-sunS2)>this.maxDev){
                this.poly(sunColor,ctx,sunR1,y,x24,y,x24,y2,sunR2,y2);
            } else if (sunS1<sunR1) {
                this.poly(sunColor,ctx,x0,y,sunS1,y,sunS2,y2,x0,y2);
                this.poly(sunColor,ctx,x24,y,sunR1,y,sunR2,y2,x24,y2);
            } else {
                this.poly(sunColor,ctx,sunR1,y,sunS1,y,sunS2,y2,sunR2,y2)
            }
        }
        
        if(this.showTwilight){
            if(Math.abs(sunS1-twiS1)<this.maxDev){
                const gradient1=ctx.createLinearGradient(sunS1,y,twiS1,y2);
                gradient1.addColorStop(0,"red");
                gradient1.addColorStop(1,"rgba(50,0,0,0)");
                this.poly(gradient1,ctx,sunS1,y,twiS1,y,twiS2,y2,sunS2,y2);
            }

            if(Math.abs(sunR1-twiR1)<this.maxDev){
                const gradient2=ctx.createLinearGradient(sunR1,y,twiR1,y2);
                gradient2.addColorStop(0,"red");
                gradient2.addColorStop(1,"rgba(50,0,0,0)");
                this.poly(gradient2,ctx,sunR1,y,twiR1,y,twiR2,y2,sunR2,y2);
            }
        }
    }

    graphOther(){
        const ctx=this.ctx;
        const data=this.data;

        ctx.lineWidth=this.lineWidth;
        for(let j=0;j<data[0].other.length;j++){
            const hue=((j+1)*61)%360;
            const saturation="75";
            ctx.strokeStyle="hsl("+hue+","+saturation+"%,50%)";
            ctx.setLineDash([7,10]);
            this.drawPath(j,1);

            ctx.setLineDash([]);
            this.drawPath(j,2);

            ctx.setLineDash([3,3]);
            this.drawPath(j,0);
        }
        ctx.setLineDash([]);
    }

    drawPath(j,v){
        this.ctx.beginPath();
        let lastX=this.getX(this.hourToHour(this.data[0].other[j][v]));
        this.ctx.moveTo(lastX,this.getY(1));
        for(let i=1;i<this.data.length-1;i++){
            const d=this.data[i];
            const dn=this.data[i+1];

            const x=this.getX(this.hourToHour(dn.other[j][v],d.tz));
            if(Math.abs(x-lastX)>this.maxDev){
                this.ctx.moveTo(x,this.getY(i));
            } else {
                this.ctx.lineTo(x,this.getY(i));
            }
            lastX=x;
        }
        this.ctx.stroke();
    }

    drawGrid(){
        const canvas=this.canvas;
        const data=this.data;
        const ctx = this.ctx;

        ctx.beginPath();
        ctx.strokeStyle="rgba(100,100,100,.3)";
        ctx.lineWidth=1;
        //Hours
        for(let i=0;i<24;i++){
            ctx.moveTo(this.getX(i),0);
            ctx.lineTo(this.getX(i),canvas.height);
    
        }

        //Days
        if(this.lineHeight>3){
            for(let i=0;i<data.length-2;i++){
                ctx.moveTo(this.getX(0),this.getY(i));
                ctx.lineTo(this.getX(24),this.getY(i));
            }
        }
        ctx.stroke();

        //Midnight line
        ctx.beginPath();
        ctx.lineWidth=2;
        ctx.moveTo(this.getX(12),0);
        ctx.lineTo(this.getX(12),canvas.height);
        ctx.stroke();
        ctx.lineWidth=1;

        //Clear box for hour labels
        ctx.beginPath();
        ctx.fillStyle="white";
        ctx.fillRect(0, 0, canvas.width, this.getY(1));
        ctx.stroke();

        //Hour labels
        ctx.fillStyle="black";
        ctx.textAlign="left";
        for(let i=0;i<24;i++){
            let hour=i-12;
            let ap="a";
            if(hour<0){
                ap="p";
                hour=12+hour;
            }
            if(hour==0){
                hour=12;
            }

            let text=hour+ap;

            if(this.cellWidth>this.fontSize*1.5 || hour%2==0){
                ctx.fillText(text,this.getX(i),this.getY(1)-2);
            }
        }
    }

    poly(color,ctx,x1,y1,x2,y2,x3,y3,x4,y4){
        ctx.beginPath();
        ctx.fillStyle=color;
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.lineTo(x3,y3);
        ctx.lineTo(x4,y4);
        ctx.closePath();
        ctx.fill();

    }

}

