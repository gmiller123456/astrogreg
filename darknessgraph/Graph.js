class Graph{

    constructor (data){
        this.lineHeight=11;
        this.cellWidth=2;
        this.offset=10*6;

        this.displayData(data);
    
    
    }
    
    isUp(object, hour){
        const t=object[0];
        const r=object[1];
        const s=object[2];

        if(object[3]<-1) return true;
        if(object[3]>1) return false;

        if(r<s){
            if(hour<r) return false;
            if(hour>s) return false;
            return true;
        } else {
            if(hour<s) return true;
            if(hour>r) return true;
            return false;
        }
    }

    graphPopup(e){
        //const f=document.getElementById("follow");
        //f.style.left=e.pageX+20+"px";
        //f.style.top=e.pageY-20+"px";
    }

    getX(hour){

    }

    displayData(data){
        const canvas=document.createElement("CANVAS");
        canvas.addEventListener("mousemove",this.graphPopup);
        const ctx = canvas.getContext("2d");

        canvas.width=this.cellWidth*24*8+this.offset;
        canvas.height=data.length*this.lineHeight;
        canvas.style.border="solid 1px";

        ctx.beginPath();
        ctx.fillStyle="#225";
        ctx.fillRect(this.offset,0,canvas.width,canvas.height);
        ctx.fill();

        for(let i=0;i<data.length;i++){
            const date=new Date(UnixTimeFromJulianDate(data[i].jd));
            const tz=date.getTimezoneOffset()/60.0;

            const formattedDate=(date.getYear()+1900)+"-"+(date.getMonth()+1)+"-"+date.getDate();

            //dc.innerText=formattedDate;
            ctx.fillStyle="black";
            ctx.textAlign="right";
            ctx.fillText(formattedDate,this.offset-5,i*this.lineHeight+this.lineHeight);

            let j=0;
            while(j<24){
                let hour=j+tz-12;
                while(hour<0)hour+=24;
                while(hour>24)hour-=24;

                let color="#225";

                if(this.isUp(data[i].sunRST,hour)){
                    color="yellow";
                } else if(this.isUp(data[i].civilTwilightRST,hour)){
                    color="rgb(255,0,0)";
                } else if(this.isUp(data[i].astroTwilightRST,hour)){
                    color="#822";
                } else if(this.isUp(data[i].moonRST,hour)){
                    const temp=Math.floor(data[i].moonIllunination*10);
                    color="rgba(255,255,255,"+data[i].moonIllunination/2.0+")";
                }
                
                ctx.beginPath();
                ctx.fillStyle=color;
                ctx.fillRect(this.cellWidth*j*8+this.offset,i*this.lineHeight,this.cellWidth,this.lineHeight);
                ctx.fill();

                j+=.125;
            }
        }

        document.getElementById("output").appendChild(canvas);
    }
}

