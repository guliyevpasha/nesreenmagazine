// Audit: səhifə statusu, html lang/dir, title/description, hreflang, canonical, daxili linklər
import fs from "fs";
const B = "http://localhost:3100";
const L = ["az","en","ru","tr","ar"];
const sm = await (await fetch(B + "/sitemap.xml")).text();
const urls = new Set([...sm.matchAll(/<loc>([^<]*)/g)].map(m => new URL(m[1]).pathname));
const extra = ["","/astrologiya","/e-jurnal","/jurnallar","/elaqe","/haqqimizda","/abunelik","/emekdasliq","/secilenler","/loqo","/mexfilik","/sertler","/axtaris","/search","/astrologiya/burc/qoc","/bad-page-xyz"];
for (const l of L) for (const e of extra) urls.add(`/${l}${e}`);
const pages = [...urls];
const res = [], links = new Map();
async function get(p){ const r = await fetch(B+p,{redirect:"follow",signal:AbortSignal.timeout(90000)}); return {r, t: await r.text()}; }
const pool = async (arr, n, fn) => { let i=0; await Promise.all(Array.from({length:n},async()=>{while(i<arr.length){await fn(arr[i++]);}})); };
await pool(pages, 4, async p => {
  try {
    const {r,t} = await get(p);
    const o = { p, status: r.status, final: new URL(r.url).pathname };
    o.lang = (t.match(/<html[^>]*\blang="([^"]*)"/)||[])[1];
    o.dir = (t.match(/<html[^>]*\bdir="([^"]*)"/)||[])[1];
    o.title = (t.match(/<title[^>]*>([^<]*)/)||[])[1];
    o.desc = (t.match(/<meta name="description" content="([^"]*)"/)||[])[1];
    o.canon = (t.match(/<link rel="canonical" href="([^"]*)"/)||[])[1];
    o.hreflang = [...t.matchAll(/<link rel="alternate" hrefLang="([^"]*)"/gi)].map(m=>m[1]);
    o.hasNextErr = /NEXT_NOT_FOUND|Application error|__next_error__/.test(t);
    res.push(o); console.log("p",res.length,p,o.status);
    for (const m of t.matchAll(/<a [^>]*href="([^"#]*)"/g)) { const h = m[1].replace(/&amp;/g,"&"); if (h.startsWith("/")) { if(!links.has(h)) links.set(h,new Set()); links.get(h).add(p);} }
  } catch(e){ res.push({p,err:String(e)}); }
});
fs.writeFileSync("tests/audit/pages.json", JSON.stringify(res,null,1));
const lk = [...links.keys()].filter(h=>!h.startsWith("/_next"));
const lres = [];
await pool(lk, 8, async h => { try { const r = await fetch(B+h,{redirect:"follow",signal:AbortSignal.timeout(90000)}); console.log("l",h); lres.push({h,status:r.status,final:new URL(r.url).pathname,from:[...links.get(h)].slice(0,3)}); } catch(e){ lres.push({h,err:String(e)}); } });
fs.writeFileSync("tests/audit/links.json", JSON.stringify(lres,null,1));
console.log("pages",res.length,"links",lk.length);
