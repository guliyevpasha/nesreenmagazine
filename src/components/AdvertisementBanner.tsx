'use client';

import { useState, useEffect } from 'react';
import type { Locale } from '@/lib/i18n/config';

interface AdContent {
  title: string;
  subtitle: string;
  whatsapp: string;
}

const adContent: Record<Locale, AdContent> = {
  az: {
    title: 'Burada sizin reklamınız ola bilər',
    subtitle: 'Peşəkar reklam xidməti',
    whatsapp: 'WhatsApp: 0503807787'
  },
  en: {
    title: 'Your Ad Could Be Here',
    subtitle: 'Professional Advertising Services',
    whatsapp: 'WhatsApp: 0503807787'
  },
  ru: {
    title: 'Здесь может быть ваша реклама',
    subtitle: 'Профессиональные рекламные услуги',
    whatsapp: 'WhatsApp: 0503807787'
  },
  tr: {
    title: 'Reklamınız burada olabilir',
    subtitle: 'Profesyonel reklam hizmetleri',
    whatsapp: 'WhatsApp: 0503807787'
  },
  ar: {
    title: 'إعلانك يمكن أن يكون هنا',
    subtitle: 'خدمات إعلانية احترافية',
    whatsapp: 'واتساب: 0503807787'
  }
};

interface AdvertisementBannerProps {
  locale: Locale;
  className?: string;
}

export default function AdvertisementBanner({ locale, className = '' }: AdvertisementBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const content = adContent[locale];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/994503807787', '_blank');
  };

  return (
    <div className={`advertisement-banner-wrapper ${className}`}>
      <div className={`advertisement-banner ${isVisible ? 'visible' : ''}`}>
        {/* Animated Background Pattern */}
        <div className="ad-background">
          <div className="pattern-orb orb-1"></div>
          <div className="pattern-orb orb-2"></div>
        </div>

        {/* Content */}
        <div className="ad-content">
          <div className="ad-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"
              />
            </svg>
          </div>
          
          <div className="ad-text">
            <h3 className="ad-title">{content.title}</h3>
            <p className="ad-subtitle">{content.subtitle}</p>
          </div>

          {/* WhatsApp Contact */}
          <div className="whatsapp-badge" onClick={handleWhatsAppClick}>
            <svg className="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span className="whatsapp-text">{content.whatsapp}</span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="decorative-lines">
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
      </div>

      <style jsx>{`
        .advertisement-banner-wrapper {
          width: 100%;
          margin: 2.5rem 0;
          display: flex;
          justify-content: center;
        }

        .advertisement-banner {
          position: relative;
          width: 100%;
          max-width: 1200px;
          min-height: 200px;
          background: linear-gradient(135deg, #7b2233 0%, #5c1626 100%);
          border-radius: 16px;
          overflow: hidden;
          padding: 2.5rem;
          box-shadow: 0 10px 40px rgba(123, 34, 51, 0.2);
          border: 1px solid rgba(201, 162, 39, 0.2);
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .advertisement-banner.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Subtle Background Pattern */
        .ad-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          opacity: 0.3;
        }

        .pattern-orb {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201, 162, 39, 0.4) 0%, transparent 70%);
          filter: blur(40px);
          animation: float 10s infinite ease-in-out;
        }

        .orb-1 {
          width: 250px;
          height: 250px;
          top: -50px;
          left: -50px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 200px;
          height: 200px;
          bottom: -40px;
          right: 10%;
          animation-delay: 3s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, -20px) scale(1.1);
          }
        }

        /* Content */
        .ad-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .ad-icon {
          width: 70px;
          height: 70px;
          background: rgba(201, 162, 39, 0.15);
          border-radius: 16px;
          border: 2px solid rgba(201, 162, 39, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c9a227;
          animation: pulse 2.5s infinite;
        }

        .ad-icon svg {
          width: 36px;
          height: 36px;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(201, 162, 39, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 15px rgba(201, 162, 39, 0);
          }
        }

        .ad-text {
          flex: 1;
          min-width: 250px;
        }

        .ad-title {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 600;
          color: #fbf8f4;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.02em;
          animation: slideInLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s backwards;
        }

        .ad-subtitle {
          font-family: var(--font-ui);
          font-size: 1rem;
          color: rgba(251, 248, 244, 0.8);
          margin: 0;
          animation: slideInLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s backwards;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-15px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* WhatsApp Badge */
        .whatsapp-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(201, 162, 39, 0.15);
          border: 2px solid rgba(201, 162, 39, 0.4);
          padding: 0.875rem 1.75rem;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          animation: slideInRight 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s backwards;
        }

        .whatsapp-badge:hover {
          background: rgba(201, 162, 39, 0.25);
          border-color: rgba(201, 162, 39, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(201, 162, 39, 0.3);
        }

        .whatsapp-badge:active {
          transform: translateY(0);
        }

        .whatsapp-icon {
          width: 24px;
          height: 24px;
          color: #25d366;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .whatsapp-text {
          color: #fbf8f4;
          font-weight: 600;
          font-size: 0.95rem;
          font-family: var(--font-ui);
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(15px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Decorative Lines */
        .decorative-lines {
          position: absolute;
          top: 0;
          right: 5%;
          width: 200px;
          height: 100%;
          opacity: 0.08;
          overflow: hidden;
          pointer-events: none;
        }

        .line {
          position: absolute;
          width: 1px;
          height: 100%;
          background: linear-gradient(to bottom, transparent, #c9a227, transparent);
          animation: lineMove 4s infinite ease-in-out;
        }

        .line:nth-child(1) {
          left: 30%;
          animation-delay: 0s;
        }

        .line:nth-child(2) {
          left: 50%;
          animation-delay: 1.3s;
        }

        .line:nth-child(3) {
          left: 70%;
          animation-delay: 2.6s;
        }

        @keyframes lineMove {
          0%, 100% {
            transform: translateY(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .advertisement-banner {
            padding: 2rem 1.5rem;
            min-height: 240px;
          }

          .ad-content {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }

          .ad-icon {
            width: 60px;
            height: 60px;
          }

          .ad-icon svg {
            width: 30px;
            height: 30px;
          }

          .ad-title {
            font-size: 1.5rem;
          }

          .ad-subtitle {
            font-size: 0.95rem;
          }

          .whatsapp-badge {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .advertisement-banner {
            padding: 1.5rem 1rem;
            min-height: 220px;
            border-radius: 12px;
          }

          .ad-title {
            font-size: 1.25rem;
          }

          .ad-subtitle {
            font-size: 0.875rem;
          }

          .whatsapp-badge {
            padding: 0.75rem 1.5rem;
          }

          .whatsapp-text {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
}
