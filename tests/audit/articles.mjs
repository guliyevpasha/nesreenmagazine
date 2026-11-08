// Yalnız oxuma: dərc olunmuş məqalələrin məlumat auditi
import fs from "fs";
const env = Object.fromEntries(fs.readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>[l.slice(0,l.indexOf("=")),l.slice(l.indexOf("=")+1).trim().replace(/^"|"$/g,"")]));
const pid = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, key = env.NEXT_PUBLIC_FIREBASE_API_KEY;
const r = await fetch(`https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents:runQuery?key=${key}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({structuredQuery:{from:[{collectionId:"articles"}],where:{fieldFilter:{field:{fieldPath:"status"},op:"EQUAL",value:{stringValue:"published"}}}}})});
const j = await r.json();
const un = v => v==null?undefined: "stringValue" in v?v.stringValue:"mapValue" in v?Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,un(x)])):"integerValue" in v?+v.integerValue:"booleanValue" in v?v.booleanValue:v;
const L=["az","en","ru","tr","ar"], out=[];
for (const row of j) { if(!row.document) continue; const f=Object.fromEntries(Object.entries(row.document.fields).map(([k,v])=>[k,un(v)])); f.id=row.document.name.split("/").pop(); out.push(f); }
fs.writeFileSync("tests/audit/articles.json",JSON.stringify(out.map(a=>({id:a.id,category:a.category,subcategory:a.subcategory,slug:a.slug,title:a.title,body_len:Object.fromEntries(L.map(l=>[l,(a.body?.[l]||"").length])),cover:a.coverImage?.slice(0,60)})),null,1));
console.log("published:",out.length);
for (const a of out) {
  const slugs = typeof a.slug==="string"?null:a.slug;
  console.log(`\n# ${a.id} [${a.category}/${a.subcategory||"-"}] slug=${slugs?"obj":"STRING:"+a.slug} cover=${a.coverImage? (a.coverImage.startsWith("data:")?"DATA-URI":"ok"):"EMPTY"}`);
  for (const l of L) {
    const iss=[]; const t=a.title?.[l], e=a.excerpt?.[l], b=a.body?.[l];
    if(!t?.trim()) iss.push("title boş"); if(!e?.trim()) iss.push("excerpt boş"); if(!b?.trim()) iss.push("body boş");
    if(slugs&&!slugs[l]?.trim()) iss.push("slug boş");
    if(/data:image\/[a-z+]+;base64/i.test(b||"")) iss.push("body base64 şəkil ("+Math.round(b.length/1024)+"KB)");
    if(b && b.length<200) iss.push("body qısa("+b.length+")");
    if(slugs&&slugs[l]&&!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slugs[l])) iss.push("slug qeyri-ASCII: "+slugs[l]);
    // dil uyğunsuzluğu
    if(l==="ar"&&t&&!/[؀-ۿ]/.test(t)) iss.push("title ərəbcə deyil");
    if(l==="ru"&&t&&!/[Ѐ-ӿ]/.test(t)) iss.push("title kirilcə deyil");
    if((l==="en")&&t&&/[əğışöüç]/i.test(t)) iss.push("en title AZ simvolları");
    if(l!=="az"&&t&&t===a.title?.az) iss.push("title AZ ilə eyni");
    if(l!=="az"&&b&&b===a.body?.az) iss.push("body AZ ilə eyni");
    if(iss.length) console.log(`  ${l}: ${iss.join("; ")}`);
  }
}
