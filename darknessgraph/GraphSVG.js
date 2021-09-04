import SVG from "./SVGHelper.js";

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

    getDataURL(){
        this.xoffset=this.fontSize*6;
        this.yoffset=this.fontSize;
        this.maxDev=this.cellWidth*3;

        return SVG.toDataURL(this.displayData(this.data));
    }
    
    getX(hour){
        return this.cellWidth*hour+this.xoffset;
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

    initImage(){
        const image=SVG.createSVG();
        const h=this.getY(this.data.length-2);
        this.height=h;

        image.appendChild(SVG.rect("#222255",0,0,this.getX(24),h)); //background
        image.appendChild(SVG.rect("white",0,0,this.xoffset,h)); //date label background
        image.appendChild(SVG.rect("white",0,0,this.getX(24),this.fontSize)); //hour label background

        image.setAttribute("width",this.getX(24));
        image.setAttribute("height",h);

        const defs=SVG.defs();
        const risingGradient=SVG.gradient();
        risingGradient.id="risingGradient";

        const stop1=SVG.stop();
        stop1.setAttribute("offset","0%");
        stop1.setAttribute("stop-color","red");
        stop1.setAttribute("stop-opacity",0);

        const stop2=SVG.stop();
        stop2.setAttribute("offset","100%");
        stop2.setAttribute("stop-color","red");

        risingGradient.appendChild(stop1);
        risingGradient.appendChild(stop2);

        const settingGradient=SVG.gradient();
        settingGradient.id="settingGradient";

        const stop3=SVG.stop();
        stop3.setAttribute("offset","0%");
        stop3.setAttribute("stop-color","red");

        const stop4=SVG.stop();
        stop4.setAttribute("offset","100%");
        stop4.setAttribute("stop-color","red");
        stop4.setAttribute("stop-opacity",0);

        settingGradient.appendChild(stop3);
        settingGradient.appendChild(stop4);

        defs.appendChild(settingGradient);
        defs.appendChild(risingGradient);
        image.appendChild(defs);
        

        return image;
    }

    displayData(data){
        this.image=this.initImage();

        for(let i=0;i<data.length-2;i++){
            const d=data[i];
            const dn=data[i+1];

            this.drawDateLabel(d.date,i);
            this.drawSun(d,dn,i);
            this.drawMoon(d,dn,i);

        }
        
        this.graphOther();
        this.drawGrid();

        return this.image;
    }

    pad(n){
        return (""+n).padStart(2,"0");
    }

    drawDateLabel(date,i){

        const formattedDate=(date.getYear()+1900)+"-"+(this.pad(date.getMonth()+1))+"-"+this.pad(date.getDate());

        const t=SVG.text("#969696",this.xoffset-5,this.getY(i),this.fontSize,formattedDate);
        t.setAttribute("text-anchor","end");

        if(date.getDate()==1){
            t.setAttribute("font-weight","bold");
            t.setAttribute("fill","black");
        }

        if(date.getDate()==1 || this.lineHeight>this.fontSize){
            this.image.appendChild(t);
        }
    }

    drawMoon(d,dn,i){
        if(!this.showMoon)return;

        const x0=this.getX(0);
        const x24=this.getX(24)
        const y=this.getY(i);
        const y2=this.getY(i+1);

        let moonR1=this.getX(this.hourToHour(d.moonRST[1],d.tz));
        let moonS1=this.getX(this.hourToHour(d.moonRST[2],d.tz));
        let moonR2=this.getX(this.hourToHour(dn.moonRST[1],dn.tz));
        let moonS2=this.getX(this.hourToHour(dn.moonRST[2],dn.tz));

        //const moonColor="rgba(255,255,255,.5)";
        const moonColor="rgba(255,255,255,"+(d.moonIllunination/4.0+.05)+")";
        if(moonR1>moonS1 && Math.abs(moonR1-moonR2)>this.maxDev){
            this.poly(moonColor,x0,y,moonS1,y,moonS2,y2,moonR2,y2);
        } else if(moonR1<moonS1){
            if(Math.abs(moonS1-moonS2)>this.maxDev){
                moonS2=x24;
            }
            this.poly(moonColor,moonR1,y,moonS1,y,moonS2,y2,moonR2,y2);
        } else {
            this.poly(moonColor,x0,y,moonS1,y,moonS2,y2,x0,y2);
            this.poly(moonColor,x24,y,moonR1,y,moonR2,y2,x24,y2);
        }
    }

    drawSun(d,dn,i){
        const x0=this.getX(0);
        const x24=this.getX(24)
        const y=this.getY(i);
        const y2=this.getY(i+1)+1;

        const sunR1=this.getX(this.hourToHour(d.sunRST[1],d.tz));
        const sunS1=this.getX(this.hourToHour(d.sunRST[2],d.tz));
        const sunR2=this.getX(this.hourToHour(dn.sunRST[1],dn.tz));
        const sunS2=this.getX(this.hourToHour(dn.sunRST[2],dn.tz));

        const twiR1=this.getX(this.hourToHour(d.astroTwilightRST[1],d.tz));
        const twiS1=this.getX(this.hourToHour(d.astroTwilightRST[2],d.tz));
        const twiR2=this.getX(this.hourToHour(dn.astroTwilightRST[1],dn.tz));
        const twiS2=this.getX(this.hourToHour(dn.astroTwilightRST[2],dn.tz));

        const sunColor="rgb(100,100,200)";

        if(d.sunRST[3]<=-1){
            //TODO: artic circle
            //never up
            //>=1 always up
        }
        if(this.showSun){
            if(Math.abs(sunR1-sunR2)>this.maxDev){
                this.poly(sunColor,x0,y,sunS1,y,sunS2,y2,x0,y2);
            }else if(Math.abs(sunS1-sunS2)>this.maxDev){
                this.poly(sunColor,sunR1,y,x24,y,x24,y2,sunR2,y2);
            } else if (sunS1<sunR1) {
                this.poly(sunColor,x0,y,sunS1,y,sunS2,y2,x0,y2);
                this.poly(sunColor,x24,y,sunR1,y,sunR2,y2,x24,y2);
            } else {
                this.poly(sunColor,sunR1,y,sunS1,y,sunS2,y2,sunR2,y2)
            }
        }
        
        if(this.showTwilight){
            if(Math.abs(sunS1-twiS1)<this.maxDev){
                this.poly("url(#settingGradient)",sunS1,y,twiS1,y,twiS2,y2,sunS2,y2);
            }

            if(Math.abs(sunR1-twiR1)<this.maxDev){
                this.poly("url(#risingGradient)",sunR1,y,twiR1,y,twiR2,y2,sunR2,y2);
            }
        }
    }

    graphOther(){
        for(let i=0;i<this.data.bodies.length;i++){
            const body=this.data.bodies[i];
            const hue=((i+1)*61)%360;
            const saturation="75";
            const color="hsl("+hue+","+saturation+"%,50%)";
            name="Body"+i;

            if(this.showRise) this.drawPath(color,body.name+" Rises",body.rise,"7 10",i);
            if(this.showSet) this.drawPath(color,body.name+" Sets",body.set,"",i);
            if(this.showTransit) this.drawPath(color,body.name+" Transits",body.transit,"3 3",i);
        }
    }

    drawPath(color,label,series,dashes,labelOffset){
        let path="";
        let lastX=this.getX(this.hourToHour(series[0][0]));
        let lastY=this.getY(series[0][1]);
        path+="M "+lastX+" "+lastY;

        for(let i=1;i<series.length-1;i++){

            const x=this.getX(this.hourToHour(series[i][0],5));
            const y=this.getY(series[i][1]);
            if(Math.abs(x-lastX)>this.maxDev){
                path+="M "+x+ " "+y;
            } else {
                path+="L "+x+ " "+y;
            }
            lastX=x;
            lastY=y;
        }
        const p=SVG.path(path,color);
        p.setAttribute("stroke-width","2");
        p.setAttribute("fill","none");
        p.setAttribute("stroke-dasharray",dashes);
        p.setAttribute("id","pathID"+label);
        this.image.appendChild(p);

        const textEl=SVG.createElement("text");
        const textPath=SVG.createElement("textPath");
        textPath.setAttribute("href","#pathID"+label);
        textPath.textContent=label;
        textPath.setAttribute("startOffset",this.getY(labelOffset*10)%this.height);

        textEl.appendChild(textPath);
        textEl.setAttribute("fill",color);
        textEl.setAttribute("font-size",this.fontSize*1.5);
        this.image.appendChild(textEl);
    }

    drawGrid(){
        const data=this.data;

        let color="rgba(255,255,255,.1)";

        //Hours
        let p="";
        for(let i=0;i<24;i++){
            p+=`M ${this.getX(i)} ${this.getY(0)} L ${this.getX(i)} ${this.height} `;
        }

        //Days
        if(this.lineHeight>3){
            for(let i=0;i<data.length-2;i++){
                if(this.data[i].date.getDate()==1 || this.lineHeight>this.fontSize){
                    p+=`M ${this.getX(0)} ${this.getY(i)} L ${this.getX(24)} ${this.getY(i)}`;
                }
            }
        }

        let path=SVG.path(p,color);
        this.image.appendChild(path);

        //Midnight line
        p=`M ${this.getX(12)} ${this.getY(0)} L ${this.getX(12)} ${this.height}`;
        path=SVG.path(p,color);
        path.setAttribute("stroke-width","2");

        this.image.appendChild(path);

        //Hour labels
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
                const t=SVG.text("black",this.getX(i),this.getY(0)-2,this.fontSize,text);
                t.setAttribute("text-anchor","begin");
                this.image.appendChild(t);
            }
        }
        return;

    }

    poly(color,x1,y1,x2,y2,x3,y3,x4,y4){
        const path=`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4}`;

        const p=SVG.path(path);
        p.setAttribute("fill",color);
        
        this.image.appendChild(p);

    }

}

