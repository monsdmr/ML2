import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ArrowRight, Star, HelpCircle, Search, User, Check } from "lucide-react";
import logo from "@/assets/mercado-livre-logo.png";
import usePageTrack from "@/hooks/usePageTrack";
import banner1 from "@/assets/promo-banner-1.jpg";
import banner2 from "@/assets/promo-banner-2.jpg";
import banner3 from "@/assets/promo-banner-3.jpg";
import banner4 from "@/assets/promo-banner-4.jpg";
import banner5 from "@/assets/promo-banner-5.jpg";
import roletaImg from "@/assets/roleta-premios.png";

const banners = [banner1, banner2, banner3, banner4, banner5];

const questions = [
  {
    question: "¿Cómo evaluás tu experiencia general con Mercado Libre?",
    options: ["Excelente", "Buena", "Aceptable", "Insatisfactoria"],
  },
  {
    question: "¿Cuál es tu opinión sobre la variedad de productos disponibles en Mercado Libre?",
    options: ["Excelente", "Buena", "Aceptable", "Insatisfactoria"],
  },
  {
    question: "¿Cómo evaluás el plazo de entrega de los productos?",
    options: ["Muy rápido", "Rápido", "Normal", "Demorado"],
  },
  {
    question: "¿Cuál es tu opinión sobre los precios en Mercado Libre?",
    options: ["Muy buenos", "Buenos", "Razonables", "Caros"],
  },
  {
    question: "¿Recomendarías Mercado Libre a amigos y familiares?",
    options: ["Seguro que sí", "Probablemente", "Tal vez", "No"],
  },
];

const Quiz = () => {
  usePageTrack("quiz");
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [participantes, setParticipantes] = useState(() => Math.floor(Math.random() * 500) + 1500);

  useEffect(() => {
    
    banners.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticipantes((prev) => {
        const change = Math.floor(Math.random() * 15) - 5;
        return Math.max(1400, prev + change);
      });
    }, 2000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    if (!selectedOption) return;
    if (currentStep < questions.length - 1) {
      setCurrentStep((s) => s + 1);
      setSelectedOption(null);
    } else {
      
      setFinished(true);
    }
  };

  if (finished) {
    const progressFull = 100;
    return (
      <div className="flex min-h-svh flex-col bg-background">
        <header className="flex items-center justify-between bg-accent px-4 py-2.5 sm:px-6">
          <img src={logo} alt="Mercado Libre" className="h-8 w-8 sm:h-9 sm:w-9 object-contain" />
          <div className="flex items-center gap-3 text-accent-foreground">
            <Search className="h-5 w-5" />
            <User className="h-5 w-5" />
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center px-3 py-4 sm:px-4 sm:py-8">
          <div className="mb-4 w-full max-w-lg rounded-xl bg-card px-4 py-3 shadow-sm">
            <p className="text-sm text-muted-foreground">
              <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="font-bold text-card-foreground">{participantes.toLocaleString("en-US")}</span>{" "}
              personas participando ahora
            </p>
          </div>

          <div className="mb-4 w-full max-w-lg rounded-xl bg-card px-4 py-5 shadow-sm">
            <div className="flex items-center justify-center gap-0">
              {questions.map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground text-sm font-bold">
                    <Check className="h-5 w-5" />
                  </div>
                  {i < questions.length - 1 && (
                    <div className="h-0.5 w-4 sm:w-6 bg-primary" />
                  )}
                </div>
              ))}
              <div className="flex items-center">
                <div className="h-0.5 w-4 sm:w-6 bg-primary" />
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-accent bg-accent text-accent-foreground">
                  <Star className="h-4 w-4" />
                </div>
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progressFull}%` }} />
            </div>
            <p className="mt-2 text-center text-sm font-semibold text-card-foreground">¡Completo!</p>
          </div>

          <div className="w-full max-w-lg rounded-xl bg-card px-4 py-6 sm:px-6 sm:py-8 shadow-sm text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
              <span className="text-4xl">🏆</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-card-foreground">¡Felicitaciones!</h2>
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Cuestionario completo</span>
            </div>
            <p className="mb-1 text-sm text-muted-foreground">
              Como agradecimiento, ganaste{" "}
              <span className="font-bold text-card-foreground">¡acceso gratis a nuestra promoción limitada de aniversario de Mercado Libre!</span>
            </p>
            <p className="mb-5 text-sm text-muted-foreground">
              Podés <span className="font-bold text-card-foreground">girar la Ruleta de Premios 2 veces</span> y elegir tu producto favorito.
            </p>

            <div className="mx-auto mb-2 overflow-hidden rounded-xl border border-border">
              <img src={roletaImg} alt="Ruleta de Premios" className="w-full object-cover" />
            </div>
            <p className="mb-5 text-xs text-muted-foreground">¡Girá y descubrí tu próximo premio!</p>

            <button
              onClick={() => navigate("/ruleta")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-4 text-base font-bold uppercase tracking-widest text-accent-foreground shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              🎁 RECLAMAR MI PREMIO
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Mercado Libre — Acción conmemorativa de aniversario.
            <br />
            Cuestionario por tiempo limitado.
          </p>
        </div>
      </div>
    );
  }

  const progress = ((currentStep) / questions.length) * 100;

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between bg-accent px-4 py-2.5 sm:px-6">
        <img src={logo} alt="Mercado Libre" className="h-8 w-8 sm:h-9 sm:w-9 object-contain" />
        <div className="flex items-center gap-3 text-accent-foreground">
          <Search className="h-5 w-5" />
          <User className="h-5 w-5" />
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center px-3 py-4 sm:px-4 sm:py-8">
        <div className="mb-4 w-full max-w-lg rounded-xl bg-card px-4 py-3 shadow-sm">
          <p className="text-sm text-muted-foreground">
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="font-bold text-card-foreground">{participantes.toLocaleString("en-US")}</span>{" "}
            personas participando ahora
          </p>
        </div>

        <div className="mb-2 w-full max-w-lg rounded-xl bg-card px-4 py-5 shadow-sm">
          <div className="flex items-center justify-center gap-0 sm:gap-0">
            {questions.map((_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 ${
                    i === currentStep
                      ? "border-accent bg-accent text-accent-foreground scale-110"
                      : i < currentStep
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {i < currentStep ? <Check className="h-5 w-5" /> : i + 1}
                </div>
                {i < questions.length - 1 && (
                  <div className={`h-0.5 w-4 sm:w-6 ${i < currentStep ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
            <div className="flex items-center">
              <div className={`h-0.5 w-4 sm:w-6 ${finished ? "bg-primary" : "bg-border"}`} />
              <div
                className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  finished
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                <Star className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Pregunta <span className="font-bold text-card-foreground">{currentStep + 1} de {questions.length}</span>
          </p>
        </div>

        <div className="mb-4 w-full max-w-lg overflow-hidden rounded-xl shadow-sm">
          <img
            key={currentStep}
            src={banners[currentStep] || banner1}
            alt="Promoción imperdible"
            className="w-full object-cover"
          />
        </div>

        <div className="w-full max-w-lg rounded-xl bg-card px-4 py-5 sm:px-6 sm:py-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-accent" />
            <span className="text-xs font-bold uppercase tracking-wider text-accent-foreground/70">
              Pregunta {currentStep + 1} de {questions.length}
            </span>
          </div>

          <h2 className="mb-5 text-base sm:text-lg font-bold text-card-foreground">
            {questions[currentStep].question}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {questions[currentStep].options.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedOption(option)}
                className={`rounded-xl border-2 px-3 py-4 text-sm font-medium transition-all duration-200 ${
                  selectedOption === option
                    ? "border-primary bg-primary/10 text-primary font-bold"
                    : "border-border bg-card text-card-foreground hover:border-muted-foreground/40"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold uppercase tracking-widest transition-all ${
              selectedOption
                ? "bg-accent text-accent-foreground shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            SIGUIENTE <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Mercado Libre — Acción conmemorativa de aniversario.
          <br />
          Cuestionario por tiempo limitado.
        </p>
      </div>
    </div>
  );
};

export default Quiz;