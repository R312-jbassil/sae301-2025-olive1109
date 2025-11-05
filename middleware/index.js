import pb from "../utils/pb";

// Global middleware for Astro (onRequest)
export const onRequest = async (context, next) => {
    // Vérifie la présence du cookie d'authentification
    const cookieVal = context.cookies.get("pb_auth")?.value;
    console.log('middleware: checking pb_auth cookie:', cookieVal ? 'present' : 'absent');
    if (cookieVal) {
        try {
            // pb.authStore.loadFromCookie expects a cookie header string like 'pb_auth=...;'
            // Some code saved the full exportToCookie string into the cookie value, others saved just the token.
            // Normalize both cases: if the value doesn't contain 'pb_auth=' prefix, prefix it.
            const cookieHeader = cookieVal.includes('pb_auth=') ? cookieVal : `pb_auth=${cookieVal}`;
            pb.authStore.loadFromCookie(cookieHeader); // Charge les infos d'auth depuis le cookie
            if (pb.authStore.isValid) {
                // Si le token est valide, ajoute les données utilisateur dans Astro.locals
                    console.log('middleware: loaded pb cookie, user id:', pb.authStore.record?.id);
                context.locals.user = pb.authStore.record;
            }
        } catch (e) {
            // ignore invalid cookie
             console.log('middleware: failed to load pb cookie', e);
        }
    }

    // Pour les routes js, on exige l'authentification sauf pour certaines routes publiques
    if (context.url.pathname.startsWith('/js/')) {
        // Liste d'js publiques qui ne nécessitent pas d'authentification
        const publicApis = [
            '/js/login',
            '/js/register',
            '/js/logout',
            '/js/generateSVG',
        ];

        if (!context.locals.user && !publicApis.includes(context.url.pathname)) {
            // Si l'utilisateur n'est pas connecté, on retourne une erreur 401 (non autorisé)
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        return next(); // Continue le traitement normal
    }

    // Pour les autres pages, si l'utilisateur n'est pas connecté, on le redirige vers /login
    if (!context.locals.user) {
        if (context.url.pathname !== '/login' && context.url.pathname !== '/')
            return Response.redirect(new URL('/login', context.url), 303);
    }

    // ... middleware pour l'i18n ou autre logique

    // Cette fonction middleware s'exécute à chaque requête.
    // context = infos de la requête (URL, cookies, méthode...)
    // next() = continue le traitement normal (afficher la page demandée)
    if (context.url.pathname.startsWith('/js/')) {
        return next();
    }
    // Si la requête est un POST (soumission du formulaire de langue) :
    if (context.request.method === 'POST') {
        // Lire les données du formulaire
        const form = await context.request.formData().catch(() => null);
        const lang = form?.get('language'); // Récupérer la langue choisie

        // Vérifier que la langue est bien 'en' ou 'fr'
        if (lang === 'en' || lang === 'fr') {
        // Enregistrer la préférence dans un cookie nommé 'locale'
        // - path: '/' → cookie disponible sur tout le site
        // - maxAge: 1 an
        context.cookies.set('locale', String(lang), { path: '/', maxAge: 60 * 60 * 24 * 365 });

        // Rediriger avec un code 303 (See Other) vers la même page en GET
        // Cela évite que le formulaire soit renvoyé si l'utilisateur recharge la page
        return Response.redirect(new URL(context.url.pathname + context.url.search, context.url), 303);
        }
    }

    // Déterminer la langue pour cette requête
    const cookieLocale = context.cookies.get('locale')?.value; // Lire la langue depuis le cookie

    // Choisir la langue finale :
    // - Si cookie valide → utiliser la valeur du cookie
    // - Sinon → essayer d'utiliser la langue préférée du navigateur
    // - Si rien n'est défini → utiliser 'en' par défaut
    context.locals.lang = (cookieLocale === 'fr' || cookieLocale === 'en')
        ? cookieLocale
        : (context.preferredLocale) ?? 'en';

    // Continuer le traitement normal (afficher la page demandée)
    return next();  
};
