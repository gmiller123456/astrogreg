import * as astro from "./astro.js";
import vsop87a from "./vsop87a_small.js";

const torad=Math.PI/180.0;

const planets=["Sun","Twilight","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune"];

export default class SeriesDataGenerator {
    constructor(startJD, count, lat, lon, selectedConstellations, selectedMessier, selectedPlanets){
        this.startJD=startJD;
        this.count=count;
        this.lat=lat;
        this.lon=lon;
        this.selectedConstellations=selectedConstellations;
        this.selectedMessier=selectedMessier;
        this.selectedPlanets=selectedPlanets;
        this.data={};
    }

    getMoonData(){
    }

    getSunData(){
        /*
        let i=0;
        const sunRise=new Array();
        const sunSet=new Array();
        const sunTransit=new Array();

        const civilTwilightStart=new Array();
        const civilTwilightStop=new Array();
        const naughticalTwilightStart=new Array();
        const naughticalTwilightStop=new Array();
        const astroTwilightStart=new Array();
        const astroTwilightStop=new Array();
        
        while(i<this.count){
            const jd=this.startJD+i;

            const sun=this.sub([0,0,0],this.data.earth[jd].vector);
            const radec=astro.xyzToRaDec(sun);
            
            const sunRST=astro.getRiseSet(jd,this.lat,this.lon,radec[0],radec[1],-0.8333);
            const civilTwilightRST=astro.getRiseSet(jd,this.lat,this.lon,radec[0],radec[1],-6.0);
            const naughticalTwilightRST=astro.getRiseSet(jd,lat,lon,radec[0],radec[1],-12.0);
            const astroTwilightRST=astro.getRiseSet(jd,lat,lon,radec[0],radec[1],-18.0);

            let sunRiseTime=-1;
            let sunSetTime=-1;
            if(sunRST[3]>-1 && sunRST[3]<1){
                sunRiseTime=sunRST[1];
                sunSetTime=sunRST[2];
                sunRise[sunRise.length]=[jd,sunRST[1]];
                sunSet[sunSet.length]=[jd,sunRST[2]];
            }
            sunTransit[sunTransit.length]=[jd,sunRST[0]];

            if(civilTwilightRST[3]>-1 && civilTwilightRST[3]<1){
                civilTwilightStart[civilTwilightRST.length]=[jd,sunRiseTime,civilTwilightRST[1]];
                civilTwilightStop[civilTwilightRST.length]=[jd,sunSetTime,civilTwilightRST[2]];
            }

            if(naughticalTwilightRST[3]>-1 && naughticalTwilightRST[3]<1){
                naughticalTwilightStart[naughticalTwilightStop.length]=[jd,sunRiseTime,naughticalTwilightRST[1]];
                naughticalTwilightStop[naughticalTwilightStop.length]=[jd,sunSetTime,naughticalTwilightRST[2]];
            }

            if(astroTwilightRST[3]>-1 && astroTwilightRST[3]<1){
                astroTwilightStart[astroTwilightStart.length]=[jd,sunRiseTime,astroTwilightRST[1]];
                astroTwilightStop[astroTwilightStart.length]=[jd,sunSetTime,astroTwilightRST[2]];
            }

            i++;
        }
        return ;
        */
    }

    getEarthPositions(){
        let jd=this.startJD;
        const t=new Array();
        while(jd<this.startJD+this.count){
            const earth=this.getPlanetPos(10,jd);
            const radec=astro.xyzToRaDec(earth);

            t[jd]={};
            t[jd].vector=earth;
            t[jd].ra=radec[0];
            t[jd].dec=radec[1];
            jd++;
        }
        return t;
    }

    getStaticSeries(ra,dec){
        const body={};
        const transit=new Array();
        const rise=new Array();
        const set=new Array();

        for(let i=0;i<this.count;i++){
            const jd=this.startJD+i;

            const rst=astro.getRiseSet(jd,this.lat,this.lon,ra,dec,0);

            transit[transit.length]=[rst[0],i];
            if(rst[3]<=1 && rst[3]>=-1){
                rise[rise.length]=[rst[1],i];
                set[set.length]=[rst[2],i];
            }
        }

        body.transit=transit;
        body.rise=rise;
        body.set=set;

        return body;
    }

    getBodyData(){

        const bodies=new Array();
        
        for(let i=0;i<this.selectedConstellations.length;i++){
            const body=this.getStaticSeries(astro.constellations[this.selectedConstellations[i]][2]*15*torad,astro.constellations[this.selectedConstellations[i]][3]*torad);
            body.name=astro.constellations[this.selectedConstellations[i]][1];
            bodies[bodies.length]=body;
        }

        for(let i=0;i<this.selectedMessier.length;i++){
            const body=this.getStaticSeries(astro.messier[this.selectedMessier[i]].ra*15*torad,astro.messier[this.selectedMessier[i]].dec*torad);
            body.name=astro.messier[this.selectedMessier[i]].id;
            bodies[bodies.length]=body;
        }

        return bodies;
    }

    getPlanetSeries(planet){
        const body={};
        const transit=new Array();
        const rise=new Array();
        const set=new Array();

        for(let i=0;i<this.count;i++){
            const jd=this.startJD+i;

            const earth=this.data.earth[jd].vector;
            const heliocentric=this.getPlanetPos(planet-0,jd);
            const geocentric=this.sub(heliocentric,earth);
            const radec=astro.xyzToRaDec(geocentric);
            const rst=astro.getRiseSet(jd,this.lat,this.lon,radec[0],radec[1],0);

            transit[transit.length]=[rst[0],i];
            if(rst[3]<=1 && rst[3]>=-1){
                rise[rise.length]=[rst[1],i];
                set[set.length]=[rst[2],i];
            }
        }

        body.transit=transit;
        body.rise=rise;
        body.set=set;

        return body;

    }

    getPlanetData(){
        const bodies=new Array();

        for(let i=0;i<this.selectedPlanets.length;i++){
            const planet=this.selectedPlanets[i];

            if(planet!=0 && planet!=1 && planet!=2){

                const body=this.getPlanetSeries(this.selectedPlanets[i]);
                body.name=planets[this.selectedPlanets[i]];
                bodies[bodies.length]=body;
            }
        }
        return bodies;
    }


    generateRiseSetTimes(){

        const data=new Array();
        this.data=data;
        data.earth=this.getEarthPositions();
        data.moon=this.getMoonData();
        data.sun=this.getSunData();
        data.bodies=this.getBodyData();
        data.bodies=data.bodies.concat(this.getPlanetData());

        for(let i=0;i<this.count+4;i++){
            let jd=this.startJD+i;
            const t={};
            t.jd=jd;

            const earth=this.getPlanetPos(10,jd);

            t.sun=astro.xyzToRaDec(this.sub([0,0,0],earth));
    
            t.sunRST=astro.getRiseSet(jd,this.lat,this.lon,t.sun[0],t.sun[1],-0.8333);
            t.civilTwilightRST=astro.getRiseSet(jd,this.lat,this.lon,t.sun[0],t.sun[1],-6.0);
            t.astroTwilightRST=astro.getRiseSet(jd,this.lat,this.lon,t.sun[0],t.sun[1],-18.0);
    
            const moon=this.getPlanetPos(11,jd);

            t.moon=astro.xyzToRaDec(this.sub(moon,earth));
            t.moonRST=astro.getRiseSet(jd,this.lat,this.lon,t.moon[0],t.moon[1],0.125);
            /*
            TODO: recompute moon RST for actual rise and set time position
            const moonR=getGeocentricMoonPos(jd+t.moonRST[1]/24.0);
            t.moonRST[1]=getRiseSet(jd,lat,lon,moonR[0],moonR[1],0.125)[1];
            const moonS=getGeocentricMoonPos(jd+t.moonRST[2]/24.0);
            t.moonRST[2]=getRiseSet(jd,lat,lon,moonS[0],moonS[1],0.125)[2];
            */
    
            t.moonIllunination=astro.getIlluminatedFractionOfMoon(jd);
            t.date=new Date(astro.UnixTimeFromJulianDate(jd));
            t.tz=t.date.getTimezoneOffset()/60.0;
    
            data[i]=t;
        }
        return data;
    }
    
    sub(a,b){
        const t=new Array();
        for(let i=0;i<a.length;i++){
            t[i]=a[i]-b[i];
        }
        return t;
    }

    getPlanetPos(p,jd){
        const t = (jd - 2451545.0) / 365250.0;
        let pos;

        switch (p){
            case 3:
                pos=vsop87a.getMercury(t);
                break;
            case 4:
                pos=vsop87a.getVenus(t);
                break;
            case 5:
                pos=vsop87a.getMars(t);
                break;
            case 6:
                pos=vsop87a.getJupiter(t);
                break;
            case 7:
                pos=vsop87a.getSaturn(t);
                break;
            case 8:
                pos=vsop87a.getUranus(t);
                break;
            case 9:
                pos=vsop87a.getNeptune(t);
                break;
            case 10:
                pos=vsop87a.getEarth(t);
                break;
            case 11:
                const e=vsop87a.getEarth(t);
                const emb=vsop87a.getEmb(t);

                pos=vsop87a.getMoon(e,emb);
                break;
        }
        return vsop87a.rotvsop2J2000(pos);
    }

}