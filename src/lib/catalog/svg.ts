// Executed inside Chromium after the exact PDF pagination pass. Keep this plain JS.
export const catalogSVGScript = String.raw`(() => {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
  const n = value => Number(Number(value).toFixed(3));
  const canvas = document.createElement("canvas"), ctx=canvas.getContext("2d");
  return Array.from(document.querySelectorAll("#pages > .sheet")).map((sheet,pageIndex)=>{
    const bounds=sheet.getBoundingClientRect();
    let serial=0,defs=[];
    const box=el=>{const r=el.getBoundingClientRect();return {x:r.left-bounds.left,y:r.top-bounds.top,w:r.width,h:r.height};};
    const color=(value,attribute="fill")=>{
      const rgba=value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
      if(rgba)return attribute+'="rgb('+rgba[1]+','+rgba[2]+','+rgba[3]+')" '+attribute+'-opacity="'+(rgba[4]??1)+'"';
      return attribute+'="'+escape(value)+'"';
    };
    const rect=(b,fill,radius=0)=>'<rect x="'+n(b.x)+'" y="'+n(b.y)+'" width="'+n(b.w)+'" height="'+n(b.h)+'" rx="'+n(radius)+'" '+color(fill)+'/>';
    function text(node,style){
      if(!node.textContent.trim())return "";
      const family=style.fontFamily.includes("Catalog Serif")?"Ertip Catalog Serif":"Ertip Catalog Sans";
      ctx.font=style.fontWeight+" "+style.fontSize+" "+style.fontFamily;
      const metrics=ctx.measureText("Mg");
      const ascent=metrics.fontBoundingBoxAscent || parseFloat(style.fontSize)*.8;
      const range=document.createRange(),lines=[],symbols=[];
      let offset=0;
      for(const char of node.textContent){
        range.setStart(node,offset);offset+=char.length;range.setEnd(node,offset);
        const r=range.getBoundingClientRect();
        if(r.width<.01 || r.height<.01 || /[\r\n\t]/.test(char))continue;
        // The website's external-link arrow uses browser font fallback. Keep it
        // as a vector symbol so desktop editors do not need a third symbol font.
        if(char==="↗"){
          const x=r.left-bounds.left,y=r.top-bounds.top+ascent-parseFloat(style.fontSize)*.65,d=Math.min(r.width,parseFloat(style.fontSize)*.65);
          symbols.push('<path d="M '+n(x)+' '+n(y+d)+' L '+n(x+d)+' '+n(y)+' M '+n(x)+' '+n(y)+' H '+n(x+d)+' V '+n(y+d)+'" fill="none" '+color(style.color,"stroke")+' stroke-width=".8"/>');
          continue;
        }
        let line=lines[lines.length-1];
        if(!line || Math.abs(line.top-r.top)>.5){line={x:r.left-bounds.left,top:r.top,y:r.top-bounds.top+ascent,text:""};lines.push(line);}
        line.text+=char;
      }
      if(!lines.length)return "";
      return '<text xml:space="preserve" font-family="'+family+'" font-size="'+n(parseFloat(style.fontSize))+'" font-weight="'+style.fontWeight+'" font-style="'+style.fontStyle+'" letter-spacing="'+(style.letterSpacing==="normal"?"0":escape(style.letterSpacing))+'" '+color(style.color)+'>'+
        lines.map(line=>'<tspan x="'+n(line.x)+'" y="'+n(line.y)+'">'+escape(style.textTransform==="uppercase"?line.text.toLocaleUpperCase(document.documentElement.lang):line.text)+'</tspan>').join("")+'</text>'+symbols.join("");
    }
    function element(el){
      const s=getComputedStyle(el),b=box(el);
      if(s.display==="none" || s.visibility==="hidden" || !b.w || !b.h)return "";
      const id="p"+(pageIndex+1)+"-"+(++serial);
      let label=el.classList.contains("card") ? "Product "+el.dataset.product+" - "+(el.querySelector("h2")?.textContent||"") :
        el.classList.contains("product-module") ? el.dataset.title :
        el.classList.contains("cover-title") ? "Cover title" : el.classList.contains("visual") ? "Product image" : el.className;
      label=typeof label==="string" ? label : el.tagName;
      let content="";
      if(s.backgroundColor!=="rgba(0, 0, 0, 0)" && s.backgroundColor!=="transparent")content+=rect(b,s.backgroundColor,parseFloat(s.borderTopLeftRadius)||0);
      if(el.classList.contains("cover")){
        const p=getComputedStyle(el,"::before");
        if(p.content!=="none"){
          const w=parseFloat(p.width),h=parseFloat(p.height),x=b.x+parseFloat(p.left),y=b.y+parseFloat(p.top);
          const origin=p.transformOrigin.split(" ").map(parseFloat);
          content+='<g opacity="'+p.opacity+'" transform="translate('+n(x+origin[0])+' '+n(y+origin[1])+') '+(p.transform==="none"?"":p.transform)+' translate('+n(-origin[0])+' '+n(-origin[1])+')">'+rect({x:0,y:0,w,h},p.backgroundColor)+'</g>';
        }
      }
      const edges=[
        [s.borderTopWidth,s.borderTopColor,b.x,b.y+parseFloat(s.borderTopWidth)/2,b.x+b.w,b.y+parseFloat(s.borderTopWidth)/2],
        [s.borderBottomWidth,s.borderBottomColor,b.x,b.y+b.h-parseFloat(s.borderBottomWidth)/2,b.x+b.w,b.y+b.h-parseFloat(s.borderBottomWidth)/2],
        [s.borderLeftWidth,s.borderLeftColor,b.x+parseFloat(s.borderLeftWidth)/2,b.y,b.x+parseFloat(s.borderLeftWidth)/2,b.y+b.h],
        [s.borderRightWidth,s.borderRightColor,b.x+b.w-parseFloat(s.borderRightWidth)/2,b.y,b.x+b.w-parseFloat(s.borderRightWidth)/2,b.y+b.h]
      ];
      for(const [width,c,x1,y1,x2,y2] of edges)if(parseFloat(width)>0)content+='<line x1="'+n(x1)+'" y1="'+n(y1)+'" x2="'+n(x2)+'" y2="'+n(y2)+'" stroke-width="'+n(parseFloat(width))+'" '+color(c,"stroke")+'/>';
      if(el.tagName==="IMG"){
        const fit=s.objectFit==="cover"?"xMidYMid slice":"xMidYMid meet";
        const href=el.currentSrc||el.src;
        if(!href.startsWith("data:image/"))throw Error("Unembedded catalog image");
        content+='<image x="'+n(b.x)+'" y="'+n(b.y)+'" width="'+n(b.w)+'" height="'+n(b.h)+'" preserveAspectRatio="'+fit+'" xlink:href="'+escape(href)+'"'+(s.mixBlendMode==="multiply"?' style="mix-blend-mode:multiply"':"")+'/>';
      } else {
        for(const child of el.childNodes){
          if(child.nodeType===Node.TEXT_NODE)content+=text(child,s);
          else if(child.nodeType===Node.ELEMENT_NODE)content+=element(child);
        }
      }
      let clip="";
      if(s.overflow==="hidden" || s.objectFit==="cover"){
        defs.push('<clipPath id="'+id+'-clip">'+rect(b,"white",parseFloat(s.borderTopLeftRadius)||0)+'</clipPath>');
        clip=' clip-path="url(#'+id+'-clip)"';
      }
      const result='<g id="'+id+'" inkscape:label="'+escape(label)+'" opacity="'+s.opacity+'"'+clip+'>'+content+'</g>';
      if(el.tagName==="A" && /^https?:/.test(el.href))return '<a xlink:href="'+escape(el.href)+'">'+result+'</a>';
      return result;
    }
    const content=element(sheet);
    return {page:pageIndex+1,title:sheet.dataset.title||"",svg:'<?xml version="1.0" encoding="UTF-8"?>\n<svg version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="'+n(bounds.width*25.4/96)+'mm" height="'+n(bounds.height*25.4/96)+'mm" viewBox="0 0 '+n(bounds.width)+' '+n(bounds.height)+'"><title>'+escape(sheet.dataset.title||"Page "+(pageIndex+1))+'</title><defs><!--CATALOG_FONTS-->'+defs.join("")+'</defs>'+content+'</svg>'};
  });
})()`;
