import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FooterInfoData {
  id: string;
  descripcion_restaurante?: string;
  direccion: string;
  telefono: string;
  email: string;
  instagram_url: string;
  tripadvisor_url: string;
  google_maps_url: string;
  whatsapp_url?: string;
  created_at?: string;
  updated_at?: string;
}

export function useFooterConfig() {
  const [footerInfo, setFooterInfo] = useState<FooterInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();


  const fetchFooterInfo = useCallback(async () => {
    try {
      setLoading(true);
      
      // Obtener configuración del footer desde tabla 'footer_info'
      const { data: footerData, error: footerError } = await supabase
        .from('footer_info')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (footerError) {
        console.error('Error fetching footer info:', footerError);
        toast({
          title: 'Error',
          description: 'Error al cargar la configuración del footer',
          variant: 'destructive'
        });
        return;
      }

      if (footerData) {
        setFooterInfo(footerData);
      } else {
        console.log('No hay configuración de footer existente');
        setFooterInfo(null);
      }

    } catch (error) {
      console.error('Error fetching footer info:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar la configuración del footer',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createFooterInfo = async (footerData: Omit<FooterInfoData, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('footer_info')
        .insert([footerData])
        .select()
        .single();

      if (error) throw error;

      setFooterInfo(data);

      toast({
        title: 'Configuración de footer creada',
        description: 'Se ha creado la configuración del footer'
      });

      return data;
    } catch (error) {
      console.error('Error creating footer info:', error);
      toast({
        title: 'Error',
        description: 'Error al crear la configuración del footer',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateFooterInfo = async (updates: Partial<FooterInfoData>) => {
    if (!footerInfo) return;

    try {
      // Incluir timestamp de actualización
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('footer_info')
        .update(updateData)
        .eq('id', footerInfo.id);

      if (error) throw error;

      setFooterInfo(prev => prev ? { ...prev, ...updateData } : null);
      
      toast({
        title: 'Éxito',
        description: 'Configuración del footer actualizada correctamente'
      });
    } catch (error) {
      console.error('Error updating footer info:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar la configuración del footer',
        variant: 'destructive'
      });
    }
  };

  const validateUrls = (data: Partial<FooterInfoData>) => {
    const urlFields = ['instagram_url', 'tripadvisor_url', 'google_maps_url', 'whatsapp_url'];
    const errors: string[] = [];

    urlFields.forEach(field => {
      const value = data[field as keyof FooterInfoData];
      if (value && typeof value === 'string') {
        try {
          new URL(value);
        } catch {
          errors.push(`${field.replace('_url', '').replace('_', ' ')}`);
        }
      }
    });

    return errors;
  };

  const updateFooterInfoWithValidation = async (updates: Partial<FooterInfoData>) => {
    const urlErrors = validateUrls(updates);
    
    if (urlErrors.length > 0) {
      toast({
        title: 'URLs inválidas',
        description: `Por favor, verifica las URLs de: ${urlErrors.join(', ')}`,
        variant: 'destructive'
      });
      return false;
    }

    await updateFooterInfo(updates);
    return true;
  };

  useEffect(() => {
    fetchFooterInfo();
  }, [fetchFooterInfo]);

  return {
    footerInfo,
    loading,
    updateFooterInfo: updateFooterInfoWithValidation,
    createFooterInfo,
    refetch: fetchFooterInfo,
    validateUrls
  };
}