import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Hikaye türleri
type StoryType = 'vip' | 'bonus' | 'tournament' | 'promo';

interface Story {
  id: number;
  type: StoryType;
  title: string;
  image: string;
  seen: boolean;
}

const StoryHighlights: React.FC = () => {
  const { t } = useLanguage();
  const [stories, setStories] = useState<Story[]>([
    {
      id: 1,
      type: 'vip',
      title: 'VIP',
      image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9Imx1Y2lkZSBsdWNpZGUtY3Jvd24iPjxwYXRoIGQ9Im0yIDRsMyAxMiBoMTQgbDMtMTItNiA3LTQtNy00IDctNi03eiI+PC9wYXRoPjxwYXRoIGQ9Ik0ybDE4IDR2bC0xOGg0Ij48L3BhdGg+PC9zdmc+',
      seen: false,
    },
    {
      id: 2,
      type: 'bonus',
      title: 'BONUS',
      image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9Imx1Y2lkZSBsdWNpZGUtZ2lmdCI+PHJlY3QgeD0iMyIgeT0iOCIgd2lkdGg9IjE4IiBoZWlnaHQ9IjQiIHJ4PSIxIj48L3JlY3Q+PHBhdGggZD0iTTEyIDh2MTMiPjwvcGF0aD48cGF0aCBkPSJNMTkgMTJ2Nkg1di02Ij48L3BhdGg+PHBhdGggZD0iTTEyIDhoLTIuNWExLjUgMS41IDAgMCAxIDAtMyBjMS40MiAwIDIuNSAxLjE2IDIuNSAyLjUWeiBNMTIgOGgyLjUgYTEuNSAxLjUgMCAwIDAgMC0zIGMtMS40MiAwLTIuNSAxLjE2LTIuNSAyLjVaIj48L3BhdGg+PC9zdmc+',
      seen: false,
    },
    {
      id: 3,
      type: 'tournament',
      title: 'TURNUVA',
      image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9Imx1Y2lkZSBsdWNpZGUtdHJvcGh5Ij48cmVjdCB4PSI5IiB5PSIyIiB3aWR0aD0iNiIgaGVpZ2h0PSI2Ij48L3JlY3Q+PHJlY3QgeD0iOSIgeT0iMTQiIHdpZHRoPSI2IiBoZWlnaHQ9IjgiPjwvcmVjdD48cGF0aCBkPSJNNiA4aDhNNiAxMGg4Ij48L3BhdGg+PHBhdGggZD0iTTkgOHY4TTEzIDh2OCI+PC9wYXRoPjxwYXRoIGQ9Ik03IDh2MVY4ek03IDEwdjFWMTB6TTEzIDh2MVY4ek0xMyAxMHYxVjEwek05IDEwdjNWMTB6TTksIDE0aDZ2eiI+PC9wYXRoPjwvc3ZnPg==',
      seen: false,
    },
  ]);
  
  // Görüntülenen hikaye
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  
  const handleStoryClick = (story: Story) => {
    setActiveStory(story);
    
    // Hikayeyi görüldü olarak işaretle
    setStories(prev => 
      prev.map(s => s.id === story.id ? {...s, seen: true} : s)
    );
  };
  
  return (
    <div className="w-full h-full bg-gradient-to-b from-[#1A1A1A] to-[#121212] rounded-xl overflow-hidden border-2 border-[#2A2A2A] shadow-lg p-4">
      {/* Başlık */}
      <h2 className="text-lg font-bold text-white mb-4 flex items-center">
        <div className="w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center mr-2">
          <i className="fas fa-star text-black text-xs"></i>
        </div>
        {t('story.highlights') || "HABERLER"}
      </h2>
      
      {/* Hikayeler */}
      <div className="flex justify-center space-x-4">
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center" onClick={() => handleStoryClick(story)}>
            {/* Hikaye dairesi */}
            <div className={`w-16 h-16 rounded-full p-[2px] cursor-pointer transition-all transform hover:scale-105 ${story.seen ? 'bg-gray-500' : 'bg-gradient-to-tr from-[#FFD700] via-yellow-500 to-[#FFBA00]'}`}>
              <div className="w-full h-full rounded-full bg-[#1A1A1A] flex items-center justify-center p-1">
                <div className="w-full h-full rounded-full bg-[#2A2A2A] flex items-center justify-center">
                  <div className="w-8 h-8 overflow-hidden">
                    {story.image.startsWith('data:image') ? (
                      <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: `<img src="${story.image}" alt="${story.title}" class="w-full h-full object-contain" />` }} />
                    ) : (
                      <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Hikaye başlığı */}
            <span className="text-xs text-gray-300 mt-2">{story.title}</span>
          </div>
        ))}
      </div>
      
      {/* Aktif hikaye modalı */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
          <div className="relative w-full max-w-md bg-[#1A1A1A] rounded-xl overflow-hidden shadow-2xl">
            {/* Kapat butonu */}
            <button
              className="absolute top-3 right-3 text-white z-10 bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => setActiveStory(null)}
            >
              <i className="fas fa-times"></i>
            </button>
            
            {/* Hikaye içeriği */}
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFD700] to-[#FFBA00] p-[2px] mr-3">
                  <div className="w-full h-full rounded-full bg-[#2A2A2A] flex items-center justify-center">
                    <div className="w-6 h-6 overflow-hidden">
                      {activeStory.image.startsWith('data:image') ? (
                        <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: `<img src="${activeStory.image}" alt="${activeStory.title}" class="w-full h-full object-contain" />` }} />
                      ) : (
                        <img src={activeStory.image} alt={activeStory.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold">{activeStory.title}</h3>
                  <p className="text-gray-400 text-xs">Bugün</p>
                </div>
              </div>
              
              {/* İçerik */}
              <div className="bg-[#2A2A2A] rounded-lg p-4 mb-4">
                <p className="text-white">
                  {activeStory.type === 'vip' && "VIP üyelik avantajlarını keşfedin! Özel bonuslar ve kişisel yönetici desteği ile ayrıcalıklı bir bahis deneyimi sizleri bekliyor."}
                  {activeStory.type === 'bonus' && "Yeni üyelere özel %100 hoşgeldin bonusu! Hemen üye olun ve ilk yatırımınızı ikiye katlayın."}
                  {activeStory.type === 'tournament' && "Büyük Slot Turnuvası başladı! Toplam 100.000₺ ödül havuzu için hemen katılın ve kazanma şansını yakalayın."}
                </p>
              </div>
              
              {/* Buton */}
              <button className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFBA00] text-black font-bold py-2.5 rounded-lg hover:from-[#FFBA00] hover:to-[#FFD700] transition-all">
                Detayları Gör
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryHighlights;