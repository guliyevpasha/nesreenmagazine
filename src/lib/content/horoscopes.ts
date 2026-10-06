import type { Locale } from "@/lib/i18n/config";
import type { LocalizedText } from "@/lib/types";
import type { ZodiacKey } from "@/lib/zodiac";

export const horoscopePeriods = ["daily", "weekly", "monthly"] as const;
export type HoroscopePeriod = (typeof horoscopePeriods)[number];

export type HoroscopeSet = Record<HoroscopePeriod, LocalizedText>;

/**
 * Bürc şərhləri — 12 bürc × 3 dövr × 5 dil.
 *
 * Bu mətnlər başlanğıc məzmundur. Admin paneldəki «Astrologiya» bölməsindən
 * hər gün / hər həftə yenilənə bilər; Firestore-da `horoscopes` kolleksiyasında
 * saxlanır və orada dəyər varsa, aşağıdakıların yerinə o göstərilir.
 */
export const horoscopes: Partial<Record<ZodiacKey, HoroscopeSet>> = {
  aries: {
    daily: {
      az: "Bu gün sürət sizin dostunuz deyil. Səhər verilən qərarı axşama qədər saxlayın — bir neçə saat fikri tamam dəyişə bilər. Söhbətdə ilk cümləni siz deməyin.",
      en: "Speed is not your ally today. Hold a morning decision until evening — a few hours can change it entirely. In conversation, let someone else speak first.",
      ru: "Сегодня скорость вам не союзник. Утреннее решение отложите до вечера — за несколько часов оно может измениться целиком. В разговоре не начинайте первой.",
      tr: "Bugün hız sizin dostunuz değil. Sabah verdiğiniz kararı akşama saklayın — birkaç saat fikri tümüyle değiştirebilir. Konuşmada ilk cümleyi siz kurmayın.",
      ar: "السرعة ليست حليفتك اليوم. أرجئي قرار الصباح إلى المساء — فبضع ساعات قد تغيّره تمامًا. وفي الحديث، دعي غيرك يبدأ.",
    },
    weekly: {
      az: "Həftənin ortasında yarımçıq qalmış bir işə qayıtmalı olacaqsınız. Bu, geriyə addım deyil — həmin işi indi bitirsəniz, növbəti ay üçün yer açılır.",
      en: "Mid-week you will have to return to something left unfinished. It is not a step back: finishing it now clears space for the month ahead.",
      ru: "В середине недели придётся вернуться к незавершённому. Это не шаг назад: закончив сейчас, вы освобождаете место для следующего месяца.",
      tr: "Haftanın ortasında yarım kalmış bir işe dönmeniz gerekecek. Bu geri adım değil: şimdi bitirirseniz gelecek aya yer açılır.",
      ar: "في منتصف الأسبوع ستعودين إلى أمر تُرك ناقصًا. وليس ذلك تراجعًا: إنهاؤه الآن يفتح مساحة للشهر المقبل.",
    },
    monthly: {
      az: "Sentyabr sizi yavaşlamağa məcbur edir və bu, xeyrinizədir. Yeni layihə başlamaqdansa mövcud olanı nizama salın; ayın son həftəsi danışıqlar üçün açılır.",
      en: "September forces you to slow down, and that works in your favour. Instead of starting something new, put what exists in order; the last week opens for negotiation.",
      ru: "Сентябрь заставляет вас притормозить, и это вам на пользу. Вместо нового проекта наведите порядок в имеющемся; последняя неделя открывается для переговоров.",
      tr: "Eylül sizi yavaşlatıyor ve bu lehinize. Yeni bir proje başlatmak yerine mevcut olanı düzene sokun; ayın son haftası müzakereye açılıyor.",
      ar: "يجبرك سبتمبر على التمهّل، وهذا في مصلحتك. بدل بدء مشروع جديد، رتّبي القائم؛ والأسبوع الأخير ينفتح للتفاوض.",
    },
  },

  taurus: {
    daily: {
      az: "Bu gün rahatlıq axtarışı sizi düzgün yerə aparır. Bədəninizin siqnalına qulaq asın: yorğunluq tənbəllik deyil. Maliyyə ilə bağlı kiçik bir düzəliş üçün münasib gündür.",
      en: "Today the search for comfort leads you somewhere right. Listen to your body's signal: tiredness is not laziness. A good day for one small financial correction.",
      ru: "Сегодня поиск комфорта ведёт вас в верную сторону. Прислушайтесь к телу: усталость — не лень. Хороший день для одной небольшой финансовой правки.",
      tr: "Bugün rahatlık arayışı sizi doğru yere götürüyor. Bedeninizin sinyalini dinleyin: yorgunluk tembellik değildir. Küçük bir mali düzeltme için uygun gün.",
      ar: "اليوم يقودك بحثك عن الراحة إلى مكان صحيح. أصغي لإشارة جسدك: التعب ليس كسلًا. ويوم مناسب لتصحيح مالي صغير.",
    },
    weekly: {
      az: "Bu həftə uzun müddət təxirə salınan bir söhbət qapını döyür. Hazırlaşın: rəqəmləri və faktları qabaqcadan yazın, emosiya ilə deyil, siyahı ilə gedin.",
      en: "This week a long-postponed conversation knocks at the door. Prepare: write down the figures and facts in advance and go in with a list, not with emotion.",
      ru: "На этой неделе давно отложенный разговор стучится в дверь. Подготовьтесь: заранее выпишите цифры и факты и идите со списком, а не с эмоцией.",
      tr: "Bu hafta uzun süredir ertelenen bir konuşma kapıyı çalıyor. Hazırlanın: rakamları ve olguları önceden yazın, duyguyla değil listeyle gidin.",
      ar: "هذا الأسبوع يطرق بابك حديث مؤجّل منذ زمن. استعدّي: دوّني الأرقام والوقائع مسبقًا، وادخلي بقائمة لا بانفعال.",
    },
    monthly: {
      az: "Ay sizindir: torpaq enerjisi ən güclü vaxtdır. İllərdir təxirə salınan struktur qərarları — maliyyə, sağlamlıq, iş nizamı — məhz bu ay yerinə oturur.",
      en: "The month is yours: earth energy is at its strongest. Structural decisions postponed for years — money, health, the order of your work — settle now.",
      ru: "Месяц ваш: энергия земли на пике. Структурные решения, отложенные годами, — деньги, здоровье, порядок в работе — встают на место именно сейчас.",
      tr: "Ay sizin: toprak enerjisi en güçlü hâlinde. Yıllardır ertelenen yapısal kararlar — para, sağlık, iş düzeni — tam bu ay yerine oturuyor.",
      ar: "الشهر لك: طاقة التراب في ذروتها. القرارات البنيوية المؤجّلة سنوات — المال والصحة ونظام العمل — تستقرّ الآن.",
    },
  },

  gemini: {
    daily: {
      az: "Bugünkü söhbətlərdən biri gözlədiyinizdən çox şey açacaq. Az danışıb çox dinləyin. Axşama doğru yazılı bir işi bitirmək üçün diqqətiniz kifayət edir.",
      en: "One of today's conversations will reveal more than you expected. Say less, listen more. Towards evening your focus is enough to finish a piece of writing.",
      ru: "Один из сегодняшних разговоров откроет больше, чем вы ждали. Говорите меньше, слушайте больше. К вечеру внимания хватит, чтобы закончить письменную работу.",
      tr: "Bugünkü konuşmalardan biri beklediğinizden fazlasını açacak. Az konuşup çok dinleyin. Akşama doğru yazılı bir işi bitirmeye odağınız yeter.",
      ar: "سيكشف أحد أحاديث اليوم أكثر مما تتوقّعين. تكلّمي أقلّ وأصغي أكثر. ومع المساء يكفي تركيزك لإنهاء عمل كتابي.",
    },
    weekly: {
      az: "Həftənin ikinci yarısı sizin üçün açılır. Görüş, təqdimat, yeni tanışlıq — hamısı 23-dən sonra daha yaxşı nəticə verir. İlk günlərdə hazırlıq aparın.",
      en: "The second half of the week opens for you. Meetings, presentations, new acquaintances all give better results after the 23rd. Spend the first days preparing.",
      ru: "Вторая половина недели открывается для вас. Встречи, презентации, новые знакомства — всё даёт лучший результат после 23-го. Первые дни отведите на подготовку.",
      tr: "Haftanın ikinci yarısı size açılıyor. Buluşma, sunum, yeni tanışıklık — hepsi 23'ünden sonra daha iyi sonuç veriyor. İlk günleri hazırlığa ayırın.",
      ar: "ينفتح لك النصف الثاني من الأسبوع. اللقاءات والعروض والتعارف الجديد كلّها تعطي نتيجة أفضل بعد الثالث والعشرين. اجعلي الأيام الأولى للتحضير.",
    },
    monthly: {
      az: "Sentyabr sizdən bir mövzu seçməyi istəyir. Eyni anda beş istiqamətdə getmək bu ay işləmir; birini seçin, digərlərini oktyabra saxlayın.",
      en: "September asks you to choose one subject. Going in five directions at once will not work this month; pick one and leave the rest to October.",
      ru: "Сентябрь просит выбрать одну тему. Двигаться сразу в пяти направлениях в этом месяце не выйдет; выберите одно, остальное оставьте на октябрь.",
      tr: "Eylül sizden tek bir konu seçmenizi istiyor. Aynı anda beş yöne gitmek bu ay işlemiyor; birini seçin, gerisini ekime bırakın.",
      ar: "يطلب منك سبتمبر اختيار موضوع واحد. السير في خمسة اتجاهات معًا لا ينفع هذا الشهر؛ اختاري واحدًا وأجّلي الباقي إلى أكتوبر.",
    },
  },

  cancer: {
    daily: {
      az: "Bu gün ev və yaxın münasibətlər ön plandadır. Kiməsə «yox» demək lazım gələcək və bu, sərtlik olmayacaq. Axşamı erkən bağlayın.",
      en: "Home and close relationships come first today. You will have to say no to someone, and it will not be harshness. Close the evening early.",
      ru: "Сегодня на первом плане дом и близкие отношения. Кому-то придётся сказать «нет», и это не будет жёсткостью. Заканчивайте вечер пораньше.",
      tr: "Bugün ev ve yakın ilişkiler ön planda. Birine «hayır» demeniz gerekecek ve bu sertlik olmayacak. Akşamı erken kapatın.",
      ar: "اليوم يتقدّم البيت والعلاقات القريبة. سيلزمك أن تقولي «لا» لأحدهم، ولن يكون ذلك قسوة. أغلقي المساء باكرًا.",
    },
    weekly: {
      az: "Həftə boyunca köhnə bir söhbət yenidən qayıdır. Bu dəfə cavab verməzdən əvvəl bir gün gözləyin — tələsik yazılan mesaj ən çox məhz bu həftə peşmançılıq gətirir.",
      en: "An old conversation returns during the week. This time wait a day before replying — a hastily written message brings the most regret precisely this week.",
      ru: "На неделе возвращается старый разговор. В этот раз подождите день перед ответом: наспех написанное сообщение принесёт сожаление именно на этой неделе.",
      tr: "Hafta boyunca eski bir konuşma geri dönüyor. Bu kez cevaptan önce bir gün bekleyin — aceleyle yazılan mesaj en çok tam bu hafta pişmanlık getirir.",
      ar: "خلال الأسبوع يعود حديث قديم. هذه المرة انتظري يومًا قبل الردّ — فالرسالة المكتوبة على عجل تجلب الندم في هذا الأسبوع تحديدًا.",
    },
    monthly: {
      az: "Sentyabr daxili təmizlik ayıdır. Emosional yükü siyahıya alın və bir hissəsini buraxın. Ayın sonu yaxın münasibətdə açıq danışıq üçün daha yumşaqdır.",
      en: "September is a month of inner clearing. List the emotional weight and put part of it down. The end of the month is gentler for an honest talk with someone close.",
      ru: "Сентябрь — месяц внутренней уборки. Составьте список эмоционального груза и часть отпустите. Конец месяца мягче для откровенного разговора с близким.",
      tr: "Eylül bir iç temizlik ayı. Duygusal yükü listeleyin ve bir kısmını bırakın. Ayın sonu yakın biriyle dürüst bir konuşma için daha yumuşak.",
      ar: "سبتمبر شهر تنظيف داخلي. دوّني الحمل العاطفي وأنزلي جزءًا منه. ونهاية الشهر أرقّ لحديث صادق مع شخص قريب.",
    },
  },

  leo: {
    daily: {
      az: "Bu gün diqqət mərkəzində olmaq asandır — çətini oradan düzgün istifadə etməkdir. Bir nəfərin işini açıq şəkildə qeyd edin; bu jest sizə gözlədiyinizdən çox qaytaracaq.",
      en: "Being at the centre of attention is easy today; using that position well is the harder part. Praise someone's work openly — the gesture will return more than you expect.",
      ru: "Сегодня легко оказаться в центре внимания; труднее правильно этим воспользоваться. Открыто отметьте чью-то работу — этот жест вернётся большим, чем вы ждёте.",
      tr: "Bugün ilgi odağı olmak kolay; zor olan bunu doğru kullanmak. Birinin emeğini açıkça takdir edin — bu jest beklediğinizden fazlasını geri getirecek.",
      ar: "من السهل اليوم أن تكوني في مركز الانتباه؛ والأصعب أن تُحسني استخدام ذلك. أثني علنًا على عمل أحدهم — فهذه اللفتة ستعود عليك بأكثر مما تتوقّعين.",
    },
    weekly: {
      az: "Bu həftə bir təklif gəlir, amma şərtləri tam aydın olmayacaq. Sual verməkdən çəkinməyin: aydınlaşdırmaq istəyi zəiflik yox, peşəkarlıq göstəricisidir.",
      en: "An offer arrives this week, but its terms will not be entirely clear. Do not hesitate to ask: wanting clarity is not weakness but professionalism.",
      ru: "На этой неделе поступит предложение, но его условия будут не вполне ясны. Не стесняйтесь спрашивать: желание уточнить — не слабость, а профессионализм.",
      tr: "Bu hafta bir teklif geliyor ama koşulları tam net olmayacak. Soru sormaktan çekinmeyin: netlik istemek zayıflık değil, profesyonelliktir.",
      ar: "يصلك هذا الأسبوع عرض، لكن شروطه لن تكون واضحة تمامًا. لا تتردّدي في السؤال: طلب الوضوح ليس ضعفًا بل احترافًا.",
    },
    monthly: {
      az: "Sentyabr sizi səhnədən bir addım geri çəkir ki, quruluşu görəsiniz. Bu ay görünmək yox, qurmaq vaxtıdır; nəticə oktyabrda özünü göstərəcək.",
      en: "September pulls you a step back from the stage so you can see the structure. This is a month for building rather than being seen; the result shows in October.",
      ru: "Сентябрь отводит вас на шаг от сцены, чтобы вы увидели конструкцию. Этот месяц — для строительства, а не для внимания; результат проявится в октябре.",
      tr: "Eylül sizi sahneden bir adım geri çekiyor ki yapıyı görebilesiniz. Bu ay görünmenin değil kurmanın zamanı; sonuç ekimde belli olacak.",
      ar: "يسحبك سبتمبر خطوة إلى الوراء عن المسرح لتري البنية. هذا شهر بناء لا شهر ظهور؛ والنتيجة تظهر في أكتوبر.",
    },
  },

  virgo: {
    daily: {
      az: "Bu gün detala diqqətiniz kimisə xilas edəcək. Amma özünüzə eyni sərtliyi tətbiq etməyin: bugünkü ölçü «mükəmməl» yox, «kifayət qədər yaxşı»dır.",
      en: "Your eye for detail will save someone today. But do not apply the same severity to yourself: today's measure is «good enough», not «perfect».",
      ru: "Ваше внимание к деталям сегодня кого-то спасёт. Но не применяйте ту же строгость к себе: сегодняшняя мера — «достаточно хорошо», а не «идеально».",
      tr: "Bugün ayrıntıya dikkatiniz birini kurtaracak. Ama aynı sertliği kendinize uygulamayın: bugünün ölçüsü «kusursuz» değil, «yeterince iyi».",
      ar: "دقّتك في التفاصيل ستنقذ أحدهم اليوم. لكن لا تطبّقي القسوة نفسها على نفسك: مقياس اليوم «جيّد بما يكفي» لا «مثالي».",
    },
    weekly: {
      az: "Sənəd, hesabat və ya müqavilə ilə bağlı iş bu həftə yekunlaşır. Son oxunuşu səhər saatlarına salın — axşam gözünüz artıq yorğun olur.",
      en: "Work involving a document, a report or a contract concludes this week. Schedule the final read for the morning — by evening your eye is already tired.",
      ru: "Работа с документом, отчётом или договором завершается на этой неделе. Финальную вычитку назначьте на утро — к вечеру глаз уже устал.",
      tr: "Belge, rapor ya da sözleşmeyle ilgili iş bu hafta tamamlanıyor. Son okumayı sabaha alın — akşam gözünüz çoktan yorulmuş oluyor.",
      ar: "ينتهي هذا الأسبوع عمل يتعلّق بوثيقة أو تقرير أو عقد. اجعلي القراءة الأخيرة صباحًا — فعينك مساءً تكون قد تعبت.",
    },
    monthly: {
      az: "Ayın ilk yarısı tam sizin mövsümünüzdür: sistem qurmaq, nizama salmaq, artığı atmaq. 22-dən sonra tempi azaldın və qurduğunuzun içində yaşamağa başlayın.",
      en: "The first half of the month is entirely your season: building systems, restoring order, discarding excess. After the 22nd slow down and start living inside what you built.",
      ru: "Первая половина месяца — целиком ваш сезон: выстраивать системы, наводить порядок, отбрасывать лишнее. После 22-го сбавьте темп и начните жить внутри построенного.",
      tr: "Ayın ilk yarısı tümüyle sizin mevsiminiz: sistem kurmak, düzene sokmak, fazlayı atmak. 22'sinden sonra tempoyu düşürün ve kurduğunuzun içinde yaşamaya başlayın.",
      ar: "النصف الأول من الشهر موسمك بالكامل: بناء الأنظمة، وإعادة النظام، والتخلّص من الزائد. وبعد الثاني والعشرين خفّفي الإيقاع وابدئي العيش داخل ما بنيتِه.",
    },
  },

  libra: {
    daily: {
      az: "Bu gün qərar sizin əlinizdədir və hamını razı salmaq mümkün olmayacaq. Tarazlıq hər tərəfə eyni sözü demək deyil — bir tərəfi seçmək də tarazlıqdır.",
      en: "Today the decision is yours, and pleasing everyone will not be possible. Balance is not saying the same thing to all sides; choosing one side can also be balance.",
      ru: "Сегодня решение за вами, и угодить всем не получится. Равновесие — не говорить всем одно и то же; выбрать одну сторону тоже бывает равновесием.",
      tr: "Bugün karar sizde ve herkesi memnun etmek mümkün olmayacak. Denge, her tarafa aynı şeyi söylemek değildir; bir tarafı seçmek de dengedir.",
      ar: "اليوم القرار بيدك، وإرضاء الجميع لن يكون ممكنًا. التوازن ليس قول الشيء نفسه لكل الأطراف؛ اختيار طرف قد يكون توازنًا أيضًا.",
    },
    weekly: {
      az: "Mövsümünüz yaxınlaşır və həftənin sonuna doğru enerji artır. Görüş, təqdimat və barışıq üçün ən əlverişli günlər — 23-dən sonrakılardır.",
      en: "Your season approaches and energy rises towards the end of the week. The most favourable days for meetings, presentations and reconciliation come after the 23rd.",
      ru: "Ваш сезон приближается, и к концу недели энергия растёт. Самые благоприятные дни для встреч, презентаций и примирения — после 23-го.",
      tr: "Mevsiminiz yaklaşıyor ve hafta sonuna doğru enerji yükseliyor. Buluşma, sunum ve barışma için en elverişli günler 23'ünden sonrakiler.",
      ar: "يقترب موسمك وترتفع الطاقة مع نهاية الأسبوع. وأنسب الأيام للّقاءات والعروض والمصالحة تأتي بعد الثالث والعشرين.",
    },
    monthly: {
      az: "22 sentyabrdan sonra Günəş sizin bürcünüzə keçir və il üçün yeni dövr başlayır. Bu ay estetika, münasibətlər və birgə qərarlar sizin əsas mövzunuzdur.",
      en: "After 22 September the Sun enters your sign and a new cycle of the year begins. This month aesthetics, relationships and shared decisions are your main subject.",
      ru: "После 22 сентября Солнце входит в ваш знак, и начинается новый цикл года. В этом месяце эстетика, отношения и совместные решения — ваша главная тема.",
      tr: "22 Eylül'den sonra Güneş burcunuza geçiyor ve yılın yeni döngüsü başlıyor. Bu ay estetik, ilişkiler ve ortak kararlar ana konunuz.",
      ar: "بعد الثاني والعشرين من سبتمبر تدخل الشمس برجك وتبدأ دورة جديدة من السنة. وهذا الشهر تكون الجماليات والعلاقات والقرارات المشتركة موضوعك الأساسي.",
    },
  },

  scorpio: {
    daily: {
      az: "Bu gün susmaq danışmaqdan güclüdür. Kiminsə niyyətini oxumaq asan olacaq, amma bunu üzə vurmayın — məlumat elə sizdə qalanda dəyər daşıyır.",
      en: "Today silence is stronger than speech. Reading someone's intention will be easy, but do not say it aloud — information keeps its value while it stays with you.",
      ru: "Сегодня молчание сильнее речи. Прочитать чьё-то намерение будет легко, но не говорите об этом вслух: информация ценна, пока остаётся у вас.",
      tr: "Bugün susmak konuşmaktan güçlü. Birinin niyetini okumak kolay olacak ama bunu dile getirmeyin — bilgi sizde kaldığı sürece değerlidir.",
      ar: "اليوم الصمت أقوى من الكلام. ستقرئين نيّة أحدهم بسهولة، لكن لا تقوليها — فالمعلومة تحتفظ بقيمتها ما دامت عندك.",
    },
    weekly: {
      az: "Həftənin ortasında maliyyə və ya ortaq resurslarla bağlı bir məsələ aydınlaşır. Rəqəmləri yazılı istəyin: şifahi razılaşma bu həftə kifayət etməyəcək.",
      en: "Mid-week a matter of money or shared resources becomes clear. Ask for the figures in writing: a verbal agreement will not be enough this week.",
      ru: "В середине недели проясняется вопрос денег или общих ресурсов. Попросите цифры письменно: устной договорённости на этой неделе не хватит.",
      tr: "Haftanın ortasında para ya da ortak kaynaklarla ilgili bir konu netleşiyor. Rakamları yazılı isteyin: sözlü anlaşma bu hafta yetmeyecek.",
      ar: "في منتصف الأسبوع تتّضح مسألة تتعلّق بالمال أو الموارد المشتركة. اطلبي الأرقام مكتوبة: الاتفاق الشفوي لن يكفي هذا الأسبوع.",
    },
    monthly: {
      az: "Sentyabr sizdən bir şeyi buraxmağı istəyir — bir vərdiş, bir münasibət, bir gözlənti. Buraxılan yerdə ayın sonuna doğru gözlənilməz bir imkan açılır.",
      en: "September asks you to let one thing go — a habit, a relationship, an expectation. Where it is released, an unexpected opening appears towards the end of the month.",
      ru: "Сентябрь просит отпустить одно — привычку, отношения, ожидание. На освободившемся месте к концу месяца открывается неожиданная возможность.",
      tr: "Eylül sizden bir şeyi bırakmanızı istiyor — bir alışkanlık, bir ilişki, bir beklenti. Bırakılan yerde ay sonuna doğru beklenmedik bir imkân açılıyor.",
      ar: "يطلب منك سبتمبر أن تتركي شيئًا — عادة أو علاقة أو توقّعًا. وفي الموضع الذي تُخلينه ينفتح مع نهاية الشهر باب غير متوقّع.",
    },
  },

  sagittarius: {
    daily: {
      az: "Bu gün böyük plan qurmaq istəyi güclüdür, amma günün özü kiçik addımlar tələb edir. Bir siyahı yazın və yalnız üç maddəni bitirin — kifayətdir.",
      en: "The urge to make grand plans is strong today, but the day itself asks for small steps. Write a list and finish only three items — that is enough.",
      ru: "Сегодня велико желание строить большие планы, но сам день требует мелких шагов. Составьте список и закройте только три пункта — этого достаточно.",
      tr: "Bugün büyük plan yapma isteği güçlü ama günün kendisi küçük adımlar istiyor. Bir liste yazın ve yalnızca üç maddeyi bitirin — yeterli.",
      ar: "الرغبة في وضع خطط كبيرة قوية اليوم، لكن اليوم نفسه يطلب خطوات صغيرة. اكتبي قائمة وأنهي ثلاثة بنود فقط — وهذا يكفي.",
    },
    weekly: {
      az: "Uzaqdan gələn bir xəbər və ya təklif həftənin gedişini dəyişir. Cavab verməzdən əvvəl şərtləri iki dəfə oxuyun; həvəs bu həftə detalı örtür.",
      en: "News or an offer from far away changes the course of the week. Read the terms twice before answering; enthusiasm covers the detail this week.",
      ru: "Новость или предложение издалека меняет ход недели. Прежде чем отвечать, прочтите условия дважды: на этой неделе энтузиазм закрывает детали.",
      tr: "Uzaktan gelen bir haber ya da teklif haftanın gidişatını değiştiriyor. Cevap vermeden önce koşulları iki kez okuyun; bu hafta heves ayrıntıyı örtüyor.",
      ar: "خبر أو عرض من بعيد يغيّر مسار الأسبوع. اقرئي الشروط مرّتين قبل الردّ؛ فالحماس يحجب التفاصيل هذا الأسبوع.",
    },
    monthly: {
      az: "Sentyabr üfüqü genişləndirmək deyil, mövcud sahəni dərinləşdirmək ayıdır. Bildiyiniz bir mövzunu bu ay bir addım dərinə aparın — nəticə uzun müddət qalacaq.",
      en: "September is a month for deepening the ground you have rather than widening the horizon. Take one subject you know a step deeper — the result will last.",
      ru: "Сентябрь — месяц не расширять горизонт, а углублять имеющееся поле. Возьмите тему, которую знаете, и уйдите на шаг глубже: результат останется надолго.",
      tr: "Eylül ufku genişletme değil, mevcut alanı derinleştirme ayı. Bildiğiniz bir konuyu bu ay bir adım derine taşıyın — sonuç uzun süre kalacak.",
      ar: "سبتمبر شهر تعميق الأرض التي عندك لا توسيع الأفق. خذي موضوعًا تعرفينه خطوة أعمق — والنتيجة ستدوم.",
    },
  },

  capricorn: {
    daily: {
      az: "Bu gün məsuliyyət hissi sizi lazım olandan çox yükləyə bilər. Bir işi başqasına vermək zəiflik deyil; günün ən ağıllı qərarı elə bu olacaq.",
      en: "Today a sense of duty may load you with more than necessary. Handing a task to someone else is not weakness; it will be the day's wisest decision.",
      ru: "Сегодня чувство ответственности может нагрузить вас сверх необходимого. Передать задачу другому — не слабость; это и станет самым разумным решением дня.",
      tr: "Bugün sorumluluk duygusu size gereğinden fazlasını yükleyebilir. Bir işi başkasına vermek zayıflık değil; günün en akıllı kararı bu olacak.",
      ar: "قد يحمّلك الإحساس بالمسؤولية اليوم أكثر مما يلزم. تسليم مهمّة لغيرك ليس ضعفًا؛ بل سيكون أحكم قرارات اليوم.",
    },
    weekly: {
      az: "Bu həftə uzunmüddətli bir plan üçün ilk konkret addım atılır. Böyük olması vacib deyil — yazılı və tarixli olması vacibdir.",
      en: "This week the first concrete step of a long-term plan is taken. It does not need to be large; it needs to be written down and dated.",
      ru: "На этой неделе делается первый конкретный шаг долгосрочного плана. Он не обязан быть большим — он обязан быть записанным и с датой.",
      tr: "Bu hafta uzun vadeli bir planın ilk somut adımı atılıyor. Büyük olması gerekmiyor; yazılı ve tarihli olması gerekiyor.",
      ar: "هذا الأسبوع تُتّخذ أول خطوة ملموسة في خطة طويلة الأمد. لا يلزم أن تكون كبيرة؛ يلزم أن تكون مكتوبة ومؤرّخة.",
    },
    monthly: {
      az: "Ay peşəkar mövqeyinizi gücləndirir. Görünmək istəmirsiniz, amma bu dəfə lazımdır: bir yerdə öz işinizi ucadan təqdim edin, nəticə oktyabrda gəlir.",
      en: "The month strengthens your professional position. You would rather not be visible, but this time it is necessary: present your work aloud somewhere; the result arrives in October.",
      ru: "Месяц укрепляет вашу профессиональную позицию. Вам не хочется быть на виду, но в этот раз нужно: представьте свою работу вслух — результат придёт в октябре.",
      tr: "Ay mesleki konumunuzu güçlendiriyor. Görünmek istemiyorsunuz ama bu kez gerekli: bir yerde işinizi sesli sunun; sonuç ekimde geliyor.",
      ar: "يقوّي الشهر موقعك المهني. لا تريدين الظهور، لكنه ضروري هذه المرة: قدّمي عملك بصوت مسموع في مكان ما؛ والنتيجة تأتي في أكتوبر.",
    },
  },

  aquarius: {
    daily: {
      az: "Bu gün fikirlərinizdən biri başqalarına qəribə gələcək — və məhz o, doğru olacaq. İzah etməyə çalışmayın, sadəcə göstərin.",
      en: "One of your ideas will strike others as strange today — and it is precisely the right one. Do not try to explain it; simply show it.",
      ru: "Сегодня одна из ваших идей покажется другим странной — и именно она окажется верной. Не пытайтесь объяснять, просто покажите.",
      tr: "Bugün fikirlerinizden biri başkalarına tuhaf gelecek — ve doğru olan tam da o. Açıklamaya çalışmayın, yalnızca gösterin.",
      ar: "ستبدو إحدى أفكارك غريبة للآخرين اليوم — وهي الصائبة تحديدًا. لا تحاولي شرحها، بل اعرضيها فحسب.",
    },
    weekly: {
      az: "Həftə boyunca bir qrup və ya komanda məsələsi diqqət tələb edir. Məsafə saxlamaq adətiniz bu dəfə işə yaramır; bir addım yaxınlaşın.",
      en: "A group or team matter demands attention through the week. Your habit of keeping distance does not help this time; step closer.",
      ru: "Всю неделю вопрос группы или команды требует внимания. Ваша привычка держать дистанцию в этот раз не помогает; сделайте шаг навстречу.",
      tr: "Hafta boyunca bir grup ya da ekip meselesi ilgi istiyor. Mesafe koruma alışkanlığınız bu kez işe yaramıyor; bir adım yaklaşın.",
      ar: "تطلب مسألة تخصّ مجموعة أو فريقًا انتباهك طوال الأسبوع. عادتك في حفظ المسافة لا تنفع هذه المرة؛ اقتربي خطوة.",
    },
    monthly: {
      az: "Sentyabr sizə gündəlik nizamın da yaradıcılıq olduğunu göstərir. Bu ay bir rutin qurun — azadlığınız ondan sonra daha çox olacaq, daha az yox.",
      en: "September shows you that daily order is also a form of creativity. Build one routine this month — your freedom afterwards will be greater, not smaller.",
      ru: "Сентябрь показывает, что ежедневный порядок — тоже творчество. Постройте в этом месяце один режим: свободы после этого станет больше, а не меньше.",
      tr: "Eylül size günlük düzenin de bir yaratıcılık olduğunu gösteriyor. Bu ay bir rutin kurun — özgürlüğünüz sonrasında azalmayacak, artacak.",
      ar: "يريك سبتمبر أن النظام اليومي شكل من أشكال الإبداع أيضًا. ابني روتينًا واحدًا هذا الشهر — وستزداد حرّيتك بعده لا تنقص.",
    },
  },

  pisces: {
    daily: {
      az: "Bu gün hissləriniz dəqiq işləyir, amma sərhəd qoymaq çətin olacaq. Kiminsə yükünü öz üzərinizə götürməyin — kömək etmək və daşımaq eyni şey deyil.",
      en: "Your intuition works accurately today, but setting a boundary will be hard. Do not take someone's weight onto yourself — helping and carrying are not the same.",
      ru: "Сегодня интуиция работает точно, но провести границу будет трудно. Не берите чужой груз на себя: помогать и нести — не одно и то же.",
      tr: "Bugün sezginiz doğru çalışıyor ama sınır koymak zor olacak. Birinin yükünü üstlenmeyin — yardım etmekle taşımak aynı şey değil.",
      ar: "حدسك يعمل بدقّة اليوم، لكن وضع الحدّ سيكون صعبًا. لا تحملي ثقل أحدهم عنك — فالمساعدة والحمل ليسا شيئًا واحدًا.",
    },
    weekly: {
      az: "Bu həftə yaradıcı bir iş üçün pəncərə açılır. Səhər saatlarını qoruyun: fikir gündüzün ortasında yox, ilk iki saatda gəlir.",
      en: "A window opens for creative work this week. Protect your mornings: the idea comes in the first two hours, not in the middle of the day.",
      ru: "На этой неделе открывается окно для творческой работы. Берегите утро: идея приходит в первые два часа, а не в середине дня.",
      tr: "Bu hafta yaratıcı bir iş için pencere açılıyor. Sabahlarınızı koruyun: fikir günün ortasında değil, ilk iki saatte geliyor.",
      ar: "تنفتح هذه الأسبوع نافذة لعمل إبداعي. احمي صباحاتك: الفكرة تأتي في الساعتين الأوليين لا في منتصف النهار.",
    },
    monthly: {
      az: "Sentyabr sizin xəyalınıza forma verir. Uzun müddət başınızda saxladığınız fikri bu ay kağıza köçürün — yazılan kimi o, layihəyə çevrilir.",
      en: "September gives your dream a shape. Put the idea you have carried in your head for so long onto paper this month — once written, it becomes a project.",
      ru: "Сентябрь придаёт вашей мечте форму. Перенесите на бумагу идею, которую долго держали в голове: записанная, она становится проектом.",
      tr: "Eylül hayalinize biçim veriyor. Uzun süredir kafanızda taşıdığınız fikri bu ay kâğıda geçirin — yazıldığı anda proje olur.",
      ar: "يمنح سبتمبر حلمك شكلًا. انقلي إلى الورق الفكرة التي حملتِها في رأسك طويلًا — فما إن تُكتب حتى تصير مشروعًا.",
    },
  },
};

const EMPTY: LocalizedText = { az: "", en: "", ru: "", tr: "", ar: "" };

export function getHoroscope(
  sign: ZodiacKey,
  period: HoroscopePeriod,
  locale: Locale,
): string {
  const entry = horoscopes[sign]?.[period] ?? EMPTY;
  return entry[locale]?.trim() || entry.az?.trim() || entry.en?.trim() || "";
}
