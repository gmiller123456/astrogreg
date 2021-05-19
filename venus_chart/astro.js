/*
Greg Miller gmiller@gregmiller.net 2021
http://www.celestialprogramming.com/
Released as public domain
*/

class astro{

static data1800to2050 = [ //https://ssd.jpl.nasa.gov/txt/p_elem_t1.txt
    //Mercury
            [[ 0.38709927,      0.20563593,      7.00497902,      252.25032350,     77.45779628,     48.33076593],
             [ 0.00000037,      0.00001906,     -0.00594749,   149472.67411175,      0.16047689,     -0.12534081]],
    //Venus,
            [[ 0.72333566,      0.00677672,      3.39467605,      181.97909950,    131.60246718,     76.67984255],
             [ 0.00000390,     -0.00004107,     -0.00078890,    58517.81538729,      0.00268329,     -0.27769418]],
    //EM Bary,
            [[ 1.00000261,      0.01671123,     -0.00001531,      100.46457166,    102.93768193,      0.0],
             [ 0.00000562,     -0.00004392,     -0.01294668,    35999.37244981,      0.32327364,      0.0]],
    //Mars,
            [[ 1.52371034,      0.09339410,      1.84969142,       -4.55343205,    -23.94362959,     49.55953891],
             [ 0.00001847,      0.00007882,     -0.00813131,    19140.30268499,      0.44441088,     -0.29257343]],
    //Jupiter,
            [[ 5.20288700,      0.04838624,      1.30439695,       34.39644051,     14.72847983,    100.47390909],
             [-0.00011607,     -0.00013253,     -0.00183714,     3034.74612775,      0.21252668,      0.20469106]],
    //Saturn,
            [[ 9.53667594,      0.05386179,      2.48599187,       49.95424423,     92.59887831,    113.66242448],
             [-0.00125060,     -0.00050991,      0.00193609,     1222.49362201,     -0.41897216,     -0.28867794]],
    //Uranus,
            [[19.18916464,      0.04725744,      0.77263783,      313.23810451,    170.95427630,     74.01692503],
             [-0.00196176,     -0.00004397,     -0.00242939,      428.48202785,      0.40805281,      0.04240589]],
    //Neptune,
            [[30.06992276,      0.00859048,      1.77004347,      -55.12002969,     44.96476227,    131.78422574],
             [ 0.00026291,      0.00005105,      0.00035372,      218.45945325,     -0.32241464,     -0.00508664]],
    //Pluto,
            [[39.48211675,      0.24882730,     17.14001206,      238.92903833,    224.06891629,    110.30393684],
             [-0.00031596,      0.00005170,      0.00004818,      145.20780515,     -0.04062942,     -0.01183482]]
    ];
    
static data3000BCto3000AD = [ //https://ssd.jpl.nasa.gov/txt/p_elem_t2.txt
    //Mercury  
            [[ 0.38709843,      0.20563661,      7.00559432,      252.25166724,     77.45771895,     48.33961819],
             [ 0.00000000,      0.00002123,     -0.00590158,   149472.67486623,      0.15940013,     -0.12214182]],
    //Venus    
            [[ 0.72332102,      0.00676399,      3.39777545,      181.97970850,    131.76755713,     76.67261496],
             [-0.00000026,     -0.00005107,      0.00043494,    58517.81560260,      0.05679648,     -0.27274174]],
    //EM Bary  
            [[ 1.00000018,      0.01673163,     -0.00054346,      100.46691572,    102.93005885,     -5.11260389],
             [-0.00000003,     -0.00003661,     -0.01337178,    35999.37306329,      0.31795260,     -0.24123856]],
    //Mars     
            [[ 1.52371243,      0.09336511,      1.85181869,       -4.56813164,    -23.91744784,     49.71320984],
             [ 0.00000097,      0.00009149,     -0.00724757,    19140.29934243,      0.45223625,     -0.26852431]],
    //Jupiter  
            [[ 5.20248019,      0.04853590,      1.29861416,       34.33479152,     14.27495244,    100.29282654],
             [-0.00002864,      0.00018026,     -0.00322699,     3034.90371757,      0.18199196,      0.13024619]],
    //Saturn   
            [[ 9.54149883,      0.05550825,      2.49424102,       50.07571329,     92.86136063,    113.63998702],
             [-0.00003065,     -0.00032044,      0.00451969,     1222.11494724,      0.54179478,     -0.25015002]],
    //Uranus   
            [[19.18797948,      0.04685740,      0.77298127,      314.20276625,    172.43404441,     73.96250215],
             [-0.00020455,     -0.00001550,     -0.00180155,      428.49512595,      0.09266985,      0.05739699]],
    //Neptune  
            [[30.06952752,      0.00895439,      1.77005520,      304.22289287,     46.68158724,    131.78635853],
             [ 0.00006447,      0.00000818,      0.00022400,      218.46515314,      0.01009938,     -0.00606302]],
    //Pluto    
            [[39.48686035,      0.24885238,     17.14104260,      238.96535011,    224.09702598,    110.30167986],
             [ 0.00449751,      0.00006016,      0.00000501,      145.18042903,     -0.00968827,     -0.00809981]],
    ];
    
    //            b             c             s            f 
    static extraTerms = [
       [-0.00012452,    0.06064060,   -0.35635438,   38.35125000], //Jupiter
       [ 0.00025899,   -0.13434469,    0.87320147,   38.35125000], //Saturn
       [ 0.00058331,   -0.97731848,    0.17689245,    7.67025000], //Uranus
       [-0.00041348,    0.68346318,   -0.10162547,    7.67025000], //Neptune
       [-0.01262724,    0,             0,             0,]          //Pluto
    ];
    
    static planetNames=["Mercury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto","Sun"];
    
    static computePlanetPosition(jd,elements,rates,extraTerms){
        const toRad=Math.PI/180;
        //Algorithm from Explanatory Supplement to the Astronomical Almanac ch8 P340
        //Step 1:
        const T=(jd-2451545.0)/36525;
        let a=elements[0]+rates[0]*T;
        let e=elements[1]+rates[1]*T;
        let I=elements[2]+rates[2]*T;
        let L=elements[3]+rates[3]*T;
        let w=elements[4]+rates[4]*T;
        let O=elements[5]+rates[5]*T;
    
        //Step 2:
        let ww=w-O;
        let M=L - w;
        if(extraTerms.length > 0){
            const b=extraTerms[0];
            const c=extraTerms[1];
            const s=extraTerms[2];
            const f=extraTerms[3];
            M=L - w + b*T*T + c*Math.cos(f*T*toRad) + s*Math.sin(f*T*toRad);
        }
    
        while(M>180){M-=360;}
    
        let E=M+57.29578*e*Math.sin(M*toRad);
        let dE=1;
        let n=0;
        while(dE>1e-7 && n<10){
            dE=this.SolveKepler(M,e,E);
            E+=dE;
            n++;
        }
    
        //Step 4:
        const xp=a*(Math.cos(E*toRad)-e);
        const yp=a*Math.sqrt(1-e*e)*Math.sin(E*toRad);
        const zp=0;
    
        //Step 5:
        a*=toRad; e*=toRad; I*=toRad; L*=toRad; ww*=toRad; O*=toRad;
        const xecl=(Math.cos(ww)*Math.cos(O)-Math.sin(ww)*Math.sin(O)*Math.cos(I))*xp + (-Math.sin(ww)*Math.cos(O)-Math.cos(ww)*Math.sin(O)*Math.cos(I))*yp;
        const yecl=(Math.cos(ww)*Math.sin(O)+Math.sin(ww)*Math.cos(O)*Math.cos(I))*xp + (-Math.sin(ww)*Math.sin(O)+Math.cos(ww)*Math.cos(O)*Math.cos(I))*yp;
        const zecl=(Math.sin(ww)*Math.sin(I))*xp + (Math.cos(ww)*Math.sin(I))*yp;
    
        //Step 6:
        const eps=23.43928*toRad;
    
        const x=xecl;
        const y=Math.cos(eps)*yecl - Math.sin(eps)*zecl;
        const z=Math.sin(eps)*yecl + Math.cos(eps)*zecl;
    
        return [x,y,z];
    }
    
    static SolveKepler(M,e,E){
        const toRad=Math.PI/180;
    
        const dM=M - (E-e/toRad*Math.sin(E*toRad));
        const dE=dM/(1-e*Math.cos(E*toRad));
        return dE;
    
    }

    //Special "Math.floor()" function used by dateToJulianDate()
    static INT(d){
        if(d>0){
            return Math.floor(d);
        }
        if(d==Math.floor(d)){
            return d;
        }
        return Math.floor(d)-1;
    }

    static gregorianDateToJulianDate(year, month, day, hour, min, sec){
        let isGregorian=true;
        if(year<1582 || (year == 1582 && (month < 10 || (month==10 && day < 5)))){
            isGregorian=false;
        }

        if (month < 3){
            year = year - 1;
            month = month + 12;
        }

        let b = 0;
        if (isGregorian){
        let a = this.INT(year / 100.0);
            b = 2 - a + this.INT(a / 4.0);
        }

        let jd=this.INT(365.25 * (year + 4716)) + this.INT(30.6001 * (month + 1)) + day + b - 1524.5;
        jd+=hour/24.0;
        jd+=min/24.0/60.0;
        jd+=sec/24.0/60.0/60.0;
        return jd;
    }	

    //All input and output angles are in radians, jd is Julian Date in UTC
    static raDecToAltAz(ra,dec,lat,lon,jd_ut){
        //Meeus 13.5 and 13.6, modified so West longitudes are negative
        const gmst=this.greenwichMeanSiderealTime(jd_ut);
        let localSiderealTime=(gmst+lon)%(2*Math.PI);
        
            
        let H=(localSiderealTime - ra);
        if(H<0){H+=2*Math.PI;}
        if(H>Math.PI){H=H-2*Math.PI;}
    
        let az = (Math.atan2(Math.sin(H), Math.cos(H)*Math.sin(lat) - Math.tan(dec)*Math.cos(lat)));
        let a = (Math.asin(Math.sin(lat)*Math.sin(dec) + Math.cos(lat)*Math.cos(dec)*Math.cos(H)));
        az-=Math.PI;

    
        if(az<0){az+=2*Math.PI;}
        return [az,a, localSiderealTime,H];
    }
    
    static greenwichMeanSiderealTime(jd){
        //"Expressions for IAU 2000 precession quantities" N. Capitaine1,P.T.Wallace2, and J. Chapront
        const t = ((jd - 2451545.0)) / 36525.0;

        let gmst=this.earthRotationAngle(jd)+(0.014506 + 4612.156534*t + 1.3915817*t*t - 0.00000044 *t*t*t - 0.000029956*t*t*t*t - 0.0000000368*t*t*t*t*t)/60.0/60.0*Math.PI/180.0;  //eq 42
        gmst%=2*Math.PI;
        if(gmst<0) gmst+=2*Math.PI;

        return gmst;
    }
    
    static earthRotationAngle(jd){
        //IERS Technical Note No. 32
    
        const t = jd- 2451545.0;
        const f = jd%1.0;

        let theta = 2*Math.PI * (f + 0.7790572732640 + 0.00273781191135448 * t); //eq 14
        theta%=2*Math.PI;
        if(theta<0)theta+=2*Math.PI;
    
        return theta;
    }
    
    static xyzToRaDec(target){
        const x=target[0];
        const y=target[1];
        const z=target[2];
    
        //Convert from Cartesian to polar coordinates 
        const r=Math.sqrt(x*x+y*y+z*z);
        let l=Math.atan2(y,x);
        let t=Math.acos(z/r);
    
        //Make sure RA is positive, and Dec is in range +/-90
        if(l<0){l+=2*Math.PI;}
        t=.5*Math.PI-t;
    
        return [l,t,r];
    }
    
    
    static sub(a,b){
        let temp=new Array();
        for(let i=0;i<a.length;i++){
            temp[i]=a[i]-b[i];
        }
        return temp;
    }
    
    //Corrects values to make them between 0 and 1
    static constrain(v){
        while(v<0){v+=1;}
        while(v>1){v-=1;}
        return v;
    }
    
    //All angles must be in radians
    //Remember Meeus considers West longitudes as positive, the opposite of how everyone else does.
    //Outputs are times in hours GMT (not accounting for daylight saving time)
    //From Meeus Page 101
    static getRiseSet(jd,lat,lon,ra,dec){
        const toRad=Math.PI/180.0;
        const toDeg=180.0/Math.PI;

        const h0=-0.8333 //For Sun
        //const h0=-0.5667 //For stars and planets
        //const h0=0.125   //For Moon
    
        const cosH=(Math.sin(h0*Math.PI/180.0)-Math.sin(lat)*Math.sin(dec)) / (Math.cos(lat)*Math.cos(dec));
        const H0=Math.acos(cosH)*180.0/Math.PI;
    
        const gmst=this.greenwichMeanSiderealTime(Math.floor(jd)+.5)*toDeg;
    
        const transit=(ra*toDeg+lon*toDeg-gmst)/360.0;
        const rise=transit-(H0/360.0);
        const set=transit+(H0/360.0);
    
        return [this.constrain(transit)*24.0,this.constrain(rise)*24.0,this.constrain(set)*24.0];
    }
}