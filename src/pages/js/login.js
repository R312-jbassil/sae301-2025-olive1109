import pb from "../../utils/pb";
import { Collections } from "../../utils/pocketbase-types";

export const POST = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email et mot de passe requis" }), { status: 400 });
    }

    // Authentifie l'utilisateur
    const authData = await pb.collection(Collections.Users).authWithPassword(email, password);

    // Si l'email n'est pas vérifié, renvoyer une erreur (optionnel)
    if (pb.authStore.model && pb.authStore.model.verified === false) {
      return new Response(JSON.stringify({ error: "Veuillez vérifier votre email avant de continuer." }), { status: 403 });
    }

    return new Response(JSON.stringify({ user: authData.record }), { status: 200, headers: { "Content-Type": "application/json" }});
  } catch (err) {
    console.error("Erreur de connexion :", err);
    const message = err?.data?.message || err?.message || "Identifiants invalides";
    return new Response(JSON.stringify({ error: message }), { status: 401, headers: { "Content-Type": "application/json" }});
  }
};