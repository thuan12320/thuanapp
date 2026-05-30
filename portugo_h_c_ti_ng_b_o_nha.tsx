import React, { useState, useEffect, useRef } from 'react';
import { Volume2, ArrowLeft, Heart, Flame, Star, CheckCircle2, Play, Sparkles, Send, Loader2, Bot, Trophy, Home as HomeIcon, LogOut, Dumbbell, X } from 'lucide-react';

// --- CẤU HÌNH GEMINI API ---
const apiKey = ""; 
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

const callGeminiAPI = async (payload) => {
  let retries = 5;
  let delay = 1000;
  while (retries > 0) {
    try {
      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (err) {
      retries--;
      if (retries === 0) throw err;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

// --- DỮ LIỆU NGƯỜI DÙNG (NETFLIX STYLE) ---
const INITIAL_PROFILES = [
  { id: '1', name: 'Hải Nam', avatar: '👨‍🦱', bg: 'bg-blue-500', xp: 2450, streak: 12, rank: 1 },
  { id: '2', name: 'Bảo Ngọc', avatar: '👩', bg: 'bg-pink-500', xp: 1820, streak: 5, rank: 2 },
  { id: '3', name: 'Mẹ', avatar: '👩‍🦰', bg: 'bg-orange-500', xp: 150, streak: 1, rank: 5 },
  { id: '4', name: 'Minh Trí', avatar: '👦', bg: 'bg-green-500', xp: 950, streak: 3, rank: 3 },
  { id: '5', name: 'Khách', avatar: '👤', bg: 'bg-gray-500', xp: 0, streak: 0, rank: 99 },
];

// --- DỮ LIỆU BÀI HỌC (ĐẦY ĐỦ 10 BÀI - ĐÃ MỞ KHÓA TOÀN BỘ) ---
const LESSON_DATA = [
  {
    id: '001', title: 'Người', locked: false, completed: false,
    items: [
      { pt: 'Eu', vi: 'Tôi', emoji: '🙋‍♂️', examplePt: 'Eu sou estudante.', exampleVi: 'Tôi là học sinh.' },
      { pt: 'Você', vi: 'Bạn', emoji: '🫵', examplePt: 'Você é meu amigo.', exampleVi: 'Bạn là bạn của tôi.' },
      { pt: 'Ele', vi: 'Anh ấy', emoji: '👨', examplePt: 'Ele está feliz.', exampleVi: 'Anh ấy đang vui.' },
      { pt: 'Ela', vi: 'Cô ấy', emoji: '👩', examplePt: 'Ela é bonita.', exampleVi: 'Cô ấy rất đẹp.' },
      { pt: 'Nós', vi: 'Chúng tôi', emoji: '🫂', examplePt: 'Nós somos do Vietnã.', exampleVi: 'Chúng tôi đến từ VN.' },
      { pt: 'Eles', vi: 'Họ', emoji: '👬', examplePt: 'Eles estão aqui.', exampleVi: 'Họ đang ở đây.' },
      { pt: 'O homem', vi: 'Đàn ông', emoji: '👨‍🦰', examplePt: 'O homem é alto.', exampleVi: 'Người đàn ông đó cao.' },
      { pt: 'A mulher', vi: 'Phụ nữ', emoji: '👩‍🦰', examplePt: 'A mulher é inteligente.', exampleVi: 'Phụ nữ thông minh.' },
      { pt: 'O menino', vi: 'Cậu bé', emoji: '👦', examplePt: 'O menino brinca.', exampleVi: 'Cậu bé đang chơi.' },
      { pt: 'A menina', vi: 'Cô bé', emoji: '👧', examplePt: 'A menina lê.', exampleVi: 'Cô bé đang đọc.' }
    ]
  },
  {
    id: '002', title: 'Gia đình', locked: false, completed: false,
    items: [
      { pt: 'Pai', vi: 'Ba / Bố', emoji: '👨‍👧', examplePt: 'Meu pai é médico.', exampleVi: 'Ba tôi là bác sĩ.' },
      { pt: 'Mãe', vi: 'Mẹ', emoji: '👩‍👦', examplePt: 'Eu amo minha mãe.', exampleVi: 'Tôi yêu mẹ tôi.' },
      { pt: 'Marido', vi: 'Chồng', emoji: '🤵', examplePt: 'Este é meu marido.', exampleVi: 'Đây là chồng tôi.' },
      { pt: 'Esposa', vi: 'Vợ', emoji: '👰', examplePt: 'Minha esposa é médica.', exampleVi: 'Vợ tôi là bác sĩ.' },
      { pt: 'Filho', vi: 'Con trai', emoji: '👦', examplePt: 'Meu filho tem dez anos.', exampleVi: 'Con trai tôi mười tuổi.' },
      { pt: 'Filha', vi: 'Con gái', emoji: '👧', examplePt: 'Minha filha é fofa.', exampleVi: 'Con gái tôi rất dễ thương.' },
      { pt: 'Irmão', vi: 'Anh/Em trai', emoji: '👱‍♂️', examplePt: 'Eu tenho um irmão.', exampleVi: 'Tôi có một anh trai.' },
      { pt: 'Irmã', vi: 'Chị/Em gái', emoji: '👩‍🦰', examplePt: 'Minha irmã mora aqui.', exampleVi: 'Chị tôi sống ở đây.' },
      { pt: 'Avô', vi: 'Ông', emoji: '👴', examplePt: 'Meu avô é sábio.', exampleVi: 'Ông tôi rất thông thái.' },
      { pt: 'Avó', vi: 'Bà', emoji: '👵', examplePt: 'A casa da avó.', exampleVi: 'Nhà của bà.' }
    ]
  },
  {
    id: '003', title: 'Làm quen', locked: false, completed: false,
    items: [
      { pt: 'Olá', vi: 'Xin chào', emoji: '👋', examplePt: 'Olá, tudo bem?', exampleVi: 'Xin chào, bạn khỏe không?' },
      { pt: 'Bom dia', vi: 'Chào buổi sáng', emoji: '🌅', examplePt: 'Bom dia a todos!', exampleVi: 'Chào buổi sáng mọi người!' },
      { pt: 'Boa tarde', vi: 'Chào buổi chiều', emoji: '🌇', examplePt: 'Boa tarde, senhor.', exampleVi: 'Chào buổi chiều, thưa ông.' },
      { pt: 'Boa noite', vi: 'Chào buổi tối', emoji: '🌃', examplePt: 'Boa noite, durma bem.', exampleVi: 'Chúc ngủ ngon.' },
      { pt: 'Qual é o seu nome?', vi: 'Bạn tên gì?', emoji: '❓', examplePt: 'Olá, qual é o seu nome?', exampleVi: 'Xin chào, bạn tên gì?' },
      { pt: 'Meu nome é...', vi: 'Tên tôi là...', emoji: '🏷️', examplePt: 'Meu nome é Nam.', exampleVi: 'Tên tôi là Nam.' },
      { pt: 'Obrigado(a)', vi: 'Cảm ơn', emoji: '🙏', examplePt: 'Muito obrigado!', exampleVi: 'Cảm ơn rất nhiều!' },
      { pt: 'De nada', vi: 'Không có chi', emoji: '😊', examplePt: 'De nada, amigo.', exampleVi: 'Không có chi, bạn hiền.' },
      { pt: 'Por favor', vi: 'Làm ơn', emoji: '🥺', examplePt: 'Um café, por favor.', exampleVi: 'Cho một ly cà phê, làm ơn.' },
      { pt: 'Tchau', vi: 'Tạm biệt', emoji: '🏃', examplePt: 'Tchau, até logo!', exampleVi: 'Tạm biệt, hẹn gặp lại!' }
    ]
  },
  { id: '004', title: 'Ở trường học', locked: false, completed: false, items: [{pt: 'A escola', vi: 'Trường học', emoji: '🏫', examplePt: 'A escola é grande.', exampleVi: 'Trường lớn.'}] },
  { id: '005', title: 'Đất nước', locked: false, completed: false, items: [{pt: 'O país', vi: 'Đất nước', emoji: '🌍', examplePt: 'Qual é o seu país?', exampleVi: 'Đất nước của bạn là gì?'}] },
  { id: '006', title: 'Đọc & Viết', locked: false, completed: false, items: [{pt: 'Ler', vi: 'Đọc', emoji: '📖', examplePt: 'Eu gosto de ler.', exampleVi: 'Tôi thích đọc.'}] },
  { id: '007', title: 'Số đếm', locked: false, completed: false, items: [{pt: 'Um', vi: 'Một', emoji: '1️⃣', examplePt: 'Um carro.', exampleVi: 'Một chiếc xe.'}] },
  { id: '008', title: 'Giờ', locked: false, completed: false, items: [{pt: 'A hora', vi: 'Giờ', emoji: '⌚', examplePt: 'Que horas são?', exampleVi: 'Mấy giờ rồi?'}] },
  { id: '009', title: 'Ngày tuần', locked: false, completed: false, items: [{pt: 'O dia', vi: 'Ngày', emoji: '☀️', examplePt: 'Que dia é hoje?', exampleVi: 'Hôm nay là ngày mấy?'}] },
  { id: '010', title: 'Thời gian', locked: false, completed: false, items: [{pt: 'Hoje', vi: 'Hôm nay', emoji: '🔽', examplePt: 'Hoje está sol.', exampleVi: 'Hôm nay trời nắng.'}] },
];

// --- TỪ ĐIỂN CƠ BẢN (LOCAL DICTIONARY) ---
const INITIAL_DICTIONARY = {
  'eu': 'tôi', 'sou': 'là', 'estudante': 'học sinh',
  'você': 'bạn', 'é': 'là', 'meu': 'của tôi', 'amigo': 'bạn bè',
  'ele': 'anh ấy', 'está': 'đang/ở', 'feliz': 'vui vẻ',
  'ela': 'cô ấy', 'bonita': 'đẹp',
  'nós': 'chúng tôi', 'somos': 'là', 'do': 'từ', 'vietnã': 'Việt Nam',
  'eles': 'họ', 'estão': 'đang/ở', 'aqui': 'ở đây',
  'o': 'cái/người (mạo từ)', 'homem': 'đàn ông', 'alto': 'cao',
  'a': 'cái/người (mạo từ)', 'mulher': 'phụ nữ', 'inteligente': 'thông minh',
  'menino': 'cậu bé', 'brinca': 'chơi đùa', 'menina': 'cô bé', 'lê': 'đọc',
  'pai': 'ba/bố', 'médico': 'bác sĩ', 'mãe': 'mẹ', 'amo': 'yêu', 'minha': 'của tôi',
  'marido': 'chồng', 'este': 'đây', 'esposa': 'vợ', 'médica': 'bác sĩ',
  'filho': 'con trai', 'tem': 'có', 'dez': 'mười', 'anos': 'tuổi/năm',
  'filha': 'con gái', 'fofa': 'dễ thương', 'irmão': 'anh/em trai', 'tenho': 'có', 'um': 'một',
  'irmã': 'chị/em gái', 'mora': 'sống', 'avô': 'ông', 'sábio': 'thông thái',
  'avó': 'bà', 'casa': 'nhà', 'da': 'của',
  'olá': 'xin chào', 'tudo': 'mọi thứ', 'bem': 'tốt',
  'bom': 'tốt/chào', 'dia': 'ngày', 'todos': 'mọi người',
  'boa': 'tốt/chào', 'tarde': 'buổi chiều', 'senhor': 'ông/ngài',
  'noite': 'buổi tối', 'durma': 'ngủ',
  'qual': 'nào/gì', 'seu': 'của bạn', 'nome': 'tên',
  'obrigado': 'cảm ơn', 'muito': 'rất/nhiều',
  'de': 'của/từ', 'nada': 'không có gì',
  'por': 'vì/cho', 'favor': 'làm ơn', 'café': 'cà phê',
  'tchau': 'tạm biệt', 'até': 'đến/hẹn', 'logo': 'sớm',
  'escola': 'trường học', 'grande': 'lớn', 'país': 'đất nước',
  'gosto': 'thích', 'ler': 'đọc', 'carro': 'chiếc xe',
  'que': 'gì/nào', 'horas': 'giờ', 'são': 'là (số nhiều)',
  'hoje': 'hôm nay', 'sol': 'mặt trời/nắng'
};

export default function PortuGoApp() {
  // --- STATE ---
  const [currentScreen, setCurrentScreen] = useState('profiles'); // profiles, home, ranking, review_hub, review_play, lesson, completed, ai-chat
  const [currentUser, setCurrentUser] = useState(null);
  
  // Lesson State (Bài học mới)
  const [activeLesson, setActiveLesson] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [lessonPhase, setLessonPhase] = useState('flashcard'); 
  
  // User Stats
  const [streak, setStreak] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [xp, setXp] = useState(0);

  // AI Features State
  const [aiExamples, setAiExamples] = useState([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState('');
  
  // AI Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Review (Ôn Tập) State
  const [reviewItems, setReviewItems] = useState([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [sentenceError, setSentenceError] = useState(false);

  // Global Data State
  const [lessons, setLessons] = useState(LESSON_DATA);

  // Tra từ điển State
  const [wordCache, setWordCache] = useState(INITIAL_DICTIONARY);
  const [lookupWord, setLookupWord] = useState(null);

  // Scroll Chat to bottom
  useEffect(() => {
    if (currentScreen === 'ai-chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, currentScreen]);

  // Audio Playback
  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.85; // Đọc chậm cho người mới
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- ACTIONS: PROFILES & NAVIGATION ---
  const loginProfile = (profile) => {
    setCurrentUser(profile);
    setStreak(profile.streak);
    setXp(profile.xp);
    setCurrentScreen('home');
  };

  const logoutProfile = () => {
    setCurrentUser(null);
    setCurrentScreen('profiles');
  };

  // --- ACTIONS: LESSON (HỌC BÀI MỚI) ---
  const startLesson = (lesson) => {
    if (lesson.locked) return;
    setActiveLesson(lesson);
    setCurrentCardIndex(0);
    setLessonPhase('flashcard');
    setAiExamples([]);
    setCurrentScreen('lesson');
  };

  const checkFlashcard = () => {
    if (currentCardIndex < activeLesson.items.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setAiExamples([]);
    } else {
      completeLesson();
    }
  };

  const completeLesson = () => {
    const lessonIndex = lessons.findIndex(l => l.id === activeLesson.id);
    const newLessons = [...lessons];
    if (lessonIndex >= 0 && lessonIndex < newLessons.length - 1) {
      newLessons[lessonIndex + 1].locked = false; // Mở khóa bài tiếp theo
    }
    newLessons[lessonIndex].completed = true;
    setLessons(newLessons);
    setStreak(prev => prev + 1);
    setXp(prev => prev + 15);
    setCurrentScreen('completed');
  };

  // --- ACTIONS: TRA TỪ TRONG CÂU VÍ DỤ ---
  const handleWordClick = async (rawWord) => {
    const word = rawWord.toLowerCase();
    playAudio(rawWord); // Tự động phát âm khi bấm vào
    
    if (wordCache[word]) {
      setLookupWord({ text: rawWord, translation: wordCache[word], loading: false });
    } else {
      setLookupWord({ text: rawWord, translation: '', loading: true });
      try {
        const prompt = `Dịch một từ tiếng Bồ Đào Nha sang tiếng Việt: "${word}". Chỉ trả về nghĩa tiếng Việt (tối đa 3 từ), không giải thích.`;
        const payload = {
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: "Bạn là từ điển. Trả lời duy nhất nghĩa tiếng Việt." }] }
        };
        const data = await callGeminiAPI(payload);
        const trans = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Không rõ";
        
        setWordCache(prev => ({ ...prev, [word]: trans }));
        setLookupWord({ text: rawWord, translation: trans, loading: false });
      } catch (error) {
        setLookupWord({ text: rawWord, translation: "Lỗi kết nối", loading: false });
      }
    }
  };

  const renderClickableSentence = (sentence) => {
    // Tách câu thành các từ và dấu câu
    const parts = sentence.split(/([a-zA-ZáéíóúâêôãõçÁÉÍÓÚÂÊÔÃÕÇ]+)/);
    return parts.map((part, idx) => {
      if (/^[a-zA-ZáéíóúâêôãõçÁÉÍÓÚÂÊÔÃÕÇ]+$/.test(part)) {
        return (
          <span
            key={idx}
            onClick={() => handleWordClick(part)}
            className="underline decoration-dashed decoration-gray-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer rounded px-[2px] transition-colors"
          >
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  // --- ACTIONS: REVIEW (ÔN TẬP GHÉP CÂU) ---
  const openReviewHub = () => {
    setCurrentScreen('review_hub');
  };

  const startSentenceReview = () => {
    // Lấy các bài đã học, nếu chưa học gì thì lấy bài 1
    const availableLessons = lessons.filter(l => l.completed);
    const sourceLessons = availableLessons.length > 0 ? availableLessons : [lessons[0]];
    const allItems = sourceLessons.flatMap(l => l.items);
    
    // Chọn ngẫu nhiên 5 câu
    const shuffledItems = [...allItems].sort(() => 0.5 - Math.random()).slice(0, 5);
    
    if(shuffledItems.length > 0) {
      setReviewItems(shuffledItems);
      setCurrentReviewIndex(0);
      setupSentenceBuilder(shuffledItems[0]);
      setCurrentScreen('review_play');
    }
  };

  const setupSentenceBuilder = (item) => {
    const words = item.examplePt.split(' ').filter(w => w.trim() !== '');
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled.map((w, i) => ({ id: i, text: w })));
    setSelectedWords([]);
    setSentenceError(false);
  };

  const handleWordSelect = (wordObj) => {
    setShuffledWords(prev => prev.filter(w => w.id !== wordObj.id));
    setSelectedWords(prev => [...prev, wordObj]);
    playAudio(wordObj.text);
  };

  const handleWordDeselect = (wordObj) => {
    setSelectedWords(prev => prev.filter(w => w.id !== wordObj.id));
    setShuffledWords(prev => [...prev, wordObj]);
  };

  const checkSentence = () => {
    const item = reviewItems[currentReviewIndex];
    const userSentence = selectedWords.map(w => w.text).join(' ');
    const correctSentence = item.examplePt.trim();

    if (userSentence === correctSentence) {
      playAudio(correctSentence);
      setTimeout(() => {
        if (currentReviewIndex < reviewItems.length - 1) {
          setCurrentReviewIndex(prev => prev + 1);
          setupSentenceBuilder(reviewItems[currentReviewIndex + 1]);
        } else {
          // Hoàn thành ôn tập
          setXp(prev => prev + 10);
          setCurrentScreen('home'); // Tạm quay về home
        }
      }, 1000);
    } else {
      setSentenceError(true);
      setTimeout(() => setSentenceError(false), 500);
      setHearts(prev => Math.max(0, prev - 1));
    }
  };

  // --- ACTIONS: AI FEATURES ---
  const handleGenerateAiExamples = async () => {
    const item = activeLesson.items[currentCardIndex];
    setIsGeneratingAi(true);
    setAiError('');
    const prompt = `Tạo 2 câu giao tiếp thực tế tiếng Bồ Đào Nha (Brazil) cực kỳ ngắn gọn và đơn giản, sử dụng từ "${item.pt}" (nghĩa là: ${item.vi}). Trả về JSON: { "examples": [ {"pt": "...", "vi": "..."} ] }`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: "Bạn là giáo viên. Luôn trả về đúng định dạng JSON." }] },
      generationConfig: { responseMimeType: "application/json" }
    };
    try {
      const data = await callGeminiAPI(payload);
      const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonText) setAiExamples(JSON.parse(jsonText).examples || []);
    } catch (error) {
      setAiError("AI đang bận, vui lòng thử lại sau!");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const startAiChat = async () => {
    setCurrentScreen('ai-chat');
    setIsChatTyping(true);
    setChatMessages([]);
    const vocabList = activeLesson.items.map(i => i.pt).join(', ');
    const prompt = `Đóng vai người bạn Brazil. Học viên vừa học: ${vocabList}. Gửi 1 câu chào hỏi BĐN dùng ít nhất 1 từ vựng đó. BẮT BUỘC kèm dịch nghĩa Tiếng Việt trong ngoặc. (VD: Olá, tudo bem? (Xin chào, bạn khỏe không?))`;
    const payload = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
    try {
      const data = await callGeminiAPI(payload);
      setChatMessages([{ role: 'model', text: data.candidates?.[0]?.content?.parts?.[0]?.text || "Olá! (Xin chào!)" }]);
    } catch {
      setChatMessages([{ role: 'model', text: "Desculpe! (Xin lỗi!)" }]);
    } finally {
      setIsChatTyping(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatTyping) return;
    const userMessage = chatInput.trim();
    setChatInput('');
    const updatedMessages = [...chatMessages, { role: 'user', text: userMessage }];
    setChatMessages(updatedMessages);
    setIsChatTyping(true);
    
    const chatHistory = updatedMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    const payload = {
      contents: chatHistory,
      systemInstruction: { parts: [{ text: "Bạn là bạn Brazil. Luôn trả lời ngắn gọn tiếng BĐN, BẮT BUỘC kèm dịch Tiếng Việt trong ngoặc sau mỗi câu." }] }
    };
    try {
      const data = await callGeminiAPI(payload);
      setChatMessages(prev => [...prev, { role: 'model', text: data.candidates?.[0]?.content?.parts?.[0]?.text }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'model', text: "(Lỗi kết nối AI!)" }]);
    } finally {
      setIsChatTyping(false);
    }
  };


  // ============================================================================
  // RENDER: SCREENS
  // ============================================================================

  // 1. PROFILES (NETFLIX STYLE)
  const renderProfiles = () => (
    <div className="flex flex-col h-full bg-[#141414] text-white p-6 relative">
      <div className="absolute top-10 left-0 w-full text-center">
        <h1 className="text-4xl font-extrabold text-green-500 tracking-wider">PortuGo</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center mt-12 animate-in fade-in zoom-in duration-700">
        <h2 className="text-2xl font-light mb-8 text-gray-200">Ai đang học?</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 w-full max-w-[280px]">
          {INITIAL_PROFILES.slice(0, 4).map(profile => (
            <button 
              key={profile.id}
              onClick={() => loginProfile(profile)}
              className="flex flex-col items-center group transition-transform active:scale-95"
            >
              <div className={`w-28 h-28 rounded-md ${profile.bg} flex items-center justify-center text-5xl mb-3 border-2 border-transparent group-hover:border-white transition-all`}>
                {profile.avatar}
              </div>
              <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">{profile.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // 2. HOME (BẢN ĐỒ HỌC ĐẸP MẮT THEO UI MỚI)
  const renderHome = () => {
    // UI Palette based on reference image
    const cardColors = ['bg-[#ffebf0]', 'bg-[#eef2ff]', 'bg-[#fff5e6]', 'bg-[#f0fdf4]', 'bg-[#f5f3ff]'];
    const btnColors = ['bg-[#ff758c]', 'bg-[#6b8cff]', 'bg-[#ffb067]', 'bg-[#529681]', 'bg-[#a78bfa]'];

    const completedCount = lessons.filter(l => l.completed).length;

    return (
      <div className="flex flex-col h-full bg-[#fdfdfd] relative overflow-hidden">
        {/* Header - Reference image style */}
        <div className="flex justify-between items-center p-6 pt-10">
          <div>
            <p className="text-gray-500 font-medium text-sm mb-1 flex items-center">Xin chào <span className="ml-1">👋</span></p>
            <h1 className="text-[28px] font-extrabold text-gray-800 tracking-tight">{currentUser?.name}</h1>
          </div>
          <div className="bg-[#f0f0f0] p-1.5 rounded-full flex items-center space-x-2">
            <div className={`w-12 h-12 rounded-full ${currentUser?.bg} flex items-center justify-center text-2xl shadow-sm border-[3px] border-white`}>
              {currentUser?.avatar}
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="px-6 mb-8">
          <h2 className="text-xl font-extrabold text-gray-800 mb-4">Kế hoạch học tập</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#f4fbf7] rounded-[2rem] p-4 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm text-[#529681]"><Star className="w-5 h-5 fill-current"/></div>
              <span className="text-2xl font-extrabold text-gray-800">{lessons.length}</span>
              <span className="text-[11px] font-bold text-gray-500 mt-1">Tổng bài</span>
            </div>
            <div className="bg-[#fff4ed] rounded-[2rem] p-4 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm text-[#ffb067]"><CheckCircle2 className="w-5 h-5"/></div>
              <span className="text-2xl font-extrabold text-gray-800">{completedCount}</span>
              <span className="text-[11px] font-bold text-gray-500 mt-1">Đã học</span>
            </div>
            <div className="bg-[#fef2f4] rounded-[2rem] p-4 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm text-[#ff758c]"><Flame className="w-5 h-5 fill-current"/></div>
              <span className="text-2xl font-extrabold text-gray-800">{streak}</span>
              <span className="text-[11px] font-bold text-gray-500 mt-1">Chuỗi ngày</span>
            </div>
          </div>
        </div>

        {/* Course List (Widget Style) */}
        <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-4 hide-scrollbar">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-xl font-extrabold text-gray-800">Chủ đề của bạn</h2>
            <span className="text-sm font-bold text-gray-400">10 Chủ đề</span>
          </div>
          
          {lessons.map((lesson, index) => {
            const colorIdx = index % cardColors.length;
            const isCurrent = !lesson.locked && !lesson.completed;

            return (
              <div 
                key={lesson.id} 
                className={`relative w-full rounded-[2.5rem] p-5 flex items-center justify-between transition-all active:scale-[0.98] shadow-sm
                  ${lesson.completed ? 'bg-gray-100 opacity-80' : cardColors[colorIdx]}
                `}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-gray-800/40 mb-1 tracking-wide">
                    BÀI {lesson.id}
                  </span>
                  <h3 className={`text-[22px] font-extrabold tracking-tight ${lesson.completed ? 'text-gray-500' : 'text-gray-800'}`}>
                    {lesson.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-3">
                     <div className="flex -space-x-1">
                       <div className="w-7 h-7 rounded-full bg-white/70 border-2 border-white flex justify-center items-center text-xs shadow-sm">{lesson.items[0]?.emoji || '📚'}</div>
                       <div className="w-7 h-7 rounded-full bg-white/70 border-2 border-white flex justify-center items-center text-xs shadow-sm">{lesson.items[1]?.emoji || '📝'}</div>
                     </div>
                     <span className="text-[13px] font-bold text-gray-800/60">{lesson.items.length} từ vựng</span>
                  </div>
                </div>
                
                <button
                  onClick={() => startLesson(lesson)}
                  className={`w-[60px] h-[60px] rounded-full flex items-center justify-center text-white shadow-md transition-transform
                    ${lesson.completed ? 'bg-gray-300' : btnColors[colorIdx]}
                    ${isCurrent ? 'animate-bounce shadow-xl ring-4 ring-white/50' : ''}
                  `}
                >
                  {lesson.completed ? <CheckCircle2 className="w-7 h-7" /> : <ArrowLeft className="w-7 h-7 rotate-180" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 3. RANKING (UI THEO HÌNH MẪU - XANH MƯỚT)
  const renderRanking = () => {
    const rankingList = [...INITIAL_PROFILES].map(p => p.id === currentUser?.id ? {...p, xp} : p);
    rankingList.sort((a, b) => b.xp - a.xp);

    return (
      <div className="flex flex-col h-full bg-[#529681] relative overflow-hidden">
        {/* Header */}
        <div className="pt-12 pb-6 px-6 text-white text-center z-10 flex justify-between items-center">
           <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 bg-white/20 rounded-full flex justify-center items-center hover:bg-white/30 backdrop-blur-sm">
             <ArrowLeft className="w-5 h-5 text-white" />
           </button>
           <h2 className="text-3xl font-extrabold tracking-tight">Leaderboard</h2>
           <div className="w-10 h-10 bg-white/20 rounded-full flex justify-center items-center backdrop-blur-sm">
             <Trophy className="w-5 h-5 text-white" />
           </div>
        </div>

        {/* Toggle (Tuần/Tháng) */}
        <div className="flex justify-center px-6 mb-8">
           <div className="bg-white/20 rounded-full p-1.5 flex space-x-1 w-full max-w-[240px] backdrop-blur-md">
              <div className="bg-white text-[#529681] font-bold rounded-full py-2.5 flex-1 text-center text-sm shadow-sm">Hàng tuần</div>
              <div className="text-white/90 font-bold rounded-full py-2.5 flex-1 text-center text-sm">Hàng tháng</div>
           </div>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 pb-32 space-y-4 hide-scrollbar">
            {rankingList.map((user, index) => {
              // Custom colors based on rank from reference image
              let cardBg = "bg-white text-gray-800";
              if (index === 0) cardBg = "bg-[#ff758c] text-white"; // Red/Pink
              if (index === 1) cardBg = "bg-[#fff2dc] text-gray-800"; // Light Yellow
              if (index === 2) cardBg = "bg-[#ffb067] text-white"; // Orange

              return (
                <div 
                  key={user.id} 
                  className={`flex items-center p-4 rounded-[2rem] transition-all shadow-sm ${cardBg} ${user.id === currentUser?.id ? 'ring-4 ring-white/40 scale-[1.02]' : ''}`}
                >
                  <div className="w-12 flex justify-center items-center">
                    {index === 0 ? <Trophy className="w-7 h-7 text-yellow-300 fill-current drop-shadow-md"/> : 
                     index === 1 ? <Trophy className="w-7 h-7 text-gray-400 fill-current drop-shadow-md"/> : 
                     index === 2 ? <Trophy className="w-7 h-7 text-[#d48c46] fill-current drop-shadow-md"/> : 
                     <span className="font-extrabold text-2xl opacity-40">#{index + 1}</span>}
                  </div>
                  
                  <div className="flex-1 px-4">
                     <div className="flex justify-between items-end mb-1.5">
                       <p className="font-extrabold text-lg truncate max-w-[120px] tracking-tight">
                         {user.name}
                       </p>
                       <span className="font-black text-lg">{Math.round((user.xp/3000)*100)}%</span>
                     </div>
                     <div className="h-3.5 bg-black/10 rounded-full overflow-hidden w-full relative">
                        <div className="absolute top-0 left-0 h-full bg-white/50 rounded-full" style={{width: `${Math.min(100, (user.xp/3000)*100)}%`}}></div>
                     </div>
                  </div>

                  <div className="ml-2">
                    <div className={`w-12 h-12 rounded-full ${user.bg} flex items-center justify-center text-2xl shadow-sm border-[3px] border-white/50`}>
                      {user.avatar}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  // 4. REVIEW HUB (MÀN HÌNH CHỌN ÔN TẬP)
  const renderReviewHub = () => (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="bg-gradient-to-br from-blue-500 to-cyan-400 pt-16 pb-10 px-6 text-white text-center rounded-b-[2.5rem] shadow-lg z-10">
        <Dumbbell className="w-12 h-12 mx-auto mb-2 text-white" />
        <h2 className="text-3xl font-extrabold mb-1">Khu Vực Ôn Tập</h2>
        <p className="text-blue-100 text-sm">Luyện tập ghép câu để nhớ lâu hơn</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-28 flex flex-col space-y-6">
        <button 
          onClick={startSentenceReview}
          className="w-full bg-white border-2 border-gray-100 p-6 rounded-3xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-left flex items-center group"
        >
          <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <span className="text-3xl">🧩</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Ghép Từ Thành Câu</h3>
            <p className="text-sm text-gray-500 mt-1">+10 XP mỗi lượt</p>
          </div>
        </button>
        
        {/* Placeholder cho tính năng tương lai */}
        <button className="w-full bg-gray-50 border-2 border-gray-200 p-6 rounded-3xl text-left flex items-center opacity-70 cursor-not-allowed">
          <div className="w-16 h-16 bg-gray-200 text-gray-400 rounded-2xl flex items-center justify-center mr-4">
            <span className="text-3xl">🎙️</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-500">Luyện Phát Âm</h3>
            <p className="text-sm text-gray-400 mt-1">Sắp ra mắt</p>
          </div>
        </button>
      </div>
    </div>
  );

  // 5. REVIEW PLAY (GIAO DIỆN GHÉP CÂU CHUYÊN SÂU)
  const renderReviewPlay = () => {
    if (reviewItems.length === 0) return null;
    const item = reviewItems[currentReviewIndex];
    const progress = ((currentReviewIndex) / reviewItems.length) * 100;

    return (
      <div className="flex flex-col h-full bg-white relative">
        <div className="flex items-center p-4 space-x-4 bg-white z-10 pt-6">
          <button onClick={() => setCurrentScreen('review_hub')} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-7 h-7" />
          </button>
          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex items-center text-red-500 font-bold">
            <Heart className="w-7 h-7 fill-current" />
          </div>
        </div>

        <div className={`flex-1 p-6 flex flex-col animate-in slide-in-from-right duration-300 pb-32 ${sentenceError ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Dịch câu này sang Tiếng BĐN</h2>
          <div className="flex items-start space-x-3 mb-8">
            <div className="text-5xl">{item.emoji}</div>
            <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 shadow-sm relative">
              <div className="absolute -left-2 top-4 w-4 h-4 bg-gray-50 border-b-2 border-l-2 border-gray-100 rotate-45"></div>
              <p className="text-lg text-gray-800 font-semibold">{item.exampleVi}</p>
            </div>
          </div>

          <div className="min-h-[120px] border-b-2 border-gray-200 border-dashed mb-8 flex flex-wrap content-start gap-2 py-2">
            {selectedWords.map(word => (
              <button 
                key={word.id}
                onClick={() => handleWordDeselect(word)}
                className="bg-white border-2 border-gray-200 text-gray-800 font-bold px-4 py-3 rounded-xl shadow-sm hover:bg-gray-50 text-lg"
              >
                {word.text}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {shuffledWords.map(word => (
              <button 
                key={word.id}
                onClick={() => handleWordSelect(word)}
                className="bg-white border-2 border-gray-200 text-gray-800 font-bold px-4 py-3 rounded-xl shadow-sm hover:bg-gray-50 text-lg transition-transform active:scale-95"
              >
                {word.text}
              </button>
            ))}
            {selectedWords.map(word => (
               <div key={`ghost-${word.id}`} className="bg-gray-50 border-2 border-transparent px-4 py-3 rounded-xl text-transparent text-lg pointer-events-none">
                 {word.text}
               </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-100">
          <button 
            onClick={checkSentence}
            disabled={selectedWords.length === 0}
            className="w-full bg-blue-500 disabled:bg-gray-200 text-white font-extrabold text-xl py-4 rounded-2xl shadow-[0_6px_0_0_#2563eb] disabled:shadow-none active:translate-y-1.5 active:shadow-none transition-all uppercase"
          >
            Kiểm tra
          </button>
        </div>
      </div>
    );
  };

  // 6. LESSON PLAY (HỌC BÀI MỚI - FLASHCARD & AI)
  const renderLesson = () => {
    if (!activeLesson) return null;
    const item = activeLesson.items[currentCardIndex];
    const progress = ((currentCardIndex) / activeLesson.items.length) * 100;

    return (
      <div className="flex flex-col h-full bg-slate-50 relative">
        <div className="flex items-center p-4 space-x-4 bg-white z-10 pt-6">
          <button onClick={() => setCurrentScreen('home')} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-7 h-7" />
          </button>
          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex items-center text-red-500 font-bold">
            <Heart className="w-7 h-7 fill-current" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col pb-32 animate-in fade-in zoom-in duration-300">
           <h2 className="text-xl font-bold text-gray-500 mb-6 text-center">{activeLesson.title} • Từ mới</h2>
           
           <div className="w-full max-w-sm mx-auto bg-white border-2 border-gray-200 rounded-[2rem] p-8 shadow-sm flex flex-col items-center text-center">
             <div className="text-8xl mb-6">{item.emoji}</div>
             
             <div className="flex items-center space-x-4 mb-2">
               <h3 className="text-4xl font-extrabold text-gray-800">{item.pt}</h3>
               <button onClick={() => playAudio(item.pt)} className="bg-blue-100 text-blue-500 p-3 rounded-full hover:bg-blue-200 active:scale-95">
                 <Volume2 className="w-7 h-7" />
               </button>
             </div>
             
             <p className="text-2xl font-bold text-green-500 mb-8">{item.vi}</p>

             {/* Ví dụ mặc định */}
         <div className="w-full bg-gray-50 rounded-2xl p-5 text-left border border-gray-100">
           <div className="flex justify-between items-start">
             <p className="text-gray-800 font-semibold text-lg leading-relaxed">
               {renderClickableSentence(item.examplePt)}
             </p>
             <button onClick={() => playAudio(item.examplePt)} className="text-blue-400 ml-2 shrink-0">
               <Volume2 className="w-5 h-5" />
             </button>
           </div>
           <p className="text-gray-500 mt-1">{item.exampleVi}</p>
         </div>

         {/* Khối AI Examples */}
        {aiExamples.length > 0 && (
          <div className="w-full mt-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center text-xs font-bold text-purple-500 mb-1">
              <Sparkles className="w-3 h-3 mr-1" /> VÍ DỤ TỪ AI
            </div>
            {aiExamples.map((ex, idx) => (
              <div key={idx} className="w-full bg-purple-50 rounded-2xl p-4 text-left border border-purple-100">
                <div className="flex items-start justify-between">
                  <p className="text-gray-800 font-semibold leading-relaxed">
                    {renderClickableSentence(ex.pt)}
                  </p>
                  <button onClick={() => playAudio(ex.pt)} className="text-purple-400 hover:text-purple-600 ml-2 shrink-0">
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-1">{ex.vi}</p>
              </div>
            ))}
          </div>
        )}

        {/* Nút gọi AI */}
            {aiExamples.length === 0 && (
              <button 
                onClick={handleGenerateAiExamples}
                disabled={isGeneratingAi}
                className="mt-6 w-full py-3 px-4 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 font-bold rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang tạo...</>
                ) : (
                  <><Sparkles className="w-5 h-5 mr-2" /> Thêm ví dụ thực tế (AI) ✨</>
                )}
              </button>
            )}
           </div>
        </div>

        <div className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-100">
      <button 
        onClick={checkFlashcard}
        className="w-full bg-green-500 text-white font-extrabold text-xl py-4 rounded-2xl shadow-[0_6px_0_0_#16a34a] active:translate-y-1.5 active:shadow-none transition-all uppercase"
      >
        Tiếp tục
      </button>
    </div>

    {/* Modal Tra Từ Điển */}
    {lookupWord && (
      <div className="absolute inset-0 bg-black/40 z-50 flex flex-col justify-end animate-in fade-in duration-200">
        <div className="absolute inset-0" onClick={() => setLookupWord(null)}></div>
        <div className="bg-white rounded-t-[2.5rem] p-6 pb-12 shadow-2xl relative z-10 animate-in slide-in-from-bottom-8 duration-300">
          <button 
            onClick={() => setLookupWord(null)}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center mb-4 mt-2">
            <h3 className="text-4xl font-extrabold text-gray-800 mr-4">{lookupWord.text}</h3>
            <button 
              onClick={() => playAudio(lookupWord.text)}
              className="bg-blue-100 text-blue-500 p-3 rounded-full hover:bg-blue-200 active:scale-95 transition-transform"
            >
              <Volume2 className="w-7 h-7" />
            </button>
          </div>
          
          <div className="w-full h-px bg-gray-100 mb-5"></div>
          
          {lookupWord.loading ? (
            <div className="flex items-center text-purple-500 font-medium">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang dịch bằng AI...
            </div>
          ) : (
            <p className="text-2xl font-bold text-green-600 capitalize">
              {lookupWord.translation}
            </p>
          )}
        </div>
      </div>
    )}
  </div>
);
};

// 7. COMPLETED & AI CHAT (Giữ nguyên logic cũ, tinh chỉnh UI)
  const renderCompleted = () => (
    <div className="flex flex-col h-full bg-white items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-20 h-20 text-yellow-500" />
      </div>
      <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Quá đỉnh!</h2>
      <p className="text-gray-500 mb-8 text-lg">Bài học hoàn tất</p>
      
      <div className="flex gap-4 mb-12 w-full max-w-xs">
        <div className="flex-1 bg-orange-50 border-2 border-orange-200 rounded-2xl p-4">
          <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2 fill-current" />
          <p className="font-bold text-orange-600">{streak} Ngày</p>
        </div>
        <div className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
          <Star className="w-8 h-8 text-blue-500 mx-auto mb-2 fill-current" />
          <p className="font-bold text-blue-600">+15 XP</p>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-4">
        <button 
          onClick={startAiChat}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold text-lg py-4 rounded-2xl shadow-[0_6px_0_0_#581c87] active:translate-y-1.5 active:shadow-none transition-all flex items-center justify-center uppercase"
        >
          <Bot className="w-6 h-6 mr-2" /> Luyện nói AI ✨
        </button>
        <button 
          onClick={() => setCurrentScreen('home')}
          className="w-full bg-white border-2 border-gray-200 text-gray-600 font-extrabold text-lg py-4 rounded-2xl active:bg-gray-50 transition-all uppercase"
        >
          Trở về
        </button>
      </div>
    </div>
  );

  const renderAiChat = () => (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex items-center p-4 space-x-4 bg-white border-b border-gray-200 z-10 pt-6">
        <button onClick={() => setCurrentScreen('home')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-7 h-7" />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-gray-800 flex items-center text-lg">
            <Bot className="w-6 h-6 text-purple-500 mr-2" /> Gia sư AI Brazil ✨
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-24">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-green-500 text-white rounded-br-none shadow-md' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
              <p className="text-[15px] leading-relaxed">{msg.text}</p>
              {msg.role === 'model' && (
                 <button onClick={() => playAudio(msg.text.split('(')[0])} className="mt-3 text-purple-500 bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 flex items-center text-sm font-bold w-fit transition-colors">
                   <Volume2 className="w-4 h-4 mr-1.5" /> Nghe đọc
                 </button>
              )}
            </div>
          </div>
        ))}

        {isChatTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-5 rounded-2xl rounded-bl-none shadow-sm flex space-x-2">
              <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-100 pb-6">
        <form onSubmit={(e) => { e.preventDefault(); sendChatMessage(); }} className="flex items-center space-x-3">
          <input 
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-gray-100 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-400 outline-none text-[15px]"
            disabled={isChatTyping}
          />
          <button 
            type="submit"
            disabled={!chatInput.trim() || isChatTyping}
            className="bg-purple-500 text-white p-4 rounded-2xl hover:bg-purple-600 disabled:opacity-50 transition-colors shadow-md"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER (WRAPPER iPHONE SCALE)
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center font-sans sm:py-8">
      
      {/* Vỏ bọc giả lập iPhone 14/15 Pro Max */}
      <div className="w-full h-[100dvh] sm:w-[430px] sm:h-[932px] bg-white sm:rounded-[3.5rem] overflow-hidden relative sm:border-[14px] border-gray-950 shadow-2xl flex flex-col ring-1 ring-gray-800">
        
        {/* Dynamic Screens */}
        {currentScreen === 'profiles' && renderProfiles()}
        {currentScreen === 'home' && renderHome()}
        {currentScreen === 'ranking' && renderRanking()}
        {currentScreen === 'review_hub' && renderReviewHub()}
        {currentScreen === 'review_play' && renderReviewPlay()}
        {currentScreen === 'lesson' && renderLesson()}
        {currentScreen === 'completed' && renderCompleted()}
        {currentScreen === 'ai-chat' && renderAiChat()}

        {/* Thanh điều hướng nổi (Floating Bottom Nav - Dark Theme) */}
        {(currentScreen === 'home' || currentScreen === 'ranking' || currentScreen === 'review_hub') && (
          <div className="absolute bottom-6 left-6 right-6 bg-[#1f1f21] rounded-[2.5rem] flex justify-between items-center px-4 py-3 z-30 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
            <button 
              onClick={() => setCurrentScreen('home')}
              className={`flex flex-col items-center p-3 rounded-full transition-all ${currentScreen === 'home' ? 'text-white bg-white/20' : 'text-gray-500 hover:text-white'}`}
            >
              <HomeIcon className={`w-6 h-6 ${currentScreen === 'home' ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={openReviewHub}
              className={`flex flex-col items-center p-3 rounded-full transition-all ${currentScreen === 'review_hub' ? 'text-white bg-white/20' : 'text-gray-500 hover:text-white'}`}
            >
              <Dumbbell className={`w-6 h-6 ${currentScreen === 'review_hub' ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={() => setCurrentScreen('ranking')}
              className={`flex flex-col items-center p-3 rounded-full transition-all ${currentScreen === 'ranking' ? 'text-white bg-white/20' : 'text-gray-500 hover:text-white'}`}
            >
              <Trophy className={`w-6 h-6 ${currentScreen === 'ranking' ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={logoutProfile}
              className="flex flex-col items-center p-3 rounded-full text-gray-500 hover:text-[#ff758c] transition-all"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* CSS cho hiệu ứng rung khi chọn sai từ ghép câu */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px) rotate(-2deg); }
            50% { transform: translateX(8px) rotate(2deg); }
            75% { transform: translateX(-8px) rotate(-2deg); }
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}} />
      </div>
    </div>
  );
}