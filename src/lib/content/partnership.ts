import type { Locale } from "@/lib/i18n/config";

/**
 * «Əməkdaşlıq» səhifəsinin məzmunu — 5 dildə.
 * Yalnız real, yoxlanıla bilən faktlar: dillər, bölmələr, reklam yerləri,
 * bülleten, nəşrlər, əlaqə. Auditoriya rəqəmləri media-kitdə fərdi göndərilir.
 */

export const PARTNERSHIP_EMAIL = "info@nesreenmagazine.com";
export const PARTNERSHIP_WHATSAPP = "+994 50 380 77 87";
export const PARTNERSHIP_WHATSAPP_URL = "https://wa.me/994503807787";
export const PARTNERSHIP_INSTAGRAM = "@nesreenmagazine";
export const PARTNERSHIP_INSTAGRAM_URL = "https://www.instagram.com/nesreenmagazine/";

type Item = { title: string; text: string };

export type PartnershipContent = {
  eyebrow: string;
  title: string;
  lead: string;
  facts: { value: string; label: string }[];
  formatsTitle: string;
  formatsLead: string;
  formats: Item[];
  placementsTitle: string;
  placements: string[];
  stepsTitle: string;
  steps: Item[];
  principlesTitle: string;
  principles: string[];
  contactTitle: string;
  contactText: string;
  emailLabel: string;
  whatsappLabel: string;
  instagramLabel: string;
  writeCta: string;
  mailSubject: string;
  briefTitle: string;
  brief: string[];
};

const az: PartnershipContent = {
  eyebrow: "Əməkdaşlıq",
  title: "Brendinizi Nesreen oxucusu ilə tanış edin",
  lead: "Nesreen Magazine moda, gözəllik, həyat tərzi, astrologiya və biznes mövzularında beş dildə yazan qadın jurnalıdır. Brendlərlə əməkdaşlığı da jurnalın özü kimi qururuq: zövqlü, səliqəli və oxucuya hörmətlə.",
  facts: [
    { value: "5", label: "dil — AZ, EN, RU, TR, AR" },
    { value: "6", label: "bölmə — Gündəm, Moda, Gözəllik, Həyat tərzi, Astrologiya, Biznes" },
    { value: "Hər həftə", label: "«Həftənin seçimi» bülleteni" },
    { value: "Çap + PDF", label: "jurnal nömrələri və e-jurnal" },
  ],
  formatsTitle: "Əməkdaşlıq formatları",
  formatsLead: "Hər layihəni brendin məqsədinə görə fərdi hazırlayırıq. Aşağıdakı formatlar ayrıca və ya paket şəklində təklif olunur.",
  formats: [
    { title: "Saytda banner", text: "Ana səhifədə, bölmə səhifələrində və məqalələrin içində reklam yerləri. Banneri istədiyiniz bölmənin oxucusuna yönəltmək mümkündür." },
    { title: "Tərəfdaş məqaləsi", text: "Brendiniz, məhsulunuz və ya hekayəniz haqqında redaksiyanın üslubunda hazırlanan yazı — beş dildə dərc oluna bilər." },
    { title: "Bülleten sponsorluğu", text: "Abunəçilərə göndərilən «Həftənin seçimi» məktubunda brendinizə ayrılmış yer." },
    { title: "Çap nəşri və e-jurnal", text: "Jurnal nömrələrində reklam səhifəsi, xüsusi buraxılışlarda tərəfdaşlıq və e-jurnalda yerləşdirmə." },
    { title: "Müsahibə və xüsusi layihə", text: "Brend rəhbərləri və dizaynerlərlə müsahibə, foto çəkiliş, tədbirlərdə media tərəfdaşlığı." },
    { title: "Instagram", text: "Sayt materiallarının @nesreenmagazine səhifəsində paylaşılması və birgə kampaniyalar." },
  ],
  placementsTitle: "Saytda reklam yerləri",
  placements: [
    "Ana səhifə — ön səhifədən sonra geniş banner",
    "Bölmə səhifələrinin yuxarısı — seçilmiş bölməyə görə",
    "Məqalənin başlığı altında və mətnin ortasında",
    "Məqalənin sol və sağ yan panelləri (kompüterdə)",
  ],
  stepsTitle: "Necə işləyirik",
  steps: [
    { title: "Bizə yazın", text: "Brendiniz, məqsədiniz, büdcə aralığı və tarixlər barədə qısa məlumat göndərin." },
    { title: "Təklif hazırlayırıq", text: "Uyğun formatları, yerləşdirmə planını və qiyməti təqdim edirik." },
    { title: "Razılaşma və hazırlıq", text: "Materialları birlikdə hazırlayır, dərcdən əvvəl sizinlə təsdiqləyirik." },
    { title: "Dərc və nəticə", text: "Kampaniya vaxtında yayımlanır; bitəndə baxış statistikasını paylaşırıq." },
  ],
  principlesTitle: "Prinsiplərimiz",
  principles: [
    "Reklam və tərəfdaş materialları redaksiya yazılarından aydın şəkildə ayrılır.",
    "Oxucumuza uyğun olmayan və ya yanıldıcı təklifləri qəbul etmirik.",
    "Qiymətlər format, müddət və həcmə görə fərdi hesablanır.",
  ],
  contactTitle: "Əməkdaşlıq üçün əlaqə",
  contactText: "Təklifinizi e-poçt və ya WhatsApp ilə göndərin — komandamız sizinlə əlaqə saxlayacaq.",
  emailLabel: "E-poçt",
  whatsappLabel: "WhatsApp",
  instagramLabel: "Instagram",
  writeCta: "Məktub yazın",
  mailSubject: "Əməkdaşlıq təklifi",
  briefTitle: "Məktubda qeyd edin",
  brief: ["Brendin adı və sahəsi", "Kampaniyanın məqsədi", "İstədiyiniz format(lar)", "Tarixlər və büdcə aralığı"],
};

const en: PartnershipContent = {
  eyebrow: "Partnerships",
  title: "Introduce your brand to the Nesreen reader",
  lead: "Nesreen Magazine is a women's magazine published in five languages, covering fashion, beauty, lifestyle, astrology and business. We build brand partnerships the way we make the magazine: with taste, care and respect for the reader.",
  facts: [
    { value: "5", label: "languages — AZ, EN, RU, TR, AR" },
    { value: "6", label: "sections — News, Fashion, Beauty, Lifestyle, Astrology, Business" },
    { value: "Weekly", label: "“Pick of the Week” newsletter" },
    { value: "Print + PDF", label: "magazine issues and e-journal" },
  ],
  formatsTitle: "Partnership formats",
  formatsLead: "Every project is shaped around the brand's goal. The formats below are available on their own or as a package.",
  formats: [
    { title: "Website banners", text: "Placements on the home page, section pages and inside articles. Banners can be targeted to the readers of a chosen section." },
    { title: "Partner article", text: "A story about your brand, product or journey, written in our editorial style — can be published in all five languages." },
    { title: "Newsletter sponsorship", text: "A dedicated spot for your brand in the “Pick of the Week” email sent to our subscribers." },
    { title: "Print and e-journal", text: "Advertising pages in magazine issues, partnerships in special editions and placement in the e-journal." },
    { title: "Interviews and special projects", text: "Interviews with founders and designers, photo shoots and media partnerships at events." },
    { title: "Instagram", text: "Sharing site features on @nesreenmagazine and joint campaigns." },
  ],
  placementsTitle: "Ad placements on the website",
  placements: [
    "Home page — wide banner after the front page",
    "Top of section pages — targeted by section",
    "Below the article headline and mid-article",
    "Left and right article sidebars (desktop)",
  ],
  stepsTitle: "How we work",
  steps: [
    { title: "Write to us", text: "Send a short note about your brand, goal, budget range and dates." },
    { title: "We prepare a proposal", text: "We suggest suitable formats, a placement plan and pricing." },
    { title: "Agreement and preparation", text: "We prepare the materials together and confirm them with you before publishing." },
    { title: "Publishing and results", text: "The campaign goes live on time; when it ends we share view statistics." },
  ],
  principlesTitle: "Our principles",
  principles: [
    "Advertising and partner content is clearly separated from editorial content.",
    "We do not accept offers that are misleading or wrong for our readers.",
    "Pricing is set individually by format, duration and scope.",
  ],
  contactTitle: "Partnership contact",
  contactText: "Send your proposal by email or WhatsApp — our team will get back to you.",
  emailLabel: "Email",
  whatsappLabel: "WhatsApp",
  instagramLabel: "Instagram",
  writeCta: "Write to us",
  mailSubject: "Partnership proposal",
  briefTitle: "Please include",
  brief: ["Brand name and industry", "Campaign goal", "Preferred format(s)", "Dates and budget range"],
};

const ru: PartnershipContent = {
  eyebrow: "Сотрудничество",
  title: "Познакомьте свой бренд с читательницей Nesreen",
  lead: "Nesreen Magazine — женский журнал на пяти языках о моде, красоте, стиле жизни, астрологии и бизнесе. Партнёрства с брендами мы строим так же, как делаем журнал: со вкусом, аккуратно и с уважением к читателю.",
  facts: [
    { value: "5", label: "языков — AZ, EN, RU, TR, AR" },
    { value: "6", label: "разделов — Актуальное, Мода, Красота, Стиль жизни, Астрология, Бизнес" },
    { value: "Каждую неделю", label: "рассылка «Выбор недели»" },
    { value: "Печать + PDF", label: "номера журнала и e-журнал" },
  ],
  formatsTitle: "Форматы сотрудничества",
  formatsLead: "Каждый проект мы готовим под цель бренда. Форматы ниже доступны по отдельности или пакетом.",
  formats: [
    { title: "Баннеры на сайте", text: "Места на главной странице, страницах разделов и внутри статей. Баннер можно показывать читателям выбранного раздела." },
    { title: "Партнёрская статья", text: "Материал о вашем бренде, продукте или истории в редакционном стиле журнала — возможна публикация на пяти языках." },
    { title: "Спонсорство рассылки", text: "Отдельное место для бренда в письме «Выбор недели», которое получают подписчики." },
    { title: "Печатный номер и e-журнал", text: "Рекламные полосы в номерах, партнёрство в специальных выпусках и размещение в e-журнале." },
    { title: "Интервью и спецпроекты", text: "Интервью с основателями и дизайнерами, фотосъёмки, медиапартнёрство на мероприятиях." },
    { title: "Instagram", text: "Публикация материалов сайта в @nesreenmagazine и совместные кампании." },
  ],
  placementsTitle: "Рекламные места на сайте",
  placements: [
    "Главная страница — широкий баннер после первой полосы",
    "Верх страниц разделов — с таргетингом по разделу",
    "Под заголовком статьи и в середине текста",
    "Левая и правая боковые панели статьи (на компьютере)",
  ],
  stepsTitle: "Как мы работаем",
  steps: [
    { title: "Напишите нам", text: "Кратко расскажите о бренде, цели, бюджете и сроках." },
    { title: "Готовим предложение", text: "Предлагаем подходящие форматы, план размещения и стоимость." },
    { title: "Согласование и подготовка", text: "Готовим материалы вместе и согласовываем их с вами до публикации." },
    { title: "Публикация и итоги", text: "Кампания выходит вовремя; по завершении делимся статистикой просмотров." },
  ],
  principlesTitle: "Наши принципы",
  principles: [
    "Реклама и партнёрские материалы чётко отделены от редакционных.",
    "Мы не принимаем вводящие в заблуждение или неуместные для читателя предложения.",
    "Стоимость рассчитывается индивидуально — по формату, сроку и объёму.",
  ],
  contactTitle: "Контакты для сотрудничества",
  contactText: "Пришлите предложение по e-mail или в WhatsApp — наша команда свяжется с вами.",
  emailLabel: "E-mail",
  whatsappLabel: "WhatsApp",
  instagramLabel: "Instagram",
  writeCta: "Написать письмо",
  mailSubject: "Предложение о сотрудничестве",
  briefTitle: "Укажите в письме",
  brief: ["Название бренда и сферу", "Цель кампании", "Желаемые форматы", "Сроки и бюджет"],
};

const tr: PartnershipContent = {
  eyebrow: "İş birliği",
  title: "Markanızı Nesreen okuruyla tanıştırın",
  lead: "Nesreen Magazine moda, güzellik, yaşam tarzı, astroloji ve iş dünyası üzerine beş dilde yayımlanan bir kadın dergisidir. Markalarla iş birliğini de dergiyi yaptığımız gibi kuruyoruz: zevkli, özenli ve okura saygılı.",
  facts: [
    { value: "5", label: "dil — AZ, EN, RU, TR, AR" },
    { value: "6", label: "bölüm — Gündem, Moda, Güzellik, Yaşam Tarzı, Astroloji, İş Dünyası" },
    { value: "Her hafta", label: "«Haftanın Seçimi» bülteni" },
    { value: "Baskı + PDF", label: "dergi sayıları ve e-dergi" },
  ],
  formatsTitle: "İş birliği formatları",
  formatsLead: "Her projeyi markanın hedefine göre hazırlıyoruz. Aşağıdaki formatlar tek tek ya da paket olarak sunulur.",
  formats: [
    { title: "Sitede banner", text: "Ana sayfada, bölüm sayfalarında ve makalelerin içinde reklam alanları. Banner seçilen bölümün okurlarına yönlendirilebilir." },
    { title: "Partner makalesi", text: "Markanız, ürününüz ya da hikâyeniz hakkında editoryal üslubumuzla hazırlanan yazı — beş dilde yayımlanabilir." },
    { title: "Bülten sponsorluğu", text: "Abonelere gönderilen «Haftanın Seçimi» e-postasında markanıza ayrılan alan." },
    { title: "Basılı dergi ve e-dergi", text: "Dergi sayılarında reklam sayfası, özel sayılarda iş birliği ve e-dergide yer." },
    { title: "Röportaj ve özel proje", text: "Kurucular ve tasarımcılarla röportaj, fotoğraf çekimi, etkinliklerde medya sponsorluğu." },
    { title: "Instagram", text: "Site içeriklerinin @nesreenmagazine hesabında paylaşılması ve ortak kampanyalar." },
  ],
  placementsTitle: "Sitedeki reklam alanları",
  placements: [
    "Ana sayfa — ön sayfadan sonra geniş banner",
    "Bölüm sayfalarının üstü — bölüme göre hedefleme",
    "Makale başlığının altı ve metnin ortası",
    "Makalenin sol ve sağ yan panelleri (bilgisayarda)",
  ],
  stepsTitle: "Nasıl çalışıyoruz",
  steps: [
    { title: "Bize yazın", text: "Markanız, hedefiniz, bütçe aralığınız ve tarihler hakkında kısa bilgi gönderin." },
    { title: "Teklif hazırlıyoruz", text: "Uygun formatları, yerleşim planını ve fiyatı sunuyoruz." },
    { title: "Onay ve hazırlık", text: "Materyalleri birlikte hazırlıyor, yayından önce sizinle onaylıyoruz." },
    { title: "Yayın ve sonuç", text: "Kampanya zamanında yayına girer; bittiğinde görüntülenme istatistiklerini paylaşırız." },
  ],
  principlesTitle: "İlkelerimiz",
  principles: [
    "Reklam ve partner içerikleri editoryal yazılardan açıkça ayrılır.",
    "Okurumuza uygun olmayan ya da yanıltıcı teklifleri kabul etmeyiz.",
    "Fiyatlar format, süre ve kapsama göre kişiye özel hesaplanır.",
  ],
  contactTitle: "İş birliği için iletişim",
  contactText: "Teklifinizi e-posta veya WhatsApp ile gönderin — ekibimiz sizinle iletişime geçecek.",
  emailLabel: "E-posta",
  whatsappLabel: "WhatsApp",
  instagramLabel: "Instagram",
  writeCta: "E-posta yazın",
  mailSubject: "İş birliği teklifi",
  briefTitle: "E-postada belirtin",
  brief: ["Marka adı ve sektörü", "Kampanyanın hedefi", "İstediğiniz format(lar)", "Tarihler ve bütçe aralığı"],
};

const ar: PartnershipContent = {
  eyebrow: "الشراكات",
  title: "عرّفي قارئة نسرين بعلامتك التجارية",
  lead: "Nesreen Magazine مجلة نسائية تصدر بخمس لغات وتغطي الموضة والجمال وأسلوب الحياة والأبراج والأعمال. نبني شراكاتنا مع العلامات التجارية كما نصنع المجلة: بذوق وعناية واحترام للقارئة.",
  facts: [
    { value: "5", label: "لغات — AZ، EN، RU، TR، AR" },
    { value: "6", label: "أقسام — الأحداث، الموضة، الجمال، أسلوب الحياة، الأبراج، الأعمال" },
    { value: "أسبوعيًا", label: "نشرة «اختيار الأسبوع»" },
    { value: "مطبوع + PDF", label: "أعداد المجلة والمجلة الإلكترونية" },
  ],
  formatsTitle: "أشكال التعاون",
  formatsLead: "نُعدّ كل مشروع وفق هدف العلامة التجارية. الأشكال التالية متاحة منفردة أو ضمن باقة.",
  formats: [
    { title: "إعلانات بانر على الموقع", text: "مساحات في الصفحة الرئيسية وصفحات الأقسام وداخل المقالات، مع إمكانية توجيه البانر لقرّاء قسم محدد." },
    { title: "مقال شريك", text: "مادة عن علامتك أو منتجك أو قصتك بأسلوبنا التحريري — يمكن نشرها باللغات الخمس." },
    { title: "رعاية النشرة البريدية", text: "مساحة مخصّصة لعلامتك في رسالة «اختيار الأسبوع» التي تصل إلى المشتركين." },
    { title: "المجلة المطبوعة والإلكترونية", text: "صفحات إعلانية في الأعداد، وشراكات في الإصدارات الخاصة، وظهور في المجلة الإلكترونية." },
    { title: "مقابلات ومشاريع خاصة", text: "مقابلات مع المؤسسين والمصممين، وجلسات تصوير، وشراكات إعلامية في الفعاليات." },
    { title: "إنستغرام", text: "مشاركة مواد الموقع على حساب ‎@nesreenmagazine وحملات مشتركة." },
  ],
  placementsTitle: "المساحات الإعلانية على الموقع",
  placements: [
    "الصفحة الرئيسية — بانر عريض بعد الواجهة",
    "أعلى صفحات الأقسام — حسب القسم المختار",
    "أسفل عنوان المقال وفي منتصف النص",
    "الشريطان الجانبيان للمقال (على الكمبيوتر)",
  ],
  stepsTitle: "كيف نعمل",
  steps: [
    { title: "راسلينا", text: "أرسلي نبذة قصيرة عن العلامة والهدف والميزانية والمواعيد." },
    { title: "نُعدّ العرض", text: "نقترح الأشكال المناسبة وخطة الظهور والسعر." },
    { title: "الاتفاق والتحضير", text: "نُعدّ المواد معًا ونعتمدها معك قبل النشر." },
    { title: "النشر والنتائج", text: "تنطلق الحملة في موعدها، وعند انتهائها نشارك إحصاءات المشاهدات." },
  ],
  principlesTitle: "مبادئنا",
  principles: [
    "يُفصل المحتوى الإعلاني ومحتوى الشركاء بوضوح عن المحتوى التحريري.",
    "لا نقبل العروض المضللة أو غير المناسبة لقرّائنا.",
    "تُحدَّد الأسعار بشكل فردي حسب الشكل والمدة والحجم.",
  ],
  contactTitle: "التواصل بشأن الشراكات",
  contactText: "أرسلي عرضك عبر البريد الإلكتروني أو واتساب — وسيتواصل معك فريقنا.",
  emailLabel: "البريد الإلكتروني",
  whatsappLabel: "واتساب",
  instagramLabel: "إنستغرام",
  writeCta: "أرسلي رسالة",
  mailSubject: "عرض شراكة",
  briefTitle: "يُرجى ذكر",
  brief: ["اسم العلامة ومجالها", "هدف الحملة", "الشكل المطلوب", "المواعيد ونطاق الميزانية"],
};

export const partnershipContent: Record<Locale, PartnershipContent> = { az, en, ru, tr, ar };
