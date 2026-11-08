import { getDictionary } from "../../src/lib/i18n/dictionaries";
const L = ["az","en","ru","tr","ar"] as const;
const flat = (o:any,p=""):Record<string,string>=>Object.entries(o).reduce((a:any,[k,v])=>typeof v==="object"?{...a,...flat(v,p+k+".")}:{...a,[p+k]:String(v)},{});
const d:any = {}; for (const l of L) d[l]=flat(getDictionary(l));
const keys = Object.keys(d.az);
for (const l of L) { const k=Object.keys(d[l]); const m=keys.filter(x=>!(x in d[l])), e=k.filter(x=>!(x in d.az)); if(m.length||e.length) console.log(l,"missing",m,"extra",e); }
const azRe=/[əƏıİöÖüÜğĞşŞçÇ]/;
for (const k of keys) {
  for (const l of L) { if(!d[l][k]?.trim()) console.log("EMPTY",l,k); }
  for (const l of ["en","ru","tr","ar"] as const) {
    if (d[l][k]===d.az[k] && /[A-Za-zА-Яа-я؀-ۿ]{3,}/.test(d.az[k])) console.log("SAME_AS_AZ",l,k,JSON.stringify(d.az[k]));
  }
  // en identical to ru/tr/ar
  for (const l of ["ru","tr","ar"] as const) if(d[l][k]===d.en[k]&&d.en[k]!==d.az[k]&&/[A-Za-z]{4,}/.test(d.en[k])) console.log("SAME_AS_EN",l,k,JSON.stringify(d.en[k]));
  for (const l of ["en","ru","ar"] as const) if(azRe.test(d[l][k])) console.log("AZCHARS",l,k,d[l][k]);
  if(/[Ѐ-ӿ]/.test(d.en[k]+d.tr[k]+d.az[k])) console.log("CYR in en/tr/az",k);
  if(/[؀-ۿ]/.test(d.en[k]+d.tr[k]+d.az[k]+d.ru[k])) console.log("ARAB in non-ar",k);
  for (const l of ["en","ru","tr","ar"] as const) { const a=(d.az[k].match(/\{\w+\}/g)||[]).sort().join(), b=(d[l][k].match(/\{\w+\}/g)||[]).sort().join(); if(a!==b) console.log("PLACEHOLDER",l,k); }
}
console.log("keys",keys.length);
