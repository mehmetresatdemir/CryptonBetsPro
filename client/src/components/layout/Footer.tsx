import { FC, useEffect } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { translate, getCurrentLanguage } from '@/utils/i18n-fixed';

const Footer: FC = () => {
  const { t, language } = useLanguage();


  
  // Sosyal medya linkleri
  const socialLinks = [
    { 
      name: 'Facebook', 
      icon: 'fab fa-facebook', 
      url: 'https://www.facebook.com/cryptonbets',
      color: 'from-blue-600 to-blue-500'
    },
    { 
      name: 'Twitter', 
      icon: 'fab fa-x-twitter', 
      url: 'https://x.com/cryptonbetscom',
      color: 'from-gray-800 to-gray-700'
    },
    { 
      name: 'Instagram', 
      icon: 'fab fa-instagram', 
      url: 'https://www.instagram.com/cryptonbets/',
      color: 'from-purple-600 to-pink-600'
    },
    {
      name: 'LinkedIn',
      icon: 'fab fa-linkedin',
      url: 'https://linkedin.com/company/cryptonbetscom',
      color: 'from-blue-700 to-blue-600'
    },
    { 
      name: 'YouTube', 
      icon: 'fab fa-youtube', 
      url: 'https://www.youtube.com/@Cryptonbets',
      color: 'from-red-600 to-red-500'
    },
    { 
      name: 'Telegram', 
      icon: 'fab fa-telegram', 
      url: 'https://t.me/cryptonbets',
      color: 'from-blue-500 to-blue-400'
    },
    { 
      name: 'Github', 
      icon: 'fab fa-github', 
      url: 'https://github.com/cryptonbets',
      color: 'from-gray-700 to-gray-600'
    }
  ];
  
  return (
    <footer className="w-full bg-[#0c0c0c] border-t border-[#222] py-8 pb-20 md:pb-8">
      <div className="container mx-auto px-4">
        {/* Sosyal Medya Bölümü */}
        <div className="mb-8">
          <h3 className="text-yellow-500 text-center text-lg font-semibold mb-4">{translate('footer.followUs')}</h3>
          
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4">
            {socialLinks.map((social) => (
              <a 
                key={social.name}
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group"
                aria-label={social.name}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${social.color} flex items-center justify-center shadow-md transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg relative`}>
                  <i className={`${social.icon} text-white`}></i>
                  
                  {/* Parıltı efekti */}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-lg"></div>
                </div>
              </a>
            ))}
          </div>
        </div>
        


        {/* Copyright Bölümü */}
        <div className="flex flex-col md:flex-row justify-center items-center text-center gap-2">
          <p className="text-gray-400 text-sm">
{translate('footer.copyright')}
          </p>
          
          <div className="hidden md:flex text-gray-500 mx-3">|</div>
          
          <div className="flex gap-4">
            <a href="/terms" className="text-gray-400 text-sm hover:text-yellow-500 transition-colors duration-300">
{translate('footer.terms')}
            </a>
            <a href="/privacy" className="text-gray-400 text-sm hover:text-yellow-500 transition-colors duration-300">
{translate('footer.privacy')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;