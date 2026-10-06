# Guía de cuentas · Cosecha

Con esto los jugadores pueden entrar con Google y recuperar su avance en otro teléfono:
nombre, avatar, granos, álbum, récords y ajustes. **La cuenta es opcional:** sin cuenta,
todo se sigue guardando en el teléfono como siempre.

Mientras no hagas estos pasos, el juego funciona igual y simplemente no aparece el botón
«Entrar con Google».

Son unos 20 minutos. No hay que tocar código.

---

## Cómo funciona (en corto)

- **Supabase** guarda las cuentas y el avance. El plan gratuito alcanza de sobra.
- **Google** solo confirma quién es la persona. El juego nunca ve su contraseña.
- Cada cuenta solo puede leer y cambiar su propio avance (lo garantiza la base de datos).
- **Primera vez en un teléfono con avance:** se juntan el avance del teléfono y el de la cuenta
  (el álbum se une y quedan los récords y granos más altos).
- **Después:** gana lo más nuevo; si los dos lados cambiaron, se juntan.
- **Al cerrar sesión** el avance se borra del teléfono (queda en la cuenta), para que el
  siguiente que lo use arranque limpio.
- **Borrar la cuenta** se hace desde el mismo juego: menú → «☁ Guardado» → «Borrar mi cuenta y mi avance».

---

## Paso 1 · Crear el proyecto en Supabase

1. Entra a <https://supabase.com> y crea una cuenta (puedes usar tu Google).
2. **New project.** Nombre: `cosecha`. Región: **East US (North Virginia)**, que es la más
   cercana a los servidores de Render. Inventa una contraseña de base de datos y guárdala.
3. Espera uno o dos minutos a que el proyecto quede listo.

## Paso 2 · Crear la tabla del avance

1. En el menú izquierdo: **SQL Editor → New query**.
2. Copia todo el contenido de `supabase/esquema.sql` (está en el repo), pégalo y dale **Run**.
3. Debe decir *Success. No rows returned*.

## Paso 3 · Copiar las tres llaves

En **Project Settings → API** (o **Data API / API Keys**, según la versión):

| Lo que dice Supabase | Para qué | ¿Es secreta? |
|---|---|---|
| **Project URL** (`https://xxxx.supabase.co`) | `SUPABASE_URL` | No |
| **anon public** (o *publishable key*) | `SUPABASE_ANON_KEY` | No: va en la página a propósito |
| **service_role** (o *secret key*) | `SUPABASE_SERVICE_KEY` | **Sí.** Solo va en Render, nunca en chats ni en el código |

Me puedes mandar la URL y la anon. La **service_role no se la pases a nadie**: la pegas tú
directamente en Render (paso 7).

## Paso 4 · Crear el cliente de Google

1. Entra a <https://console.cloud.google.com> y crea un proyecto nuevo llamado `Cosecha`.
2. **APIs y servicios → Pantalla de consentimiento de OAuth** (o *Google Auth Platform → Branding*):
   - Tipo de usuario: **Externo**.
   - Nombre de la app: `Cosecha`. Correo de asistencia: el tuyo.
   - Logo: opcional (si pones logo, Google pide revisión; sin logo es inmediato).
   - Página principal: la dirección de `cosecha-pagina` en Render.
   - Política de privacidad: `https://<tu cosecha-pagina>.onrender.com/privacidad.html`.
   - Dominios autorizados: `onrender.com` y `supabase.co`.
   - Permisos (*scopes*): solo los básicos, `email`, `profile` y `openid`. No agregues más.
   - **Publica la app** (pasa de *Testing* a *In production*). Con solo esos permisos básicos
     no hace falta revisión de Google. Si la dejas en *Testing*, solo pueden entrar los
     correos que agregues como usuarios de prueba.
3. **Credenciales → Crear credenciales → ID de cliente de OAuth**:
   - Tipo: **Aplicación web**. Nombre: `Cosecha web`.
   - **Orígenes de JavaScript autorizados:** déjalo vacío.
   - **URI de redireccionamiento autorizados:** agrega exactamente
     `https://xxxx.supabase.co/auth/v1/callback` (tu Project URL + `/auth/v1/callback`).
4. Al crear, Google muestra el **ID de cliente** y el **Secreto del cliente**. Cópialos.

## Paso 5 · Conectar Google con Supabase

1. En Supabase: **Authentication → Sign In / Providers → Google**.
2. Actívalo, pega el **Client ID** y el **Client Secret** del paso 4 y guarda.

## Paso 6 · Decirle a Supabase a dónde volver

En Supabase: **Authentication → URL Configuration**.

- **Site URL:** `https://<tu cosecha-pagina>.onrender.com`
- **Redirect URLs** (agrega las dos, con los `/**` al final):
  - `https://<tu cosecha-pagina>.onrender.com/**`
  - `https://cosecha-ehrm.onrender.com/**`

Si algún día el juego vive en otro dominio, se agrega aquí también.

## Paso 7 · Poner las llaves en Render

Como los servicios ya existen, las variables se agregan a mano:

**Servicio `cosecha`** → *Environment* → *Add Environment Variable*:

| Key | Value |
|---|---|
| `SUPABASE_URL` | la Project URL |
| `SUPABASE_ANON_KEY` | la anon public |
| `SUPABASE_SERVICE_KEY` | la service_role (la secreta) |

**Servicio `cosecha-pagina`** → *Environment*:

| Key | Value |
|---|---|
| `SUPABASE_URL` | la Project URL |
| `SUPABASE_ANON_KEY` | la anon public |

(A `cosecha-pagina` **no** se le pone la service_role.)

Guarda y deja que los dos servicios se vuelvan a desplegar (*Manual Deploy → Deploy latest commit*
si no arrancan solos).

## Paso 8 · Probar

1. Abre `cosecha-pagina` en el teléfono. En la pantalla del nombre debe aparecer
   **«Entrar con Google»**.
2. Entra, juega algo en La Vereda (gana unos granos).
3. Abre el juego en otro teléfono o en el computador, entra con la misma cuenta:
   deben aparecer tus granos, tu avatar y tu nombre.
4. En Supabase → **Table Editor → progreso** verás una fila por cada cuenta.

Si al volver de Google sale un error, casi siempre es el paso 4.3 (la URI de
redireccionamiento) o el paso 6 (las Redirect URLs).

---

## Antes de publicar

- En `public/privacidad.html` cambia **[correo de contacto]** por un correo donde la gente
  pueda escribirte para pedir que se borren sus datos.
- La política menciona la Ley 1581 de 2012 (Habeas Data). Si el juego crece, vale la pena que
  un abogado la revise.

## Más adelante · Facebook

Lo mismo que Google, con una app de Meta:

1. <https://developers.facebook.com> → **Crear app** → tipo *Consumidor* → producto
   **Inicio de sesión con Facebook**.
2. URI de redireccionamiento OAuth válido: la misma `https://xxxx.supabase.co/auth/v1/callback`.
3. Meta exige **URL de política de privacidad** (la de `privacidad.html`) y **URL de eliminación
   de datos** (se puede usar la misma página, sección 6).
4. En Supabase → *Providers → Facebook*: pegar el App ID y el App Secret.
5. Me avisas y agrego el botón «Entrar con Facebook» (el código ya está preparado para otro proveedor).
