import type { Article } from "@/lib/types";

/**
 * GÜNDƏM — dünyada, Türkiyədə və Azərbaycanda qadın gündəmini müəyyən edən
 * hadisələr. Bu üç yazı 2026-cı ilin sentyabr ayındakı real təqvimə əsaslanır;
 * xəbər köhnəldikcə admin paneldən yenilənməlidir.
 */
export const gundemArticles: Article[] = [
  {
    id: "seed-gundem-venice-83",
    slug: "venesiya-83-kinofestivali",
    category: "gundem",
    subcategory: "medeniyyet",
    status: "published",
    featured: true,
    trending: true,
    coverImage: "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=1200&q=80",
    coverCredit: "Photo by Avel Chuklanov on Unsplash",
    coverAlt: {
      az: "Venesiya Kinofestivalının qırmızı xalçası",
      en: "The red carpet of the Venice Film Festival",
      ru: "Красная дорожка Венецианского кинофестиваля",
      tr: "Venedik Film Festivali'nin kırmızı halısı",
      ar: "السجادة الحمراء في مهرجان البندقية السينمائي",
    },
    title: {
      az: "Venesiyada 83-cü Kinofestival: münsiflər masasının başında bir qadın",
      en: "Venice 83: A Woman at the Head of the Jury Table",
      ru: "Венеция-83: женщина во главе жюри",
      tr: "Venedik 83: Jüri masasının başında bir kadın",
      ar: "البندقية ٨٣: امرأة على رأس لجنة التحكيم",
    },
    excerpt: {
      az: "2–12 sentyabr tarixlərində keçirilən 83-cü Venesiya Beynəlxalq Kinofestivalına aktrisa və rejissor Maggie Gyllenhaal sədrlik edir. Lido bu il yalnız premyeralarla deyil, kameranın arxasındakı qadın adları ilə də danışılır.",
      en: "The 83rd Venice International Film Festival runs from 2 to 12 September with actor and director Maggie Gyllenhaal in the jury president's chair. This year the Lido is talked about not only for its premieres but for the women behind the camera.",
      ru: "83-й Венецианский международный кинофестиваль проходит со 2 по 12 сентября, а кресло председателя жюри занимает актриса и режиссёр Мэгги Джилленхол. В этом году о Лидо говорят не только из-за премьер, но и из-за женских имён по ту сторону камеры.",
      tr: "83. Venedik Uluslararası Film Festivali 2–12 Eylül tarihlerinde yapılıyor; jüri başkanlığı koltuğunda oyuncu ve yönetmen Maggie Gyllenhaal var. Bu yıl Lido yalnızca galalarla değil, kameranın arkasındaki kadın isimlerle de konuşuluyor.",
      ar: "يُقام مهرجان البندقية السينمائي الدولي الثالث والثمانون بين ٢ و١٢ سبتمبر، وتترأس لجنة تحكيمه الممثلة والمخرجة ماغي جيلينهال. هذا العام لا يُتحدَّث عن الليدو بسبب العروض الأولى فحسب، بل بسبب أسماء النساء خلف الكاميرا أيضًا.",
    },
    body: {
      az: `Venesiya Lidosunda sentyabr həmişə eyni cür başlayır: dənizdən gələn duzlu külək, Palazzo del Cinema-nın önündəki fotoqraf sırası və qırmızı xalçanın üstündə hələ heç kimin addımlamadığı təmiz saatlar. Bu il — 2 sentyabrdan 12 sentyabradək davam edən 83-cü Venesiya Beynəlxalq Kinofestivalında — həmin saatların ardınca gələn ən vacib xəbər müsabiqə proqramından əvvəl elan olunmuşdu: əsas münsiflər heyətinə **Maggie Gyllenhaal** sədrlik edir.

Gyllenhaal-ın seçimi təsadüfi deyil. O, festival dünyasına əvvəlcə aktrisa kimi tanış oldu, sonra rejissor kürsüsünə keçdi və elə ilk filmi ilə ssenari mükafatı qazandı. Yəni münsiflər masasının başında bu il kameranın hər iki tərəfini tanıyan bir adam oturur — və bu, mükafat gecəsində oxunacaq adların siyahısına təsir edən incə, lakin real bir fərqdir.

## Açılış: "Ink" və Lidonun yeni tonu

Festival Denni Boylun **"Ink"** filmi ilə açıldı. Rupert Merdok rolunda Qay Pirs, Larri Lem rolunda Cek O'Konnell, Cül Devis rolunda isə **Kler Foy** oynayır. Açılış seçimi özlüyündə bir mesajdır: mətbuat, güc və həqiqətin qiyməti haqqında bir film, mətbuatın ən sıx toplandığı gecədə göstərilir.

Bu il Lidoda ömürlük fəaliyyətə görə mükafat da təqdim olundu — Corc Kluni səhnəyə qalxdı. Amma festivalın əsl söhbəti başqa yerdə gedir: müstəqil istehsalda qadın rejissorların payı, uzun illərdən sonra, artıq "mövzu" deyil, sadəcə cədvəlin adi hissəsi kimi görünür.

> Venesiya illərdir bir sual verir: kim danışır? Bu il cavabın yarısı qadın səsidir.

## Qırmızı xalça: az, amma dəqiq

Lidonun üslub qaydası dəyişməyib — burada həddindən artıq bəzək yox, dəqiqlik qazanır. Bu mövsümün qırmızı xalçasında üç xətt aydın görünür: dərin şərab və mürəkkəb rəngləri, çiyni açıq buraxan sadə kəsimlər və 1990-cıların minimalizminə qayıdan düz, ağır ipək donlar. Zərgərlik isə əksinə — iri, tək və mübahisəli.

## Nə üçün Bakıdan izləməyə dəyər

Venesiya bir festivaldan çoxdur: burada göstərilən film payızda Avropa kinoteatrlarına, qışda isə mükafat mövsümünə düşür. Yəni sentyabrda Lidoda alqışlanan bir ad, fevralda hamının danışdığı ada çevrilir. Bu il o adlardan bir neçəsinin qadın olacağını gözləmək üçün kifayət qədər əsas var.

Festival 12 sentyabrda Qızıl Şir-in təqdimatı ilə yekunlaşır.`,
      en: `September on the Venice Lido always begins the same way: salt wind off the water, a row of photographers in front of the Palazzo del Cinema, and those clean early hours when no one has yet walked the red carpet. This year — at the 83rd Venice International Film Festival, running from 2 to 12 September — the most important news arrived before the competition itself: **Maggie Gyllenhaal** presides over the main jury.

The choice is not incidental. Gyllenhaal came to the festival world first as an actor, then moved to the director's chair and won a screenplay prize with her very first film. So the person at the head of the jury table this year knows both sides of the camera — a subtle but real difference that tends to show up in the list of names read out on awards night.

## The opening: "Ink" and the Lido's new tone

The festival opened with Danny Boyle's **"Ink"**, with Guy Pearce as Rupert Murdoch, Jack O'Connell as Larry Lamb and **Claire Foy** as Jules Davies. The choice is itself a statement: a film about the press, power and the price of the truth, screened on the night the press is most densely gathered.

A lifetime achievement award was also presented this year — George Clooney took the stage. But the festival's real conversation is elsewhere: after many years, the share of women directing in independent production reads not as a "topic" but simply as an ordinary part of the schedule.

> Venice has been asking one question for years: who is speaking? This year, half the answer is a woman's voice.

## The red carpet: less, but exact

The Lido's style rule has not changed — precision wins here, not excess. Three lines are clear on this season's carpet: deep wine and ink shades, simple cuts that leave one shoulder bare, and flat, heavy silk gowns returning to the minimalism of the 1990s. The jewellery, by contrast, is large, singular and argumentative.

## Why it is worth watching from Baku

Venice is more than a festival: what screens here reaches European cinemas in autumn and the awards season in winter. A name applauded on the Lido in September becomes the name everyone discusses in February. There is good reason to expect several of those names to be women this year.

The festival closes on 12 September with the presentation of the Golden Lion.`,
      ru: `Сентябрь на венецианском Лидо всегда начинается одинаково: солёный ветер с воды, шеренга фотографов перед Палаццо дель Чинема и те чистые ранние часы, когда по красной дорожке ещё никто не прошёл. В этом году — на 83-м Венецианском международном кинофестивале, который идёт со 2 по 12 сентября, — самая важная новость появилась раньше самого конкурса: главное жюри возглавляет **Мэгги Джилленхол**.

Выбор не случаен. Джилленхол пришла в фестивальный мир сначала как актриса, затем перешла в режиссёрское кресло и уже первым фильмом получила приз за сценарий. То есть во главе стола жюри в этом году сидит человек, знающий обе стороны камеры, — тонкая, но вполне реальная разница, которая обычно проявляется в списке имён, зачитываемых в вечер награждения.

## Открытие: «Ink» и новая интонация Лидо

Фестиваль открылся фильмом Дэнни Бойла **«Ink»**: Гай Пирс в роли Руперта Мёрдока, Джек О'Коннелл в роли Ларри Лэмба и **Клэр Фой** в роли Джулс Дэвис. Сам выбор — уже высказывание: фильм о прессе, власти и цене правды показывают в вечер, когда пресса собрана плотнее всего.

В этом году вручили и приз за вклад в кинематограф — на сцену вышел Джордж Клуни. Но настоящий разговор фестиваля идёт в другом месте: спустя много лет доля женщин-режиссёров в независимом производстве читается уже не как «тема», а просто как обычная часть расписания.

> Венеция много лет задаёт один вопрос: кто говорит? В этом году половина ответа — женский голос.

## Красная дорожка: меньше, но точнее

Стилевое правило Лидо не изменилось — здесь выигрывает точность, а не избыток. На дорожке этого сезона видны три линии: глубокие винные и чернильные оттенки, простые кроя с одним открытым плечом и прямые тяжёлые шёлковые платья, возвращающие минимализм 1990-х. Украшения, напротив, крупные, единственные и спорные.

## Почему за этим стоит следить из Баку

Венеция — больше, чем фестиваль: то, что показывают здесь, осенью доходит до европейских кинотеатров, а зимой — до наградного сезона. Имя, которому аплодировали на Лидо в сентябре, в феврале становится именем, которое обсуждают все. И есть все основания ожидать, что несколько таких имён в этом году будут женскими.

Фестиваль завершится 12 сентября вручением «Золотого льва».`,
      tr: `Venedik Lido'sunda eylül hep aynı şekilde başlar: sudan gelen tuzlu rüzgâr, Palazzo del Cinema'nın önündeki fotoğrafçı sırası ve kırmızı halıya henüz kimsenin basmadığı o temiz saatler. Bu yıl — 2–12 Eylül tarihlerinde süren 83. Venedik Uluslararası Film Festivali'nde — en önemli haber yarışmadan önce geldi: ana jüriye **Maggie Gyllenhaal** başkanlık ediyor.

Bu seçim tesadüf değil. Gyllenhaal festival dünyasına önce oyuncu olarak girdi, ardından yönetmen koltuğuna geçti ve daha ilk filmiyle senaryo ödülü kazandı. Yani bu yıl jüri masasının başında kameranın iki tarafını da bilen biri oturuyor — ödül gecesinde okunacak isim listesinde kendini gösteren ince ama gerçek bir fark.

## Açılış: "Ink" ve Lido'nun yeni tonu

Festival, Danny Boyle'un **"Ink"** filmiyle açıldı. Rupert Murdoch rolünde Guy Pearce, Larry Lamb rolünde Jack O'Connell, Jules Davies rolünde ise **Claire Foy** var. Seçim başlı başına bir bildiri: basın, iktidar ve hakikatin bedeli üzerine bir film, basının en yoğun toplandığı gecede gösteriliyor.

Bu yıl yaşam boyu başarı ödülü de takdim edildi; sahneye George Clooney çıktı. Ama festivalin asıl konuşması başka yerde: uzun yıllardan sonra bağımsız yapımda kadın yönetmenlerin payı artık bir "konu" gibi değil, programın sıradan bir parçası gibi okunuyor.

> Venedik yıllardır tek bir soru soruyor: kim konuşuyor? Bu yıl cevabın yarısı kadın sesi.

## Kırmızı halı: az ama tam yerinde

Lido'nun üslup kuralı değişmedi — burada fazlalık değil, isabet kazanıyor. Bu sezonun halısında üç çizgi net görünüyor: derin şarap ve mürekkep tonları, tek omzu açık bırakan sade kesimler ve 1990'ların minimalizmine dönen düz, ağır ipek elbiseler. Mücevher ise tam tersi: iri, tek ve tartışmalı.

## Bakü'den izlemeye neden değer

Venedik bir festivalden fazlasıdır: burada gösterilen film sonbaharda Avrupa sinemalarına, kışın ödül sezonuna ulaşır. Yani eylülde Lido'da alkışlanan bir isim, şubatta herkesin konuştuğu isme dönüşür. Bu yıl o isimlerden birkaçının kadın olacağını beklemek için yeterince sebep var.

Festival 12 Eylül'de Altın Aslan'ın takdimiyle sona eriyor.`,
      ar: `يبدأ سبتمبر في ليدو البندقية على النحو نفسه دائمًا: ريح مالحة قادمة من الماء، وصفٌّ من المصوّرين أمام قصر السينما، وتلك الساعات النظيفة الأولى قبل أن تطأ قدمٌ السجادة الحمراء. وهذا العام — في مهرجان البندقية السينمائي الدولي الثالث والثمانين الممتد بين ٢ و١٢ سبتمبر — وصل الخبر الأهم قبل المسابقة نفسها: **ماغي جيلينهال** تترأس لجنة التحكيم الرئيسية.

الاختيار ليس عابرًا. دخلت جيلينهال عالم المهرجانات ممثلةً أولًا، ثم انتقلت إلى كرسي الإخراج ونالت جائزة سيناريو عن فيلمها الأول. أي أن من يجلس على رأس طاولة التحكيم هذا العام يعرف وجهي الكاميرا — فرق دقيق لكنه حقيقي، وعادةً ما يظهر في قائمة الأسماء التي تُقرأ ليلة الجوائز.

## الافتتاح: «Ink» ونبرة الليدو الجديدة

افتُتح المهرجان بفيلم داني بويل **«Ink»**، ويؤدي غاي بيرس دور روبرت مردوخ، وجاك أوكونيل دور لاري لام، و**كلير فوي** دور جولز ديفيز. والاختيار في ذاته موقف: فيلم عن الصحافة والسلطة وثمن الحقيقة، يُعرض في الليلة التي تتكدّس فيها الصحافة أكثر من أي وقت.

قُدّمت هذا العام أيضًا جائزة عن مجمل المسيرة، وصعد جورج كلوني إلى المسرح. لكن حديث المهرجان الحقيقي في مكان آخر: بعد سنوات طويلة، صارت حصة المخرجات في الإنتاج المستقل تُقرأ لا بوصفها «موضوعًا»، بل جزءًا عاديًا من الجدول.

> تطرح البندقية سؤالًا واحدًا منذ سنوات: من الذي يتكلّم؟ هذا العام نصف الجواب صوتُ امرأة.

## السجادة الحمراء: أقل، لكن أدقّ

لم تتغيّر قاعدة الأسلوب في الليدو — هنا تفوز الدقّة لا الزيادة. تتضح ثلاثة خطوط على سجادة هذا الموسم: درجات النبيذ العميق والحبر، وقصّات بسيطة تترك كتفًا واحدًا مكشوفًا، وفساتين حرير مستقيمة ثقيلة تعيد تقشّف التسعينيات. أما المجوهرات فعلى العكس: كبيرة، مفردة، ومثيرة للجدل.

## لماذا يستحقّ المتابعة من باكو

البندقية أكثر من مهرجان: ما يُعرض هنا يصل إلى صالات أوروبا في الخريف، وإلى موسم الجوائز في الشتاء. الاسم الذي يُصفَّق له في الليدو في سبتمبر يصير في فبراير الاسم الذي يتحدّث عنه الجميع. وثمّة ما يكفي من الأسباب لتوقّع أن يكون عدد من تلك الأسماء هذا العام لنساء.

يُختتم المهرجان في ١٢ سبتمبر بتقديم جائزة الأسد الذهبي.`,
    },
    tags: {
      az: ["Venesiya", "Kino", "Festival"],
      en: ["Venice", "Cinema", "Festival"],
      ru: ["Венеция", "Кино", "Фестиваль"],
      tr: ["Venedik", "Sinema", "Festival"],
      ar: ["البندقية", "سينما", "مهرجان"],
    },
    author: "Nesreen",
    publishedAt: "2026-09-04",
    readingMinutes: 5,
  },
  {
    id: "seed-gundem-pfw-ss27",
    slug: "paris-moda-heftesi-ss27",
    category: "gundem",
    subcategory: "magazin",
    status: "published",
    featured: false,
    trending: true,
    coverImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80",
    coverCredit: "Photo by Mnz on Unsplash",
    coverAlt: {
      az: "Paris Moda Həftəsində podium",
      en: "A runway at Paris Fashion Week",
      ru: "Подиум на Неделе моды в Париже",
      tr: "Paris Moda Haftası'nda podyum",
      ar: "منصّة عرض في أسبوع الموضة بباريس",
    },
    title: {
      az: "Paris Moda Həftəsi SS27: doqquz gün, 101 ev, bir mövsümün ssenarisi",
      en: "Paris Fashion Week SS27: Nine Days, 101 Houses, One Season's Script",
      ru: "Неделя моды в Париже SS27: девять дней, 101 дом, сценарий одного сезона",
      tr: "Paris Moda Haftası SS27: dokuz gün, 101 ev, bir sezonun senaryosu",
      ar: "أسبوع الموضة في باريس SS27: تسعة أيام و١٠١ دار وسيناريو موسم كامل",
    },
    excerpt: {
      az: "28 sentyabr – 6 oktyabr tarixlərində Paris 2027 yaz-yay mövsümünü təqdim edir: 101 moda evi, 68 defile və 33 təqdimat. Nyu-York, London və Milandan sonra son söz yenə burada deyiləcək.",
      en: "From 28 September to 6 October Paris presents spring–summer 2027: 101 fashion houses, 68 shows and 33 presentations. After New York, London and Milan, the last word is spoken here again.",
      ru: "С 28 сентября по 6 октября Париж представляет весну-лето 2027: 101 модный дом, 68 показов и 33 презентации. После Нью-Йорка, Лондона и Милана последнее слово снова остаётся здесь.",
      tr: "28 Eylül – 6 Ekim tarihlerinde Paris 2027 ilkbahar-yaz sezonunu sunuyor: 101 moda evi, 68 defile ve 33 sunum. New York, Londra ve Milano'dan sonra son söz yine burada söylenecek.",
      ar: "بين ٢٨ سبتمبر و٦ أكتوبر تقدّم باريس موسم ربيع وصيف ٢٠٢٧: ١٠١ دار أزياء، و٦٨ عرضًا، و٣٣ تقديمًا. وبعد نيويورك ولندن وميلانو، تُقال الكلمة الأخيرة هنا من جديد.",
    },
    body: {
      az: `Moda təqvimi hər il eyni yolu gedir: əvvəl Nyu-York, sonra London, sonra Milan — və nəhayət Paris. Bu ardıcıllıqda Parisin rolu sadəcə "sonuncu" olmaq deyil; burada mövsümün bütün pərakəndə cizgiləri bir cümləyə yığılır. Bu il həmin cümlə **28 sentyabrdan 6 oktyabradək** yazılacaq.

Fédération de la Haute Couture et de la Mode-un rəsmi təqvimi doqquz günə **101 moda evini** yerləşdirib: **68 defile** və **33 təqdimat**. Rəqəmlər quru görünə bilər, amma onların arxasında bir mesaj var — Paris genişlənməkdən qorxmur.

## Kim açır, kim bağlayır

Həftə **28 sentyabrda Julie Kegels** ilə açılır. Bu, təqvimin ən maraqlı detallarından biridir: mövsümü açan ad artıq mütləq nəhəng bir ev olmur. Bağlanış isə klassik qalır — **6 oktyabrda Louis Vuitton** son sözü deyir.

Aralıqda isə mövsümün ən sıx günü **29 sentyabrdır**: gündüz saat 14:30-da **Christian Dior**, axşam 21:00-da **Saint Laurent**. Bir gündə iki fərqli qadın obrazı — biri quruluşlu və memarlıq kimi, digəri gecə və kölgə üzərində qurulmuş.

## Yeni adların yeri: SPHERE

Palais de Tokyo-da **30 sentyabr – 6 oktyabr** tarixlərində **SPHERE** showroom-u işləyəcək. Bu, təzə dizaynerlərin alıcılarla üzbəüz oturduğu yerdir və son illərdə Parisin ən diqqətəlayiq kəşfləri məhz oradan çıxıb. Podiumda görünən trend altı ay sonra mağazaya düşürsə, SPHERE-də görünən ad iki mövsüm sonra podiuma çıxır.

> Paris Moda Həftəsi bir nümayiş deyil, bir sənayenin illik hesabatıdır. Sadəcə bu hesabat ipəklə yazılır.

## Nəyə baxmaq lazımdır

- **Siluet.** Milanda başlayan enli çiyin xətti Parisdə yumşalacaqmı?
- **Rəng.** Son üç mövsümdür neytral tonlar hakimdir; SS27 üçün rəngin qayıtması gözlənilir.
- **Materiallar.** Sertifikatlaşdırılmış ipək və təkrar emal olunmuş toxumalar artıq press-relizin sonunda deyil, birinci abzasında yazılır.
- **Kastinq.** Podiumdakı yaş və ölçü müxtəlifliyi hər mövsüm bir az artır — bu il nə qədər?

## Bakıdan necə izləmək olar

Böyük evlərin əksəriyyəti defilelərini öz saytlarında və sosial şəbəkələrində canlı yayımlayır. Bakı vaxtı ilə Paris saatına **iki saat əlavə etmək** kifayətdir: Dior-un 14:30 defilesi bizdə 16:30, Saint Laurent-in 21:00 nümayişi isə 23:00 deməkdir.

Nesreen mövsümün ən vacib beş defilesini oktyabrın ilk həftəsində ayrıca təhlil edəcək.`,
      en: `The fashion calendar takes the same route every year: New York first, then London, then Milan — and finally Paris. In that sequence Paris is not merely "last"; it is where every scattered line of the season is gathered into a single sentence. This year that sentence will be written between **28 September and 6 October**.

The official calendar of the Fédération de la Haute Couture et de la Mode fits **101 fashion houses** into nine days: **68 runway shows** and **33 presentations**. The figures may look dry, but there is a message behind them — Paris is not afraid of growing.

## Who opens, who closes

The week opens on **28 September with Julie Kegels**. That is one of the calendar's most telling details: the name that opens a season is no longer automatically a giant house. The close stays classical — **Louis Vuitton** has the final word on **6 October**.

In between, the densest day is **29 September**: **Christian Dior** at 14:30 and **Saint Laurent** at 21:00. Two different images of a woman in one day — one structured and almost architectural, the other built out of night and shadow.

## Where the new names sit: SPHERE

The **SPHERE** showroom runs at the Palais de Tokyo from **30 September to 6 October**. This is where emerging designers sit face to face with buyers, and in recent seasons Paris's most notable discoveries have come from exactly there. A trend seen on the runway reaches the shop in six months; a name seen at SPHERE reaches the runway in two seasons.

> Paris Fashion Week is not a show but an industry's annual report. It simply happens to be written in silk.

## What to watch for

- **Silhouette.** Will the wide shoulder line that began in Milan soften in Paris?
- **Colour.** Neutrals have ruled for three seasons; SS27 is expected to bring colour back.
- **Materials.** Certified silk and recycled weaves now appear in the first paragraph of a press release, not the last.
- **Casting.** Age and size range on the runway grows a little each season — by how much this year?

## How to follow it from Baku

Most large houses stream their shows on their own sites and social channels. From Baku you simply **add two hours** to Paris time: Dior's 14:30 show is 16:30 here, and Saint Laurent's 21:00 show is 23:00.

Nesreen will publish a separate analysis of the season's five most important shows in the first week of October.`,
      ru: `Модный календарь каждый год идёт одним и тем же маршрутом: сначала Нью-Йорк, затем Лондон, затем Милан — и наконец Париж. В этой последовательности Париж не просто «последний»: именно здесь все разрозненные линии сезона собираются в одну фразу. В этом году эта фраза будет написана с **28 сентября по 6 октября**.

Официальный календарь Fédération de la Haute Couture et de la Mode уместил в девять дней **101 модный дом**: **68 показов** и **33 презентации**. Цифры могут показаться сухими, но за ними есть сообщение — Париж не боится расширяться.

## Кто открывает, кто закрывает

Неделя открывается **28 сентября показом Julie Kegels**. Это одна из самых красноречивых деталей календаря: имя, открывающее сезон, больше не обязательно принадлежит гигантскому дому. Финал остаётся классическим — последнее слово **6 октября** за **Louis Vuitton**.

Самый плотный день в середине — **29 сентября**: **Christian Dior** в 14:30 и **Saint Laurent** в 21:00. Два разных образа женщины в один день: один структурный, почти архитектурный, другой выстроен из ночи и тени.

## Где новые имена: SPHERE

Шоурум **SPHERE** работает в Palais de Tokyo с **30 сентября по 6 октября**. Здесь начинающие дизайнеры сидят лицом к лицу с байерами, и в последние сезоны самые заметные парижские открытия приходили именно оттуда. Тренд, увиденный на подиуме, доходит до магазина за полгода; имя, увиденное на SPHERE, доходит до подиума за два сезона.

> Неделя моды в Париже — не шоу, а годовой отчёт индустрии. Просто написан он шёлком.

## На что смотреть

- **Силуэт.** Смягчится ли в Париже широкая линия плеча, начавшаяся в Милане?
- **Цвет.** Три сезона правят нейтральные тона; от SS27 ждут возвращения цвета.
- **Материалы.** Сертифицированный шёлк и переработанные ткани теперь стоят в первом абзаце пресс-релиза, а не в последнем.
- **Кастинг.** Разброс возрастов и размеров на подиуме растёт с каждым сезоном — насколько в этом году?

## Как следить из Баку

Большинство крупных домов ведут прямые трансляции на своих сайтах и в соцсетях. Из Баку достаточно **прибавить два часа** к парижскому времени: показ Dior в 14:30 у нас в 16:30, показ Saint Laurent в 21:00 — в 23:00.

Nesreen опубликует отдельный разбор пяти важнейших показов сезона в первую неделю октября.`,
      tr: `Moda takvimi her yıl aynı güzergâhı izler: önce New York, sonra Londra, sonra Milano — ve nihayet Paris. Bu sıralamada Paris yalnızca "sonuncu" değildir; sezonun dağınık bütün çizgileri burada tek bir cümlede toplanır. Bu yıl o cümle **28 Eylül – 6 Ekim** arasında yazılacak.

Fédération de la Haute Couture et de la Mode'un resmî takvimi dokuz güne **101 moda evi** sığdırdı: **68 defile** ve **33 sunum**. Rakamlar kuru görünebilir ama arkalarında bir mesaj var — Paris büyümekten korkmuyor.

## Kim açıyor, kim kapatıyor

Hafta **28 Eylül'de Julie Kegels** ile açılıyor. Bu, takvimin en çok şey anlatan ayrıntılarından biri: bir sezonu açan isim artık zorunlu olarak dev bir ev değil. Kapanış klasik kalıyor — **6 Ekim'de** son sözü **Louis Vuitton** söylüyor.

Arada en yoğun gün **29 Eylül**: saat 14:30'da **Christian Dior**, 21:00'de **Saint Laurent**. Bir günde iki farklı kadın imgesi — biri yapılı, neredeyse mimari; diğeri geceden ve gölgeden kurulmuş.

## Yeni isimlerin yeri: SPHERE

**SPHERE** showroom'u Palais de Tokyo'da **30 Eylül – 6 Ekim** arasında çalışacak. Yeni tasarımcıların alıcılarla yüz yüze oturduğu yer burasıdır ve son sezonlarda Paris'in en dikkat çekici keşifleri tam da oradan çıktı. Podyumda görülen bir eğilim altı ayda mağazaya ulaşır; SPHERE'de görülen bir isim iki sezonda podyuma çıkar.

> Paris Moda Haftası bir gösteri değil, bir sektörün yıllık raporudur. Sadece ipekle yazılmıştır.

## Nelere bakmalı

- **Siluet.** Milano'da başlayan geniş omuz çizgisi Paris'te yumuşayacak mı?
- **Renk.** Üç sezondur nötr tonlar hüküm sürüyor; SS27'den rengin dönüşü bekleniyor.
- **Malzeme.** Sertifikalı ipek ve geri dönüştürülmüş dokumalar artık basın bülteninin son değil ilk paragrafında yazıyor.
- **Kadrolama.** Podyumdaki yaş ve beden çeşitliliği her sezon biraz artıyor — bu yıl ne kadar?

## Bakü'den nasıl izlenir

Büyük evlerin çoğu defilelerini kendi sitelerinde ve sosyal medyada canlı yayımlıyor. Bakü'den Paris saatine **iki saat eklemek** yeterli: Dior'un 14:30 defilesi bizde 16:30, Saint Laurent'in 21:00 gösterisi 23:00 demek.

Nesreen, sezonun en önemli beş defilesini ekim ayının ilk haftasında ayrıca değerlendirecek.`,
      ar: `يسلك تقويم الموضة الطريق نفسه كل عام: نيويورك أولًا، ثم لندن، ثم ميلانو — وأخيرًا باريس. وفي هذا الترتيب ليست باريس مجرّد «الأخيرة»؛ فهي المكان الذي تُجمع فيه خطوط الموسم المتفرّقة كلّها في جملة واحدة. وهذا العام ستُكتب تلك الجملة بين **٢٨ سبتمبر و٦ أكتوبر**.

وضع التقويم الرسمي للاتحاد الفرنسي للخياطة الراقية والأزياء **١٠١ دار أزياء** في تسعة أيام: **٦٨ عرضًا** و**٣٣ تقديمًا**. قد تبدو الأرقام جافّة، لكن خلفها رسالة — باريس لا تخاف الاتّساع.

## من يفتتح ومن يختتم

يُفتتح الأسبوع في **٢٨ سبتمبر بعرض Julie Kegels**. وهذه من أكثر تفاصيل التقويم دلالة: لم يعد الاسم الذي يفتتح الموسم بالضرورة دارًا عملاقة. أما الختام فيبقى كلاسيكيًا — الكلمة الأخيرة في **٦ أكتوبر** لـ**Louis Vuitton**.

وفي المنتصف، أكثر الأيام ازدحامًا هو **٢٩ سبتمبر**: **Christian Dior** في الثانية والنصف ظهرًا، و**Saint Laurent** في التاسعة مساءً. صورتان مختلفتان للمرأة في يوم واحد — واحدة مبنيّة تكاد تكون معمارية، والأخرى مصنوعة من الليل والظل.

## مكان الأسماء الجديدة: SPHERE

يعمل صالون **SPHERE** في قصر طوكيو بين **٣٠ سبتمبر و٦ أكتوبر**. هنا يجلس المصممون الصاعدون وجهًا لوجه أمام المشترين، ومن هناك تحديدًا خرجت أبرز اكتشافات باريس في المواسم الأخيرة. الاتجاه الذي يُرى على المنصّة يصل إلى المتجر خلال ستة أشهر؛ والاسم الذي يُرى في SPHERE يصل إلى المنصّة خلال موسمين.

> أسبوع الموضة في باريس ليس عرضًا بل تقرير صناعة سنوي. غير أنه مكتوب بالحرير.

## ما الذي يستحقّ الانتباه

- **القصّة.** هل يلين خط الكتف العريض الذي بدأ في ميلانو حين يصل إلى باريس؟
- **اللون.** حكمت الألوان المحايدة ثلاثة مواسم؛ ويُنتظر من SS27 عودة اللون.
- **الخامات.** صار الحرير المعتمَد والأنسجة المُعاد تدويرها يُذكران في الفقرة الأولى من البيان الصحفي لا الأخيرة.
- **الاختيار.** يتّسع مدى الأعمار والمقاسات على المنصّة قليلًا كل موسم — فكم هذا العام؟

## كيف تتابعينه من باكو

تبثّ معظم الدور الكبرى عروضها مباشرةً على مواقعها وحساباتها. من باكو يكفي **إضافة ساعتين** إلى توقيت باريس: عرض Dior في ١٤:٣٠ يوافق ١٦:٣٠ عندنا، وعرض Saint Laurent في ٢١:٠٠ يوافق ٢٣:٠٠.

ستنشر «نسرين» تحليلًا منفصلًا لأهمّ خمسة عروض في الموسم خلال الأسبوع الأول من أكتوبر.`,
    },
    tags: {
      az: ["Paris", "Moda həftəsi", "SS27"],
      en: ["Paris", "Fashion week", "SS27"],
      ru: ["Париж", "Неделя моды", "SS27"],
      tr: ["Paris", "Moda haftası", "SS27"],
      ar: ["باريس", "أسبوع الموضة", "SS27"],
    },
    author: "Nesreen",
    publishedAt: "2026-09-03",
    readingMinutes: 5,
  },
  {
    id: "seed-gundem-afw-20",
    slug: "azerbaijan-fashion-week-20-il",
    category: "gundem",
    subcategory: "xeberler",
    status: "published",
    featured: false,
    trending: false,
    coverImage: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&q=80",
    coverCredit: "Photo by Roman Kraft on Unsplash",
    coverAlt: {
      az: "Xəzər sahilində moda nümayişi",
      en: "A fashion show on the Caspian shore",
      ru: "Модный показ на берегу Каспия",
      tr: "Hazar kıyısında moda gösterisi",
      ar: "عرض أزياء على ساحل بحر قزوين",
    },
    title: {
      az: "Azerbaijan Fashion Week 20 yaşında: «Su elementi» və Xəzərin yeni moda xəritəsi",
      en: "Azerbaijan Fashion Week Turns 20: 'The Water Element' and a New Fashion Map of the Caspian",
      ru: "Azerbaijan Fashion Week — 20 лет: «Стихия воды» и новая модная карта Каспия",
      tr: "Azerbaijan Fashion Week 20 yaşında: «Su Elementi» ve Hazar'ın yeni moda haritası",
      ar: "أسبوع الموضة الأذربيجاني يبلغ العشرين: «عنصر الماء» وخريطة موضة جديدة لبحر قزوين",
    },
    excerpt: {
      az: "Xəzər regionunun ən böyük moda platforması iyulda Sea Breeze-də 20-ci yubiley mövsümünü keçirdi. Bu mövsümün əsas mövzusu — «Su elementi», əsas xəbəri isə Dome Middle East Fashion Week ilə strateji tərəfdaşlıq oldu.",
      en: "The Caspian region's largest fashion platform held its 20th anniversary season at Sea Breeze in July. The season's theme was 'The Water Element'; its biggest news was a strategic partnership with Dome Middle East Fashion Week.",
      ru: "Крупнейшая модная платформа Каспийского региона провела в июле свой 20-й юбилейный сезон в Sea Breeze. Тема сезона — «Стихия воды», а главная новость — стратегическое партнёрство с Dome Middle East Fashion Week.",
      tr: "Hazar bölgesinin en büyük moda platformu 20. yıl sezonunu temmuzda Sea Breeze'de gerçekleştirdi. Sezonun teması «Su Elementi», en büyük haberi ise Dome Middle East Fashion Week ile stratejik ortaklık oldu.",
      ar: "أقامت أكبر منصّة أزياء في منطقة بحر قزوين موسمها العشرين في «سي بريز» في يوليو. كان موضوع الموسم «عنصر الماء»، وخبره الأبرز شراكة استراتيجية مع أسبوع الموضة «دوم» للشرق الأوسط.",
    },
    body: {
      az: `Bir moda platformasının iyirmi il yaşaması nadir hadisədir. Azərbaycan üçün isə bu, həm də bir sənayenin necə qurulduğunun tarixidir: ilk illərdə bir neçə dizayner və bir zal, indi isə Xəzər regionunun ən böyük beynəlxalq moda meydanı.

**Azerbaijan Fashion Week**-in 20-ci yubiley mövsümü **20–22 iyul 2026** tarixlərində Bakı sahilində, **Sea Breeze**-də keçirildi. Mövsümün mövzusu **«Su elementi»** seçilmişdi — hərəkət, çevrilmə, təmizlik və birlik. Xəzərin kənarında keçirilən bir moda həftəsi üçün bundan dəqiq metafora tapmaq çətindir.

## Ən vacib xəbər: iki platformanın birləşməsi

Yubiley mövsümünün əsl xəbəri podiumda deyil, səhnə arxasında elan olundu: **Azerbaijan Fashion Week** və **Dome Middle East Fashion Week** ilk dəfə strateji tərəfdaşlığa getdi. İki beynəlxalq platforma bir araya gələrək dizaynerləri, alıcıları, media və yaradıcı sektor liderlərini eyni məkanda topladı.

Bunun praktik mənası sadədir: Bakıda kolleksiyasını göstərən bir dizayner artıq yalnız yerli alıcının qarşısında dayanmır. Körfəz bazarının alıcıları ilə eyni salonda oturur.

## Adlar

Son mövsümlərdə platformanın podiumunda görünən brendlər arasında **Aygün Talıbova**, **Zümrüd Mirzəliyeva**, **Şəfaq Məmmədova**, **Sida**, **Çovğun**, **Saint Aslan** və **TUVA** var.

Azərbaycan modasının tanınmış imzalarından bir neçəsi isə artıq öz məktəbini qurub:

- **Gülnarə Xəlilova** (Cizgi) — milli motivin müasir kəsimlə birləşdiyi ilk ardıcıl nümunələrdən biri.
- **Aysel Sadıxova** (Parcha) — Eurovision 2023 səhnə geyimlərinin müəllifi.
- **Kamilla Babayeva** (L'Arc) — gənc nəslin ən çox danışılan adlarından.

> Yerli moda «milli motiv» mərhəbəsindən çıxıb. Artıq söhbət kəsim, material və istehsal zənciri haqqındadır.

## Payız təqvimi

Platformanın **payız-qış 2026–2027** mövsümü may ayında Azərbaycan Dövlət Akademik Filarmoniyasında keçirilmişdi — aparıcı Azərbaycan dizaynerlərini və beynəlxalq brendləri bir araya gətirən klassik format.

İyirmi il ərzində dəyişən yalnız məkan deyil. Dəyişən — Bakının moda xəritəsindəki mövqeyidir: keçmişdə trendi izləyən şəhər, indi trendin bir hissəsini istehsal edən şəhərdir.`,
      en: `It is rare for a fashion platform to live twenty years. For Azerbaijan it is also the history of how an industry was built: a few designers and one hall in the early years, now the largest international fashion arena in the Caspian region.

The 20th anniversary season of **Azerbaijan Fashion Week** took place on **20–22 July 2026** on the Baku coast at **Sea Breeze**. The theme of the season was **"The Water Element"** — movement, transformation, purity and unity. For a fashion week held on the edge of the Caspian, it is hard to find a more exact metaphor.

## The most important news: two platforms joining

The real news of the anniversary season was announced backstage rather than on the runway: **Azerbaijan Fashion Week** and **Dome Middle East Fashion Week** entered a strategic partnership for the first time. Two international platforms came together, gathering designers, buyers, media and creative-sector leaders in one place.

The practical meaning is simple. A designer showing a collection in Baku no longer stands only before a local buyer. She sits in the same room as the buyers of the Gulf market.

## The names

Among the brands seen on the platform's runway in recent seasons are **Aygun Talibova**, **Zumrud Mirzaliyeva**, **Shafag Mammadova**, **Sida**, **Chovghun**, **Saint Aslan** and **TUVA**.

Several established signatures of Azerbaijani fashion have by now built schools of their own:

- **Gulnara Khalilova** (Cizgi) — one of the first sustained examples of a national motif meeting a modern cut.
- **Aysel Sadikhova** (Parcha) — author of the Eurovision 2023 stage costumes.
- **Kamilla Babayeva** (L'Arc) — one of the most discussed names of the younger generation.

> Local fashion has moved past the "national motif" stage. The conversation now is about cut, material and the production chain.

## The autumn calendar

The platform's **autumn–winter 2026–2027** season was held in May at the Azerbaijan State Academic Philharmonic Hall — the classical format that brings leading Azerbaijani designers together with international brands.

Over twenty years it is not only the venue that has changed. What has changed is Baku's position on the fashion map: a city that once followed the trend now produces part of it.`,
      ru: `Модной платформе редко удаётся прожить двадцать лет. Для Азербайджана это ещё и история о том, как строилась отрасль: несколько дизайнеров и один зал в первые годы — и крупнейшая международная модная площадка Каспийского региона сегодня.

Юбилейный, 20-й сезон **Azerbaijan Fashion Week** прошёл **20–22 июля 2026 года** на бакинском побережье, в **Sea Breeze**. Темой сезона стала **«Стихия воды»** — движение, превращение, чистота и единство. Для недели моды на берегу Каспия трудно найти более точную метафору.

## Главная новость: объединение двух платформ

Настоящая новость юбилейного сезона прозвучала не на подиуме, а за кулисами: **Azerbaijan Fashion Week** и **Dome Middle East Fashion Week** впервые заключили стратегическое партнёрство. Две международные платформы объединились, собрав в одном месте дизайнеров, байеров, медиа и лидеров креативного сектора.

Практический смысл прост. Дизайнер, показывающий коллекцию в Баку, больше не стоит только перед местным покупателем. Она сидит в одном зале с байерами рынка Залива.

## Имена

Среди брендов, появлявшихся на подиуме площадки в последние сезоны, — **Айгюн Талыбова**, **Зумруд Мирзалиева**, **Шафаг Мамедова**, **Sida**, **Chovghun**, **Saint Aslan** и **TUVA**.

Несколько признанных имён азербайджанской моды к этому времени создали собственные школы:

- **Гюльнара Халилова** (Cizgi) — один из первых последовательных примеров встречи национального мотива с современным кроем.
- **Айсель Садыхова** (Parcha) — автор сценических костюмов «Евровидения-2023».
- **Камилла Бабаева** (L'Arc) — одно из самых обсуждаемых имён младшего поколения.

> Местная мода вышла за пределы стадии «национального мотива». Разговор теперь идёт о крое, материале и производственной цепочке.

## Осенний календарь

Сезон **осень-зима 2026–2027** прошёл в мае в Азербайджанской государственной академической филармонии — классический формат, объединяющий ведущих азербайджанских дизайнеров и международные бренды.

За двадцать лет изменилась не только площадка. Изменилось положение Баку на модной карте: город, который прежде следовал за трендом, теперь производит его часть.`,
      tr: `Bir moda platformunun yirmi yıl yaşaması nadirdir. Azerbaycan için bu, aynı zamanda bir sektörün nasıl kurulduğunun tarihidir: ilk yıllarda birkaç tasarımcı ve tek bir salon, bugün ise Hazar bölgesinin en büyük uluslararası moda arenası.

**Azerbaijan Fashion Week**'in 20. yıl sezonu **20–22 Temmuz 2026** tarihlerinde Bakü sahilinde, **Sea Breeze**'de gerçekleşti. Sezonun teması **«Su Elementi»**ydi — hareket, dönüşüm, saflık ve birlik. Hazar kıyısında yapılan bir moda haftası için bundan daha isabetli bir metafor bulmak zor.

## En önemli haber: iki platformun birleşmesi

Yıldönümü sezonunun asıl haberi podyumda değil, kulislerde duyuruldu: **Azerbaijan Fashion Week** ile **Dome Middle East Fashion Week** ilk kez stratejik ortaklığa gitti. İki uluslararası platform bir araya gelerek tasarımcıları, alıcıları, medyayı ve yaratıcı sektör liderlerini aynı mekânda topladı.

Pratik anlamı basit. Bakü'de koleksiyon gösteren bir tasarımcı artık yalnızca yerel alıcının karşısında durmuyor. Körfez pazarının alıcılarıyla aynı salonda oturuyor.

## İsimler

Platformun podyumunda son sezonlarda görülen markalar arasında **Aygün Talıbova**, **Zümrüd Mirzeliyeva**, **Şefaq Memmedova**, **Sida**, **Chovghun**, **Saint Aslan** ve **TUVA** var.

Azerbaycan modasının tanınmış imzalarından birkaçı ise kendi ekolünü kurdu:

- **Gülnara Halilova** (Cizgi) — ulusal motifin modern kesimle buluştuğu ilk tutarlı örneklerden biri.
- **Aysel Sadıkova** (Parcha) — Eurovision 2023 sahne kostümlerinin yaratıcısı.
- **Kamilla Babayeva** (L'Arc) — genç kuşağın en çok konuşulan isimlerinden.

> Yerel moda «ulusal motif» aşamasını geride bıraktı. Artık konuşulan şey kesim, malzeme ve üretim zinciri.

## Sonbahar takvimi

Platformun **sonbahar-kış 2026–2027** sezonu mayısta Azerbaycan Devlet Akademik Filarmoni Salonu'nda yapılmıştı — önde gelen Azerbaycanlı tasarımcıları ve uluslararası markaları buluşturan klasik format.

Yirmi yılda değişen yalnızca mekân değil. Değişen şey, Bakü'nün moda haritasındaki konumu: eskiden trendi izleyen şehir, bugün trendin bir kısmını üretiyor.`,
      ar: `نادرًا ما تعيش منصّة أزياء عشرين عامًا. وبالنسبة إلى أذربيجان فهذه أيضًا حكاية كيف بُنيت صناعة: بضعة مصممين وقاعة واحدة في السنوات الأولى، واليوم أكبر ساحة أزياء دولية في منطقة بحر قزوين.

أُقيم الموسم العشرون من **أسبوع الموضة الأذربيجاني** بين **٢٠ و٢٢ يوليو ٢٠٢٦** على ساحل باكو في **«سي بريز»**. وكان موضوع الموسم **«عنصر الماء»** — الحركة والتحوّل والنقاء والوحدة. ويصعب إيجاد استعارة أدقّ من ذلك لأسبوع موضة يُقام على حافة بحر قزوين.

## الخبر الأهم: التقاء منصّتين

أُعلن خبر الموسم الحقيقي خلف الكواليس لا على المنصّة: دخل **أسبوع الموضة الأذربيجاني** و**أسبوع الموضة «دوم» للشرق الأوسط** في شراكة استراتيجية للمرة الأولى. التقت منصّتان دوليتان فجمعتا المصممين والمشترين والإعلام وقادة القطاع الإبداعي في مكان واحد.

معناه العملي بسيط: لم تعد المصمّمة التي تعرض مجموعتها في باكو تقف أمام المشتري المحلي وحده، بل تجلس في القاعة نفسها مع مشتري سوق الخليج.

## الأسماء

من العلامات التي ظهرت على منصّة المنصّة في المواسم الأخيرة: **آيغون طالبوفا**، و**زمرد ميرزالييفا**، و**شفق محمدوفا**، و**Sida**، و**Chovghun**، و**Saint Aslan**، و**TUVA**.

أما بعض التواقيع الراسخة في الموضة الأذربيجانية فقد أسّست مدارسها الخاصة:

- **غولنارا خليلوفا** (Cizgi) — من أوائل الأمثلة المتّسقة على لقاء الزخرفة الوطنية بالقصّة الحديثة.
- **آيسل صادقوفا** (Parcha) — صاحبة أزياء «يوروفيجن ٢٠٢٣».
- **كاميلا باباييفا** (L'Arc) — من أكثر أسماء الجيل الأصغر حضورًا في النقاش.

> تجاوزت الموضة المحلّية مرحلة «الزخرفة الوطنية». الحديث الآن عن القصّة والخامة وسلسلة الإنتاج.

## تقويم الخريف

أُقيم موسم **خريف وشتاء ٢٠٢٦–٢٠٢٧** في مايو في قاعة الفيلهارموني الأكاديمية الحكومية الأذربيجانية — الصيغة الكلاسيكية التي تجمع كبار المصممين الأذربيجانيين بالعلامات الدولية.

وخلال عشرين عامًا لم يتغيّر المكان وحده، بل موقع باكو على خريطة الموضة: مدينة كانت تتبع الاتجاه، صارت تنتج جزءًا منه.`,
    },
    tags: {
      az: ["Bakı", "Azerbaijan Fashion Week", "Dizayn"],
      en: ["Baku", "Azerbaijan Fashion Week", "Design"],
      ru: ["Баку", "Azerbaijan Fashion Week", "Дизайн"],
      tr: ["Bakü", "Azerbaijan Fashion Week", "Tasarım"],
      ar: ["باكو", "أسبوع الموضة الأذربيجاني", "تصميم"],
    },
    author: "Nesreen",
    publishedAt: "2026-09-01",
    readingMinutes: 4,
  },
  // Maqazin
  {
    id: "seed-gundem-magazin-cannes",
    slug: "cannes-qirmizi-xalcasi-2026",
    category: "gundem",
    subcategory: "magazin",
    status: "published",
    featured: false,
    trending: true,
    coverImage: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=80",
    coverCredit: "Photo by Ivana Cajina on Unsplash",
    coverAlt: {
      az: "Qırmızı xalça Cannes",
      en: "Red carpet Cannes",
      ru: "Красная дорожка Канны",
      tr: "Kırmızı halı Cannes",
      ar: "السجادة الحمراء في كان",
    },
    title: {
      az: "Cannes qırmızı xalçası 2026: Kim nə geyindi və nə üçün bu vacibdir",
      en: "Cannes Red Carpet 2026: Who Wore What and Why It Matters",
      ru: "Красная дорожка Канны 2026: Кто что надел и почему это важно",
      tr: "Cannes kırmızı halısı 2026: Kim ne giydi ve bu neden önemli",
      ar: "السجادة الحمراء في كان ٢٠٢٦: من لبست ماذا ولماذا هذا مهم",
    },
    excerpt: {
      az: "79-cu Cannes Kinofestivalının qırmızı xalçası — moda və kino harada kəsişir? Üç xətt: yüksək dəbdəbə geri qayıtdı, minimal artıq kifayət deyil, bədən dilini danışmaq bacarığı mükafatdan vacibdir.",
      en: "The 79th Cannes Film Festival red carpet — where fashion and film intersect? Three lines: high glamour is back, minimal is no longer enough, speaking body language matters more than an award.",
      ru: "Красная дорожка 79-го Каннского кинофестиваля — где пересекаются мода и кино? Три линии: высокий гламур вернулся, минимализма уже недостаточно, умение говорить языком тела важнее награды.",
      tr: "79. Cannes Film Festivali kırmızı halısı — moda ve sinema nerede kesişir? Üç çizgi: yüksek gösteriş geri döndü, minimal artık yeterli değil, beden dilini konuşma becerisi ödülden önemli.",
      ar: "السجادة الحمراء لمهرجان كان السينمائي التاسع والسبعين — أين تتقاطع الموضة والسينما؟ ثلاثة خطوط: البريق العالي عاد، التقليل لم يعد كافيًا، التحدث بلغة الجسد أهم من جائزة.",
    },
    body: {
      az: "Cannes festivalı iki şey üçün izlənilir: kinoya və geyimə görə. 2026-cı ildə qırmızı xalça aydın mesaj verir: minimal dövrü bitdi, dramatik siluet geri qayıtdı.",
      en: "Cannes festival is watched for two things: cinema and clothing. In 2026 the red carpet sends a clear message: the minimal era is over, dramatic silhouette is back.",
      ru: "Каннский фестиваль смотрят ради двух вещей: кино и одежды. В 2026 году красная дорожка даёт ясное послание: минималистическая эра закончена, драматический силуэт вернулся.",
      tr: "Cannes festivali iki şey için izlenir: sinema ve giyim. 2026'da kırmızı halı net bir mesaj veriyor: minimal dönem bitti, dramatik siluet geri döndü.",
      ar: "يُتابع مهرجان كان لأمرين: السينما والأزياء. في ٢٠٢٦ ترسل السجادة الحمراء رسالة واضحة: عصر البساطة انتهى، الشكل الدرامي عاد.",
    },
    tags: {
      az: ["Cannes", "Qırmızı xalça", "Moda"],
      en: ["Cannes", "Red carpet", "Fashion"],
      ru: ["Канны", "Красная дорожка", "Мода"],
      tr: ["Cannes", "Kırmızı halı", "Moda"],
      ar: ["كان", "سجادة حمراء", "موضة"],
    },
    author: "Nesreen",
    publishedAt: "2026-05-24",
    readingMinutes: 3,
  },
  // Xəbərlər
  {
    id: "seed-gundem-xeber-equal-pay",
    slug: "barabər-əmək-haqqı-qanunu-2026",
    category: "gundem",
    subcategory: "xeberler",
    status: "published",
    featured: false,
    trending: false,
    coverImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80",
    coverCredit: "Photo by AbsolutVision on Unsplash",
    coverAlt: {
      az: "Bərabər əmək haqqı protesti",
      en: "Equal pay protest",
      ru: "Протест за равную оплату",
      tr: "Eşit ücret protestosu",
      ar: "احتجاج على المساواة في الأجر",
    },
    title: {
      az: "AB-də bərabər əmək haqqı direktivi qüvvəyə minir: nə dəyişir",
      en: "EU Equal Pay Directive Comes Into Force: What Changes",
      ru: "Директива ЕС о равной оплате вступает в силу: что меняется",
      tr: "AB'de eşit ücret direktifi yürürlüğe giriyor: ne değişiyor",
      ar: "توجيه الاتحاد الأوروبي بشأن المساواة في الأجر يدخل حيز التنفيذ: ماذا يتغيّر",
    },
    excerpt: {
      az: "2026-cı ilin iyunundan Avropa Birliyində şirkətlər əmək haqqı fərqlərini açıqlamağa məcburdur. Qadınlar artıq bilirlər ki, həmkarları nə qazanır və fərq 5%-dən çoxdursa, izahat tələb edə bilərlər.",
      en: "From June 2026 companies in the European Union are required to disclose pay gaps. Women now know what colleagues earn and if the gap exceeds five per cent, they can demand explanation.",
      ru: "С июня 2026 года компании в Евросоюзе обязаны раскрывать разрыв в оплате. Женщины теперь знают, сколько зарабатывают коллеги, и если разница превышает пять процентов, могут требовать объяснений.",
      tr: "2026 Haziran'dan itibaren Avrupa Birliği'ndeki şirketler ücret farklarını açıklamak zorunda. Kadınlar artık meslektaşlarının ne kazandığını biliyor ve fark yüzde beşi aşıyorsa açıklama talep edebiliyorlar.",
      ar: "اعتبارًا من يونيو ٢٠٢٦ يُلزم الشركات في الاتحاد الأوروبي بالكشف عن فجوات الأجور. النساء الآن يعرفن ما يكسبه الزملاء وإذا تجاوزت الفجوة خمسة بالمئة يمكنهن المطالبة بالتفسير.",
    },
    body: {
      az: "AB direktivi sadə məntiqə əsaslanır: eyni iş üçün bərabər əmək haqqı. İndi şirkətlər hər il hesabat verməli və 5%-dən çox fərqi izah etməlidirlər.",
      en: "The EU directive is based on simple logic: equal pay for equal work. Now companies must report annually and explain any gap over five per cent.",
      ru: "Директива ЕС основана на простой логике: равная оплата за равный труд. Теперь компании должны отчитываться ежегодно и объяснять любую разницу свыше пяти процентов.",
      tr: "AB direktifi basit mantığa dayanır: eşit iş için eşit ücret. Şimdi şirketler yıllık rapor vermeli ve yüzde beşi aşan farkı açıklamalı.",
      ar: "يستند التوجيه الأوروبي إلى منطق بسيط: أجر متساوٍ لعمل متساوٍ. الآن يجب على الشركات تقديم تقارير سنوية وتفسير أي فجوة تتجاوز خمسة بالمئة.",
    },
    tags: {
      az: ["AB", "Bərabərlik", "Əmək haqqı"],
      en: ["EU", "Equality", "Pay"],
      ru: ["ЕС", "Равенство", "Зарплата"],
      tr: ["AB", "Eşitlik", "Ücret"],
      ar: ["الاتحاد الأوروبي", "مساواة", "أجر"],
    },
    author: "Nesreen",
    publishedAt: "2026-06-07",
    readingMinutes: 2,
  },
  // Müsahibə
  {
    id: "seed-gundem-musahibe-designer",
    slug: "azərbaycan-dizayner-parisdə",
    category: "gundem",
    subcategory: "musahibe",
    status: "published",
    featured: false,
    trending: false,
    coverImage: "https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=1200&q=80",
    coverCredit: "Photo by Manny Pantoja on Unsplash",
    coverAlt: {
      az: "Azərbaycan dizayner atelyesində",
      en: "Azerbaijani designer in atelier",
      ru: "Азербайджанский дизайнер в ателье",
      tr: "Azerbaycanlı tasarımcı atelyede",
      ar: "مصممة أذربيجانية في الأتيليه",
    },
    title: {
      az: "Müsahibə: Bakıdan Parisə — gənc dizaynerin yolu",
      en: "Interview: From Baku to Paris — A Young Designer's Path",
      ru: "Интервью: из Баку в Париж — путь молодого дизайнера",
      tr: "Röportaj: Bakü'den Paris'e — genç tasarımcının yolu",
      ar: "حوار: من باكو إلى باريس — مسار مصممة شابة",
    },
    excerpt: {
      az: "26 yaşlı azərbaycanlı dizayner Leyla Əhmədova Paris Moda Həftəsində debüt edir. Danışdığımız: lokal nədir, nə üçün Bakıda qalmadın və Avropanın nə gözləyir.",
      en: "Twenty-six-year-old Azerbaijani designer Leyla Ahmadova debuts at Paris Fashion Week. We talked about: what is local, why you did not stay in Baku and what Europe expects.",
      ru: "26-летний азербайджанский дизайнер Лейла Ахмедова дебютирует на Неделе моды в Париже. Говорили о: что такое локальное, почему не осталась в Баку и чего ждёт Европа.",
      tr: "26 yaşındaki Azerbaycanlı tasarımcı Leyla Ahmadova Paris Moda Haftası'nda çıkış yapıyor. Konuştuklarımız: yerel nedir, neden Bakü'de kalmadın ve Avrupa ne bekliyor.",
      ar: "المصممة الأذربيجانية ليلى أحمدوفا البالغة من العمر ٢٦ عامًا تظهر لأول مرة في أسبوع الموضة في باريس. تحدثنا عن: ما هو المحلي، لماذا لم تبق في باكو وماذا تتوقع أوروبا.",
    },
    body: {
      az: "Leyla Əhmədova Paris Moda Həftəsində debüt edən ilk azərbaycanlı dizaynerdir. Biz onunla Bakıdan Parisə yol, lokal identifikasiya və gələcək haqqında danışdıq.",
      en: "Leyla Ahmadova is the first Azerbaijani designer to debut at Paris Fashion Week. We talked with her about the journey from Baku to Paris, local identity and the future.",
      ru: "Лейла Ахмедова — первый азербайджанский дизайнер, дебютирующий на Неделе моды в Париже. Мы поговорили с ней о пути из Баку в Париж, локальной идентичности и будущем.",
      tr: "Leyla Ahmadova Paris Moda Haftası'nda çıkış yapan ilk Azerbaycanlı tasarımcı. Onunla Bakü'den Paris'e yol, yerel kimlik ve gelecek hakkında konuştuk.",
      ar: "ليلى أحمدوفا أول مصممة أذربيجانية تظهر في أسبوع الموضة في باريس. تحدثنا معها عن الرحلة من باكو إلى باريس والهوية المحلية والمستقبل.",
    },
    tags: {
      az: ["Müsahibə", "Dizayner", "Paris"],
      en: ["Interview", "Designer", "Paris"],
      ru: ["Интервью", "Дизайнер", "Париж"],
      tr: ["Röportaj", "Tasarımcı", "Paris"],
      ar: ["حوار", "مصممة", "باريس"],
    },
    author: "Nesreen",
    publishedAt: "2026-03-15",
    readingMinutes: 4,
  },
];
