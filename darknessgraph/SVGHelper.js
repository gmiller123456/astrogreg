/*
SVG helper class
Greg Miller (gmiller@gregmiller.net)
http://www.celestialprogramming.com
Released as public domain

*/
const ns="http://www.w3.org/2000/svg";

export default class SVG{
    static createSVG(){
        return document.createElementNS(ns, "svg");
    }

    static toDataURL(image){
        return "data:image/svg+xml;base64,"+btoa(this.getSVGSource(image));
    }

    static getSVGSource(image){
        const w=image.getAttribute("width");
        const h=image.getAttribute("height");

        return "<svg width=\""+w+"\" height=\""+h+"\" xmlns=\"http://www.w3.org/2000/svg\">"+image.innerHTML+"</svg>";
    }

    static createElement(element){
        return document.createElementNS(ns, element);
    }

    static gradient(){
        return document.createElementNS(ns, "linearGradient");
    }

    static stop(){
        return document.createElementNS(ns, "stop");
    }

    static defs(){
        return document.createElementNS(ns, "defs");
    }

    static textPath(){
        return document.createElementNS(ns, "textPath");
    }

    static path(data,color){
        const e = document.createElementNS(ns, "path");
        e.setAttribute("d",data);
        e.setAttribute("stroke",color);

        return e;
    }

    static rect(color,x,y,width,height){
        const e = document.createElementNS(ns, "rect");
        e.setAttribute("x", x);
        e.setAttribute("y", y);
        e.setAttribute("width", width);
        e.setAttribute("height", height);
        e.setAttribute("fill", color);
        
        return e;
    }

    static text(color,x,y,size,text){
        const e = document.createElementNS(ns, "text");
        e.setAttribute("x", x);
        e.setAttribute("y", y);
        e.setAttribute("font-size", size);
        e.setAttribute("fill", color);
        e.textContent=text;
        
        return e;
    }

}