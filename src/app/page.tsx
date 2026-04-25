"use client";

import { useState, useEffect } from "react";

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

export default function Home() {
  const [selectedService, setSelectedService] = useState("");

  const handleServiceClick = (serviceValue: string) => {
    setSelectedService(serviceValue);
    document.getElementById("contatti")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="bg-[#FAFAF8]/90 backdrop-blur-sm border-b border-[#E5E5E0] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-[#0D6E6E] rounded-lg flex items-center justify-center">
              <BoltIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-xl text-[#1A1A1A] tracking-tight">BollettAI</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6B7280]">
            <a href="#servizi" className="hover:text-[#0D6E6E] transition-colors">Servizi</a>
            <a href="#incentivi" className="hover:text-[#0D6E6E] transition-colors">Incentivi</a>
            <a href="#chi-siamo" className="hover:text-[#0D6E6E] transition-colors">Chi siamo</a>
            <a href="#contatti" className="hover:text-[#0D6E6E] transition-colors">Contatti</a>
          </nav>
          <a
            href="#contatti"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0D6E6E] rounded-lg hover:bg-[#0A5555] transition-colors"
          >
            Richiedi analisi
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-normal text-[#1A1A1A] mb-6 leading-tight tracking-tight">
            I costi energetici della tua azienda, sotto controllo.
          </h1>
          <p className="text-lg sm:text-xl text-[#6B7280] mb-10 leading-relaxed max-w-2xl mx-auto">
            Analizziamo le tue bollette con intelligenza artificiale per identificare errori di fatturazione,
            costi nascosti e opportunità di risparmio. Per PMI che spendono da €2.000 a €15.000/mese in energia.
          </p>
          <a
            href="#contatti"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[#0D6E6E] rounded-lg hover:bg-[#0A5555] transition-colors"
          >
            Richiedi un&apos;analisi gratuita della tua prima bolletta
            <ArrowRightIcon className="w-5 h-5" />
          </a>
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-[#6B7280]">
            <span className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-[#0D6E6E]" />
              Conforme alle tariffe ARERA
            </span>
            <span className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-[#0D6E6E]" />
              GDPR compliant
            </span>
            <span className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-[#0D6E6E]" />
              Dati trattati in UE
            </span>
          </div>
        </div>
      </section>

      {/* Il Problema */}
      <section className="py-20 px-6 bg-white border-y border-[#E5E5E0]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl text-[#1A1A1A] mb-8 text-center">Il problema</h2>
          <div className="space-y-4 text-[#1A1A1A] text-lg leading-relaxed">
            <p>
              Le bollette energetiche italiane sono documenti complessi: <strong>40+ voci</strong> che quasi nessuno verifica.
            </p>
            <ul className="space-y-3 mt-6">
              <li className="flex gap-3">
                <span className="text-[#C9A227] font-bold">—</span>
                <span>Fornitori che applicano codici ATECO errati o non riconoscono agevolazioni IVA e accise</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C9A227] font-bold">—</span>
                <span>Contratti che si rinnovano automaticamente a condizioni peggiori</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C9A227] font-bold">—</span>
                <span>Incentivi CER e Transizione 5.0 lasciati sul tavolo</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C9A227] font-bold">—</span>
                <span>Errori di fatturazione che passano inosservati per mesi</span>
              </li>
            </ul>
            <p className="mt-6 text-[#6B7280]">
              In media, una PMI italiana overpaga l&apos;energia del <strong className="text-[#1A1A1A]">8-20%</strong> senza rendersene conto.
            </p>

            {/* Case Study */}
            <div className="mt-10 p-6 bg-[#0D6E6E]/5 border border-[#0D6E6E]/20 rounded-xl">
              <p className="text-sm text-[#0D6E6E] font-semibold mb-2">ESEMPIO ILLUSTRATIVO</p>
              <p className="text-[#1A1A1A] font-medium mb-3">
                PMI manifatturiera in Lombardia — spesa energetica €7.200/mese
              </p>
              <p className="text-[#6B7280] text-base">
                Identificati <strong className="text-[#1A1A1A]">€11.400/anno</strong> di risparmi:
                €4.200 da errori di fatturazione su componenti regolate, €3.600 da codice ATECO errato
                (agevolazioni accise non applicate), €3.600 dalla rinegoziazione del contratto a condizioni di mercato.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* I Nostri Servizi */}
      <section id="servizi" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl text-[#1A1A1A] mb-4 text-center">I nostri servizi</h2>
          <p className="text-lg text-[#6B7280] text-center mb-14 max-w-2xl mx-auto">
            Tre soluzioni per ogni fase del controllo dei costi energetici
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Audit */}
            <div
              onClick={() => handleServiceClick("audit")}
              className="bg-white border border-[#E5E5E0] rounded-xl p-8 hover:border-[#0D6E6E]/30 transition-colors cursor-pointer"
            >
              <div className="mb-6">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-[#0D6E6E] bg-[#0D6E6E]/10 rounded-full mb-4">
                  ONE-OFF
                </span>
                <h3 className="text-2xl text-[#1A1A1A] mb-2">Audit Energetico</h3>
                <p className="text-[#6B7280] text-sm mb-4">Il punto di partenza per capire dove stai perdendo soldi.</p>
                <p className="font-mono text-2xl text-[#1A1A1A]">da €500</p>
              </div>
              <ul className="space-y-3 text-sm text-[#1A1A1A]">
                <li className="flex gap-2">
                  <CheckIcon className="w-5 h-5 text-[#0D6E6E] shrink-0" />
                  <span>Upload 12 mesi di bollette (luce + gas, tutti i siti)</span>
                </li>
                <li className="flex gap-2">
                  <CheckIcon className="w-5 h-5 text-[#0D6E6E] shrink-0" />
                  <span>Analisi AI voce per voce di ogni costo</span>
                </li>
                <li className="flex gap-2">
                  <CheckIcon className="w-5 h-5 text-[#0D6E6E] shrink-0" />
                  <span>Benchmark tariffe ARERA e mercato</span>
                </li>
                <li className="flex gap-2">
                  <CheckIcon className="w-5 h-5 text-[#0D6E6E] shrink-0" />
                  <span>Analisi consumi F1/F2/F3</span>
                </li>
                <li className="flex gap-2">
                  <CheckIcon className="w-5 h-5 text-[#0D6E6E] shrink-0" />
                  <span>Report PDF con risparmio quantificato</span>
                </li>
              </ul>
            </div>

            {/* Monitoraggio */}
            <div
              onClick={() => handleServiceClick("monitoraggio")}
              className="bg-white border-2 border-[#0D6E6E] rounded-xl p-8 relative cursor-pointer"
            >
              <div className="absolute -top-3 left-6 px-3 py-1 text-xs font-semibold text-white bg-[#0D6E6E] rounded-full">
                CONSIGLIATO
              </div>
              <div className="mb-6">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-[#C9A227] bg-[#C9A227]/10 rounded-full mb-4">
                  SAAS
                </span>
                <h3 className="text-2xl text-[#1A1A1A] mb-2">Monitoraggio Continuo</h3>
                <p className="text-[#6B7280] text-sm mb-4">Per aziende che vogliono tenere i costi sotto controllo nel tempo.</p>
                <p className="font-mono text-2xl text-[#1A1A1A]">da €200<span className="text-base text-[#6B7280]">/mese</span></p>
              </div>
              <ul className="space-y-3 text-sm text-[#1A1A1A]">
                <li className="flex gap-2">
                  <CheckIcon className="w-5 h-5 text-[#0D6E6E] shrink-0" />
                  <span>Upload e analisi mensile di tutte le bollette</span>
                </li>
                <li className="flex gap-2">
                  <CheckIcon className="w-5 h-5 text-[#0D6E6E] shrink-0" />
                  <span>Dashboard: trend, anomalie, scadenze contratti</span>
                </li>
                <li className="flex gap-2">
                  <CheckIcon className="w-5 h-5 text-[#0D6E6E] shrink-0" />
                  <span>Benchmark vs. PUN/PSV correnti</span>
                </li>
                <li className="flex gap-2">
                  <CheckIcon className="w-5 h-5 text-[#0D6E6E] shrink-0" />
                  <span>Alert automatici su anomalie</span>
                </li>
                <li className="flex gap-2">
                  <CheckIcon className="w-5 h-5 text-[#0D6E6E] shrink-0" />
                  <span>Review trimestrale con esperto energetico</span>
                </li>
              </ul>
            </div>

            {/* Consulenza */}
            <div
              onClick={() => handleServiceClick("consulenza")}
              className="bg-white border border-[#E5E5E0] rounded-xl p-8 hover:border-[#0D6E6E]/30 transition-colors cursor-pointer"
            >
              <div className="mb-6">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-[#6B7280] bg-[#6B7280]/10 rounded-full mb-4">
                  PROGETTO
                </span>
                <h3 className="text-2xl text-[#1A1A1A] mb-2">Consulenza Strategica</h3>
                <p className="text-[#6B7280] text-sm mb-4">Per investimenti e incentivi che richiedono analisi approfondita.</p>
                <p className="font-mono text-2xl text-[#1A1A1A]">da €2.000</p>
              </div>
              <ul className="space-y-3 text-sm text-[#1A1A1A]">
                <li className="flex gap-2">
                  <CheckIcon className="w-5 h-5 text-[#0D6E6E] shrink-0" />
                  <span>Eligibilità CER e simulazione incentivi GSE</span>
                </li>
                <li className="flex gap-2">
                  <CheckIcon className="w-5 h-5 text-[#0D6E6E] shrink-0" />
                  <span>Scanner Transizione 5.0 per credito d&apos;imposta</span>
                </li>
                <li className="flex gap-2">
                  <CheckIcon className="w-5 h-5 text-[#0D6E6E] shrink-0" />
                  <span>ROI fotovoltaico/accumulo sui tuoi consumi</span>
                </li>
                <li className="flex gap-2">
                  <CheckIcon className="w-5 h-5 text-[#0D6E6E] shrink-0" />
                  <span>Supporto rinegoziazione contratti</span>
                </li>
                <li className="flex gap-2">
                  <CheckIcon className="w-5 h-5 text-[#0D6E6E] shrink-0" />
                  <span>Business case e documentazione completa</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Come Funziona */}
      <section className="py-24 px-6 bg-white border-y border-[#E5E5E0]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl text-[#1A1A1A] mb-14 text-center">Come funziona</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#0D6E6E]/10 text-[#0D6E6E] rounded-full flex items-center justify-center font-mono text-lg font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Ci invii le bollette</h3>
              <p className="text-sm text-[#6B7280]">
                Ultimi 12 mesi via email, WeTransfer, o upload diretto
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#0D6E6E]/10 text-[#0D6E6E] rounded-full flex items-center justify-center font-mono text-lg font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">L&apos;AI analizza ogni voce</h3>
              <p className="text-sm text-[#6B7280]">
                Estrazione dati, validazione, benchmark automatico
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#0D6E6E]/10 text-[#0D6E6E] rounded-full flex items-center justify-center font-mono text-lg font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Ricevi il report</h3>
              <p className="text-sm text-[#6B7280]">
                PDF professionale con errori, anomalie, e piano d&apos;azione
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#0D6E6E]/10 text-[#0D6E6E] rounded-full flex items-center justify-center font-mono text-lg font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Decidi come agire</h3>
              <p className="text-sm text-[#6B7280]">
                Supporto per reclami, cambio fornitore, o accesso incentivi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Per Quali Settori */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl text-[#1A1A1A] mb-4 text-center">Per quali settori</h2>
          <p className="text-lg text-[#6B7280] text-center mb-14">
            Lavoriamo con PMI italiane di ogni settore con spesa energetica mensile da €2.000 in su.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              "Manifattura e lavorazioni meccaniche",
              "Alberghiero e ristorazione",
              "Commercio e retail (multi-sede)",
              "Logistica e magazzini",
              "Studi professionali e co-working",
              "Alimentare e agroindustriale",
            ].map((sector) => (
              <div
                key={sector}
                className="bg-white border border-[#E5E5E0] rounded-lg p-5 hover:border-[#0D6E6E]/30 transition-colors"
              >
                <div className="w-2 h-2 bg-[#0D6E6E] rounded-full mb-3" />
                <span className="text-sm text-[#1A1A1A] font-medium">{sector}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CER & Transizione 5.0 */}
      <section id="incentivi" className="py-24 px-6 bg-[#0D6E6E] text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl mb-4 text-center">CER e Transizione 5.0</h2>
          <p className="text-lg text-white/80 text-center mb-14 max-w-2xl mx-auto">
            Due opportunità concrete per ridurre i costi e accedere a incentivi statali
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* CER */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
              <h3 className="text-2xl mb-4">Comunità Energetiche (CER)</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <CheckIcon className="w-5 h-5 text-[#E5C45B] shrink-0 mt-0.5" />
                  <span>Verifica eligibilità della tua azienda</span>
                </li>
                <li className="flex gap-3">
                  <CheckIcon className="w-5 h-5 text-[#E5C45B] shrink-0 mt-0.5" />
                  <span>Simulazione incentivi GSE (fino a <strong className="font-mono">€120/MWh</strong>)</span>
                </li>
                <li className="flex gap-3">
                  <CheckIcon className="w-5 h-5 text-[#E5C45B] shrink-0 mt-0.5" />
                  <span>Analisi costi-benefici basata sui tuoi consumi reali</span>
                </li>
                <li className="flex gap-3">
                  <CheckIcon className="w-5 h-5 text-[#E5C45B] shrink-0 mt-0.5" />
                  <span>Supporto nella costituzione della CER</span>
                </li>
              </ul>
            </div>

            {/* Transizione 5.0 */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
              <h3 className="text-2xl mb-4">Transizione 5.0</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <CheckIcon className="w-5 h-5 text-[#E5C45B] shrink-0 mt-0.5" />
                  <span>Scanner automatico per credito d&apos;imposta</span>
                </li>
                <li className="flex gap-3">
                  <CheckIcon className="w-5 h-5 text-[#E5C45B] shrink-0 mt-0.5" />
                  <span>Verifica compatibilità investimenti in efficienza energetica</span>
                </li>
                <li className="flex gap-3">
                  <CheckIcon className="w-5 h-5 text-[#E5C45B] shrink-0 mt-0.5" />
                  <span>Calcolo del beneficio fiscale stimato</span>
                </li>
                <li className="flex gap-3">
                  <CheckIcon className="w-5 h-5 text-[#E5C45B] shrink-0 mt-0.5" />
                  <span>Documentazione per accesso al credito</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Chi Siamo */}
      <section id="chi-siamo" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl text-[#1A1A1A] mb-14 text-center">Chi siamo</h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="text-center md:text-left">
              <div className="w-24 h-24 mx-auto md:mx-0 mb-6 bg-[#0D6E6E]/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-semibold text-[#0D6E6E]">LB</span>
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">Lucio Berardi</h3>
              <p className="text-sm text-[#0D6E6E] font-medium mb-4">Esperto Energetico</p>
              <p className="text-[#6B7280]">
                Esperienza pluriennale nel settore energetico italiano. Conoscenza approfondita
                delle dinamiche di mercato, della regolamentazione ARERA, e delle relazioni con
                i fornitori. Punto di riferimento per le PMI che vogliono ottimizzare i propri costi.
              </p>
            </div>

            <div className="text-center md:text-left">
              <div className="w-24 h-24 mx-auto md:mx-0 mb-6 bg-[#0D6E6E]/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-semibold text-[#0D6E6E]">FS</span>
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">Fira Software Ltd</h3>
              <p className="text-sm text-[#0D6E6E] font-medium mb-4">Partner Tecnologico</p>
              <p className="text-[#6B7280]">
                Azienda UK specializzata in scientific computing e intelligenza artificiale.
                Sviluppa il motore di analisi AI che estrae, valida e confronta automaticamente
                ogni voce delle bollette energetiche.
              </p>
            </div>
          </div>

          <p className="mt-12 text-center text-lg text-[#6B7280] italic">
            &ldquo;Tecnologia AI di livello scientifico, applicata all&apos;energia. Competenza di settore, al servizio delle PMI.&rdquo;
          </p>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#1A1A1A] font-medium">
              Non siamo affiliati a nessun fornitore energetico. Il nostro unico cliente sei tu.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contatti" className="py-24 px-6 bg-white border-t border-[#E5E5E0]">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl text-[#1A1A1A] mb-4 text-center">
            Richiedi un&apos;analisi gratuita della tua prima bolletta
          </h2>
          <p className="text-[#6B7280] text-center mb-10">
            Analizziamo una bolletta gratuitamente per mostrarti cosa possiamo trovare. Senza impegno.
          </p>

          <ContactForm selectedService={selectedService} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#1A1A1A] text-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#0D6E6E] rounded-lg flex items-center justify-center">
                <BoltIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg">BollettAI</span>
            </div>
            <p className="text-sm text-white/60">
              Fira Software Ltd × Lucio Berardi
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10 text-sm text-white/60">
            <p>© 2026 BollettAI. Tutti i diritti riservati.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Termini di Servizio</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ContactForm({ selectedService }: { selectedService: string }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    service: "",
    sector: "",
    spending: "",
    sites: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedService) {
      setFormData(prev => ({ ...prev, service: selectedService }));
    }
  }, [selectedService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          type: "audit_request",
          message: `
Servizio richiesto: ${formData.service || "Non specificato"}
Settore: ${formData.sector || "Non specificato"}
Spesa energetica mensile: ${formData.spending || "Non specificata"}
Numero di siti: ${formData.sites || "Non specificato"}

${formData.message || "Richiesta analisi gratuita prima bolletta"}
          `.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Errore durante l'invio. Riprova.");
      }

      setSuccess(true);
      setFormData({ name: "", email: "", company: "", service: "", sector: "", spending: "", sites: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#0D6E6E]/5 border border-[#0D6E6E]/20 rounded-xl p-8 text-center">
        <div className="w-14 h-14 bg-[#0D6E6E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckIcon className="w-7 h-7 text-[#0D6E6E]" />
        </div>
        <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">Richiesta inviata!</h3>
        <p className="text-[#6B7280]">Ti contatteremo entro 24 ore lavorative.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
            Nome e cognome *
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-[#E5E5E0] rounded-lg focus:ring-2 focus:ring-[#0D6E6E] focus:border-transparent transition-all bg-white"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
            Email aziendale *
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-[#E5E5E0] rounded-lg focus:ring-2 focus:ring-[#0D6E6E] focus:border-transparent transition-all bg-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
          Azienda *
        </label>
        <input
          id="company"
          type="text"
          required
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="w-full px-4 py-3 border border-[#E5E5E0] rounded-lg focus:ring-2 focus:ring-[#0D6E6E] focus:border-transparent transition-all bg-white"
        />
      </div>

      <div>
        <label htmlFor="service" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
          Servizio di interesse *
        </label>
        <select
          id="service"
          required
          value={formData.service}
          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
          className="w-full px-4 py-3 border border-[#E5E5E0] rounded-lg focus:ring-2 focus:ring-[#0D6E6E] focus:border-transparent transition-all bg-white cursor-pointer"
        >
          <option value="">Seleziona un servizio...</option>
          <option value="audit">Audit Energetico (da €500, one-off)</option>
          <option value="monitoraggio">Monitoraggio Continuo (da €200/mese)</option>
          <option value="consulenza">Consulenza Strategica (da €2.000)</option>
          <option value="gratuito">Solo analisi gratuita prima bolletta</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="sector" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
            Settore
          </label>
          <select
            id="sector"
            value={formData.sector}
            onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
            className="w-full px-4 py-3 border border-[#E5E5E0] rounded-lg focus:ring-2 focus:ring-[#0D6E6E] focus:border-transparent transition-all bg-white"
          >
            <option value="">Seleziona...</option>
            <option value="manifattura">Manifattura</option>
            <option value="alberghiero">Alberghiero</option>
            <option value="commercio">Commercio/Retail</option>
            <option value="logistica">Logistica</option>
            <option value="alimentare">Alimentare</option>
            <option value="altro">Altro</option>
          </select>
        </div>
        <div>
          <label htmlFor="spending" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
            Spesa mensile
          </label>
          <select
            id="spending"
            value={formData.spending}
            onChange={(e) => setFormData({ ...formData, spending: e.target.value })}
            className="w-full px-4 py-3 border border-[#E5E5E0] rounded-lg focus:ring-2 focus:ring-[#0D6E6E] focus:border-transparent transition-all bg-white"
          >
            <option value="">Seleziona...</option>
            <option value="2000-5000">€2.000 - €5.000</option>
            <option value="5000-10000">€5.000 - €10.000</option>
            <option value="10000-15000">€10.000 - €15.000</option>
            <option value="oltre-15000">Oltre €15.000</option>
          </select>
        </div>
        <div>
          <label htmlFor="sites" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
            N. siti
          </label>
          <select
            id="sites"
            value={formData.sites}
            onChange={(e) => setFormData({ ...formData, sites: e.target.value })}
            className="w-full px-4 py-3 border border-[#E5E5E0] rounded-lg focus:ring-2 focus:ring-[#0D6E6E] focus:border-transparent transition-all bg-white"
          >
            <option value="">Seleziona...</option>
            <option value="1">1</option>
            <option value="2-5">2-5</option>
            <option value="6-10">6-10</option>
            <option value="oltre-10">Oltre 10</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
          Messaggio (opzionale)
        </label>
        <textarea
          id="message"
          rows={3}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 border border-[#E5E5E0] rounded-lg focus:ring-2 focus:ring-[#0D6E6E] focus:border-transparent transition-all resize-none bg-white"
          placeholder="Altre informazioni che vuoi condividere..."
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-[#0D6E6E] text-white font-semibold rounded-lg hover:bg-[#0A5555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Invio in corso..." : "Richiedi analisi gratuita"}
      </button>
    </form>
  );
}
