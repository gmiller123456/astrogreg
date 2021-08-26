/*
SVG helper class
Greg Miller (gmiller@gregmiller.net)
http://www.celestialprogramming.com
Released as public domain

*/
const ns="http://www.w3.org/2000/svg";

export default class SVG{
    static createSVG(){

    }

    static path(data,color){
        var e = document.createElementNS(ns, "path");
        e.setAttribute("d",data);
        e.setAttribute("stroke",color);

        return e;
    }

    static rect(data,color,x,y,width,height){
        var e = document.createElementNS(namespace, "rect");
        e.setAttribute("x", x);
        e.setAttribute("y", y);
        e.setAttribute("width", width);
        e.setAttribute("height", height);
        e.setAttribute("fill", color);
        
        return e;
    }

}