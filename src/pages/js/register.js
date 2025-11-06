import  pb  from "../../utils/pb";
import { Collections } from "../../utils/pocketbase-types";

export const POST = async ({ request }) => {
    // Récupère l'email et le mot de passe envoyés dans la requête
    const { email, name, password, passwordConfirm } = await request.json();

    try {
        // Authentifie l'utilisateur avec PocketBase en utilisant email et mot de passe
        console.log("registering user:", email, name, password, passwordConfirm);
        const user = await pb.collection(Collections.Users).create({
                "email": email,
                "emailVisibility": true,
                "name": name,
                "password": password,
                "passwordConfirm": passwordConfirm
        });


        // Retourne les informations de l'utilisateur authentifié
        return new Response(JSON.stringify({ user }), { status: 200 });
    } catch (err) {
        // En cas d'erreur d'authentification, retourne une erreur
        console.error("Erreur de connexion :", err);
        return new Response(JSON.stringify({ error: "Identifiants invalides" }), { status: 401 });
    }
};
