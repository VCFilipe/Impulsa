
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, LayoutDashboard, CalendarDays, ShieldCheck, Lightbulb, HelpCircle } from 'lucide-react';

interface CarouselSlide {
  id: number;
  icon: React.ReactElement; // Changed from imageUrl to icon
  title: string;
  description: string;
}

const slidesData: CarouselSlide[] = [
  {
    id: 1,
    icon: <LayoutDashboard size={80} className="text-white opacity-90 mb-6" />,
    title: 'Painel de Controle Intuitivo',
    description: 'Visão geral das atividades, eventos e métricas importantes da empresa.',
  },
  {
    id: 2,
    icon: <CalendarDays size={80} className="text-white opacity-90 mb-6" />,
    title: 'Gestão de Eventos Completa',
    description: 'Agende, gerencie presenças e avalie todos os seus eventos corporativos.',
  },
  {
    id: 3,
    icon: <ShieldCheck size={80} className="text-white opacity-90 mb-6" />,
    title: 'Políticas Sempre Acessíveis',
    description: 'Consulte rapidamente todas as políticas e diretrizes da empresa.',
  },
  {
    id: 4,
    icon: <Lightbulb size={80} className="text-white opacity-90 mb-6" />,
    title: 'Inovação e Colaboração',
    description: 'Compartilhe suas ideias, vote em sugestões e participe ativamente das melhorias.',
  },
  {
    id: 5,
    icon: <HelpCircle size={80} className="text-white opacity-90 mb-6" />,
    title: 'Suporte e Informação',
    description: 'Encontre respostas para suas dúvidas no FAQ e mantenha-se informado.',
  }
];

const LoginCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slidesData.length - 1 ? 0 : prev + 1));
  }, []);

  // const prevSlide = () => { // Removed as button is removed
  //   setCurrentSlide((prev) => (prev === 0 ? slidesData.length - 1 : prev - 1));
  // };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 7000); // Muda a cada 7 segundos
    return () => clearInterval(slideInterval);
  }, [nextSlide]);

  return (
    <div className="relative w-full h-full max-w-xl mx-auto rounded-lg overflow-hidden"> {/* Adjusted max-w for better icon focus */}
      {slidesData.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex flex-col justify-center items-center text-center p-8 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {slide.icon}
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4 drop-shadow-md">
            {slide.title}
          </h3>
          <p className="text-base lg:text-lg text-gray-200 mb-6 drop-shadow-sm max-w-md"> {/* Added max-w for description */}
            {slide.description}
          </p>
        </div>
      ))}

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2.5 z-10">
        {slidesData.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            aria-label={`Ir para slide ${index + 1}`}
            className={`w-3 h-3 rounded-full transition-all duration-300
              ${index === currentSlide ? 'bg-white scale-125 shadow-lg' : 'bg-white/40 hover:bg-white/70'}
            `}
          />
        ))}
      </div>

      {/* Navigation Arrows Removed */}
      {/* 
      <button
        onClick={prevSlide}
        aria-label="Slide anterior"
        className="absolute top-1/2 left-2 transform -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Próximo slide"
        className="absolute top-1/2 right-2 transform -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        <ChevronRight size={28} />
      </button>
      */}
    </div>
  );
};

export default LoginCarousel;