'use client';

import { useState, useEffect } from 'react';
import type { Locale } from '@/lib/i18n/config';

interface AdContent {
  title: string;
  subtitle: string;
  cta: string;
  whatsapp: string;
}

const adContent: Record<Locale, AdContent> = {
  az: {
    title: 'Burada sizin reklamınız ola bilər',
    subtitle: 'Peşəkar reklam xidməti',
    cta: 'Bizimlə əlaqə saxlayın',
    whatsapp: 'WhatsApp: 0503807787'
  },
  en: {
    title: 'Your Ad Could Be Here',
    subtitle: 'Professional Advertising Services',
    cta: 'Get in Touch',
    whatsapp: 'WhatsApp: 0503807787'
  },
  ru: {
    title: 'Здесь может быть ваша реклама',
    subtitle: 'Профессиональные рекламные услуги',
    cta: 'Свяжитесь с нами',
    whatsapp: 'WhatsApp: 0503807787'
  },
  tr: {
    title: 'Reklamınız burada olabilir',
    subtitle: 'Profesyonel reklam hizmetleri',
    cta: 'Bizimle iletişime geçin',
    whatsapp: 'WhatsApp: 0503807787'
  },
  ar: {
    title: 'إعلانك يمكن أن يكون هنا',
    subtitle: 'خدمات إعلانية احترافية',
    cta: 'تواصل معنا',
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
        {/* Animated Background Gradient */}
        <div className="ad-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
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

          <button 
            className="ad-button"
            onClick={handleWhatsAppClick}
            aria-label={content.cta}
          >
            <span className="button-text">{content.cta}</span>
            <svg className="button-arrow" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* WhatsApp Contact */}
        <div className="ad-footer">
          <div className="whatsapp-badge" onClick={handleWhatsAppClick}>
            <svg className="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span className="whatsapp-text">{content.whatsapp}</span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="decorative-lines">
          <div className="line line-1"></div>
          <div className="line line-2"></div>
          <div className="line line-3"></div>
        </div>
      </div>

      <style jsx>{`
        .advertisement-banner-wrapper {
          width: 100%;
          margin: 2rem 0;
          display: flex;
          justify-content: center;
        }

        .advertisement-banner {
          position: relative;
          width: 100%;
          max-width: 1200px;
          min-height: 280px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          border-radius: 24px;
          overflow: hidden;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .advertisement-banner.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Animated Background Orbs */
        .ad-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.6;
          animation: float 8s infinite ease-in-out;
        }

        .orb-1 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
          top: -100px;
          left: -100px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(240, 147, 251, 0.6) 0%, transparent 70%);
          bottom: -80px;
          right: 10%;
          animation-delay: 2s;
        }

        .orb-3 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(118, 75, 162, 0.7) 0%, transparent 70%);
          top: 50%;
          right: -80px;
          animation-delay: 4s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
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
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          backdrop-filter: blur(10px);
          animation: pulse 2s infinite;
        }

        .ad-icon svg {
          width: 40px;
          height: 40px;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 20px rgba(255, 255, 255, 0);
          }
        }

        .ad-text {
          flex: 1;
          min-width: 250px;
        }

        .ad-title {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          animation: slideInLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s backwards;
        }

        .ad-subtitle {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          animation: slideInLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s backwards;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .ad-button {
          background: white;
          color: #667eea;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          animation: slideInRight 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s backwards;
        }

        .ad-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
          background: #f8f9fa;
        }

        .ad-button:active {
          transform: translateY(-1px);
        }

        .button-arrow {
          width: 20px;
          height: 20px;
          transition: transform 0.3s ease;
        }

        .ad-button:hover .button-arrow {
          transform: translateX(5px);
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Footer */
        .ad-footer {
          position: relative;
          z-index: 2;
          margin-top: 1.5rem;
          animation: fadeIn 0.8s ease 0.8s backwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .whatsapp-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(37, 211, 102, 0.15);
          border: 2px solid rgba(37, 211, 102, 0.4);
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .whatsapp-badge:hover {
          background: rgba(37, 211, 102, 0.25);
          border-color: rgba(37, 211, 102, 0.6);
          transform: scale(1.05);
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
            transform: translateY(-5px);
          }
        }

        .whatsapp-text {
          color: white;
          font-weight: 600;
          font-size: 0.95rem;
        }

        /* Decorative Lines */
        .decorative-lines {
          position: absolute;
          top: 0;
          right: 0;
          width: 300px;
          height: 100%;
          opacity: 0.1;
          overflow: hidden;
          pointer-events: none;
        }

        .line {
          position: absolute;
          width: 2px;
          height: 100%;
          background: white;
          animation: lineMove 3s infinite ease-in-out;
        }

        .line-1 {
          left: 20%;
          animation-delay: 0s;
        }

        .line-2 {
          left: 50%;
          animation-delay: 1s;
        }

        .line-3 {
          left: 80%;
          animation-delay: 2s;
        }

        @keyframes lineMove {
          0%, 100% {
            transform: translateY(-100%);
          }
          50% {
            transform: translateY(100%);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .advertisement-banner {
            padding: 2rem 1.5rem;
            min-height: 320px;
          }

          .ad-content {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }

          .ad-icon {
            width: 70px;
            height: 70px;
          }

          .ad-icon svg {
            width: 35px;
            height: 35px;
          }

          .ad-title {
            font-size: 1.5rem;
          }

          .ad-subtitle {
            font-size: 1rem;
          }

          .ad-button {
            width: 100%;
            justify-content: center;
          }

          .whatsapp-badge {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .advertisement-banner {
            padding: 1.5rem 1rem;
            min-height: 280px;
          }

          .ad-title {
            font-size: 1.25rem;
          }

          .ad-subtitle {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}
