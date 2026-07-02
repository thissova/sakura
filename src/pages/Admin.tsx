import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useContent } from "../contexts/ContentContext";
import { Link } from "react-router-dom";
import {
  LogOut,
  ExternalLink,
  RefreshCw,
  Check,
  Upload,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  GripVertical,
  X,
  Save,
} from "lucide-react";
import { ICON_OPTIONS } from "../utils/serviceIcons";

function BulletsEditor({
  bullets,
  onChange,
}: {
  bullets: string[];
  onChange: (next: string[]) => void;
}) {
  const items = bullets ?? [];

  const update = (i: number, val: string) => {
    const next = [...items];
    next[i] = val;
    onChange(next);
  };

  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  const add = () => onChange([...items, ""]);

  return (
    <div className="space-y-2">
      {items.map((bullet, i) => (
        <div key={i} className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
          <input
            type="text"
            value={bullet}
            onChange={(e) => update(i, e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-sakura-green focus:ring-1 focus:ring-sakura-green/20 outline-none text-sm transition-all"
            placeholder="Položka seznamu..."
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="p-1.5 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-2 text-sm text-sakura-green hover:text-sakura-green/70 font-medium mt-1 transition-colors">
        <Plus className="w-4 h-4" />
        Přidat položku
      </button>
    </div>
  );
}

export function Admin() {
  const { isAuthenticated, login, logout } = useAuth();
  const {
    services,
    updateService,
    addService,
    deleteService,
    reorderServices,
    saveAll,
    resetToDefaults,
  } = useContent();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [expandedBullets, setExpandedBullets] = useState<string | null>(null);
  const dragIndex = React.useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = await login(email, password);
    setError(err ?? "");
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageUpload = async (serviceId: string, file: File) => {
    setUploadingId(serviceId);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`/api/upload/${serviceId}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.path) {
        updateService(serviceId, { image: data.path });
        showToast("Obrázek nahrán a uložen");
      }
    } catch {
      showToast("Chyba při nahrávání obrázku");
    } finally {
      setUploadingId(null);
    }
  };

  const handleAddService = () => {
    const id = `sluzba-${Date.now()}`;
    addService({
      id,
      name: "Nová služba",
      description: "",
      price: "",
      image: "",
      pricingDesc: "",
      showOnHome: false,
      bullets: [],
    });
    showToast("Nová služba přidána");
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Opravdu chcete smazat službu "${name}"?`)) {
      deleteService(id);
      showToast("Služba smazána");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-sakura-cream flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2rem] shadow-xl max-w-md w-full border border-sakura-pink/20">
          <h1 className="font-serif text-4xl font-bold text-sakura-green mb-8 text-center">
            Přihlášení
          </h1>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#1A1A1A]">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-sakura-green focus:ring-2 focus:ring-sakura-green/20 outline-none transition-all bg-sakura-cream/50"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#1A1A1A]">
                Heslo
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-sakura-green focus:ring-2 focus:ring-sakura-green/20 outline-none transition-all bg-sakura-cream/50"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-sakura-pink text-white px-6 py-4 rounded-xl font-medium hover:bg-[#D67A92] transition-colors shadow-md">
              Přihlásit se
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sakura-cream pb-24">
      {/* Header */}
      <header className="bg-white border-b border-sakura-pink/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold text-sakura-green">
            Administrace — SAKURA úklidové služby
          </h1>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-sakura-pink transition-colors font-medium">
              <ExternalLink className="w-5 h-5" />
              Zobrazit web
            </Link>
            <div className="w-px h-6 bg-gray-200 mx-2" />
            <button
              onClick={logout}
              className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors font-medium">
              <LogOut className="w-5 h-5" />
              Odhlásit se
            </button>
          </div>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-sakura-green text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50">
          <Check className="w-5 h-5" />
          <span className="font-medium">{toast}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-serif font-bold text-sakura-green mb-2">
              Správa služeb
            </h2>
            <p className="text-gray-600">
              Upravte texty, ceny a fotografie služeb. Změny se projeví
              okamžitě.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Opravdu chcete obnovit všechny služby do původního stavu?",
                  )
                ) {
                  resetToDefaults();
                  showToast("Obnoveno do výchozího stavu");
                }
              }}
              className="flex items-center gap-2 text-gray-500 hover:text-sakura-green transition-colors px-4 py-2 rounded-lg hover:bg-sakura-green/10 text-sm">
              <RefreshCw className="w-4 h-4" />
              Obnovit výchozí
            </button>
            <button
              onClick={handleAddService}
              className="flex items-center gap-2 bg-sakura-green/10 text-sakura-green px-5 py-2.5 rounded-xl font-medium hover:bg-sakura-green/20 transition-colors text-sm">
              <Plus className="w-4 h-4" />
              Přidat službu
            </button>
            <button
              onClick={() => {
                saveAll();
                showToast("Vše uloženo ✓");
              }}
              className="flex items-center gap-2 bg-sakura-green text-white px-5 py-2.5 rounded-xl font-medium hover:bg-sakura-green/80 transition-colors shadow-sm text-sm">
              <Save className="w-4 h-4" />
              Uložit vše
            </button>
          </div>
        </div>

        <div className="grid gap-8">
          {services.map((service, index) => (
            <div
              key={service.id}
              draggable
              onDragStart={() => {
                dragIndex.current = index;
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(index);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => {
                if (dragIndex.current !== null && dragIndex.current !== index) {
                  reorderServices(dragIndex.current, index);
                }
                dragIndex.current = null;
                setDragOver(null);
              }}
              onDragEnd={() => {
                dragIndex.current = null;
                setDragOver(null);
              }}
              className={`bg-white rounded-[2rem] p-8 shadow-sm border-2 flex flex-col lg:flex-row gap-10 transition-all cursor-grab active:cursor-grabbing ${
                dragOver === index
                  ? "border-sakura-green bg-[#E8F0E6]/30 scale-[1.01]"
                  : "border-sakura-pink/20"
              }`}>
              {/* Drag handle */}
              <div className="hidden lg:flex flex-col items-center justify-center text-gray-300 hover:text-gray-400 transition-colors -ml-2 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-6 h-6" />
              </div>

              {/* Image column */}
              <div className="w-full lg:w-1/3 flex-shrink-0 space-y-4">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-sakura-cream border border-gray-100 relative">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm">
                      Bez obrázku
                    </div>
                  )}
                  {uploadingId === service.id && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <label className="flex items-center justify-center gap-2 w-full bg-sakura-green/10 hover:bg-sakura-green/20 text-sakura-green px-4 py-3 rounded-xl font-medium cursor-pointer transition-colors text-sm">
                  <Upload className="w-4 h-4" />
                  {service.image ? "Změnit fotografii" : "Nahrát fotografii"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(service.id, file);
                      e.target.value = "";
                    }}
                  />
                </label>

                <button
                  disabled={!service.image}
                  onClick={() => {
                    updateService(service.id, {
                      showOnHome: !service.showOnHome,
                    });
                    showToast(
                      service.showOnHome
                        ? "Skryto z úvodní stránky"
                        : "Zobrazeno na úvodní stránce",
                    );
                  }}
                  className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-medium transition-colors text-sm border-2 ${
                    !service.image
                      ? "opacity-40 cursor-not-allowed border-gray-200 text-gray-400"
                      : service.showOnHome
                        ? "border-sakura-green bg-[#E8F0E6] text-sakura-green hover:bg-[#D1E0CE]"
                        : "border-gray-200 text-gray-500 hover:border-sakura-green/40 hover:bg-sakura-cream"
                  }`}>
                  {service.showOnHome ? (
                    <>
                      <Eye className="w-4 h-4" /> Zobrazeno na Úvodu
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" /> Skryto z Úvodu
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(service.id, service.name)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-medium transition-colors text-sm border-2 border-red-100 text-red-400 hover:border-red-300 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                  Smazat službu
                </button>
              </div>

              {/* Text fields */}
              <div className="w-full lg:w-2/3 space-y-6">
                {/* Icon picker */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1A1A1A]">
                    Ikonka
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map((opt) => {
                      const active =
                        (service.icon ?? "") === opt.id ||
                        (!service.icon &&
                          opt.id ===
                            (() => {
                              const m: Record<string, string> = {
                                pravidelny: "Calendar",
                                generalni: "Home",
                                okna: "Droplets",
                                zehleni: "Shirt",
                                kancelare: "Briefcase",
                                spolecne: "Building2",
                                tepovani: "Sparkles",
                              };
                              return m[service.id] ?? "Check";
                            })());
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          title={opt.label}
                          onClick={() => {
                            updateService(service.id, { icon: opt.id });
                            showToast("Ikonka uložena");
                          }}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 ${
                            active
                              ? "border-sakura-green bg-[#E8F0E6] text-sakura-green"
                              : "border-gray-200 text-gray-400 hover:border-sakura-green/40 hover:text-sakura-green/70"
                          }`}>
                          <opt.Icon className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Czech fields */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">🇨🇿 Česky</span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#1A1A1A]">
                      Název služby
                    </label>
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) =>
                        updateService(service.id, { name: e.target.value })
                      }
                      onBlur={() => showToast("Název uložen")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sakura-green focus:ring-2 focus:ring-sakura-green/20 outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#1A1A1A]">
                      Cena (pro Ceník)
                    </label>
                    <input
                      type="text"
                      value={service.price}
                      onChange={(e) =>
                        updateService(service.id, { price: e.target.value })
                      }
                      onBlur={() => showToast("Cena uložena")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sakura-green focus:ring-2 focus:ring-sakura-green/20 outline-none transition-all font-medium text-sakura-pink"
                      placeholder="např. 290 Kč / hod"
                      disabled={service.hasSelect}
                    />
                    {service.hasSelect && (
                      <p className="text-xs text-gray-500">
                        Tato služba používá výběr z možností.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1A1A1A]">
                    Popis
                  </label>
                  <textarea
                    value={service.description}
                    onChange={(e) =>
                      updateService(service.id, { description: e.target.value })
                    }
                    onBlur={() => showToast("Popis uložen")}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sakura-green focus:ring-2 focus:ring-sakura-green/20 outline-none transition-all resize-none"
                    placeholder="Krátký popis nebo citát..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1A1A1A]">
                    Doplňující text (pro Ceník)
                  </label>
                  <input
                    type="text"
                    value={service.pricingDesc || ""}
                    onChange={(e) =>
                      updateService(service.id, { pricingDesc: e.target.value })
                    }
                    onBlur={() => showToast("Doplňující text uložen")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sakura-green focus:ring-2 focus:ring-sakura-green/20 outline-none transition-all"
                    placeholder="např. 1× týdně / 1× za 2 týdny"
                  />
                </div>

                {/* CZ Bullets editor */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedBullets(
                        expandedBullets === service.id ? null : service.id,
                      )
                    }
                    className="flex items-center justify-between w-full text-sm font-semibold text-[#1A1A1A] hover:text-sakura-green transition-colors">
                    <span>
                      Seznam „Zahrnuje" — {(service.bullets ?? []).length} položek
                    </span>
                    <span className="text-gray-400 font-normal">
                      {expandedBullets === service.id ? "▲ skrýt" : "▼ upravit"}
                    </span>
                  </button>
                  {expandedBullets === service.id && (
                    <BulletsEditor
                      bullets={service.bullets ?? []}
                      onChange={(next) => updateService(service.id, { bullets: next })}
                    />
                  )}
                </div>

                {/* English fields */}
                <div className="border-t border-dashed border-gray-200 pt-4 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">🇬🇧 English</span>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#1A1A1A]">
                      Service name (EN)
                    </label>
                    <input
                      type="text"
                      value={service.name_en || ""}
                      onChange={(e) =>
                        updateService(service.id, { name_en: e.target.value })
                      }
                      onBlur={() => showToast("EN name saved")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sakura-green focus:ring-2 focus:ring-sakura-green/20 outline-none transition-all font-medium"
                      placeholder="e.g. Regular cleaning"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#1A1A1A]">
                      Description (EN)
                    </label>
                    <textarea
                      value={service.description_en || ""}
                      onChange={(e) =>
                        updateService(service.id, { description_en: e.target.value })
                      }
                      onBlur={() => showToast("EN description saved")}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sakura-green focus:ring-2 focus:ring-sakura-green/20 outline-none transition-all resize-none"
                      placeholder="Short description or quote..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#1A1A1A]">
                      Pricing note (EN)
                    </label>
                    <input
                      type="text"
                      value={service.pricingDesc_en || ""}
                      onChange={(e) =>
                        updateService(service.id, { pricingDesc_en: e.target.value })
                      }
                      onBlur={() => showToast("EN pricing note saved")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sakura-green focus:ring-2 focus:ring-sakura-green/20 outline-none transition-all"
                      placeholder="e.g. weekly / bi-weekly"
                    />
                  </div>

                  {/* EN Bullets editor */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-[#1A1A1A]">
                      "Includes" list (EN) — {(service.bullets_en ?? []).length} items
                    </p>
                    <BulletsEditor
                      bullets={service.bullets_en ?? []}
                      onChange={(next) => updateService(service.id, { bullets_en: next })}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
