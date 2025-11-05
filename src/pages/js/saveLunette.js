import pb from '../../utils/pb';

const COLLECTION_MATERIAU = 'Materiau';
const COLLECTION_LUNETTE = 'Lunette_personalisees'; // vérifie l'orthographe exacte dans PocketBase

const apiTypeMap = { monture: 'Monture', branches: 'Branche', branche: 'Branche', verres: 'Verre', verre: 'Verre' };

async function findOrCreateMaterial(hex, wantedType) {
  if (!hex) return null;
  const hexEsc = String(hex).replace(/"/g, '\\"');
  const typeEsc = String(wantedType).replace(/"/g, '\\"');
  const filter = `Couleur="${hexEsc}" && type="${typeEsc}"`;
  try {
    const found = await pb.collection(COLLECTION_MATERIAU).getFullList(undefined, { filter });
    if (found && found.length) return found[0].id;
  } catch (e) {
    console.warn('[saveLunette] lookup Materiau failed', e);
  }

  try {
    const created = await pb.collection(COLLECTION_MATERIAU).create({ Couleur: hex, type: wantedType });
    return created.id;
  } catch (e) {
    console.error('[saveLunette] create Materiau failed', hex, wantedType, e);
    return null;
  }
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    console.log('[saveLunette] request body:', body);

    // support two input shapes:
    // - couleur: [{ part: 'monture', value: '#ff0' }, ...]
    // - or explicit fields: { monture: '#ff0', branche: '#000', verre: '#ccc', prix, user }
    const { couleur = null, prix = null, user = null } = body;

    // prepare per-part hex map
    const perPartHex = { monture: null, branche: null, verre: null };

    if (Array.isArray(couleur)) {
      for (const item of couleur) {
        const part = String(item.part || '').toLowerCase();
        const hex = item.value || item.hex || null;
        if (!part || !hex) continue;
        if (part === 'branches') perPartHex['branche'] = hex;
        else perPartHex[part] = hex;
      }
    } else {
      // try explicit fields
      if (body.monture) perPartHex.monture = body.monture;
      if (body.branche) perPartHex.branche = body.branche;
      if (body.branches) perPartHex.branche = body.branches;
      if (body.verre) perPartHex.verre = body.verre;
    }

    // map hex -> material ids
    const recordPayload = { prix: prix ?? null };
    if (user) recordPayload.user = user;

    for (const key of ['monture', 'branche', 'verre']) {
      const hex = perPartHex[key];
      if (!hex) continue;
      const wantedType = apiTypeMap[key] || key;
      console.log('[saveLunette] processing', key, hex, wantedType);
      const matId = await findOrCreateMaterial(hex, wantedType);
      if (matId) {
        // set field name in Lunette_personalisees to match your collection fields
        recordPayload[key] = matId;
      } else {
        console.warn('[saveLunette] no material id for', key, hex);
      }
    }

    // create the Lunette_personalisees record
    try {
      const created = await pb.collection(COLLECTION_LUNETTE).create(recordPayload);
      console.log('[saveLunette] created lunette id:', created.id);
      return new Response(JSON.stringify({ ok: true, id: created.id }), { status: 201, headers: { 'Content-Type': 'application/json' }});
    } catch (e) {
      console.error('[saveLunette] create Lunette_personalisees failed', e);
      return new Response(JSON.stringify({ error: 'Erreur création en base', details: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' }});
    }
  } catch (err) {
    console.error('[saveLunette] unexpected error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }
}