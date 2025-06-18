import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Sistema de colores iOS Premium para Enigma
				enigma: {
					primary: '#237584',    // Azul corporativo principal
					secondary: '#9FB289',  // Verde natural
					accent: '#CB5910',     // Naranja cálido
					navy: '#1a365d',       // Azul marino profundo
					neutral: {
						50: '#F8FAFB',     // Fondo principal neutro claro
						100: '#F1F5F9',    // Blanco puro para tarjetas
						200: '#E2E8F0',    // Gris muy claro
						300: '#CBD5E1',    // Gris suave para separadores
						400: '#94A3B8',    // Gris medio
						500: '#64748B',    // Gris neutro sofisticado
						600: '#475569',    // Gris oscuro para texto
						700: '#334155',    // Gris muy oscuro
						800: '#1E293B',    // Casi negro
						900: '#0F172A'     // Negro profundo
					}
				},
				// Sistema de estados iOS
				ios: {
					// Estados principales
					available: '#34C759',   // Verde iOS para disponible
					occupied: '#FF3B30',    // Rojo iOS para ocupada
					reserved: '#007AFF',    // Azul iOS para reservada
					cleaning: '#FF9500',    // Naranja iOS para limpieza
					maintenance: '#8E8E93', // Gris iOS para mantenimiento
					// Colores del sistema iOS
					blue: '#007AFF',
					green: '#34C759',
					red: '#FF3B30',
					orange: '#FF9500',
					yellow: '#FFCC00',
					purple: '#AF52DE',
					pink: '#FF2D92',
					gray: '#8E8E93',
					gray2: '#AEAEB2',
					gray3: '#C7C7CC',
					gray4: '#D1D1D6',
					gray5: '#E5E5EA',
					gray6: '#F2F2F7',
					// Fondos iOS
					background: '#F2F2F7',
					'background-secondary': '#FFFFFF',
					// Labels iOS
					label: '#000000',
					'label-secondary': '#3C3C43',
					'label-tertiary': '#3C3C4399',
					'label-quaternary': '#3C3C432E',
					// Separadores iOS
					separator: '#3C3C432E',
					'separator-opaque': '#C6C6C8'
				}
			},
			fontFamily: {
				// Fuente del sistema iOS
				'sf': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif'],
				sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif']
			},
			fontSize: {
				// Escala tipográfica iOS para Enigma
				'ios-caption2': ['11px', { lineHeight: '13px', fontWeight: '400' }],
				'ios-caption1': ['12px', { lineHeight: '16px', fontWeight: '400' }],
				'ios-footnote': ['13px', { lineHeight: '18px', fontWeight: '400' }],
				'ios-subhead': ['15px', { lineHeight: '20px', fontWeight: '400' }],
				'ios-callout': ['16px', { lineHeight: '21px', fontWeight: '400' }],
				'ios-body': ['17px', { lineHeight: '22px', fontWeight: '400' }],
				'ios-headline': ['17px', { lineHeight: '22px', fontWeight: '600' }],
				'ios-title3': ['20px', { lineHeight: '25px', fontWeight: '400' }],
				'ios-title2': ['22px', { lineHeight: '28px', fontWeight: '400' }],
				'ios-title1': ['28px', { lineHeight: '34px', fontWeight: '400' }],
				'ios-large-title': ['34px', { lineHeight: '41px', fontWeight: '400' }]
			},
			spacing: {
				// Sistema de espaciado matemático iOS (base 4)
				'0.5': '2px',   // Espaciado mínimo
				'1': '4px',     // Espaciado muy pequeño
				'1.5': '6px',   // 
				'2': '8px',     // Espaciado pequeño
				'2.5': '10px',  // 
				'3': '12px',    // 
				'4': '16px',    // Espaciado medio (estándar)
				'5': '20px',    // 
				'6': '24px',    // Espaciado grande
				'8': '32px',    // Espaciado extra grande
				'10': '40px',   // 
				'12': '48px',   // 
				'16': '64px',   // Espaciado XXL
				'20': '80px',   // 
				'24': '96px'    // Espaciado máximo
			},
			scale: {
				'98': '0.98',
				'102': '1.02'
			},
			borderRadius: {
				// Bordes redondeados iOS
				'ios-sm': '6px',    // Pequeño
				'ios': '10px',      // Estándar iOS
				'ios-md': '12px',   // Medio
				'ios-lg': '16px',   // Grande
				'ios-xl': '20px',   // Extra grande
				'ios-2xl': '24px',  // XXL
				'ios-full': '9999px' // Completamente redondeado
			},
			boxShadow: {
				// Sombras iOS sutiles pero definidas
				'ios-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
				'ios': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'ios-md': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				'ios-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
				'ios-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
				'ios-card': '0 2px 8px rgba(0, 0, 0, 0.1)',
				'ios-elevated': '0 8px 16px rgba(0, 0, 0, 0.15)'
			},
			backdropBlur: {
				'ios': '20px',
				'ios-lg': '40px'
			},
			animation: {
				// Animaciones iOS suaves y profesionales
				'ios-spring': 'spring 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'ios-ease': 'ease 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'ios-bounce': 'bounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'scale-in': 'scale-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'scale-out': 'scale-out 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'fade-slide-up': 'fade-slide-up 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'fade-slide-down': 'fade-slide-down 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
			},
			keyframes: {
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'100%': { transform: 'scale(0.95)', opacity: '0' }
				},
				'fade-slide-up': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'fade-slide-down': {
					'0%': { transform: 'translateY(-10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'spring': {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' },
					'100%': { transform: 'scale(1)' }
				}
			},
			screens: {
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1536px',
				// Breakpoints específicos para tablets
				'tablet': '768px',
				'tablet-lg': '1024px'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
