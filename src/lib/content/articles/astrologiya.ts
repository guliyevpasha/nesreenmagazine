import type { Article } from "@/lib/types";

/** ASTROLOGİYA — ay xəritəsi, yüksələn bürc və Veneranın yeri. */
export const astrologiyaArticles: Article[] = [
  {
    id: "seed-astro-sentyabr",
    slug: "sentyabr-2026-ulduz-xeritesi",
    category: "astrologiya",
    subcategory: "burcler",
    status: "published",
    featured: false,
    trending: true,
    coverImage: "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=1200&q=80",
    coverCredit: "Photo by Alexander Andrews on Unsplash",
    coverAlt: {
      az: "Gecə səmasında ulduz xəritəsi",
      en: "A star map in the night sky",
      ru: "Звёздная карта в ночном небе",
      tr: "Gece göğünde yıldız haritası",
      ar: "خريطة نجوم في سماء الليل",
    },
    title: {
      az: "Sentyabr 2026: ayın ulduz xəritəsi",
      en: "September 2026: The Month's Star Map",
      ru: "Сентябрь 2026: звёздная карта месяца",
      tr: "Eylül 2026: ayın yıldız haritası",
      ar: "سبتمبر ٢٠٢٦: خريطة نجوم الشهر",
    },
    excerpt: {
      az: "Sentyabr Başaq bürcündə başlayır və Tərəzidə bitir: əvvəl nizam, sonra tarazlıq. Ayın əsas keçidləri, hər element üçün tövsiyələr və nəyi nə vaxt başlamağın daha yaxşı olduğu.",
      en: "September opens in Virgo and closes in Libra: order first, then balance. The month's main transits, guidance for each element, and what is better started when.",
      ru: "Сентябрь начинается в Деве и заканчивается в Весах: сначала порядок, затем равновесие. Главные транзиты месяца, рекомендации для каждой стихии и что когда лучше начинать.",
      tr: "Eylül Başak'ta başlar ve Terazi'de biter: önce düzen, sonra denge. Ayın ana geçişleri, her element için öneriler ve neyin ne zaman başlatılmasının daha iyi olduğu.",
      ar: "يبدأ سبتمبر في العذراء وينتهي في الميزان: النظام أولًا ثم التوازن. أبرز عبور الشهر، وإرشادات لكل عنصر، وما الأفضل بدؤه ومتى.",
    },
    body: {
      az: `Sentyabr astroloji təqvimdə keçid ayıdır. Günəş ayın 22-nə qədər **Başaq** bürcündə qalır, sonra **Tərəzi**yə keçir. Bu iki bürc bir-birinin davamıdır: Başaq nizam qurur, Tərəzi həmin nizamın içində tarazlıq axtarır.

## Ayın üç mərhələsi

**1–12 sentyabr — yığışdırma.** Başaq enerjisi ən güclü vaxtdır: siyahılar, sənədlər, sağlamlıq, gündəlik rejim. Bu iki həftədə başlanan hər sistem uzun müddət qalır. Böyük qərar üçün yox, kiçik düzəlişlər üçün ideal.

**13–22 sentyabr — dəqiqləşdirmə.** Detallara diqqət artır, amma özünə qarşı sərtlik də. Başaq mövsümünün ən çox rast gəlinən tələsi budur: mükəmməlliyi gözləyib heç nəyi bitirməmək. Bu günlərdə "kifayət qədər yaxşı" — düzgün ölçüdür.

**23–30 sentyabr — tarazlıq.** Tərəzi mövsümü başlayır. Münasibətlər, danışıqlar, estetika, birgə qərarlar önə çıxır. Ayın son həftəsi görüş, təqdimat və sülh üçün ən əlverişli vaxtdır.

## Elementlərə görə

**Od (Qoç, Şir, Oxatan).** Sentyabr sizin sürətinizi bir az yavaşladır və bu, xeyrinizədir. Yarımçıq qalan işlərə qayıdın; yeni od yandırmaqdansa, köhnəni közərtmək daha səmərəlidir.

**Torpaq (Buğa, Qız, Oğlaq).** Ayın sahibi sizsiniz. Uzun müddət təxirə salınan struktur qərarları — maliyyə, sağlamlıq, iş nizamı — məhz indi qurulmalıdır.

**Hava (Əkizlər, Tərəzi, Dolça).** Ayın ikinci yarısı sizin üçün açılır. Söz, əlaqə və şəbəkə işləyir; 23-dən sonra keçirilən görüşlər gözlənildiyindən çox nəticə verir.

**Su (Xərçəng, Əqrəb, Balıqlar).** Sentyabr daxili təmizlik ayıdır. Emosional yük siyahıya alınmalı, bir hissəsi buraxılmalıdır. Yaxın münasibətlərdə açıq danışıq üçün ayın sonu daha yumşaqdır.

> Astrologiya nə edəcəyinizi demir. Sadəcə havanın hansı istiqamətdən əsdiyini göstərir — yelkəni siz qurursunuz.

## Nəyi nə vaxt

- **Yeni vərdiş, rejim, təmizlik:** 1–12 sentyabr.
- **Sənəd, müqavilə, hesabat:** 13–22 sentyabr.
- **Görüş, təqdimat, barışıq:** 23–30 sentyabr.
- **Böyük alış və uzunmüddətli öhdəlik:** ayın sonuna saxlayın.

## Bir cümlə

Sentyabr sizdən böyük dönüş gözləmir. Ondan yalnız bir şey istəyir: səliqə. Qalanı oktyabrın işidir.`,
      en: `September is a month of transition in the astrological calendar. The Sun stays in **Virgo** until the 22nd, then moves into **Libra**. These two signs continue one another: Virgo builds order, and Libra looks for balance inside that order.

## The month's three stages

**1–12 September — gathering.** Virgo energy is at its strongest: lists, documents, health, daily routine. Any system started in these two weeks tends to last. Ideal for small corrections rather than large decisions.

**13–22 September — refining.** Attention to detail rises, and so does severity towards oneself. This is the most common trap of Virgo season: waiting for perfection and finishing nothing. In these days, "good enough" is the correct measure.

**23–30 September — balance.** Libra season opens. Relationships, negotiations, aesthetics and shared decisions come forward. The final week of the month is the most favourable time for meetings, presentations and making peace.

## By element

**Fire (Aries, Leo, Sagittarius).** September slows your pace a little, and that is in your favour. Return to what was left half-done; reviving an old ember is more productive than lighting a new fire.

**Earth (Taurus, Virgo, Capricorn).** The month belongs to you. Structural decisions long postponed — money, health, the order of your work — should be settled now.

**Air (Gemini, Libra, Aquarius).** The second half of the month opens for you. Words, contacts and networks work; meetings held after the 23rd give more than expected.

**Water (Cancer, Scorpio, Pisces).** September is a month of inner clearing. Emotional weight should be listed, and part of it put down. For an honest conversation in a close relationship, the end of the month is gentler.

> Astrology does not tell you what to do. It only shows which way the wind blows — you set the sail.

## What, and when

- **New habits, routine, decluttering:** 1–12 September.
- **Documents, contracts, reports:** 13–22 September.
- **Meetings, presentations, reconciliation:** 23–30 September.
- **Large purchases and long commitments:** leave them to the end of the month.

## In one sentence

September expects no great turn from you. It asks for one thing only: order. The rest is October's business.`,
      ru: `Сентябрь в астрологическом календаре — месяц перехода. Солнце остаётся в **Деве** до 22-го, затем переходит в **Весы**. Эти два знака продолжают друг друга: Дева выстраивает порядок, Весы ищут равновесие внутри этого порядка.

## Три стадии месяца

**1–12 сентября — сбор.** Энергия Девы сильнее всего: списки, документы, здоровье, ежедневный режим. Любая система, начатая в эти две недели, держится долго. Идеально для мелких правок, а не для крупных решений.

**13–22 сентября — уточнение.** Внимание к деталям растёт, но растёт и строгость к себе. Это самая частая ловушка сезона Девы: ждать совершенства и ничего не закончить. В эти дни «достаточно хорошо» — правильная мера.

**23–30 сентября — равновесие.** Начинается сезон Весов. На первый план выходят отношения, переговоры, эстетика, совместные решения. Последняя неделя месяца — самое благоприятное время для встреч, презентаций и примирения.

## По стихиям

**Огонь (Овен, Лев, Стрелец).** Сентябрь немного замедляет вашу скорость, и это вам на пользу. Вернитесь к незавершённому: раздуть старый уголь продуктивнее, чем зажигать новый огонь.

**Земля (Телец, Дева, Козерог).** Месяц принадлежит вам. Структурные решения, долго откладывавшиеся, — деньги, здоровье, порядок в работе — стоит закрыть именно сейчас.

**Воздух (Близнецы, Весы, Водолей).** Вторая половина месяца открывается для вас. Слово, контакты и связи работают; встречи после 23-го дают больше, чем ожидалось.

**Вода (Рак, Скорпион, Рыбы).** Сентябрь — месяц внутренней уборки. Эмоциональный груз стоит переписать в список, а часть его — отпустить. Для откровенного разговора в близких отношениях конец месяца мягче.

> Астрология не говорит, что делать. Она лишь показывает, откуда дует ветер, — парус ставите вы.

## Что и когда

- **Новые привычки, режим, разбор вещей:** 1–12 сентября.
- **Документы, договоры, отчёты:** 13–22 сентября.
- **Встречи, презентации, примирение:** 23–30 сентября.
- **Крупные покупки и долгие обязательства:** оставьте на конец месяца.

## Одним предложением

Сентябрь не ждёт от вас большого поворота. Он просит одного: порядка. Остальное — дело октября.`,
      tr: `Eylül, astrolojik takvimde bir geçiş ayıdır. Güneş ayın 22'sine kadar **Başak**'ta kalır, sonra **Terazi**'ye geçer. Bu iki burç birbirinin devamıdır: Başak düzeni kurar, Terazi o düzenin içinde dengeyi arar.

## Ayın üç evresi

**1–12 Eylül — toparlama.** Başak enerjisi en güçlü hâlindedir: listeler, belgeler, sağlık, günlük düzen. Bu iki haftada kurulan her sistem uzun süre kalır. Büyük kararlar için değil, küçük düzeltmeler için ideal.

**13–22 Eylül — inceltme.** Ayrıntıya dikkat artar, ama kişinin kendine karşı sertliği de. Başak mevsiminin en sık tuzağı budur: kusursuzluğu bekleyip hiçbir şeyi bitirmemek. Bu günlerde «yeterince iyi» doğru ölçüdür.

**23–30 Eylül — denge.** Terazi mevsimi açılır. İlişkiler, müzakereler, estetik ve ortak kararlar öne çıkar. Ayın son haftası buluşmalar, sunumlar ve barışmak için en elverişli zamandır.

## Elementlere göre

**Ateş (Koç, Aslan, Yay).** Eylül hızınızı biraz düşürür ve bu sizin lehinizedir. Yarım kalanlara dönün; eski közü canlandırmak yeni ateş yakmaktan verimlidir.

**Toprak (Boğa, Başak, Oğlak).** Ay size aittir. Uzun süredir ertelenen yapısal kararlar — para, sağlık, iş düzeni — tam şimdi kapatılmalı.

**Hava (İkizler, Terazi, Kova).** Ayın ikinci yarısı size açılıyor. Söz, temas ve ağlar işliyor; 23'ünden sonraki görüşmeler beklenenden fazlasını veriyor.

**Su (Yengeç, Akrep, Balık).** Eylül bir iç temizlik ayıdır. Duygusal yük listelenmeli, bir kısmı bırakılmalı. Yakın ilişkide dürüst bir konuşma için ayın sonu daha yumuşak.

> Astroloji ne yapacağınızı söylemez. Yalnızca rüzgârın hangi yönden estiğini gösterir — yelkeni siz kurarsınız.

## Ne, ne zaman

- **Yeni alışkanlık, düzen, ayıklama:** 1–12 Eylül.
- **Belge, sözleşme, rapor:** 13–22 Eylül.
- **Buluşma, sunum, barışma:** 23–30 Eylül.
- **Büyük alışveriş ve uzun taahhüt:** ay sonuna bırakın.

## Tek cümleyle

Eylül sizden büyük bir dönüş beklemiyor. Tek bir şey istiyor: düzen. Gerisi ekimin işi.`,
      ar: `سبتمبر شهر انتقال في التقويم الفلكي. تبقى الشمس في **العذراء** حتى الثاني والعشرين، ثم تنتقل إلى **الميزان**. والبرجان امتداد لبعضهما: العذراء تبني النظام، والميزان يبحث عن التوازن داخل ذلك النظام.

## مراحل الشهر الثلاث

**١–١٢ سبتمبر — الجمع.** طاقة العذراء في أقوى حالاتها: القوائم والأوراق والصحة والروتين اليومي. وكل نظام يبدأ في هذين الأسبوعين يميل إلى البقاء. مثالي للتصحيحات الصغيرة لا للقرارات الكبيرة.

**١٣–٢٢ سبتمبر — التدقيق.** يزداد الانتباه إلى التفاصيل، وتزداد معه القسوة على النفس. وهذا أشهر فخاخ موسم العذراء: انتظار الكمال وعدم إنهاء شيء. في هذه الأيام يكون «جيّد بما يكفي» هو المقياس الصحيح.

**٢٣–٣٠ سبتمبر — التوازن.** يبدأ موسم الميزان. تتقدّم العلاقات والمفاوضات والجماليات والقرارات المشتركة. والأسبوع الأخير من الشهر أنسب وقت للّقاءات والعروض والمصالحة.

## بحسب العناصر

**النار (الحمل، الأسد، القوس).** يبطئ سبتمبر إيقاعك قليلًا، وهذا في مصلحتك. عودي إلى ما تُرك ناقصًا؛ فإحياء جمرة قديمة أجدى من إشعال نار جديدة.

**التراب (الثور، العذراء، الجدي).** الشهر لك. القرارات البنيوية المؤجّلة منذ وقت طويل — المال والصحة ونظام العمل — يجب أن تُحسم الآن.

**الهواء (الجوزاء، الميزان، الدلو).** النصف الثاني من الشهر ينفتح لك. الكلمة والصلات والشبكات تعمل؛ واللقاءات بعد الثالث والعشرين تعطي أكثر من المتوقّع.

**الماء (السرطان، العقرب، الحوت).** سبتمبر شهر تنظيف داخلي. ينبغي تدوين الحمل العاطفي وإنزال جزء منه. ولأجل حديث صادق في علاقة قريبة، تكون نهاية الشهر أرقّ.

> لا يقول لك التنجيم ما تفعلين. إنه يبيّن فقط من أين تهبّ الريح — أما الشراع فأنتِ من ترفعينه.

## ماذا ومتى

- **عادات جديدة وروتين وترتيب:** ١–١٢ سبتمبر.
- **أوراق وعقود وتقارير:** ١٣–٢٢ سبتمبر.
- **لقاءات وعروض ومصالحات:** ٢٣–٣٠ سبتمبر.
- **المشتريات الكبيرة والالتزامات الطويلة:** أجّليها إلى آخر الشهر.

## في جملة واحدة

لا ينتظر منك سبتمبر انعطافة كبرى. يطلب شيئًا واحدًا: النظام. وما تبقّى شأن أكتوبر.`,
    },
    tags: {
      az: ["Sentyabr", "Ay xəritəsi", "Başaq"],
      en: ["September", "Monthly", "Virgo"],
      ru: ["Сентябрь", "Прогноз месяца", "Дева"],
      tr: ["Eylül", "Aylık", "Başak"],
      ar: ["سبتمبر", "شهري", "العذراء"],
    },
    author: "Nesreen",
    publishedAt: "2026-09-01",
    readingMinutes: 4,
  },
  {
    id: "seed-astro-yukselen",
    slug: "yukselen-burc-nedir",
    category: "astrologiya",
    subcategory: "burcler",
    status: "published",
    featured: false,
    trending: false,
    coverImage: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80",
    coverCredit: "Photo by Greg Rakozy on Unsplash",
    coverAlt: {
      az: "Astroloji xəritə çertyoju",
      en: "An astrological chart",
      ru: "Астрологическая карта",
      tr: "Astrolojik harita",
      ar: "خريطة فلكية",
    },
    title: {
      az: "Yüksələn bürc: insanların sizdə ilk gördüyü",
      en: "The Rising Sign: The First Thing People See in You",
      ru: "Асцендент: то, что люди замечают в вас первым",
      tr: "Yükselen burç: insanların sizde ilk gördüğü",
      ar: "البرج الطالع: أول ما يراه الناس فيك",
    },
    excerpt: {
      az: "«Bürcümə uyğun gəlmirəm» deyənlərin əksəriyyəti əslində yüksələn bürcünü bilmir. Günəş bürcü sizin nüvəniz, yüksələn isə qapınızdır — və insanlar əvvəlcə qapını görür.",
      en: "Most people who say \"I am nothing like my sign\" simply do not know their rising sign. The Sun sign is your core; the rising is your door — and people see the door first.",
      ru: "Большинство тех, кто говорит «я совсем не похожа на свой знак», просто не знают своего асцендента. Солнечный знак — ваше ядро, асцендент — ваша дверь. А люди сначала видят дверь.",
      tr: "«Burcuma hiç benzemiyorum» diyenlerin çoğu aslında yükselen burcunu bilmiyor. Güneş burcu çekirdeğiniz, yükselen ise kapınızdır — ve insanlar önce kapıyı görür.",
      ar: "معظم من يقلن «أنا لا أشبه برجي» لا يعرفن ببساطة برجهنّ الطالع. برج الشمس نواتك، والطالع بابك — والناس يرون الباب أولًا.",
    },
    body: {
      az: `Astrologiyada ən çox yayılan yanlış təsəvvür budur: insanın yalnız bir bürcü var. Əslində doğum xəritəsində onlarla göstərici var, amma üçü hər şeyi izah edir.

## Üç əsas nöqtə

**Günəş bürcü** — doğum tarixinizə görə bilinən bürc. Bu, sizin nüvəniz, əsas motivasiyanızdır. "Nə üçün yaşayıram?" sualının cavabı buradadır.

**Ay bürcü** — daxili həyatınız. Emosiyalar, təhlükəsizlik hissi, uşaqlıqdan gələn reaksiyalar. Tək qalanda kim olduğunuz.

**Yüksələn bürc (Asendent)** — doğulduğunuz anda üfüqdə qalxan bürc. Bu, sizin ilk təəssüratınız: davranış tərziniz, danışıq ritminiz, hətta üslub seçiminiz.

## Nə üçün yüksələn bu qədər vacibdir

Çünki insanlar sizi ilk növbədə **yüksələn bürcünüzlə** görür. Günəş bürcü Xərçəng olan, amma yüksələni Oğlaq olan bir qadın soyuq və nizamlı görünə bilər — halbuki içəridə tamamilə başqadır.

Elə buna görə "mən heç də Şir kimi deyiləm" hissi yaranır. Çox vaxt həqiqət belədir: siz Şirsiniz, amma qapınız Balıqlardır.

## Necə hesablanır

Yüksələn bürc üç şeyi tələb edir:

1. **Doğum tarixi**
2. **Doğum saatı** — ən vacib göstərici. 15 dəqiqə fərq bürcü dəyişə bilər.
3. **Doğum yeri** — coğrafi koordinatlar

Yüksələn bürc təxminən **hər iki saatdan bir** dəyişir. Yəni saatı bilmədən onu dəqiq təyin etmək mümkün deyil. Doğum haqqında şəhadətnamədə saat yazılmayıbsa, valideynlərdən soruşmaq yeganə etibarlı yoldur.

> Günəş — nə istədiyinizdir. Ay — nəyə ehtiyacınız olduğu. Yüksələn — necə göründüyünüz. Üçü üst-üstə düşəndə insan özünü rahat hiss edir.

## Qısa cədvəl

- **Yüksələn Qoç** — sürətli danışıq, birbaşa baxış, tez qərar.
- **Yüksələn Buğa** — sakit ritm, xoş səs, dəyişikliyə müqavimət.
- **Yüksələn Əkizlər** — canlı mimika, çox sual, asan tanışlıq.
- **Yüksələn Xərçəng** — qoruyucu davranış, yumşaq ilk təmas.
- **Yüksələn Şir** — otağa girişi hiss olunan, saçı və duruşu diqqət çəkən.
- **Yüksələn Qız** — səliqəli görünüş, ölçülü söz, detala diqqət.
- **Yüksələn Tərəzi** — xoş üz ifadəsi, estetik seçimlər, münaqişədən qaçmaq.
- **Yüksələn Əqrəb** — ağır baxış, az söz, güclü mövcudluq.
- **Yüksələn Oxatan** — açıq gülüş, sərbəst jestlər, səyahət söhbəti.
- **Yüksələn Oğlaq** — ciddi ilk təəssürat, ölçülü davranış, gec açılma.
- **Yüksələn Dolça** — qeyri-adi detal, məsafə saxlamaq, orijinal fikir.
- **Yüksələn Balıqlar** — yumşaq baxış, qeyri-müəyyən kontur, asan uyğunlaşma.

Öz yüksələn bürcünüzü tapandan sonra günlük şərhləri həm Günəş, həm də yüksələn bürc üçün oxuyun. İkincisi çox vaxt daha dəqiq çıxır.`,
      en: `The most common misconception in astrology is that a person has only one sign. A birth chart holds dozens of markers, but three of them explain almost everything.

## The three main points

**The Sun sign** — the sign known from your birth date. This is your core, your central motivation. The answer to "what do I live for?" sits here.

**The Moon sign** — your inner life. Emotions, the sense of safety, reactions carried from childhood. Who you are when alone.

**The rising sign (Ascendant)** — the sign climbing over the horizon at the moment you were born. This is your first impression: your manner, the rhythm of your speech, even your taste in clothes.

## Why the rising matters so much

Because people see you first through your **rising sign**. A woman with the Sun in Cancer but a Capricorn rising can seem cool and ordered — while inside she is something else entirely.

That is where the feeling "I am nothing like a Leo" comes from. Often the truth is: you are a Leo, but your door is Pisces.

## How it is calculated

The rising sign requires three things:

1. **The date of birth**
2. **The time of birth** — the crucial one. Fifteen minutes can change the sign.
3. **The place of birth** — geographic coordinates

The rising sign changes roughly **every two hours**. Without the time it cannot be determined precisely. If the hour is not written on a birth certificate, asking a parent is the only reliable route.

> The Sun is what you want. The Moon is what you need. The rising is how you appear. When the three agree, a person feels at ease.

## A short table

- **Aries rising** — fast speech, a direct gaze, quick decisions.
- **Taurus rising** — calm rhythm, a pleasant voice, resistance to change.
- **Gemini rising** — lively expression, many questions, easy acquaintance.
- **Cancer rising** — protective manner, a soft first contact.
- **Leo rising** — an entrance you notice; hair and posture that draw the eye.
- **Virgo rising** — a tidy appearance, measured words, attention to detail.
- **Libra rising** — a pleasant expression, aesthetic choices, avoidance of conflict.
- **Scorpio rising** — a heavy gaze, few words, a strong presence.
- **Sagittarius rising** — open laughter, free gestures, talk of travel.
- **Capricorn rising** — a serious first impression, measured conduct, slow to open.
- **Aquarius rising** — one unusual detail, kept distance, original thinking.
- **Pisces rising** — a soft gaze, a blurred outline, easy adaptation.

Once you find your rising sign, read daily forecasts for both the Sun and the rising. The second is often the more accurate of the two.`,
      ru: `Самое частое заблуждение в астрологии — что у человека только один знак. В карте рождения десятки показателей, но три объясняют почти всё.

## Три главные точки

**Солнечный знак** — знак по дате рождения. Это ваше ядро, основная мотивация. Здесь ответ на вопрос «ради чего я живу?».

**Лунный знак** — внутренняя жизнь. Эмоции, чувство безопасности, реакции, вынесенные из детства. Кто вы, когда одна.

**Асцендент (восходящий знак)** — знак, поднимавшийся над горизонтом в момент вашего рождения. Это первое впечатление: манера, ритм речи, даже вкус в одежде.

## Почему асцендент так важен

Потому что люди видят вас прежде всего через **асцендент**. Женщина с Солнцем в Раке, но с асцендентом в Козероге может казаться холодной и собранной — хотя внутри она совсем другая.

Отсюда и ощущение «я совсем не Лев». Часто правда в том, что вы Лев, но дверь у вас — Рыбы.

## Как его вычисляют

Для асцендента нужны три вещи:

1. **Дата рождения**
2. **Время рождения** — самое важное. Пятнадцать минут могут изменить знак.
3. **Место рождения** — географические координаты

Асцендент меняется примерно **каждые два часа**. Без времени определить его точно невозможно. Если час не указан в свидетельстве, единственный надёжный путь — спросить родителей.

> Солнце — то, чего вы хотите. Луна — то, что вам нужно. Асцендент — то, какой вас видят. Когда эти трое сходятся, человеку спокойно.

## Краткая таблица

- **Асцендент в Овне** — быстрая речь, прямой взгляд, скорые решения.
- **В Тельце** — спокойный ритм, приятный голос, сопротивление переменам.
- **В Близнецах** — живая мимика, много вопросов, лёгкие знакомства.
- **В Раке** — оберегающая манера, мягкий первый контакт.
- **Во Льве** — заметный вход в комнату; волосы и осанка притягивают взгляд.
- **В Деве** — опрятный вид, взвешенное слово, внимание к деталям.
- **В Весах** — приятное выражение лица, эстетичный выбор, уход от конфликта.
- **В Скорпионе** — тяжёлый взгляд, мало слов, сильное присутствие.
- **В Стрельце** — открытый смех, свободные жесты, разговоры о поездках.
- **В Козероге** — серьёзное первое впечатление, сдержанность, медленное раскрытие.
- **В Водолее** — одна необычная деталь, дистанция, оригинальная мысль.
- **В Рыбах** — мягкий взгляд, размытый контур, лёгкая приспособляемость.

Найдя свой асцендент, читайте ежедневные прогнозы и для Солнца, и для него. Второй часто оказывается точнее.`,
      tr: `Astrolojideki en yaygın yanılgı, insanın tek bir burcu olduğudur. Doğum haritasında onlarca gösterge vardır ama üçü neredeyse her şeyi açıklar.

## Üç ana nokta

**Güneş burcu** — doğum tarihinize göre bilinen burç. Bu sizin çekirdeğiniz, temel motivasyonunuzdur. «Ne için yaşıyorum?» sorusunun cevabı buradadır.

**Ay burcu** — iç dünyanız. Duygular, güvenlik hissi, çocukluktan gelen tepkiler. Yalnızken kim olduğunuz.

**Yükselen burç (Asendan)** — doğduğunuz anda ufukta yükselen burç. Bu, ilk izleniminizdir: davranış tarzınız, konuşma ritminiz, hatta giyim zevkiniz.

## Yükselen neden bu kadar önemli

Çünkü insanlar sizi önce **yükselen burcunuzla** görür. Güneşi Yengeç, yükseleni Oğlak olan bir kadın soğuk ve derli toplu görünebilir — oysa içeride bambaşkadır.

«Ben hiç de Aslan gibi değilim» hissi buradan doğar. Gerçek çoğu zaman şudur: Aslansınız ama kapınız Balık.

## Nasıl hesaplanır

Yükselen burç üç şey ister:

1. **Doğum tarihi**
2. **Doğum saati** — en kritik olan. On beş dakika burcu değiştirebilir.
3. **Doğum yeri** — coğrafi koordinatlar

Yükselen burç yaklaşık **iki saatte bir** değişir. Saat bilinmeden kesin belirlenemez. Doğum belgesinde saat yazmıyorsa, tek güvenilir yol ebeveynlere sormaktır.

> Güneş ne istediğinizdir. Ay neye ihtiyacınız olduğudur. Yükselen ise nasıl göründüğünüzdür. Üçü örtüştüğünde insan rahat hisseder.

## Kısa tablo

- **Yükselen Koç** — hızlı konuşma, doğrudan bakış, çabuk karar.
- **Boğa** — sakin ritim, hoş bir ses, değişime direnç.
- **İkizler** — canlı mimik, çok soru, kolay tanışma.
- **Yengeç** — koruyucu tavır, yumuşak ilk temas.
- **Aslan** — odaya girişi fark edilen; saçı ve duruşu göz alan.
- **Başak** — derli toplu görünüm, ölçülü söz, ayrıntıya dikkat.
- **Terazi** — hoş yüz ifadesi, estetik seçimler, çatışmadan kaçınma.
- **Akrep** — ağır bakış, az söz, güçlü varlık.
- **Yay** — açık kahkaha, serbest jestler, seyahat sohbeti.
- **Oğlak** — ciddi ilk izlenim, ölçülü davranış, geç açılma.
- **Kova** — sıra dışı bir ayrıntı, mesafe, özgün düşünce.
- **Balık** — yumuşak bakış, belirsiz kontur, kolay uyum.

Yükselen burcunuzu bulduktan sonra günlük yorumları hem Güneş hem yükselen için okuyun. İkincisi çoğu zaman daha isabetli çıkar.`,
      ar: `أشهر خطأ شائع في التنجيم هو الظنّ بأن للإنسان برجًا واحدًا. تحمل خريطة الميلاد عشرات المؤشّرات، لكن ثلاثة منها تفسّر كل شيء تقريبًا.

## النقاط الثلاث الأساسية

**برج الشمس** — البرج المعروف بتاريخ ميلادك. هذه نواتك ودافعك المركزي. وهنا جواب سؤال «لأجل ماذا أعيش؟».

**برج القمر** — حياتك الداخلية. المشاعر، والإحساس بالأمان، وردود الفعل الموروثة من الطفولة. من تكونين حين تخلين إلى نفسك.

**البرج الطالع** — البرج الصاعد فوق الأفق لحظة ولادتك. وهو انطباعك الأول: أسلوبك، وإيقاع كلامك، بل وذوقك في الملبس.

## لماذا الطالع بهذه الأهمية

لأن الناس يرونك أولًا عبر **برجك الطالع**. امرأة شمسها في السرطان وطالعها الجدي قد تبدو باردة ومنظّمة — بينما داخلها شيء آخر تمامًا.

من هنا يأتي شعور «أنا لا أشبه الأسد إطلاقًا». والحقيقة غالبًا: أنتِ أسد، لكن بابك حوت.

## كيف يُحسب

يحتاج البرج الطالع إلى ثلاثة أشياء:

1. **تاريخ الميلاد**
2. **ساعة الميلاد** — وهي الأهمّ. خمس عشرة دقيقة قد تغيّر البرج.
3. **مكان الميلاد** — الإحداثيات الجغرافية

يتغيّر الطالع تقريبًا **كل ساعتين**. أي لا يمكن تحديده بدقّة دون معرفة الساعة. وإن لم تُكتب الساعة في شهادة الميلاد فسؤال الوالدين هو السبيل الموثوق الوحيد.

> الشمس ما تريدينه. والقمر ما تحتاجينه. والطالع كيف تبدين. وحين تتّفق الثلاثة يشعر المرء بالراحة.

## جدول موجز

- **الطالع في الحمل** — كلام سريع، ونظرة مباشرة، وقرار عاجل.
- **الثور** — إيقاع هادئ، وصوت لطيف، ومقاومة للتغيير.
- **الجوزاء** — تعبير حيّ، وأسئلة كثيرة، وتعارف سهل.
- **السرطان** — سلوك حامٍ، ولقاء أول ليّن.
- **الأسد** — دخول يُلاحَظ؛ شعر وقوام يجذبان النظر.
- **العذراء** — مظهر مرتّب، وكلام موزون، وانتباه للتفاصيل.
- **الميزان** — ملامح لطيفة، واختيارات جمالية، وتجنّب للخلاف.
- **العقرب** — نظرة ثقيلة، وكلام قليل، وحضور قوي.
- **القوس** — ضحك مفتوح، وحركات حرّة، وحديث عن السفر.
- **الجدي** — انطباع أول جادّ، وسلوك موزون، وانفتاح بطيء.
- **الدلو** — تفصيلة غير مألوفة، ومسافة محفوظة، وفكر أصيل.
- **الحوت** — نظرة ليّنة، وحدّ غير واضح، وتأقلم سهل.

وحين تعرفين برجك الطالع، اقرئي التوقّعات اليومية للشمس وللطالع معًا. والثاني أدقّ في كثير من الأحيان.`,
    },
    tags: {
      az: ["Yüksələn bürc", "Doğum xəritəsi", "Asendent"],
      en: ["Rising sign", "Birth chart", "Ascendant"],
      ru: ["Асцендент", "Карта рождения", "Восходящий знак"],
      tr: ["Yükselen burç", "Doğum haritası", "Asendan"],
      ar: ["البرج الطالع", "خريطة الميلاد", "الطالع"],
    },
    author: "Nesreen",
    publishedAt: "2026-08-27",
    readingMinutes: 5,
  },
  {
    id: "seed-astro-venera",
    slug: "venera-xeritenizde",
    category: "astrologiya",
    subcategory: "uygunluq",
    status: "published",
    featured: false,
    trending: false,
    coverImage: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&q=80",
    coverCredit: "Photo by Yoann Boyer on Unsplash",
    coverAlt: {
      az: "Venera simvolu və ulduzlar",
      en: "The symbol of Venus among stars",
      ru: "Символ Венеры среди звёзд",
      tr: "Yıldızlar arasında Venüs simgesi",
      ar: "رمز الزهرة بين النجوم",
    },
    title: {
      az: "Veneranın xəritənizdəki yeri: zövq, dəyər və münasibətlər",
      en: "Where Venus Sits in Your Chart: Taste, Value and Relationships",
      ru: "Где стоит Венера в вашей карте: вкус, ценность и отношения",
      tr: "Venüs haritanızda nerede: zevk, değer ve ilişkiler",
      ar: "أين تقع الزهرة في خريطتك: الذوق والقيمة والعلاقات",
    },
    excerpt: {
      az: "Venera nəyi sevdiyinizi deyil, **necə** sevdiyinizi göstərir. Eyni zamanda üslubunuzu, pul münasibətinizi və nəyə «dəyər» dediyinizi. Bu, jurnalın bütün bölmələrini bir yerə bağlayan planetdir.",
      en: "Venus does not show what you love but **how** you love. It also shapes your style, your relationship with money, and what you call valuable. It is the planet that ties every section of this magazine together.",
      ru: "Венера показывает не что вы любите, а **как** вы любите. А заодно ваш стиль, отношения с деньгами и то, что вы называете ценностью. Это планета, связывающая все разделы журнала.",
      tr: "Venüs neyi sevdiğinizi değil, **nasıl** sevdiğinizi gösterir. Aynı zamanda üslubunuzu, parayla ilişkinizi ve neye «değer» dediğinizi. Derginin bütün bölümlerini birbirine bağlayan gezegen budur.",
      ar: "لا تُظهر الزهرة ما تحبّينه بل **كيف** تحبّين. وتشكّل أيضًا أسلوبك وعلاقتك بالمال وما تسمّينه قيمة. إنها الكوكب الذي يربط أقسام هذه المجلة كلّها.",
    },
    body: {
      az: `Astrologiyada Venera üç sahəyə cavabdehdir: **sevgi, zövq və dəyər**. Bu üçü bir-birindən ayrı deyil — bir insanın nəyi gözəl saydığı, nəyə pul verdiyi və kimə yaxınlaşdığı eyni məntiqdən gəlir.

## Venera nə vaxt sizin bürcünüzdə olur

Venera Günəşdən çox uzaqlaşa bilmir. Ona görə də sizin Veneranız ya Günəş bürcünüzdə, ya ondan bir-iki bürc əvvəl, ya da bir-iki bürc sonradır. Yəni cəmi beş variant var — və bu, tapmağı asanlaşdırır.

## Venera bürcünüzə görə üslub

**Venera Qoçda.** Cəld seçim, güclü kontrast, qırmızı. Uzun düşünmək sıxıcı gəlir; ilk baxışdan bəyənmək əsas meyardır.

**Venera Buğada.** Toxunma hissi hər şeydən vacibdir. Təbii materiallar, kaşmir, ipək, ağır parça. Ucuz toxunuş dərhal geri itələyir.

**Venera Əkizlərdə.** Dəyişkənlik ləzzət verir. Bir üslubda qalmaq çətindir və bu, qüsur deyil — sizin üçün qarderob söhbətin bir hissəsidir.

**Venera Xərçəngdə.** Yaddaş bağlılığı: nənədən qalan sırğa, köhnə paltar, tanış qoxu. Yeni şey köhnə hissi verməlidir.

**Venera Şirdə.** Görünmək istəyi səmimidir. Parlaq detal, qızıl, dramatik kəsim. Kompliment sizin üçün valyutadır.

**Venera Qızda.** Səliqə gözəllikdir. Təmiz xətlər, neytral rənglər, mükəmməl tikiş. Artıq bəzək narahat edir.

**Venera Tərəzidə.** Tarazlıq və simmetriya. Klassik forma, yumşaq rənglər. Başqasının rahatlığı öz zövqünüzün bir hissəsidir.

**Venera Əqrəbdə.** Dərinlik və gizlilik. Qara, bordo, dəri. Hər şeyi göstərməmək — əsas prinsip.

**Venera Oxatanda.** Sərbəstlik. Uzaq mədəniyyətlərdən gələn detal, rahat kəsim, səyahət hissi.

**Venera Oğlaqda.** Keyfiyyət və zaman. Bir bahalı parça on ucuzdan üstündür. Klassik forma, uzunmüddətli seçim.

**Venera Dolçada.** Qeyri-adilik. Qaydaya uyğun gəlməyən bir detal həmişə var. Trendə qarşı davranış — özü bir üslubdur.

**Venera Balıqlarda.** Yumşaqlıq və axıcılıq. Şəffaf parça, dumanlı rənglər, romantik xətt.

> Venera "nəyi bəyənirsən" sualına deyil, "nəyə görə buna dəyər deyirsən" sualına cavab verir.

## Venera və pul

Xəritənizdəki Venera pul münasibətinizi də göstərir. Torpaq bürclərində (Buğa, Qız, Oğlaq) yığım təbii gəlir. Od bürclərində xərcləmə sürətlidir, amma qazanma da. Hava bürclərində pul fikirlə bağlıdır — informasiya, əlaqə, ünsiyyət. Su bürclərində isə maliyyə qərarı çox vaxt emosional olur.

Bu bilik hökm deyil, xəbərdarlıqdır: zəif tərəfi bilən adam onu idarə edə bilir.

## Necə istifadə etmək

Növbəti dəfə bir şey almazdan əvvəl özünüzə sual verin: bunu **mən** istəyirəm, yoxsa bu, sadəcə göründüyü an xoş gələn bir şeydir? Venera bürcünüzü tanıyanda bu iki hissi ayırd etmək asanlaşır.`,
      en: `In astrology Venus governs three areas: **love, taste and value**. They are not separate — what a person finds beautiful, what she pays for, and whom she moves towards all come from the same logic.

## When Venus sits in your own sign

Venus never strays far from the Sun. So your Venus is either in your Sun sign, one or two signs before it, or one or two after. That leaves only five possibilities — which makes it easy to find.

## Style by Venus sign

**Venus in Aries.** Quick choices, strong contrast, red. Long deliberation feels dull; liking it at first sight is the main criterion.

**Venus in Taurus.** Touch matters more than anything. Natural materials, cashmere, silk, heavy cloth. A cheap texture repels immediately.

**Venus in Gemini.** Variety is the pleasure. Staying in one style is difficult, and that is not a flaw — for you a wardrobe is part of the conversation.

**Venus in Cancer.** Attachment through memory: a grandmother's earring, an old dress, a familiar scent. A new thing has to feel old.

**Venus in Leo.** The wish to be seen is sincere. A bright detail, gold, a dramatic cut. A compliment is your currency.

**Venus in Virgo.** Order is beauty. Clean lines, neutral colours, perfect stitching. Excess ornament makes you uneasy.

**Venus in Libra.** Balance and symmetry. Classical shapes, soft colours. Another person's comfort is part of your own taste.

**Venus in Scorpio.** Depth and concealment. Black, burgundy, leather. Not showing everything is the governing principle.

**Venus in Sagittarius.** Freedom. A detail from a distant culture, an easy cut, the feeling of travel.

**Venus in Capricorn.** Quality and time. One expensive piece beats ten cheap ones. Classical form, long-term choices.

**Venus in Aquarius.** The unusual. There is always one detail that does not obey the rule. Behaving against the trend is itself a style.

**Venus in Pisces.** Softness and flow. Sheer fabric, hazy colours, a romantic line.

> Venus answers not "what do you like" but "why do you call this valuable".

## Venus and money

Venus also shows your relationship with money. In earth signs — Taurus, Virgo, Capricorn — saving comes naturally. In fire signs spending is fast, but so is earning. In air signs money is tied to thought: information, contacts, communication. In water signs a financial decision is very often an emotional one.

This is not a verdict but a warning: whoever knows her weak side can manage it.

## How to use it

Next time, before buying something, ask yourself: do **I** want this, or is it simply something that pleased me at the moment I saw it? Knowing your Venus sign makes those two feelings easier to tell apart.`,
      ru: `В астрологии Венера отвечает за три области: **любовь, вкус и ценность**. Они не разделены: то, что человек считает красивым, за что он платит и к кому тянется, идёт из одной логики.

## Когда Венера в вашем знаке

Венера никогда не уходит далеко от Солнца. Поэтому ваша Венера либо в вашем солнечном знаке, либо на один-два знака раньше, либо на один-два позже. Итого всего пять вариантов — найти легко.

## Стиль по знаку Венеры

**Венера в Овне.** Быстрый выбор, сильный контраст, красный. Долгие размышления кажутся скучными; главный критерий — понравилось с первого взгляда.

**В Тельце.** Тактильность важнее всего. Натуральные материалы, кашемир, шёлк, плотная ткань. Дешёвая фактура отталкивает мгновенно.

**В Близнецах.** Удовольствие — в переменчивости. Оставаться в одном стиле трудно, и это не изъян: гардероб для вас — часть разговора.

**В Раке.** Привязанность через память: серьга от бабушки, старое платье, знакомый запах. Новая вещь должна ощущаться старой.

**Во Льве.** Желание быть увиденной искренне. Яркая деталь, золото, драматичный крой. Комплимент — ваша валюта.

**В Деве.** Порядок и есть красота. Чистые линии, нейтральные цвета, идеальный шов. Лишний декор тревожит.

**В Весах.** Равновесие и симметрия. Классические формы, мягкие цвета. Комфорт другого — часть вашего вкуса.

**В Скорпионе.** Глубина и скрытность. Чёрный, бордовый, кожа. Показывать не всё — главный принцип.

**В Стрельце.** Свобода. Деталь из далёкой культуры, свободный крой, ощущение дороги.

**В Козероге.** Качество и время. Одна дорогая вещь лучше десяти дешёвых. Классическая форма, выбор надолго.

**В Водолее.** Необычность. Всегда есть одна деталь, не подчиняющаяся правилу. Действовать против тренда — тоже стиль.

**В Рыбах.** Мягкость и текучесть. Прозрачная ткань, туманные цвета, романтическая линия.

> Венера отвечает не на вопрос «что тебе нравится», а на вопрос «почему ты называешь это ценным».

## Венера и деньги

Венера показывает и ваши отношения с деньгами. В земных знаках — Телец, Дева, Козерог — накопление даётся естественно. В огненных траты быстрые, но и заработок тоже. В воздушных деньги связаны с мыслью: информация, контакты, общение. В водных финансовое решение очень часто оказывается эмоциональным.

Это не приговор, а предупреждение: тот, кто знает свою слабую сторону, может ею управлять.

## Как этим пользоваться

В следующий раз перед покупкой спросите себя: этого хочу **я** — или это просто понравилось в момент, когда я увидела? Зная знак своей Венеры, различить эти два чувства проще.`,
      tr: `Astrolojide Venüs üç alandan sorumludur: **sevgi, zevk ve değer**. Bu üçü birbirinden ayrı değildir: insanın neyi güzel bulduğu, neye para verdiği ve kime yaklaştığı aynı mantıktan gelir.

## Venüs ne zaman kendi burcunuzdadır

Venüs Güneş'ten fazla uzaklaşamaz. Bu yüzden Venüs'ünüz ya Güneş burcunuzdadır, ya bir-iki burç öncesinde, ya da bir-iki burç sonrasında. Yani yalnızca beş olasılık var — bulmak kolay.

## Venüs burcuna göre üslup

**Venüs Koç'ta.** Hızlı seçim, güçlü kontrast, kırmızı. Uzun düşünmek sıkıcı gelir; ilk bakışta beğenmek ana ölçüttür.

**Boğa'da.** Dokunma duyusu her şeyden önemlidir. Doğal malzemeler, kaşmir, ipek, ağır kumaş. Ucuz doku anında iter.

**İkizler'de.** Haz, değişkenliktedir. Tek bir üslupta kalmak zordur ve bu bir kusur değil — sizin için gardırop sohbetin parçasıdır.

**Yengeç'te.** Bellek üzerinden bağlanma: anneanneden kalan küpe, eski bir elbise, tanıdık bir koku. Yeni şey eski hissettirmeli.

**Aslan'da.** Görünme isteği içtendir. Parlak bir ayrıntı, altın, dramatik kesim. İltifat sizin paranızdır.

**Başak'ta.** Düzen zaten güzelliktir. Temiz çizgiler, nötr renkler, kusursuz dikiş. Fazla süs huzursuz eder.

**Terazi'de.** Denge ve simetri. Klasik formlar, yumuşak renkler. Karşınızdakinin rahatı sizin zevkinizin parçasıdır.

**Akrep'te.** Derinlik ve gizlilik. Siyah, bordo, deri. Her şeyi göstermemek temel ilkedir.

**Yay'da.** Özgürlük. Uzak bir kültürden gelen ayrıntı, rahat kesim, yol duygusu.

**Oğlak'ta.** Kalite ve zaman. Bir pahalı parça on ucuza bedeldir. Klasik form, uzun vadeli seçim.

**Kova'da.** Sıra dışılık. Kurala uymayan bir ayrıntı hep vardır. Trende karşı davranmak da bir üsluptur.

**Balık'ta.** Yumuşaklık ve akıcılık. Şeffaf kumaş, puslu renkler, romantik çizgi.

> Venüs «neyi seviyorsun» sorusuna değil, «buna neden değerli diyorsun» sorusuna cevap verir.

## Venüs ve para

Venüs parayla ilişkinizi de gösterir. Toprak burçlarında — Boğa, Başak, Oğlak — biriktirmek doğal gelir. Ateş burçlarında harcamak hızlıdır ama kazanmak da öyle. Hava burçlarında para düşünceyle bağlıdır: bilgi, temas, iletişim. Su burçlarında ise finansal karar çoğu zaman duygusaldır.

Bu bir hüküm değil, bir uyarıdır: zayıf yanını bilen onu yönetebilir.

## Nasıl kullanılır

Bir dahaki sefere bir şey almadan önce kendinize sorun: bunu **ben** mi istiyorum, yoksa bu yalnızca gördüğüm anda hoşuma giden bir şey mi? Venüs burcunuzu bildiğinizde bu iki duyguyu ayırmak kolaylaşır.`,
      ar: `في التنجيم تحكم الزهرة ثلاثة مجالات: **الحبّ والذوق والقيمة**. وهي ليست منفصلة: فما تراه المرأة جميلًا، وما تدفع لأجله، ومن تميل إليه — كلّه يصدر عن المنطق نفسه.

## متى تكون الزهرة في برجك

لا تبتعد الزهرة كثيرًا عن الشمس. لذا فزهرتك إمّا في برجك الشمسي، أو في برج أو برجين قبله، أو في برج أو برجين بعده. أي خمسة احتمالات فقط — وهذا يسهّل العثور عليها.

## الأسلوب بحسب برج الزهرة

**الزهرة في الحمل.** اختيار سريع، وتباين قوي، وأحمر. التفكير الطويل ممل؛ والإعجاب من النظرة الأولى هو المعيار.

**في الثور.** حاسّة اللمس أهمّ من كل شيء. خامات طبيعية، وكشمير، وحرير، وقماش ثقيل. والملمس الرخيص ينفّر فورًا.

**في الجوزاء.** المتعة في التقلّب. البقاء في أسلوب واحد صعب، وليس هذا عيبًا — فالخزانة عندك جزء من الحديث.

**في السرطان.** تعلّق عبر الذاكرة: قرط الجدّة، فستان قديم، رائحة مألوفة. والجديد يجب أن يشعرك بأنه قديم.

**في الأسد.** الرغبة في أن تُرَي صادقة. تفصيلة لامعة، وذهب، وقصّة درامية. والمجاملة عملتك.

**في العذراء.** النظام هو الجمال. خطوط نظيفة، وألوان محايدة، وحياكة متقنة. والزخرفة الزائدة تُقلق.

**في الميزان.** توازن وتماثل. أشكال كلاسيكية وألوان ليّنة. وراحة الآخر جزء من ذوقك.

**في العقرب.** عمق وكتمان. أسود وعنابي وجلد. وعدم إظهار كل شيء هو المبدأ.

**في القوس.** حرّية. تفصيلة من ثقافة بعيدة، وقصّة مريحة، وإحساس بالطريق.

**في الجدي.** جودة ووقت. قطعة غالية واحدة تتفوّق على عشر رخيصة. شكل كلاسيكي واختيار طويل الأمد.

**في الدلو.** خروج عن المألوف. ثمّة دائمًا تفصيلة لا تطيع القاعدة. والتصرّف ضدّ الصيحة أسلوب في ذاته.

**في الحوت.** ليونة وانسياب. قماش شفّاف وألوان ضبابية وخطّ رومانسي.

> لا تجيب الزهرة عن سؤال «ماذا تحبّين» بل عن سؤال «لماذا تسمّين هذا ذا قيمة».

## الزهرة والمال

تُظهر الزهرة علاقتك بالمال أيضًا. في الأبراج الترابية — الثور والعذراء والجدي — يأتي الادّخار طبيعيًا. وفي النارية يكون الإنفاق سريعًا، والكسب كذلك. وفي الهوائية يرتبط المال بالفكر: المعلومة والصلة والتواصل. أما في المائية فالقرار المالي عاطفي في الغالب.

وهذا ليس حكمًا بل تنبيه: من تعرف نقطة ضعفها تستطيع إدارتها.

## كيف تستفيدين منها

في المرة القادمة، وقبل أن تشتري شيئًا، اسألي نفسك: هل **أنا** أريد هذا، أم أنه شيء أعجبني لحظة رأيته فحسب؟ معرفة برج زهرتك تجعل التمييز بين هذين الشعورين أسهل.`,
    },
    tags: {
      az: ["Venera", "Üslub", "Doğum xəritəsi"],
      en: ["Venus", "Style", "Birth chart"],
      ru: ["Венера", "Стиль", "Карта рождения"],
      tr: ["Venüs", "Üslup", "Doğum haritası"],
      ar: ["الزهرة", "أسلوب", "خريطة الميلاد"],
    },
    author: "Nesreen",
    publishedAt: "2026-08-23",
    readingMinutes: 5,
  },
];
