import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { ArrowRight, Activity, Command, BarChart2, Zap, Shield, Star, Users, CheckCircle2, Calendar, X as XIcon } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function LandingPage() {
  const t = useTranslations("LandingPage")
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans selection:bg-[var(--coral-pale)] selection:text-[var(--coral-dark)]">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-[var(--ink-10)] bg-[var(--paper)]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--coral)] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">M</span>
            </div>
            <span className="font-semibold text-lg tracking-tight text-[var(--ink)]">MeAgenda</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--ink-60)]">
            <Link href="#features" className="hover:text-[var(--coral)] transition-colors">{t('nav_howitworks')}</Link>
            <Link href="#pricing" className="hover:text-[var(--coral)] transition-colors">{t('nav_pricing')}</Link>
            <Link href="#testimonials" className="hover:text-[var(--coral)] transition-colors">{t('nav_testimonials')}</Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login" className="text-sm font-medium text-[var(--ink-60)] hover:text-[var(--coral)] transition-colors">
              {t('nav_login')}
            </Link>
            <Link href="/register" className="px-5 py-2.5 bg-[var(--coral)] text-white text-sm font-medium rounded-full hover:bg-[var(--coral-dark)] transition-colors shadow-sm">
              {t('nav_register')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--coral-pale)] blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--coral)]/20 bg-[var(--coral-pale)] text-xs font-semibold text-[var(--coral)] mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--coral)] animate-pulse" />
            {t('hero_badge')}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            <span className="text-[var(--ink)]">{t('hero_title_1')}</span>
            <br />
            <span className="text-[#2F9E73]">{t('hero_title_2')}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[var(--ink-60)] max-w-2xl mx-auto mb-12 leading-relaxed">
            {t('hero_subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16 max-w-xl mx-auto">
            <div className="flex w-full items-center bg-white border border-[var(--ink-10)] rounded-full px-2 py-1.5 focus-within:ring-2 focus-within:ring-[#2F9E73] focus-within:border-[#2F9E73] transition-all flex-1 shadow-sm">
              <span className="text-[var(--ink-30)] font-medium pl-4 hidden sm:inline">meagenda.com/</span>
              <input 
                type="text" 
                placeholder={t('hero_input_placeholder')} 
                className="flex-1 bg-transparent border-none outline-none px-2 text-[var(--ink)] font-medium placeholder:text-[var(--ink-30)] w-full" 
              />
              <Link href="/register" className="px-6 py-3 bg-[var(--coral)] text-white font-medium rounded-full hover:bg-[var(--coral-dark)] transition-all whitespace-nowrap hidden sm:flex items-center gap-2">
                {t('hero_button')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <Link href="/register" className="w-full sm:hidden px-6 py-4 bg-[var(--coral)] text-white font-medium rounded-full hover:bg-[var(--coral-dark)] transition-all flex items-center justify-center gap-2">
              {t('hero_button_mobile')} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[var(--paper)] bg-[var(--ink-10)] overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User Avatar" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-sm text-[var(--ink-60)]">
              {t('hero_social_proof', { count: '2.000' })}
            </p>
          </div>
        </div>
      </section>

      {/* Features Flow / Como Funciona */}
      <section id="features" className="py-24 px-6 border-t border-[var(--ink-10)] bg-[var(--paper)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--ink)]">{t('features_title')}</h2>
            <p className="text-[var(--ink-60)]">{t('features_subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            
            {/* Step 1: Link Próprio */}
            <div className="col-span-1 bg-[var(--card)] border border-[var(--ink-10)] rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl font-black italic">1</span>
              </div>
              <div className="flex bg-[var(--paper)] rounded-xl border border-[var(--ink-10)] p-3 items-center gap-3 mb-8 relative z-10">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <div className="bg-white border border-[var(--ink-10)] rounded text-xs px-3 py-1.5 text-[var(--ink-60)] flex-grow font-mono flex items-center gap-2">
                  <span className="text-[var(--ink-30)]">https://</span>
                  <span className="text-[var(--ink)]">meagenda.com/</span>
                  <span className="text-[var(--coral)] font-semibold">studio-vip</span>
                </div>
              </div>
              <div className="mt-auto relative z-10">
                <h3 className="text-xl font-bold mb-2 text-[var(--ink)]">{t('feature_1_title')}</h3>
                <p className="text-[var(--ink-60)] text-sm leading-relaxed">{t('feature_1_desc')}</p>
              </div>
            </div>

            {/* Step 2: Cliente Agenda */}
            <div className="col-span-1 bg-[var(--card)] border border-[var(--ink-10)] rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl font-black italic">2</span>
              </div>
              <div className="bg-[var(--paper)] rounded-2xl border border-[var(--ink-10)] p-5 mb-8 relative z-10 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm font-bold text-[var(--ink)]">Corte de Cabelo</div>
                  <div className="text-xs text-[var(--ink-60)]">30 min</div>
                </div>
                <div className="flex gap-2">
                  <div className="px-4 py-2 bg-[var(--coral)] text-white text-xs rounded-lg font-medium shadow-[0_2px_8px_rgba(232,80,58,0.25)] relative">
                    14:00
                    <div className="absolute -bottom-4 -right-2 bg-white rounded-full p-1 shadow-md border border-[var(--ink-10)]">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" />
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-white border border-[var(--ink-10)] text-[var(--ink)] text-xs rounded-lg">14:30</div>
                  <div className="px-4 py-2 bg-white border border-[var(--ink-10)] text-[var(--ink)] text-xs rounded-lg opacity-50">15:00</div>
                </div>
              </div>
              <div className="mt-auto relative z-10">
                <h3 className="text-xl font-bold mb-2 text-[var(--ink)]">{t('feature_2_title')}</h3>
                <p className="text-[var(--ink-60)] text-sm leading-relaxed">{t('feature_2_desc')}</p>
              </div>
            </div>

            {/* Step 3: Confirmação Automática */}
            <div className="col-span-1 bg-[var(--card)] border border-[var(--ink-10)] rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl font-black italic">3</span>
              </div>
              
              <div className="relative h-[110px] mb-8 z-10">
                {/* Secondary card behind */}
                <div className="absolute top-4 left-4 right-4 bg-white border border-[var(--ink-10)] shadow-sm rounded-xl p-4 flex gap-3 items-center opacity-60 scale-95 translate-y-3 blur-[1px]">
                  <div className="bg-[var(--coral-pale)] p-1.5 rounded-full"><Calendar className="w-4 h-4 text-[var(--coral)]" /></div>
                  <div className="h-2 bg-[var(--ink-10)] rounded w-1/2" />
                </div>
                
                {/* Main confirmation card */}
                <div className="absolute top-0 left-0 right-0 bg-[var(--success-bg)] border border-[var(--success)]/20 shadow-md rounded-xl p-4 flex gap-3 items-start">
                  <div className="mt-0.5 bg-[var(--success)] p-1 rounded-full shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--success)] mb-1">Agendamento Confirmado!</div>
                    <div className="text-xs text-[var(--success)]/80 leading-tight">Você reservou <strong>Corte Premium</strong> para Sexta-feira às <strong>14:00h</strong>.</div>
                  </div>
                </div>
              </div>

              <div className="mt-auto relative z-10">
                <h3 className="text-xl font-bold mb-2 text-[var(--ink)]">{t('feature_3_title')}</h3>
                <p className="text-[var(--ink-60)] text-sm leading-relaxed">{t('feature_3_desc')}</p>
              </div>
            </div>
          </div>

          {/* Step 4: Dashboard Integrado (Wide Bottom) */}
          <div className="grid grid-cols-1 md:grid-cols-4 bg-[var(--coral)] rounded-3xl p-8 shadow-[0_8px_30px_rgba(232,80,58,0.15)] overflow-hidden relative">
            <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
               <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-white">
                  <path d="M0,100 C30,50 70,50 100,0 L100,100 Z" />
               </svg>
            </div>
            
            <div className="col-span-1 md:col-span-2 flex flex-col justify-center relative z-10 mb-8 md:mb-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white mb-6 w-max border border-white/30 backdrop-blur-md">
                <Activity className="w-3 h-3" /> {t('feature_4_badge')}
              </div>
              <h3 className="text-xl md:text-3xl font-bold mb-4 text-white">{t('feature_4_title')}</h3>
              <p className="text-white/80 text-sm leading-relaxed max-w-sm">{t('feature_4_desc')} <strong>Admin</strong>.</p>
            </div>

            <div className="col-span-1 md:col-span-2 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-white/90">
                    <Users className="w-4 h-4" /> <span className="text-xs font-medium">Equipe</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">05</div>
                  <div className="text-[10px] text-white/70">Profissionais ativos</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-white/90">
                    <Calendar className="w-4 h-4" /> <span className="text-xs font-medium">Hoje</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">24</div>
                  <div className="text-[10px] text-white/70">Agendamentos no dia</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 col-span-2 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-white/90 font-medium mb-1">Faturamento Estimado</div>
                    <div className="text-2xl font-bold text-white">R$ 1.840,00</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 border-t border-[var(--ink-10)] bg-[var(--paper)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--ink)]">{t('testimonials_title')}</h2>
            <p className="text-[var(--ink-60)]">{t('testimonials_subtitle')}</p>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {[
              {
                text: "A plataforma transformou completamente a forma como agendamos serviços. Lançamos a agenda nova em 5 minutos ao invés de meses configurando sistemas antigos.",
                name: "Juliana Silva", role: "Dona de Clínica de Estética", avatar: "5"
              },
              {
                text: "Integração perfeita que melhorou nossas operações de barbearia e a eficiência da equipe. Meu salão não vive sem.",
                name: "Tiago Mendes", role: "Gestor na BarberShop XP", avatar: "11"
              },
              {
                text: "Aumentamos nossa receita em 30% já no primeiro mês diminuindo as mensagens no WhatsApp e a facilidade do cliente marcar sozinho 24h por dia.",
                name: "Raquel Kim", role: "Diretora de Salão", avatar: "9"
              },
              {
                text: "Recursos incríveis. Tudo que gerencia as comissões dos meus 15 barbeiros em um só lugar de forma limpa.",
                name: "Marcos Junior", role: "CEO do Studio Alpha", avatar: "68"
              },
              {
                text: "A melhor decisão do ano foi migrar nossa agenda de papel para a plataforma. Acabou os furos de clientes e ter buracos na grade (no-shows).",
                name: "Camila Torres", role: "Manicure Autônoma", avatar: "44"
              },
            ].map((t, idx) => (
              <div key={idx} className="break-inside-avoid bg-[var(--card)] shadow-sm hover:shadow-md transition-shadow border border-[var(--ink-10)] p-8 rounded-3xl">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-[var(--coral)] text-[var(--coral)]" />)}
                </div>
                <p className="text-[var(--ink-60)] mb-8 text-[15px] leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--ink-10)] overflow-hidden flex-shrink-0">
                    <img src={`https://i.pravatar.cc/100?img=${t.avatar}`} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-[var(--ink)]">{t.name}</h4>
                    <p className="text-sm text-[var(--ink-60)] font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / Planos */}
      <section id="pricing" className="py-24 px-6 border-t border-[var(--ink-10)] bg-[var(--paper)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[var(--ink)]">{t('pricing_title')}</h2>
            <p className="text-[var(--ink-60)] text-lg">{t('pricing_subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Grátis Plan */}
            <div className="bg-[#FAF9F6] rounded-3xl p-8 border border-[var(--ink-10)] shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-medium text-[var(--ink)] mb-2">{t('pricing_free_title')}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight text-[var(--ink)]">{t('pricing_free_price')}</span>
                  <span className="text-[var(--ink-60)] font-medium">{t('pricing_month')}</span>
                </div>
                <p className="text-[var(--ink-60)] text-sm mt-3 pb-6 border-b border-[var(--ink-10)]">{t('pricing_free_desc')}</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-[var(--ink-80)]">
                  <div className="w-5 h-5 rounded-full bg-[#E5F5EF] flex items-center justify-center shrink-0"><CheckCircle2 className="w-3.5 h-3.5 text-[#2F9E73]" /></div>
                  {t('feature_item_page')}
                </li>
                <li className="flex items-center gap-3 text-[var(--ink-80)]">
                  <div className="w-5 h-5 rounded-full bg-[#E5F5EF] flex items-center justify-center shrink-0"><CheckCircle2 className="w-3.5 h-3.5 text-[#2F9E73]" /></div>
                  {t('feature_item_limit_free')}
                </li>
                <li className="flex items-center gap-3 text-[var(--ink-80)]">
                  <div className="w-5 h-5 rounded-full bg-[#E5F5EF] flex items-center justify-center shrink-0"><CheckCircle2 className="w-3.5 h-3.5 text-[#2F9E73]" /></div>
                  {t('feature_item_prof_free')}
                </li>
                <li className="flex items-center gap-3 text-[var(--ink-60)]">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0"><XIcon className="w-4 h-4 text-red-500" /></div>
                  {t('feature_item_catalog')}
                </li>
                <li className="flex items-center gap-3 text-[var(--ink-60)]">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0"><XIcon className="w-4 h-4 text-red-500" /></div>
                  {t('feature_item_reminders')}
                </li>
                <li className="flex items-center gap-3 text-[var(--ink-80)]">
                  <div className="w-5 h-5 rounded-full bg-[#E5F5EF] flex items-center justify-center shrink-0"><CheckCircle2 className="w-3.5 h-3.5 text-[#2F9E73]" /></div>
                  {t('feature_item_dashboard')}
                </li>
              </ul>
              
              <div className="text-center">
                <Link href="/register" className="block w-full py-3.5 border border-[var(--ink-20)] text-[var(--ink)] font-bold rounded-xl hover:border-[var(--ink-40)] hover:bg-[var(--ink-10)] transition-all">
                  {t('pricing_btn_free')}
                </Link>
                <p className="text-[13px] text-[#b33a3a] mt-4 font-medium">{t('pricing_limit')}</p>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-3xl p-8 border-2 border-[#2F9E73] shadow-md relative">
              <div className="absolute top-0 right-8 -translate-y-1/2">
                <span className="bg-[#E5F5EF] text-[#2F9E73] text-sm font-semibold px-4 py-1.5 rounded-full">{t('pricing_popular')}</span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-medium text-[var(--ink)] mb-2">{t('pricing_pro_title')}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight text-[var(--ink)]">{t('pricing_pro_price')}</span>
                  <span className="text-[var(--ink-60)] font-medium">{t('pricing_month')}</span>
                </div>
                <p className="text-[var(--ink-60)] text-sm mt-3 pb-6 border-b border-[var(--ink-10)]">{t('pricing_pro_desc')}</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-[var(--ink-80)]">
                  <div className="w-5 h-5 rounded-full bg-[#E5F5EF] flex items-center justify-center shrink-0"><CheckCircle2 className="w-3.5 h-3.5 text-[#2F9E73]" /></div>
                  {t('feature_item_page')}
                </li>
                <li className="flex items-center gap-3 text-[var(--ink-80)]">
                  <div className="w-5 h-5 rounded-full bg-[#E5F5EF] flex items-center justify-center shrink-0"><CheckCircle2 className="w-3.5 h-3.5 text-[#2F9E73]" /></div>
                  {t('feature_item_limit_pro')}
                </li>
                <li className="flex items-center gap-3 text-[var(--ink-80)]">
                  <div className="w-5 h-5 rounded-full bg-[#E5F5EF] flex items-center justify-center shrink-0"><CheckCircle2 className="w-3.5 h-3.5 text-[#2F9E73]" /></div>
                  {t('feature_item_prof_pro')}
                </li>
                <li className="flex items-center gap-3 text-[var(--ink-80)]">
                  <div className="w-5 h-5 rounded-full bg-[#E5F5EF] flex items-center justify-center shrink-0"><CheckCircle2 className="w-3.5 h-3.5 text-[#2F9E73]" /></div>
                  {t('feature_item_reminders')}
                </li>
                <li className="flex items-center gap-3 text-[var(--ink-80)]">
                  <div className="w-5 h-5 rounded-full bg-[#E5F5EF] flex items-center justify-center shrink-0"><CheckCircle2 className="w-3.5 h-3.5 text-[#2F9E73]" /></div>
                  {t('feature_item_dashboard')}
                </li>
                <li className="flex gap-3 items-start text-[var(--ink)]">
                  <div className="w-5 h-5 rounded-full bg-[#E5F5EF] flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#2F9E73]" /></div>
                  <div><p className="font-semibold text-sm">{t('feature_item_catalog')}</p><p className="text-xs text-[var(--ink-60)] leading-tight">{t('feature_item_catalog_desc')}</p></div>
                </li>
              </ul>
              
              <div className="text-center mt-auto pt-4">
                <Link href="/register?plan=pro" className="block w-full py-3.5 border border-[var(--ink-20)] text-[var(--ink)] font-bold rounded-xl hover:border-[#2F9E73] hover:text-[#2F9E73] transition-all">
                  {t('pricing_btn_pro')}
                </Link>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--ink-10)] bg-[var(--paper)] text-center text-sm font-medium text-[var(--ink-30)]">
        <p>{t('footer_copy', { year: currentYear })}</p>
      </footer>

    </div>
  )
}
