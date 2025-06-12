-- Crear base de usuarios
CREATE DATABASE IF NOT EXISTS synaps;

USE synaps;

CREATE TABLE `note_shares` (
  `owner_id` int(11) NOT NULL,
  `note_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id2` varchar(32) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_full_name` varchar(255) DEFAULT NULL,
  `user_password` varchar(255) NOT NULL,
  `user_profile_photo` varchar(500) DEFAULT NULL,
  `first_login` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

INSERT INTO `users` (`user_id`, `user_id2`, `user_email`, `user_name`, `user_full_name`,`user_password`) VALUES
(1, 'F7D8S9FG78F9DG78D9F7G89DF789FDGU', 'test@example.com', 'Usuario de prueba', 'Usuario de Prueba Test', '$2y$10$6IdSom7etaa06Vl8YjSeg.zQh//JfL0WktZAqXvqMeXERKVXrXj02');

-- Crear base por cliente
CREATE DATABASE IF NOT EXISTS synaps_0001;

USE synaps_0001;

CREATE TABLE `docs` (
  `doc_id` int(11) NOT NULL AUTO_INCREMENT,
  `doc_id2` varchar(32) NOT NULL,
  `doc_name` varchar(255) NOT NULL,
  `insert_date` datetime NOT NULL,
  PRIMARY KEY (`doc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `folders_notes` (
  `folder_id` int(11) NOT NULL AUTO_INCREMENT,
  `folder_id2` varchar(32) NOT NULL,
  `folder_title` varchar(255) NOT NULL,
  `vault_id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `children_count` int(11) NOT NULL,
  PRIMARY KEY (`folder_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

INSERT INTO `folders_notes` (`folder_id`, `folder_id2`, `folder_title`, `parent_id`, `vault_id`, `children_count`) VALUES
(1, 'A0CA0C34F5A6C5D7F049CA2F076DABEF', 'Inteligencia Artificial', 0, 1, 4),
(2, '1A43BCE5F2E6E4AA68310E24302E3D2E', 'Tecnología', 0, 1, 2),
(3, '7F2CCF29DFFDFE1C17E4CB7D17F59A95', 'MacOS', 0, 1, 2),
(4, 'B3E04F55EDAE5B4DE56B04C28E2A7936', 'Windows', 0, 1, 2),
(5, '7E3B7FDE3BDBF29971B4D5C2E72DFA7C', 'Linux', 0, 1, 5),
(6, '4B8A7D8BCEFBAD1F9CFD18A2F5A4BA34', 'Android', 0, 1, 5),
(7, '2351C69D60A32DD75C5E4A888DE9B03C', 'Docker', 0, 1, 4),
(8, 'F30F828328F6A0B47A0A89A6E40DD6A1', 'Kubernetes', 0, 1, 4),
(9, 'E48A36B81D215962F5F76C364F01A072', 'DevOps', 0, 1, 4),
(21, 'FB53A183C8E41F4DAD13F93ABEBDE3A5', 'Redes', 0, 1, 2),
(25, 'CD9BBCA186F4AD973B77E202C3204AEB', 'Ciberseguridad', 0, 1, 2),
(26, 'AAE4D92F4C68B8F6F2F911E84268D1B2', 'Python', 0, 1, 2),
(31, 'wGUfaC17T45cew6TfyGcmP4RMowB0lpX', 'TEST', 0, 1, 1);

CREATE TABLE `log` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `log_id2` varchar(32) NOT NULL,
  `log_message` varchar(255) NOT NULL,
  `insert_date` datetime NOT NULL,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `notes` (
  `note_id` int(11) NOT NULL AUTO_INCREMENT,
  `note_id2` varchar(32) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `note_title` varchar(255) NOT NULL,
  `note_markdown` text NOT NULL,
  `vault_id` int(11) NOT NULL,
  `insert_date` datetime NOT NULL,
  `last_update_date` datetime NOT NULL,
  PRIMARY KEY (`note_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

INSERT INTO `notes` (`note_id`, `note_id2`, `parent_id`, `note_title`, `note_markdown`, `insert_date`, `vault_id`, `last_update_date`) VALUES
(43, 'F3BF4F7003F80A4C233B8561A6B3786C', 1, '¿Qué es la IA?', '# ¿Qué es la Inteligencia Artificial?\n\nLa **inteligencia artificial (IA)** es una rama de la informática que crea sistemas capaces de realizar tareas que requieren inteligencia humana.\n\n> “La IA está transformando la sociedad.”\n\n## Áreas principales\n- Aprendizaje automático\n- Procesamiento del lenguaje\n- Visión artificial\n\n## Tabla: Tipos de IA\n| Tipo           | Ejemplo         |\n| -------------- | --------------- |\n| IA débil       | Siri, Alexa     |\n| IA general     | Futuro (teórico)|\n\n```js\n// Ejemplo de código\nconst saludo = \"Hola IA\";\nconsole.log(saludo);\n```\n', '2025-05-18 22:35:29', 1, '2025-05-18 22:35:29'),
(44, 'AE31C62455F62E5D9E78A2373E4C92AF', 1, 'Aplicaciones de IA', '# Aplicaciones de la IA\n\nLas aplicaciones prácticas incluyen:\n\n- Diagnóstico médico\n- Vehículos autónomos\n- Asistentes virtuales\n\n## Código de predicción\n```js\nfunction prediccion(x) {\n  return 2*x + 3;\n}\n```\n\n## Ejemplo real\nLa IA es usada por Netflix para recomendarte series.', '2025-05-18 22:35:29', 1, '2025-05-18 22:35:29'),
(45, 'AA43A0D2431F6F3FCA56E59B95A0CB12', 1, 'Retos éticos en IA', '# Retos éticos en IA\n\nLa IA plantea grandes retos:\n\n- **Privacidad** de los datos personales.\n- **Transparencia** en las decisiones algorítmicas.\n- **Desplazamiento laboral**.\n\n> “La ética debe guiar el desarrollo de la IA.”\n\n## Tabla\n| Desafío       | Implicación         |\n| ------------- | ------------------- |\n| Sesgo         | Decisiones injustas |\n| Opacidad      | Falta de claridad   |\n', '2025-05-18 22:35:29', 1, '2025-05-18 22:35:29'),
(46, 'CD9BBCA186F4AD973B77E202C3204AEB', 2, 'Tecnología en 2025', '# Tecnología en 2025\n\n## Tendencias\n- Inteligencia artificial\n- Computación cuántica\n- 5G y conectividad global\n\n## Tabla\n| Tecnología | Estado actual |\n| ---------- | ------------- |\n| 5G         | Expansión     |\n| IA         | Crecimiento   |\n\n```js\n// Novedades de 2025\nlet novedades = [\"IA\", \"5G\", \"Quantum\"];\nnovedades.forEach(n => console.log(n));\n```\n', '2025-05-18 22:35:29', 1, '2025-05-18 22:35:29'),
(47, '77F57C982101A4AA0531F5B1D202B2CA', 2, '¿Qué es un algoritmo?', '# ¿Qué es un Algoritmo?\n\nUn algoritmo es una secuencia ordenada de pasos para resolver un problema.\n\n## Ejemplo\n- Entrar al sitio\n- Buscar información\n- Procesar resultado\n\n## Código\n```js\n// Algoritmo simple\nfunction suma(a, b) {\n  return a + b;\n}\n```\n', '2025-05-18 22:35:29', 1, '2025-05-18 22:35:29'),
(48, 'D83F5B4874B6B353D9483E869C9A6F11', 2, 'Ciberseguridad', '# Ciberseguridad\n\nLa protección digital es clave.\n\n## Buenas prácticas\n- Usar contraseñas seguras\n- Mantener el software actualizado\n\n> “La seguridad no es un producto, es un proceso.”\n\n', '2025-05-18 22:35:29', 1, '2025-05-18 22:35:29'),
(49, '96C3E69E0BB2E8A14D4C6E2AE71B0411', 3, 'Ventajas de MacOS', '# Ventajas de MacOS\n\n- Estabilidad\n- Ecosistema Apple\n- Seguridad avanzada\n\n## Tabla comparativa\n| Característica | MacOS |\n| -------------- | ----- |\n| Seguridad      | Alta  |\n| Diseño         | Alto  |\n\n', '2025-05-18 22:35:29', 1, '2025-05-18 22:35:29'),
(50, '4E73C8F9E4B3D9DDF557A29B92B0DC7B', 3, 'Atajos útiles', '# Atajos útiles en MacOS\n\n- ⌘ + Espacio: Spotlight\n- ⌘ + Tab: Cambiar app\n\n## Código para mostrar mensaje\n```js\nalert(\"Atajo activado!\");\n```\n', '2025-05-18 22:35:29', 1, '2025-05-18 22:35:29'),
(51, 'F7BA7D1C5F71CE0C23D3E1F9F768B75C', 4, 'Windows 11 novedades', '# Windows 11: Novedades\n\n- Menú de inicio rediseñado\n- Integración con Teams\n\n## Tabla\n| Función    | Estado    |\n| ---------- | --------- |\n| Widgets    | Mejorados |\n| Escritorios| Virtuales |\n\n', '2025-05-18 22:35:29', 1, '2025-05-18 22:35:29'),
(52, 'E04246813A54851FAAEF6B80D0B2877F', 4, 'Atajos de Windows', '# Atajos de Windows útiles\n\n- Win + D: Escritorio\n- Alt + Tab: Cambiar ventana\n\n## Código ejemplo\n```js\nconsole.log(\"Atajo de Windows\");\n```\n', '2025-05-18 22:35:29', 1, '2025-05-18 22:35:29'),
(53, 'D1393C4BFD5DAB78C1F957EAE2D80C41', 5, '¿Qué es Linux?', '# ¿Qué es Linux?\n\nLinux es un sistema operativo de código abierto basado en Unix.\n\n> “El software libre es una cuestión de libertad, no de precio.”\n\n## Características\n- Libre y gratuito\n- Multiplataforma\n- Comunidad activa\n\n| Distros populares |\n|-------------------|\n| Ubuntu            |\n| Fedora            |\n| Debian            |\n\n```js\n// Mostrar kernel version\nconsole.log(\"Versión del kernel:\", process.version);\n```\n', '2025-05-18 22:35:44', 1, '2025-05-18 22:35:44'),
(54, 'A1FA5AB9B913BBAAB8A7597CCBA37891', 5, 'Comandos básicos', '# Comandos básicos de Linux\n\n- `ls`: Lista archivos\n- `cd`: Cambia directorio\n- `pwd`: Muestra ruta actual\n\n## Código ejemplo\n```js\nconsole.log(\"ls, cd, pwd son comandos esenciales en Linux\");\n```\n', '2025-05-18 22:35:44', 1, '2025-05-18 22:35:44'),
(55, 'CBB1220B6C3D6EFA782B47D21601D8E7', 5, 'Estructura de archivos', '# Estructura de archivos en Linux\n\nLinux organiza todo en forma de árbol de directorios.\n\n| Directorio  | Propósito         |\n|-------------|------------------|\n| /home       | Usuarios         |\n| /etc        | Configuración    |\n| /var        | Datos variables  |\n', '2025-05-18 22:35:44', 1, '2025-05-18 22:35:44'),
(56, 'D0D29E213A789B4CF0C87C23C7AE3BBE', 6, '¿Qué es Android?', '# ¿Qué es Android?\n\nAndroid es un sistema operativo móvil basado en Linux y desarrollado por Google.\n\n## Ventajas\n- Personalización\n- Gran catálogo de apps\n- Código abierto\n\n> “Android democratizó el acceso a los smartphones.”\n\n| Versión   | Nombre      |\n|-----------|-------------|\n| 10        | Q           |\n| 11        | R           |\n| 12        | S           |\n', '2025-05-18 22:35:44', 1, '2025-05-18 22:35:44'),
(57, 'A78D12577BDB9A6D48E78A47CF1D9631', 6, 'Apps imprescindibles', '# Apps imprescindibles en Android\n\n- WhatsApp\n- Telegram\n- Google Maps\n\n## Ejemplo\n```js\nconsole.log(\"Descargando apps desde Google Play...\");\n```\n', '2025-05-18 22:35:44', 1, '2025-05-18 22:35:44'),
(58, 'B2EBAAFBC22F3DF3B99132F6C9F1A439', 6, 'Seguridad en Android', '# Seguridad en Android\n\n## Consejos:\n- Descarga apps solo de fuentes oficiales\n- Usa bloqueo biométrico\n- Mantén el sistema actualizado\n\n| Riesgo      | Prevención          |\n|-------------|--------------------|\n| Malware     | Google Play Protect|\n| Phishing    | Verificar enlaces  |\n', '2025-05-18 22:35:44', 1, '2025-05-18 22:35:44'),
(59, '10A7E57E0E7E0EBFF80F6B87B5733A3A', 7, '¿Qué es Docker?', '# ¿Qué es Docker?\n\nDocker es una plataforma para crear, distribuir y ejecutar contenedores de software.\n\n> “Docker simplifica la entrega de aplicaciones.”\n\n## Ventajas:\n- Portabilidad\n- Eficiencia\n- Escalabilidad\n\n| Comando          | Acción              |\n|------------------|--------------------|\n| docker run       | Ejecuta un contenedor |\n| docker ps        | Lista contenedores  |\n', '2025-05-18 22:35:44', 1, '2025-05-18 22:35:44'),
(60, 'A3B71A919E2B8F0B1B27FAF38F6B87DB', 7, 'Ejemplo Dockerfile', '# Ejemplo de Dockerfile\n\n```js\n# Dockerfile básico\nFROM node:18\nCOPY . /app\nWORKDIR /app\nRUN npm install\nCMD [\"node\", \"index.js\"]\n```\n', '2025-05-18 22:35:44', 1, '2025-05-18 22:35:44'),
(61, '2340CC6904E97C5738D27C29E0A96C54', 8, '¿Qué es Kubernetes?', '# ¿Qué es Kubernetes?\n\nKubernetes es una plataforma para la gestión de contenedores a escala.\n\n- Orquestación automática\n- Escalado sencillo\n- Recuperación ante fallos\n\n> “Kubernetes es el sistema operativo de la nube.”\n\n', '2025-05-18 22:35:44', 1, '2025-05-18 22:35:44'),
(62, '4D0D44F48E342BAEB6D374708631028E', 8, 'Componentes clave', '# Componentes clave de Kubernetes\n\n- Pod\n- Service\n- Deployment\n- Namespace\n\n| Componente | Descripción           |\n|------------|----------------------|\n| Pod        | Unidad básica        |\n| Service    | Punto de acceso      |\n', '2025-05-18 22:35:44', 1, '2025-05-18 22:35:44'),
(63, 'DA18938DC3833F470F05C7A0C68B88AA', 9, '¿Qué es DevOps?', '# ¿Qué es DevOps?\n\nDevOps es una filosofía que integra desarrollo y operaciones para acelerar la entrega de software.\n\n## Principios:\n- Integración continua\n- Entrega continua\n- Automatización\n\n> “DevOps es cultura y automatización.”\n', '2025-05-18 22:35:44', 1, '2025-05-18 22:35:44'),
(64, 'FDD0BC2209C7DA81A290E8DF02AB6F32', 9, 'Herramientas DevOps', '# Herramientas clave en DevOps\n\n- Jenkins\n- GitLab CI\n- Docker\n- Kubernetes\n\n## Pipeline básico (pseudo-código)\n```js\n// Pipeline\nbuild();\ntest();\ndeploy();\n```\n', '2025-05-18 22:35:44', 1, '2025-05-18 22:35:44'),
(65, 'A58B2C19F71DD76B8F014E54DF50CB14', 10, '¿Qué es una red informática?', '# ¿Qué es una red informática?\n\nUna red informática conecta dispositivos para compartir recursos y datos.\n\n## Tipos comunes\n- LAN\n- WAN\n- WLAN\n\n> “Internet es la red de redes.”\n\n| Tipo  | Descripción     |\n|-------|-----------------|\n| LAN   | Red local       |\n| WAN   | Red amplia      |\n', '2025-05-18 23:18:51', 1, '2025-05-18 23:18:51'),
(66, 'B37B8C934BDDFD1CB8978B4A78F12F4A', 10, 'Protocolos esenciales', '# Protocolos esenciales de red\n\n- TCP/IP\n- HTTP/HTTPS\n- FTP\n\n## Ejemplo de uso\n```js\n// Petición HTTP simple\nfetch(\"https://api.example.com\").then(r => r.json());\n```\n', '2025-05-18 23:18:51', 1, '2025-05-18 23:18:51'),
(67, '63C63E9897AD38A382D5D2A210B61819', 11, '¿Qué es la IA?', '# ¿Qué es la Inteligencia Artificial?\n\nLa IA es el campo que busca crear sistemas capaces de realizar tareas que requieren inteligencia humana.\n\n- Aprendizaje automático\n- Procesamiento de lenguaje natural\n- Visión por computador\n\n> “La IA no sustituirá a las personas, pero sí transformará el trabajo.”\n', '2025-05-18 23:18:51', 1, '2025-05-18 23:18:51'),
(68, 'F3A1B2C4E9DDE26BCB1ACF38B9BAFC22', 11, 'Redes neuronales', '# Redes neuronales artificiales\n\nUna red neuronal es un modelo inspirado en el cerebro humano para resolver problemas complejos.\n\n## Ejemplo en pseudocódigo\n```js\n// Perceptrón simple\nlet peso = 0.5;\nlet entrada = 1;\nlet salida = entrada * peso;\n```\n\n| Capa         | Función             |\n|--------------|---------------------|\n| Entrada      | Recibe datos        |\n| Oculta       | Procesa información |\n| Salida       | Da el resultado     |\n', '2025-05-18 23:18:51', 1, '2025-05-18 23:18:51'),
(69, '45E3DF6B28ACF41EB2F13A02DE7AD1DF', 11, 'Aplicaciones actuales', '# Aplicaciones de la IA\n\n- Asistentes virtuales (Siri, Alexa)\n- Traducción automática\n- Detección de fraudes bancarios\n\n> “La IA potencia la eficiencia y la personalización.”\n', '2025-05-18 23:18:51', 1, '2025-05-18 23:18:51'),
(70, 'E1DAEFC22C7AF3B69A29A3CC3E70CBA2', 7, 'Comandos útiles', '# Comandos útiles en Docker\n\n- `docker build` para construir imágenes\n- `docker exec` para ejecutar comandos en contenedores\n\n## Ejemplo\n```js\n// Ejecutar bash en un contenedor\n// docker exec -it mi_contenedor bash\n```\n', '2025-05-18 23:18:51', 1, '2025-05-18 23:18:51'),
(71, 'F7CD9A2D3EAB4218A4F3B1DFE215A1B6', 5, 'Permisos de archivos', '# Permisos de archivos en Linux\n\nEn Linux, los permisos determinan quién puede leer, escribir o ejecutar un archivo.\n\n| Símbolo | Significado |\n|---------|------------|\n| r       | Lectura     |\n| w       | Escritura   |\n| x       | Ejecución   |\n\n## Ejemplo de cambio de permisos\n```js\n// Cambiar permisos\n// chmod 755 archivo.sh\n```\n', '2025-05-18 23:18:51', 1, '2025-05-18 23:18:51'),
(72, 'AE39423C0B7F4D259B907B23E471A2B3', 8, 'Manifiesto YAML básico', '# Manifiesto YAML en Kubernetes\n\nUn manifiesto describe los recursos que quieres desplegar:\n\n```js\n# deployment.yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: mi-app\nspec:\n  replicas: 2\n  template:\n    metadata:\n      labels:\n        app: mi-app\n    spec:\n      containers:\n        - name: app\n          image: mi-imagen:latest\n```\n', '2025-05-18 23:18:51', 1, '2025-05-18 23:18:51'),
(73, 'E70DEAFEED0B2F96D7B5D9AABCF836A8', 9, 'Ciclo de vida DevOps', '# Ciclo de vida DevOps\n\n- Planificación\n- Codificación\n- Integración\n- Pruebas\n- Entrega\n- Monitorización\n\n## Código ejemplo\n```js\n// Ciclo básico\nplan();\ncode();\nintegrate();\ntest();\ndeploy();\nmonitor();\n```\n', '2025-05-18 23:18:51', 1, '2025-05-18 23:18:51'),
(74, 'C05A1F68D5CB4474B45A4381D1E3C1AA', 6, 'Gestión de batería', '# Gestión de batería en Android\n\n- Reduce el brillo de pantalla\n- Cierra apps en segundo plano\n- Usa el modo ahorro de energía\n\n## Código ejemplo\n```js\nconsole.log(\"Verificando consumo de batería...\");\n```\n', '2025-05-18 23:18:51', 1, '2025-05-18 23:18:51'),
(75, 'A290CC4F67D7BBA2F1D4C27B5B3A4B11', 5, 'Gestores de paquetes', '# Gestores de paquetes en Linux\n\n- apt\n- yum\n- pacman\n\n| Gestor  | Distribución   |\n|---------|---------------|\n| apt     | Debian/Ubuntu |\n| yum     | RedHat/Fedora |\n| pacman  | Arch Linux    |\n', '2025-05-18 23:18:51', 1, '2025-05-18 23:18:51'),
(76, 'C4D96F12F4B7A0D2B6D7A2B09F65A8E3', 11, 'Tipos de aprendizaje', '# Tipos de aprendizaje en IA\n\n- Supervisado\n- No supervisado\n- Por refuerzo\n\n## Código ejemplo\n```js\n// Ejemplo simple\nfunction entrenar(datos) {\n  // ...\n}\n```\n', '2025-05-18 23:18:51', 1, '2025-05-18 23:18:51'),
(77, 'F7BA7D1C5F71CE0C23D3E1F9F768B75C', 12, 'Windows 11 novedades', '# Windows 11: Novedades\n\nWindows 11 introduce un diseño más limpio, menús centrados y mejoras en la productividad.\n\n- Nuevo menú inicio\n- Integración con Microsoft Teams\n- Widgets personalizables\n\n```js\nconsole.log(\"Windows 11 tiene nuevo menú de inicio\");\n```\n', '2025-05-18 23:19:16', 1, '2025-05-18 23:19:16'),
(78, 'E04246813A54851FAAEF6B80D0B2877F', 12, 'Atajos de Windows', '# Atajos útiles en Windows\n\n- `Win + D`: Mostrar escritorio\n- `Alt + Tab`: Cambiar ventana\n- `Win + L`: Bloquear pantalla\n', '2025-05-18 23:19:16', 1, '2025-05-18 23:19:16'),
(79, '96C3E69E0BB2E8A14D4C6E2AE71B0411', 13, 'Ventajas de MacOS', '# Ventajas de MacOS\n\n- Estabilidad\n- Integración con hardware Apple\n- Gran rendimiento gráfico\n\n> “MacOS es el estándar en creatividad digital.”\n', '2025-05-18 23:19:16', 1, '2025-05-18 23:19:16'),
(80, '4E73C8F9E4B3D9DDF557A29B92B0DC7B', 13, 'Atajos útiles', '# Atajos útiles en MacOS\n\n- `Cmd + Space`: Spotlight\n- `Cmd + Tab`: Cambiar app\n- `Cmd + Shift + 4`: Captura de pantalla\n', '2025-05-18 23:19:16', 1, '2025-05-18 23:19:16'),
(81, 'D83F5B4874B6B353D9483E869C9A6F11', 14, 'Ciberseguridad', '# ¿Qué es la ciberseguridad?\n\nLa ciberseguridad protege sistemas y datos de ataques y accesos no autorizados.\n\n| Amenaza    | Ejemplo           |\n|------------|-------------------|\n| Phishing   | Emails falsos     |\n| Ransomware | Secuestro de datos|\n', '2025-05-18 23:19:16', 1, '2025-05-18 23:19:16'),
(82, 'BA1C97232EBDEB80BDE6359E45B42FAD', 14, 'Buenas prácticas', '# Buenas prácticas en ciberseguridad\n\n- Usa contraseñas seguras\n- Habilita la autenticación en dos pasos\n- No compartas información sensible\n\n```js\n// Validar contraseña fuerte\nfunction isStrong(pwd) {\n  return pwd.length > 8;\n}\n```\n', '2025-05-18 23:19:16', 1, '2025-05-18 23:19:16'),
(83, 'D27F9D3C2E8D43DDB8856D91B6B70D37', 15, '¿Qué es Python?', '# ¿Qué es Python?\n\nPython es un lenguaje de programación muy popular por su simplicidad y versatilidad.\n\n- Sintaxis clara\n- Multiplataforma\n- Amplia comunidad\n', '2025-05-18 23:19:16', 1, '2025-05-18 23:19:16'),
(84, '7DFA0B0BA324E0B7B5D7CC3DB8E2B15F', 15, 'Ejemplo de código', '# Ejemplo básico en Python\n\n```js\n# Imprimir un saludo\nprint(\"Hola, mundo!\")\n```\n', '2025-05-18 23:19:16', 1, '2025-05-18 23:19:16'),
(85, 'F92BC6E1A5E845679BEDCA0BDB965B48', 5, 'Redirección de comandos', '# Redirección de comandos en Linux\n\nPermite enviar la salida de un comando a un archivo o a otro comando.\n\n- `>` para sobrescribir\n- `>>` para añadir\n- `|` para encadenar comandos\n\n```js\n// Ejemplo: guardar listado de archivos\n// ls > archivos.txt\n```\n', '2025-05-18 23:19:16', 1, '2025-05-18 23:19:16'),
(86, 'AEB4D4F6CB1C47C4BFFD6249183C6719', 7, 'Docker Compose', '# ¿Qué es Docker Compose?\n\nPermite definir y administrar múltiples contenedores con un solo archivo YAML.\n\n```js\n# docker-compose.yml básico\nversion: \"3\"\nservices:\n  web:\n    image: nginx\n    ports:\n      - \"80:80\"\n```\n', '2025-05-18 23:19:16', 1, '2025-05-18 23:19:16'),
(87, 'C38AE6B826F54C5EA0AF8B6F4D47C219', 9, 'Monitorización', '# Monitorización en DevOps\n\nLa monitorización permite detectar incidencias y mejorar la disponibilidad del sistema.\n\n- Prometheus\n- Grafana\n- ELK Stack\n\n```js\nconsole.log(\"Monitorizando servicios...\");\n```\n', '2025-05-18 23:19:16', 1, '2025-05-18 23:19:16'),
(88, 'D8B6B5E95CA44F329E94E8F5C25F69A4', 6, 'Actualizaciones de seguridad', '# Actualizaciones de seguridad en Android\n\nMantener el sistema actualizado es clave para evitar vulnerabilidades.\n\n> “Actualiza, protege tu móvil.”\n', '2025-05-18 23:19:16', 1, '2025-05-18 23:19:16'),
(89, '3C6D2F6C67AA479B9F9E1E3BA485B13E', 8, 'kubectl básico', '# kubectl básico\n\n`kubectl` es la herramienta principal para gestionar clústeres Kubernetes.\n\n- `kubectl get pods`\n- `kubectl apply -f archivo.yaml`\n\n```js\nconsole.log(\"Gestionando pods con kubectl\");\n```\n', '2025-05-18 23:19:16', 1, '2025-05-18 23:19:16'),
(90, '124D7A4AC33B44E5A22A9AD5F1F83A31', 5, 'Gestores de paquetes en Linux', '# Gestores de paquetes en Linux\n\n- `apt`\n- `yum`\n- `pacman`\n\n| Distro   | Gestor |\n|----------|--------|\n| Ubuntu   | apt    |\n| Fedora   | dnf    |\n| Arch     | pacman |\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(91, 'EAC9D3E927B84BFEA111E9C9C7D18E37', 5, 'Permisos en Linux', '# Permisos en Linux\n\nLos permisos controlan el acceso a archivos y carpetas.\n\n```js\nls -l\nchmod 755 archivo.txt\n```\n\n| Permiso | Símbolo |\n|---------|---------|\n| Lectura | r       |\n| Escritura | w     |\n| Ejecución | x     |\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(92, 'BC85AC2D1EAF41CDA5AF23926AAEBA7E', 6, 'Android One', '# Android One\n\nAndroid One es una versión pura del sistema operativo de Google.\n\n- Sin capas de personalización\n- Actualizaciones rápidas\n- Mejor rendimiento\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(93, 'AEFF9C63CFB947C6861C0CA6F1A842AB', 6, 'Root en Android', '# Root en Android\n\nEl acceso root permite controlar todo el sistema.\n\n> “Con gran poder viene gran responsabilidad.”\n\n- Más control\n- Más riesgos\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(94, '8A8F5DB09A1D4004B0BCB7387BCFCE72', 7, 'Docker Compose', '# Docker Compose\n\nHerramienta para definir y correr aplicaciones multicontenedor.\n\n```js\ndocker-compose up -d\n```\n\n| Archivo | Descripción        |\n|---------|-------------------|\n| docker-compose.yml | Configuración |\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(95, 'B4CE4C8C1D7A40C085EE9E99C5A7329E', 7, 'Imágenes oficiales en Docker', '# Imágenes oficiales en Docker\n\nLas imágenes oficiales están mantenidas por Docker y su comunidad.\n\n- node\n- python\n- mysql\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(96, '07E07DE6E8A84E6C84C8F6DA62E2BA97', 8, 'YAML en Kubernetes', '# YAML en Kubernetes\n\nKubernetes usa archivos YAML para definir recursos.\n\n```js\napiVersion: v1\nkind: Pod\nmetadata:\n  name: mi-pod\n```\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(97, 'D5D7156B76C0417C96A89EB943EF03AD', 8, 'Kubectl', '# Kubectl\n\nLa herramienta de línea de comandos para gestionar Kubernetes.\n\n```js\nkubectl get pods\nkubectl apply -f archivo.yaml\n```\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(98, 'F5B2F53A5B154BA0869C3D8A7C14AA56', 9, 'CI/CD', '# CI/CD\n\nCI/CD significa integración y entrega continua.\n\n| Etapa | Objetivo      |\n|-------|--------------|\n| Build | Compilar     |\n| Test  | Probar       |\n| Deploy| Desplegar    |\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(99, 'FF3B4D1A4CF641D7B2C912338C6376D7', 9, 'Monitorización en DevOps', '# Monitorización en DevOps\n\n- Prometheus\n- Grafana\n- ELK Stack\n\nLa observabilidad es clave en sistemas modernos.\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(100, '33C96A4C3C964E3193B846BB5E1B1D47', 10, 'Windows Defender', '# Windows Defender\n\nEl antivirus integrado de Windows.\n\n- Protección en tiempo real\n- Análisis automático\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(101, '2AD31F1E81F347B5B85C234A2AFAF3C5', 10, 'PowerShell', '# PowerShell\n\nShell potente para administración en Windows.\n\n```js\nGet-Process\nGet-Service\n```\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(102, 'C6E8541E53F24E50A2A647F7E8E574E5', 11, 'Spotlight en MacOS', '# Spotlight en MacOS\n\nPermite buscar rápidamente archivos, apps y más.\n\n- Atajo: `Cmd + Espacio`\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(103, 'D71E3D8D3A3849EEB58C3A8ABBD72D4C', 11, 'Time Machine', '# Time Machine\n\nSistema de copias de seguridad automático en MacOS.\n\n- Recuperación sencilla\n- Copias incrementales\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(104, 'B347B154C2454482B3255B41C6247AF3', 12, 'Malware', '# Malware\n\nSoftware malicioso que puede afectar sistemas.\n\n| Tipo      | Ejemplo   |\n|-----------|-----------|\n| Virus     | WannaCry  |\n| Ransomware| Petya     |\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(105, '4C3EDDD3E3A749BDBF7B7D9D14AC2F1E', 12, 'Phishing', '# Phishing\n\nEl engaño para robar datos mediante suplantación de identidad.\n\n- Emails falsos\n- Webs clonadas\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(106, 'AABCD5F0D41E4B4C9A9EB9E3A88482E5', 13, '¿Qué es Python?', '# ¿Qué es Python?\n\nLenguaje de programación sencillo y muy usado en ciencia de datos.\n\n```js\nprint(\"Hola, Python!\")\n```\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(107, '59CF60A3E8B74452B47E1B399CE35ED1', 13, 'Virtualenv en Python', '# Virtualenv en Python\n\nHerramienta para gestionar entornos virtuales.\n\n```js\npython -m venv myenv\nsource myenv/bin/activate\n```\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(108, 'F5313D905D7F4D8BA8FC1BE2C3A3E62D', 14, 'Historia de la nube', '# Historia de la nube\n\nLa computación en la nube cambió la infraestructura tecnológica.\n\n- AWS\n- Azure\n- Google Cloud\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(109, 'E52F73AA8E7E4CBCA8D94353A5C87938', 14, 'Tipos de servicios cloud', '# Tipos de servicios cloud\n\n| Tipo | Ejemplo           |\n|------|------------------|\n| IaaS | Amazon EC2       |\n| PaaS | Google App Engine|\n| SaaS | Gmail            |\n', '2025-05-18 23:24:51', 1, '2025-05-18 23:24:51'),
(111, 'A9DYiV1tWhiTsYE7Vy3YPbFZgl3yzoiu', 1, 'test', '# Test', '2025-05-19 00:36:22', 1, '2025-05-19 00:36:22'),
(112, 'u3WX3hcny05TIhOa90hVBhfocanTqlyh', 0, 'test', '# Test', '2025-05-19 00:37:36', 1, '2025-05-19 00:37:36'),
(113, 'PI2TEoGnXJbwm34j7RxwEjxY68D6fwEN', 31, 'TEST4', '# TEST4', '2025-05-19 00:39:50', 1, '2025-05-19 00:39:50'),
(114, 'YAhpuPuhEzGOw4y4pWIQMSFRqgpFBbgQ', 31, 'TEST', '# TEST', '2025-05-19 00:40:21', 1, '2025-05-19 00:40:21');

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL AUTO_INCREMENT,
  `notification_id2` varchar(32) NOT NULL,
  `notification_message` text NOT NULL,
  `insert_date` datetime NOT NULL,
  PRIMARY KEY (`notification_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `vaults` (
  `vault_id` int(11) NOT NULL AUTO_INCREMENT,
  `vault_id2` char(50) NOT NULL,
  `vault_title` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `logical_path` varchar(255) NOT NULL,
  `is_private` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `pin` int(11) default null,
  PRIMARY KEY (`vault_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

INSERT INTO `vaults` (`vault_id`, `vault_id2`, `vault_title`, `user_id`, `logical_path`, `is_private`, `created_at`) VALUES
(1, 'd78fsd9g789sd7d8f9sdf7f89as789', 'TEST', 1, '/SynapsVaults/TEST', 0, '2025-05-18 20:54:54'),
(2, 'F7D8FG97DF89GF7SD89', 'TEST2', 1, '/SynapsVaults/TEST2', 0, '2025-05-18 20:54:54');

-- Las claves primarias ya están definidas en CREATE TABLE, no necesitamos ALTER TABLE

ALTER TABLE `docs`
  MODIFY `doc_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `folders_notes`
  MODIFY `folder_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

ALTER TABLE `log`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `notes`
  MODIFY `note_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `vaults`
  MODIFY `vault_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3,
  MODIFY `logical_path` varchar(255) DEFAULT NULL;

-- ============================================
-- TABLAS DE TAREAS (TASK MANAGEMENT SYSTEM)
-- ============================================

-- Tabla principal de tareas
CREATE TABLE `tasks` (
  `task_id` int(11) NOT NULL AUTO_INCREMENT,
  `task_id2` varchar(32) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('todo', 'in-progress', 'done') NOT NULL DEFAULT 'todo',
  `priority` enum('low', 'medium', 'high') DEFAULT 'medium',
  `vault_id` int(11) NOT NULL,
  `folder_id` int(11) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `due_date` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`task_id`),
  UNIQUE KEY `task_id2` (`task_id2`),
  KEY `idx_vault_status` (`vault_id`, `status`),
  KEY `idx_assigned_status` (`assigned_to`, `status`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_folder_id` (`folder_id`),
  KEY `idx_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Tabla de etiquetas para tareas
CREATE TABLE `task_tags` (
  `tag_id` int(11) NOT NULL AUTO_INCREMENT,
  `tag_id2` varchar(32) NOT NULL,
  `name` varchar(50) NOT NULL,
  `color` varchar(7) DEFAULT '#F56E0F',
  `vault_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `tag_id2` (`tag_id2`),
  UNIQUE KEY `unique_tag_vault` (`name`, `vault_id`),
  KEY `idx_vault_id` (`vault_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Tabla de relación muchos a muchos para etiquetas
CREATE TABLE `task_tag_relations` (
  `task_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`task_id`, `tag_id`),
  KEY `idx_task_id` (`task_id`),
  KEY `idx_tag_id` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Tabla de comentarios en tareas
CREATE TABLE `task_comments` (
  `comment_id` int(11) NOT NULL AUTO_INCREMENT,
  `comment_id2` varchar(32) NOT NULL,
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`comment_id`),
  UNIQUE KEY `comment_id2` (`comment_id2`),
  KEY `idx_task_created` (`task_id`, `created_at`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Tabla de archivos adjuntos
CREATE TABLE `task_attachments` (
  `attachment_id` int(11) NOT NULL AUTO_INCREMENT,
  `attachment_id2` varchar(32) NOT NULL,
  `task_id` int(11) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `stored_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `uploaded_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attachment_id`),
  UNIQUE KEY `attachment_id2` (`attachment_id2`),
  KEY `idx_task_id` (`task_id`),
  KEY `idx_uploaded_by` (`uploaded_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Tabla de historial de cambios (auditoría)
CREATE TABLE `task_history` (
  `history_id` int(11) NOT NULL AUTO_INCREMENT,
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` enum('created', 'updated', 'status_changed', 'assigned', 'commented', 'deleted') NOT NULL,
  `field_changed` varchar(50) DEFAULT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `idx_task_created` (`task_id`, `created_at`),
  KEY `idx_user_action` (`user_id`, `action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Insertar etiquetas de ejemplo
INSERT INTO `task_tags` (`tag_id2`, `name`, `color`, `vault_id`, `created_at`) VALUES
('EJ1TAG001URGENT00000000000000000', 'Urgente', '#FF4444', 1, NOW()),
('EJ2TAG002IMPORTANT000000000000000', 'Importante', '#FF8800', 1, NOW()),
('EJ3TAG003PERSONAL0000000000000000', 'Personal', '#4CAF50', 1, NOW()),
('EJ4TAG004WORK00000000000000000000', 'Trabajo', '#2196F3', 1, NOW()),
('EJ5TAG005IDEA00000000000000000000', 'Ideas', '#9C27B0', 1, NOW());

-- Insertar tareas de ejemplo
INSERT INTO `tasks` (`task_id2`, `title`, `description`, `status`, `priority`, `vault_id`, `folder_id`, `created_by`, `due_date`, `created_at`, `updated_at`) VALUES
('TSK001WELCOME00000000000000000000', '¡Bienvenido al sistema de tareas!', 'Esta es tu primera tarea en Synaps. Aquí puedes organizar todos tus pendientes y proyectos.\n\n## Funcionalidades principales:\n- ✅ Crear tareas con diferentes prioridades\n- 🏷️ Organizar con etiquetas\n- 📂 Agrupar por carpetas\n- 💬 Añadir comentarios\n- 📎 Adjuntar archivos\n\n¡Explora todas las funcionalidades!', 'todo', 'high', 1, 1, 1, DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW()),
('TSK002ORGANIZE000000000000000000000', 'Organizar mi espacio de trabajo', 'Configurar las carpetas y estructura inicial para mis proyectos.', 'todo', 'medium', 1, 1, 1, DATE_ADD(NOW(), INTERVAL 3 DAY), NOW(), NOW()),
('TSK003EXAMPLE0000000000000000000000', 'Tarea de ejemplo completada', 'Esta tarea muestra cómo se ve una tarea completada en el sistema.', 'done', 'low', 1, 1, 1, NOW(), NOW(), NOW());

-- Insertar relaciones de etiquetas con tareas
INSERT INTO `task_tag_relations` (`task_id`, `tag_id`, `created_at`) VALUES
(1, 2, NOW()),  -- Tarea 1 con etiqueta "Importante"
(1, 5, NOW()),  -- Tarea 1 con etiqueta "Ideas"
(2, 4, NOW()),  -- Tarea 2 con etiqueta "Trabajo"
(3, 3, NOW());  -- Tarea 3 con etiqueta "Personal"

-- Insertar comentario de ejemplo
INSERT INTO `task_comments` (`comment_id2`, `task_id`, `user_id`, `content`, `created_at`, `updated_at`) VALUES
('CMT001WELCOME00000000000000000000', 1, 1, '¡Perfecto! Ya tienes tu primer comentario en una tarea. Los comentarios son ideales para hacer seguimiento del progreso.', NOW(), NOW());

-- Auto increment para las nuevas tablas
ALTER TABLE `tasks`
  MODIFY `task_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `task_tags`
  MODIFY `tag_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `task_comments`
  MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `task_attachments`
  MODIFY `attachment_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `task_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT;

COMMIT;
