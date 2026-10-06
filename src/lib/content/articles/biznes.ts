import type { Article } from "@/lib/types";

/** BİZNES — öz işini quran qadınlar, maliyyə savadı və danışıq masası. */
export const biznesArticles: Article[] = [
  // SAĞ TƏRƏF: Sahibkarlıq (trending: true)
  {
    id: "seed-biznes-ilk-90-gun",
    slug: "ilk-brendin-ilk-90-gunu",
    category: "biznes",
    subcategory: "sahibkarliq",
    status: "published",
    featured: false,
    trending: true,
    coverImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=80",
    coverCredit: "Photo by Marten Bjork on Unsplash",
    coverAlt: {
      az: "İş masasında plan və qeydlər",
      en: "A plan and notes on a desk",
      ru: "План и заметки на рабочем столе",
      tr: "Çalışma masasında plan ve notlar",
      ar: "خطة وملاحظات على مكتب",
    },
    title: {
      az: "İlk brendinizin ilk 90 günü: nə etməli, nədən qaçmalı",
      en: "The First 90 Days of Your First Brand: What to Do and What to Avoid",
      ru: "Первые 90 дней вашего первого бренда: что делать и чего избегать",
      tr: "İlk markanızın ilk 90 günü: ne yapmalı, neden kaçınmalı",
      ar: "أول تسعين يومًا لعلامتك الأولى: ما تفعلينه وما تتجنّبينه",
    },
    excerpt: {
      az: "Yeni biznesin ilk üç ayı loqo, vizit kartı və qablaşdırma ilə keçirsə, dördüncü ay çətin olacaq. Bu 90 gündə həqiqətən nə etmək lazım olduğunu həftələr üzrə yazdıq.",
      en: "If the first three months of a new business go on logos, business cards and packaging, the fourth month will be hard. Here is what those 90 days should actually contain, week by week.",
      ru: "Если первые три месяца нового бизнеса уходят на логотип, визитки и упаковку, четвёртый месяц будет тяжёлым. Расписали по неделям, чем на самом деле стоит наполнить эти 90 дней.",
      tr: "Yeni bir işin ilk üç ayı logo, kartvizit ve ambalajla geçerse dördüncü ay zor olur. Bu 90 günde gerçekten ne yapılması gerektiğini haftalara böldük.",
      ar: "إن مضت الأشهر الثلاثة الأولى لمشروع جديد في الشعار وبطاقات العمل والتغليف، فسيكون الشهر الرابع صعبًا. إليك ما ينبغي أن تحتويه هذه التسعون يومًا فعلًا، أسبوعًا بأسبوع.",
    },
    body: {
      az: `Yeni brendlərin çoxu birinci ilində bağlanmır — sadəcə heç vaxt başlamır. Səbəb pul deyil, ardıcıllıqdır: hazırlıq mərhələsi sonsuza qədər uzadılır, satış isə təxirə salınır.

Aşağıdakı 90 gün bu ardıcıllığı tərsinə çevirir.

## 1–14-cü gün: bir cümlə

Bu iki həftədə yalnız bir şey yazmalısınız:

> "Mən **[kim üçün]** **[hansı problemi]** **[necə]** həll edirəm."

Bu cümlə hazır deyilsə, loqoya vaxt sərf etməyin. Nümunə: "35+ yaşlı işləyən qadınlar üçün 20 dəqiqəyə hazırlanan, tərkibi açıq göstərilən dəri baxımı."

Bu mərhələdə **10 potensial müştəri ilə danışın**. Sorğu yox — söhbət. Onların dediyi sözləri yazın; brendin dili elə oradan çıxacaq.

## 15–30-cu gün: ən kiçik təklif

Tam kolleksiya yox — **bir məhsul və ya bir xidmət**. Bir SKU. Bir paket.

Qiyməti indi qoyun: xərc + istehsal vaxtınızın dəyəri + 40–60% marja. Rəqibə baxıb qiymət qoymaq ən çox rast gəlinən səhvdir; onların xərc strukturunu bilmirsiniz.

## 31–45-ci gün: ilk on satış

Reklam yox. İlk on satış **əl ilə** olmalıdır: tanışlar, sosial şəbəkədəki mövcud auditoriya, bir dəfəlik yerli tədbir.

Məqsəd pul deyil — **on nəfərin nə üçün aldığını** öyrənmək. Hər satışdan sonra bir sual: "Bunu almağınıza ən çox nə təsir etdi?"

## 46–60-cı gün: təkrar

İndi ilk on müştəriyə qayıdın. Kim ikinci dəfə aldı? Niyə? Kim almadı? Niyə?

Bir biznesin sağlamlığını yeni müştəri deyil, **qayıdan müştəri** göstərir. Qayıtma yoxdursa, məhsulda problem var — reklamda yox.

## 61–75-ci gün: rəqəmlər

Bu həftələrdə üç rəqəmi bilməlisiniz:

- **Bir müştərinin cəlb dəyəri** — bir satış üçün nə qədər xərcləyirsiniz.
- **Orta çek** — bir sifarişin ortalama məbləği.
- **Marja** — hər satışdan sizə real nə qalır.

Üçüncü rəqəm birincidən böyük deyilsə, biznes deyil, hobbidir.

## 76–90-cı gün: sistem

Yalnız indi — **indi** — brend kitabçası, saytın dizaynı, qablaşdırma. Çünki artıq kimə danışdığınızı və nəyi satdığınızı bilirsiniz.

> İlk versiya utandırmırsa, çox gec başlamısınız.

## Nədən qaçmaq lazımdır

- **Mükəmməl loqo axtarışı.** İlk ildə loqo satışın 1%-inə təsir edir.
- **Bütün platformalarda olmaq.** Bir kanal seçin, orada həftədə üç dəfə görünün.
- **Endirimlə başlamaq.** İlk qiymətiniz gələcək qiymətinizin tavanını qoyur.
- **Hər şeyi özün etmək.** Mühasibatlıq ilk gündən kənar adama verilməlidir.

## 90-cı gündən sonra

Əgər üç ayda on satış, üç qayıdan müştəri və müsbət marja varsa — sizdə biznes var. Yoxdursa, problem cəhddə deyil, təklifdədir. Bir cümləyə qayıdın və yenidən yazın.`,
      en: `Most new brands do not close in their first year — they simply never start. The reason is not money but sequence: the preparation stage is stretched indefinitely while selling is postponed.

The following 90 days reverse that sequence.

## Days 1–14: one sentence

In these two weeks you have to write only one thing:

> "I solve **[which problem]** for **[whom]**, **[how]**."

If that sentence is not ready, do not spend time on a logo. An example: "Skincare for working women over 35 that takes twenty minutes and lists every ingredient openly."

At this stage, **talk to ten potential customers**. Not a survey — a conversation. Write down the words they use; the brand's language will come out of there.

## Days 15–30: the smallest offer

Not a full collection — **one product or one service**. One SKU. One package.

Set the price now: cost, plus the value of your production time, plus a margin of 40–60%. Pricing by looking at a competitor is the commonest mistake; you do not know their cost structure.

## Days 31–45: the first ten sales

No advertising. The first ten sales should be made **by hand**: acquaintances, the audience you already have on social media, one local event.

The goal is not money but learning **why those ten people bought**. One question after each sale: "What most influenced your decision to buy this?"

## Days 46–60: repetition

Now go back to those first ten customers. Who bought a second time? Why? Who did not? Why?

The health of a business is shown not by new customers but by **returning** ones. If nobody returns, the problem is in the product, not in the advertising.

## Days 61–75: the numbers

By these weeks you must know three figures:

- **Cost of acquiring a customer** — what you spend to make one sale.
- **Average order value** — the mean size of an order.
- **Margin** — what actually remains from each sale.

If the third number is not larger than the first, this is a hobby, not a business.

## Days 76–90: the system

Only now — **now** — the brand book, the website design, the packaging. Because you finally know whom you are speaking to and what you are selling.

> If the first version does not embarrass you, you started too late.

## What to avoid

- **Hunting for the perfect logo.** In the first year a logo affects about 1% of sales.
- **Being on every platform.** Choose one channel and appear there three times a week.
- **Opening with a discount.** Your first price sets the ceiling of your future price.
- **Doing everything yourself.** Bookkeeping should go to someone else from day one.

## After day 90

If in three months you have ten sales, three returning customers and a positive margin, you have a business. If not, the problem is not in the effort but in the offer. Go back to the one sentence and write it again.`,
      ru: `Большинство новых брендов не закрываются в первый год — они просто никогда не начинаются. Причина не в деньгах, а в последовательности: этап подготовки растягивается бесконечно, а продажи откладываются.

Следующие 90 дней меняют эту последовательность на обратную.

## Дни 1–14: одно предложение

За эти две недели вы должны написать только одно:

> «Я решаю **[какую проблему]** для **[кого]** и **[как]**».

Если эта фраза не готова, не тратьте время на логотип. Пример: «Уход за кожей для работающих женщин 35+, который занимает двадцать минут и открыто показывает состав».

На этом этапе **поговорите с десятью потенциальными клиентами**. Не опрос — разговор. Записывайте их слова: язык бренда выйдет именно оттуда.

## Дни 15–30: минимальное предложение

Не полная коллекция, а **один продукт или одна услуга**. Один SKU. Один пакет.

Цену ставьте сейчас: себестоимость плюс стоимость вашего времени плюс маржа 40–60%. Ставить цену, глядя на конкурента, — самая частая ошибка: вы не знаете его структуры затрат.

## Дни 31–45: первые десять продаж

Никакой рекламы. Первые десять продаж делаются **руками**: знакомые, уже имеющаяся аудитория в соцсетях, одно локальное мероприятие.

Цель не деньги, а понимание, **почему эти десять человек купили**. После каждой продажи один вопрос: «Что больше всего повлияло на ваше решение?»

## Дни 46–60: повторность

Теперь вернитесь к первым десяти клиентам. Кто купил второй раз? Почему? Кто не купил? Почему?

Здоровье бизнеса показывают не новые клиенты, а **вернувшиеся**. Если возвратов нет, проблема в продукте, а не в рекламе.

## Дни 61–75: цифры

К этим неделям вы обязаны знать три числа:

- **Стоимость привлечения клиента** — сколько вы тратите на одну продажу.
- **Средний чек** — средняя сумма заказа.
- **Маржа** — что реально остаётся с каждой продажи.

Если третье число не больше первого, это хобби, а не бизнес.

## Дни 76–90: система

Только теперь — **теперь** — брендбук, дизайн сайта, упаковка. Потому что вы наконец знаете, с кем говорите и что продаёте.

> Если первая версия вас не смущает, вы начали слишком поздно.

## Чего избегать

- **Поиска идеального логотипа.** В первый год логотип влияет примерно на 1% продаж.
- **Присутствия на всех площадках.** Выберите один канал и появляйтесь там три раза в неделю.
- **Старта со скидки.** Первая цена задаёт потолок вашей будущей цены.
- **Делать всё самой.** Бухгалтерию стоит отдать другому человеку с первого дня.

## После 90-го дня

Если за три месяца есть десять продаж, три вернувшихся клиента и положительная маржа — у вас есть бизнес. Если нет, проблема не в усилиях, а в предложении. Вернитесь к одному предложению и напишите его заново.`,
      tr: `Yeni markaların çoğu ilk yılında kapanmaz — yalnızca hiç başlamaz. Sebep para değil, sıralamadır: hazırlık aşaması sonsuza dek uzatılırken satış ertelenir.

Aşağıdaki 90 gün bu sıralamayı tersine çevirir.

## 1–14. gün: tek bir cümle

Bu iki haftada yalnızca tek bir şey yazmalısınız:

> «Ben **[kim]** için **[hangi sorunu]** **[nasıl]** çözüyorum.»

Bu cümle hazır değilse logoya vakit harcamayın. Örnek: «35 yaş üstü çalışan kadınlar için yirmi dakika süren ve içeriğini açıkça gösteren cilt bakımı.»

Bu aşamada **on potansiyel müşteriyle konuşun**. Anket değil, sohbet. Kullandıkları kelimeleri yazın; markanın dili oradan çıkacak.

## 15–30. gün: en küçük teklif

Tam koleksiyon değil, **tek ürün ya da tek hizmet**. Tek SKU. Tek paket.

Fiyatı şimdi koyun: maliyet, artı üretim zamanınızın değeri, artı %40–60 marj. Rakibe bakarak fiyat koymak en sık yapılan hatadır; onun maliyet yapısını bilmiyorsunuz.

## 31–45. gün: ilk on satış

Reklam yok. İlk on satış **elle** yapılmalı: tanıdıklar, sosyal medyadaki mevcut kitleniz, tek bir yerel etkinlik.

Amaç para değil, **bu on kişinin neden aldığını** öğrenmek. Her satıştan sonra tek soru: «Bunu almanızda en çok ne etkili oldu?»

## 46–60. gün: tekrar

Şimdi ilk on müşteriye dönün. Kim ikinci kez aldı? Neden? Kim almadı? Neden?

Bir işin sağlığını yeni müşteriler değil, **dönen** müşteriler gösterir. Dönüş yoksa sorun üründedir, reklamda değil.

## 61–75. gün: sayılar

Bu haftalarda üç sayıyı bilmelisiniz:

- **Müşteri kazanma maliyeti** — bir satış için ne harcıyorsunuz.
- **Ortalama sepet** — bir siparişin ortalama tutarı.
- **Marj** — her satıştan gerçekte size ne kalıyor.

Üçüncü sayı birinciden büyük değilse bu iş değil, hobidir.

## 76–90. gün: sistem

Ancak şimdi — **şimdi** — marka kitabı, site tasarımı, ambalaj. Çünkü artık kime konuştuğunuzu ve ne sattığınızı biliyorsunuz.

> İlk sürüm sizi utandırmıyorsa çok geç başlamışsınız.

## Nelerden kaçınmalı

- **Kusursuz logo arayışı.** İlk yıl logonun satışa etkisi yaklaşık %1'dir.
- **Her platformda olmak.** Tek bir kanal seçin, orada haftada üç kez görünün.
- **İndirimle başlamak.** İlk fiyatınız gelecekteki fiyatınızın tavanını belirler.
- **Her şeyi kendin yapmak.** Muhasebe ilk günden bir başkasına verilmeli.

## 90. günden sonra

Üç ayda on satış, üç dönen müşteri ve pozitif marj varsa, elinizde bir iş var. Yoksa sorun çabada değil, teklifte. Tek cümleye dönün ve yeniden yazın.`,
      ar: `معظم العلامات الجديدة لا تُغلق في عامها الأول — بل لا تبدأ أصلًا. والسبب ليس المال بل الترتيب: تُمدَّد مرحلة التحضير بلا نهاية بينما يُؤجَّل البيع.

والتسعون يومًا التالية تقلب هذا الترتيب.

## اليوم ١–١٤: جملة واحدة

في هذين الأسبوعين عليك كتابة شيء واحد فقط:

> «أنا أحلّ **[أيّ مشكلة]** لصالح **[من]**، و**[كيف]**.»

إن لم تكن هذه الجملة جاهزة فلا تنفقي وقتًا على الشعار. مثال: «عناية بالبشرة للنساء العاملات فوق الخامسة والثلاثين، تستغرق عشرين دقيقة وتعرض مكوّناتها بوضوح.»

وفي هذه المرحلة **تحدّثي إلى عشرة زبائن محتملين**. لا استبيان بل حوار. دوّني الكلمات التي يستعملونها؛ فمن هناك ستخرج لغة العلامة.

## اليوم ١٥–٣٠: أصغر عرض ممكن

لا مجموعة كاملة، بل **منتج واحد أو خدمة واحدة**. صنف واحد. باقة واحدة.

وضعي السعر الآن: التكلفة، زائد قيمة وقت إنتاجك، زائد هامش ٤٠–٦٠٪. والتسعير بالنظر إلى منافس هو الخطأ الأكثر شيوعًا؛ فأنتِ لا تعرفين بنية تكاليفه.

## اليوم ٣١–٤٥: أول عشر مبيعات

بلا إعلانات. أول عشر مبيعات تُنجَز **باليد**: المعارف، والجمهور الموجود لديك على وسائل التواصل، وفعالية محلية واحدة.

والهدف ليس المال بل معرفة **لماذا اشترى هؤلاء العشرة**. وبعد كل عملية بيع سؤال واحد: «ما الذي أثّر أكثر في قرارك بالشراء؟»

## اليوم ٤٦–٦٠: التكرار

عودي الآن إلى العملاء العشرة الأوائل. من اشترى مرة ثانية؟ ولماذا؟ ومن لم يشترِ؟ ولماذا؟

صحّة أي مشروع لا يبيّنها العميل الجديد بل **العميل العائد**. وإن غاب العائدون فالمشكلة في المنتج لا في الإعلان.

## اليوم ٦١–٧٥: الأرقام

في هذه الأسابيع عليك معرفة ثلاثة أرقام:

- **كلفة اكتساب العميل** — كم تنفقين لإتمام عملية بيع واحدة.
- **متوسط الطلب** — القيمة الوسطى للطلب الواحد.
- **الهامش** — ما يتبقّى لك فعلًا من كل عملية بيع.

وإن لم يكن الرقم الثالث أكبر من الأول فهذه هواية لا عمل.

## اليوم ٧٦–٩٠: النظام

الآن فقط — **الآن** — دليل العلامة، وتصميم الموقع، والتغليف. لأنك صرتِ تعرفين إلى من تتحدّثين وماذا تبيعين.

> إن لم تُحرجك النسخة الأولى فقد بدأتِ متأخّرة جدًا.

## ما ينبغي تجنّبه

- **البحث عن الشعار المثالي.** في السنة الأولى يؤثّر الشعار في نحو ١٪ من المبيعات.
- **الوجود على كل المنصّات.** اختاري قناة واحدة وأظهري فيها ثلاث مرات أسبوعيًا.
- **البدء بخصم.** سعرك الأول يضع سقف سعرك المستقبلي.
- **فعل كل شيء بنفسك.** المحاسبة يجب أن تُسنَد إلى غيرك من اليوم الأول.

## بعد اليوم التسعين

إن كان لديك بعد ثلاثة أشهر عشر مبيعات وثلاثة عملاء عائدين وهامش موجب، فلديك عمل. وإن لم يكن، فالمشكلة ليست في الجهد بل في العرض. عودي إلى الجملة الواحدة واكتبيها من جديد.`,
    },
    tags: {
      az: ["Sahibkarlıq", "Start", "Brend"],
      en: ["Entrepreneurship", "Launch", "Brand"],
      ru: ["Предпринимательство", "Запуск", "Бренд"],
      tr: ["Girişimcilik", "Lansman", "Marka"],
      ar: ["ريادة أعمال", "إطلاق", "علامة"],
    },
    author: "Nesreen",
    publishedAt: "2026-08-31",
    readingMinutes: 5,
  },
  // SOL TƏRƏF: Maliyyə (trending: false)
  {
    id: "seed-biznes-maliyye",
    slug: "qadinlar-ucun-maliyye-savadi",
    category: "biznes",
    subcategory: "maliyye",
    status: "published",
    featured: false,
    trending: false,
    coverImage: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&q=80",
    coverCredit: "Photo by Micheile Henderson on Unsplash",
    coverAlt: {
      az: "Hesablamalar və qeyd dəftəri",
      en: "Calculations and a notebook",
      ru: "Расчёты и записная книжка",
      tr: "Hesaplamalar ve bir defter",
      ar: "حسابات ودفتر ملاحظات",
    },
    title: {
      az: "Maliyyə savadı: hər qadının bilməli olduğu yeddi rəqəm",
      en: "Financial Literacy: Seven Numbers Every Woman Should Know",
      ru: "Финансовая грамотность: семь чисел, которые должна знать каждая женщина",
      tr: "Finansal okuryazarlık: her kadının bilmesi gereken yedi sayı",
      ar: "الثقافة المالية: سبعة أرقام ينبغي أن تعرفها كل امرأة",
    },
    excerpt: {
      az: "Maliyyə müstəqilliyi böyük maaşla deyil, yeddi sadə rəqəmi bilməklə başlayır. Onları bir dəfə hesablamaq iki saat çəkir — və ondan sonra bütün qərarlar asanlaşır.",
      en: "Financial independence begins not with a large salary but with knowing seven simple numbers. Working them out once takes two hours — and every decision afterwards gets easier.",
      ru: "Финансовая независимость начинается не с большой зарплаты, а со знания семи простых чисел. Посчитать их один раз — два часа, и после этого все решения даются легче.",
      tr: "Finansal bağımsızlık büyük bir maaşla değil, yedi basit sayıyı bilmekle başlar. Bunları bir kez hesaplamak iki saat sürer — sonrasında bütün kararlar kolaylaşır.",
      ar: "لا يبدأ الاستقلال المالي براتب كبير بل بمعرفة سبعة أرقام بسيطة. حسابها مرّة واحدة يستغرق ساعتين — وبعدها تسهل كل القرارات.",
    },
    body: {
      az: `Maliyyə savadı mürəkkəb termin deyil. Bu, öz rəqəmlərinizi tanımaqdır. Aşağıdakı yeddi rəqəmi bilən adam heç vaxt "pulum hara getdi?" sualını verməz.

## 1. Real aylıq gəlir

Maaş yox — **əlinizə çatan** məbləğ. Vergi, sığorta və kreditlər çıxıldıqdan sonra. Sərbəst işləyirsinizsə, son 6 ayın ortalaması.

## 2. Sabit aylıq xərc

Hər ay dəyişməyən: kirayə, kommunal, telefon, təhsil, abunəliklər, kredit ödənişi. Bu rəqəm gəlirinizin **50%-ni** keçirsə, sistemdə problem var.

## 3. Dəyişkən xərc

Yemək, nəqliyyat, geyim, əyləncə. Bunu bilmək üçün yeganə yol — bir ay boyunca **hər xərci yazmaq**. Bir ay. Tətbiq və ya kağız — fərqi yoxdur.

## 4. Təhlükəsizlik yastığı

**Sabit xərc × 6 ay.** Bu, işsiz qaldığınız halda paniksiz altı ay yaşamağınıza imkan verən məbləğdir.

Bu rəqəmə çatmaq investisiyadan əvvəl gəlir. Yastıqsız investisiya — ilk çətinlikdə itkiylə satmaq deməkdir.

## 5. Ən bahalı borcunuzun faizi

Bütün borclarınızı faiz dərəcəsinə görə düzün. Ən yuxarıdakı — birinci bağlanmalıdır. Kredit kartı borcu (illik 25–40%) heç bir investisiyanın verə bilməyəcəyi mənfi gəlirdir.

## 6. Yığım nisbəti

Aylıq yığdığınız məbləğ ÷ gəlir × 100.

- 0–5% — təhlükəli
- 10% — minimum
- 20% — sağlam
- 30%+ — güclü

Vacib olan rəqəmin böyüklüyü yox, **ardıcıllığıdır**. Ayda 50 manat, 12 ay — 200 manatdan üç dəfə yaxşıdır.

## 7. Pensiya üçün qalan illər

67 – hazırkı yaşınız. Bu rəqəm sizə mürəkkəb faizin nə qədər vaxtı olduğunu göstərir. 25 yaşında ayda 100 manat, 45 yaşında ayda 300 manatdan çox nəticə verir.

> Pul haqqında danışmamaq nəzakət deyil. Nəzakət kimi təqdim olunan susqunluq qadınlara ən bahaya başa gələn adətdir.

## İki saatlıq tapşırıq

Bu həftə sonu:

1. Bank tətbiqini açın, son üç ayın xərclərini kateqoriyalara ayırın.
2. Yuxarıdakı yeddi rəqəmi bir kağıza yazın.
3. Yalnız birini dəyişməyi qərara alın.

Bir rəqəm. Növbəti ay ikincisi. On iki ayda yeddisi də yerində olacaq.

## Ayrıca hesab

Nikahda olan qadınlar üçün bir qeyd: birgə büdcə ilə yanaşı **öz adınıza ayrıca hesab** saxlamaq etibarsızlıq deyil, maliyyə gigiyenasıdır. Bank tarixçəsi, kredit reytinqi və müstəqillik yalnız öz adınıza olan hesabla qurulur.`,
      en: `Financial literacy is not a complicated term. It is knowing your own numbers. Anyone who knows the seven below never has to ask "where did my money go?"

## 1. Real monthly income

Not the salary but the amount that **reaches your hands**, after tax, insurance and loan repayments. If you are self-employed, take the average of the last six months.

## 2. Fixed monthly cost

What does not change month to month: rent, utilities, phone, education, subscriptions, loan payments. If this figure passes **50%** of your income, something in the system is wrong.

## 3. Variable cost

Food, transport, clothes, entertainment. The only way to know it is to **write down every expense** for one month. One month. App or paper — it makes no difference.

## 4. The safety cushion

**Fixed cost × 6 months.** This is the sum that lets you live six months without panic if you lose your job.

Reaching this figure comes before investing. Investing without a cushion means selling at a loss at the first difficulty.

## 5. The rate on your most expensive debt

List all your debts by interest rate. The one at the top is closed first. Credit-card debt at 25–40% a year is a negative return no investment can beat.

## 6. Savings rate

Amount saved monthly ÷ income × 100.

- 0–5% — dangerous
- 10% — the minimum
- 20% — healthy
- 30%+ — strong

What matters is not the size of the number but its **consistency**. Fifty a month for twelve months beats two hundred once, three times over.

## 7. Years left until retirement

67 minus your current age. This number tells you how much time compound interest has. A hundred a month at twenty-five produces more than three hundred a month at forty-five.

> Not talking about money is not politeness. Silence presented as politeness is the habit that costs women the most.

## A two-hour task

This weekend:

1. Open your banking app and sort the last three months of spending into categories.
2. Write the seven numbers above on one sheet of paper.
3. Decide to change only one of them.

One number. Next month, the second. In twelve months all seven will be in place.

## A separate account

One note for married women: keeping a **separate account in your own name** alongside a joint budget is not distrust but financial hygiene. Banking history, a credit record and independence are built only on an account in your own name.`,
      ru: `Финансовая грамотность — не сложный термин. Это знание собственных чисел. Тот, кто знает семь чисел ниже, никогда не спросит: «Куда делись деньги?»

## 1. Реальный месячный доход

Не зарплата, а сумма, которая **доходит до рук**, — после налогов, страховки и платежей по кредитам. Если вы работаете на себя, возьмите среднее за последние шесть месяцев.

## 2. Постоянные месячные расходы

То, что не меняется от месяца к месяцу: аренда, коммунальные, телефон, обучение, подписки, платёж по кредиту. Если эта цифра превышает **50%** дохода, в системе что-то не так.

## 3. Переменные расходы

Еда, транспорт, одежда, развлечения. Единственный способ узнать — **записывать каждый расход** в течение месяца. Одного месяца. Приложение или бумага — без разницы.

## 4. Подушка безопасности

**Постоянные расходы × 6 месяцев.** Это сумма, которая позволит прожить полгода без паники, если вы останетесь без работы.

Дойти до этой цифры нужно раньше, чем начинать инвестировать. Инвестиции без подушки означают продажу в убыток при первой же трудности.

## 5. Ставка по самому дорогому долгу

Выпишите все долги по процентной ставке. Тот, что сверху, закрывается первым. Долг по кредитной карте под 25–40% годовых — отрицательная доходность, которую не перебьёт ни одна инвестиция.

## 6. Норма сбережений

Сумма, откладываемая ежемесячно ÷ доход × 100.

- 0–5% — опасно
- 10% — минимум
- 20% — здорово
- 30%+ — сильно

Важен не размер числа, а его **регулярность**. Пятьдесят в месяц двенадцать месяцев втрое лучше, чем двести один раз.

## 7. Лет до пенсии

67 минус ваш нынешний возраст. Это число показывает, сколько времени есть у сложного процента. Сто в месяц в двадцать пять дают больше, чем триста в месяц в сорок пять.

> Не говорить о деньгах — это не вежливость. Молчание, выданное за вежливость, — привычка, которая дороже всего обходится женщинам.

## Задание на два часа

В эти выходные:

1. Откройте банковское приложение и разнесите расходы за три месяца по категориям.
2. Выпишите семь чисел выше на один лист.
3. Решите изменить только одно из них.

Одно число. В следующем месяце — второе. За двенадцать месяцев все семь встанут на место.

## Отдельный счёт

Одно замечание для замужних женщин: держать **отдельный счёт на своё имя** рядом с общим бюджетом — не недоверие, а финансовая гигиена. Банковская история, кредитный рейтинг и независимость строятся только на счёте, открытом на ваше имя.`,
      tr: `Finansal okuryazarlık karmaşık bir terim değildir. Kendi sayılarınızı bilmektir. Aşağıdaki yedi sayıyı bilen kimse «param nereye gitti?» diye sormaz.

## 1. Gerçek aylık gelir

Maaş değil, **elinize geçen** tutar: vergi, sigorta ve kredi ödemeleri düşüldükten sonra. Kendi işinizi yapıyorsanız son altı ayın ortalaması.

## 2. Sabit aylık gider

Aydan aya değişmeyenler: kira, faturalar, telefon, eğitim, abonelikler, kredi taksiti. Bu sayı gelirinizin **%50'sini** aşıyorsa sistemde bir sorun var.

## 3. Değişken gider

Yemek, ulaşım, giyim, eğlence. Bunu bilmenin tek yolu bir ay boyunca **her harcamayı yazmaktır**. Bir ay. Uygulama ya da kâğıt, fark etmez.

## 4. Güvenlik yastığı

**Sabit gider × 6 ay.** İşsiz kalırsanız altı ayı paniksiz geçirmenizi sağlayan tutar budur.

Bu rakama ulaşmak yatırımdan önce gelir. Yastıksız yatırım, ilk zorlukta zararına satmak demektir.

## 5. En pahalı borcunuzun faizi

Bütün borçlarınızı faiz oranına göre sıralayın. En üstteki ilk kapatılmalı. Yıllık %25–40 faizli kredi kartı borcu, hiçbir yatırımın yenemeyeceği negatif getiridir.

## 6. Tasarruf oranı

Aylık biriktirilen tutar ÷ gelir × 100.

- %0–5 — tehlikeli
- %10 — asgari
- %20 — sağlıklı
- %30+ — güçlü

Önemli olan sayının büyüklüğü değil, **sürekliliğidir**. Ayda elli, on iki ay boyunca; bir defalık iki yüzden üç kat iyidir.

## 7. Emekliliğe kalan yıl

67 eksi bugünkü yaşınız. Bu sayı bileşik faizin ne kadar zamanı olduğunu gösterir. Yirmi beşinde ayda yüz, kırk beşinde ayda üç yüzden fazlasını üretir.

> Para hakkında konuşmamak nezaket değildir. Nezaket diye sunulan sessizlik, kadınlara en pahalıya mal olan alışkanlıktır.

## İki saatlik ödev

Bu hafta sonu:

1. Banka uygulamasını açın, son üç ayın harcamalarını kategorilere ayırın.
2. Yukarıdaki yedi sayıyı tek bir kâğıda yazın.
3. Yalnızca birini değiştirmeye karar verin.

Bir sayı. Gelecek ay ikincisi. On iki ayda yedisi de yerine oturur.

## Ayrı hesap

Evli kadınlar için bir not: ortak bütçenin yanında **kendi adınıza ayrı bir hesap** tutmak güvensizlik değil, finansal hijyendir. Banka geçmişi, kredi notu ve bağımsızlık ancak kendi adınıza açılmış bir hesapla kurulur.`,
      ar: `الثقافة المالية ليست مصطلحًا معقّدًا. إنها معرفة أرقامك أنتِ. ومن تعرف الأرقام السبعة الآتية لن تسأل يومًا: «أين ذهب مالي؟»

## ١. الدخل الشهري الحقيقي

ليس الراتب بل المبلغ الذي **يصل إلى يدك** بعد الضريبة والتأمين وأقساط القروض. وإن كنتِ تعملين لحسابك فخذي متوسّط الأشهر الستة الأخيرة.

## ٢. المصروف الشهري الثابت

ما لا يتغيّر من شهر إلى شهر: الإيجار والفواتير والهاتف والتعليم والاشتراكات وقسط القرض. وإن تجاوز هذا الرقم **٥٠٪** من دخلك فثمّة خلل في النظام.

## ٣. المصروف المتغيّر

الطعام والتنقّل والملابس والترفيه. والسبيل الوحيد لمعرفته هو **تدوين كل نفقة** طوال شهر واحد. شهر واحد. تطبيق أو ورقة، لا فرق.

## ٤. وسادة الأمان

**المصروف الثابت × ٦ أشهر.** هذا هو المبلغ الذي يتيح لك العيش ستة أشهر بلا ذعر إن فقدتِ عملك.

وبلوغ هذا الرقم يسبق الاستثمار. فالاستثمار بلا وسادة يعني البيع بخسارة عند أول صعوبة.

## ٥. فائدة أغلى ديونك

رتّبي ديونك كلّها بحسب نسبة الفائدة. والذي في الأعلى يُسدَّد أولًا. دين بطاقة الائتمان بفائدة ٢٥–٤٠٪ سنويًا عائد سالب لا يهزمه أي استثمار.

## ٦. نسبة الادّخار

المبلغ المدّخر شهريًا ÷ الدخل × ١٠٠.

- ٠–٥٪ — خطر
- ١٠٪ — الحدّ الأدنى
- ٢٠٪ — صحّي
- ٣٠٪ فأكثر — قوي

والمهمّ ليس حجم الرقم بل **انتظامه**. خمسون شهريًا طوال اثني عشر شهرًا أفضل ثلاث مرات من مئتين مرة واحدة.

## ٧. السنوات المتبقّية حتى التقاعد

٦٧ ناقص عمرك الحالي. يخبرك هذا الرقم كم من الوقت أمام الفائدة المركّبة. مئة شهريًا في الخامسة والعشرين تنتج أكثر من ثلاثمئة شهريًا في الخامسة والأربعين.

> عدم الحديث عن المال ليس لباقة. والصمت الذي يُقدَّم بوصفه لباقة هو العادة الأغلى ثمنًا على النساء.

## مهمّة من ساعتين

في نهاية هذا الأسبوع:

1. افتحي تطبيق المصرف ووزّعي نفقات الأشهر الثلاثة الأخيرة على فئات.
2. اكتبي الأرقام السبعة أعلاه في ورقة واحدة.
3. قرّري تغيير رقم واحد منها فقط.

رقم واحد. وفي الشهر التالي الثاني. وخلال اثني عشر شهرًا تستقرّ السبعة كلّها.

## حساب منفصل

ملاحظة للمتزوّجات: الاحتفاظ بـ**حساب منفصل باسمك** إلى جانب الميزانية المشتركة ليس انعدام ثقة بل نظافة مالية. فالتاريخ المصرفي والتصنيف الائتماني والاستقلال لا تُبنى إلا على حساب باسمك أنتِ.`,
    },
    tags: {
      az: ["Maliyyə", "Yığım", "Müstəqillik"],
      en: ["Finance", "Saving", "Independence"],
      ru: ["Финансы", "Сбережения", "Независимость"],
      tr: ["Finans", "Tasarruf", "Bağımsızlık"],
      ar: ["مال", "ادّخار", "استقلال"],
    },
    author: "Nesreen",
    publishedAt: "2026-08-25",
    readingMinutes: 5,
  },
  // SOL TƏRƏF: Karyera (trending: false)
  {
    id: "seed-biznes-danisiq",
    slug: "danisiq-masasinda-maas",
    category: "biznes",
    subcategory: "karyera",
    status: "published",
    featured: false,
    trending: false,
    coverImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80",
    coverCredit: "Photo by Marten Bjork on Unsplash",
    coverAlt: {
      az: "İki nəfərin oturduğu danışıq masası",
      en: "A negotiation table set for two",
      ru: "Стол переговоров на двоих",
      tr: "İki kişilik bir müzakere masası",
      ar: "طاولة تفاوض لشخصين",
    },
    title: {
      az: "Danışıq masasında: maaş və şərtlər haqqında necə danışmalı",
      en: "At the Table: How to Talk About Salary and Terms",
      ru: "За столом переговоров: как говорить о зарплате и условиях",
      tr: "Müzakere masasında: maaş ve koşullar nasıl konuşulur",
      ar: "على طاولة التفاوض: كيف تتحدّثين عن الراتب والشروط",
    },
    excerpt: {
      az: "Maaş danışığı bir cəsarət məsələsi deyil, hazırlıq məsələsidir. Rəqəmi necə hesablamalı, ilk kim deməli, «düşünüb deyərəm» cavabını necə vermək lazımdır — addım-addım.",
      en: "A salary conversation is not a question of courage but of preparation. How to calculate the number, who should say it first, and how to answer \"let me think about it\" — step by step.",
      ru: "Разговор о зарплате — вопрос не смелости, а подготовки. Как посчитать цифру, кто называет её первым и как ответить «мне нужно подумать» — по шагам.",
      tr: "Maaş görüşmesi bir cesaret meselesi değil, hazırlık meselesidir. Rakamı nasıl hesaplamalı, ilk kim söylemeli ve «düşünüp döneyim» nasıl denir — adım adım.",
      ar: "الحديث عن الراتب ليس مسألة جرأة بل مسألة تحضير. كيف تحسبين الرقم، ومن يقوله أولًا، وكيف تقولين «أحتاج أن أفكّر» — خطوة بخطوة.",
    },
    body: {
      az: `Danışıqlarda ən çox itirilən şey pul deyil — mövqedir. Və mövqe otağa girməzdən əvvəl qurulur.

## Hazırlıq: üç rəqəm

Otağa **üç** rəqəmlə girin, biri ilə yox:

- **Hədəf** — istədiyiniz rəqəm. Bazar araşdırmasına əsaslanır.
- **Minimum** — bundan aşağı razılaşmayacağınız həd. Özünüzə əvvəlcədən söz verin.
- **İdeal** — hədəfdən 15–20% yuxarı. Danışıq buradan başlayır.

Bazar araşdırması üçün üç mənbə: sahədəki tanışlar, iş elanlarındakı aralıq, sənayenin maaş hesabatları. Ən dəqiqi birincidir — və bu, ən çox qaçırılandır.

## Kim ilk deyir

Ənənəvi məsləhət "ilk siz deməyin"dir. Praktikada isə **ilk deyən çərçivəni qurur**. Ona görə:

- **Sizdə güclü mövqe varsa** (başqa təklif, nadir bacarıq) — birinci deyin, ideal rəqəmi.
- **Bazarı yaxşı bilmirsinizsə** — sual verin: "Bu vəzifə üçün ayrılmış büdcə aralığı nədir?"

## Rəqəmi necə demək

Dörd qayda:

1. **Dəqiq rəqəm deyin**, yuvarlaq yox. "3 200" — "3 000"dən daha araşdırılmış səslənir.
2. **Aralıq verməyin.** "3 000–3 500" desəniz, eşidilən 3 000-dir.
3. **İzah əlavə etməyin.** Rəqəmi deyin və **susun**. Sükut sizin tərəfinizdədir.
4. **Üzr istəməyin.** "Bilirəm ki, çoxdur, amma…" cümləsi rəqəmi özünüz aşağı salır.

## Pul yeganə vahid deyil

Rəqəm bağlıdırsa, masada başqa maddələr var:

- Uzaqdan iş günlərinin sayı
- Əlavə məzuniyyət günləri
- Təhsil və konfrans büdcəsi
- Vəzifə adı (növbəti iş üçün dəyəri var)
- Altı ay sonra baxış tarixi — **yazılı**
- Bonus strukturu və onun ölçü meyarı

Sonuncu ən çox unudulan maddədir: "bonus var" ifadəsi ölçü meyarı yazılmayana qədər boş cümlədir.

> Danışıqda ən güclü cümlə "yox" deyil. "Bunu düşünüb sabah cavab verəcəyəm" cümləsidir.

## Cavabı gecikdirmək

Təklif alanda dərhal razılaşmayın. Hətta yaxşı təklif olsa belə:

"Təşəkkür edirəm, bu təklif mənim üçün önəmlidir. **24 saat** düşünüb dəqiq cavab verim."

Bu bir cümlə iki şey edir: sizə hesablamaq üçün vaxt verir və qarşı tərəfə sizin ölçülü qərar verdiyinizi göstərir.

## Sonra nə etməli

Razılaşma şifahi qalmasın. Görüşdən sonra qısa e-poçt yazın:

> "Bugünkü söhbətimizi yekunlaşdırım: vəzifə — …, maaş — …, başlama tarixi — …, altı aylıq baxış — …. Nəyisə səhv yazmışamsa, xəbər verərsiniz."

Bu e-poçt gələcəkdə yaranacaq bütün mübahisələri əvvəlcədən bağlayır.

## Ən vacib hissə

Danışıq bacarığı təbii deyil — məşqlədir. Növbəti danışıqdan əvvəl həmin söhbəti bir dostunuzla **ucadan** keçirin. Rəqəmi ucadan demək — ilk dəfə otaqda yox, təhlükəsiz yerdə olmalıdır.`,
      en: `What is most often lost in a negotiation is not money but position. And position is built before you enter the room.

## Preparation: three numbers

Walk in with **three** numbers, not one:

- **Target** — the figure you want, based on market research.
- **Minimum** — the line below which you will not agree. Promise it to yourself in advance.
- **Ideal** — 15–20% above target. The conversation starts here.

Three sources for research: acquaintances in the field, the range in job listings, industry salary reports. The first is the most accurate — and the most often skipped.

## Who speaks first

The traditional advice is "never name a number first". In practice, **whoever speaks first sets the frame**. So:

- **If your position is strong** (another offer, a rare skill) — go first, with the ideal figure.
- **If you do not know the market well** — ask: "What is the budgeted range for this role?"

## How to say the number

Four rules:

1. **Give an exact figure**, not a round one. "3,200" sounds more researched than "3,000".
2. **Do not give a range.** Say "3,000–3,500" and what is heard is 3,000.
3. **Do not add an explanation.** Say the number and **stay silent**. The silence is on your side.
4. **Do not apologise.** "I know it's a lot, but…" lowers the figure yourself.

## Money is not the only unit

If the figure is fixed, other items remain on the table:

- The number of remote days
- Extra holiday days
- A budget for training and conferences
- The job title (it has value for the next role)
- A review date in six months — **in writing**
- The bonus structure and the metric that measures it

The last is the most commonly forgotten: "there is a bonus" is an empty sentence until the metric is written down.

> The strongest sentence in a negotiation is not "no". It is "I will think about it and answer tomorrow".

## Delaying the answer

Never accept an offer on the spot. Even a good one:

"Thank you, this offer matters to me. Let me take **24 hours** and give you a precise answer."

That one sentence does two things: it gives you time to calculate, and it shows the other side that you make measured decisions.

## What to do afterwards

Do not let the agreement stay verbal. Write a short email after the meeting:

> "To summarise our conversation today: role — …, salary — …, start date — …, six-month review — …. Do let me know if I have noted anything incorrectly."

That email closes in advance every dispute that could arise later.

## The most important part

Negotiating is not a natural talent but a rehearsed skill. Before your next one, run the conversation **out loud** with a friend. The first time you say the number aloud should be in a safe place, not in the room.`,
      ru: `Чаще всего в переговорах теряют не деньги, а позицию. А позиция выстраивается до того, как вы вошли в комнату.

## Подготовка: три числа

Входите с **тремя** числами, а не с одним:

- **Цель** — сумма, которую вы хотите, на основе исследования рынка.
- **Минимум** — граница, ниже которой вы не согласитесь. Пообещайте её себе заранее.
- **Идеал** — на 15–20% выше цели. Разговор начинается отсюда.

Три источника для исследования: знакомые в отрасли, вилка в вакансиях, зарплатные отчёты. Точнее всего первый — и его чаще всего пропускают.

## Кто называет первым

Традиционный совет — «не называйте цифру первой». На практике **тот, кто говорит первым, задаёт рамку**. Поэтому:

- **Если позиция сильна** (есть другое предложение, редкий навык) — называйте первой, идеальную цифру.
- **Если рынок вы знаете плохо** — задайте вопрос: «Какая вилка заложена в бюджет на эту роль?»

## Как называть цифру

Четыре правила:

1. **Называйте точное число**, не круглое. «3 200» звучит исследованнее, чем «3 000».
2. **Не давайте вилку.** Скажете «3 000–3 500» — услышат 3 000.
3. **Не добавляйте объяснений.** Назовите число и **замолчите**. Пауза работает на вас.
4. **Не извиняйтесь.** «Я понимаю, что это много, но…» — вы сами снижаете цифру.

## Деньги — не единственная единица

Если цифра зафиксирована, на столе остаются другие пункты:

- Количество удалённых дней
- Дополнительные дни отпуска
- Бюджет на обучение и конференции
- Название должности (оно имеет ценность для следующей работы)
- Дата пересмотра через полгода — **письменно**
- Структура бонуса и метрика, по которой он считается

Последнее забывают чаще всего: фраза «бонус есть» пуста, пока не записана метрика.

> Самая сильная фраза в переговорах — не «нет». Это «я подумаю и отвечу завтра».

## Отложить ответ

Не соглашайтесь сразу. Даже на хорошее предложение:

«Спасибо, это предложение для меня важно. Дайте мне **24 часа**, и я отвечу точно».

Одна фраза делает две вещи: даёт вам время посчитать и показывает другой стороне, что вы принимаете взвешенные решения.

## Что делать после

Не оставляйте договорённость устной. После встречи напишите короткое письмо:

> «Подытожу нашу сегодняшнюю встречу: должность — …, зарплата — …, дата выхода — …, пересмотр через полгода — …. Если я что-то записала неверно, дайте знать».

Это письмо заранее закрывает все споры, которые могли бы возникнуть позже.

## Самое важное

Умение вести переговоры — не врождённое, а отрепетированное. Перед следующими переговорами проговорите разговор **вслух** с подругой. Первый раз произнести цифру вслух нужно в безопасном месте, а не в кабинете.`,
      tr: `Müzakerelerde en çok kaybedilen şey para değil, konumdur. Ve konum, odaya girmeden önce kurulur.

## Hazırlık: üç sayı

Odaya bir değil **üç** sayıyla girin:

- **Hedef** — istediğiniz rakam; pazar araştırmasına dayanır.
- **Asgari** — altına razı olmayacağınız sınır. Kendinize önceden söz verin.
- **İdeal** — hedefin %15–20 üstü. Konuşma buradan başlar.

Araştırma için üç kaynak: sektördeki tanıdıklar, ilanlardaki aralık, sektör maaş raporları. En isabetlisi birincisidir — ve en çok atlanan da odur.

## İlk kim söyler

Geleneksel öğüt «rakamı ilk siz söylemeyin»dir. Uygulamada ise **ilk konuşan çerçeveyi kurar**. Bu yüzden:

- **Konumunuz güçlüyse** (başka teklif, nadir bir beceri) — ilk siz söyleyin, ideal rakamı.
- **Pazarı iyi bilmiyorsanız** — sorun: «Bu pozisyon için ayrılan bütçe aralığı nedir?»

## Rakam nasıl söylenir

Dört kural:

1. **Kesin bir rakam söyleyin**, yuvarlak değil. «3.200», «3.000»den daha araştırılmış durur.
2. **Aralık vermeyin.** «3.000–3.500» derseniz duyulan 3.000'dir.
3. **Açıklama eklemeyin.** Rakamı söyleyin ve **susun**. Sessizlik sizin tarafınızda.
4. **Özür dilemeyin.** «Çok olduğunu biliyorum ama…» cümlesi rakamı sizin elinizle düşürür.

## Para tek birim değildir

Rakam sabitse masada başka maddeler kalır:

- Uzaktan çalışma günü sayısı
- Ek izin günleri
- Eğitim ve konferans bütçesi
- Unvan (bir sonraki iş için değeri vardır)
- Altı ay sonra gözden geçirme tarihi — **yazılı**
- Prim yapısı ve onu ölçen metrik

Sonuncusu en çok unutulanıdır: «prim var» cümlesi, metrik yazılmadıkça boştur.

> Müzakerede en güçlü cümle «hayır» değildir. «Düşünüp yarın cevap vereceğim» cümlesidir.

## Cevabı ertelemek

Teklifi hemen kabul etmeyin. İyi bir teklif olsa bile:

«Teşekkür ederim, bu teklif benim için önemli. **24 saat** düşünüp net cevap vereyim.»

Bu tek cümle iki iş yapar: hesaplamanız için zaman kazandırır ve karşı tarafa ölçülü karar verdiğinizi gösterir.

## Sonrasında ne yapmalı

Anlaşma sözlü kalmasın. Görüşmeden sonra kısa bir e-posta yazın:

> «Bugünkü görüşmemizi özetleyeyim: pozisyon — …, maaş — …, başlangıç tarihi — …, altı aylık gözden geçirme — …. Bir şeyi yanlış not ettiysem bildirin.»

Bu e-posta, ileride çıkabilecek bütün anlaşmazlıkları peşinen kapatır.

## En önemli kısım

Müzakere doğuştan gelen bir yetenek değil, prova edilmiş bir beceridir. Bir sonrakinden önce konuşmayı bir arkadaşınızla **yüksek sesle** geçin. Rakamı ilk kez sesli söylemek, odada değil güvenli bir yerde olmalı.`,
      ar: `أكثر ما يُفقد في التفاوض ليس المال بل الموقع. والموقع يُبنى قبل دخولك الغرفة.

## التحضير: ثلاثة أرقام

ادخلي بـ**ثلاثة** أرقام لا برقم واحد:

- **الهدف** — الرقم الذي تريدينه، مبنيًّا على بحث في السوق.
- **الحدّ الأدنى** — الخطّ الذي لن تقبلي دونه. اقطعي على نفسك وعدًا مسبقًا.
- **المثالي** — أعلى من الهدف بـ ١٥–٢٠٪. ومن هنا يبدأ الحديث.

وثلاثة مصادر للبحث: معارف في المجال، والمدى المذكور في الإعلانات، وتقارير رواتب القطاع. وأدقّها الأول — وهو الأكثر تخطّيًا.

## من يتكلّم أولًا

النصيحة التقليدية «لا تذكري رقمًا أولًا». وعمليًا فإن **من يتكلّم أولًا يضع الإطار**. لذا:

- **إن كان موقعك قويًا** (عرض آخر، مهارة نادرة) — ابدئي أنتِ، بالرقم المثالي.
- **وإن كنتِ لا تعرفين السوق جيدًا** — اسألي: «ما المدى المرصود في الميزانية لهذا الدور؟»

## كيف يُقال الرقم

أربع قواعد:

1. **اذكري رقمًا دقيقًا** لا مدوّرًا. «٣٢٠٠» تبدو مبنيّة على بحث أكثر من «٣٠٠٠».
2. **لا تعطي مدًى.** إن قلتِ «٣٠٠٠–٣٥٠٠» فالمسموع ٣٠٠٠.
3. **لا تُضيفي شرحًا.** قولي الرقم ثم **اصمتي**. الصمت في صفّك.
4. **لا تعتذري.** جملة «أعلم أنه كثير، لكن…» تخفض الرقم بيدك.

## المال ليس الوحدة الوحيدة

إن ثبت الرقم فثمّة بنود أخرى على الطاولة:

- عدد أيام العمل عن بُعد
- أيام إجازة إضافية
- ميزانية للتدريب والمؤتمرات
- المسمّى الوظيفي (له قيمة في الوظيفة التالية)
- موعد مراجعة بعد ستة أشهر — **مكتوبًا**
- بنية المكافأة والمقياس الذي تُحسب به

والأخير هو الأكثر نسيانًا: عبارة «هناك مكافأة» جملة فارغة ما لم يُكتب المقياس.

> أقوى جملة في التفاوض ليست «لا»، بل «سأفكّر وأردّ غدًا».

## تأجيل الجواب

لا تقبلي العرض فورًا، حتى لو كان جيدًا:

«شكرًا لك، هذا العرض مهمّ بالنسبة إليّ. امنحيني **٢٤ ساعة** لأعطيك جوابًا دقيقًا.»

هذه الجملة تفعل أمرين: تمنحك وقتًا للحساب، وتُظهر للطرف الآخر أنك تتّخذين قرارات موزونة.

## ماذا بعد

لا تدعي الاتفاق شفويًا. اكتبي بعد اللقاء رسالة قصيرة:

> «تلخيصًا لحديثنا اليوم: الدور — …، الراتب — …، تاريخ المباشرة — …، المراجعة بعد ستة أشهر — …. أرجو إعلامي إن كنتُ دوّنت شيئًا على غير وجهه.»

هذه الرسالة تغلق مسبقًا كل خلاف قد ينشأ لاحقًا.

## الجزء الأهم

التفاوض ليس موهبة فطرية بل مهارة مُتمرَّن عليها. وقبل التفاوض القادم، مرّي على الحوار **بصوت عالٍ** مع صديقة. فأول مرة تنطقين فيها الرقم يجب أن تكون في مكان آمن، لا في الغرفة.`,
    },
    tags: {
      az: ["Danışıqlar", "Karyera", "Maaş"],
      en: ["Negotiation", "Career", "Salary"],
      ru: ["Переговоры", "Карьера", "Зарплата"],
      tr: ["Müzakere", "Kariyer", "Maaş"],
      ar: ["تفاوض", "مسيرة مهنية", "راتب"],
    },
    author: "Nesreen",
    publishedAt: "2026-08-22",
    readingMinutes: 5,
  },
  // SOL TƏRƏF: Liderlik (trending: false)
  {
    id: "seed-biznes-liderlik-feedback",
    slug: "liderlik-cesur-feedback",
    category: "biznes",
    subcategory: "liderlik",
    status: "published",
    featured: false,
    trending: false,
    coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80",
    coverCredit: "Photo by Kvalifik on Unsplash",
    coverAlt: {
      az: "Liderlik",
      en: "Leadership",
      ru: "Лидерство",
      tr: "Liderlik",
      ar: "قيادة",
    },
    title: {
      az: "Liderlik və çətin danışıqlar: feedback vermək özü də bacarıqdır",
      en: "Leadership and Difficult Conversations: Giving Feedback Is Itself a Skill",
      ru: "Лидерство и трудные разговоры: давать обратную связь — само по себе умение",
      tr: "Liderlik ve zor konuşmalar: geri bildirim vermek de bir beceridir",
      ar: "القيادة والمحادثات الصعبة: إعطاء التغذية الراجعة مهارة بحد ذاتها",
    },
    excerpt: {
      az: "Çətin söhbət qaçınmaqla yox, strukturla idarə olunur. SBI formula: Situation-Behavior-Impact — faktlar, emosiya yox.",
      en: "Difficult conversation is managed not by avoidance but by structure. SBI formula: Situation-Behavior-Impact — facts, not emotion.",
      ru: "Трудный разговор управляется не избеганием, а структурой. Формула SBI: Situation-Behavior-Impact — факты, не эмоции.",
      tr: "Zor konuşma kaçınarak değil yapıyla yönetilir. SBI formülü: Situation-Behavior-Impact — gerçekler, duygu değil.",
      ar: "المحادثة الصعبة تُدار لا بالتجنّب بل بالهيكل. صيغة SBI: الموقف-السلوك-الأثر — حقائق لا عواطف.",
    },
    body: {
      az: "SBI: Situation (vəziyyət), Behavior (davranış), Impact (təsir). Nümunə: 'Dünənki görüşdə (S) səs tonun kəskin idi (B), komanda gərginləşdi (I).'",
      en: "SBI: Situation, Behavior, Impact. Example: 'In yesterday's meeting (S) your tone was sharp (B), the team became tense (I).'",
      ru: "SBI: Situation (ситуация), Behavior (поведение), Impact (влияние). Пример: 'На вчерашней встрече (S) твой тон был резким (B), команда напряглась (I).'",
      tr: "SBI: Situation (durum), Behavior (davranış), Impact (etki). Örnek: 'Dünkü toplantıda (S) ton keskin geldi (B), takım gerildi (I).'",
      ar: "SBI: الموقف، السلوك، الأثر. مثال: 'في اجتماع الأمس (S) كانت نبرتك حادة (B)، توتر الفريق (I).'",
    },
    tags: {
      az: ["Liderlik", "Feedback", "Komanda"],
      en: ["Leadership", "Feedback", "Team"],
      ru: ["Лидерство", "Обратная связь", "Команда"],
      tr: ["Liderlik", "Geri bildirim", "Takım"],
      ar: ["قيادة", "تغذية راجعة", "فريق"],
    },
    author: "Nesreen",
    publishedAt: "2026-08-15",
    readingMinutes: 3,
  },
  // SOL TƏRƏF: Sahibkarlıq (trending: false)
  {
    id: "seed-biznes-sahibkarliq-mvp",
    slug: "mvp-minimum-viable-product",
    category: "biznes",
    subcategory: "sahibkarliq",
    status: "published",
    featured: false,
    trending: false,
    coverImage: "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=1200&q=80",
    coverCredit: "Photo by Carlos Muza on Unsplash",
    coverAlt: {
      az: "MVP",
      en: "MVP",
      ru: "MVP",
      tr: "MVP",
      ar: "منتج أدنى قابل للحياة",
    },
    title: {
      az: "MVP: məhsulu idealdır hazırlamaqdan əvvəl bazara çıxar",
      en: "MVP: Release to Market Before Perfecting the Product",
      ru: "MVP: выпускай на рынок до того, как продукт станет идеальным",
      tr: "MVP: ürünü ideal yapmadan önce pazara çıkar",
      ar: "MVP: أطلِق إلى السوق قبل أن يصير المنتج مثاليًّا",
    },
    excerpt: {
      az: "MVP — Minimum Viable Product, yəni minimum işlək məhsuldur. Bütün funksiyaları gözləmə, əsas problemi həll edəni burax.",
      en: "MVP is Minimum Viable Product. Don't wait for all features, release what solves the core problem.",
      ru: "MVP — Minimum Viable Product, то есть минимальный жизнеспособный продукт. Не жди всех функций, выпускай то, что решает основную проблему.",
      tr: "MVP — Minimum Viable Product yani minimum çalışır üründür. Tüm özellikleri bekleme, ana sorunu çözeni bırak.",
      ar: "MVP منتج أدنى قابل للحياة. لا تنتظر كل الميزات، أطلِق ما يحلّ المشكلة الأساسية.",
    },
    body: {
      az: "MVP məntiqidir: məhsul yarıdır burax, feedback topla, düzəlt, yenidən burax. Təkamül startapın inkişaf modelidir.",
      en: "MVP logic: release product half-done, collect feedback, fix, release again. Evolution is startup's development model.",
      ru: "Логика MVP: выпускай продукт наполовину, собирай фидбэк, исправляй, выпускай снова. Эволюция — модель развития стартапа.",
      tr: "MVP mantığı: ürünü yarım bırak, geri bildirim topla, düzelt, yeniden bırak. Evrim startup'ın gelişim modelidir.",
      ar: "منطق MVP: أطلِق المنتج نصف جاهز، اجمع التعليقات، صحّح، أطلِق مجددًا. التطوّر نموذج تطور الشركة الناشئة.",
    },
    tags: {
      az: ["MVP", "Startap", "Məhsul"],
      en: ["MVP", "Startup", "Product"],
      ru: ["MVP", "Стартап", "Продукт"],
      tr: ["MVP", "Startup", "Ürün"],
      ar: ["MVP", "شركة ناشئة", "منتج"],
    },
    author: "Nesreen",
    publishedAt: "2026-08-08",
    readingMinutes: 3,
  },
  // SAĞ TƏRƏF: Karyera (trending: true)
  {
    id: "seed-biznes-karyera-cv",
    slug: "cv-bir-sehife-qaidasi",
    category: "biznes",
    subcategory: "karyera",
    status: "published",
    featured: false,
    trending: true,
    coverImage: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80",
    coverCredit: "Photo by Marten Bjork on Unsplash",
    coverAlt: {
      az: "CV yazma",
      en: "CV writing",
      ru: "Написание резюме",
      tr: "CV yazma",
      ar: "كتابة سيرة ذاتية",
    },
    title: {
      az: "CV bir səhifəyə necə sığdırılır və nə üçün bu vacibdir",
      en: "How to Fit CV Into One Page and Why This Matters",
      ru: "Как уместить резюме на одной странице и почему это важно",
      tr: "CV bir sayfaya nasıl sığdırılır ve bu neden önemlidir",
      ar: "كيف تُدخل السيرة في صفحة واحدة ولماذا هذا مهم",
    },
    excerpt: {
      az: "Recruiter CV-yə orta hesabla 6-7 saniyə baxır. İki səhifəlik CV ikinci səhifəyə çatmır, bir səhifəlik oxunur.",
      en: "Recruiter looks at CV for an average of six to seven seconds. Two-page CV does not reach second page, one-page gets read.",
      ru: "Рекрутер смотрит на резюме в среднем 6–7 секунд. Двухстраничное резюме не доходит до второй страницы, одностраничное прочитывается.",
      tr: "İşe alımcı CV'ye ortalama 6-7 saniye bakar. İki sayfalık CV ikinci sayfaya ulaşmaz, tek sayfalık okunur.",
      ar: "المُوظِّف ينظر إلى السيرة لمدة 6-7 ثوانٍ وسطيًّا. السيرة من صفحتين لا تصل إلى الثانية، من صفحة واحدة تُقرأ.",
    },
    body: {
      az: "Bir səhifəlik CV — prioritetləşdirmə qabiliyyətidir. Rol üçün vacib olanı saxla, qalanını sil. Hər bir söz öz çəkisini daşımalıdır.",
      en: "One-page CV is ability to prioritize. Keep what is important for the role, delete the rest. Every word must carry its weight.",
      ru: "Одностраничное резюме — способность расставлять приоритеты. Оставь важное для роли, удали остальное. Каждое слово должно нести свой вес.",
      tr: "Tek sayfalık CV önceliklendirme yeteneğidir. Rol için önemliyiçin önemliyiçin önemliyi sakla, kalanını sil. Her kelime kendi ağırlığını taşımalıdır.",
      ar: "السيرة من صفحة واحدة قدرة على ترتيب الأولويات. احتفِظ بالمهم للدور، احذف الباقي. كل كلمة يجب أن تحمل وزنها.",
    },
    tags: {
      az: ["CV", "Karyera", "İş axtarışı"],
      en: ["CV", "Career", "Job search"],
      ru: ["Резюме", "Карьера", "Поиск работы"],
      tr: ["CV", "Kariyer", "İş arama"],
      ar: ["سيرة ذاتية", "مسيرة مهنية", "بحث عمل"],
    },
    author: "Nesreen",
    publishedAt: "2026-08-01",
    readingMinutes: 2,
  },
  // SAĞ TƏRƏF: Maliyyə (trending: true)
  {
    id: "seed-biznes-maliyye-emergency-fund",
    slug: "fövqəladə-fond-6-ay",
    category: "biznes",
    subcategory: "maliyye",
    status: "published",
    featured: false,
    trending: true,
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80",
    coverCredit: "Photo by Austin Distel on Unsplash",
    coverAlt: {
      az: "Fövqəladə fond",
      en: "Emergency fund",
      ru: "Фонд на черный день",
      tr: "Acil durum fonu",
      ar: "صندوق الطوارئ",
    },
    title: {
      az: "Fövqəladə fond: 6 aylıq xərc ehtiyatı necə toplanır",
      en: "Emergency Fund: How to Build Six Months' Worth of Expense Reserve",
      ru: "Фонд на чёрный день: как накопить запас расходов на шесть месяцев",
      tr: "Acil durum fonu: 6 aylık harcama rezervi nasıl toplanır",
      ar: "صندوق الطوارئ: كيف تجمع احتياطي نفقات ستة أشهر",
    },
    excerpt: {
      az: "Fövqəladə fond — maliyyə təhlükəsizliyinin təməlidir. 6 aylıq yaşayış xərci: icarə, kommunal, yemək, nəqliyyat.",
      en: "Emergency fund is the foundation of financial security. Six months' living expenses: rent, utilities, food, transport.",
      ru: "Фонд на чёрный день — основа финансовой безопасности. Шесть месяцев расходов на жизнь: аренда, коммуналка, еда, транспорт.",
      tr: "Acil durum fonu finansal güvenliğin temelidir. 6 aylık yaşam gideri: kira, faturalar, yemek, ulaşım.",
      ar: "صندوق الطوارئ أساس الأمن المالي. ستة أشهر نفقات حياة: إيجار، فواتير، طعام، نقل.",
    },
    body: {
      az: "Fövqəladə fondu investisiya hesabında yox, bank depozitində saxla. Likvidlik məqsəddir: kredit kartından daha sürətli, səhmdən daha etibarlı.",
      en: "Keep emergency fund in bank deposit, not investment account. Liquidity is the goal: faster than credit card, more reliable than stock.",
      ru: "Фонд на чёрный день храни на банковском депозите, а не на инвестиционном счёте. Ликвидность — цель: быстрее кредитной карты, надёжнее акций.",
      tr: "Acil durum fonunu yatırım hesabında değil banka depozitosunda sakla. Likidite hedeftir: kredi kartından hızlı, hisseden güvenilir.",
      ar: "احفظ صندوق الطوارئ في وديعة بنكية لا حساب استثمار. السيولة الهدف: أسرع من بطاقة الائتمان، أوثق من السهم.",
    },
    tags: {
      az: ["Fövqəladə fond", "Maliyyə", "Təhlükəsizlik"],
      en: ["Emergency fund", "Finance", "Security"],
      ru: ["Фонд на чёрный день", "Финансы", "Безопасность"],
      tr: ["Acil durum fonu", "Finans", "Güvenlik"],
      ar: ["صندوق طوارئ", "مال", "أمان"],
    },
    author: "Nesreen",
    publishedAt: "2026-07-25",
    readingMinutes: 2,
  },
  // SAĞ TƏRƏF: Liderlik (trending: true)
  {
    id: "seed-biznes-liderlik-delegation",
    slug: "delegation-komandaya-nece-ishdir",
    category: "biznes",
    subcategory: "liderlik",
    status: "published",
    featured: false,
    trending: true,
    coverImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80",
    coverCredit: "Photo by Smartworks Coworking on Unsplash",
    coverAlt: {
      az: "Delegation",
      en: "Delegation",
      ru: "Делегирование",
      tr: "Yetkilendirme",
      ar: "تفويض",
    },
    title: {
      az: "Delegation: komandaya iş necə həvalə edilir ki, nəzarət itməsin",
      en: "Delegation: How to Assign Work to Team Without Losing Control",
      ru: "Делегирование: как поручить работу команде, не теряя контроля",
      tr: "Yetkilendirme: takıma iş nasıl verilir ki kontrol kaybolmasın",
      ar: "التفويض: كيف تُسند العمل إلى الفريق دون فقدان السيطرة",
    },
    excerpt: {
      az: "Delegation boşalmaq yox, strukturdur. Tapşırıqla yanaşı kontekst ver, nəticə gözləntisini və son tarix müəyyənləşdir.",
      en: "Delegation is not dumping but structure. Along with task give context, define result expectation and deadline.",
      ru: "Делегирование — не сброс, а структура. Вместе с задачей дай контекст, определи ожидание результата и дедлайн.",
      tr: "Yetkilendirme boşaltma değil yapıdır. Görevle birlikte bağlam ver, sonuç beklentisini ve son tarihi belirle.",
      ar: "التفويض ليس تخلّصًا بل هيكل. مع المهمة أعطِ السياق، حدّد توقّع النتيجة والموعد النهائي.",
    },
    body: {
      az: "Delegation düsturu: Task (tapşırıq), Context (kontekst), Authority (səlahiyyət), Deadline (son tarix), Check-in (yoxlama). Bu beş element delegasiyanı mikromenecmentdən ayırır.",
      en: "Delegation formula: Task, Context, Authority, Deadline, Check-in. These five elements separate delegation from micromanagement.",
      ru: "Формула делегирования: Task (задача), Context (контекст), Authority (полномочие), Deadline (дедлайн), Check-in (проверка). Эти пять элементов отделяют делегирование от микроменеджмента.",
      tr: "Yetkilendirme formülü: Task (görev), Context (bağlam), Authority (yetki), Deadline (son tarih), Check-in (kontrol). Bu beş unsur yetkilendirmeyi mikro yönetimden ayırır.",
      ar: "صيغة التفويض: المهمة، السياق، السلطة، الموعد النهائي، المتابعة. هذه العناصر الخمسة تفصل التفويض عن الإدارة الدقيقة.",
    },
    tags: {
      az: ["Delegation", "Liderlik", "Komanda"],
      en: ["Delegation", "Leadership", "Team"],
      ru: ["Делегирование", "Лидерство", "Команда"],
      tr: ["Yetkilendirme", "Liderlik", "Takım"],
      ar: ["تفويض", "قيادة", "فريق"],
    },
    author: "Nesreen",
    publishedAt: "2026-07-18",
    readingMinutes: 2,
  },
  // SAĞ TƏRƏF: Sahibkarlıq (trending: true)
  {
    id: "seed-biznes-sahibkarliq-pitch",
    slug: "pitch-60-saniye-investor",
    category: "biznes",
    subcategory: "sahibkarliq",
    status: "published",
    featured: false,
    trending: true,
    coverImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=80",
    coverCredit: "Photo by Marten Bjork on Unsplash",
    coverAlt: {
      az: "Pitch",
      en: "Pitch",
      ru: "Питч",
      tr: "Pitch",
      ar: "عرض",
    },
    title: {
      az: "Pitch: 60 saniyədə investora ideyanı necə çatdırırsan",
      en: "Pitch: How to Deliver Idea to Investor in Sixty Seconds",
      ru: "Питч: как донести идею до инвестора за 60 секунд",
      tr: "Pitch: 60 saniyede yatırımcıya fikri nasıl iletirsin",
      ar: "العرض: كيف توصل الفكرة إلى المستثمر في ستين ثانية",
    },
    excerpt: {
      az: "Elevator pitch — 60 saniyəlik təqdimatdır. Üç cümlə: problem, həll, fərq. Investor qərar 1 dəqiqədə verir, sən də 1 dəqiqədə danış.",
      en: "Elevator pitch is sixty-second presentation. Three sentences: problem, solution, difference. Investor decides in one minute, you speak in one minute too.",
      ru: "Elevator pitch — презентация на 60 секунд. Три предложения: проблема, решение, отличие. Инвестор решает за минуту, ты тоже говори минуту.",
      tr: "Elevator pitch 60 saniyelik sunumdur. Üç cümle: sorun, çözüm, fark. Yatırımcı 1 dakikada karar verir, sen de 1 dakikada konuş.",
      ar: "العرض السريع تقديم ستين ثانية. ثلاث جمل: المشكلة، الحل، الفرق. المستثمر يقرّر في دقيقة، وأنت تحدّث في دقيقة أيضًا.",
    },
    body: {
      az: "Pitch strukturu: 'Biz [problem] həll edirik [həll yolu] ilə. Fərqimiz: [unikal dəyər]. Bazarımız: [ölçü və potensial].' Artıq söz yoxdur.",
      en: "Pitch structure: 'We solve [problem] with [solution]. Our difference: [unique value]. Our market: [size and potential].' No extra words.",
      ru: "Структура питча: «Мы решаем [проблему] с помощью [решения]. Наше отличие: [уникальная ценность]. Наш рынок: [размер и потенциал].» Лишних слов нет.",
      tr: "Pitch yapısı: 'Biz [sorunu] [çözüm yoluyla] çözüyoruz. Farkımız: [benzersiz değer]. Pazarımız: [boyut ve potansiyel].' Fazla söz yok.",
      ar: "هيكل العرض: 'نحن نحلّ [المشكلة] بـ[الحل]. فرقنا: [القيمة الفريدة]. سوقنا: [الحجم والإمكانات].' لا كلام زائد.",
    },
    tags: {
      az: ["Pitch", "Investor", "Startap"],
      en: ["Pitch", "Investor", "Startup"],
      ru: ["Питч", "Инвестор", "Стартап"],
      tr: ["Pitch", "Yatırımcı", "Startup"],
      ar: ["عرض", "مستثمر", "شركة ناشئة"],
    },
    author: "Nesreen",
    publishedAt: "2026-07-10",
    readingMinutes: 2,
  },
  // SAĞ TƏRƏF: İlham verən qadınlar (trending: true)
  {
    id: "seed-biznes-ilham-qadin-tech",
    slug: "texnologiya-sektorunda-qadin-liderlər",
    category: "biznes",
    subcategory: "ilham-veren-qadinlar",
    status: "published",
    featured: false,
    trending: true,
    coverImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=80",
    coverCredit: "Photo by Christina @ wocintechchat.com on Unsplash",
    coverAlt: {
      az: "Qadın tech liderlər",
      en: "Women tech leaders",
      ru: "Женщины-лидеры в технологиях",
      tr: "Kadın teknoloji liderler",
      ar: "قائدات نساء في التقنية",
    },
    title: {
      az: "Texnologiya sektorunda qadın liderlər: kodu yazan, şirkəti quran, sənayeni dəyişən",
      en: "Women Leaders in Technology: Writing Code, Building Companies, Changing Industry",
      ru: "Женщины-лидеры в технологиях: пишут код, строят компании, меняют индустрию",
      tr: "Teknoloji sektöründe kadın liderler: kod yazan, şirket kuran, sektörü değiştiren",
      ar: "قائدات نساء في التقنية: يكتبن الكود، يبنين الشركات، يغيّرن الصناعة",
    },
    excerpt: {
      az: "Tech sənayesində qadınların payı 28%-dir, amma liderlik edən qadınlar sektoru yenidən təyin edir: Sheryl Sandberg, Susan Wojcicki, Ginni Rometty.",
      en: "Women's share in tech industry is 28%, but women leaders redefine the sector: Sheryl Sandberg, Susan Wojcicki, Ginni Rometty.",
      ru: "Доля женщин в tech-индустрии 28%, но женщины-лидеры переопределяют сектор: Шерил Сэндберг, Сьюзан Войжитски, Джинни Рометти.",
      tr: "Teknoloji sektöründe kadınların payı %28'dir, ama lider kadınlar sektörü yeniden tanımlıyor: Sheryl Sandberg, Susan Wojcicki, Ginni Rometty.",
      ar: "نصيب النساء في صناعة التقنية 28%، لكن القائدات يُعدن تعريف القطاع: شيريل ساندبرغ، سوزان فوجيتسكي، جيني روميتي.",
    },
    body: {
      az: "Qadın tech liderləri yalnız kod yazmır — korporativ mədəniyyəti dəyişir, diversifikasiya siyasətini qurur, gənc mühəndislərə rol model olur. Tech dünyası onlarsız təsəvvür edilə bilməz.",
      en: "Women tech leaders don't just write code — they change corporate culture, build diversity policy, become role models for young engineers. Tech world cannot be imagined without them.",
      ru: "Женщины-лидеры в технологиях не просто пишут код — они меняют корпоративную культуру, строят политику диверсификации, становятся ролевыми моделями для молодых инженеров. Мир технологий невозможен без них.",
      tr: "Kadın teknoloji liderleri sadece kod yazmıyor — kurumsal kültürü değiştiriyor, çeşitlilik politikası kuruyor, genç mühendislere rol model oluyor. Teknoloji dünyası onlarsız düşünülemez.",
      ar: "القائدات في التقنية لا يكتبن الكود فقط — يغيّرن الثقافة المؤسسية، يبنين سياسة التنوع، يصرن قدوات للمهندسات الشابات. عالم التقنية لا يُتصوّر بدونهن.",
    },
    tags: {
      az: ["Texnologiya", "Qadın liderlər", "İlham"],
      en: ["Technology", "Women leaders", "Inspiration"],
      ru: ["Технологии", "Женщины-лидеры", "Вдохновение"],
      tr: ["Teknoloji", "Kadın liderler", "İlham"],
      ar: ["تقنية", "قائدات نساء", "إلهام"],
    },
    author: "Nesreen",
    publishedAt: "2026-07-05",
    readingMinutes: 2,
  },
];
