const torad=Math.PI/180.0;
const toDeg=180.0/Math.PI;

export function JulianDateFromUnixTime(t){
	//Not valid for dates before Oct 15, 1582
	return (t / 86400000) + 2440587.5;
}

export function UnixTimeFromJulianDate(jd){
	//Not valid for dates before Oct 15, 1582
	return (jd-2440587.5)*86400000;
}

//Low precision sun position from Astronomical Almanac page C5 (2017 ed).
//Accuracy 1deg from 1950-2050
export function sunPosition(jd)	{
	const torad=Math.PI/180.0;
	const n=jd-2451545.0;
	let L=(280.460+0.9856474*n)%360;
	let g=((375.528+.9856003*n)%360)*torad;
	if(L<0){L+=360;}
	if(g<0){g+=Math.PI*2.0;}

	const lamba=(L+1.915*Math.sin(g)+0.020*Math.sin(2*g))*torad;
	const beta=0.0;
	const eps=(23.439-0.0000004*n)*torad;
	let ra=Math.atan2(Math.cos(eps)*Math.sin(lamba),Math.cos(lamba));
	let dec=Math.asin(Math.sin(eps)*Math.sin(lamba));
	if(ra<0){ra+=Math.PI*2;}
	return [ra,dec];
}

function sind(r){
	return Math.sin(r*torad);
}

function cosd(r){
	return Math.cos(r*torad);
}

//Low precision geocentric moon position (RA,DEC) from Astronomical Almanac page D22 (2017 ed)
export function getGeocentricMoonPos(jd){
	let T = (jd-2451545)/36525;
	let L = 218.32 + 481267.881*T + 6.29*sind(135.0 + 477198.87*T) - 1.27*sind(259.3 - 413335.36*T) + 0.66*sind(235.7 + 890534.22*T) + 0.21*sind(269.9 + 954397.74*T) - 0.19*sind(357.5 + 35999.05*T) - 0.11*sind(186.5 + 966404.03*T);
	let B = 5.13*sind( 93.3 + 483202.02*T) + 0.28*sind(228.2 + 960400.89*T) - 0.28*sind(318.3 + 6003.15*T) - 0.17*sind(217.6 - 407332.21*T);
	let P = 0.9508 + 0.0518*cosd(135.0 + 477198.87*T) + 0.0095*cosd(259.3 - 413335.36*T) + 0.0078*cosd(235.7 + 890534.22*T) + 0.0028*cosd(269.9 + 954397.74*T);

	let SD=0.2724*P;
	let r=1/sind(P);

	let l = cosd(B) * cosd(L);
	let m = 0.9175*cosd(B)*sind(L) - 0.3978*sind(B);
	let n = 0.3978*cosd(B)*sind(L) + 0.9175*sind(B);

	let ra=Math.atan2(m,l);
	if(ra<0){ra+=2*Math.PI;}
	let dec=Math.asin(n);
	return [ra,dec];
}

function constrain(d){
    let t=d%360;
    if(t<0){t+=360;}
    return t;
}

export function getIlluminatedFractionOfMoon(jd){
    const toRad=Math.PI/180.0;
    const T=(jd-2451545)/36525.0;

    const D = constrain(297.8501921 + 445267.1114034*T - 0.0018819*T*T + 1.0/545868.0*T*T*T - 1.0/113065000.0*T*T*T*T)*toRad; //47.2
    const M = constrain(357.5291092 + 35999.0502909*T - 0.0001536*T*T + 1.0/24490000.0*T*T*T)*toRad; //47.3
    const Mp = constrain(134.9633964 + 477198.8675055*T + 0.0087414*T*T + 1.0/69699.0*T*T*T - 1.0/14712000.0*T*T*T*T)*toRad; //47.4

    //48.4
    const i=constrain(180 - D*180/Math.PI - 6.289 * Math.sin(Mp) + 2.1 * Math.sin(M) -1.274 * Math.sin(2*D - Mp) -0.658 * Math.sin(2*D) -0.214 * Math.sin(2*Mp) -0.11 * Math.sin(D))*toRad;

    const k=(1+Math.cos(i))/2;
    return k;
}

//By Greg Miller gmiller@gregmiller.net www.astrogreg.com
//Released as public domain

//Corrects values to make them between 0 and 1
function constrain2(v){
	if(v<0){return v+1;}
	if(v>1){return v-1;}
	return v;
}

//All angles must be in radians
//Outputs are times in hours GMT (not accounting for daylight saving time)
//cosH, if < -1, always up, if > 1 never up
//From Meeus Page 101
export function getRiseSet(jd,lat,lon,ra,dec,h0){
	//const h0=-0.8333 //For Sun
	//const h0=-0.5667 //For stars and planets
	//const h0=0.125   //For Moon

    const cosH=(Math.sin(h0*Math.PI/180.0)-Math.sin(lat)*Math.sin(dec)) / (Math.cos(lat)*Math.cos(dec));
	const H0=Math.acos(cosH)*180.0/Math.PI;

	const gmst=GMST(Math.floor(jd)+.5);

	const transit=(ra*toDeg-lon*toDeg-gmst)/360.0;
	const rise=transit-(H0/360.0);
	const set=transit+(H0/360.0);

	return [constrain2(transit)*24.0,constrain2(rise)*24.0,constrain2(set)*24.0,cosH];
	//return [(transit)*24.0,(rise)*24.0,(set)*24.0,cosH];
}

//Greenwhich mean sidreal time from Meeus page 87
//Input is julian date, does not have to be 0h
//Output is angle in degrees
export function GMST(jd){
    const T=(jd-2451545.0)/36525.0;
	let st=280.46061837+360.98564736629*(jd-2451545.0)+0.000387933*T*T - T*T*T/38710000.0;
	st=st%360;
	if(st<0){st+=360;}
    
	return st;
	//return st*Math.PI/180.0;
}

export function xyzToRaDec(target){
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


export const constellations=
[
    //Abr    Name    RA-hours  Dec-degrees
    ["And", "Andromeda", 0.8076, 37.4318],
    ["Ant", "Antlia", 10.2738, -31.5165],
    ["Aps", "Apus", 16.1441, -74.7],
    ["Aqr", "Aquarius", 22.2896, -9.2109],
    ["Aql", "Aquila", 19.667, 3.4108],
    ["Ara", "Ara", 17.3748, -55.4117],
    ["Ari", "Aries", 2.636, 20.7923],
    ["Aur", "Auriga", 6.0736, 42.028],
    ["Boo", "Bootes", 14.7106, 31.2026],
    ["Cae", "Caelum", 4.7045, -36.1184],
    ["Cam", "Camelopardalis", 8.8561, 69.3815],
    ["CVn", "Canes Venatici", 13.116, 40.1018],
    ["CMa", "Canis Major", 6.829, -21.8597],
    ["CMi", "Canis Minor", 7.6528, 6.4271],
    ["Cap", "Capricornus", 21.0488, -17.9769],
    ["Car", "Carina", 8.695, -62.7807],
    ["Cnc", "Cancer", 8.6493, 19.8058],
    ["Cas", "Cassiopeia", 1.3193, 62.184],
    ["Cen", "Centaurus", 13.0711, -46.6547],
    ["Cep", "Cepheus", 2.544, 71.0085],
    ["Cet", "Cetus", 1.6683, -6.8207],
    ["Cha", "Chamaeleon", 10.6921, -78.795],
    ["Cir", "Circinus", 14.5756, -62.9697],
    ["Col", "Columba", 5.8626, -34.9056],
    ["Com", "Coma Berenices", 12.7878, 23.3056],
    ["CrA", "Corona Australis", 18.6465, -40.8525],
    ["CrB", "Corona Borealis", 15.8431, 32.6248],
    ["Crv", "Corvus", 12.442, -17.5634],
    ["Crt", "Crater", 11.3958, -14.071],
    ["Cru", "Crux", 12.4498, -59.8135],
    ["Cyg", "Cygnus", 20.588, 44.545],
    ["Del", "Delphinus", 20.6935, 11.671],
    ["Dor", "Dorado", 5.2418, -58.613],
    ["Dra", "Draco", 15.144, 67.0066],
    ["Equ", "Equuleus", 21.1876, 7.7581],
    ["Eri", "Eridanus", 3.3003, -27.2439],
    ["For", "Fornax", 2.798, -30.3655],
    ["Gem", "Gemini", 7.0706, 22.6001],
    ["Gru", "Grus", 22.4564, -45.6482],
    ["Her", "Hercules", 17.386, 27.4988],
    ["Hor", "Horologium", 3.2759, -52.6637],
    ["Hya", "Hydra", 11.6121, -13.4682],
    ["Hyi", "Hydrus", 2.3441, -68.0435],
    ["Ind", "Indus", 21.9721, -58.2934],
    ["Lac", "Lacerta", 22.4613, 46.0418],
    ["Leo", "Leo", 10.6671, 13.1386],
    ["LMi", "Leo Minor", 10.2453, 32.1346],
    ["Lep", "Lepus", 5.5658, -18.9537],
    ["Lib", "Libra", 15.1993, -14.7654],
    ["Lup", "Lupus", 15.2201, -41.2912],
    ["Lyn", "Lynx", 7.9921, 47.4666],
    ["Lyr", "Lyra", 18.8528, 36.6893],
    ["Men", "Mensa", 5.415, -76.496],
    ["Mic", "Microscopium", 20.9646, -35.7252],
    ["Mon", "Monoceros", 7.0605, 0.2821],
    ["Mus", "Musca", 12.5879, -69.839],
    ["Nor", "Norma", 15.903, -50.6485],
    ["Oct", "Octans", 23, -81.848],
    ["Oph", "Ophiuchus", 17.3948, -6.0877],
    ["Ori", "Orion", 5.5765, 5.949],
    ["Pav", "Pavo", 19.6118, -64.2186],
    ["Peg", "Pegasus", 22.6973, 19.4663],
    ["Per", "Perseus", 3.175, 45.0131],
    ["Phe", "Phoenix", 0.9318, -47.4194],
    ["Pic", "Pictor", 5.7076, -52.5259],
    ["Psc", "Pisces", 0.4828, 13.6871],
    ["PsA", "Piscis Austrinus", 22.2845, -29.3579],
    ["Pup", "Puppis", 7.258, -30.8227],
    ["Pyx", "Pyxis", 8.9526, -26.6484],
    ["Ret", "Reticulum", 3.9211, -58.0025],
    ["Sge", "Sagitta", 19.6508, 18.8613],
    ["Sgr", "Sagittarius", 19.099, -27.5232],
    ["Sco", "Scorpius", 16.8873, -26.9685],
    ["Scl", "Sculptor", 0.438, -31.9117],
    ["Sct", "Scutum", 18.6731, -8.1114],
    ["Ser", "Serpens", 16.9506, 6.122],
    ["Sex", "Sextans", 10.2715, -1.3854],
    ["Tau", "Taurus", 4.7021, 14.8771],
    ["Tel", "Telescopium", 19.3256, -50.9632],
    ["Tri", "Triangulum", 2.1845, 31.476],
    ["TrA", "Triangulum Australe", 16.0825, -64.612],
    ["Tuc", "Tucana", 23.7773, -64.17],
    ["UMa", "Ursa Major", 11.3126, 50.7211],
    ["UMi", "Ursa Minor", 15, 77.6998],
    ["Vel", "Vela", 9.5773, -46.8329],
    ["Vir", "Virgo", 13.4065, -3.8415],
    ["Vol", "Volans", 7.7955, -68.1989],
    ["Vul", "Vulpecula", 20.2313, 24.4426],
];

export const messier=[
    {"id": "M1",    "ngc": "NGC 1952",                 "name": "Crab Nebula",                                 "type": "Supernova remnant",                             "constellation": "Taurus",              "magnitude": 8.4,   "ra": 5.5752,       "dec": 22.0144      },
    {"id": "M2",    "ngc": "NGC 7089",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Aquarius",            "magnitude": 6.3,   "ra": 21.5575,      "dec": 0.823        },
    {"id": "M3",    "ngc": "NGC 5272",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Canes Venatici",      "magnitude": 6.2,   "ra": 13.703,       "dec": 28.3772      },
    {"id": "M4",    "ngc": "NGC 6121",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Scorpius",            "magnitude": 5.9,   "ra": 16.393,       "dec": -25.4744     },
    {"id": "M5",    "ngc": "NGC 5904",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Serpens",             "magnitude": 6.7,   "ra": 15.3091,      "dec": 2.0808       },
    {"id": "M6",    "ngc": "NGC 6405",                 "name": "Butterfly Cluster",                           "type": "Open cluster",                                  "constellation": "Scorpius",            "magnitude": 4.2,   "ra": 17.6666,      "dec": -31.7833     },
    {"id": "M7",    "ngc": "NGC 6475",                 "name": "Ptolemy Cluster",                             "type": "Open cluster",                                  "constellation": "Scorpius",            "magnitude": 3.3,   "ra": 17.8975,      "dec": -33.2072     },
    {"id": "M8",    "ngc": "NGC 6523",                 "name": "Lagoon Nebula",                               "type": "Nebula with cluster",                           "constellation": "Sagittarius",         "magnitude": 6,     "ra": 18.0602,      "dec": -23.6133     },
    {"id": "M9",    "ngc": "NGC 6333",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Ophiuchus",           "magnitude": 8.4,   "ra": 17.3197,      "dec": -17.4838     },
    {"id": "M10",   "ngc": "NGC 6254",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Ophiuchus",           "magnitude": 6.4,   "ra": 16.9522,      "dec": -3.9005      },
    {"id": "M11",   "ngc": "NGC 6705",                 "name": "Wild Duck Cluster",                           "type": "Open cluster",                                  "constellation": "Scutum",              "magnitude": 6.3,   "ra": 18.85,        "dec": -5.7333      },
    {"id": "M12",   "ngc": "NGC 6218",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Ophiuchus",           "magnitude": 7.7,   "ra": 16.7872,      "dec": -0.0516      },
    {"id": "M13",   "ngc": "NGC 6205",                 "name": "Great Globular Cluster in Hercules",          "type": "Globular cluster",                              "constellation": "Hercules",            "magnitude": 5.8,   "ra": 16.6947,      "dec": 36.4597      },
    {"id": "M14",   "ngc": "NGC 6402",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Ophiuchus",           "magnitude": 8.3,   "ra": 17.6266,      "dec": -2.7541      },
    {"id": "M15",   "ngc": "NGC 7078",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Pegasus",             "magnitude": 6.2,   "ra": 21.4994,      "dec": 12.1669      },
    {"id": "M16",   "ngc": "NGC 6611",                 "name": "Eagle Nebula",                                "type": "H II region nebula with cluster",               "constellation": "Serpens",             "magnitude": 6,     "ra": 18.3133,      "dec": -12.1833     },
    {"id": "M17",   "ngc": "NGC 6618",                 "name": "Omega, Swan, Horseshoe, or Lobster Nebula",   "type": "H II region nebula with cluster",               "constellation": "Sagittarius",         "magnitude": 6,     "ra": 18.3405,      "dec": -15.8233     },
    {"id": "M18",   "ngc": "NGC 6613",                 "name": "",                                            "type": "Open cluster",                                  "constellation": "Sagittarius",         "magnitude": 7.5,   "ra": 18.3166,      "dec": -16.8666     },
    {"id": "M19",   "ngc": "NGC 6273",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Ophiuchus",           "magnitude": 7.5,   "ra": 17.0436,      "dec": -25.7322     },
    {"id": "M20",   "ngc": "NGC 6514",                 "name": "Trifid Nebula",                               "type": "H II region nebula with cluster",               "constellation": "Sagittarius",         "magnitude": 6.3,   "ra": 18.0397,      "dec": -22.97       },
    {"id": "M21",   "ngc": "NGC 6531",                 "name": "",                                            "type": "Open cluster",                                  "constellation": "Sagittarius",         "magnitude": 6.5,   "ra": 18.0666,      "dec": -21.5        },
    {"id": "M22",   "ngc": "NGC 6656",                 "name": "Sagittarius Cluster",                         "type": "Globular cluster",                              "constellation": "Sagittarius",         "magnitude": 5.1,   "ra": 18.6063,      "dec": -22.0952     },
    {"id": "M23",   "ngc": "NGC 6494",                 "name": "",                                            "type": "Open cluster",                                  "constellation": "Sagittarius",         "magnitude": 6.9,   "ra": 17.9333,      "dec": -18.9833     },
    {"id": "M24",   "ngc": "IC 4715",                  "name": "Small Sagittarius Star Cloud",                "type": "Milky Way star cloud",                          "constellation": "Sagittarius",         "magnitude": 2.5,   "ra": 18.2833,      "dec": -17.45       },
    {"id": "M25",   "ngc": "IC 4725",                  "name": "",                                            "type": "Open cluster",                                  "constellation": "Sagittarius",         "magnitude": 4.6,   "ra": 18.5166,      "dec": -18.75       },
    {"id": "M26",   "ngc": "NGC 6694",                 "name": "",                                            "type": "Open cluster",                                  "constellation": "Scutum",              "magnitude": 8,     "ra": 18.75,        "dec": -8.6         },
    {"id": "M27",   "ngc": "NGC 6853",                 "name": "Dumbbell Nebula",                             "type": "Planetary nebula",                              "constellation": "Vulpecula",           "magnitude": 7.5,   "ra": 19.9933,      "dec": 22.7211      },
    {"id": "M28",   "ngc": "NGC 6626",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Sagittarius",         "magnitude": 7.7,   "ra": 18.4088,      "dec": -23.1302     },
    {"id": "M29",   "ngc": "NGC 6913",                 "name": "Cooling Tower",                               "type": "Open cluster",                                  "constellation": "Cygnus",              "magnitude": 7.1,   "ra": 20.3988,      "dec": 38.5233      },
    {"id": "M30",   "ngc": "NGC 7099",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Capricornus",         "magnitude": 7.7,   "ra": 21.6727,      "dec": -22.8202     },
    {"id": "M31",   "ngc": "NGC 224",                  "name": "Andromeda Galaxy",                            "type": "Spiral galaxy",                                 "constellation": "Andromeda",           "magnitude": 3.4,   "ra": 0.7122,       "dec": 41.2691      },
    {"id": "M32",   "ngc": "NGC 221",                  "name": "Small Andromeda Galaxy",                      "type": "Dwarf elliptical galaxy",                       "constellation": "Andromeda",           "magnitude": 8.1,   "ra": 0.7113,       "dec": 40.8652      },
    {"id": "M33",   "ngc": "NGC 598",                  "name": "Triangulum/Pinwheel Galaxy",                  "type": "Spiral galaxy",                                 "constellation": "Triangulum",          "magnitude": 5.7,   "ra": 1.5638,       "dec": 30.66        },
    {"id": "M34",   "ngc": "NGC 1039",                 "name": "",                                            "type": "Open cluster",                                  "constellation": "Perseus",             "magnitude": 5.5,   "ra": 2.7,          "dec": 42.7666      },
    {"id": "M35",   "ngc": "NGC 2168",                 "name": "",                                            "type": "Open cluster",                                  "constellation": "Gemini",              "magnitude": 5.3,   "ra": 6.15,         "dec": 24.35        },
    {"id": "M36",   "ngc": "NGC 1960",                 "name": "",                                            "type": "Open cluster",                                  "constellation": "Auriga",              "magnitude": 6.3,   "ra": 5.6033,       "dec": 34.1344      },
    {"id": "M37",   "ngc": "NGC 2099",                 "name": "",                                            "type": "Open cluster",                                  "constellation": "Auriga",              "magnitude": 6.2,   "ra": 5.8716,       "dec": 32.5505      },
    {"id": "M38",   "ngc": "NGC 1912",                 "name": "Starfish Cluster",                            "type": "Open cluster",                                  "constellation": "Auriga",              "magnitude": 7.4,   "ra": 5.4783,       "dec": 35.855       },
    {"id": "M39",   "ngc": "NGC 7092",                 "name": "",                                            "type": "Open cluster",                                  "constellation": "Cygnus",              "magnitude": 5.5,   "ra": 21.5283,      "dec": 48.4333      },
    {"id": "M40",   "ngc": "",                         "name": "Winnecke-4",                                  "type": "Star System",                                   "constellation": "Ursa Major",          "magnitude": 9.7,   "ra": 12.37,        "dec": 58.083       },
    {"id": "M41",   "ngc": "NGC 2287",                 "name": "",                                            "type": "Open cluster",                                  "constellation": "Canis Major",         "magnitude": 4.5,   "ra": 6.7666,       "dec": -19.2333     },
    {"id": "M42",   "ngc": "NGC 1976",                 "name": "Orion Nebula",                                "type": "H II region nebula",                            "constellation": "Orion",               "magnitude": 4,     "ra": 5.588,        "dec": -4.6088      },
    {"id": "M43",   "ngc": "NGC 1982",                 "name": "De Mairan's Nebula",                          "type": "H II region nebula (part of the Orion Nebula)", "constellation": "Orion",               "magnitude": 9,     "ra": 5.5833,       "dec": -4.7333      },
    {"id": "M44",   "ngc": "NGC 2632",                 "name": "Beehive Cluster or Praesepe",                 "type": "Open cluster",                                  "constellation": "Cancer",              "magnitude": 3.7,   "ra": 8.6666,       "dec": 19.9833      },
    {"id": "M45",   "ngc": "",                         "name": "Pleiades",                                    "type": "Open cluster",                                  "constellation": "Taurus",              "magnitude": 1.6,   "ra": 3.79,         "dec": 24.1166      },
    {"id": "M46",   "ngc": "NGC 2437",                 "name": "",                                            "type": "Open cluster",                                  "constellation": "Puppis",              "magnitude": 6.1,   "ra": 7.6833,       "dec": -13.1833     },
    {"id": "M47",   "ngc": "NGC 2422",                 "name": "",                                            "type": "Open cluster",                                  "constellation": "Puppis",              "magnitude": 4.2,   "ra": 7.6,          "dec": -13.5        },
    {"id": "M48",   "ngc": "NGC 2548",                 "name": "",                                            "type": "Open cluster",                                  "constellation": "Hydra",               "magnitude": 5.5,   "ra": 8.2166,       "dec": -4.25        },
    {"id": "M49",   "ngc": "NGC 4472",                 "name": "",                                            "type": "Elliptical galaxy",                             "constellation": "Virgo",               "magnitude": 9.4,   "ra": 12.4961,      "dec": 8.0005       },
    {"id": "M50",   "ngc": "NGC 2323",                 "name": "",                                            "type": "Open cluster",                                  "constellation": "Monoceros",           "magnitude": 5.9,   "ra": 7.05,         "dec": -7.6666      },
    {"id": "M51",   "ngc": "NGC 5194, NGC 5195",       "name": "Whirlpool Galaxy",                            "type": "Spiral galaxy",                                 "constellation": "Canes Venatici",      "magnitude": 8.4,   "ra": 13.4977,      "dec": 47.1952      },
    {"id": "M52",   "ngc": "NGC 7654",                 "name": "",                                            "type": "Open cluster",                                  "constellation": "Cassiopeia",          "magnitude": 5,     "ra": 23.4,         "dec": 61.5833      },
    {"id": "M53",   "ngc": "NGC 5024",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Coma Berenices",      "magnitude": 8.3,   "ra": 13.2152,      "dec": 18.168       },
    {"id": "M54",   "ngc": "NGC 6715",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Sagittarius",         "magnitude": 8.4,   "ra": 18.9175,      "dec": -29.5202     },
    {"id": "M55",   "ngc": "NGC 6809",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Sagittarius",         "magnitude": 7.4,   "ra": 19.6663,      "dec": -29.0352     },
    {"id": "M56",   "ngc": "NGC 6779",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Lyra",                "magnitude": 8.3,   "ra": 19.2763,      "dec": 30.1833      },
    {"id": "M57",   "ngc": "NGC 6720",                 "name": "Ring Nebula",                                 "type": "Planetary nebula",                              "constellation": "Lyra",                "magnitude": 8.8,   "ra": 18.893,       "dec": 33.0291      },
    {"id": "M58",   "ngc": "NGC 4579",                 "name": "",                                            "type": "Barred Spiral galaxy",                          "constellation": "Virgo",               "magnitude": 10.5,  "ra": 12.6286,      "dec": 11.818       },
    {"id": "M59",   "ngc": "NGC 4621",                 "name": "",                                            "type": "Elliptical galaxy",                             "constellation": "Virgo",               "magnitude": 10.6,  "ra": 12.7005,      "dec": 11.6469      },
    {"id": "M60",   "ngc": "NGC 4649",                 "name": "",                                            "type": "Elliptical galaxy",                             "constellation": "Virgo",               "magnitude": 9.8,   "ra": 12.7275,      "dec": 11.5525      },
    {"id": "M61",   "ngc": "NGC 4303",                 "name": "",                                            "type": "Spiral galaxy",                                 "constellation": "Virgo",               "magnitude": 10.2,  "ra": 12.365,       "dec": 4.4736       },
    {"id": "M62",   "ngc": "NGC 6266",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Ophiuchus",           "magnitude": 7.4,   "ra": 17.02,        "dec": -29.8877     },
    {"id": "M63",   "ngc": "NGC 5055",                 "name": "Sunflower Galaxy",                            "type": "Spiral galaxy",                                 "constellation": "Canes Venatici",      "magnitude": 9.3,   "ra": 13.2636,      "dec": 42.0291      },
    {"id": "M64",   "ngc": "NGC 4826",                 "name": "Black Eye Galaxy",                            "type": "Spiral galaxy",                                 "constellation": "Coma Berenices",      "magnitude": 9.4,   "ra": 12.9452,      "dec": 21.6827      },
    {"id": "M65",   "ngc": "NGC 3623",                 "name": "Leo Triplet",                                 "type": "Barred Spiral galaxy",                          "constellation": "Leo",                 "magnitude": 10.3,  "ra": 11.3152,      "dec": 13.0922      },
    {"id": "M66",   "ngc": "NGC 3627",                 "name": "Leo Triplet",                                 "type": "Barred Spiral galaxy",                          "constellation": "Leo",                 "magnitude": 8.9,   "ra": 11.3375,      "dec": 12.9916      },
    {"id": "M67",   "ngc": "NGC 2682",                 "name": "",                                            "type": "Open cluster",                                  "constellation": "Cancer",              "magnitude": 6.1,   "ra": 8.85,         "dec": 11.8166      },
    {"id": "M68",   "ngc": "NGC 4590",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Hydra",               "magnitude": 9.7,   "ra": 12.6575,      "dec": -25.2561     },
    {"id": "M69",   "ngc": "NGC 6637",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Sagittarius",         "magnitude": 8.3,   "ra": 18.523,       "dec": -31.6519     },
    {"id": "M70",   "ngc": "NGC 6681",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Sagittarius",         "magnitude": 9.1,   "ra": 18.72,        "dec": -31.708      },
    {"id": "M71",   "ngc": "NGC 6838",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Sagitta",             "magnitude": 6.1,   "ra": 19.8961,      "dec": 18.7791      },
    {"id": "M72",   "ngc": "NGC 6981",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Aquarius",            "magnitude": 9.4,   "ra": 20.8908,      "dec": -11.4627     },
    {"id": "M73",   "ngc": "NGC 6994",                 "name": "",                                            "type": "Asterism",                                      "constellation": "Aquarius",            "magnitude": 9,     "ra": 20.9816,      "dec": -11.3666     },
    {"id": "M74",   "ngc": "NGC 628",                  "name": "Phantom Galaxy[91]",                          "type": "Spiral galaxy",                                 "constellation": "Pisces",              "magnitude": 10,    "ra": 1.6113,       "dec": 15.7836      },
    {"id": "M75",   "ngc": "NGC 6864",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Sagittarius",         "magnitude": 9.2,   "ra": 20.1011,      "dec": -20.0788     },
    {"id": "M76",   "ngc": "NGC 650, NGC 651",         "name": "Little Dumbbell Nebula",                      "type": "Planetary nebula",                              "constellation": "Perseus",             "magnitude": 10.1,  "ra": 1.7,          "dec": 51.5752      },
    {"id": "M77",   "ngc": "NGC 1068",                 "name": "Cetus A",                                     "type": "Spiral galaxy",                                 "constellation": "Cetus",               "magnitude": 9.6,   "ra": 2.7111,       "dec": 0.0133       },
    {"id": "M78",   "ngc": "NGC 2068",                 "name": "",                                            "type": "Diffuse nebula",                                "constellation": "Orion",               "magnitude": 8.3,   "ra": 5.7794,       "dec": 0.0138       },
    {"id": "M79",   "ngc": "NGC 1904",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Lepus",               "magnitude": 8.6,   "ra": 5.4027,       "dec": -23.4758     },
    {"id": "M80",   "ngc": "NGC 6093",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Scorpius",            "magnitude": 7.9,   "ra": 16.2838,      "dec": -21.0241     },
    {"id": "M81",   "ngc": "NGC 3031",                 "name": "Bode's Galaxy",                               "type": "Spiral galaxy",                                 "constellation": "Ursa Major",          "magnitude": 6.9,   "ra": 9.9258,       "dec": 69.0652      },
    {"id": "M82",   "ngc": "NGC 3034",                 "name": "Cigar Galaxy",                                "type": "Starburst galaxy",                              "constellation": "Ursa Major",          "magnitude": 8.4,   "ra": 9.9311,       "dec": 69.6797      },
    {"id": "M83",   "ngc": "NGC 5236",                 "name": "Southern Pinwheel Galaxy",                    "type": "Barred Spiral galaxy",                          "constellation": "Hydra",               "magnitude": 7.5,   "ra": 13.6166,      "dec": -28.1341     },
    {"id": "M84",   "ngc": "NGC 4374",                 "name": "",                                            "type": "Lenticular galaxy",                             "constellation": "Virgo",               "magnitude": 10.1,  "ra": 12.4174,      "dec": 12.8869      },
    {"id": "M85",   "ngc": "NGC 4382",                 "name": "",                                            "type": "Lenticular galaxy",                             "constellation": "Coma Berenices",      "magnitude": 10,    "ra": 12.4233,      "dec": 18.1911      },
    {"id": "M86",   "ngc": "NGC 4406",                 "name": "",                                            "type": "Lenticular galaxy",                             "constellation": "Virgo",               "magnitude": 9.8,   "ra": 12.4363,      "dec": 12.9461      },
    {"id": "M87",   "ngc": "NGC 4486",                 "name": "Virgo A",                                     "type": "Elliptical galaxy",                             "constellation": "Virgo",               "magnitude": 9.6,   "ra": 12.5136,      "dec": 12.3911      },
    {"id": "M88",   "ngc": "NGC 4501",                 "name": "",                                            "type": "Spiral galaxy",                                 "constellation": "Coma Berenices",      "magnitude": 10.4,  "ra": 12.533,       "dec": 14.4205      },
    {"id": "M89",   "ngc": "NGC 4552",                 "name": "",                                            "type": "Elliptical galaxy",                             "constellation": "Virgo",               "magnitude": 10.7,  "ra": 12.5941,      "dec": 12.5563      },
    {"id": "M90",   "ngc": "NGC 4569",                 "name": "",                                            "type": "Spiral galaxy",                                 "constellation": "Virgo",               "magnitude": 10.3,  "ra": 12.6136,      "dec": 13.1627      },
    {"id": "M91",   "ngc": "NGC 4548",                 "name": "",                                            "type": "Barred Spiral galaxy",                          "constellation": "Coma Berenices",      "magnitude": 11,    "ra": 12.5905,      "dec": 14.4963      },
    {"id": "M92",   "ngc": "NGC 6341",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Hercules",            "magnitude": 6.3,   "ra": 17.2852,      "dec": 43.1358      },
    {"id": "M93",   "ngc": "NGC 2447",                 "name": "",                                            "type": "Open cluster",                                  "constellation": "Puppis",              "magnitude": 6,     "ra": 7.7333,       "dec": -22.1333     },
    {"id": "M94",   "ngc": "NGC 4736",                 "name": "Croc's Eye or Cat's Eye",                     "type": "Spiral galaxy",                                 "constellation": "Canes Venatici",      "magnitude": 9,     "ra": 12.848,       "dec": 41.1205      },
    {"id": "M95",   "ngc": "NGC 3351",                 "name": "",                                            "type": "Barred Spiral galaxy",                          "constellation": "Leo",                 "magnitude": 11.4,  "ra": 10.7325,      "dec": 11.7038      },
    {"id": "M96",   "ngc": "NGC 3368",                 "name": "",                                            "type": "Spiral galaxy",                                 "constellation": "Leo",                 "magnitude": 10.1,  "ra": 10.7791,      "dec": 11.82        },
    {"id": "M97",   "ngc": "NGC 3587",                 "name": "Owl Nebula",                                  "type": "Planetary nebula",                              "constellation": "Ursa Major",          "magnitude": 9.9,   "ra": 11.2463,      "dec": 55.0188      },
    {"id": "M98",   "ngc": "NGC 4192",                 "name": "",                                            "type": "Spiral galaxy",                                 "constellation": "Coma Berenices",      "magnitude": 11,    "ra": 12.23,        "dec": 14.9002      },
    {"id": "M99",   "ngc": "NGC 4254",                 "name": "",                                            "type": "Spiral galaxy",                                 "constellation": "Coma Berenices",      "magnitude": 10.4,  "ra": 12.3136,      "dec": 14.4163      },
    {"id": "M100",  "ngc": "NGC 4321",                 "name": "",                                            "type": "Spiral galaxy",                                 "constellation": "Coma Berenices",      "magnitude": 10.1,  "ra": 12.3816,      "dec": 15.8225      },
    {"id": "M101",  "ngc": "NGC 5457",                 "name": "Pinwheel Galaxy",                             "type": "Spiral galaxy",                                 "constellation": "Ursa Major",          "magnitude": 7.9,   "ra": 14.0533,      "dec": 54.3491      },
    {"id": "M102",  "ngc": "NGC 5866",                 "name": "Spindle Galaxy",                              "type": "Lenticular galaxy",                             "constellation": "Draco",               "magnitude": 10.7,  "ra": 15.108,       "dec": 55.7633      },
    {"id": "M103",  "ngc": "NGC 581",                  "name": "",                                            "type": "Open cluster",                                  "constellation": "Cassiopeia",          "magnitude": 7.4,   "ra": 1.55,         "dec": 60.7         },
    {"id": "M104",  "ngc": "NGC 4594",                 "name": "Sombrero Galaxy",                             "type": "Spiral galaxy",                                 "constellation": "Virgo",               "magnitude": 9,     "ra": 12.6663,      "dec": -10.3769     },
    {"id": "M105",  "ngc": "NGC 3379",                 "name": "",                                            "type": "Elliptical galaxy",                             "constellation": "Leo",                 "magnitude": 10.2,  "ra": 10.7969,      "dec": 12.5816      },
    {"id": "M106",  "ngc": "NGC 4258",                 "name": "",                                            "type": "Spiral galaxy",                                 "constellation": "Canes Venatici",      "magnitude": 9.1,   "ra": 12.3158,      "dec": 47.3038      },
    {"id": "M107",  "ngc": "NGC 6171",                 "name": "",                                            "type": "Globular cluster",                              "constellation": "Ophiuchus",           "magnitude": 8.9,   "ra": 16.5419,      "dec": -12.9463     },
    {"id": "M108",  "ngc": "NGC 3556",                 "name": "",                                            "type": "Barred Spiral galaxy",                          "constellation": "Ursa Major",          "magnitude": 10.7,  "ra": 11.1919,      "dec": 55.6741      },
    {"id": "M109",  "ngc": "NGC 3992",                 "name": "",                                            "type": "Barred Spiral galaxy",                          "constellation": "Ursa Major",          "magnitude": 10.6,  "ra": 11.9599,      "dec": 53.3744      },
    {"id": "M110",  "ngc": "NGC 205",                  "name": "",                                            "type": "Dwarf elliptical galaxy",                       "constellation": "Andromeda",           "magnitude": 9,     "ra": 0.6727,       "dec": 41.6852      },
];