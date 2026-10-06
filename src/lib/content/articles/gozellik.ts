import type { Article } from "@/lib/types";

/** GÖZƏLLİK — dəri, ətir və saç: elmə söykənən, tələsməyən ritualar. */
export const gozellikArticles: Article[] = [
  {
    id: "seed-gozellik-payiz-deri",
    slug: "payizda-deri-berpasi",
    category: "gozellik",
    subcategory: "deri-baximi",
    status: "published",
    featured: false,
    trending: true,
    coverImage: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&q=80",
    coverCredit: "Photo by Humphrey Muleba on Unsplash",
    coverAlt: {
      az: "Dəri baxımı vasitələri ilə səhər masası",
      en: "A morning table with skincare",
      ru: "Утренний стол со средствами ухода за кожей",
      tr: "Cilt bakım ürünleriyle sabah masası",
      ar: "طاولة صباحية عليها مستحضرات العناية بالبشرة",
    },
    title: {
      az: "Payızda dəri bərpası: yayın izini silən beş addım",
      en: "Repairing Skin in Autumn: Five Steps That Undo the Summer",
      ru: "Восстановление кожи осенью: пять шагов, стирающих след лета",
      tr: "Sonbaharda cilt onarımı: yazın izini silen beş adım",
      ar: "ترميم البشرة في الخريف: خمس خطوات تمحو أثر الصيف",
    },
    excerpt: {
      az: "Sentyabr dəri üçün yeni ilin başlanğıcıdır. Günəşdən sonra maneə funksiyası zəifləyir, ləkələr aydınlaşır, quruluq artır. Bunu düzəltmək üçün on məhsul yox, düzgün ardıcıllıqla beş addım lazımdır.",
      en: "September is the skin's new year. After the sun the barrier is weaker, pigmentation surfaces and dryness sets in. Fixing it takes five steps in the right order — not ten products.",
      ru: "Сентябрь — новый год для кожи. После солнца барьер ослаблен, пигментация проступает, сухость нарастает. Чтобы это исправить, нужны не десять средств, а пять шагов в правильном порядке.",
      tr: "Eylül, cilt için yeni yılın başlangıcıdır. Güneşten sonra bariyer zayıflar, lekeler belirginleşir, kuruluk artar. Bunu düzeltmek için on ürün değil, doğru sırayla beş adım gerekir.",
      ar: "سبتمبر هو رأس السنة بالنسبة إلى البشرة. بعد الشمس يضعف الحاجز، ويظهر التصبّغ، ويزداد الجفاف. وإصلاح ذلك يحتاج خمس خطوات بترتيب صحيح، لا عشرة منتجات.",
    },
    body: {
      az: `Yayın sonunda dəri üç şeydən əziyyət çəkir: nazikləşmiş maneə təbəqəsi, günəşdən qalan pigment və su itkisi. Payız baxımının bütün məntiqi bu üçünü ardıcıllıqla düzəltməkdən ibarətdir. Ardıcıllıq vacibdir — hamısını eyni həftədə başlamaq dərini daha da qıcıqlandırır.

## Addım 1 — Yumşaq təmizləmə (birinci həftə)

Köpüklü, "sıxılma hissi" verən yuyucudan imtina edin. Yağ və ya süd əsaslı təmizləyici, sonra pH-ı 5,5 ətrafında olan yumşaq gel. Üzü isti deyil, ilıq su ilə yuyun.

## Addım 2 — Maneəni bərpa etmək (1–2-ci həftə)

Bu mərhələdə aktiv maddələr yox, **seramid, xolesterol və yağ turşuları** lazımdır. Niasinamid (4–5%) də bu qrupa daxildir: qızartını azaldır, maneəni gücləndirir.

Əlamət ki, maneə bərpa olunur: kremdən sonra göynəmə hissi itir.

## Addım 3 — Nəmləndirmə qatı (2-ci həftədən)

Nəmləndirmə iki mərhələdir və çox vaxt biri unudulur:

- **Su çəkən** — hialuron turşusu, qliserin, panthenol. Nəm dəriyə çəkilir.
- **Bağlayan** — skvalan, shea yağı, dimetikon. Çəkilən nəm buxarlanmır.

Yalnız birincisini istifadə etmək quru havada dərini daha da qurudur.

## Addım 4 — Pigment üzərində iş (3-cü həftədən)

İndi — yalnız indi — aktivləri əlavə edin:

- **Səhər:** C vitamini (10–15%), sonra mütləq günəş kremi.
- **Axşam:** retinol həftədə iki gecədən başlayın, tədricən artırın. Retinol gecəsi eksfoliant istifadə etməyin.

## Addım 5 — Günəş kremi. Payızda da.

Payız buludu UVA şüalarını saxlamır və məhz UVA pigmentə cavabdehdir. SPF 30–50, hər səhər, hava necə olursa olsun. Bu addımı atsanız, əvvəlki dördü mənasızdır.

> Dəri baxımında ən çox işləyən "məhsul" — vaxtdır. Heç bir tərkib altı həftədən tez nəticə göstərmir.

## Nə etməmək lazımdır

- Eyni gecə retinol + AHA/BHA + C vitamini.
- Həftədə üç dəfədən çox eksfoliasiya.
- Hər həftə yeni məhsul sınamaq — nəyin işlədiyini heç vaxt bilməyəcəksiniz.

Bir rutini ən azı səkkiz həftə dəyişmədən aparın. Yalnız bundan sonra hökm çıxarın.`,
      en: `At the end of summer skin suffers from three things: a thinned barrier, pigment left by the sun, and water loss. The whole logic of an autumn routine is to repair those three in order. The order matters — starting everything in one week irritates the skin further.

## Step 1 — Gentle cleansing (week one)

Give up the foaming wash that leaves a tight feeling. Use an oil- or milk-based cleanser, then a mild gel with a pH near 5.5. Wash with lukewarm, never hot, water.

## Step 2 — Rebuilding the barrier (weeks one to two)

At this stage the skin needs not actives but **ceramides, cholesterol and fatty acids**. Niacinamide at 4–5% belongs to the same group: it calms redness and strengthens the barrier.

The sign that the barrier is healing: the sting after applying a cream disappears.

## Step 3 — The hydration layer (from week two)

Hydration has two parts, and one of them is usually forgotten:

- **Humectants** — hyaluronic acid, glycerin, panthenol. They draw water into the skin.
- **Occlusives** — squalane, shea butter, dimethicone. They keep that water from evaporating.

Using only the first in dry air leaves the skin drier than before.

## Step 4 — Working on pigment (from week three)

Now — and only now — add actives:

- **Morning:** vitamin C at 10–15%, always followed by sunscreen.
- **Evening:** begin retinol two nights a week and build up slowly. Never use an exfoliant on a retinol night.

## Step 5 — Sunscreen. In autumn too.

Autumn cloud does not stop UVA, and it is UVA that drives pigmentation. SPF 30–50, every morning, whatever the weather. Skip this and the previous four steps mean nothing.

> The most effective "product" in skincare is time. No ingredient shows results sooner than six weeks.

## What not to do

- Retinol, AHA/BHA and vitamin C on the same night.
- Exfoliating more than three times a week.
- Trying a new product every week — you will never know what worked.

Keep one routine unchanged for at least eight weeks. Only then pass judgement.`,
      ru: `К концу лета кожа страдает от трёх вещей: истончённого барьера, пигмента, оставленного солнцем, и потери воды. Вся логика осеннего ухода — восстанавливать эти три по порядку. Порядок важен: начинать всё в одну неделю значит раздражать кожу ещё сильнее.

## Шаг 1 — Мягкое очищение (первая неделя)

Откажитесь от пенящегося средства, после которого остаётся ощущение стянутости. Масляный или молочный очищающий состав, затем мягкий гель с pH около 5,5. Умывайтесь тёплой, а не горячей водой.

## Шаг 2 — Восстановление барьера (1–2-я неделя)

На этом этапе коже нужны не активы, а **керамиды, холестерин и жирные кислоты**. Ниацинамид (4–5%) относится к той же группе: снимает покраснение и укрепляет барьер.

Признак, что барьер восстанавливается: после крема исчезает пощипывание.

## Шаг 3 — Слой увлажнения (со второй недели)

Увлажнение состоит из двух частей, и об одной обычно забывают:

- **Увлажнители** — гиалуроновая кислота, глицерин, пантенол. Притягивают воду в кожу.
- **Окклюзивы** — сквалан, масло ши, диметикон. Не дают этой воде испариться.

Использовать только первое в сухом воздухе — значит высушить кожу ещё сильнее.

## Шаг 4 — Работа с пигментом (с третьей недели)

Теперь — и только теперь — добавляйте активы:

- **Утро:** витамин C (10–15%), обязательно сверху солнцезащитный крем.
- **Вечер:** ретинол начните с двух ночей в неделю и наращивайте медленно. В ночь с ретинолом никаких кислот.

## Шаг 5 — Солнцезащитный крем. Осенью тоже.

Осенние облака не задерживают UVA, а именно UVA отвечает за пигментацию. SPF 30–50, каждое утро, независимо от погоды. Пропустите этот шаг — и предыдущие четыре бессмысленны.

> Самое действенное «средство» в уходе — время. Ни один ингредиент не показывает результата раньше шести недель.

## Чего делать не стоит

- Ретинол + AHA/BHA + витамин C в одну ночь.
- Отшелушивание чаще трёх раз в неделю.
- Пробовать новое средство каждую неделю — вы никогда не поймёте, что сработало.

Держите один режим без изменений минимум восемь недель. Только потом выносите приговор.`,
      tr: `Yaz sonunda cilt üç şeyden zarar görür: incelmiş bariyer, güneşten kalan pigment ve su kaybı. Sonbahar bakımının tüm mantığı bu üçünü sırayla onarmaktır. Sıra önemlidir — hepsine aynı hafta başlamak cildi daha da tahriş eder.

## Adım 1 — Nazik temizlik (ilk hafta)

Ardında gerginlik hissi bırakan köpüklü temizleyiciden vazgeçin. Yağ ya da süt bazlı bir temizleyici, ardından pH'ı 5,5 civarında yumuşak bir jel. Yüzünüzü sıcak değil, ılık suyla yıkayın.

## Adım 2 — Bariyeri onarmak (1–2. hafta)

Bu aşamada cildin ihtiyacı aktifler değil, **seramid, kolesterol ve yağ asitleridir**. Niasinamid (%4–5) de aynı gruba girer: kızarıklığı yatıştırır, bariyeri güçlendirir.

Bariyerin onarıldığının işareti: kremden sonra yanma hissinin kaybolması.

## Adım 3 — Nemlendirme katmanı (ikinci haftadan itibaren)

Nemlendirme iki parçadan oluşur ve biri genellikle unutulur:

- **Nem çekiciler** — hyalüronik asit, gliserin, panthenol. Suyu cilde çeker.
- **Kapatıcılar** — skualan, shea yağı, dimetikon. Çekilen suyun buharlaşmasını engeller.

Kuru havada yalnızca birincisini kullanmak cildi daha da kurutur.

## Adım 4 — Pigment üzerinde çalışmak (üçüncü haftadan itibaren)

Şimdi — ancak şimdi — aktifleri ekleyin:

- **Sabah:** C vitamini (%10–15), üzerine mutlaka güneş kremi.
- **Akşam:** retinole haftada iki geceyle başlayın, yavaş yavaş artırın. Retinol gecesinde asit kullanmayın.

## Adım 5 — Güneş kremi. Sonbaharda da.

Sonbahar bulutu UVA'yı tutmaz ve pigmentasyondan sorumlu olan tam da UVA'dır. SPF 30–50, her sabah, hava nasıl olursa olsun. Bu adımı atlarsanız önceki dördü anlamsızdır.

> Cilt bakımında en çok işe yarayan «ürün» zamandır. Hiçbir içerik altı haftadan önce sonuç göstermez.

## Yapılmaması gerekenler

- Aynı gece retinol + AHA/BHA + C vitamini.
- Haftada üç kereden fazla peeling.
- Her hafta yeni bir ürün denemek — neyin işe yaradığını asla bilemezsiniz.

Bir rutini en az sekiz hafta değiştirmeden sürdürün. Kararı ancak ondan sonra verin.`,
      ar: `في نهاية الصيف تعاني البشرة من ثلاثة أمور: حاجز رقّ، وتصبّغ خلّفته الشمس، وفقدان للماء. ومنطق روتين الخريف كلّه هو إصلاح هذه الثلاثة بالترتيب. والترتيب مهمّ — فالبدء بكل شيء في أسبوع واحد يزيد التهيّج.

## الخطوة ١ — تنظيف لطيف (الأسبوع الأول)

استغني عن الغسول الرغوي الذي يترك إحساسًا بالشدّ. منظّف زيتي أو حليبي، ثم جِل لطيف بدرجة حموضة قرب ٥٫٥. واغسلي وجهك بماء فاتر لا ساخن.

## الخطوة ٢ — إعادة بناء الحاجز (الأسبوع الأول والثاني)

في هذه المرحلة لا تحتاج البشرة إلى المكوّنات الفعّالة بل إلى **السيراميد والكوليسترول والأحماض الدهنية**. والنياسيناميد بنسبة ٤–٥٪ ينتمي إلى المجموعة نفسها: يهدّئ الاحمرار ويقوّي الحاجز.

علامة تعافي الحاجز: اختفاء الوخز بعد وضع الكريم.

## الخطوة ٣ — طبقة الترطيب (من الأسبوع الثاني)

الترطيب جزءان، ويُنسى أحدهما عادةً:

- **الجاذبات للرطوبة** — حمض الهيالورونيك والغليسرين والبانثينول. تسحب الماء إلى البشرة.
- **الحاصرات** — السكوالان وزبدة الشيا والديميثيكون. تمنع تبخّر ذلك الماء.

واستعمال الأول وحده في هواء جافّ يترك البشرة أشدّ جفافًا.

## الخطوة ٤ — العمل على التصبّغ (من الأسبوع الثالث)

الآن — والآن فقط — أضيفي المكوّنات الفعّالة:

- **الصباح:** فيتامين C بتركيز ١٠–١٥٪، ويليه واقي الشمس دائمًا.
- **المساء:** ابدئي الريتينول ليلتين في الأسبوع وزيديه ببطء. ولا تستعملي مقشّرًا في ليلة الريتينول.

## الخطوة ٥ — واقي الشمس. في الخريف أيضًا.

غيوم الخريف لا توقف الأشعة فوق البنفسجية الطويلة، وهي المسؤولة عن التصبّغ. عامل حماية ٣٠–٥٠، كل صباح، مهما كان الطقس. وإن أهملتِ هذه الخطوة فلا معنى للخطوات الأربع السابقة.

> أكثر «منتج» فعّال في العناية بالبشرة هو الوقت. لا مكوّن يُظهر نتيجة قبل ستة أسابيع.

## ما لا ينبغي فعله

- الريتينول وأحماض AHA/BHA وفيتامين C في ليلة واحدة.
- التقشير أكثر من ثلاث مرات أسبوعيًا.
- تجربة منتج جديد كل أسبوع — لن تعرفي أبدًا ما الذي نفع.

التزمي بروتين واحد دون تغيير ثمانية أسابيع على الأقل. وبعدها فقط احكمي.`,
    },
    tags: {
      az: ["Dəri baxımı", "Payız", "Retinol"],
      en: ["Skincare", "Autumn", "Retinol"],
      ru: ["Уход за кожей", "Осень", "Ретинол"],
      tr: ["Cilt bakımı", "Sonbahar", "Retinol"],
      ar: ["العناية بالبشرة", "خريف", "ريتينول"],
    },
    author: "Nesreen",
    publishedAt: "2026-09-01",
    readingMinutes: 5,
  },
  {
    id: "seed-gozellik-etir",
    slug: "imza-etri-nece-qurulur",
    category: "gozellik",
    subcategory: "etir",
    status: "published",
    featured: false,
    trending: false,
    coverImage: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&q=80",
    coverCredit: "Photo by Mélissa Jeanty on Unsplash",
    coverAlt: {
      az: "İşığa tutulmuş ətir şüşəsi",
      en: "A perfume bottle held to the light",
      ru: "Флакон духов на свету",
      tr: "Işığa tutulmuş parfüm şişesi",
      ar: "قارورة عطر في الضوء",
    },
    title: {
      az: "İmza ətri: bir qadını xatırladan qoxu necə qurulur",
      en: "A Signature Scent: How to Build the Smell People Remember You By",
      ru: "Подписной аромат: как построить запах, по которому вас запоминают",
      tr: "İmza koku: sizi hatırlatan kokuyu nasıl kurarsınız",
      ar: "عطر التوقيع: كيف تُبنى الرائحة التي يتذكّرك بها الآخرون",
    },
    excerpt: {
      az: "İmza ətri bir şüşə deyil, bir quruluşdur: baza, ürək və zirvə. Ətir piramidasını anlayanda mağazada yarım saat qoxu iyləyib başınızın ağrımasına ehtiyac qalmır.",
      en: "A signature scent is not a bottle but a structure: base, heart and top. Once you understand the pyramid you no longer need half an hour of sniffing in a shop and a headache to show for it.",
      ru: "Подписной аромат — не флакон, а структура: база, сердце и верх. Поняв пирамиду, вы перестанете полчаса нюхать в магазине и уходить с головной болью.",
      tr: "İmza koku bir şişe değil, bir yapıdır: baz, kalp ve tepe. Piramidi anladığınızda mağazada yarım saat koklayıp baş ağrısıyla çıkmanıza gerek kalmaz.",
      ar: "عطر التوقيع ليس قارورة بل بنية: قاعدة وقلب وقمّة. وحين تفهمين الهرم لن تحتاجي إلى نصف ساعة من الشمّ في المتجر ينتهي بصداع.",
    },
    body: {
      az: `Ətir üç qatdan ibarətdir və hər qat fərqli vaxtda açılır.

## Piramida

**Zirvə (0–20 dəqiqə).** Sitrus, nanə, yaşıl notlar. Ən uçucu hissə. Mağazada iylədiyiniz — çox vaxt yalnız budur, ona görə də alışlar səhv çıxır.

**Ürək (20 dəqiqə – 3 saat).** Gül, jasmin, iris, ədviyyat. Ətrin əsl xarakteri buradadır.

**Baza (3 saat və sonra).** Ağac, müşk, amber, vanil, vetiver. Dəridə qalan iz. İnsanlar sizi məhz bu qatla xatırlayır.

Yəni **imza ətrini baza notuna görə seçmək lazımdır**, zirvəyə görə yox.

## Dörd ailə, dörd xarakter

- **Çiçəkli** — gül, jasmin, zanbaq. Klassik, tanış, geniş.
- **Şərq (amber)** — vanil, amber, ədviyyat. İsti, sıx, axşam.
- **Ağac** — sandal, sidr, vetiver. Sakit, ciddi, cinsiyyətsiz.
- **Təzə** — sitrus, akvatik, yaşıl. Gündüz, iş, yay.

İmza ətri adətən bir ailənin içindən çıxır. Payız-qış üçün ağac və amber, yaz-yay üçün çiçəkli və təzə daha yaxşı davranır.

## Mağazada necə yoxlamaq

1. Bir dəfəyə **üçdən çox** ətir sınamayın.
2. Kağıza yox, **dəriyə** vurun — dəri qoxunu dəyişir.
3. Vurduqdan sonra **20 dəqiqə gözləyin**. Zirvə keçməlidir.
4. Həmin gün almayın. Axşam evdə yenidən qiymətləndirin.
5. Qəhvə dənəsi iyləmək əfsanədir; burnu dincəltmək üçün öz dərinizin iyini çəkin.

> Ən yaxşı ətir — otağa girməmişdən əvvəl deyil, çıxandan sonra hiss olunandır.

## Qatlama (layering)

Bir qoxunu özününküləşdirməyin ən sadə yolu — onu iki qatda qurmaqdır:

- Neytral baza: müşk və ya sandal əsaslı sadə ətir.
- Üstünə: xarakterli ikinci ətir (iris, gül, tütün).

Nəticə heç kimdə eyni olmur, çünki nisbət sizindir.

## Konsentrasiya

- **Eau de Cologne** — 2–5%, 2 saat.
- **Eau de Toilette** — 5–15%, 3–4 saat.
- **Eau de Parfum** — 15–20%, 5–8 saat.
- **Parfum (ekstrakt)** — 20–30%, gün boyu.

Payızda EDP, yayda EDT daha düzgün işləyir. Və bir qayda: ətri sürtməyin — vurun. Sürtdükdə zirvə notları qırılır.`,
      en: `A perfume has three layers, and each opens at a different time.

## The pyramid

**Top (0–20 minutes).** Citrus, mint, green notes. The most volatile part. This is usually all you smell in a shop — which is why purchases go wrong.

**Heart (20 minutes – 3 hours).** Rose, jasmine, iris, spice. The real character of the scent lives here.

**Base (3 hours onward).** Wood, musk, amber, vanilla, vetiver. What remains on the skin. People remember you by this layer.

Which means **a signature scent should be chosen by its base**, not by its top.

## Four families, four characters

- **Floral** — rose, jasmine, lily. Classic, familiar, broad.
- **Oriental (amber)** — vanilla, amber, spice. Warm, dense, evening.
- **Woody** — sandalwood, cedar, vetiver. Quiet, serious, genderless.
- **Fresh** — citrus, aquatic, green. Daytime, work, summer.

A signature scent usually comes from inside one family. Wood and amber behave better in autumn and winter; floral and fresh in spring and summer.

## How to test in a shop

1. Try no more than **three** scents at once.
2. Apply to **skin**, not paper — skin changes a fragrance.
3. **Wait twenty minutes** after applying. The top has to pass.
4. Do not buy the same day. Judge it again at home in the evening.
5. Coffee beans are a myth; to reset your nose, smell your own skin.

> The best perfume is not the one noticed before you enter a room, but the one noticed after you leave it.

## Layering

The simplest way to make a scent your own is to build it in two layers:

- A neutral base: a simple musk or sandalwood fragrance.
- Above it: a second scent with character (iris, rose, tobacco).

The result is never identical on two people, because the proportion is yours.

## Concentration

- **Eau de Cologne** — 2–5%, about 2 hours.
- **Eau de Toilette** — 5–15%, 3–4 hours.
- **Eau de Parfum** — 15–20%, 5–8 hours.
- **Parfum (extrait)** — 20–30%, all day.

EDP works better in autumn, EDT in summer. And one rule: never rub perfume in — press it on. Rubbing breaks the top notes.`,
      ru: `У аромата три слоя, и каждый раскрывается в своё время.

## Пирамида

**Верх (0–20 минут).** Цитрус, мята, зелёные ноты. Самая летучая часть. Обычно именно это вы и нюхаете в магазине — оттого покупки и оказываются ошибочными.

**Сердце (20 минут — 3 часа).** Роза, жасмин, ирис, специи. Здесь живёт настоящий характер аромата.

**База (от 3 часов).** Дерево, мускус, амбра, ваниль, ветивер. То, что остаётся на коже. По этому слою вас и запоминают.

Значит, **подписной аромат нужно выбирать по базе**, а не по верху.

## Четыре семейства, четыре характера

- **Цветочные** — роза, жасмин, лилия. Классические, знакомые, широкие.
- **Восточные (амбровые)** — ваниль, амбра, специи. Тёплые, плотные, вечерние.
- **Древесные** — сандал, кедр, ветивер. Тихие, серьёзные, вне пола.
- **Свежие** — цитрус, акватика, зелень. День, работа, лето.

Подписной аромат обычно выходит изнутри одного семейства. Осенью и зимой лучше ведут себя древесные и амбровые, весной и летом — цветочные и свежие.

## Как тестировать в магазине

1. Пробуйте не больше **трёх** ароматов за раз.
2. Наносите на **кожу**, не на бумагу — кожа меняет запах.
3. **Подождите двадцать минут** после нанесения. Верх должен уйти.
4. Не покупайте в тот же день. Оцените снова вечером дома.
5. Кофейные зёрна — миф; чтобы сбросить обоняние, понюхайте собственную кожу.

> Лучший аромат замечают не до того, как вы вошли в комнату, а после того, как вышли.

## Слоение

Простейший способ сделать запах своим — построить его в два слоя:

- Нейтральная база: простой мускусный или сандаловый аромат.
- Сверху: второй аромат с характером (ирис, роза, табак).

Результат не повторяется у двух людей, потому что пропорция ваша.

## Концентрация

- **Eau de Cologne** — 2–5%, около 2 часов.
- **Eau de Toilette** — 5–15%, 3–4 часа.
- **Eau de Parfum** — 15–20%, 5–8 часов.
- **Parfum (экстракт)** — 20–30%, весь день.

Осенью лучше работает EDP, летом — EDT. И одно правило: аромат не растирают, а прижимают. Растирание ломает верхние ноты.`,
      tr: `Bir parfüm üç katmandan oluşur ve her katman farklı zamanda açılır.

## Piramit

**Tepe (0–20 dakika).** Narenciye, nane, yeşil notalar. En uçucu bölüm. Mağazada kokladığınız genellikle yalnızca budur — alışverişlerin yanlış çıkmasının sebebi de bu.

**Kalp (20 dakika – 3 saat).** Gül, yasemin, iris, baharat. Kokunun asıl karakteri buradadır.

**Baz (3 saatten sonra).** Odun, misk, amber, vanilya, vetiver. Ciltte kalan iz. İnsanlar sizi bu katmanla hatırlar.

Yani **imza koku baza göre seçilmelidir**, tepeye göre değil.

## Dört aile, dört karakter

- **Çiçeksi** — gül, yasemin, zambak. Klasik, tanıdık, geniş.
- **Doğulu (amber)** — vanilya, amber, baharat. Sıcak, yoğun, akşam.
- **Odunsu** — sandal, sedir, vetiver. Sakin, ciddi, cinsiyetsiz.
- **Ferah** — narenciye, akuatik, yeşil. Gündüz, iş, yaz.

İmza koku genellikle tek bir ailenin içinden çıkar. Sonbahar ve kışta odunsu ile amber, ilkbahar ve yazda çiçeksi ile ferah daha iyi davranır.

## Mağazada nasıl denenir

1. Bir seferde **üçten fazla** koku denemeyin.
2. Kâğıda değil **cilde** sürün — cilt kokuyu değiştirir.
3. Sürdükten sonra **yirmi dakika bekleyin**. Tepenin geçmesi gerekir.
4. Aynı gün almayın. Akşam evde yeniden değerlendirin.
5. Kahve çekirdeği bir efsanedir; burnu sıfırlamak için kendi cildinizi koklayın.

> En iyi parfüm odaya girmeden önce değil, çıktıktan sonra fark edilendir.

## Katmanlama

Bir kokuyu kendinize ait kılmanın en basit yolu onu iki katmanda kurmaktır:

- Nötr bir baz: sade misk ya da sandal kokusu.
- Üstüne: karakterli ikinci bir koku (iris, gül, tütün).

Sonuç iki kişide asla aynı olmaz, çünkü oran sizindir.

## Konsantrasyon

- **Eau de Cologne** — %2–5, yaklaşık 2 saat.
- **Eau de Toilette** — %5–15, 3–4 saat.
- **Eau de Parfum** — %15–20, 5–8 saat.
- **Parfum (ekstrakt)** — %20–30, gün boyu.

Sonbaharda EDP, yazda EDT daha doğru çalışır. Ve bir kural: parfümü ovalamayın, bastırın. Ovalamak tepe notalarını kırar.`,
      ar: `للعطر ثلاث طبقات، وكلٌّ منها تنفتح في وقت مختلف.

## الهرم

**القمّة (٠–٢٠ دقيقة).** حمضيات ونعناع ونوتات خضراء. الجزء الأكثر تطايرًا. وهذا غالبًا كل ما تشمّينه في المتجر — ولهذا تخيب عمليات الشراء.

**القلب (٢٠ دقيقة – ٣ ساعات).** ورد وياسمين وسوسن وتوابل. هنا تسكن شخصية العطر الحقيقية.

**القاعدة (من ٣ ساعات فصاعدًا).** خشب ومسك وعنبر وفانيليا وڤيتيڤر. ما يبقى على البشرة. وبهذه الطبقة يتذكّرك الناس.

أي إن **عطر التوقيع يُختار بقاعدته** لا بقمّته.

## أربع عائلات وأربع شخصيات

- **الزهرية** — ورد وياسمين وزنبق. كلاسيكية ومألوفة وواسعة.
- **الشرقية (العنبرية)** — فانيليا وعنبر وتوابل. دافئة وكثيفة ومسائية.
- **الخشبية** — صندل وأرز وڤيتيڤر. هادئة وجادّة وبلا جنس.
- **المنعشة** — حمضيات ومائية وخضراء. للنهار والعمل والصيف.

يخرج عطر التوقيع عادةً من داخل عائلة واحدة. الخشبية والعنبرية أفضل سلوكًا في الخريف والشتاء، والزهرية والمنعشة في الربيع والصيف.

## كيف تجرّبين في المتجر

1. لا تجرّبي أكثر من **ثلاثة** عطور في المرة الواحدة.
2. ضعيه على **البشرة** لا على الورق — فالبشرة تغيّر الرائحة.
3. **انتظري عشرين دقيقة** بعد الوضع. لا بدّ أن تمضي القمّة.
4. لا تشتري في اليوم نفسه. أعيدي التقييم مساءً في البيت.
5. حبوب البنّ خرافة؛ ولإراحة الأنف اشمّي بشرتك أنتِ.

> أفضل عطر ليس ما يُلاحَظ قبل دخولك الغرفة، بل ما يُلاحَظ بعد خروجك منها.

## التطبيق الطبقي

أبسط طريقة لجعل رائحة خاصة بك هي بناؤها في طبقتين:

- قاعدة محايدة: عطر بسيط بالمسك أو الصندل.
- وفوقها: عطر ثانٍ ذو شخصية (سوسن، ورد، تبغ).

والنتيجة لا تتكرّر عند شخصين، لأن النسبة نسبتك أنتِ.

## التركيز

- **كولونيا** — ٢–٥٪، نحو ساعتين.
- **ماء تواليت** — ٥–١٥٪، ٣–٤ ساعات.
- **ماء عطر** — ١٥–٢٠٪، ٥–٨ ساعات.
- **بارفان (خلاصة)** — ٢٠–٣٠٪، طوال اليوم.

ماء العطر أنسب للخريف، وماء التواليت للصيف. وقاعدة أخيرة: لا تفركي العطر بل اضغطيه. الفرك يكسر نوتات القمّة.`,
    },
    tags: {
      az: ["Ətir", "Notlar", "Qatlama"],
      en: ["Fragrance", "Notes", "Layering"],
      ru: ["Аромат", "Ноты", "Слоение"],
      tr: ["Parfüm", "Notalar", "Katmanlama"],
      ar: ["عطر", "نوتات", "طبقات"],
    },
    author: "Nesreen",
    publishedAt: "2026-08-28",
    readingMinutes: 4,
  },
  {
    id: "seed-gozellik-sac",
    slug: "payizda-sac-tokulmesi",
    category: "gozellik",
    subcategory: "sac",
    status: "published",
    featured: false,
    trending: false,
    coverImage: "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=1200&q=80",
    coverCredit: "Photo by Element5 Digital on Unsplash",
    coverAlt: {
      az: "Sağlam, parlaq saç",
      en: "Healthy, glossy hair",
      ru: "Здоровые блестящие волосы",
      tr: "Sağlıklı, parlak saç",
      ar: "شعر صحّي لامع",
    },
    title: {
      az: "Payız tökülməsi: saç haqqında elmin dediyi və demədiyi",
      en: "Autumn Shedding: What Science Says About Hair — and What It Doesn't",
      ru: "Осеннее выпадение: что наука говорит о волосах, а что нет",
      tr: "Sonbahar dökülmesi: bilimin saç hakkında söyledikleri ve söylemedikleri",
      ar: "تساقط الخريف: ما يقوله العلم عن الشعر وما لا يقوله",
    },
    excerpt: {
      az: "Sentyabr–oktyabrda saçın daha çox tökülməsi normaldır və bunun adı var: mövsümi telogen effluvium. Nə vaxt gözləmək, nə vaxt həkimə getmək lazım olduğunu ayırd edirik.",
      en: "Losing more hair in September and October is normal, and it has a name: seasonal telogen effluvium. Here is when to wait it out and when to see a doctor.",
      ru: "Усиленное выпадение волос в сентябре-октябре — норма, и у него есть название: сезонный телогеновый отток. Разбираем, когда ждать, а когда идти к врачу.",
      tr: "Eylül–ekimde saçın daha çok dökülmesi normaldir ve bunun bir adı var: mevsimsel telojen effluvium. Ne zaman beklemek, ne zaman hekime gitmek gerektiğini ayırıyoruz.",
      ar: "تساقط الشعر بغزارة أكبر في سبتمبر وأكتوبر أمر طبيعي وله اسم: تساقط التيلوجين الموسمي. إليك متى تنتظرين ومتى تراجعين الطبيب.",
    },
    body: {
      az: `Hər payız eyni sual qayıdır: "Saçım niyə birdən tökülməyə başladı?" Cavab çox vaxt sadədir — və qorxulu deyil.

## Saç dövrü

Hər tük üç mərhələdən keçir:

- **Anagen** — böyümə. 2–7 il davam edir. Saçın 85–90%-i bu mərhələdədir.
- **Katagen** — keçid. 2–3 həftə.
- **Telogen** — istirahət və tökülmə. 2–4 ay.

Gündə **50–100 tük** itirmək normadır. Payızda bu rəqəm bir müddət artır.

## Mövsümi telogen effluvium

Yayda daha çox saç anagen fazasında qalır (bədən dəri örtüyünü günəşdən qorumağa çalışır). Payıza yaxın həmin saçlar eyni vaxtda telogen fazasına keçir və birlikdə tökülür. Nəticə: sentyabr–noyabr aylarında gündəlik itki iki dəfə arta bilər.

Bu proses **6–10 həftə** çəkir və öz-özünə keçir. Saç seyrəlmir — sadəcə köhnə tük yeni tükə yer açır.

## Nə vaxt bu, mövsümi deyil

Həkimə müraciət etmək lazımdır, əgər:

- tökülmə **üç aydan çox** davam edirsə;
- başın **təpəsində** və ya ayrılan xəttdə açıq sahə yaranırsa;
- birlikdə **yorğunluq, soyuqdan üşümə, dırnaq kövrəkliyi** varsa (qalxanabənzər vəzi və ya dəmir yoxlanmalıdır);
- saç **dəstələrlə** və dairəvi sahələrlə tökülürsə.

Ən çox yoxlanan üç göstərici: **ferritin** (dəmir ehtiyatı), **TSH** (qalxanabənzər vəzi), **D vitamini**.

> Şampun saç tökülməsini dayandırmır. Şampun dərinin təmizliyinə cavabdehdir; saç isə bədənin içindən qidalanır.

## Payızda nə etməli

- **Zülal.** Saç keratindən ibarətdir. Gündəlik zülal azlığı ilk növbədə saça vurur.
- **Dəmir və sink.** Qırmızı ət, mərci, balqabaq tumu; qan analizindən sonra əlavə.
- **Baş dərisi.** Həftədə bir dəfə yumşaq eksfoliasiya, isti su yox — ilıq.
- **Mexaniki qayğı.** Yaş saçı daramayın, sıx quyruğu gündəlik bağlamayın, istilik alətlərindən əvvəl qoruyucu.
- **Səbir.** Yeni tük 1 sm-ə ayda çatır. Nəticəni üç aydan tez görməyəcəksiniz.

## Bir cümləlik xülasə

Payızda saç tökülməsi çox vaxt təbiətin təqvimidir, xəstəlik yox. Amma üç aydan sonra da davam edirsə — bu, artıq mövsüm deyil, siqnaldır.`,
      en: `Every autumn the same question returns: "Why has my hair suddenly started falling out?" The answer is usually simple — and not frightening.

## The hair cycle

Every strand passes through three phases:

- **Anagen** — growth. It lasts 2–7 years. Between 85 and 90% of hair is in this phase.
- **Catagen** — transition. Two to three weeks.
- **Telogen** — rest and shedding. Two to four months.

Losing **50–100 hairs a day** is normal. In autumn that figure rises for a while.

## Seasonal telogen effluvium

In summer more hair stays in the anagen phase — the body is trying to shield the scalp from the sun. Towards autumn those hairs move into telogen at the same time and shed together. The result: between September and November daily loss can double.

The process lasts **six to ten weeks** and resolves on its own. The hair is not thinning; old strands are making room for new ones.

## When it is not seasonal

See a doctor if:

- the shedding lasts **more than three months**;
- a visible open patch appears at the **crown** or along the parting;
- it comes with **fatigue, feeling cold, brittle nails** (thyroid and iron should be checked);
- hair falls in **clumps** or in round patches.

The three values checked most often: **ferritin** (iron stores), **TSH** (thyroid), and **vitamin D**.

> Shampoo does not stop hair loss. Shampoo is responsible for the cleanliness of the scalp; hair is fed from inside the body.

## What to do in autumn

- **Protein.** Hair is keratin. A daily protein shortfall shows in the hair first.
- **Iron and zinc.** Red meat, lentils, pumpkin seeds; supplements only after a blood test.
- **The scalp.** A gentle exfoliation once a week, and lukewarm water rather than hot.
- **Mechanical care.** Do not comb wet hair, do not wear a tight ponytail daily, and always use a protectant before heat.
- **Patience.** New hair grows about 1 cm a month. You will not see results in under three months.

## In one sentence

Autumn shedding is usually nature's calendar, not an illness. But if it is still going after three months, it is no longer a season — it is a signal.`,
      ru: `Каждую осень возвращается один и тот же вопрос: «Почему волосы вдруг начали выпадать?» Ответ обычно прост — и не страшен.

## Цикл волоса

Каждый волос проходит три фазы:

- **Анаген** — рост. Длится 2–7 лет. В этой фазе находится 85–90% волос.
- **Катаген** — переход. Две-три недели.
- **Телоген** — покой и выпадение. Два-четыре месяца.

Терять **50–100 волос в день** — норма. Осенью эта цифра на время растёт.

## Сезонный телогеновый отток

Летом больше волос остаётся в фазе анагена: организм пытается прикрыть кожу головы от солнца. К осени эти волосы одновременно переходят в телоген и выпадают вместе. Результат: с сентября по ноябрь суточная потеря может удвоиться.

Процесс длится **6–10 недель** и проходит сам. Волосы не редеют — старый волос уступает место новому.

## Когда это не сезонное

К врачу стоит обратиться, если:

- выпадение длится **больше трёх месяцев**;
- на **макушке** или по пробору появляется открытый участок;
- всё это сопровождается **усталостью, зябкостью, ломкостью ногтей** (нужно проверить щитовидную железу и железо);
- волосы выпадают **пучками** или круглыми очагами.

Три показателя, которые проверяют чаще всего: **ферритин** (запасы железа), **ТТГ** (щитовидная железа), **витамин D**.

> Шампунь не останавливает выпадение. Шампунь отвечает за чистоту кожи головы; волос питается изнутри организма.

## Что делать осенью

- **Белок.** Волос состоит из кератина. Ежедневная нехватка белка бьёт прежде всего по волосам.
- **Железо и цинк.** Красное мясо, чечевица, тыквенные семечки; добавки — только после анализа крови.
- **Кожа головы.** Мягкое отшелушивание раз в неделю и тёплая, а не горячая вода.
- **Механический уход.** Не расчёсывайте мокрые волосы, не носите тугой хвост ежедневно, перед укладкой — термозащита.
- **Терпение.** Новый волос отрастает примерно на 1 см в месяц. Раньше трёх месяцев результата не будет.

## Одним предложением

Осеннее выпадение чаще всего — календарь природы, а не болезнь. Но если оно продолжается и через три месяца, это уже не сезон, а сигнал.`,
      tr: `Her sonbahar aynı soru geri döner: «Saçım neden birden dökülmeye başladı?» Cevap genellikle basittir — ve korkutucu değildir.

## Saç döngüsü

Her tel üç evreden geçer:

- **Anagen** — büyüme. 2–7 yıl sürer. Saçın %85–90'ı bu evrededir.
- **Katagen** — geçiş. İki-üç hafta.
- **Telogen** — dinlenme ve dökülme. İki-dört ay.

Günde **50–100 tel** kaybetmek normaldir. Sonbaharda bu sayı bir süre yükselir.

## Mevsimsel telojen effluvium

Yazın daha çok saç anagen evresinde kalır; vücut saçlı deriyi güneşten korumaya çalışır. Sonbahara doğru bu teller aynı anda telojene geçer ve birlikte dökülür. Sonuç: eylül–kasım arasında günlük kayıp ikiye katlanabilir.

Süreç **6–10 hafta** sürer ve kendiliğinden geçer. Saç seyrelmiyor; eski tel yeni tele yer açıyor.

## Ne zaman mevsimsel değildir

Şu durumlarda hekime başvurun:

- dökülme **üç aydan uzun** sürüyorsa;
- **tepe** bölgesinde ya da ayrım çizgisinde açık bir alan oluşuyorsa;
- yanında **yorgunluk, üşüme, tırnak kırılganlığı** varsa (tiroid ve demir kontrol edilmeli);
- saç **tutamlar hâlinde** ya da yuvarlak alanlarla dökülüyorsa.

En sık bakılan üç değer: **ferritin** (demir deposu), **TSH** (tiroid) ve **D vitamini**.

> Şampuan saç dökülmesini durdurmaz. Şampuan saçlı derinin temizliğinden sorumludur; saç ise vücudun içinden beslenir.

## Sonbaharda ne yapmalı

- **Protein.** Saç keratindir. Günlük protein eksiği ilk olarak saça vurur.
- **Demir ve çinko.** Kırmızı et, mercimek, kabak çekirdeği; takviye ancak kan tahlilinden sonra.
- **Saçlı deri.** Haftada bir nazik peeling ve sıcak değil ılık su.
- **Mekanik bakım.** Islak saçı taramayın, her gün sıkı at kuyruğu yapmayın, ısı öncesi koruyucu kullanın.
- **Sabır.** Yeni saç ayda yaklaşık 1 cm uzar. Üç aydan önce sonuç göremezsiniz.

## Tek cümleyle

Sonbahar dökülmesi çoğu zaman doğanın takvimidir, hastalık değil. Ama üç aydan sonra da sürüyorsa, bu artık mevsim değil, bir sinyaldir.`,
      ar: `في كل خريف يعود السؤال نفسه: «لماذا بدأ شعري يتساقط فجأة؟» والجواب بسيط عادةً — وغير مخيف.

## دورة الشعرة

تمرّ كل شعرة بثلاث مراحل:

- **الأناجين** — النموّ. تستمرّ من سنتين إلى سبع. وفيها ٨٥–٩٠٪ من الشعر.
- **الكاتاجين** — الانتقال. أسبوعان إلى ثلاثة.
- **التيلوجين** — الراحة والتساقط. شهران إلى أربعة.

فقدان **٥٠ إلى ١٠٠ شعرة يوميًا** أمر طبيعي. وفي الخريف يرتفع هذا الرقم مدّة.

## تساقط التيلوجين الموسمي

في الصيف يبقى شعر أكثر في مرحلة الأناجين، إذ يحاول الجسم حماية فروة الرأس من الشمس. ومع اقتراب الخريف تنتقل تلك الشعرات إلى التيلوجين في وقت واحد فتتساقط معًا. والنتيجة: قد يتضاعف الفقد اليومي بين سبتمبر ونوفمبر.

تستمرّ هذه العملية **من ستة إلى عشرة أسابيع** وتزول وحدها. الشعر لا يخفّ؛ بل تفسح الشعرة القديمة مكانًا لجديدة.

## متى لا يكون موسميًا

راجعي الطبيب إذا:

- استمرّ التساقط **أكثر من ثلاثة أشهر**؛
- ظهرت مساحة مكشوفة في **أعلى الرأس** أو على خطّ الفرق؛
- رافقه **تعب وبرودة وهشاشة أظافر** (يجب فحص الغدّة الدرقية والحديد)؛
- تساقط الشعر **بخصلات** أو في بقع دائرية.

وأكثر ثلاث قيم تُفحص: **الفيريتين** (مخزون الحديد)، و**هرمون TSH** (الغدّة الدرقية)، و**فيتامين D**.

> الشامبو لا يوقف تساقط الشعر. الشامبو مسؤول عن نظافة الفروة؛ أما الشعر فيتغذّى من داخل الجسم.

## ماذا تفعلين في الخريف

- **البروتين.** الشعر كيراتين. ونقص البروتين اليومي يضرب الشعر أولًا.
- **الحديد والزنك.** لحوم حمراء وعدس وبذور قرع؛ والمكمّلات بعد تحليل الدم فقط.
- **فروة الرأس.** تقشير لطيف مرة أسبوعيًا، وماء فاتر لا ساخن.
- **العناية الميكانيكية.** لا تمشّطي الشعر المبلّل، ولا تشدّي ذيل الحصان يوميًا، واستعملي واقيًا قبل الحرارة.
- **الصبر.** ينمو الشعر الجديد نحو سنتيمتر في الشهر. ولن تري نتيجة قبل ثلاثة أشهر.

## في جملة واحدة

تساقط الخريف في الغالب تقويم الطبيعة لا مرض. لكنه إن استمرّ بعد ثلاثة أشهر فلم يعد موسمًا، بل إشارة.`,
    },
    tags: {
      az: ["Saç", "Sağlamlıq", "Payız"],
      en: ["Hair", "Health", "Autumn"],
      ru: ["Волосы", "Здоровье", "Осень"],
      tr: ["Saç", "Sağlık", "Sonbahar"],
      ar: ["شعر", "صحة", "خريف"],
    },
    author: "Nesreen",
    publishedAt: "2026-08-24",
    readingMinutes: 4,
  },
  // SOL TƏRƏF: Dəri baxımı (trending: false)
  {
    id: "seed-gozellik-spf",
    slug: "spf-secimine-praktik-yanaşma",
    category: "gozellik",
    subcategory: "deri-baximi",
    status: "published",
    featured: false,
    trending: false,
    coverImage: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1200&q=80",
    coverCredit: "Photo by Ariana Prestes on Unsplash",
    coverAlt: {
      az: "Günəş kremi",
      en: "Sunscreen",
      ru: "Солнцезащитный крем",
      tr: "Güneş kremi",
      ar: "واقي الشمس",
    },
    title: {
      az: "SPF seçiminə praktik yanaşma: hansı rəqəm, hansı filtr",
      en: "A Practical Approach to Choosing SPF: Which Number, Which Filter",
      ru: "Практический подход к выбору SPF: какая цифра, какой фильтр",
      tr: "SPF seçimine pratik yaklaşım: hangi rakam, hangi filtre",
      ar: "نهج عملي لاختيار عامل الحماية من الشمس: أي رقم، أي مرشّح",
    },
    excerpt: {
      az: "SPF 30 ilə 50 arasındakı fərq 1%-dir, amma qiymət iki dəfə bahadır. Mineral və kimyəvi filtr hansı halda işləyir və günəş kremi dedikdə 'geniş spektr' nə deməkdir?",
      en: "The difference between SPF 30 and 50 is one per cent, but the price is twice as high. When do mineral and chemical filters work, and what does 'broad-spectrum' mean when we say sunscreen?",
      ru: "Разница между SPF 30 и 50 — один процент, но цена в два раза выше. Когда работают минеральные и химические фильтры, и что значит «широкий спектр», когда говорим о солнцезащитном креме?",
      tr: "SPF 30 ile 50 arasındaki fark yüzde bir ama fiyat iki kat pahalı. Mineral ve kimyasal filtre ne zaman işe yarar ve güneş kremi dediğimizde 'geniş spektrum' ne demektir?",
      ar: "الفرق بين SPF 30 و50 هو واحد بالمئة، لكن السعر ضعفان. متى تعمل المرشّحات المعدنية والكيميائية، وماذا يعني «الطيف الواسع» حين نقول واقي الشمس؟",
    },
    body: {
      az: `Günəş kremi bazar etiqetlərlə doludur: SPF 15, 30, 50, 100, PA++++, geniş spektr. Hansı rəqəm həqiqətən vacibdir və hansını marketinq əlavə edir?

## SPF rəqəmi nə deməkdir

SPF yalnız UVB şüalarına qarşı qorunmanı ölçür. Rəqəm qorunma müddətini deyil, **qorunma dərəcəsini** göstərir.

- **SPF 15** — UVB-nin 93%-ni bloklayır.
- **SPF 30** — 97%-ni.
- **SPF 50** — 98%-ni.

30-dan 50-yə keçid yalnız 1% artımdır, amma qiymət tez-tez iki dəfə yüksəkdir.

> Günəş kremi ekspertləri SPF 30-u kifayət sayır — əsas şərt hər iki saatdan bir yeniləməkdir.

## Geniş spektr vacibdir

SPF yalnız UVB-yə qarşıdır. Amma dəri qocaldıran və pigmentə səbəb olan **UVA**-dır. "Geniş spektr" (broad-spectrum) və ya PA++++ işarəsi UVA qorunmasının olduğunu göstərir.

SPF 50 olub geniş spektr yoxdursa, yandırmadan qoruyur, amma qocalma davam edir.

## Mineral və ya kimyəvi?

**Mineral filtr** (sink oksid, titan dioksid):

- Dərinin üzərində oturur, fiziki maneə yaradır.
- Həssas dəri üçün yaxşıdır — qıcıqlandırmır.
- Tez-tez ağ iz buraxır (bəzi yeni formullar yoxdur).

**Kimyəvi filtr** (oksibenzon, avobenzon):

- Dəriyə hopub şüaları udur.
- Yüngül tekstura, ağ iz buraxmır.
- Bəzi tərkiblər hormonlara təsir göstərə bilər (hamısı yox).

Hamile və uşaqlar üçün mineral, qalanı üçün hər ikisi yaxşıdır.

## Nə qədər tətbiq etməli

Üz üçün **yarım çay qaşığı** (2 mq/sm²). Daha az qoysanız, SPF 50 SPF 15 kimi işləyir.

Boyun və dekolte ayrı yarım çay qaşığı. Unutmayın: boyun üzlə eyni yaşlanır.

## Yeniləmə qaydası

Hər iki saatdan bir. Ofisdə otursanız belə — pəncərə şüşəsi UVA-nı buraxır. Makiyajın üzərindən yeniləmək üçün SPF-li mineral tozdan istifadə edin.

## Bir qayda: buludlu gündə də

Bulud UVA-nı 80% buraxır. Payız və qış günəşi də pigmentə səbəb olur. Hər səhər, hava necə olursa olsun — bu addım danışılmazdır.`,
      en: `The sunscreen market is full of labels: SPF 15, 30, 50, 100, PA++++, broad-spectrum. Which number actually matters and which is marketing add-on?

## What the SPF number means

SPF measures only protection against UVB rays. The number shows not protection time but **protection degree**.

- **SPF 15** — blocks 93% of UVB.
- **SPF 30** — 97%.
- **SPF 50** — 98%.

The jump from 30 to 50 is only a one per cent increase, but the price is often double.

> Sunscreen experts consider SPF 30 sufficient — the main condition is reapplying every two hours.

## Broad-spectrum matters

SPF is only against UVB. But it is **UVA** that ages the skin and causes pigmentation. A "broad-spectrum" or PA++++ mark shows UVA protection exists.

If SPF 50 but no broad-spectrum, it protects from burning but aging continues.

## Mineral or chemical?

**Mineral filter** (zinc oxide, titanium dioxide):

- Sits on the skin, creates a physical barrier.
- Good for sensitive skin — does not irritate.
- Often leaves a white cast (some new formulas do not).

**Chemical filter** (oxybenzone, avobenzone):

- Absorbs into the skin, soaks up rays.
- Light texture, no white cast.
- Some ingredients may affect hormones (not all).

Mineral for pregnant women and children, either for the rest.

## How much to apply

For the face **half a teaspoon** (2 mg/cm²). If you apply less, SPF 50 works like SPF 15.

Neck and décolleté another half teaspoon. Remember: the neck ages the same as the face.

## Reapplication rule

Every two hours. Even sitting in an office — window glass lets UVA through. To reapply over make-up, use SPF mineral powder.

## One rule: on cloudy days too

Cloud lets 80% of UVA through. Autumn and winter sun also cause pigmentation. Every morning, whatever the weather — this step is non-negotiable.`,
      ru: `Рынок солнцезащитных кремов полон этикеток: SPF 15, 30, 50, 100, PA++++, широкий спектр. Какая цифра действительно важна, а что добавляет маркетинг?

## Что значит цифра SPF

SPF измеряет только защиту от UVB-лучей. Цифра показывает не время защиты, а **степень защиты**.

- **SPF 15** — блокирует 93% UVB.
- **SPF 30** — 97%.
- **SPF 50** — 98%.

Переход с 30 на 50 — это всего 1% прироста, но цена часто в два раза выше.

> Эксперты по солнцезащитным кремам считают SPF 30 достаточным — главное условие обновлять каждые два часа.

## Широкий спектр важен

SPF только против UVB. Но кожу старит и вызывает пигментацию именно **UVA**. Отметка «широкий спектр» (broad-spectrum) или PA++++ показывает, что защита от UVA есть.

Если SPF 50, но нет широкого спектра, защищает от ожогов, но старение продолжается.

## Минеральный или химический?

**Минеральный фильтр** (оксид цинка, диоксид титана):

- Сидит на коже, создаёт физический барьер.
- Хорош для чувствительной кожи — не раздражает.
- Часто оставляет белый след (некоторые новые формулы нет).

**Химический фильтр** (оксибензон, авобензон):

- Впитывается в кожу, поглощает лучи.
- Лёгкая текстура, не оставляет белого следа.
- Некоторые ингредиенты могут влиять на гормоны (не все).

Минеральный для беременных и детей, любой для остальных.

## Сколько наносить

Для лица **половина чайной ложки** (2 мг/см²). Если нанесёте меньше, SPF 50 работает как SPF 15.

Шея и декольте — ещё половина чайной ложки. Помните: шея стареет так же, как лицо.

## Правило обновления

Каждые два часа. Даже сидя в офисе — оконное стекло пропускает UVA. Чтобы обновить поверх макияжа, используйте минеральную пудру с SPF.

## Одно правило: и в пасмурный день

Облако пропускает 80% UVA. Осеннее и зимнее солнце тоже вызывает пигментацию. Каждое утро, независимо от погоды — этот шаг не обсуждается.`,
      tr: `Güneş kremi pazarı etiketlerle dolu: SPF 15, 30, 50, 100, PA++++, geniş spektrum. Hangi rakam gerçekten önemli ve hangisi pazarlama eklemesi?

## SPF rakamı ne demektir

SPF yalnızca UVB ışınlarına karşı korumayı ölçer. Rakam koruma süresini değil, **koruma derecesini** gösterir.

- **SPF 15** — UVB'nin %93'ünü bloke eder.
- **SPF 30** — %97'sini.
- **SPF 50** — %98'ini.

30'dan 50'ye geçiş sadece %1 artıştır ama fiyat genellikle iki kat yüksektir.

> Güneş kremi uzmanları SPF 30'u yeterli sayar — ana şart her iki saatte bir yenilemektir.

## Geniş spektrum önemlidir

SPF yalnızca UVB'ye karşıdır. Ama cildi yaşlandıran ve pigmentasyona neden olan **UVA**'dır. "Geniş spektrum" (broad-spectrum) veya PA++++ işareti UVA korumasının olduğunu gösterir.

SPF 50 var ama geniş spektrum yoksa, yanmaktan korur ama yaşlanma devam eder.

## Mineral mi kimyasal mı?

**Mineral filtre** (çinko oksit, titanyum dioksit):

- Cildin üzerinde durur, fiziksel bariyer yaratır.
- Hassas cilt için iyidir — tahriş etmez.
- Sıklıkla beyaz iz bırakır (bazı yeni formüller bırakmaz).

**Kimyasal filtre** (oksibenzon, avobenzon):

- Cilde emilir, ışınları emer.
- Hafif doku, beyaz iz bırakmaz.
- Bazı bileşenler hormonları etkileyebilir (hepsi değil).

Hamile ve çocuklar için mineral, geri kalanı için her ikisi iyidir.

## Ne kadar uygulanmalı

Yüz için **yarım çay kaşığı** (2 mg/cm²). Daha az uygularsanız SPF 50, SPF 15 gibi çalışır.

Boyun ve dekolte ayrı yarım çay kaşığı. Unutmayın: boyun yüz gibi yaşlanır.

## Yenileme kuralı

Her iki saatte bir. Ofiste otursan bile — pencere camı UVA'yı geçirir. Makyajın üzerinden yenilemek için SPF'li mineral pudradan kullanın.

## Bir kural: bulutlu günde de

Bulut UVA'nın %80'ini geçirir. Sonbahar ve kış güneşi de pigmentasyona neden olur. Her sabah, hava nasıl olursa olsun — bu adım tartışılmaz.`,
      ar: `سوق واقيات الشمس مليء بالملصقات: SPF 15 و30 و50 و100، وPA++++، والطيف الواسع. أي رقم مهمّ حقًا وأيّ منها إضافة تسويقية؟

## ماذا يعني رقم SPF

SPF يقيس فقط الحماية من أشعة UVB. الرقم يُظهر ليس مدة الحماية بل **درجة الحماية**.

- **SPF 15** — يحجب 93% من UVB.
- **SPF 30** — 97%.
- **SPF 50** — 98%.

الانتقال من 30 إلى 50 هو زيادة 1% فقط، لكن السعر غالبًا الضعف.

> خبراء واقيات الشمس يعتبرون SPF 30 كافيًا — الشرط الأساسي التجديد كل ساعتين.

## الطيف الواسع مهمّ

SPF فقط ضدّ UVB. لكن الذي يُشيّخ البشرة ويسبب التصبّغ هو **UVA**. علامة «الطيف الواسع» (broad-spectrum) أو PA++++ تُظهر وجود حماية من UVA.

إن كان SPF 50 لكن لا طيف واسع، يحمي من الحروق لكن التشيّخ مستمرّ.

## معدني أم كيميائي؟

**مرشّح معدني** (أكسيد الزنك، ثاني أكسيد التيتانيوم):

- يجلس على البشرة، يخلق حاجزًا فيزيائيًا.
- جيد للبشرة الحسّاسة — لا يُهيّج.
- غالبًا يترك أثرًا أبيض (بعض الصيغ الجديدة لا).

**مرشّح كيميائي** (أوكسيبنزون، أفوبنزون):

- يُمتَصّ في البشرة، يمتصّ الأشعة.
- قوام خفيف، لا يترك أثرًا أبيض.
- بعض المكوّنات قد تؤثّر على الهرمونات (ليست كلّها).

معدني للحوامل والأطفال، أيّ منهما للباقي.

## كم تطبّقين

للوجه **نصف ملعقة شاي** (2 مغ/سم²). إن طبّقتِ أقلّ، SPF 50 يعمل مثل SPF 15.

العنق والصدر نصف ملعقة شاي أخرى. تذكّري: العنق يتشيّخ مثل الوجه.

## قاعدة التجديد

كل ساعتين. حتى جالسة في مكتب — زجاج النافذة يُمرّر UVA. للتجديد فوق المكياج، استخدمي بودرة معدنية بـSPF.

## قاعدة واحدة: في الأيام الغائمة أيضًا

الغيوم تُمرّر 80% من UVA. شمس الخريف والشتاء تسبب التصبّغ أيضًا. كل صباح، مهما كان الطقس — هذه الخطوة غير قابلة للنقاش.`,
    },
    tags: {
      az: ["SPF", "Günəş kremi", "Dəri baxımı"],
      en: ["SPF", "Sunscreen", "Skincare"],
      ru: ["SPF", "Солнцезащитный крем", "Уход за кожей"],
      tr: ["SPF", "Güneş kremi", "Cilt bakımı"],
      ar: ["SPF", "واقي الشمس", "العناية بالبشرة"],
    },
    author: "Nesreen",
    publishedAt: "2026-09-10",
    readingMinutes: 3,
  },
  // SOL TƏRƏF: Makiyaj (trending: false)
  {
    id: "seed-gozellik-red-lipstick",
    slug: "qirmizi-dodaq-boyasi-qaydasi",
    category: "gozellik",
    subcategory: "makiyaj",
    status: "published",
    featured: false,
    trending: false,
    coverImage: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200&q=80",
    coverCredit: "Photo by Amy Shamblen on Unsplash",
    coverAlt: {
      az: "Qırmızı dodaq boyası",
      en: "Red lipstick",
      ru: "Красная помада",
      tr: "Kırmızı ruj",
      ar: "أحمر شفاه أحمر",
    },
    title: {
      az: "Qırmızı dodaq boyası qaydası: dəri tonuna görə çalar seçimi",
      en: "The Red Lipstick Rule: Choosing the Shade by Skin Tone",
      ru: "Правило красной помады: выбор оттенка по тону кожи",
      tr: "Kırmızı ruj kuralı: cilt tonuna göre ton seçimi",
      ar: "قاعدة أحمر الشفاه الأحمر: اختيار الدرجة حسب لون البشرة",
    },
    excerpt: {
      az: "Qırmızı dodaq boyası universal deyil — sərin və isti tonları var. Dəri tonunuza uyğun çalara düz düşmək üçün biləyin damarlarına baxın.",
      en: "Red lipstick is not universal — it has cool and warm tones. To hit the right shade for your skin tone, look at the veins on your wrist.",
      ru: "Красная помада не универсальна — у неё есть холодные и тёплые тона. Чтобы попасть в правильный оттенок для вашего тона кожи, посмотрите на вены на запястье.",
      tr: "Kırmızı ruj evrensel değildir — serin ve sıcak tonları vardır. Cilt tonunuza uygun tonu bulmak için bileğinizdeki damarlara bakın.",
      ar: "أحمر الشفاه الأحمر ليس عالميًّا — له درجات باردة ودافئة. لتصيبي الدرجة الصحيحة للون بشرتك، انظري إلى عروق معصمك.",
    },
    body: {
      az: `Qırmızı dodaq boyası klassikdir, amma hər qırmızı hər dəriyə uyğun deyil. Səbəb sadədir: qırmızının özü iki qrupa bölünür — sərin və isti.

## Dəri tonunuzu necə müəyyən etmək olar

Biləyinizin içərisindəki damarları təbii işıqda yoxlayın:

- **Damarlar mavi və ya bənövşəyi görünürsə** — dəri tonu sərindir.
- **Damarlar yaşıl görünürsə** — dəri tonu istidir.
- **Hər ikisini görürsünüzsə** — neytral tondasınız, hər iki qırmızı sizə yaraşır.

## Sərin dəri tonu üçün qırmızı

Sərin (gül) tonda mavi alt ton olur. Ona uyğun qırmızı:

- **Yaqut qırmızısı** — mavi alt tonlu klassik qırmızı.
- **Albalı** — tünd, dərin, bir az bənövşəyi çalar.
- **Fuchsia-qırmızı** — parlaq, rozəyə yaxın qırmızı.

Bunlar dişi daha ağ, dərini daha təravətli göstərir.

## İsti dəri tonu üçün qırmızı

İsti (qızılı) tonda sarı alt ton olur. Ona uyğun qırmızı:

- **Narıncı-qırmızı** — klassik qırmızının isti versiyası.
- **Kərpic qırmızısı** — tünd, qəhvəyə yaxın qırmızı.
- **Koral-qırmızı** — açıq, günəşli, yayın qırmızısı.

Bunlar dərinin öz istiliyini qoruyur, süni görünmür.

## Nəzərdə saxlamaq lazımdır

- **Mətt finish** — dodaq forması bəllidir, professional görünür.
- **Parlaq finish** — həcm verir, gənc görünür.
- **Satin finish** — mətt və parlaq arasında, ən praktikdir.

İlk dəfə qırmızı sınayırsınızsa, satin finish seçin — bağışlamır, amma sərtləşdirmir.

## Baza və bitirmə

Qırmızı dodaq boyası hər qüsuru göstərir. Əvvəlcə balzam, sonra dodaq üçün baza və ya konsiler. Bitirdikdən sonra konturu dodaq qələmi ilə çəkin.

> Yaxşı qırmızı dodaq boyası sizi makiyaj etmədən otağa girməyə qoymaz — amma çıxarkən özünə inam verir.

## Sınaq qaydası

Dodaq boyasını dükanın işığında yox, pəncərə yanında sınayın. Əl sırtında yox, dodağın alt kənarında yoxlayın — dəri tonu orada daha yaxındır.`,
      en: `Red lipstick is a classic, but not every red suits every skin. The reason is simple: red itself divides into two groups — cool and warm.

## How to determine your skin tone

Check the veins on the inside of your wrist in natural light:

- **Veins look blue or purple** — skin tone is cool.
- **Veins look green** — skin tone is warm.
- **You see both** — you are neutral, both reds suit you.

## Red for cool skin tone

Cool (pink) tone has a blue undertone. The matching red:

- **Ruby red** — classic red with a blue undertone.
- **Cherry** — dark, deep, a little purple shade.
- **Fuchsia-red** — bright, close to pink red.

These make teeth look whiter, skin fresher.

## Red for warm skin tone

Warm (golden) tone has a yellow undertone. The matching red:

- **Orange-red** — the warm version of classic red.
- **Brick red** — dark, close to brown red.
- **Coral-red** — light, sunny, summer red.

These preserve the skin's own warmth, look not artificial.

## Keep in mind

- **Matte finish** — lip shape is clear, looks professional.
- **Glossy finish** — gives volume, looks young.
- **Satin finish** — between matte and glossy, most practical.

If trying red for the first time, choose satin finish — it forgives but does not harden.

## Base and finish

Red lipstick shows every flaw. First balm, then lip base or concealer. After finish, draw the contour with a lip pencil.

> A good red lipstick will not let you leave the room without make-up — but gives you confidence when you do.

## Testing rule

Test the lipstick not in shop light but by a window. Check not on the back of your hand but on the lower edge of your lip — skin tone is closer there.`,
      ru: `Красная помада — классика, но не каждый красный подходит каждой коже. Причина проста: сам красный делится на две группы — холодный и тёплый.

## Как определить свой тон кожи

Проверьте вены на внутренней стороне запястья при естественном свете:

- **Вены выглядят синими или фиолетовыми** — тон кожи холодный.
- **Вены выглядят зелёными** — тон кожи тёплый.
- **Видите оба** — у вас нейтральный тон, оба красных вам идут.

## Красный для холодного тона кожи

Холодный (розовый) тон имеет синий подтон. Подходящий красный:

- **Рубиновый красный** — классический красный с синим подтоном.
- **Вишнёвый** — тёмный, глубокий, чуть фиолетовый оттенок.
- **Фуксия-красный** — яркий, близкий к розовому красный.

Эти делают зубы белее, кожу свежее.

## Красный для тёплого тона кожи

Тёплый (золотистый) тон имеет жёлтый подтон. Подходящий красный:

- **Оранжево-красный** — тёплая версия классического красного.
- **Кирпично-красный** — тёмный, близкий к коричневому красный.
- **Коралово-красный** — светлый, солнечный, летний красный.

Эти сохраняют собственное тепло кожи, не выглядят искусственно.

## Иметь в виду

- **Матовое покрытие** — форма губ чёткая, выглядит профессионально.
- **Глянцевое покрытие** — даёт объём, выглядит молодо.
- **Сатиновое покрытие** — между матовым и глянцевым, самое практичное.

Если пробуете красный впервые, выбирайте сатиновое покрытие — прощает, но не ожесточает.

## База и финиш

Красная помада показывает каждый изъян. Сначала бальзам, потом база для губ или консилер. После финиша обведите контур карандашом для губ.

> Хорошая красная помада не позволит выйти из комнаты без макияжа — но даст уверенность, когда выходишь.

## Правило теста

Тестируйте помаду не в свете магазина, а у окна. Проверяйте не на тыльной стороне руки, а на нижнем краю губы — тон кожи там ближе.`,
      tr: `Kırmızı ruj klasiktir ama her kırmızı her cilde uygun değildir. Sebep basittir: kırmızının kendisi iki gruba ayrılır — serin ve sıcak.

## Cilt tonunuzu nasıl belirlersiniz

Bileğinizin iç tarafındaki damarları doğal ışıkta kontrol edin:

- **Damarlar mavi veya mor görünüyorsa** — cilt tonu serindir.
- **Damarlar yeşil görünüyorsa** — cilt tonu sıcaktır.
- **İkisini de görüyorsanız** — nötral tondasınız, her iki kırmızı size yakışır.

## Serin cilt tonu için kırmızı

Serin (pembe) tonda mavi alt ton olur. Ona uygun kırmızı:

- **Yakut kırmızısı** — mavi alt tonlu klasik kırmızı.
- **Kiraz** — koyu, derin, biraz mor ton.
- **Fuşya-kırmızı** — parlak, pembeye yakın kırmızı.

Bunlar dişleri daha beyaz, cildi daha taze gösterir.

## Sıcak cilt tonu için kırmızı

Sıcak (altın) tonda sarı alt ton olur. Ona uygun kırmızı:

- **Turuncu-kırmızı** — klasik kırmızının sıcak versiyonu.
- **Tuğla kırmızısı** — koyu, kahverengiye yakın kırmızı.
- **Mercan-kırmızı** — açık, güneşli, yazın kırmızısı.

Bunlar cildin kendi sıcaklığını korur, yapay görünmez.

## Akılda tutulmalı

- **Mat bitim** — dudak şekli belirgin, profesyonel görünür.
- **Parlak bitim** — hacim verir, genç görünür.
- **Saten bitim** — mat ve parlak arası, en pratiktir.

İlk kez kırmızı deniyorsanız saten bitim seçin — affeder ama sertleştirmez.

## Baz ve bitiş

Kırmızı ruj her kusuru gösterir. Önce balzam, sonra dudak bazı veya kapatıcı. Bitirdikten sonra konturu dudak kalemiyle çizin.

> İyi bir kırmızı ruj sizi makyajsız odadan çıkmaya bırakmaz — ama çıkarken özgüven verir.

## Test kuralı

Rujutesti mağaza ışığında değil pencere yanında yapın. El sırtında değil dudağın alt kenarında kontrol edin — cilt tonu orada daha yakındır.`,
      ar: `أحمر الشفاه الأحمر كلاسيكي، لكن ليس كل أحمر يناسب كل بشرة. السبب بسيط: الأحمر نفسه ينقسم إلى مجموعتين — بارد ودافئ.

## كيف تحدّدين لون بشرتك

افحصي العروق في باطن معصمك تحت ضوء طبيعي:

- **العروق تبدو زرقاء أو بنفسجية** — لون البشرة بارد.
- **العروق تبدو خضراء** — لون البشرة دافئ.
- **ترين كليهما** — أنتِ محايدة، كلا الأحمرين يناسبك.

## أحمر للون البشرة البارد

اللون البارد (الوردي) له لون تحتي أزرق. الأحمر المناسب:

- **أحمر ياقوتي** — أحمر كلاسيكي بلون تحتي أزرق.
- **كرزي** — داكن، عميق، لون بنفسجي قليلًا.
- **أحمر-فوشيا** — زاهٍ، قريب من الوردي الأحمر.

هذه تجعل الأسنان أكثر بياضًا، والبشرة أكثر نضارة.

## أحمر للون البشرة الدافئ

اللون الدافئ (الذهبي) له لون تحتي أصفر. الأحمر المناسب:

- **أحمر-برتقالي** — النسخة الدافئة من الأحمر الكلاسيكي.
- **أحمر طوبي** — داكن، قريب من البني الأحمر.
- **أحمر-مرجاني** — فاتح، مشمس، أحمر الصيف.

هذه تحفظ دفء البشرة ذاته، لا تبدو اصطناعية.

## تذكّري

- **تشطيب مطفأ** — شكل الشفاه واضح، يبدو احترافيًّا.
- **تشطيب لامع** — يعطي حجمًا، يبدو شابًّا.
- **تشطيب ساتان** — بين المطفأ واللامع، الأكثر عمليّة.

إن جرّبتِ الأحمر لأول مرة، اختاري تشطيب ساتان — يسامح لكن لا يقسّي.

## قاعدة ونهاية

أحمر الشفاه الأحمر يُظهر كل عيب. أولًا بلسم، ثم قاعدة الشفاه أو كونسيلر. بعد الانتهاء، ارسمي الخطوط بقلم الشفاه.

> أحمر شفاه أحمر جيد لن يدعك تخرجين من الغرفة بدون مكياج — لكنه يعطيك ثقة حين تخرجين.

## قاعدة الاختبار

اختبري أحمر الشفاه ليس في ضوء المتجر بل بجانب نافذة. افحصي ليس على ظهر يدك بل على الحافة السفلى لشفتك — لون البشرة أقرب هناك.`,
    },
    tags: {
      az: ["Qırmızı dodaq boyası", "Makiyaj", "Rəng"],
      en: ["Red lipstick", "Make-up", "Colour"],
      ru: ["Красная помада", "Макияж", "Цвет"],
      tr: ["Kırmızı ruj", "Makyaj", "Renk"],
      ar: ["أحمر شفاه أحمر", "مكياج", "لون"],
    },
    author: "Nesreen",
    publishedAt: "2026-09-05",
    readingMinutes: 3,
  },
  // SOL TƏRƏF: Makiyaj (trending: false)
  {
    id: "seed-gozellik-qaş-forma",
    slug: "qas-formasini-uz-formasina-uygunlastirmaq",
    category: "gozellik",
    subcategory: "makiyaj",
    status: "published",
    featured: false,
    trending: false,
    coverImage: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1200&q=80",
    coverCredit: "Photo by Christin Hume on Unsplash",
    coverAlt: {
      az: "Qaş formaları",
      en: "Eyebrow shapes",
      ru: "Формы бровей",
      tr: "Kaş şekilleri",
      ar: "أشكال الحواجب",
    },
    title: {
      az: "Qaş forması üz formasına görə necə uyğunlaşdırılır",
      en: "How to Match Eyebrow Shape to Face Shape",
      ru: "Как подобрать форму бровей под форму лица",
      tr: "Kaş şeklini yüz şekline nasıl uyumlu hale getirirsiniz",
      ar: "كيف توافق شكل الحاجب مع شكل الوجه",
    },
    excerpt: {
      az: "Qaş forması üz cizgilərini tənzimləyir: dairəvi üzə bucaq lazımdır, düzbucaqlı üzə yumşaq qövs. Yanlış forma üzü balans və mütənasiblikdən məhrum edir.",
      en: "Eyebrow shape regulates facial lines: round faces need angles, rectangular faces need soft arches. Wrong shape deprives the face of balance and proportion.",
      ru: "Форма бровей регулирует линии лица: круглому нужен угол, прямоугольному — мягкая дуга. Неправильная форма лишает лицо баланса и пропорций.",
      tr: "Kaş şekli yüz çizgilerini düzenler: yuvarlak yüze açı lazımdır, dikdörtgen yüze yumuşak kemer. Yanlış şekil yüzü dengeden ve orantıdan mahrum eder.",
      ar: "شكل الحاجب يضبط خطوط الوجه: الوجه الدائري يحتاج زاوية، المستطيل يحتاج قوسًا ناعمًا. الشكل الخاطئ يحرم الوجه من التوازن والتناسب.",
    },
    body: {
      az: "Oval üz universaldır — hər forma yaraşır. Dairəvi üzə açılı qaş, uzun üzə üfüqi qaş, kvadrat üzə qövslü qaş. Formula sadədir: üzün kəskin xətlərini yumşaldın, yumşaq xətləri kəskinləşdirin.\n\nQaş formasını seçərkən burunun enini və gözlərin arasındakı məsafəni də nəzərə alın. Qaşın başlanğıcı burnun qanadı ilə göz guşəsini birləşdirən xətt üzərində olmalıdır. Ən yüksək nöqtə bəbək mərkəzindən şaquli xətt boyunca, son nöqtə isə burun qanadı ilə göz guşəsini birləşdirən diaqonal xətt üzərindədir.\n\nQaşları formalaşdırarkən tük yönünü izləyin və həmişə aşağıdan yox, yuxarıdan başlayın. Simmetriyanı qorumaq üçün hər iki qaşda ardıcıl olaraq eyni hərəkətləri edin. Əgər qaşların təbii forması üz formasına uyğun gəlmirsə, qaş boyası və jel ilə forma illüziyası yaratmaq mümkündür.",
      en: "Oval face is universal — every shape suits. Round face needs angled brow, long face needs horizontal brow, square face needs arched brow. The formula is simple: soften sharp facial lines, sharpen soft lines.\n\nWhen choosing brow shape, also consider nose width and distance between eyes. The start of the brow should be on the line connecting the nose wing with the eye corner. The highest point is along a vertical line from the pupil center, the end point is on the diagonal line connecting the nose wing with the eye corner.\n\nWhen shaping brows, follow the hair direction and always start from the top, not bottom. To maintain symmetry, do the same movements on both brows sequentially. If the natural brow shape does not match the face shape, you can create a shape illusion with brow dye and gel.",
      ru: "Овальное лицо универсально — подходит любая форма. Круглому нужна угловатая бровь, длинному — горизонтальная, квадратному — дугообразная. Формула проста: смягчите резкие линии лица, заострите мягкие.\n\nВыбирая форму бровей, учитывайте также ширину носа и расстояние между глазами. Начало брови должно находиться на линии, соединяющей крыло носа с уголком глаза. Наивысшая точка — по вертикальной линии от центра зрачка, конечная точка — на диагональной линии, соединяющей крыло носа с уголком глаза.\n\nПридавая форму бровям, следуйте направлению волос и всегда начинайте сверху, а не снизу. Чтобы сохранить симметрию, выполняйте одинаковые движения на обеих бровях последовательно. Если естественная форма бровей не соответствует форме лица, можно создать иллюзию формы краской и гелем для бровей.",
      tr: "Oval yüz evrenseldir — her şekil yakışır. Yuvarlak yüze açılı kaş, uzun yüze yatay kaş, kare yüze kemerli kaş. Formül basittir: yüzün keskin çizgilerini yumuşatın, yumuşak çizgileri keskinleştirin.\n\nKaş şeklini seçerken burun genişliğini ve gözler arasındaki mesafeyi de dikkate alın. Kaşın başlangıcı burun kanadı ile göz köşesini birleştiren çizgi üzerinde olmalıdır. En yüksek nokta göz bebeği merkezinden dikey çizgi boyunca, son nokta burun kanadı ile göz köşesini birleştiren çapraz çizgi üzerindedir.\n\nKaşları şekillendirirken tüy yönünü izleyin ve her zaman aşağıdan değil yukarıdan başlayın. Simetriyi korumak için her iki kaşta sırayla aynı hareketleri yapın. Kaşların doğal şekli yüz şekline uymazsa kaş boyası ve jeli ile şekil illüzyonu yaratmak mümkündür.",
      ar: "الوجه البيضوي عام — كل شكل يناسب. الوجه الدائري يحتاج حاجبًا مزوّى، الطويل يحتاج حاجبًا أفقيًّا، المربّع يحتاج حاجبًا مقوّسًا. الصيغة بسيطة: ليّن خطوط الوجه الحادّة، حدّد الخطوط الناعمة.\n\nعند اختيار شكل الحاجب ضع في الاعتبار أيضًا عرض الأنف والمسافة بين العينين. يجب أن يكون بدء الحاجب على الخط الذي يربط جناح الأنف بزاوية العين. أعلى نقطة على خط عمودي من مركز البؤبؤ، النقطة النهائية على الخط القطري الذي يربط جناح الأنف بزاوية العين.\n\nعند تشكيل الحواجب اتبع اتجاه الشعر وابدأ دائمًا من الأعلى لا من الأسفل. للحفاظ على التماثل افعل نفس الحركات على كلا الحاجبين بالتتابع. إذا لم يتطابق شكل الحاجب الطبيعي مع شكل الوجه يمكنك خلق وهم شكل بصبغة وجل الحاجب.",
    },
    tags: {
      az: ["Qaş", "Forma", "Üz forması"],
      en: ["Eyebrow", "Shape", "Face shape"],
      ru: ["Бровь", "Форма", "Форма лица"],
      tr: ["Kaş", "Şekil", "Yüz şekli"],
      ar: ["حاجب", "شكل", "شكل الوجه"],
    },
    author: "Nesreen",
    publishedAt: "2026-08-15",
    readingMinutes: 3,
  },
  // SAĞ TƏRƏF (ÇOX OXUNANLAR): Ətir (trending: true)
  {
    id: "seed-gozellik-atir-layering",
    slug: "atir-layering-nece-qalicidir",
    category: "gozellik",
    subcategory: "etir",
    status: "published",
    featured: false,
    trending: true,
    coverImage: "https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=1200&q=80",
    coverCredit: "Photo by Laura Chouette on Unsplash",
    coverAlt: {
      az: "Ətir şüşələri",
      en: "Perfume bottles",
      ru: "Флаконы духов",
      tr: "Parfüm şişeleri",
      ar: "قناني عطر",
    },
    title: {
      az: "Ətir layering: ətri qalıcı etmək üçün qatlama texnikası",
      en: "Perfume Layering: The Technique of Layering for Lasting Scent",
      ru: "Наслоение аромата: техника послойного нанесения для стойкости",
      tr: "Parfüm layering: kalıcılık için katmanlama tekniği",
      ar: "تطبيق العطر بطبقات: تقنية التطبيق للثبات",
    },
    excerpt: {
      az: "Ətir tez uçursa, problem ətirdə yox, tətbiq üsulundadır. Layering texnikası ətri 8 saat qalıcı edir.",
      en: "If perfume fades quickly, the problem is not the perfume but the application method. Layering keeps scent for eight hours.",
      ru: "Если аромат быстро улетучивается, проблема не в аромате, а в способе нанесения. Наслоение сохраняет аромат на восемь часов.",
      tr: "Parfüm çabuk uçuyorsa sorun parfümde değil uygulama yöntemindedir. Layering kokuyu 8 saat kalıcı eder.",
      ar: "إن تلاشى العطر سريعًا فالمشكلة ليست في العطر بل في طريقة التطبيق. التطبيق بطبقات يبقي الرائحة ثماني ساعات.",
    },
    body: {
      az: "Layering dəri üzərində ətir qatlarını qurmaqdır. Hər qat sonrakını gücləndirir və ətir daha uzun qalır.",
      en: "Layering is building perfume layers on the skin. Each layer strengthens the next and the perfume lasts longer.",
      ru: "Наслоение — это построение слоёв аромата на коже. Каждый слой усиливает следующий, и аромат держится дольше.",
      tr: "Layering cilt üzerinde parfüm katmanları oluşturmaktır. Her katman bir sonrakini güçlendirir ve parfüm daha uzun kalır.",
      ar: "التطبيق بطبقات هو بناء طبقات العطر على البشرة. كل طبقة تقوّي التالية والعطر يثبت أطول.",
    },
    tags: {
      az: ["Ətir", "Layering", "Qalıcılıq"],
      en: ["Perfume", "Layering", "Longevity"],
      ru: ["Аромат", "Наслоение", "Стойкость"],
      tr: ["Parfüm", "Layering", "Kalıcılık"],
      ar: ["عطر", "طبقات", "ثبات"],
    },
    author: "Nesreen",
    publishedAt: "2026-09-03",
    readingMinutes: 2,
  },
  // SAĞ TƏRƏF: Saç (trending: true)
  {
    id: "seed-gozellik-sac-yuma",
    slug: "sac-yuma-tezliyi-deri-tipine-gore",
    category: "gozellik",
    subcategory: "sac",
    status: "published",
    featured: false,
    trending: true,
    coverImage: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1200&q=80",
    coverCredit: "Photo by Christin Hume on Unsplash",
    coverAlt: {
      az: "Saç yuma",
      en: "Hair washing",
      ru: "Мытьё волос",
      tr: "Saç yıkama",
      ar: "غسل الشعر",
    },
    title: {
      az: "Saç yuma tezliyi: dəri tipinə görə hər neçə gündə bir",
      en: "Hair Washing Frequency: Every How Many Days by Scalp Type",
      ru: "Частота мытья волос: через сколько дней по типу кожи головы",
      tr: "Saç yıkama sıklığı: saç derisi tipine göre kaç günde bir",
      ar: "تواتر غسل الشعر: كل كم يوم حسب نوع فروة الرأس",
    },
    excerpt: {
      az: "Hər gün yumaq saça zərər vermir — zərər verən səhv şampundur. Baş dərisinin tipini bilməyincə tezliyi təyin etmək mümkün deyil.",
      en: "Washing every day does not harm hair — what harms is the wrong shampoo. Without knowing scalp type, frequency cannot be determined.",
      ru: "Ежедневное мытьё не вредит волосам — вредит неправильный шампунь. Не зная типа кожи головы, частоту определить невозможно.",
      tr: "Her gün yıkamak saça zarar vermez — zarar veren yanlış şampuandır. Saç derisi tipini bilmeden sıklığı belirlemek mümkün değildir.",
      ar: "الغسل كل يوم لا يضرّ الشعر — ما يضرّ هو الشامبو الخاطئ. من دون معرفة نوع فروة الرأس لا يمكن تحديد التواتر.",
    },
    body: {
      az: "Yağlı dəri gündəlik yuma tələb edir, quru dəri həftədə iki dəfə. Neytral dəri üçün hər iki gündə bir optimal.",
      en: "Oily scalp requires daily washing, dry scalp twice a week. Every other day is optimal for neutral scalp.",
      ru: "Жирная кожа требует ежедневного мытья, сухая — дважды в неделю. Для нейтральной оптимально через день.",
      tr: "Yağlı deri günlük yıkama gerektirir, kuru deri haftada iki kez. Nötr deri için iki günde bir optimal.",
      ar: "فروة دهنية تتطلّب غسلًا يوميًّا، جافّة مرتين أسبوعيًّا. لمحايدة يوم بعد يوم مثالي.",
    },
    tags: {
      az: ["Saç", "Yuma", "Şampun"],
      en: ["Hair", "Washing", "Shampoo"],
      ru: ["Волосы", "Мытьё", "Шампунь"],
      tr: ["Saç", "Yıkama", "Şampuan"],
      ar: ["شعر", "غسل", "شامبو"],
    },
    author: "Nesreen",
    publishedAt: "2026-08-28",
    readingMinutes: 2,
  },
  // SAĞ TƏRƏF: Makiyaj (trending: true)
  {
    id: "seed-gozellik-no-makeup-makeup",
    slug: "no-makeup-makeup-5-deqiqe",
    category: "gozellik",
    subcategory: "makiyaj",
    status: "published",
    featured: false,
    trending: true,
    coverImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80",
    coverCredit: "Photo by Joanna Kosinska on Unsplash",
    coverAlt: {
      az: "Təbii makiyaj",
      en: "Natural make-up",
      ru: "Натуральный макияж",
      tr: "Doğal makyaj",
      ar: "مكياج طبيعي",
    },
    title: {
      az: "No-makeup makeup: 5 dəqiqəyə təbii görünüş",
      en: "No-Make-up Make-up: Natural Look in Five Minutes",
      ru: "Макияж без макияжа: натуральный вид за пять минут",
      tr: "No-makeup makeup: 5 dakikaya doğal görünüm",
      ar: "مكياج بدون مكياج: مظهر طبيعي في خمس دقائق",
    },
    excerpt: {
      az: "Makiyajsız makiyaj — sənət və texnikadır. Beş məhsul, dörd addım və nəticə: sən daha yaxşı versiyasan, başqası yox.",
      en: "No-make-up make-up is art and technique. Five products, four steps and the result: you are a better version, not someone else.",
      ru: "Макияж без макияжа — искусство и техника. Пять средств, четыре шага и результат: ты лучшая версия, а не кто-то другой.",
      tr: "No-makeup makeup sanat ve tekniktir. Beş ürün, dört adım ve sonuç: sen daha iyi bir versiyonsun, başka biri değil.",
      ar: "مكياج بدون مكياج فنّ وتقنية. خمسة منتجات، أربع خطوات والنتيجة: أنتِ نسخة أفضل، لا شخص آخر.",
    },
    body: {
      az: "Dört addım: konsiler, şəffaf maskara, dudağa balm, yanağa qızartı. Bu, makiyajsız makiyajın formulu.",
      en: "Four steps: concealer, clear mascara, balm on lips, blush on cheeks. This is the formula of no-make-up make-up.",
      ru: "Четыре шага: консилер, прозрачная тушь, бальзам на губы, румяна на щёки. Это формула макияжа без макияжа.",
      tr: "Dört adım: kapatıcı, şeffaf maskara, dudağa balm, yanağa allık. Bu no-makeup makeup'ın formülü.",
      ar: "أربع خطوات: كونسيلر، ماسكارا شفافة، بلسم على الشفاه، أحمر خدود. هذه صيغة مكياج بدون مكياج.",
    },
    tags: {
      az: ["No-makeup", "Makiyaj", "Təbii"],
      en: ["No-make-up", "Make-up", "Natural"],
      ru: ["Без макияжа", "Макияж", "Натуральный"],
      tr: ["No-makeup", "Makyaj", "Doğal"],
      ar: ["بدون مكياج", "مكياج", "طبيعي"],
    },
    author: "Nesreen",
    publishedAt: "2026-08-22",
    readingMinutes: 2,
  },
  // SAĞ TƏRƏF: Dəri baxımı (trending: true)
  {
    id: "seed-gozellik-gecə-rutini",
    slug: "gece-deri-baximi-rutini-nece-qurulur",
    category: "gozellik",
    subcategory: "deri-baximi",
    status: "published",
    featured: false,
    trending: true,
    coverImage: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80",
    coverCredit: "Photo by Katherine Hanlon on Unsplash",
    coverAlt: {
      az: "Gecə dəri baxımı",
      en: "Night skincare",
      ru: "Ночной уход за кожей",
      tr: "Gece cilt bakımı",
      ar: "عناية ليلية بالبشرة",
    },
    title: {
      az: "Gecə dəri baxımı rutini: saat 22:00-dan sonra nə edək",
      en: "Night Skincare Routine: What to Do After 10 PM",
      ru: "Ночной уход за кожей: что делать после 22:00",
      tr: "Gece cilt bakımı rutini: saat 22:00'den sonra ne yapalım",
      ar: "روتين العناية الليلية بالبشرة: ماذا نفعل بعد 10 مساءً",
    },
    excerpt: {
      az: "Gecə dəri 11 dəfə aktivdir. Düzgün rutin dərini bərpa edir, səhv rutin bütün gün ərzindəki işi məhv edir.",
      en: "At night skin is eleven times more active. The right routine restores skin, the wrong routine destroys a whole day's work.",
      ru: "Ночью кожа в 11 раз активнее. Правильный уход восстанавливает кожу, неправильный уничтожает работу целого дня.",
      tr: "Gece cilt 11 kat daha aktiftir. Doğru rutin cildi onarır, yanlış rutin bütün günün işini mahveder.",
      ar: "في الليل البشرة أنشط 11 مرة. الروتين الصحيح يعيد البشرة، الروتين الخاطئ يدمّر عمل يوم كامل.",
    },
    body: {
      az: "Gecə rutini dörd mərhələdən ibarətdir: təmizləmə, tonlaşdırma, aktiv serum, gecə kremi. Retinol gecə işləyir, C vitamini gündüz.",
      en: "Night routine consists of four stages: cleansing, toning, active serum, night cream. Retinol works at night, vitamin C during day.",
      ru: "Ночной уход состоит из четырёх этапов: очищение, тонизирование, активная сыворотка, ночной крем. Ретинол работает ночью, витамин C днём.",
      tr: "Gece rutini dört aşamadan oluşur: temizleme, tonlama, aktif serum, gece kremi. Retinol gece çalışır, C vitamini gündüz.",
      ar: "الروتين الليلي من أربع مراحل: تنظيف، موازنة، سيروم نشِط، كريم ليلي. الريتينول يعمل ليلًا، فيتامين C نهارًا.",
    },
    tags: {
      az: ["Gecə rutini", "Dəri baxımı", "Bərpa"],
      en: ["Night routine", "Skincare", "Restoration"],
      ru: ["Ночной уход", "Уход за кожей", "Восстановление"],
      tr: ["Gece rutini", "Cilt bakımı", "Onarım"],
      ar: ["روتين ليلي", "عناية بالبشرة", "ترميم"],
    },
    author: "Nesreen",
    publishedAt: "2026-08-10",
    readingMinutes: 2,
  },
];
