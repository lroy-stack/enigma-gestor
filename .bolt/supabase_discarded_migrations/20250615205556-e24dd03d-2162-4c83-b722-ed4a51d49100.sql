
-- Verificar si existe un registro en la tabla personal para usuarios existentes
-- Primero, veamos qué usuarios tenemos en auth.users
SELECT 
  au.id,
  au.email,
  au.created_at as user_created_at,
  p.id as personal_id,
  p.nombre,
  p.apellido,
  p.rol,
  p.activo
FROM auth.users au
LEFT JOIN public.personal p ON au.id = p.user_id
ORDER BY au.created_at DESC;

-- Si no hay registros en personal, insertemos uno para el usuario actual
INSERT INTO public.personal (user_id, nombre, apellido, email, rol, activo)
SELECT 
  id,
  'Usuario',
  'Admin',
  email,
  'admin',
  true
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.personal WHERE user_id = auth.users.id
)
ON CONFLICT (email) DO NOTHING;
