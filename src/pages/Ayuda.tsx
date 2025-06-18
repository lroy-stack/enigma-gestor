import React, { useState } from 'react';
import { 
  HelpCircle, MessageCircle, Phone, Mail, Search, Book, 
  FileText, Video, Download, ExternalLink, ChevronRight,
  Clock, CheckCircle, AlertCircle, Users, Settings,
  Calendar, Grid3X3, BarChart3, Smartphone, Globe,
  Star, Heart, Shield, Zap, Headphones, Send
} from 'lucide-react';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';

export default function Ayuda() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Datos de canal de soporte
  const supportChannels = [
    {
      id: 'chat',
      title: 'Chat en Vivo',
      description: 'Soporte inmediato con nuestro equipo',
      icon: MessageCircle,
      color: '#237584',
      status: 'Disponible',
      responseTime: '< 2 min',
      availability: '24/7',
      action: () => console.log('Abrir chat')
    },
    {
      id: 'phone',
      title: 'Soporte Telefónico',
      description: 'Llamada directa con especialistas',
      icon: Phone,
      color: '#9FB289',
      status: 'Disponible',
      responseTime: '< 5 min',
      availability: '9:00 - 22:00',
      action: () => console.log('Llamar soporte')
    },
    {
      id: 'email',
      title: 'Email de Soporte',
      description: 'Consultas detalladas por correo',
      icon: Mail,
      color: '#CB5910',
      status: 'Disponible',
      responseTime: '< 2 horas',
      availability: '24/7',
      action: () => console.log('Enviar email')
    },
    {
      id: 'remote',
      title: 'Asistencia Remota',
      description: 'Conexión directa para resolución',
      icon: Smartphone,
      color: '#237584',
      status: 'Bajo solicitud',
      responseTime: '< 30 min',
      availability: '9:00 - 18:00',
      action: () => console.log('Solicitar asistencia')
    }
  ];

  // Categorías de documentación
  const documentationCategories = [
    {
      id: 'getting-started',
      title: 'Primeros Pasos',
      description: 'Configuración inicial y tour de la aplicación',
      icon: Zap,
      color: '#9FB289',
      articles: [
        { title: 'Configuración inicial del restaurante', time: '5 min', type: 'video' },
        { title: 'Tour por la interfaz principal', time: '3 min', type: 'guide' },
        { title: 'Creación de tu primera reserva', time: '4 min', type: 'tutorial' },
        { title: 'Configuración de mesas y zonas', time: '8 min', type: 'video' }
      ]
    },
    {
      id: 'reservations',
      title: 'Gestión de Reservas',
      description: 'Todo sobre el manejo de reservas',
      icon: Calendar,
      color: '#237584',
      articles: [
        { title: 'Crear y modificar reservas', time: '6 min', type: 'tutorial' },
        { title: 'Estados de reserva y flujo de trabajo', time: '4 min', type: 'guide' },
        { title: 'Gestión de no-shows y cancelaciones', time: '5 min', type: 'guide' },
        { title: 'Reservas por origen (web, teléfono, etc.)', time: '7 min', type: 'video' },
        { title: 'Automatización de confirmaciones', time: '3 min', type: 'tutorial' }
      ]
    },
    {
      id: 'customers',
      title: 'Gestión de Clientes',
      description: 'CRM y base de datos de clientes',
      icon: Users,
      color: '#CB5910',
      articles: [
        { title: 'Crear perfiles de cliente completos', time: '4 min', type: 'tutorial' },
        { title: 'Sistema de etiquetas y clasificación', time: '5 min', type: 'guide' },
        { title: 'Gestión de clientes VIP', time: '6 min', type: 'video' },
        { title: 'Historial de visitas y preferencias', time: '3 min', type: 'guide' },
        { title: 'Alertas y notas de cliente', time: '4 min', type: 'tutorial' }
      ]
    },
    {
      id: 'tables',
      title: 'Gestión de Mesas',
      description: 'Configuración y manejo del plano',
      icon: Grid3X3,
      color: '#9FB289',
      articles: [
        { title: 'Diseño del plano del restaurante', time: '10 min', type: 'video' },
        { title: 'Combinación y división de mesas', time: '5 min', type: 'tutorial' },
        { title: 'Zonas y tipos de mesa', time: '4 min', type: 'guide' },
        { title: 'Estados de mesa en tiempo real', time: '3 min', type: 'guide' }
      ]
    },
    {
      id: 'analytics',
      title: 'Analíticas y Reportes',
      description: 'Métricas y análisis de rendimiento',
      icon: BarChart3,
      color: '#237584',
      articles: [
        { title: 'Dashboard de métricas principales', time: '5 min', type: 'guide' },
        { title: 'Reportes de ocupación y ingresos', time: '7 min', type: 'video' },
        { title: 'Análisis de tendencias de reservas', time: '6 min', type: 'tutorial' },
        { title: 'Exportación de datos', time: '3 min', type: 'guide' }
      ]
    },
    {
      id: 'settings',
      title: 'Configuración Avanzada',
      description: 'Personalización y ajustes del sistema',
      icon: Settings,
      color: '#CB5910',
      articles: [
        { title: 'Configuración de horarios de operación', time: '4 min', type: 'tutorial' },
        { title: 'Gestión de usuarios y permisos', time: '8 min', type: 'video' },
        { title: 'Integraciones externas', time: '6 min', type: 'guide' },
        { title: 'Copias de seguridad y respaldos', time: '5 min', type: 'tutorial' },
        { title: 'Notificaciones y alertas', time: '4 min', type: 'guide' }
      ]
    }
  ];

  // Preguntas frecuentes
  const faqData = [
    {
      category: 'general',
      question: '¿Cómo empiezo a usar Enigma GESTOR?',
      answer: 'Comienza configurando la información básica de tu restaurante en la sección de Configuración, luego crea el plano de tu restaurante en Gestión de Mesas y ya estarás listo para recibir tus primeras reservas.'
    },
    {
      category: 'reservations',
      question: '¿Puedo modificar una reserva después de crearla?',
      answer: 'Sí, puedes modificar cualquier aspecto de una reserva: fecha, hora, número de comensales, mesa asignada, y agregar notas especiales. Los cambios se reflejan inmediatamente en el sistema.'
    },
    {
      category: 'customers',
      question: '¿Cómo marco a un cliente como VIP?',
      answer: 'En el perfil del cliente, activa el toggle de "Estado VIP". Los clientes VIP aparecerán destacados en todas las reservas y recibirán tratamiento prioritario en el sistema.'
    },
    {
      category: 'tables',
      question: '¿Puedo cambiar la distribución de mesas en tiempo real?',
      answer: 'Sí, puedes mover, combinar o dividir mesas en cualquier momento. Los cambios se aplicarán inmediatamente y afectarán a las nuevas reservas, no a las existentes.'
    },
    {
      category: 'technical',
      question: '¿Qué navegadores son compatibles?',
      answer: 'Enigma GESTOR funciona en todos los navegadores modernos: Chrome, Firefox, Safari, Edge. Recomendamos mantener tu navegador actualizado para la mejor experiencia.'
    },
    {
      category: 'technical',
      question: '¿Los datos están seguros?',
      answer: 'Sí, utilizamos encriptación de nivel bancario y copias de seguridad automáticas. Todos los datos se almacenan en servidores seguros con certificación ISO 27001.'
    }
  ];

  const getArticleIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'tutorial': return Book;
      case 'guide': return FileText;
      default: return FileText;
    }
  };

  const getArticleColor = (type: string) => {
    switch (type) {
      case 'video': return '#CB5910';
      case 'tutorial': return '#237584';
      case 'guide': return '#9FB289';
      default: return '#237584';
    }
  };

  const filteredCategories = selectedCategory === 'all' 
    ? documentationCategories 
    : documentationCategories.filter(cat => cat.id === selectedCategory);

  const filteredFAQ = searchQuery
    ? faqData.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqData;

  return (
    <div className="font-sf">
      {/* Header estático */}
      <div className="bg-white/95 backdrop-blur-ios border border-enigma-neutral-200/50 rounded-3xl shadow-sm mb-6">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="ios-text-large-title font-bold text-enigma-neutral-900">
                Centro de Ayuda
              </h1>
              <p className="ios-text-footnote text-enigma-neutral-600 mt-1">
                Soporte y Documentación • {currentTime.toLocaleTimeString('es-ES')}
              </p>
            </div>
            <div className="flex gap-3">
              <IOSButton 
                variant="outline"
                className="border-2 text-white shadow-ios"
                style={{ 
                  backgroundColor: '#9FB289',
                  borderColor: '#9FB289'
                }}
              >
                <Download size={20} className="mr-2" />
                Descargar Guía
              </IOSButton>
              <IOSButton 
                variant="primary"
                className="text-white shadow-ios"
                style={{ 
                  backgroundColor: '#237584',
                  borderColor: '#237584'
                }}
              >
                <Headphones size={20} className="mr-2" />
                Contactar Soporte
              </IOSButton>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de soporte */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <IOSCard variant="elevated" className="ios-touch-feedback hover:scale-102 transition-all duration-200">
          <IOSCardContent className="enigma-spacing-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="ios-text-footnote text-enigma-neutral-600 mb-2 font-medium uppercase tracking-wide">
                  Tiempo Respuesta
                </p>
                <p className="ios-text-title1 font-bold mb-1" style={{ color: '#9FB289' }}>
                  &lt; 2min
                </p>
                <p className="ios-text-caption1 text-enigma-neutral-500 leading-relaxed">
                  Promedio actual
                </p>
              </div>
              <div 
                className="w-14 h-14 rounded-ios-lg flex items-center justify-center shadow-ios"
                style={{ backgroundColor: '#9FB28915' }}
              >
                <Clock size={28} color="#9FB289" />
              </div>
            </div>
          </IOSCardContent>
        </IOSCard>

        <IOSCard variant="elevated" className="ios-touch-feedback hover:scale-102 transition-all duration-200">
          <IOSCardContent className="enigma-spacing-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="ios-text-footnote text-enigma-neutral-600 mb-2 font-medium uppercase tracking-wide">
                  Satisfacción
                </p>
                <p className="ios-text-title1 font-bold mb-1" style={{ color: '#CB5910' }}>
                  98.5%
                </p>
                <p className="ios-text-caption1 text-enigma-neutral-500 leading-relaxed">
                  Clientes satisfechos
                </p>
              </div>
              <div 
                className="w-14 h-14 rounded-ios-lg flex items-center justify-center shadow-ios"
                style={{ backgroundColor: '#CB591015' }}
              >
                <Star size={28} color="#CB5910" />
              </div>
            </div>
          </IOSCardContent>
        </IOSCard>

        <IOSCard variant="elevated" className="ios-touch-feedback hover:scale-102 transition-all duration-200">
          <IOSCardContent className="enigma-spacing-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="ios-text-footnote text-enigma-neutral-600 mb-2 font-medium uppercase tracking-wide">
                  Documentos
                </p>
                <p className="ios-text-title1 font-bold mb-1" style={{ color: '#237584' }}>
                  45+
                </p>
                <p className="ios-text-caption1 text-enigma-neutral-500 leading-relaxed">
                  Guías disponibles
                </p>
              </div>
              <div 
                className="w-14 h-14 rounded-ios-lg flex items-center justify-center shadow-ios"
                style={{ backgroundColor: '#23758415' }}
              >
                <Book size={28} color="#237584" />
              </div>
            </div>
          </IOSCardContent>
        </IOSCard>

        <IOSCard variant="elevated" className="ios-touch-feedback hover:scale-102 transition-all duration-200">
          <IOSCardContent className="enigma-spacing-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="ios-text-footnote text-enigma-neutral-600 mb-2 font-medium uppercase tracking-wide">
                  Disponibilidad
                </p>
                <p className="ios-text-title1 font-bold mb-1" style={{ color: '#9FB289' }}>
                  24/7
                </p>
                <p className="ios-text-caption1 text-enigma-neutral-500 leading-relaxed">
                  Soporte activo
                </p>
              </div>
              <div 
                className="w-14 h-14 rounded-ios-lg flex items-center justify-center shadow-ios"
                style={{ backgroundColor: '#9FB28915' }}
              >
                <Shield size={28} color="#9FB289" />
              </div>
            </div>
          </IOSCardContent>
        </IOSCard>
      </div>

      {/* Canal de Soporte */}
      <IOSCard variant="glass" className="mb-8">
        <IOSCardHeader>
          <IOSCardTitle className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-ios-lg flex items-center justify-center shadow-ios"
              style={{ backgroundColor: '#23758420', color: '#237584' }}
            >
              <Headphones size={24} />
            </div>
            <div>
              <h2 className="ios-text-title2 font-bold text-enigma-neutral-900">
                Canal de Soporte
              </h2>
              <p className="ios-text-footnote text-enigma-neutral-600 mt-1">
                Múltiples formas de obtener ayuda inmediata
              </p>
            </div>
          </IOSCardTitle>
        </IOSCardHeader>
        <IOSCardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportChannels.map((channel) => (
              <div
                key={channel.id}
                className="p-4 rounded-ios-lg border border-enigma-neutral-200 hover:border-enigma-primary/50 transition-all duration-200 ios-touch-feedback cursor-pointer"
                onClick={channel.action}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-ios flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${channel.color}20`, color: channel.color }}
                  >
                    <channel.icon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="ios-text-callout font-semibold text-enigma-neutral-900">
                        {channel.title}
                      </h3>
                      <IOSBadge 
                        variant="custom"
                        className="text-white"
                        style={{ backgroundColor: channel.color }}
                      >
                        {channel.status}
                      </IOSBadge>
                    </div>
                    <p className="ios-text-footnote text-enigma-neutral-600 mb-3 leading-relaxed">
                      {channel.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-ios-caption2 text-enigma-neutral-500">
                      <div>
                        <span className="font-medium">Respuesta:</span> {channel.responseTime}
                      </div>
                      <div>
                        <span className="font-medium">Horario:</span> {channel.availability}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-enigma-neutral-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </IOSCardContent>
      </IOSCard>

      {/* Búsqueda y filtros */}
      <IOSCard variant="glass" className="mb-6">
        <IOSCardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Búsqueda */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search 
                  size={20} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-enigma-neutral-400" 
                />
                <input
                  type="text"
                  placeholder="Buscar en documentación y FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-ios border border-enigma-neutral-200 bg-white ios-text-callout focus:border-enigma-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Filtros de categoría */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-ios ios-text-footnote font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'text-white shadow-ios'
                    : 'bg-enigma-neutral-100 text-enigma-neutral-700 hover:bg-enigma-neutral-200'
                }`}
                style={selectedCategory === 'all' ? { backgroundColor: '#237584' } : {}}
              >
                Todas las Categorías
              </button>
            </div>
          </div>
        </IOSCardContent>
      </IOSCard>

      {/* Documentación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {filteredCategories.map((category) => (
          <IOSCard key={category.id} variant="elevated" className="ios-touch-feedback">
            <IOSCardHeader className="border-b border-enigma-neutral-200">
              <IOSCardTitle className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-ios flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                  <category.icon size={20} />
                </div>
                <div>
                  <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
                    {category.title}
                  </h3>
                  <p className="ios-text-caption1 text-enigma-neutral-600 mt-0.5">
                    {category.description}
                  </p>
                </div>
              </IOSCardTitle>
            </IOSCardHeader>
            <IOSCardContent className="p-4">
              <div className="space-y-3">
                {category.articles.map((article, index) => {
                  const ArticleIcon = getArticleIcon(article.type);
                  const articleColor = getArticleColor(article.type);
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-ios hover:bg-enigma-neutral-50 transition-colors cursor-pointer ios-touch-feedback"
                    >
                      <div 
                        className="w-8 h-8 rounded-ios flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${articleColor}20`, color: articleColor }}
                      >
                        <ArticleIcon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="ios-text-callout font-medium text-enigma-neutral-900 truncate">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="ios-text-caption2 text-enigma-neutral-500">
                            {article.time}
                          </span>
                          <IOSBadge variant="custom" style={{ backgroundColor: `${articleColor}20`, color: articleColor }}>
                            {article.type}
                          </IOSBadge>
                        </div>
                      </div>
                      <ExternalLink size={16} className="text-enigma-neutral-400 flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            </IOSCardContent>
          </IOSCard>
        ))}
      </div>

      {/* Preguntas Frecuentes */}
      <IOSCard variant="glass">
        <IOSCardHeader>
          <IOSCardTitle className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-ios-lg flex items-center justify-center shadow-ios"
              style={{ backgroundColor: '#CB591020', color: '#CB5910' }}
            >
              <HelpCircle size={24} />
            </div>
            <div>
              <h2 className="ios-text-title2 font-bold text-enigma-neutral-900">
                Preguntas Frecuentes
              </h2>
              <p className="ios-text-footnote text-enigma-neutral-600 mt-1">
                Respuestas a las consultas más comunes
              </p>
            </div>
          </IOSCardTitle>
        </IOSCardHeader>
        <IOSCardContent className="p-6">
          <div className="space-y-4">
            {filteredFAQ.map((faq, index) => (
              <div key={index} className="border border-enigma-neutral-200 rounded-ios-lg overflow-hidden">
                <div className="p-4 bg-enigma-neutral-50">
                  <h3 className="ios-text-callout font-semibold text-enigma-neutral-900 flex items-center gap-2">
                    <HelpCircle size={16} className="text-enigma-primary flex-shrink-0" />
                    {faq.question}
                  </h3>
                </div>
                <div className="p-4 bg-white">
                  <p className="ios-text-body text-enigma-neutral-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {searchQuery && filteredFAQ.length === 0 && (
            <div className="text-center py-8">
              <div 
                className="w-16 h-16 rounded-ios-lg flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#F2F2F7' }}
              >
                <Search size={32} className="text-enigma-neutral-400" />
              </div>
              <h3 className="ios-text-headline font-semibold text-enigma-neutral-900 mb-2">
                No se encontraron resultados
              </h3>
              <p className="ios-text-body text-enigma-neutral-600 mb-4">
                Intenta con otros términos de búsqueda o contacta a soporte
              </p>
              <IOSButton variant="primary" style={{ backgroundColor: '#237584' }}>
                Contactar Soporte
              </IOSButton>
            </div>
          )}
        </IOSCardContent>
      </IOSCard>
    </div>
  );
}