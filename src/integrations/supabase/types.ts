export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_id: string
          employee_id: string
          id: string
          unlocked_at: string
        }
        Insert: {
          badge_id: string
          employee_id: string
          id?: string
          unlocked_at?: string
        }
        Update: {
          badge_id?: string
          employee_id?: string
          id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      badge_definitions: {
        Row: {
          code: string
          color_scheme: string
          created_at: string
          description: string
          icon_name: string
          id: string
          name: string
          points_reward: number
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          code: string
          color_scheme?: string
          created_at?: string
          description: string
          icon_name: string
          id?: string
          name: string
          points_reward?: number
          requirement_type: string
          requirement_value: number
        }
        Update: {
          code?: string
          color_scheme?: string
          created_at?: string
          description?: string
          icon_name?: string
          id?: string
          name?: string
          points_reward?: number
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      badges: {
        Row: {
          description: string
          icon_url: string | null
          id: string
          name: string
          required_points: number
        }
        Insert: {
          description: string
          icon_url?: string | null
          id?: string
          name: string
          required_points: number
        }
        Update: {
          description?: string
          icon_url?: string | null
          id?: string
          name?: string
          required_points?: number
        }
        Relationships: []
      }
      cliente_alertas: {
        Row: {
          cliente_id: string
          completada: boolean | null
          creado_por: string | null
          descripcion: string | null
          fecha_alerta: string
          fecha_creacion: string | null
          hora_alerta: string | null
          id: string
          tipo_alerta: string
          titulo: string
        }
        Insert: {
          cliente_id: string
          completada?: boolean | null
          creado_por?: string | null
          descripcion?: string | null
          fecha_alerta: string
          fecha_creacion?: string | null
          hora_alerta?: string | null
          id?: string
          tipo_alerta: string
          titulo: string
        }
        Update: {
          cliente_id?: string
          completada?: boolean | null
          creado_por?: string | null
          descripcion?: string | null
          fecha_alerta?: string
          fecha_creacion?: string | null
          hora_alerta?: string | null
          id?: string
          tipo_alerta?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliente_alertas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_alertas_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_analytics: {
        Row: {
          cliente_id: string
          created_at: string | null
          gasto_promedio_estimado: number | null
          gasto_total_estimado: number | null
          horario_preferido_fin: string | null
          horario_preferido_inicio: string | null
          id: string
          mesa_preferida_id: string | null
          primera_visita: string | null
          puntuacion_fidelidad: number | null
          tamano_grupo_promedio: number | null
          tipo_cliente: string | null
          total_no_shows: number | null
          total_reservas: number | null
          total_visitas: number | null
          ultima_visita: string | null
          updated_at: string | null
          zona_preferida: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          gasto_promedio_estimado?: number | null
          gasto_total_estimado?: number | null
          horario_preferido_fin?: string | null
          horario_preferido_inicio?: string | null
          id?: string
          mesa_preferida_id?: string | null
          primera_visita?: string | null
          puntuacion_fidelidad?: number | null
          tamano_grupo_promedio?: number | null
          tipo_cliente?: string | null
          total_no_shows?: number | null
          total_reservas?: number | null
          total_visitas?: number | null
          ultima_visita?: string | null
          updated_at?: string | null
          zona_preferida?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          gasto_promedio_estimado?: number | null
          gasto_total_estimado?: number | null
          horario_preferido_fin?: string | null
          horario_preferido_inicio?: string | null
          id?: string
          mesa_preferida_id?: string | null
          primera_visita?: string | null
          puntuacion_fidelidad?: number | null
          tamano_grupo_promedio?: number | null
          tipo_cliente?: string | null
          total_no_shows?: number | null
          total_reservas?: number | null
          total_visitas?: number | null
          ultima_visita?: string | null
          updated_at?: string | null
          zona_preferida?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cliente_analytics_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: true
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_interacciones: {
        Row: {
          cliente_id: string
          creado_por: string | null
          descripcion: string | null
          fecha_interaccion: string | null
          id: string
          metadata: Json | null
          tipo_interaccion: string
        }
        Insert: {
          cliente_id: string
          creado_por?: string | null
          descripcion?: string | null
          fecha_interaccion?: string | null
          id?: string
          metadata?: Json | null
          tipo_interaccion: string
        }
        Update: {
          cliente_id?: string
          creado_por?: string | null
          descripcion?: string | null
          fecha_interaccion?: string | null
          id?: string
          metadata?: Json | null
          tipo_interaccion?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliente_interacciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_interacciones_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_notas: {
        Row: {
          cliente_id: string
          contenido: string
          creado_por: string | null
          es_privada: boolean | null
          fecha_creacion: string | null
          fecha_modificacion: string | null
          id: string
          tipo_nota: string | null
        }
        Insert: {
          cliente_id: string
          contenido: string
          creado_por?: string | null
          es_privada?: boolean | null
          fecha_creacion?: string | null
          fecha_modificacion?: string | null
          id?: string
          tipo_nota?: string | null
        }
        Update: {
          cliente_id?: string
          contenido?: string
          creado_por?: string | null
          es_privada?: boolean | null
          fecha_creacion?: string | null
          fecha_modificacion?: string | null
          id?: string
          tipo_nota?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cliente_notas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_notas_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_tags: {
        Row: {
          cliente_id: string
          creado_por: string | null
          fecha_creacion: string | null
          id: string
          tag_color: string | null
          tag_nombre: string
        }
        Insert: {
          cliente_id: string
          creado_por?: string | null
          fecha_creacion?: string | null
          id?: string
          tag_color?: string | null
          tag_nombre: string
        }
        Update: {
          cliente_id?: string
          creado_por?: string | null
          fecha_creacion?: string | null
          id?: string
          tag_color?: string | null
          tag_nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliente_tags_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_tags_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          acepta_marketing: boolean | null
          apellido: string
          email: string
          fecha_creacion: string | null
          historial_reservas_ids: string[] | null
          id: string
          idioma_preferido: string | null
          metodo_contacto_preferido: string | null
          nombre: string
          notas_privadas: string | null
          preferencias_dieteticas: string[] | null
          telefono: string
          tipo_cliente: string | null
          ultima_visita: string | null
          vip_status: boolean | null
        }
        Insert: {
          acepta_marketing?: boolean | null
          apellido: string
          email: string
          fecha_creacion?: string | null
          historial_reservas_ids?: string[] | null
          id?: string
          idioma_preferido?: string | null
          metodo_contacto_preferido?: string | null
          nombre: string
          notas_privadas?: string | null
          preferencias_dieteticas?: string[] | null
          telefono: string
          tipo_cliente?: string | null
          ultima_visita?: string | null
          vip_status?: boolean | null
        }
        Update: {
          acepta_marketing?: boolean | null
          apellido?: string
          email?: string
          fecha_creacion?: string | null
          historial_reservas_ids?: string[] | null
          id?: string
          idioma_preferido?: string | null
          metodo_contacto_preferido?: string | null
          nombre?: string
          notas_privadas?: string | null
          preferencias_dieteticas?: string[] | null
          telefono?: string
          tipo_cliente?: string | null
          ultima_visita?: string | null
          vip_status?: boolean | null
        }
        Relationships: []
      }
      combinaciones_mesa: {
        Row: {
          activa: boolean | null
          capacidad_total: number
          creado_por: string | null
          created_at: string | null
          distancia_maxima_metros: number | null
          es_optima: boolean | null
          estado_combinacion:
            | Database["public"]["Enums"]["estado_mesa_enum"]
            | null
          id: string
          mesa_principal_id: string
          mesas_combinadas: string[] | null
          mesas_secundarias: string[]
          nombre_combinacion: string
          reserva_id: string | null
          updated_at: string | null
        }
        Insert: {
          activa?: boolean | null
          capacidad_total: number
          creado_por?: string | null
          created_at?: string | null
          distancia_maxima_metros?: number | null
          es_optima?: boolean | null
          estado_combinacion?:
            | Database["public"]["Enums"]["estado_mesa_enum"]
            | null
          id?: string
          mesa_principal_id: string
          mesas_combinadas?: string[] | null
          mesas_secundarias: string[]
          nombre_combinacion: string
          reserva_id?: string | null
          updated_at?: string | null
        }
        Update: {
          activa?: boolean | null
          capacidad_total?: number
          creado_por?: string | null
          created_at?: string | null
          distancia_maxima_metros?: number | null
          es_optima?: boolean | null
          estado_combinacion?:
            | Database["public"]["Enums"]["estado_mesa_enum"]
            | null
          id?: string
          mesa_principal_id?: string
          mesas_combinadas?: string[] | null
          mesas_secundarias?: string[]
          nombre_combinacion?: string
          reserva_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "combinaciones_mesa_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combinaciones_mesa_mesa_principal_id_fkey"
            columns: ["mesa_principal_id"]
            isOneToOne: false
            referencedRelation: "mesas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combinaciones_mesa_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      employee_stats: {
        Row: {
          attendance_streak: number
          created_at: string
          current_level: number
          early_streak: number
          employee_id: string
          id: string
          last_check_in: string | null
          last_stats_update: string
          late_check_ins: number
          on_time_check_ins: number
          perfect_weeks_streak: number
          punctual_streak: number
          total_check_ins: number
          total_hours_worked: number
          total_points: number
          updated_at: string
        }
        Insert: {
          attendance_streak?: number
          created_at?: string
          current_level?: number
          early_streak?: number
          employee_id: string
          id?: string
          last_check_in?: string | null
          last_stats_update?: string
          late_check_ins?: number
          on_time_check_ins?: number
          perfect_weeks_streak?: number
          punctual_streak?: number
          total_check_ins?: number
          total_hours_worked?: number
          total_points?: number
          updated_at?: string
        }
        Update: {
          attendance_streak?: number
          created_at?: string
          current_level?: number
          early_streak?: number
          employee_id?: string
          id?: string
          last_check_in?: string | null
          last_stats_update?: string
          late_check_ins?: number
          on_time_check_ins?: number
          perfect_weeks_streak?: number
          punctual_streak?: number
          total_check_ins?: number
          total_hours_worked?: number
          total_points?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_stats_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          company_id: string
          created_at: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          pin_code: string
          role: Database["public"]["Enums"]["employee_role"]
        }
        Insert: {
          company_id: string
          created_at?: string
          first_name: string
          id?: string
          is_active?: boolean
          last_name: string
          pin_code: string
          role?: Database["public"]["Enums"]["employee_role"]
        }
        Update: {
          company_id?: string
          created_at?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          pin_code?: string
          role?: Database["public"]["Enums"]["employee_role"]
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      enigmito_logs: {
        Row: {
          accion_tomada: string
          confianza_ia: number | null
          errores_detectados: string | null
          id: string
          prompt_entrada: string
          reserva_id_procesada: string | null
          respuesta_ia: string
          timestamp: string | null
        }
        Insert: {
          accion_tomada: string
          confianza_ia?: number | null
          errores_detectados?: string | null
          id?: string
          prompt_entrada: string
          reserva_id_procesada?: string | null
          respuesta_ia: string
          timestamp?: string | null
        }
        Update: {
          accion_tomada?: string
          confianza_ia?: number | null
          errores_detectados?: string | null
          id?: string
          prompt_entrada?: string
          reserva_id_procesada?: string | null
          respuesta_ia?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enigmito_logs_reserva_id_procesada_fkey"
            columns: ["reserva_id_procesada"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
        ]
      }
      estados_mesa: {
        Row: {
          asignado_por: string | null
          created_at: string | null
          estado: Database["public"]["Enums"]["estado_mesa_enum"]
          id: string
          mesa_id: string
          notas_estado: string | null
          numero_comensales: number | null
          reserva_id: string | null
          tiempo_estimado_liberacion: string | null
          tiempo_ocupacion: string | null
          updated_at: string | null
        }
        Insert: {
          asignado_por?: string | null
          created_at?: string | null
          estado?: Database["public"]["Enums"]["estado_mesa_enum"]
          id?: string
          mesa_id: string
          notas_estado?: string | null
          numero_comensales?: number | null
          reserva_id?: string | null
          tiempo_estimado_liberacion?: string | null
          tiempo_ocupacion?: string | null
          updated_at?: string | null
        }
        Update: {
          asignado_por?: string | null
          created_at?: string | null
          estado?: Database["public"]["Enums"]["estado_mesa_enum"]
          id?: string
          mesa_id?: string
          notas_estado?: string | null
          numero_comensales?: number | null
          reserva_id?: string | null
          tiempo_estimado_liberacion?: string | null
          tiempo_ocupacion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estados_mesa_asignado_por_fkey"
            columns: ["asignado_por"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estados_mesa_mesa_id_fkey"
            columns: ["mesa_id"]
            isOneToOne: true
            referencedRelation: "mesas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estados_mesa_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
        ]
      }
      gamification_notifications: {
        Row: {
          badge_code: string | null
          created_at: string
          employee_id: string
          id: string
          is_read: boolean
          message: string
          points_earned: number | null
          title: string
          type: string
        }
        Insert: {
          badge_code?: string | null
          created_at?: string
          employee_id: string
          id?: string
          is_read?: boolean
          message: string
          points_earned?: number | null
          title: string
          type: string
        }
        Update: {
          badge_code?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          is_read?: boolean
          message?: string
          points_earned?: number | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamification_notifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      horarios_operacion_detalle: {
        Row: {
          activo: boolean | null
          dia_semana: number
          hora_apertura: string
          hora_cierre: string
          id: string
          notas: string | null
          tipo_servicio: string
        }
        Insert: {
          activo?: boolean | null
          dia_semana: number
          hora_apertura: string
          hora_cierre: string
          id?: string
          notas?: string | null
          tipo_servicio: string
        }
        Update: {
          activo?: boolean | null
          dia_semana?: number
          hora_apertura?: string
          hora_cierre?: string
          id?: string
          notas?: string | null
          tipo_servicio?: string
        }
        Relationships: []
      }
      mesas: {
        Row: {
          activa: boolean | null
          capacidad: number
          created_at: string | null
          es_combinable: boolean | null
          id: string
          mesas_adyacentes: string[] | null
          notas_mesa: string | null
          numero_mesa: string
          position_x: number | null
          position_y: number | null
          tipo_mesa: Database["public"]["Enums"]["tipo_mesa_enum"]
          ubicacion_descripcion: string | null
          updated_at: string | null
          zona: Database["public"]["Enums"]["zona_enum"]
        }
        Insert: {
          activa?: boolean | null
          capacidad: number
          created_at?: string | null
          es_combinable?: boolean | null
          id?: string
          mesas_adyacentes?: string[] | null
          notas_mesa?: string | null
          numero_mesa: string
          position_x?: number | null
          position_y?: number | null
          tipo_mesa?: Database["public"]["Enums"]["tipo_mesa_enum"]
          ubicacion_descripcion?: string | null
          updated_at?: string | null
          zona?: Database["public"]["Enums"]["zona_enum"]
        }
        Update: {
          activa?: boolean | null
          capacidad?: number
          created_at?: string | null
          es_combinable?: boolean | null
          id?: string
          mesas_adyacentes?: string[] | null
          notas_mesa?: string | null
          numero_mesa?: string
          position_x?: number | null
          position_y?: number | null
          tipo_mesa?: Database["public"]["Enums"]["tipo_mesa_enum"]
          ubicacion_descripcion?: string | null
          updated_at?: string | null
          zona?: Database["public"]["Enums"]["zona_enum"]
        }
        Relationships: []
      }
      notificaciones_plantillas: {
        Row: {
          asunto: string | null
          canal: string
          cuerpo: string
          id: string
          idioma: string
          nombre_plantilla: string
          variables_disponibles: string[] | null
        }
        Insert: {
          asunto?: string | null
          canal: string
          cuerpo: string
          id?: string
          idioma?: string
          nombre_plantilla: string
          variables_disponibles?: string[] | null
        }
        Update: {
          asunto?: string | null
          canal?: string
          cuerpo?: string
          id?: string
          idioma?: string
          nombre_plantilla?: string
          variables_disponibles?: string[] | null
        }
        Relationships: []
      }
      notification_types: {
        Row: {
          code: string
          color: string
          created_at: string | null
          description: string | null
          icon_name: string
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          code: string
          color?: string
          created_at?: string | null
          description?: string | null
          icon_name: string
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          code?: string
          color?: string
          created_at?: string | null
          description?: string | null
          icon_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actions: Json | null
          cliente_id: string | null
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          mesa_id: string | null
          message: string
          personal_id: string | null
          priority: string
          read_at: string | null
          reserva_id: string | null
          title: string
          type_code: string
        }
        Insert: {
          actions?: Json | null
          cliente_id?: string | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          mesa_id?: string | null
          message: string
          personal_id?: string | null
          priority?: string
          read_at?: string | null
          reserva_id?: string | null
          title: string
          type_code: string
        }
        Update: {
          actions?: Json | null
          cliente_id?: string | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          mesa_id?: string | null
          message?: string
          personal_id?: string | null
          priority?: string
          read_at?: string | null
          reserva_id?: string | null
          title?: string
          type_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_personal_id_fkey"
            columns: ["personal_id"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_type_code_fkey"
            columns: ["type_code"]
            isOneToOne: false
            referencedRelation: "notification_types"
            referencedColumns: ["code"]
          },
        ]
      }
      ocasiones_especiales: {
        Row: {
          activa: boolean | null
          codigo: string
          color: string | null
          created_at: string | null
          icono: string | null
          id: string
          nombre: string
          requiere_decoracion: boolean | null
        }
        Insert: {
          activa?: boolean | null
          codigo: string
          color?: string | null
          created_at?: string | null
          icono?: string | null
          id?: string
          nombre: string
          requiere_decoracion?: boolean | null
        }
        Update: {
          activa?: boolean | null
          codigo?: string
          color?: string | null
          created_at?: string | null
          icono?: string | null
          id?: string
          nombre?: string
          requiere_decoracion?: boolean | null
        }
        Relationships: []
      }
      personal: {
        Row: {
          activo: boolean | null
          apellido: string
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          nombre: string
          rol: string
          user_id: string
        }
        Insert: {
          activo?: boolean | null
          apellido: string
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          nombre: string
          rol: string
          user_id: string
        }
        Update: {
          activo?: boolean | null
          apellido?: string
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nombre?: string
          rol?: string
          user_id?: string
        }
        Relationships: []
      }
      reservas: {
        Row: {
          acepta_marketing: boolean | null
          alergias: string[] | null
          asignada_por: string | null
          cliente_id: string
          duracion_minutos: number | null
          enigmito_log_id: string | null
          estado_reserva: string
          fecha_creacion: string | null
          fecha_modificacion: string | null
          fecha_reserva: string
          hora_reserva: string
          id: string
          idioma_cliente: string | null
          mesa_id: string | null
          metodo_confirmacion: string | null
          notas_cliente: string | null
          notas_restaurante: string | null
          numero_comensales: number
          ocasion_especial: string | null
          origen_reserva: string
          preferencia_asientos: string | null
          prioridad: string | null
          restricciones_dieteticas: string[] | null
          solicitudes_especiales: string[] | null
          source_detalle: string | null
          tipo_cliente: string | null
          zona_preferida: string | null
        }
        Insert: {
          acepta_marketing?: boolean | null
          alergias?: string[] | null
          asignada_por?: string | null
          cliente_id: string
          duracion_minutos?: number | null
          enigmito_log_id?: string | null
          estado_reserva?: string
          fecha_creacion?: string | null
          fecha_modificacion?: string | null
          fecha_reserva: string
          hora_reserva: string
          id?: string
          idioma_cliente?: string | null
          mesa_id?: string | null
          metodo_confirmacion?: string | null
          notas_cliente?: string | null
          notas_restaurante?: string | null
          numero_comensales: number
          ocasion_especial?: string | null
          origen_reserva: string
          preferencia_asientos?: string | null
          prioridad?: string | null
          restricciones_dieteticas?: string[] | null
          solicitudes_especiales?: string[] | null
          source_detalle?: string | null
          tipo_cliente?: string | null
          zona_preferida?: string | null
        }
        Update: {
          acepta_marketing?: boolean | null
          alergias?: string[] | null
          asignada_por?: string | null
          cliente_id?: string
          duracion_minutos?: number | null
          enigmito_log_id?: string | null
          estado_reserva?: string
          fecha_creacion?: string | null
          fecha_modificacion?: string | null
          fecha_reserva?: string
          hora_reserva?: string
          id?: string
          idioma_cliente?: string | null
          mesa_id?: string | null
          metodo_confirmacion?: string | null
          notas_cliente?: string | null
          notas_restaurante?: string | null
          numero_comensales?: number
          ocasion_especial?: string | null
          origen_reserva?: string
          preferencia_asientos?: string | null
          prioridad?: string | null
          restricciones_dieteticas?: string[] | null
          solicitudes_especiales?: string[] | null
          source_detalle?: string | null
          tipo_cliente?: string | null
          zona_preferida?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservas_asignada_por_fkey"
            columns: ["asignada_por"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      reservas_metricas_canales: {
        Row: {
          canal: string
          created_at: string | null
          fecha: string
          id: string
          total_comensales: number | null
          total_reservas: number | null
        }
        Insert: {
          canal: string
          created_at?: string | null
          fecha: string
          id?: string
          total_comensales?: number | null
          total_reservas?: number | null
        }
        Update: {
          canal?: string
          created_at?: string | null
          fecha?: string
          id?: string
          total_comensales?: number | null
          total_reservas?: number | null
        }
        Relationships: []
      }
      reservas_metricas_diarias: {
        Row: {
          created_at: string | null
          duracion_promedio_minutos: number | null
          fecha: string
          id: string
          ingresos_estimados: number | null
          reservas_canceladas: number | null
          reservas_completadas: number | null
          reservas_no_show: number | null
          reservas_vip: number | null
          total_comensales: number | null
          total_reservas: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duracion_promedio_minutos?: number | null
          fecha: string
          id?: string
          ingresos_estimados?: number | null
          reservas_canceladas?: number | null
          reservas_completadas?: number | null
          reservas_no_show?: number | null
          reservas_vip?: number | null
          total_comensales?: number | null
          total_reservas?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duracion_promedio_minutos?: number | null
          fecha?: string
          id?: string
          ingresos_estimados?: number | null
          reservas_canceladas?: number | null
          reservas_completadas?: number | null
          reservas_no_show?: number | null
          reservas_vip?: number | null
          total_comensales?: number | null
          total_reservas?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reservas_metricas_horarias: {
        Row: {
          created_at: string | null
          fecha: string
          hora_fin: string
          hora_inicio: string
          id: string
          total_comensales: number | null
          total_reservas: number | null
          zona: string | null
        }
        Insert: {
          created_at?: string | null
          fecha: string
          hora_fin: string
          hora_inicio: string
          id?: string
          total_comensales?: number | null
          total_reservas?: number | null
          zona?: string | null
        }
        Update: {
          created_at?: string | null
          fecha?: string
          hora_fin?: string
          hora_inicio?: string
          id?: string
          total_comensales?: number | null
          total_reservas?: number | null
          zona?: string | null
        }
        Relationships: []
      }
      restaurante_config: {
        Row: {
          auto_aceptar_reservas: boolean | null
          capacidad_maxima: number
          direccion: string
          duracion_reserva_default_minutos: number
          email_reservas: string
          horarios_operacion: Json | null
          id: string
          mensaje_bienvenida_email: string | null
          mensaje_confirmacion_whatsapp: string | null
          nombre_restaurante: string
          politica_cancelacion: string | null
          telefono: string
        }
        Insert: {
          auto_aceptar_reservas?: boolean | null
          capacidad_maxima?: number
          direccion: string
          duracion_reserva_default_minutos?: number
          email_reservas: string
          horarios_operacion?: Json | null
          id?: string
          mensaje_bienvenida_email?: string | null
          mensaje_confirmacion_whatsapp?: string | null
          nombre_restaurante?: string
          politica_cancelacion?: string | null
          telefono: string
        }
        Update: {
          auto_aceptar_reservas?: boolean | null
          capacidad_maxima?: number
          direccion?: string
          duracion_reserva_default_minutos?: number
          email_reservas?: string
          horarios_operacion?: Json | null
          id?: string
          mensaje_bienvenida_email?: string | null
          mensaje_confirmacion_whatsapp?: string | null
          nombre_restaurante?: string
          politica_cancelacion?: string | null
          telefono?: string
        }
        Relationships: []
      }
      zonas_restaurante: {
        Row: {
          activa: boolean | null
          capacidad_maxima: number | null
          caracteristicas: string[] | null
          codigo: string
          color: string | null
          created_at: string | null
          descripcion: string | null
          id: string
          nombre: string
        }
        Insert: {
          activa?: boolean | null
          capacidad_maxima?: number | null
          caracteristicas?: string[] | null
          codigo: string
          color?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
        }
        Update: {
          activa?: boolean | null
          capacidad_maxima?: number | null
          caracteristicas?: string[] | null
          codigo?: string
          color?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
    }
    Views: {
      reservas_stats_daily: {
        Row: {
          canceladas: number | null
          completadas: number | null
          confirmadas: number | null
          fecha_reserva: string | null
          no_shows: number | null
          pendientes: number | null
          promedio_comensales: number | null
          total_comensales: number | null
          total_reservas: number | null
        }
        Relationships: []
      }
      vista_estadisticas_zonas: {
        Row: {
          capacidad_ocupada: number | null
          capacidad_total: number | null
          mesas_fuera_servicio: number | null
          mesas_libres: number | null
          mesas_limpieza: number | null
          mesas_ocupadas: number | null
          mesas_reservadas: number | null
          porcentaje_ocupacion: number | null
          total_mesas: number | null
          zona: Database["public"]["Enums"]["zona_enum"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      actualizar_estado_mesa: {
        Args: {
          p_mesa_id: string
          p_nuevo_estado: string
          p_reserva_id?: string
          p_tiempo_estimado_liberacion?: string
          p_notas?: string
        }
        Returns: boolean
      }
      actualizar_metricas_reservas_canales: {
        Args: { p_fecha?: string }
        Returns: undefined
      }
      actualizar_metricas_reservas_diarias: {
        Args: { p_fecha?: string }
        Returns: undefined
      }
      actualizar_metricas_reservas_horarias: {
        Args: { p_fecha?: string }
        Returns: undefined
      }
      aplicar_combinacion_mesa: {
        Args: {
          p_mesas_ids: string[]
          p_reserva_id: string
          p_nombre_combinacion?: string
        }
        Returns: string
      }
      calculate_level_from_points: {
        Args: { points: number }
        Returns: number
      }
      calculate_punctuality_points: {
        Args: { check_in_time: string; scheduled_time: string }
        Returns: number
      }
      cleanup_expired_notifications: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_notification: {
        Args: {
          p_type_code: string
          p_title: string
          p_message: string
          p_priority?: string
          p_data?: Json
          p_actions?: Json
          p_reserva_id?: string
          p_cliente_id?: string
          p_mesa_id?: string
          p_personal_id?: string
          p_expires_hours?: number
        }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_my_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["employee_role"]
      }
      mark_all_notifications_as_read: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      mark_notification_as_read: {
        Args: { notification_id: string }
        Returns: boolean
      }
      refresh_daily_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      registrar_cliente_si_no_existe: {
        Args:
          | {
              p_nombre: string
              p_apellido: string
              p_email: string
              p_telefono: string
            }
          | {
              p_nombre: string
              p_apellido: string
              p_email: string
              p_telefono: string
              p_tipo_cliente?: string
              p_metodo_contacto?: string
              p_acepta_marketing?: boolean
            }
        Returns: string
      }
      sugerir_mesas_para_reserva: {
        Args: {
          p_num_comensales: number
          p_zona_preferida?: string
          p_fecha?: string
          p_hora?: string
        }
        Returns: Json
      }
      verificar_disponibilidad_mesa: {
        Args:
          | {
              p_fecha: string
              p_hora_inicio: string
              p_num_comensales: number
              p_duracion_minutos?: number
            }
          | {
              p_fecha: string
              p_hora_inicio: string
              p_num_comensales: number
              p_duracion_minutos?: number
              p_zona_preferida?: string
            }
        Returns: {
          id: string
          numero_mesa: string
          capacidad: number
          tipo_mesa: string
        }[]
      }
    }
    Enums: {
      employee_role: "employee" | "manager" | "admin"
      estado_mesa_enum:
        | "libre"
        | "ocupada"
        | "reservada"
        | "limpieza"
        | "fuera_servicio"
      point_reason:
        | "on_time_checkin"
        | "shift_completed"
        | "positive_feedback"
        | "manual_adjustment"
      time_entry_status: "on_time" | "late" | "early_departure"
      tipo_mesa_enum:
        | "estandar"
        | "terraza_superior"
        | "terraza_inferior"
        | "barra"
        | "vip"
      zona_enum: "interior" | "campanar" | "justicia" | "barra"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      employee_role: ["employee", "manager", "admin"],
      estado_mesa_enum: [
        "libre",
        "ocupada",
        "reservada",
        "limpieza",
        "fuera_servicio",
      ],
      point_reason: [
        "on_time_checkin",
        "shift_completed",
        "positive_feedback",
        "manual_adjustment",
      ],
      time_entry_status: ["on_time", "late", "early_departure"],
      tipo_mesa_enum: [
        "estandar",
        "terraza_superior",
        "terraza_inferior",
        "barra",
        "vip",
      ],
      zona_enum: ["interior", "campanar", "justicia", "barra"],
    },
  },
} as const
