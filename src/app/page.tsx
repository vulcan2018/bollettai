"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PRICING } from "@/lib/constants";

interface AnalysisResult {
  fornitore?: string;
  pod?: string;
  potenza_impegnata?: string;
  periodo_fatturazione?: string;
  consumo_totale_kwh?: number;
  consumo_f1?: number;
  consumo_f2?: number;
  consumo_f3?: number;
  costo_energia?: number;
  oneri_sistema?: number;
  imposte?: number;
  totale?: number;
  valutazione?: "promossa" | "bocciata" | "sufficiente";
  problemi?: string[];
  suggerimenti?: string[];
  risparmio_potenziale?: number;
}

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.type.startsWith("image/"))) {
      setFile(droppedFile);
      setError(null);
      setResult(null);
      if (droppedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(droppedFile);
      } else {
        setPreview(null);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Errore durante l'analisi. Riprova.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (planId: string) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setCheckoutLoading(planId);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore checkout");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const getValutazioneColor = (val?: string) => {
    switch (val) {
      case "promossa": return "text-green-600 bg-green-50";
      case "bocciata": return "text-red-600 bg-red-50";
      case "sufficiente": return "text-yellow-600 bg-yellow-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getValutazioneEmoji = (val?: string) => {
    switch (val) {
      case "promossa": return "✓";
      case "bocciata": return "✗";
      case "sufficiente": return "~";
      default: return "?";
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-semibold text-xl text-gray-900">BollettAI</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
            <a href="#come-funziona" className="hover:text-gray-900">Come funziona</a>
            <a href="#prezzi" className="hover:text-gray-900">Prezzi</a>
            <a href="#contatti" className="hover:text-gray-900">Contatti</a>
          </nav>
          <div className="flex items-center gap-3">
            {authLoading ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Esci
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Accedi
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Stai pagando troppo<br />per l&apos;energia?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Carica la tua bolletta e l&apos;intelligenza artificiale ti dirà
            se ci sono errori, costi nascosti o opportunità di risparmio.
          </p>
        </div>

        {/* Upload Area */}
        <div className="max-w-2xl mx-auto">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-colors
              ${file ? "border-blue-300 bg-blue-50" : "border-gray-300 bg-white hover:border-blue-400"}
            `}
          >
            {!file ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Trascina qui la tua bolletta
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  oppure
                </p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    Scegli file
                  </span>
                </label>
                <p className="text-xs text-gray-400 mt-4">
                  PDF o immagine (JPG, PNG) - max 10MB
                </p>
              </>
            ) : (
              <div>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                    className="ml-auto text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {preview && (
                  <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg mb-4" />
                )}
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analisi in corso...
                    </span>
                  ) : (
                    "Analizza bolletta"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Valutazione Header */}
              <div className={`p-6 ${getValutazioneColor(result.valutazione)}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold">{getValutazioneEmoji(result.valutazione)}</span>
                  <div>
                    <h2 className="text-2xl font-bold capitalize">
                      Bolletta {result.valutazione}
                    </h2>
                    {result.risparmio_potenziale && result.risparmio_potenziale > 0 && (
                      <p className="text-sm opacity-80">
                        Risparmio potenziale: fino a {result.risparmio_potenziale.toFixed(0)}€/anno
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-6">
                {/* Info Fornitore */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {result.fornitore && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Fornitore</p>
                      <p className="font-medium">{result.fornitore}</p>
                    </div>
                  )}
                  {result.pod && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">POD</p>
                      <p className="font-medium text-sm">{result.pod}</p>
                    </div>
                  )}
                  {result.periodo_fatturazione && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Periodo</p>
                      <p className="font-medium">{result.periodo_fatturazione}</p>
                    </div>
                  )}
                  {result.potenza_impegnata && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Potenza</p>
                      <p className="font-medium">{result.potenza_impegnata}</p>
                    </div>
                  )}
                </div>

                {/* Consumi */}
                {result.consumo_totale_kwh && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Consumi</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{result.consumo_totale_kwh}</p>
                          <p className="text-xs text-gray-500">kWh totali</p>
                        </div>
                        {result.consumo_f1 !== undefined && (
                          <div>
                            <p className="text-lg font-semibold text-gray-700">{result.consumo_f1}</p>
                            <p className="text-xs text-gray-500">F1 (punta)</p>
                          </div>
                        )}
                        {result.consumo_f2 !== undefined && (
                          <div>
                            <p className="text-lg font-semibold text-gray-700">{result.consumo_f2}</p>
                            <p className="text-xs text-gray-500">F2 (intermedia)</p>
                          </div>
                        )}
                        {result.consumo_f3 !== undefined && (
                          <div>
                            <p className="text-lg font-semibold text-gray-700">{result.consumo_f3}</p>
                            <p className="text-xs text-gray-500">F3 (fuori punta)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Costi */}
                {result.totale && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Costi</h3>
                    <div className="space-y-2">
                      {result.costo_energia !== undefined && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Costo energia</span>
                          <span className="font-medium">{result.costo_energia.toFixed(2)}€</span>
                        </div>
                      )}
                      {result.oneri_sistema !== undefined && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Oneri di sistema</span>
                          <span className="font-medium">{result.oneri_sistema.toFixed(2)}€</span>
                        </div>
                      )}
                      {result.imposte !== undefined && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Imposte</span>
                          <span className="font-medium">{result.imposte.toFixed(2)}€</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 text-lg">
                        <span className="font-semibold text-gray-900">Totale</span>
                        <span className="font-bold text-gray-900">{result.totale.toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Problemi */}
                {result.problemi && result.problemi.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Problemi rilevati</h3>
                    <ul className="space-y-2">
                      {result.problemi.map((p, i) => (
                        <li key={i} className="flex gap-2 text-red-700 bg-red-50 p-3 rounded-lg">
                          <span className="shrink-0">!</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggerimenti */}
                {result.suggerimenti && result.suggerimenti.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Suggerimenti</h3>
                    <ul className="space-y-2">
                      {result.suggerimenti.map((s, i) => (
                        <li key={i} className="flex gap-2 text-blue-700 bg-blue-50 p-3 rounded-lg">
                          <span className="shrink-0">i</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-center text-gray-600 mb-4">
                    Vuoi un&apos;analisi approfondita con consulenza legale?
                  </p>
                  <div className="flex justify-center">
                    <a
                      href="#contatti"
                      className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Parla con un esperto
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How it works */}
        <section id="come-funziona" className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Come funziona</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Carica la bolletta</h3>
              <p className="text-gray-600">PDF o foto della tua bolletta luce o gas aziendale</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Analisi AI</h3>
              <p className="text-gray-600">L&apos;intelligenza artificiale legge e analizza ogni voce</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Ricevi il report</h3>
              <p className="text-gray-600">Scopri errori, anomalie e opportunità di risparmio</p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="prezzi" className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Piani e prezzi</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Scegli il piano più adatto alle esigenze della tua azienda. Inizia gratis, senza carta di credito.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{PRICING.free.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">{PRICING.free.priceLabel}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {PRICING.free.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={user ? "#" : "/login"}
                className="block w-full py-3 text-center border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                {PRICING.free.cta}
              </a>
            </div>

            {/* Base */}
            <div className="bg-white rounded-xl border-2 border-blue-600 p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                Più popolare
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{PRICING.base.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">{PRICING.base.priceLabel}</span>
                <span className="text-gray-500">{PRICING.base.period}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">oppure {PRICING.base.yearlyLabel} (-17%)</p>
              <ul className="space-y-3 mb-6">
                {PRICING.base.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout("base_monthly")}
                disabled={checkoutLoading === "base_monthly"}
                className="block w-full py-3 text-center bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {checkoutLoading === "base_monthly" ? "Caricamento..." : PRICING.base.cta}
              </button>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{PRICING.pro.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">{PRICING.pro.priceLabel}</span>
                <span className="text-gray-500">{PRICING.pro.period}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">oppure {PRICING.pro.yearlyLabel} (-17%)</p>
              <ul className="space-y-3 mb-6">
                {PRICING.pro.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout("pro_monthly")}
                disabled={checkoutLoading === "pro_monthly"}
                className="block w-full py-3 text-center border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {checkoutLoading === "pro_monthly" ? "Caricamento..." : PRICING.pro.cta}
              </button>
            </div>
          </div>

          {/* Enterprise note */}
          <p className="text-center text-gray-500 mt-8">
            Hai esigenze particolari?{" "}
            <a href="#contatti" className="text-blue-600 hover:underline">
              Contattaci per un piano Enterprise
            </a>
          </p>
        </section>

        {/* Contact */}
        <section id="contatti" className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Contattaci</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Hai domande? Vuoi una consulenza personalizzata? Il nostro team è qui per aiutarti.
          </p>

          <ContactForm />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-24 bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <span className="font-medium text-gray-900">BollettAI</span>
            </div>
            <p className="text-sm text-gray-500">
              Un progetto Fira Software Ltd × Lucio Berardi
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    type: "general",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Errore durante l'invio. Riprova.");
      }

      setSuccess(true);
      setFormData({ name: "", email: "", company: "", type: "general", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">Messaggio inviato!</h3>
        <p className="text-green-700">Ti risponderemo il prima possibile.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome *
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Azienda
          </label>
          <input
            id="company"
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo richiesta
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="general">Informazioni generali</option>
            <option value="legal">Consulenza legale</option>
            <option value="cer">Comunità Energetica (CER)</option>
            <option value="enterprise">Piano Enterprise</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Messaggio *
        </label>
        <textarea
          id="message"
          required
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {loading ? "Invio in corso..." : "Invia messaggio"}
      </button>
    </form>
  );
}
