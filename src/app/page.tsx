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

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function ScaleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
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
      case "promossa": return "text-green-600 bg-green-50 border-green-200";
      case "bocciata": return "text-red-600 bg-red-50 border-red-200";
      case "sufficiente": return "text-amber-600 bg-amber-50 border-amber-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BoltIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">BollettAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#come-funziona" className="hover:text-blue-600 transition-colors">Come funziona</a>
            <a href="#aziende" className="hover:text-blue-600 transition-colors">Per le Aziende</a>
            <a href="#prezzi" className="hover:text-blue-600 transition-colors">Prezzi</a>
            <a href="#contatti" className="hover:text-blue-600 transition-colors">Contatti</a>
          </nav>
          <div className="flex items-center gap-3">
            {authLoading ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Esci
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all"
              >
                Accedi
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-amber-50" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-200/30 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-24">
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <BoltIcon className="w-4 h-4" />
              Analisi AI in 30 secondi
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Stai pagando troppo<br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">per l&apos;energia?</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Carica la tua bolletta e l&apos;intelligenza artificiale ti dirà
              se ci sono errori, costi nascosti o opportunità di risparmio.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">2.500+</p>
                <p className="text-sm text-gray-500">Bollette analizzate</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">€180</p>
                <p className="text-sm text-gray-500">Risparmio medio/anno</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">30 sec</p>
                <p className="text-sm text-gray-500">Tempo di analisi</p>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="max-w-2xl mx-auto">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`
                relative border-2 border-dashed rounded-2xl p-8 text-center transition-all
                ${file
                  ? "border-blue-400 bg-blue-50/50"
                  : "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50/30"}
                shadow-xl shadow-gray-200/50
              `}
            >
              {!file ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-gray-800 mb-2">
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
                    <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25">
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
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                      className="ml-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {preview && (
                    <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl mb-4 shadow-lg" />
                  )}
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="mt-8 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
                {/* Valutazione Header */}
                <div className={`p-6 border-b ${getValutazioneColor(result.valutazione)}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold ${
                      result.valutazione === 'promossa' ? 'bg-green-100' :
                      result.valutazione === 'bocciata' ? 'bg-red-100' : 'bg-amber-100'
                    }`}>
                      {getValutazioneEmoji(result.valutazione)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold capitalize">
                        Bolletta {result.valutazione}
                      </h2>
                      {result.risparmio_potenziale && result.risparmio_potenziale > 0 && (
                        <p className="text-sm opacity-80">
                          Risparmio potenziale: fino a <strong>{result.risparmio_potenziale.toFixed(0)}€/anno</strong>
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
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Fornitore</p>
                        <p className="font-semibold text-gray-900">{result.fornitore}</p>
                      </div>
                    )}
                    {result.pod && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">POD</p>
                        <p className="font-semibold text-gray-900 text-sm">{result.pod}</p>
                      </div>
                    )}
                    {result.periodo_fatturazione && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Periodo</p>
                        <p className="font-semibold text-gray-900">{result.periodo_fatturazione}</p>
                      </div>
                    )}
                    {result.potenza_impegnata && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Potenza</p>
                        <p className="font-semibold text-gray-900">{result.potenza_impegnata}</p>
                      </div>
                    )}
                  </div>

                  {/* Consumi */}
                  {result.consumo_totale_kwh && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Consumi</h3>
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-blue-700">{result.consumo_totale_kwh}</p>
                            <p className="text-xs text-gray-600">kWh totali</p>
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
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        {result.costo_energia !== undefined && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Costo energia</span>
                            <span className="font-semibold">{result.costo_energia.toFixed(2)}€</span>
                          </div>
                        )}
                        {result.oneri_sistema !== undefined && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Oneri di sistema</span>
                            <span className="font-semibold">{result.oneri_sistema.toFixed(2)}€</span>
                          </div>
                        )}
                        {result.imposte !== undefined && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Imposte</span>
                            <span className="font-semibold">{result.imposte.toFixed(2)}€</span>
                          </div>
                        )}
                        <div className="flex justify-between py-2 text-lg">
                          <span className="font-bold text-gray-900">Totale</span>
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
                          <li key={i} className="flex gap-3 text-red-700 bg-red-50 p-4 rounded-xl border border-red-100">
                            <span className="shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-sm font-bold">!</span>
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
                          <li key={i} className="flex gap-3 text-blue-700 bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <span className="shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">i</span>
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
                        className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl hover:from-gray-900 hover:to-black transition-all shadow-lg"
                      >
                        Parla con un esperto
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ShieldIcon className="w-5 h-5 text-green-600" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>Azienda Italiana</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <BoltIcon className="w-5 h-5 text-amber-500" />
              <span>AI Claude di Anthropic</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ScaleIcon className="w-5 h-5 text-purple-600" />
              <span>Consulenza Legale</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="come-funziona" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Come funziona</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tre semplici passi per scoprire se stai pagando il giusto
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative text-center p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                1
              </div>
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Carica la bolletta</h3>
              <p className="text-gray-600">PDF o foto della tua bolletta luce o gas</p>
            </div>

            <div className="relative text-center p-8 bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-100">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                2
              </div>
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-2xl flex items-center justify-center">
                <BoltIcon className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Analisi AI</h3>
              <p className="text-gray-600">L&apos;intelligenza artificiale legge e analizza ogni voce</p>
            </div>

            <div className="relative text-center p-8 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                3
              </div>
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-2xl flex items-center justify-center">
                <ChartIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Ricevi il report</h3>
              <p className="text-gray-600">Scopri errori, anomalie e opportunità di risparmio</p>
            </div>
          </div>
        </div>
      </section>

      {/* Per le Aziende Section */}
      <section id="aziende" className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium mb-6">
              <BuildingIcon className="w-4 h-4" />
              Per le Aziende
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ottimizza i costi energetici<br />della tua azienda
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Funzionalità avanzate per PMI che vogliono risparmiare e accedere agli incentivi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <ChartIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Analisi Multi-Bolletta</h3>
              <p className="text-gray-400 text-sm">
                Carica tutte le bollette dell&apos;anno per un&apos;analisi completa dei consumi e trend stagionali.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                <UsersIcon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Comunità Energetiche (CER)</h3>
              <p className="text-gray-400 text-sm">
                Verifica l&apos;eligibilità e simula gli incentivi GSE per la tua azienda. Fino a €120/MWh.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4">
                <SunIcon className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">ROI Fotovoltaico</h3>
              <p className="text-gray-400 text-sm">
                Calcola il ritorno sull&apos;investimento per un impianto fotovoltaico basato sui tuoi consumi reali.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Transizione 5.0</h3>
              <p className="text-gray-400 text-sm">
                Scanner automatico per verificare l&apos;accesso al credito d&apos;imposta per investimenti in efficienza energetica.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <ScaleIcon className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Consulenza Legale</h3>
              <p className="text-gray-400 text-sm">
                Avvocato dedicato per reclami ARERA, revisione contratti e contenzioso con fornitori.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Account Manager</h3>
              <p className="text-gray-400 text-sm">
                Un referente dedicato per aziende con consumi superiori a €2.000/mese.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a
              href="#contatti"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-xl"
            >
              Richiedi una demo
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="prezzi" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Piani e prezzi</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Scegli il piano più adatto alle tue esigenze. Inizia gratis, senza carta di credito.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{PRICING.free.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">{PRICING.free.priceLabel}</span>
                </div>
                <p className="text-sm text-gray-500">Per sempre gratuito</p>
              </div>
              <ul className="space-y-4 mb-8">
                {PRICING.free.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={user ? "#" : "/login"}
                className="block w-full py-3 text-center border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                {PRICING.free.cta}
              </a>
            </div>

            {/* Base */}
            <div className="relative bg-white rounded-2xl border-2 border-blue-500 p-8 shadow-xl scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-full shadow-lg">
                Più popolare
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{PRICING.base.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">{PRICING.base.priceLabel}</span>
                  <span className="text-gray-500">{PRICING.base.period}</span>
                </div>
                <p className="text-sm text-gray-500">oppure {PRICING.base.yearlyLabel} (-17%)</p>
              </div>
              <ul className="space-y-4 mb-8">
                {PRICING.base.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout("base_monthly")}
                disabled={checkoutLoading === "base_monthly"}
                className="block w-full py-3 text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                {checkoutLoading === "base_monthly" ? "Caricamento..." : PRICING.base.cta}
              </button>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{PRICING.pro.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">{PRICING.pro.priceLabel}</span>
                  <span className="text-gray-500">{PRICING.pro.period}</span>
                </div>
                <p className="text-sm text-gray-500">oppure {PRICING.pro.yearlyLabel} (-17%)</p>
              </div>
              <ul className="space-y-4 mb-8">
                {PRICING.pro.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout("pro_monthly")}
                disabled={checkoutLoading === "pro_monthly"}
                className="block w-full py-3 text-center border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
              >
                {checkoutLoading === "pro_monthly" ? "Caricamento..." : PRICING.pro.cta}
              </button>
            </div>
          </div>

          {/* Enterprise note */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 px-6 py-4 bg-white rounded-2xl border border-gray-200 shadow-lg">
              <BuildingIcon className="w-8 h-8 text-gray-400" />
              <div className="text-left">
                <p className="font-semibold text-gray-900">Hai esigenze particolari?</p>
                <p className="text-sm text-gray-500">Contattaci per un piano Enterprise personalizzato</p>
              </div>
              <a href="#contatti" className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                Contattaci
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contatti" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Contattaci</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hai domande? Vuoi una consulenza personalizzata? Il nostro team è qui per aiutarti.
            </p>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <BoltIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg">BollettAI</span>
                <p className="text-sm text-gray-400">Analisi intelligente delle bollette</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Termini di Servizio</a>
              <a href="#contatti" className="hover:text-white transition-colors">Contatti</a>
            </div>

            <p className="text-sm text-gray-500">
              Fira Software Ltd × Lucio Berardi
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            © 2026 BollettAI. Tutti i diritti riservati.
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
      <div className="max-w-xl mx-auto bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">Messaggio inviato!</h3>
        <p className="text-green-700">Ti risponderemo il prima possibile.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            Nome *
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Mario Rossi"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email *
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="mario@azienda.it"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
            Azienda
          </label>
          <input
            id="company"
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Azienda S.r.l."
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
            Tipo richiesta
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
          >
            <option value="general">Informazioni generali</option>
            <option value="legal">Consulenza legale</option>
            <option value="cer">Comunità Energetica (CER)</option>
            <option value="enterprise">Piano Enterprise</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
          Messaggio *
        </label>
        <textarea
          id="message"
          required
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          placeholder="Come possiamo aiutarti?"
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl hover:from-gray-900 hover:to-black transition-all shadow-lg disabled:opacity-50"
      >
        {loading ? "Invio in corso..." : "Invia messaggio"}
      </button>
    </form>
  );
}
