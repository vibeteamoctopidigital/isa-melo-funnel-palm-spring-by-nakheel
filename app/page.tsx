'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

/* ============================================================
   CONFIG – edit these lines for each deployment
   ============================================================ */
const CONFIG = {
  agentName: 'Isadora Melo',
  whatsappNumber: '971504793112',
  ghlWebhookUrl: 'https://services.leadconnectorhq.com/hooks/iGbC817rCzAfj7HtPYRs/webhook-trigger/OLjYU2M7uy4NrhraIdkq',
  redirectUrl: '',             // GHL page after form (empty = open WhatsApp)
  redirectSeconds: 6,
}

/* ============================================================
   TYPES
   ============================================================ */
type Lang = 'en' | 'pt' | 'es'
type Answers = Record<string, string>

const LOOKING = ['Townhouse, 3 to 4 bedrooms', 'Villa, 4 to 5 bedrooms', 'Apartment'] as const
const SIZES = ['Studio', 'One bedroom', 'Two bedrooms', 'More'] as const

/* ============================================================
   TRANSLATIONS  (all three languages, from the reference HTML)
   ============================================================ */
const T = {
  en: {
    htmlLang: 'en',
    langName: 'English',
    ui: {
      navCta: 'Get the unit list',
      heroEyebrow: 'Nakheel · Jebel Ali, Dubai',
      heroKicker: 'Townhouses & villas by Nakheel',
      heroLede: 'Family homes on the mainland, right beside Palm Jebel Ali, minutes from Sheikh Zayed Road.',
      heroLedeBold: 'Launch pricing from AED 1,800 per square foot.',
      priceLabel: 'Starting prices',
      priceMain: 'AED 3.8M–9M',
      priceSub: 'USD 1.03M–2.45M',
      heroCta: 'See the units',
      heroNote: 'One question, then your details. Takes about thirty seconds.',
      capAerial: 'Palm Springs sits on the mainland between Palm Jebel Ali and Sheikh Zayed Road.',
      f1: 'Launch price per square foot, about USD 490',
      f2: 'Bedrooms, across townhouses and villas',
      f3: 'Annual property tax in Dubai',
      f4: 'Golden Visa threshold, cleared by every unit here',
      homesLabel: 'The homes',
      homesTitle: 'Built for families, not for a rental yield spreadsheet',
      homesLede: 'Two formats at launch. Both sit inside the same master plan, with the streets, parks and retail drawn before the houses.',
      h1t: 'Townhouses', h1b: '3 and 4 bedrooms',
      h1d: 'The entry into the community, and the first format to sell out in comparable Nakheel launches.',
      h2t: 'Villas', h2b: '4 and 5 bedrooms',
      h2d: 'Detached homes on their own plot, with private garden and pool space.',
      capVilla: 'A delivered Nakheel villa at Jebel Ali Village, the neighbouring community. Official Palm Springs renders come with the launch pack.',
      capCommunity: 'Parks and pools at Jebel Ali Village, by the same developer.',
      locLabel: 'The location',
      locTitle: 'On the mainland, beside the second palm',
      locLede: 'Palm Jebel Ali is twice the size of Palm Jumeirah and is being built right across the water. Palm Springs is the mainland address next to it, which is what keeps the entry price where it is.',
      near: [
        ['Palm Jebel Ali', 'Across the water'],
        ['Sheikh Zayed Road', 'Exits D53 and D86'],
        ['Jebel Ali Port', "Dubai's main industrial and logistics hub"],
        ['Jebel Ali Wildlife Sanctuary', 'Protected coastline to the west'],
      ] as [string, string][],
      capPalm: 'Palm Jebel Ali, by Nakheel. Sixteen fronds and over 90 km of beachfront, now under construction.',
      urgencyBold: 'The first phase of Palm Jebel Ali villas sold out in hours.',
      urgencyRest: ' Nakheel releases Palm Springs in phases too, and the list goes to registered buyers before the open sale.',
      askLabel: 'Priority list',
      askTitle: 'Tell me what you are after',
      askLede: 'One question about the home, then your details. I match it against what is actually available and send the list over, with the payment plan.',
      role: 'Property Consultant',
      footNote: "Palm Springs by Nakheel. Prices, unit mix and payment plan are pre-launch figures and are confirmed by the developer's official launch documents. Images of Jebel Ali Village and Palm Jebel Ali are shown as examples of the developer's work, not as Palm Springs. Your details are used only to prepare and send your shortlist.",
    },
    q: { looking: 'What are you looking for?', size: 'Which apartment size?', contact: 'Where should I send the list?' },
    note: { looking: 'Pick the closest one. It only sets where I start.', size: 'Apartments sit outside the Palm Springs house release, so I pull these from nearby Nakheel stock.', contact: 'I prepare the list and send it to you.' },
    o: { 'Townhouse, 3 to 4 bedrooms': 'Townhouses', 'Villa, 4 to 5 bedrooms': 'Villas', 'Apartment': 'Apartment', 'Studio': 'Studio', 'One bedroom': 'One bed', 'Two bedrooms': 'Two bed', 'More': 'More' } as Record<string, string>,
    sub: { 'Townhouse, 3 to 4 bedrooms': '3 to 4 bedroom', 'Villa, 4 to 5 bedrooms': '4 to 5 bedroom' } as Record<string, string>,
    f: { first: 'First name', last: 'Last name', email: 'Email', phone: 'WhatsApp number', firstPh: 'First name', lastPh: 'Last name', emailPh: 'you@example.com', phonePh: '50 123 4567' },
    b: { back: 'Back', submit: 'Get my shortlist', sending: 'Sending…', wa: 'Continue on WhatsApp', go: 'Continue' },
    e: { first: 'Please enter your first name.', email: 'Please check your email address.', phone: 'Please enter a valid WhatsApp number.' },
    consent: 'Used only to prepare and send your Palm Springs shortlist. No cold calls, never shared with third parties.',
    stepOf: 'Step {n} of {t}',
    complete: 'Complete',
    done: { title: 'Thanks, {name}. I have what I need.', sub: 'Your answers come through with you, so we start from the shortlist.', countdown: 'Continuing in {s}s…', fallback: 'If nothing opened, use the button above.' },
    recap: { looking: 'Looking for', size: 'Size' },
    gate: { title: 'Choose your language', sub: 'United States · Canada' },
    langAria: 'Choose language',
  },
  pt: {
    htmlLang: 'pt-BR',
    langName: 'Português',
    ui: {
      navCta: 'Quero a lista de unidades',
      heroEyebrow: 'Nakheel · Jebel Ali, Dubai',
      heroKicker: 'Townhouses e villas da Nakheel',
      heroLede: 'Casas de família em Jebel Ali, de frente para a Palm Jebel Ali e a minutos da Sheikh Zayed Road.',
      heroLedeBold: 'Preço de lançamento a partir de AED 1.800 por pé quadrado.',
      priceLabel: 'Preços a partir de',
      priceMain: 'AED 3.8M–9M',
      priceSub: 'USD 1.03M–2.45M',
      heroCta: 'Ver as unidades',
      heroNote: 'Uma pergunta e os seus dados. Leva uns trinta segundos.',
      capAerial: 'O Palm Springs fica no continente, entre a Palm Jebel Ali e a Sheikh Zayed Road.',
      f1: 'Preço de lançamento por pé quadrado, cerca de USD 490',
      f2: 'Quartos, entre townhouses e villas',
      f3: 'Imposto anual sobre o imóvel em Dubai',
      f4: 'Valor do Golden Visa, superado por todas as unidades daqui',
      homesLabel: 'As casas',
      homesTitle: 'Feitas para família, não para planilha de rentabilidade',
      homesLede: 'Dois formatos no lançamento. Os dois dentro do mesmo masterplan, com ruas, parques e comércio desenhados antes das casas.',
      h1t: 'Townhouses', h1b: '3 e 4 quartos',
      h1d: 'A porta de entrada da comunidade, e o formato que esgota primeiro em lançamentos parecidos da Nakheel.',
      h2t: 'Villas', h2b: '4 e 5 quartos',
      h2d: 'Casas isoladas em terreno próprio, com espaço para jardim e piscina privativos.',
      capVilla: 'Villa já entregue da Nakheel no Jebel Ali Village, a comunidade vizinha. As imagens oficiais do Palm Springs saem com o material de lançamento.',
      capCommunity: 'Parques e piscinas do Jebel Ali Village, da mesma incorporadora.',
      locLabel: 'A localização',
      locTitle: 'No continente, ao lado da segunda palmeira',
      locLede: 'A Palm Jebel Ali tem o dobro do tamanho da Palm Jumeirah e está sendo construída do outro lado da água. O Palm Springs é o endereço em terra firme ao lado dela, e é isso que segura o preço de entrada onde está.',
      near: [
        ['Palm Jebel Ali', 'Do outro lado da água'],
        ['Sheikh Zayed Road', 'Saídas D53 e D86'],
        ['Porto de Jebel Ali', 'Principal polo industrial e logístico de Dubai'],
        ['Reserva de Jebel Ali', 'Costa protegida a oeste'],
      ] as [string, string][],
      capPalm: 'Palm Jebel Ali, da Nakheel. Dezesseis fronds e mais de 90 km de orla, em construção.',
      urgencyBold: 'A primeira fase das villas da Palm Jebel Ali esgotou em poucas horas.',
      urgencyRest: ' A Nakheel lança o Palm Springs também por fases, e a lista vai para quem está cadastrado antes da venda aberta.',
      askLabel: 'Lista prioritária',
      askTitle: 'Me diga o que você procura',
      askLede: 'Uma pergunta sobre o imóvel e os seus dados. Eu cruzo com o que está realmente disponível e mando a lista, com o plano de pagamento.',
      role: 'Consultora Imobiliária',
      footNote: 'Palm Springs by Nakheel. Preços, tipologias e plano de pagamento são números de pré-lançamento e são confirmados pelos documentos oficiais da incorporadora. As imagens do Jebel Ali Village e da Palm Jebel Ali aparecem como exemplo do trabalho da incorporadora, não como o Palm Springs. Seus dados são usados apenas para preparar e enviar a sua seleção.',
    },
    q: { looking: 'O que você procura?', size: 'Qual tamanho de apartamento?', contact: 'Para onde eu mando a lista?' },
    note: { looking: 'Escolha a opção mais próxima. Isso só define por onde eu começo.', size: 'Apartamento não entra no lançamento de casas do Palm Springs, então eu busco no estoque da Nakheel ali perto.', contact: 'Eu preparo a lista e te mando.' },
    o: { 'Townhouse, 3 to 4 bedrooms': 'Townhouses', 'Villa, 4 to 5 bedrooms': 'Villas', 'Apartment': 'Apartamento', 'Studio': 'Studio', 'One bedroom': '1 quarto', 'Two bedrooms': '2 quartos', 'More': 'Mais' } as Record<string, string>,
    sub: { 'Townhouse, 3 to 4 bedrooms': '3 a 4 quartos', 'Villa, 4 to 5 bedrooms': '4 a 5 quartos' } as Record<string, string>,
    f: { first: 'Nome', last: 'Sobrenome', email: 'E-mail', phone: 'Número de WhatsApp', firstPh: 'Nome', lastPh: 'Sobrenome', emailPh: 'voce@exemplo.com', phonePh: '11 91234 5678' },
    b: { back: 'Voltar', submit: 'Quero minha seleção', sending: 'Enviando…', wa: 'Continuar no WhatsApp', go: 'Continuar' },
    e: { first: 'Digite o seu nome.', email: 'Confira o seu e-mail.', phone: 'Digite um número de WhatsApp válido.' },
    consent: 'Usado apenas para preparar e enviar a sua seleção do Palm Springs. Sem ligação de vendedor e sem compartilhar com terceiros.',
    stepOf: 'Passo {n} de {t}',
    complete: 'Concluído',
    done: { title: 'Obrigada, {name}. Tenho o que preciso.', sub: 'As suas respostas vão junto, para já começarmos pela seleção.', countdown: 'Continuando em {s}s…', fallback: 'Se nada abrir, use o botão acima.' },
    recap: { looking: 'Procura', size: 'Tamanho' },
    gate: { title: 'Escolha seu idioma', sub: 'Brasil' },
    langAria: 'Escolher idioma',
  },
  es: {
    htmlLang: 'es',
    langName: 'Español',
    ui: {
      navCta: 'Quiero la lista de unidades',
      heroEyebrow: 'Nakheel · Jebel Ali, Dubái',
      heroKicker: 'Townhouses y villas de Nakheel',
      heroLede: 'Casas de familia en tierra firme, junto a Palm Jebel Ali y a minutos de Sheikh Zayed Road.',
      heroLedeBold: 'Precio de lanzamiento desde AED 1.800 por pie cuadrado.',
      priceLabel: 'Precios desde',
      priceMain: 'AED 3.8M–9M',
      priceSub: 'USD 1.03M–2.45M',
      heroCta: 'Ver las unidades',
      heroNote: 'Una pregunta y tus datos. Lleva unos treinta segundos.',
      capAerial: 'Palm Springs está en tierra firme, entre Palm Jebel Ali y Sheikh Zayed Road.',
      f1: 'Precio de lanzamiento por pie cuadrado, unos USD 490',
      f2: 'Habitaciones, entre townhouses y villas',
      f3: 'Impuesto anual sobre la propiedad en Dubái',
      f4: 'Umbral de la Golden Visa, superado por todas estas unidades',
      homesLabel: 'Las casas',
      homesTitle: 'Pensadas para familias, no para una hoja de cálculo de rentabilidad',
      homesLede: 'Dos formatos en el lanzamiento. Los dos dentro del mismo master plan, con las calles, los parques y el comercio dibujados antes que las casas.',
      h1t: 'Townhouses', h1b: '3 y 4 habitaciones',
      h1d: 'La entrada a la comunidad, y el formato que se agota primero en lanzamientos parecidos de Nakheel.',
      h2t: 'Villas', h2b: '4 y 5 habitaciones',
      h2d: 'Casas independientes en parcela propia, con espacio para jardín y piscina privados.',
      capVilla: 'Villa ya entregada de Nakheel en Jebel Ali Village, la comunidad vecina. Las imágenes oficiales de Palm Springs llegan con el material de lanzamiento.',
      capCommunity: 'Parques y piscinas de Jebel Ali Village, de la misma promotora.',
      locLabel: 'La ubicación',
      locTitle: 'En tierra firme, junto a la segunda palmera',
      locLede: 'Palm Jebel Ali es el doble de grande que Palm Jumeirah y se está construyendo justo al otro lado del agua. Palm Springs es la dirección en tierra firme a su lado, y eso es lo que mantiene el precio de entrada donde está.',
      near: [
        ['Palm Jebel Ali', 'Al otro lado del agua'],
        ['Sheikh Zayed Road', 'Salidas D53 y D86'],
        ['Puerto de Jebel Ali', 'Principal polo industrial y logístico de Dubái'],
        ['Reserva de Jebel Ali', 'Costa protegida al oeste'],
      ] as [string, string][],
      capPalm: 'Palm Jebel Ali, de Nakheel. Dieciséis frondas y más de 90 km de costa, en construcción.',
      urgencyBold: 'La primera fase de villas de Palm Jebel Ali se agotó en pocas horas.',
      urgencyRest: ' Nakheel lanza Palm Springs también por fases, y la lista va a quien está registrado antes de la venta abierta.',
      askLabel: 'Lista prioritaria',
      askTitle: 'Díme qué estás buscando',
      askLede: 'Una pregunta sobre la vivienda y tus datos. Lo cruzo con lo que está realmente disponible y te mando la lista, con el plan de pago.',
      role: 'Consultora Inmobiliaria',
      footNote: 'Palm Springs by Nakheel. Los precios, las tipologías y el plan de pago son cifras de prelanzamiento y se confirman con los documentos oficiales de la promotora. Las imágenes de Jebel Ali Village y Palm Jebel Ali se muestran como ejemplo del trabajo de la promotora, no como Palm Springs. Tus datos se usan solo para preparar y enviar tu selección.',
    },
    q: { looking: '¿Qué estás buscando?', size: '¿Qué tamaño de apartamento?', contact: '¿A dónde te mando la lista?' },
    note: { looking: 'Elige la opción más cercana. Solo marca por dónde empiezo.', size: 'El apartamento no entra en el lanzamiento de casas de Palm Springs, así que lo busco en el stock de Nakheel de la zona.', contact: 'Preparo la lista y te la mando.' },
    o: { 'Townhouse, 3 to 4 bedrooms': 'Townhouses', 'Villa, 4 to 5 bedrooms': 'Villas', 'Apartment': 'Apartamento', 'Studio': 'Estudio', 'One bedroom': '1 habitación', 'Two bedrooms': '2 habitaciones', 'More': 'Más' } as Record<string, string>,
    sub: { 'Townhouse, 3 to 4 bedrooms': '3 a 4 habitaciones', 'Villa, 4 to 5 bedrooms': '4 a 5 habitaciones' } as Record<string, string>,
    f: { first: 'Nombre', last: 'Apellido', email: 'Correo electrónico', phone: 'Número de WhatsApp', firstPh: 'Nombre', lastPh: 'Apellido', emailPh: 'tu@ejemplo.com', phonePh: '612 34 56 78' },
    b: { back: 'Atrás', submit: 'Quiero mi selección', sending: 'Enviando…', wa: 'Continuar en WhatsApp', go: 'Continuar' },
    e: { first: 'Escribe tu nombre.', email: 'Revisa tu correo electrónico.', phone: 'Escribe un número de WhatsApp válido.' },
    consent: 'Se usa solo para preparar y enviar tu selección de Palm Springs. Sin llamadas de venta y sin compartir con terceros.',
    stepOf: 'Paso {n} de {t}',
    complete: 'Completado',
    done: { title: 'Gracias, {name}. Tengo lo que necesito.', sub: 'Tus respuestas van contigo, así empezamos por la selección.', countdown: 'Continuando en {s}s…', fallback: 'Si no se abrió nada, usa el botón de arriba.' },
    recap: { looking: 'Busca', size: 'Tamaño' },
    gate: { title: 'Elige tu idioma', sub: 'España · América Latina' },
    langAria: 'Elegir idioma',
  },
} as const

/* ============================================================
   DIAL CODES
   ============================================================ */
const DIAL = [
  ['+971', 'AE'], ['+55', 'BR'], ['+1', 'US/CA'], ['+351', 'PT'], ['+34', 'ES'], ['+91', 'IN'], ['+44', 'GB'],
  ['+7', 'RU'], ['+92', 'PK'], ['+86', 'CN'], ['+966', 'SA'], ['+20', 'EG'], ['+33', 'FR'], ['+49', 'DE'],
  ['+39', 'IT'], ['+90', 'TR'], ['+961', 'LB'], ['+962', 'JO'], ['+234', 'NG'], ['+254', 'KE'], ['+27', 'ZA'],
  ['+61', 'AU'], ['+31', 'NL'], ['+48', 'PL'], ['+380', 'UA'], ['+98', 'IR'], ['+964', 'IQ'], ['+974', 'QA'],
  ['+965', 'KW'], ['+973', 'BH'], ['+968', 'OM'], ['+65', 'SG'], ['+852', 'HK'], ['+81', 'JP'], ['+82', 'KR'],
  ['+62', 'ID'], ['+60', 'MY'], ['+63', 'PH'], ['+880', 'BD'], ['+94', 'LK'], ['+41', 'CH'], ['+46', 'SE'],
  ['+32', 'BE'], ['+353', 'IE'], ['+45', 'DK'], ['+47', 'NO'], ['+30', 'GR'], ['+40', 'RO'],
  ['+972', 'IL'], ['+212', 'MA'], ['+213', 'DZ'], ['+216', 'TN'], ['+52', 'MX'], ['+54', 'AR'], ['+57', 'CO'],
] as const

const LANG_KEY = 'palmsprings-lang'
const GATE_KEY = 'palmsprings-lang-chosen'
const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ttclid'] as const
const isLang = (v: string | null): v is Lang => v === 'en' || v === 'pt' || v === 'es'

/* ============================================================
   SVG FLAG COMPONENTS
   ============================================================ */
function FlagUS() {
  return (
    <svg width="18" height="12" viewBox="0 0 24 16" aria-hidden="true">
      <rect width="24" height="16" fill="#B22234" />
      <g fill="#fff"><rect y="1.23" width="24" height="1.23" /><rect y="3.69" width="24" height="1.23" /><rect y="6.15" width="24" height="1.23" /><rect y="8.62" width="24" height="1.23" /><rect y="11.08" width="24" height="1.23" /><rect y="13.54" width="24" height="1.23" /></g>
      <rect width="10.5" height="8.62" fill="#3C3B6E" />
    </svg>
  )
}
function FlagBR() {
  return (
    <svg width="18" height="12" viewBox="0 0 24 16" aria-hidden="true">
      <rect width="24" height="16" fill="#009B3A" />
      <polygon points="12,1.6 22.2,8 12,14.4 1.8,8" fill="#FEDF00" />
      <circle cx="12" cy="8" r="3.4" fill="#002776" />
    </svg>
  )
}
function FlagES() {
  return (
    <svg width="18" height="12" viewBox="0 0 24 16" aria-hidden="true">
      <rect width="24" height="16" fill="#AA151B" />
      <rect y="4" width="24" height="8" fill="#F1BF00" />
    </svg>
  )
}
function FlagBig({ lang }: { lang: string }) {
  if (lang === 'pt') return <svg width="30" height="20" viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#009B3A" /><polygon points="12,1.6 22.2,8 12,14.4 1.8,8" fill="#FEDF00" /><circle cx="12" cy="8" r="3.4" fill="#002776" /></svg>
  if (lang === 'es') return <svg width="30" height="20" viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#AA151B" /><rect y="4" width="24" height="8" fill="#F1BF00" /></svg>
  return <svg width="30" height="20" viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#B22234" /><g fill="#fff"><rect y="1.23" width="24" height="1.23" /><rect y="3.69" width="24" height="1.23" /><rect y="6.15" width="24" height="1.23" /><rect y="8.62" width="24" height="1.23" /><rect y="11.08" width="24" height="1.23" /><rect y="13.54" width="24" height="1.23" /></g><rect width="10.5" height="8.62" fill="#3C3B6E" /></svg>
}
function FlagSmall({ lang }: { lang: string }) {
  if (lang === 'pt') return <FlagBR />
  if (lang === 'es') return <FlagES />
  return <FlagUS />
}
function Tick() {
  return <svg className="tick" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
}

function Mark() { return <div className="mark"><b>Real Estate</b><i>Dubai</i></div> }

/* ============================================================
   MAIN PAGE COMPONENT
   ============================================================ */
export default function Page() {
  const [lang, setLang] = useState<Lang>('en')
  const [gate, setGate] = useState(false)
  const [menu, setMenu] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [seconds, setSeconds] = useState(CONFIG.redirectSeconds)
  const langWrapRef = useRef<HTMLDivElement>(null)
  const utmRef = useRef<Record<string, string>>({})

  const L = useMemo(() => T[lang], [lang])

  /* The flow depends on whether the visitor picked "Apartment" */
  const flow = useMemo(() => {
    const f: string[] = ['looking']
    if (answers.looking === 'Apartment') f.push('size')
    f.push('contact')
    return f
  }, [answers.looking])

  const currentId = flow[step] ?? 'looking'
  const totalSteps = flow.length

  /* ---------- effects ---------- */
  useEffect(() => { document.documentElement.lang = L.htmlLang }, [L.htmlLang])

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search)
      /* ?lang=xx skips the gate */
      const qLang = params.get('lang')
      if (isLang(qLang)) {
        setLang(qLang)
        setGate(false)
        return
      }
      /* Restore saved language */
      const saved = localStorage.getItem(LANG_KEY)
      if (isLang(saved)) setLang(saved)
      setGate(localStorage.getItem(GATE_KEY) !== '1')
    } catch {
      setGate(true)
    }
  }, [])

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search)
      const fromUrl: Record<string, string> = {}
      UTM_FIELDS.forEach(key => { const v = params.get(key); if (v) fromUrl[key] = v })
      if (Object.keys(fromUrl).length) {
        utmRef.current = fromUrl
        sessionStorage.setItem('ps-utm', JSON.stringify(fromUrl))
      } else {
        const saved = sessionStorage.getItem('ps-utm')
        if (saved) utmRef.current = JSON.parse(saved)
      }
    } catch { /* storage unavailable */ }
  }, [])

  useEffect(() => {
    if (!menu) return
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (langWrapRef.current && !langWrapRef.current.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('touchstart', onDown) }
  }, [menu])

  useEffect(() => {
    if (!done || seconds <= 0) return
    const t = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [done, seconds])

  /* Redirect / open WhatsApp after countdown */
  useEffect(() => {
    if (!done || seconds > 0) return
    const link = destination()
    try { window.location.href = link } catch { /* blocked */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, seconds])

  /* ---------- helpers ---------- */
  const changeLang = (code: Lang) => {
    setMenu(false)
    if (code === lang) return
    setLang(code)
    setError('')
    try { localStorage.setItem(LANG_KEY, code) } catch { /* storage unavailable */ }
    if (!done) { setAnswers({}); setStep(0) }
  }

  const pickGateLang = (code: Lang) => {
    setLang(code)
    setGate(false)
    try { localStorage.setItem(LANG_KEY, code); localStorage.setItem(GATE_KEY, '1') } catch { /* storage unavailable */ }
  }

  const setAnswer = (id: string, value: string) => setAnswers(a => ({ ...a, [id]: value }))

  const advance = () => {
    setError('')
    if (step < totalSteps - 1) {
      setStep(s => s + 1)
      setTimeout(() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80)
    }
  }

  const goBack = () => { setError(''); setStep(s => Math.max(s - 1, 0)) }

  const validate = (): boolean => {
    if (currentId === 'contact') {
      if ((answers.first_name || '').trim().length < 2) { setError(L.e.first); return false }
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(answers.email || '')) { setError(L.e.email); return false }
      if ((answers.phone_local || '').replace(/\D/g, '').length < 6) { setError(L.e.phone); return false }
    }
    return true
  }

  const defaultCode = useMemo(() => {
    if (lang === 'pt') return '+55'
    if (lang === 'es') return '+34'
    return '+1'
  }, [lang])

  const waLink = () => {
    const name = `${answers.first_name || ''} ${answers.last_name || ''}`.trim()
    const lines = [
      `Hi ${CONFIG.agentName}, I just registered for Palm Springs by Nakheel.`,
      '',
      `Name: ${name}`,
      `Looking for: ${answers.looking || ''}`,
    ]
    if (answers.size) lines.push(`Size: ${answers.size}`)
    lines.push(
      `Preferred language: ${({ pt: 'Portuguese', es: 'Spanish' } as Record<string, string>)[lang] || 'English'}`,
      '',
      'Please send the unit list and the payment plan.',
    )
    return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`
  }

  const destination = () => CONFIG.redirectUrl || waLink()

  const submit = async () => {
    if (!validate() || submitting) return
    setSubmitting(true)
    setError('')

    const fullPhone = (answers.country_code || defaultCode) + (answers.phone_local || '').replace(/\D/g, '').replace(/^0+/, '')
    const utm: Record<string, string> = {}
    UTM_FIELDS.forEach(key => { utm[key] = utmRef.current[key] ?? '' })
    const eventId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `lead-${Date.now()}-${Math.random().toString(36).slice(2)}`

    const payload = {
      source: 'palm-springs-lp',
      project: 'Palm Springs by Nakheel',
      language: lang,
      submittedAt: new Date().toISOString(),
      answers: {
        first: answers.first_name || '',
        last: answers.last_name || '',
        email: answers.email || '',
        phone: fullPhone,
        phoneCode: answers.country_code || defaultCode,
        looking: answers.looking || '',
        size: answers.size || '',
      },
      eventId,
      pageUrl: typeof location !== 'undefined' ? location.href : undefined,
      ...utm,
    }

    try {
      /* Send to the Next.js API route (GHL + Meta CAPI) */
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Lead delivery failed')

      /* Also send directly to GHL webhook if configured */
      if (CONFIG.ghlWebhookUrl) {
        const ghlPayload = {
          first_name: answers.first_name || '',
          last_name: answers.last_name || '',
          full_name: `${answers.first_name || ''} ${answers.last_name || ''}`.trim(),
          email: answers.email || '',
          phone: fullPhone,
          country_code: answers.country_code || defaultCode,
          looking_for: answers.looking || '',
          unit_size: answers.size || '',
          language: ({ pt: 'Portuguese', es: 'Spanish' } as Record<string, string>)[lang] || 'English',
          project: 'Palm Springs by Nakheel',
          source: 'Palm Springs LP',
          submitted_at: new Date().toISOString(),
          page_url: typeof location !== 'undefined' ? location.href : '',
          referrer: typeof document !== 'undefined' ? document.referrer : '',
          ...utm,
        }
        fetch(CONFIG.ghlWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ghlPayload),
        }).catch(() => {
          fetch(CONFIG.ghlWebhookUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(ghlPayload) }).catch(() => { /* swallow */ })
        })
      }

      window.fbq?.('track', 'Lead', { content_name: 'palm-springs-lp', currency: 'AED' }, { eventID: eventId })
      setDone(true)
    } catch {
      setError('We could not submit your details. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const onWhatsApp = !CONFIG.redirectUrl
  const link = destination()

  /* ---------- render ---------- */
  return (
    <>
      {/* ── Language gate ── */}
      {gate && (
        <div className="gate" role="dialog" aria-modal="true" aria-labelledby="gate-title">
          <div className="gate-card">
            <Mark />
            <h2 id="gate-title">Choose your language<br />Escolha seu idioma<br />Elige tu idioma</h2>
            <div className="gate-opts">
              {(['en', 'pt', 'es'] as Lang[]).map(code => (
                <button className="lang-btn" key={code} type="button" onClick={() => pickGateLang(code)}>
                  <FlagBig lang={code} />
                  <span><b>{T[code].langName}</b><em>{T[code].gate.sub}</em></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Masthead ── */}
      <header className="masthead">
        <div className="wrap">
          <Mark />
          <div className="mast-right">
            <a className="mast-cta" href="#register">{L.ui.navCta}</a>
            <div className="lang-wrap" ref={langWrapRef}>
              <button type="button" className="lang-switch" aria-haspopup="listbox" aria-expanded={menu} aria-label={L.langAria} onClick={() => setMenu(!menu)}>
                <FlagSmall lang={lang} />
                <span>{L.langName}</span>
                <svg className="caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              {menu && (
                <ul className="lang-menu" role="listbox">
                  {(['en', 'pt', 'es'] as Lang[]).map(code => (
                    <li key={code}>
                      <button type="button" aria-selected={code === lang} onClick={() => changeLang(code)}>
                        <FlagSmall lang={code} />
                        <span>{T[code].langName}</span>
                        <Tick />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="hero">
          <div className="wrap">
            <div className="hero-grid">
              <div>
                <p className="eyebrow">{L.ui.heroEyebrow}</p>
                <h1>Palm Springs</h1>
                <p className="h1-sub">{L.ui.heroKicker}</p>
                <p className="hero-lede">{L.ui.heroLede} <b>{L.ui.heroLedeBold}</b></p>

                <div className="price-slab">
                  <small>{L.ui.priceLabel}</small>
                  <b>{L.ui.priceMain}</b>
                  <em>{L.ui.priceSub}</em>
                </div>

                <div className="hero-cta">
                  <a className="btn" href="#register">{L.ui.heroCta}</a>
                  <span className="hero-note">{L.ui.heroNote}</span>
                </div>
              </div>

              <figure className="shot" style={{ margin: 0 }}>
                <img src="/images/hero-aerial.jpg" width={1100} height={850} alt="Aerial view of Palm Springs in Jebel Ali, next to Palm Jebel Ali" />
                <figcaption>{L.ui.capAerial}</figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* ── Facts strip ── */}
        <section className="facts">
          <div className="wrap">
            <div className="fact"><b>AED 1,800</b><span>{L.ui.f1}</span></div>
            <div className="fact"><b>3–5</b><span>{L.ui.f2}</span></div>
            <div className="fact"><b>0%</b><span>{L.ui.f3}</span></div>
            <div className="fact"><b>AED 2M</b><span>{L.ui.f4}</span></div>
          </div>
        </section>

        {/* ── Homes ── */}
        <section className="band">
          <div className="wrap">
            <p className="sec-label">{L.ui.homesLabel}</p>
            <h2 className="sec">{L.ui.homesTitle}</h2>
            <p className="sec-lede">{L.ui.homesLede}</p>

            <div className="homes">
              <div className="home">
                <h3>{L.ui.h1t}</h3>
                <p className="beds">{L.ui.h1b}</p>
                <p>{L.ui.h1d}</p>
              </div>
              <div className="home">
                <h3>{L.ui.h2t}</h3>
                <p className="beds">{L.ui.h2b}</p>
                <p>{L.ui.h2d}</p>
              </div>
            </div>

            <div className="pairs">
              <figure className="shot" style={{ margin: 0 }}>
                <img src="/images/villa.jpg" width={1400} height={788} alt="Modern Nakheel villa with pool and garden" loading="lazy" />
                <figcaption>{L.ui.capVilla}</figcaption>
              </figure>
              <figure className="shot" style={{ margin: 0 }}>
                <img src="/images/community.jpg" width={1200} height={670} alt="Park and pool in a Nakheel community" loading="lazy" />
                <figcaption>{L.ui.capCommunity}</figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* ── Location ── */}
        <section className="band alt">
          <div className="wrap">
            <div className="pairs" style={{ alignItems: 'start' }}>
              <div>
                <p className="sec-label">{L.ui.locLabel}</p>
                <h2 className="sec">{L.ui.locTitle}</h2>
                <p className="sec-lede">{L.ui.locLede}</p>
                <ul className="near">
                  {L.ui.near.map(([name, detail]) => (
                    <li key={name}>{name} <span>{detail}</span></li>
                  ))}
                </ul>
              </div>
              <figure className="shot" style={{ margin: 0 }}>
                <img src="/images/palm-jebel-ali.jpg" width={900} height={675} alt="Palm Jebel Ali at dusk" loading="lazy" />
                <figcaption>{L.ui.capPalm}</figcaption>
              </figure>
            </div>

            <div className="flag" style={{ marginTop: 34 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
              <p><b>{L.ui.urgencyBold}</b>{L.ui.urgencyRest}</p>
            </div>
          </div>
        </section>

        {/* ── Registration / Form card ── */}
        <section className="band ask" id="register">
          <div className="wrap">
            <div>
              <p className="sec-label">{L.ui.askLabel}</p>
              <h2 className="sec">{L.ui.askTitle}</h2>
              <p className="sec-lede">{L.ui.askLede}</p>

              <div className="agent">
                <div className="face"><img src="/isa-melo-agent.jpg" width={68} height={68} alt={`${CONFIG.agentName}, Dubai property consultant`} loading="lazy" /></div>
                <dl>
                  <dt>{CONFIG.agentName}</dt>
                  <dd>{L.ui.role}</dd>
                </dl>
              </div>
            </div>

            <section className="card" aria-label="Palm Springs registration">
              <div className="card-head">
                <span className="step-of">{done ? L.complete : L.stepOf.replace('{n}', String(step + 1)).replace('{t}', String(totalSteps))}</span>
                <div className="pips" aria-hidden="true">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <i key={i} className={i <= step || done ? 'on' : ''} />
                  ))}
                </div>
              </div>
              <div className="card-body">
                {done ? (
                  /* ── Done state ── */
                  <div className="done">
                    <div className="seal">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
                    </div>
                    <h2>{L.done.title.replace('{name}', answers.first_name || '')}</h2>
                    <p>{L.done.sub}</p>
                    <dl className="recap">
                      {[[L.recap.looking, L.o[answers.looking || '']], [L.recap.size, L.o[answers.size || '']]].filter(([, b]) => b).map(([a, b]) => (
                        <div key={a}><dt>{a}</dt><dd>{b}</dd></div>
                      ))}
                    </dl>
                    <a className={`btn${onWhatsApp ? ' wa' : ''}`} href={link} rel="noopener">
                      {onWhatsApp && <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5v-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 00-.7.3A3 3 0 006 11a5.2 5.2 0 001.1 2.7 11.9 11.9 0 004.6 4 5.3 5.3 0 002.4.5 2.7 2.7 0 001.8-1.2 2.2 2.2 0 00.2-1.3c-.1-.1-.3-.2-.6-.3z" /></svg>}
                      {onWhatsApp ? L.b.wa : L.b.go}
                    </a>
                    <p className="countdown">{seconds > 0 ? L.done.countdown.replace('{s}', String(seconds)) : L.done.fallback}</p>
                  </div>
                ) : currentId === 'contact' ? (
                  /* ── Contact form ── */
                  <>
                    <h2 className="q">{L.q.contact}</h2>
                    <p className="q-note">{L.note.contact}</p>
                    <div className="row2">
                      <label className="field"><span>{L.f.first}</span><input value={answers.first_name || ''} onChange={e => setAnswer('first_name', e.target.value)} placeholder={L.f.firstPh} autoComplete="given-name" /></label>
                      <label className="field"><span>{L.f.last}</span><input value={answers.last_name || ''} onChange={e => setAnswer('last_name', e.target.value)} placeholder={L.f.lastPh} autoComplete="family-name" /></label>
                    </div>
                    <label className="field"><span>{L.f.email}</span><input type="email" inputMode="email" autoComplete="email" value={answers.email || ''} onChange={e => setAnswer('email', e.target.value)} placeholder={L.f.emailPh} /></label>
                    <div className="field">
                      <span>{L.f.phone}</span>
                      <div className="tel">
                        <select aria-label="Country code" value={answers.country_code || defaultCode} onChange={e => setAnswer('country_code', e.target.value)}>
                          {DIAL.map(([code, label]) => <option key={label} value={code}>{`${label} ${code}`}</option>)}
                        </select>
                        <input type="tel" inputMode="tel" autoComplete="tel-national" value={answers.phone_local || ''} onChange={e => setAnswer('phone_local', e.target.value)} placeholder={L.f.phonePh} />
                      </div>
                    </div>
                    <span className="err" hidden={!error}>{error}</span>
                    <div className="actions">
                      <button type="button" className="btn ghost" onClick={goBack}>{L.b.back}</button>
                      <button type="button" className="btn" disabled={submitting} onClick={submit}>{submitting ? L.b.sending : L.b.submit}</button>
                    </div>
                    <p className="consent">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6l7-3z" /></svg>
                      {L.consent}
                    </p>
                  </>
                ) : (
                  /* ── Choice step (looking / size) ── */
                  <>
                    <h2 className="q">{L.q[currentId as keyof typeof L.q]}</h2>
                    <p className="q-note">{L.note[currentId as keyof typeof L.note]}</p>
                    <ul className="opts">
                      {(currentId === 'looking' ? [...LOOKING] : [...SIZES]).map((v, i) => (
                        <li key={v}>
                          <button
                            type="button"
                            className={`opt ${answers[currentId] === v ? 'sel' : ''}`}
                            onClick={() => {
                              setAnswer(currentId, v)
                              if (currentId === 'looking' && v !== 'Apartment') {
                                setAnswers(a => { const next = { ...a, [currentId]: v }; delete next.size; return next })
                              }
                              setTimeout(advance, 190)
                            }}
                          >
                            <span className="key">{i + 1}</span>
                            <span className="txt">
                              {L.o[v] || v}
                              {L.sub[v] && <span className="sub">{L.sub[v]}</span>}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    {step > 0 && (
                      <div className="actions">
                        <button type="button" className="btn ghost" onClick={goBack}>{L.b.back}</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer>
        <div className="wrap">
          <Mark />
          <p>{L.ui.footNote}</p>
        </div>
      </footer>
    </>
  )
}
