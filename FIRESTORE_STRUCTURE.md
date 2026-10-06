# Firestore Database Structure - Nesreen Magazine

## Collections

### 1. articles
```
{
  id: string (auto-generated)
  slug: {
    az: string
    en: string
    ru: string
    tr: string
    ar: string
  }
  title: {
    az: string
    en: string
    ru: string
    tr: string
    ar: string
  }
  excerpt: {
    az: string
    en: string
    ru: string
    tr: string
    ar: string
  }
  content: {
    az: string (HTML/Markdown)
    en: string
    ru: string
    tr: string
    ar: string
  }
  coverImage: {
    url: string
    alt: string
    width: number
    height: number
  }
  category: string (gundem, moda, gozellik, heyat-terzi, biznes, astrologiya)
  subcategory: string | null
  author: {
    id: string
    name: string
    avatar: string
  }
  publishedAt: timestamp
  updatedAt: timestamp
  status: string (draft, published, scheduled)
  featured: {
    isHero: boolean (Bu həftənin baş mövzusu)
    isTrending: boolean (Çox oxunanlar)
    isFeatured: boolean (Ana səhifədə göstər)
  }
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
  }
  views: number
  readingTime: number (dəqiqə)
}
```

### 2. horoscopes
```
{
  id: string
  sign: string (aries, taurus, gemini, etc.)
  period: string (daily, weekly, monthly)
  date: timestamp
  content: {
    az: string
    en: string
    ru: string
    tr: string
    ar: string
  }
  createdAt: timestamp
}
```

### 3. ejournals
```
{
  id: string
  title: {
    az: string
    en: string
    ru: string
    tr: string
    ar: string
  }
  description: {
    az: string
    en: string
    ru: string
    tr: string
    ar: string
  }
  coverImage: {
    url: string
    width: number (600)
    height: number (800)
  }
  pdfFile: {
    url: string
    size: number (bytes)
  }
  issueNumber: number
  publishedAt: timestamp
  views: number
  downloads: number
}
```

### 4. advertisements
```
{
  id: string
  title: string
  placement: string (hero-banner, sidebar-top, sidebar-bottom, in-article, footer)
  image: {
    url: string
    width: number
    height: number
  }
  link: string
  startDate: timestamp
  endDate: timestamp
  isActive: boolean
  impressions: number
  clicks: number
  createdAt: timestamp
}
```

### 5. staff
```
{
  id: string
  firstName: string
  lastName: string
  bio: {
    az: string
    en: string
    ru: string
    tr: string
    ar: string
  }
  photo: string
  role: string (author, editor, director, photographer)
  email: string
  social: {
    instagram: string | null
    twitter: string | null
    linkedin: string | null
  }
  isActive: boolean
  joinedAt: timestamp
}
```

### 6. contacts
```
{
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string (new, read, responded, archived)
  submittedAt: timestamp
  respondedAt: timestamp | null
  notes: string | null
}
```

### 7. newsletters
```
{
  id: string
  email: string
  isActive: boolean
  subscribedAt: timestamp
  unsubscribedAt: timestamp | null
}
```

### 8. categories (Reference - for dynamic management)
```
{
  id: string
  slug: string
  name: {
    az: string
    en: string
    ru: string
    tr: string
    ar: string
  }
  description: {
    az: string
    en: string
    ru: string
    tr: string
    ar: string
  }
  order: number
  isActive: boolean
}
```

## Image Size Requirements

### Article Cover Images:
- **Hero Carousel**: 1200x675px (16:9)
- **Grid View**: 800x600px (4:3)
- **Compact View**: 600x400px (3:2)
- **Thumbnail**: 400x300px (4:3)

### E-Journal:
- **Cover**: 600x800px (Portrait)

### Advertisements:
- **Hero Banner**: 1200x400px
- **Sidebar**: 300x250px, 300x600px
- **In-Article**: 728x90px, 300x250px
- **Footer**: 728x90px

### Staff Photos:
- **Profile**: 400x400px (Square)

## Indexes (for performance)

1. articles: category, status, publishedAt, featured.isHero, featured.isTrending
2. horoscopes: sign, period, date
3. advertisements: placement, isActive, startDate, endDate
4. contacts: status, submittedAt
