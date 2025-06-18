
-- PARTE 1: LIMPIEZA E INSERCIÓN DE MESAS
-- =====================================

-- Limpiar estados de mesas existentes primero
DELETE FROM public.mesa_estados;
DELETE FROM public.mesa_combinaciones;

-- Limpiar mesas existentes
DELETE FROM public.mesas;

-- Insertar las 32 mesas del restaurante con posiciones actualizadas
-- Sala Interior (9 mesas: M1-M8, M10) 
INSERT INTO public.mesas (numero_mesa, capacidad, tipo_mesa, ubicacion_descripcion, activa, position_x, position_y, notas_mesa) VALUES
('M1', 2, 'estandar', 'Sala Interior - Lateral', true, 60, 280, 'Mesa 2 personas'),
('M2', 4, 'estandar', 'Sala Interior - Zona central', true, 60, 140, 'Mesa combinable 2p + 2p'),
('M3', 2, 'estandar', 'Sala Interior - Zona frontal', true, 60, 80, 'Mesa 2 personas'),
('M4', 4, 'estandar', 'Sala Interior - Zona central', true, 200, 80, 'Mesa 4 personas'),
('M5', 4, 'estandar', 'Sala Interior - Zona central', true, 340, 80, 'Mesa combinable 2p + 2p'),
('M6', 4, 'estandar', 'Sala Interior - Zona central', true, 420, 80, 'Mesa combinable 2p + 2p'),
('M7', 2, 'estandar', 'Sala Interior - Zona media', true, 200, 180, 'Mesa 2 personas'),
('M8', 2, 'estandar', 'Sala Interior - Zona media', true, 340, 180, 'Mesa 2 personas'),
('M10', 4, 'estandar', 'Sala Interior - Zona posterior', true, 300, 260, 'Mesa grande horizontal');

-- Terraza Campanar (14 mesas: T1-T14)
INSERT INTO public.mesas (numero_mesa, capacidad, tipo_mesa, ubicacion_descripcion, activa, position_x, position_y, notas_mesa) VALUES
-- Fila superior - mesas de 2 personas
('T1', 2, 'terraza_superior', 'Terraza Campanar - Fila superior', true, 40, 80, 'Mesa 2 personas'),
('T2', 2, 'terraza_superior', 'Terraza Campanar - Fila superior', true, 110, 80, 'Mesa 2 personas'),
('T3', 2, 'terraza_superior', 'Terraza Campanar - Fila superior', true, 180, 80, 'Mesa 2 personas'),
('T4', 2, 'terraza_superior', 'Terraza Campanar - Fila superior', true, 250, 80, 'Mesa 2 personas'),
('T5', 2, 'terraza_superior', 'Terraza Campanar - Fila superior', true, 320, 80, 'Mesa 2 personas'),
('T6', 2, 'terraza_superior', 'Terraza Campanar - Fila superior', true, 390, 80, 'Mesa 2 personas'),
('T7', 2, 'terraza_superior', 'Terraza Campanar - Fila superior', true, 460, 80, 'Mesa 2 personas'),
('T8', 2, 'terraza_superior', 'Terraza Campanar - Fila superior', true, 530, 80, 'Mesa 2 personas'),
-- Fila inferior - mezcla de 2 y 4 personas
('T9', 4, 'terraza_superior', 'Terraza Campanar - Fila inferior', true, 600, 80, 'Mesa 4 personas'),
('T10', 2, 'terraza_superior', 'Terraza Campanar - Fila inferior', true, 690, 80, 'Mesa 2 personas'),
('T11', 2, 'terraza_superior', 'Terraza Campanar - Fila inferior', true, 760, 80, 'Mesa 2 personas'),
('T12', 4, 'terraza_superior', 'Terraza Campanar - Fila inferior', true, 830, 80, 'Mesa 4 personas'),
('T13', 4, 'terraza_superior', 'Terraza Campanar - Fila inferior', true, 920, 80, 'Mesa 4 personas'),
('T14', 4, 'terraza_superior', 'Terraza Campanar - Fila inferior', true, 1010, 80, 'Mesa 4 personas');

-- Terraza Justicia (9 mesas: T20-T28)
INSERT INTO public.mesas (numero_mesa, capacidad, tipo_mesa, ubicacion_descripcion, activa, position_x, position_y, notas_mesa) VALUES
-- Mesas de 4 personas
('T20', 4, 'terraza_inferior', 'Terraza Justicia - Zona principal', true, 40, 80, 'Mesa 4 personas'),
('T21', 4, 'terraza_inferior', 'Terraza Justicia - Zona principal', true, 150, 80, 'Mesa 4 personas'),
('T22', 4, 'terraza_inferior', 'Terraza Justicia - Zona principal', true, 260, 80, 'Mesa 4 personas'),
('T23', 4, 'terraza_inferior', 'Terraza Justicia - Zona principal', true, 370, 80, 'Mesa 4 personas'),
-- Mesas de 2 personas
('T24', 2, 'terraza_inferior', 'Terraza Justicia - Zona lateral', true, 500, 80, 'Mesa 2 personas'),
('T25', 2, 'terraza_inferior', 'Terraza Justicia - Zona lateral', true, 570, 80, 'Mesa 2 personas'),
('T26', 2, 'terraza_inferior', 'Terraza Justicia - Zona lateral', true, 640, 80, 'Mesa 2 personas'),
('T27', 2, 'terraza_inferior', 'Terraza Justicia - Zona lateral', true, 710, 80, 'Mesa 2 personas'),
('T28', 2, 'terraza_inferior', 'Terraza Justicia - Zona lateral', true, 780, 80, 'Mesa 2 personas');

-- Inicializar estados para todas las mesas (todas empiezan libres)
INSERT INTO public.mesa_estados (mesa_id, estado)
SELECT id, 'libre' FROM public.mesas;
