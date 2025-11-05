import pb from '../../utils/pb';

export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || '';
    // récupère tous les matériaux du type demandé (champ : type) — adapte si ton champ a un autre nom
    const filter = type ? { filter: `type = "${type}"` } : {};
    // PocketBase: getFullList / getList selon taille — ici on essaye getFullList
    const items = await pb.collection('materiau').getFullList(undefined, { filter: type ? `type="${type}"` : undefined });
    // extraire couleur depuis champs possibles
    const colors = items.map(r => r.color || r.couleur || r.hex || r.value).filter(Boolean);
    return new Response(JSON.stringify({ colors }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('materials API error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}