import  pb  from "../../utils/pb";
import { Collections } from "../../utils/pocketbase-types";

export const POST = async ({ request, cookies }) => {
    // Récupère l'email et le mot de passe envoyés dans la requête
    const { email, password } = await request.json();
    try {
        // Authentifie l'utilisateur avec PocketBase en utilisant email et mot de passe
        const authData = await pb.collection(Collections.Users).authWithPassword(email, password);

        console.log('/api/login - auth succeeded, user id:', authData.record?.id);
        console.log('/api/login - pb.authStore.isValid:', pb.authStore.isValid);
        console.log('/api/login - pb.authStore.record?.id:', pb.authStore.record?.id);

        // Enregistre le token d'authentification dans un cookie sécurisé
        // pb.authStore.exportToCookie() retourne une chaîne de type
        // "pb_auth=TOKEN; Path=/; HttpOnly; ..." -> on extrait juste la valeur TOKEN
        try {
            const exported = pb.authStore.exportToCookie();
            const m = exported.match(/pb_auth=([^;]+)/);
            const token = m ? m[1] : exported;
            cookies.set("pb_auth", token, {
                path: "/",
                httpOnly: true,
                sameSite: "strict",
                expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            });
            console.log('/api/login - set pb_auth cookie token (truncated):', String(token).slice(0,20));
        } catch (e) {
            console.warn('/api/login - failed to export cookie token', e);
        }
        // Retourne les informations de l'utilisateur authentifié
        return new Response(JSON.stringify({ user: authData.record }), { status: 200 });
    } catch (err) {
        // En cas d'erreur d'authentification, retourne une erreur
        console.error("Erreur de connexion :", err);
        return new Response(JSON.stringify({ error: "Identifiants invalides" }), { status: 401 });
    }
};
