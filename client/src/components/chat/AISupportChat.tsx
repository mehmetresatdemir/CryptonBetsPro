import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/utils/i18n-fixed';
import { apiRequest } from '@/lib/queryClient';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: number;
  message: string;
  role: 'user' | 'assistant' | 'admin';
  timestamp: Date;
  intent?: string;
  confidence?: number;
  wasHelpful?: boolean;
  isAdminMessage?: boolean;
  adminName?: string;
}

interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  lastActivity: Date;
  title?: string;
}

interface AISupportChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const AISupportChat: React.FC<AISupportChatProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showSessionList, setShowSessionList] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const guestNameRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get user sessions query
  const { data: sessionsData } = useQuery({
    queryKey: ['/api/chat/sessions'],
    enabled: isAuthenticated && isOpen,
    refetchInterval: 5000, // Check for new messages every 5 seconds
  });

  // Get specific session history
  const { data: sessionHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['/api/chat/history', currentSessionId],
    enabled: isAuthenticated && !!currentSessionId,
    refetchInterval: 3000, // Check for admin replies every 3 seconds
  });

  // Load session history when sessionId changes
  useEffect(() => {
    if (sessionHistory?.messages) {
      const formattedMessages = sessionHistory.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        role: msg.role === 'admin' ? 'admin' : msg.role
      }));
      setMessages(formattedMessages);
    }
  }, [sessionHistory]);

  // Focus input when chat opens and manage guest form
  useEffect(() => {
    if (isOpen) {
      // Check if user is authenticated by checking if we have user data from API
      const checkAuthStatus = async () => {
        try {
          const response = await fetch('/api/auth/me', {
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            // User is authenticated
            setIsAuthenticated(true);
            setShowGuestForm(false);
            // Load most recent session if available
            if (sessionsData?.sessions?.[0]) {
              setCurrentSessionId(sessionsData.sessions[0].sessionId);
            }
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }, 200);
          } else {
            // User is not authenticated - always show guest form
            setIsAuthenticated(false);
            console.log('User not authenticated, showing guest form');
            setShowGuestForm(true);
            setTimeout(() => {
              if (guestNameRef.current) {
                guestNameRef.current.focus();
              }
            }, 200);
          }
        } catch (error) {
          // Network error or not authenticated - show guest form
          setIsAuthenticated(false);
          console.log('Authentication check failed, showing guest form');
          setShowGuestForm(true);
          setTimeout(() => {
            if (guestNameRef.current) {
              guestNameRef.current.focus();
            }
          }, 200);
        }
      };

      checkAuthStatus();
    } else {
      // Chat closed - reset all states
      setShowGuestForm(false);
      setShowSessionList(false);
      setGuestName('');
      setMessage('');
      // Messages'ları sıfırlamayın çünkü tekrar açıldığında konuşma geçmişi kalmalı
    }
  }, [isOpen, sessionsData]); // guestName dependency kaldırıldı

  // Handle guest name submission and check if username exists
  const handleGuestNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guestName.trim().length >= 2) {
      try {
        // Check if username exists in system
        const response = await fetch('/api/auth/check-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: guestName.trim() })
        });
        
        const data = await response.json();
        
        if (data.exists) {
          // Username exists, allow guest chat
          setShowGuestForm(false);
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
            if (message.trim()) {
              const submitEvent = new Event('submit') as any;
              handleSendMessage(submitEvent);
            }
          }, 100);
        } else {
          // Username doesn't exist, redirect to register
          if (confirm(
            translate('chat.usernameNotRegistered', `"${guestName}" kullanıcı adı sistemde kayıtlı değil. Kayıt olmak ister misiniz?`)
          )) {
            window.location.href = `/register?username=${encodeURIComponent(guestName)}`;
          }
        }
      } catch (error) {
        console.error('Username check failed:', error);
        // On error, allow guest chat anyway
        setShowGuestForm(false);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
          if (message.trim()) {
            const submitEvent = new Event('submit') as any;
            handleSendMessage(submitEvent);
          }
        }, 100);
      }
    }
  };

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Token geçerlilik kontrolü ve backend doğrulaması
      let isValidToken = false;
      if (token) {
        try {
          // Backend'den token doğrulaması yap
          const authCheck = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (authCheck.ok) {
            headers['Authorization'] = `Bearer ${token}`;
            isValidToken = true;
          } else {
            // Token geçersiz, localStorage'dan temizle
            localStorage.removeItem('token');
            isValidToken = false;
          }
        } catch (e) {
          // Token kontrol hatası, localStorage'dan temizle
          localStorage.removeItem('token');
          isValidToken = false;
        }
      }

      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          sessionId: currentSessionId,
          message: messageText,
          language: language,
          guestUsername: isValidToken ? undefined : (guestName || 'Misafir') // Guest name için fallback
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onMutate: (messageText) => {
      // Kullanıcı mesajını hemen göster
      const tempUserMessage = {
        id: Date.now(),
        message: messageText,
        role: 'user' as const,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, tempUserMessage]);
      setIsTyping(true);
    },
    onSuccess: (data) => {
      setCurrentSessionId(data.sessionId);
      setMessages(prev => {
        // Son mesajı (temp user message) çıkar ve gerçek mesajları ekle
        const withoutTempMessage = prev.slice(0, -1);
        return [
          ...withoutTempMessage,
          {
            id: data.userMessage.id,
            message: data.userMessage.message,
            role: 'user',
            timestamp: new Date(data.userMessage.timestamp)
          },
          {
            id: data.assistantMessage.id,
            message: data.assistantMessage.message,
            role: 'assistant',
            timestamp: new Date(data.assistantMessage.timestamp),
            intent: data.assistantMessage.intent,
            confidence: data.assistantMessage.confidence
          }
        ];
      });
      setIsTyping(false);
    },
    onError: (error) => {
      console.error('Send message error:', error);
      setIsTyping(false);
    }
  });

  // Feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async ({ messageId, helpful }: { messageId: number; helpful: boolean }) => {
      return apiRequest(`/api/chat/feedback/${messageId}`, 'POST', { helpful });
    },
    onSuccess: (_, variables) => {
      setMessages(prev => prev.map(msg => 
        msg.id === variables.messageId 
          ? { ...msg, wasHelpful: variables.helpful }
          : msg
      ));
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // For guest users, ensure they have provided a name
    if (!token && (!guestName || guestName.trim().length < 2)) {
      setShowGuestForm(true);
      return;
    }
    
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message.trim());
      setMessage('');
    }
  };

  const handleFeedback = (messageId: number, helpful: boolean) => {
    feedbackMutation.mutate({ messageId, helpful });
  };

  // Start new conversation
  const startNewConversation = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setShowSessionList(false);
  };

  // Load existing session
  const loadSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setShowSessionList(false);
    refetchHistory();
  };

  const quickResponses = [
    { key: 'balance', text: translate('chat.quick.balance', 'Bakiyemi göster'), icon: 'fa-wallet', color: 'from-green-500 to-green-600' },
    { key: 'bonus', text: translate('chat.quick.bonus', 'Bonus almak istiyorum'), icon: 'fa-gift', color: 'from-purple-500 to-purple-600' },
    { key: 'deposit', text: translate('chat.quick.deposit', 'Para yatırmak istiyorum'), icon: 'fa-credit-card', color: 'from-blue-500 to-blue-600' },
    { key: 'withdraw', text: translate('chat.quick.withdraw', 'Para çekmek istiyorum'), icon: 'fa-money-bill-wave', color: 'from-orange-500 to-orange-600' },
    { key: 'games', text: translate('chat.quick.games', 'Oyun önerisi'), icon: 'fa-dice', color: 'from-red-500 to-red-600' },
    { key: 'vip', text: translate('chat.quick.vip', 'VIP programı hakkında'), icon: 'fa-crown', color: 'from-yellow-500 to-yellow-600' },
    { key: 'kyc', text: translate('chat.quick.kyc', 'KYC doğrulama'), icon: 'fa-user-check', color: 'from-indigo-500 to-indigo-600' },
    { key: 'limits', text: translate('chat.quick.limits', 'Limit ayarları'), icon: 'fa-shield-alt', color: 'from-gray-500 to-gray-600' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-3/4 transform -translate-x-0 z-[9999] w-[320px] sm:w-[380px] md:w-[400px]">
      <AnimatePresence>
        {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 400, y: 100 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 400, y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-[#1A1A1A] border border-[#333] rounded-2xl shadow-2xl w-full h-[600px] max-h-[80vh] flex flex-col overflow-hidden backdrop-blur-sm"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FFD700] to-yellow-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <i className="fas fa-robot text-[#FFD700] text-sm"></i>
              </div>
              <div>
                <h3 className="text-black font-bold text-sm">CryptonBets AI Asistan</h3>
                <p className="text-black/70 text-xs">{translate('chat.online', 'Çevrimiçi')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <>
                  <button 
                    onClick={() => setShowSessionList(!showSessionList)}
                    className="w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors"
                    title="Konuşma Geçmişi"
                  >
                    <i className="fas fa-history text-black text-sm"></i>
                  </button>
                  <button 
                    onClick={startNewConversation}
                    className="w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors"
                    title="Yeni Konuşma"
                  >
                    <i className="fas fa-plus text-black text-sm"></i>
                  </button>
                </>
              )}
              <button 
                onClick={onClose}
                className="w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times text-black text-sm"></i>
              </button>
            </div>
          </div>

          {/* Session List */}
          {showSessionList && (
            <div className="border-b border-[#333] p-4 bg-[#2A2A2A]">
              <h4 className="text-white font-semibold mb-3 text-sm">Konuşma Geçmişi</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {sessionsData?.sessions?.map((session: any) => (
                  <button
                    key={session.sessionId}
                    onClick={() => loadSession(session.sessionId)}
                    className={`w-full text-left p-2 rounded-lg transition-colors text-sm ${
                      currentSessionId === session.sessionId
                        ? 'bg-[#FFD700] text-black'
                        : 'bg-[#333] text-gray-300 hover:bg-[#444]'
                    }`}
                  >
                    <div className="font-medium truncate">
                      {session.title || 'Konuşma'}
                    </div>
                    <div className="text-xs opacity-70">
                      {new Date(session.lastActivity).toLocaleDateString('tr-TR')}
                    </div>
                  </button>
                ))}
                {(!sessionsData?.sessions || sessionsData.sessions.length === 0) && (
                  <p className="text-gray-400 text-xs">Henüz konuşma geçmişi yok</p>
                )}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !showSessionList && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-comments text-black text-xl"></i>
                </div>
                <h4 className="text-white font-semibold mb-2">
                  {translate('chat.welcome', 'CryptonBets AI Asistanına Hoş Geldiniz!')}
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  {translate('chat.welcome_desc', 'Size nasıl yardımcı olabilirim? Sorularınızı sorun.')}
                </p>
                
                {/* Quick Response Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {quickResponses.map((response) => (
                    <button
                      key={response.key}
                      onClick={() => {
                        setMessage(response.text);
                        setTimeout(() => handleSendMessage(new Event('submit') as any), 100);
                      }}
                      className={`bg-gradient-to-r ${response.color} text-white text-xs py-3 px-3 rounded-xl border border-white/20 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center gap-2`}
                    >
                      <i className={`fas ${response.icon} text-sm`}></i>
                      <span className="font-medium truncate">{response.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center">
                        <i className="fas fa-robot text-black text-xs"></i>
                      </div>
                      <span className="text-[#FFD700] text-xs font-medium">AI Asistan</span>
                    </div>
                  )}
                  
                  {msg.role === 'admin' && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <i className="fas fa-user-tie text-white text-xs"></i>
                      </div>
                      <span className="text-green-400 text-xs font-medium">
                        {msg.adminName || 'Destek Ekibi'}
                      </span>
                    </div>
                  )}
                  
                  <div className={`rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-[#FFD700] text-black ml-8' 
                      : msg.role === 'admin'
                      ? 'bg-green-600 text-white border border-green-500'
                      : 'bg-[#2A2A2A] text-white border border-[#444]'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#444]">
                        <span className="text-xs text-gray-400">Bu yanıt yararlı mıydı?</span>
                        <button
                          onClick={() => handleFeedback(msg.id, true)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                            msg.wasHelpful === true 
                              ? 'bg-green-600 text-white' 
                              : 'bg-[#333] text-gray-400 hover:bg-green-600 hover:text-white'
                          }`}
                        >
                          <i className="fas fa-thumbs-up"></i>
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, false)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                            msg.wasHelpful === false 
                              ? 'bg-red-600 text-white' 
                              : 'bg-[#333] text-gray-400 hover:bg-red-600 hover:text-white'
                          }`}
                        >
                          <i className="fas fa-thumbs-down"></i>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-1 px-2">
                    {new Date(msg.timestamp).toLocaleTimeString('tr-TR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-[#2A2A2A] rounded-2xl px-4 py-3 border border-[#444]">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-[#333]">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={translate('chat.type_message') || 'Mesajınızı yazın...'}
                  className="w-full bg-[#2A2A2A] border border-[#444] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#FFD700] transition-colors"
                  disabled={sendMessageMutation.isPending}
                />
              </div>
              <button
                type="submit"
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="w-12 h-12 bg-[#FFD700] hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
              >
                {sendMessageMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <i className="fas fa-paper-plane text-black"></i>
                )}
              </button>
            </div>
          </form>

          {/* Guest Name Form Modal */}
          {showGuestForm && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#2A2A2A] border-2 border-[#FFD700] rounded-xl p-6 w-full max-w-sm shadow-2xl"
              >
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-user text-black text-lg"></i>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    {language === 'tr' ? 'Hoş Geldiniz!' : language === 'en' ? 'Welcome!' : 'მოგესალმებით!'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {language === 'tr' 
                      ? 'AI destekli yardım almak için kullanıcı adınızı yazın' 
                      : language === 'en' 
                      ? 'Enter your username to get AI-powered assistance'
                      : 'შეიყვანეთ მომხმარებლის სახელი AI დახმარებისთვის'
                    }
                  </p>
                </div>

                <form onSubmit={handleGuestNameSubmit}>
                  <div className="mb-4">
                    <input
                      ref={guestNameRef}
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder={
                        language === 'tr' 
                          ? 'Kullanıcı adınızı yazın (en az 2 karakter)' 
                          : language === 'en'
                          ? 'Enter your username (min 2 characters)'
                          : 'შეიყვანეთ მომხმარებლის სახელი (მინ 2 სიმბოლო)'
                      }
                      className="w-full bg-[#1A1A1A] border border-[#444] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-colors"
                      maxLength={30}
                      autoComplete="off"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowGuestForm(false);
                        onClose();
                      }}
                      className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
                    >
                      {translate('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={guestName.trim().length < 2}
                      className="flex-1 px-4 py-3 bg-[#FFD700] hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-black font-medium transition-colors"
                    >
                      {language === 'tr' ? 'Başla' : language === 'en' ? 'Start' : 'დაწყება'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AISupportChat;