
-- Agregar foreign key constraint entre reservas y mesas
ALTER TABLE public.reservas 
ADD CONSTRAINT fk_reservas_mesa_id 
FOREIGN KEY (mesa_id) REFERENCES public.mesas(id) 
ON DELETE SET NULL;

-- Verificar y limpiar datos inconsistentes si los hay
UPDATE public.reservas 
SET mesa_id = NULL 
WHERE mesa_id IS NOT NULL 
AND mesa_id NOT IN (SELECT id FROM public.mesas);

-- Crear índice para mejorar rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_reservas_mesa_id ON public.reservas(mesa_id);
