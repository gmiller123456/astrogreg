const torad=Math.PI/180.0;
const toRad=Math.PI/180.0;
const toDeg=180.0/Math.PI;

function JulianDateFromUnixTime(t){
	//Not valid for dates before Oct 15, 1582
	return (t / 86400000) + 2440587.5;
}

function UnixTimeFromJulianDate(jd){
	//Not valid for dates before Oct 15, 1582
	return (jd-2440587.5)*86400000;
}

//Low precision sun position from Astronomical Almanac page C5 (2017 ed).
//Accuracy 1deg from 1950-2050
function sunPosition(jd)	{
	const torad=Math.PI/180.0;
	n=jd-2451545.0;
	L=(280.460+0.9856474*n)%360;
	g=((375.528+.9856003*n)%360)*torad;
	if(L<0){L+=360;}
	if(g<0){g+=Math.PI*2.0;}

	lamba=(L+1.915*Math.sin(g)+0.020*Math.sin(2*g))*torad;
	beta=0.0;
	eps=(23.439-0.0000004*n)*torad;
	ra=Math.atan2(Math.cos(eps)*Math.sin(lamba),Math.cos(lamba));
	dec=Math.asin(Math.sin(eps)*Math.sin(lamba));
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
function getGeocentricMoonPos(jd){
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

function getIlluminatedFractionOfMoon(jd){
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
function getRiseSet(jd,lat,lon,ra,dec,h0){
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
function GMST(jd){
    const T=(jd-2451545.0)/36525.0;
	let st=280.46061837+360.98564736629*(jd-2451545.0)+0.000387933*T*T - T*T*T/38710000.0;
	st=st%360;
	if(st<0){st+=360;}
    
	return st;
	//return st*Math.PI/180.0;
}

const constellations=
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
    ["Boo", "Boötes", 14.7106, 31.2026],
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