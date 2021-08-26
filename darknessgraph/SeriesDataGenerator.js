import * as astro from "./astro.js";
import vsop87a from "./vsop87a_small.js";

const torad=Math.PI/180.0;

export default class SeriesDataGenerator {
    static generateRiseSetTimes(startJD,count,lat,lon,selectedConstellations, selectedMessier, selectedPlanets){

        const data=new Array();
        for(let i=0;i<count+4;i++){
            let jd=startJD+i;
            const t={};
            t.jd=jd;

            const earth=this.getPlanetPos(10,jd);

            t.sun=astro.xyzToRaDec(this.sub([0,0,0],earth));
    
            t.sunRST=astro.getRiseSet(jd,lat,lon,t.sun[0],t.sun[1],-0.8333);
            t.civilTwilightRST=astro.getRiseSet(jd,lat,lon,t.sun[0],t.sun[1],-6.0);
            t.astroTwilightRST=astro.getRiseSet(jd,lat,lon,t.sun[0],t.sun[1],-18.0);
    
            const moon=this.getPlanetPos(11,jd);

            t.moon=astro.xyzToRaDec(this.sub(moon,earth));
            t.moonRST=astro.getRiseSet(jd,lat,lon,t.moon[0],t.moon[1],0.125);
            /*
            TODO: recompute moon RST for actual rise and set time position
            const moonR=getGeocentricMoonPos(jd+t.moonRST[1]/24.0);
            t.moonRST[1]=getRiseSet(jd,lat,lon,moonR[0],moonR[1],0.125)[1];
            const moonS=getGeocentricMoonPos(jd+t.moonRST[2]/24.0);
            t.moonRST[2]=getRiseSet(jd,lat,lon,moonS[0],moonS[1],0.125)[2];
            */
    
            t.other=new Array();
            for(let i=0;i<selectedConstellations.length;i++){
                t.other[i]=astro.getRiseSet(jd,lat,lon,astro.constellations[selectedConstellations[i]][2]*15*torad,astro.constellations[selectedConstellations[i]][3]*torad,0);
            }
    
            for(let i=0;i<selectedMessier.length;i++){
                t.other[i+selectedConstellations.length]=astro.getRiseSet(jd,lat,lon,astro.messier[selectedMessier[i]].ra*15*torad,astro.messier[selectedMessier[i]].dec*torad,0);
            }

            for(let i=0;i<selectedPlanets.length;i++){
                const planet=selectedPlanets[i];

                if(planet!=0 && planet!=1 && planet!=2){
                    const heliocentric=this.getPlanetPos(planet-0,jd);
                    const geocentric=this.sub(heliocentric,earth);
                    const radec=astro.xyzToRaDec(geocentric);
                    const rst=astro.getRiseSet(jd,lat,lon,radec[0],radec[1],0);
                    t.other[i-3+selectedConstellations.length+selectedMessier.length]=rst;
                }
            }
    
            t.moonIllunination=astro.getIlluminatedFractionOfMoon(jd);
            t.date=new Date(astro.UnixTimeFromJulianDate(jd));
            t.tz=t.date.getTimezoneOffset()/60.0;
    
            data[i]=t;
        }
        return data;
    }
    
    static sub(a,b){
        const t=new Array();
        for(let i=0;i<a.length;i++){
            t[i]=a[i]-b[i];
        }
        return t;
    }

    static getPlanetPos(p,jd){
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