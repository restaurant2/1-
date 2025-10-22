/*!
 * © 2025 חומוס גרגירים (Hummus Gargririm). All rights reserved.
 * License: Proprietary. This build and its assets are the intellectual property of חומוס גרגירים.
 * Unauthorized copying or distribution is strictly prohibited.
 */
import { createElement as h, Fragment, useEffect, useMemo, useRef, useState, useContext, createContext } from 'https://esm.sh/react@18';
import { createRoot } from 'https://esm.sh/react-dom@18/client';
const { motion, AnimatePresence } = window['framer-motion'];
const { initReactI18next, useTranslation } = window['reactI18next'];
const LOGO_URL = './assets/logo.png';
const THEME = { bg:'#0B0B0B', gold:'#D4AF37', accent:'#E67E22', text:'#F8F8F8', subtle:'#b59d5b' };

// i18n setup
const resources = {
  ar: { translation: {
    splashGreeting: "مرحبًا بكم في حُمُّص جَرْגِירים – تجربة ذواقة لا مثيل لها!",
    chooseLanguage: "اختر لغتك",
    languages: { ar: "العربية", he: "עברית", en: "English" },
    categories: { drinks: "المشروبات", appetizers: "المقبلات", mains: "الأطباق الرئيسية" },
    addToCart: "أضف إلى السلة",
    inCart: "في السلة",
    cart: "السلة",
    empty: "السلة فارغة",
    total: "الإجمالي",
    checkout: "إرسال الطلب",
    currency: "₪",
  } },
  he: { translation: {
    splashGreeting: "ברוכים הבאים לחומוס גרגירים – חוויה קולינרית שאין כמוה!",
    chooseLanguage: "בחר את שפתך",
    languages: { ar: "العربية", he: "עברית", en: "English" },
    categories: { drinks: "שתייה", appetizers: "מנות פתיחה", mains: "מנות עיקריות" },
    addToCart: "הוסף לעגלה",
    inCart: "בעגלה",
    cart: "עגלת קניות",
    empty: "העגלה ריקה",
    total: "סך הכל",
    checkout: "שלח הזמנה",
    currency: "₪",
  } },
  en: { translation: {
    splashGreeting: "Welcome to Hummus Gargririm – a culinary experience like no other!",
    chooseLanguage: "Choose Your Language",
    languages: { ar: "العربية", he: "עברית", en: "English" },
    categories: { drinks: "Drinks", appetizers: "Appetizers", mains: "Main Dishes" },
    addToCart: "Add to Cart",
    inCart: "In Cart",
    cart: "Cart",
    empty: "Your cart is empty",
    total: "Total",
    checkout: "Place Order",
    currency: "₪",
  } },
};

// initialize i18n
window.i18next.use(initReactI18next).init({
  resources, lng: 'he', fallbackLng: 'he', interpolation: { escapeValue: false }
});

// Sample menu placeholders (replace later)
const SAMPLE_MENU = {
  he: {
    drinks: [{ id:'d1', name:'לימונדה עדינה', desc:'לימון טרי ונענע', price:12 },
             { id:'d2', name:'תה נענע', desc:'תה ירוק עם נענע טרייה', price:10 }],
    appetizers: [{ id:'a1', name:'חומוס קלאסי', desc:'עם שמן זית ופפריקה', price:22 },
                 { id:'a2', name:'סלט ירקות קצוץ', desc:'רענן וקליל', price:18 }],
    mains: [{ id:'m1', name:'מסח׳אן חומוס', desc:'מנה ביתית מפנקת', price:38 },
            { id:'m2', name:'פלאפל', desc:'כדורים פריכים חמים', price:28 }],
  },
  ar: {
    drinks: [{ id:'d1', name:'ليمونادة منعشة', desc:'ليمون طازج مع نعناع', price:12 },
             { id:'d2', name:'شاي نعناع', desc:'شاي أخضر مع نعناع طازج', price:10 }],
    appetizers: [{ id:'a1', name:'حمص كلاسيكي', desc:'مع زيت زيتون وبابريكا', price:22 },
                 { id:'a2', name:'سلطة خضار مفرومة', desc:'منعشة وخفيفة', price:18 }],
    mains: [{ id:'m1', name:'مسخّن حمص', desc:'وجبة بيتية دافئة', price:38 },
            { id:'m2', name:'فلافل', desc:'كرات مقرمشة ساخنة', price:28 }],
  },
  en: {
    drinks: [{ id:'d1', name:'Fresh Lemonade', desc:'Lemon & mint', price:12 },
             { id:'d2', name:'Mint Tea', desc:'Green tea with fresh mint', price:10 }],
    appetizers: [{ id:'a1', name:'Classic Hummus', desc:'Olive oil & paprika', price:22 },
                 { id:'a2', name:'Chopped Salad', desc:'Fresh and light', price:18 }],
    mains: [{ id:'m1', name:'Hummus Musakhan', desc:'Comforting home style', price:38 },
            { id:'m2', name:'Falafel', desc:'Crispy hot balls', price:28 }],
  },
};

// Cart state
const CartContext = createContext(null);
function CartProvider({ children }) {
  const [items, setItems] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('qrRoyalCart')) || {}; }
    catch { return {}; }
  });
  React.useEffect(() => localStorage.setItem('qrRoyalCart', JSON.stringify(items)), [items]);
  const add = (p) => setItems(prev => { const n={...prev}; n[p.id] = n[p.id]?{...n[p.id], qty:n[p.id].qty+1}:{...p, qty:1}; return n; });
  const dec = (id) => setItems(prev => { const n={...prev}; if(!n[id]) return prev; n[id].qty-=1; if(n[id].qty<=0) delete n[id]; return n; });
  const remove = (id) => setItems(prev => { const n={...prev}; delete n[id]; return n; });
  const total = React.useMemo(() => Object.values(items).reduce((s,p)=>s+p.price*p.qty,0), [items]);
  return h(CartContext.Provider, { value:{items, add, dec, remove, total} }, children);
}
function useCart() { return useContext(CartContext); }

// UI helpers
const Card = (props) => h('div', { className:'card p-4 md:p-6 rounded-3xl' }, props.children);
const Button = ({ children, onClick }) => h('button', { onClick, className:'btn' }, children);

// Splash
function Splash({ onDone }) {
  const { t } = useTranslation();
  React.useEffect(() => { const id=setTimeout(onDone, 5000); return () => clearTimeout(id); }, [onDone]);
  return h(AnimatePresence, null,
    h(motion.div, { initial:{opacity:0}, animate:{opacity:1}, exit:{opacity:0},
      className:'fixed inset-0 flex items-center justify-center', style:{background:THEME.bg} },
      h('div', { className:'flex flex-col items-center text-center px-6' },
        h(motion.img, { src:LOGO_URL, alt:'logo', className:'w-[360px] max-w-[70vw]',
          initial:{scale:.9, opacity:0}, animate:{scale:1, opacity:1}, transition:{duration:1.1} }),
        h(motion.h1, { className:'mt-8 text-2xl md:text-3xl font-semibold glow-gold', style:{color:THEME.gold},
          initial:{y:10, opacity:0}, animate:{y:0, opacity:1}, transition:{delay:.6, duration:1} }, t('splashGreeting'))
      ),
      h('div', { className:'absolute inset-x-0 bottom-0 h-32', style:{background:'radial-gradient(60% 30% at 50% 120%, rgba(212,175,55,.25), transparent)'} })
    )
  );
}

// Language gate
function LanguageGate({ onPick }) {
  const { t, i18n } = useTranslation();
  const dir = (i18n.language==='ar'||i18n.language==='he')?'rtl':'ltr';
  return h('div', { className:'min-h-screen flex items-center justify-center px-6 relative', style:{background:THEME.bg}, dir },
    h('div', { className:'absolute inset-0 pointer-events-none', style:{background:'radial-gradient(40% 25% at 50% 10%, rgba(212,175,55,.15), transparent), radial-gradient(30% 20% at 80% 80%, rgba(230,126,34,.10), transparent)'} }),
    h('div', { className:'card relative z-10 max-w-2xl w-full text-center' },
      h('img', { src:LOGO_URL, className:'mx-auto w-44', alt:'logo' }),
      h('h2', { className:'mt-6 text-2xl md:text-3xl font-semibold' }, t('chooseLanguage')),
      h('div', { className:'mt-8 flex flex-wrap items-center justify-center gap-4' },
        h(Button, { onClick:()=>onPick('he') }, '🇮🇱 ', t('languages.he')),
        h(Button, { onClick:()=>onPick('ar') }, '🇸🇦 ', t('languages.ar')),
        h(Button, { onClick:()=>onPick('en') }, '🇬🇧 ', t('languages.en')),
      ),
      h('p', { className:'mt-4 opacity-70' }, '🌐 Multi-language Menu')
    )
  );
}

// Menu view
function MenuView({ lang }) {
  const { t } = useTranslation();
  const { add } = useCart();
  const data = SAMPLE_MENU[lang];
  const Category = ({ id, title, items }) => h('section', { id, className:'mt-10' },
    h('h3', { className:'text-xl md:text-2xl font-semibold mb-4', style:{color:THEME.gold} }, title),
    h('div', { className:'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5' },
      items.map((p) => h(motion.div, { key:p.id, initial:{y:12,opacity:0}, animate:{y:0,opacity:1} },
        h(Card, null,
          h('div', { className:'flex flex-col gap-2' },
            h('div', { className:'flex items-center justify-between' },
              h('h4', { className:'text-lg font-semibold' }, p.name),
              h('span', { className:'text-sm font-medium', style:{color:THEME.gold} }, p.price,' ', t('currency'))
            ),
            h('p', { className:'opacity-80' }, p.desc),
            h('div', { className:'pt-3' }, h(Button, { onClick:()=>add(p)}, '🛒 ', t('addToCart')))
          )
        )
      ))
  );
  return h('div', { className:'container mx-auto px-6 pb-28' },
    h(Category, { id:'drinks', title:t('categories.drinks'), items:data.drinks }),
    h(Category, { id:'appetizers', title:t('categories.appetizers'), items:data.appetizers }),
    h(Category, { id:'mains', title:t('categories.mains'), items:data.mains }),
  );
}

// Cart panel
function CartPanel() {
  const { t } = useTranslation();
  const { items, add, dec, remove, total } = useCart();
  const list = Object.values(items);
  return h('div', { className:'fixed right-4 bottom-4 z-50' },
    h('details', { className:'group' },
      h('summary', { className:'list-none' },
        h('button', { className:'btn px-6 py-3' }, '🛒 ', t('cart'), ' (', list.reduce((s,p)=>s+p.qty,0), ')')
      ),
      h('div', { className:'mt-3 w-[92vw] max-w-md rounded-3xl p-4 md:p-5 border shadow-2xl', style:{background:'rgba(12,12,12,.96)', borderColor:'rgba(181,157,91,.25)'} },
        list.length===0 ? h('p', { className:'opacity-80' }, t('empty')) :
        h('div', { className:'flex flex-col gap-3' },
          list.map((p)=> h('div', { key:p.id, className:'flex items-start justify-between gap-3 py-2 border-b', style:{borderColor:'rgba(181,157,91,.25)'} },
            h('div', null,
              h('div', { className:'font-semibold' }, p.name),
              h('div', { className:'text-sm opacity-80' }, p.price, ' ₪')
            ),
            h('div', { className:'flex items-center gap-2' },
              h('button', { className:'p-2 rounded-full border', style:{borderColor:'rgba(181,157,91,.5)'}, onClick:()=>dec(p.id)}, '−'),
              h('span', { className:'min-w-[2ch] text-center' }, p.qty),
              h('button', { className:'p-2 rounded-full border', style:{borderColor:'rgba(181,157,91,.5)'}, onClick:()=>add(p)}, '+'),
              h('button', { className:'p-2 rounded-full border', style:{borderColor:'rgba(181,157,91,.5)'}, onClick:()=>remove(p.id)}, '✕')
            )
          )),
          h('div', { className:'flex items-center justify-between font-semibold pt-2' },
            h('span', null, t('total')),
            h('span', { style:{color:THEME.gold} }, total, ' ₪')
          ),
          h('button', { className:'btn w-full mt-1' }, t('checkout'))
        )
      )
    )
  );
}

// Navbar
function Navbar({ lang, onLangChange }) {
  const dir = (lang==='ar'||lang==='he')?'rtl':'ltr';
  return h('div', { className:'sticky top-0 z-40 backdrop-blur border-b border-subtle', style:{background:'rgba(10,10,10,.6)'}, dir },
    h('div', { className:'container mx-auto flex items-center justify-between px-6 py-3' },
      h('div', { className:'flex items-center gap-3' },
        h('img', { src:LOGO_URL, alt:'logo', className:'w-10 h-10 object-contain' }),
        h('div', { className:'font-semibold', style:{color:THEME.gold} }, 'חומוס גרגירים')
      ),
      h('select', { value:lang, onChange:(e)=>onLangChange(e.target.value), className:'rounded-full px-3 py-1 bg-transparent border', style:{color:'#F8F8F8', borderColor:'#b59d5b'} },
        h('option', { value:'he' }, 'עברית'),
        h('option', { value:'ar' }, 'العربية'),
        h('option', { value:'en' }, 'English'),
      )
    )
  );
}

// Ambient music (plays after first interaction)
function AmbientMusic({ playTrigger }) {
  const ref = React.useRef(null);
  React.useEffect(() => { if(playTrigger && ref.current) { ref.current.volume=0.25; ref.current.play().catch(()=>{}); } }, [playTrigger]);
  return h('audio', { ref, loop:true },
    h('source', { src:'https://cdn.pixabay.com/audio/2022/03/15/audio_d1d5a1e36e.mp3', type:'audio/mpeg' })
  );
}

// Root App
function App() {
  const [showSplash, setShowSplash] = React.useState(true);
  const [lang, setLang] = React.useState('he');
  const [picked, setPicked] = React.useState(false);
  React.useEffect(()=>{ document.documentElement.style.backgroundColor=THEME.bg; document.documentElement.style.color=THEME.text; }, []);
  const handlePick = (lng) => { window.i18next.changeLanguage(lng); setLang(lng); setPicked(true); };
  const dir = (lang==='ar'||lang==='he')?'rtl':'ltr';
  return h(CartProvider, null,
    h('div', { dir, style:{minHeight:'100vh', background:THEME.bg} },
      h(AnimatePresence, null, showSplash && h(Splash, { onDone:()=>setShowSplash(false) })),
      (!showSplash && !picked) ? h(LanguageGate, { onPick: handlePick }) : null,
      (!showSplash && picked) ? h(Fragment, null,
        h(Navbar, { lang, onLangChange:handlePick }),
        h('main', { className:'pt-6' }, h(MenuView, { lang }), h(CartPanel, null)),
        h(AmbientMusic, { playTrigger: picked })
      ) : null
    )
  );
}

createRoot(document.getElementById('root')).render(h(App));
