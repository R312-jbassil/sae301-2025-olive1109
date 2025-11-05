import pb from '../../utils/pb';
import { Collections } from '../../utils/pocketbase-types';

export async function POST({ request }) {
  const data = await request.json();
  console.log('updateSVG - received data:', data);

  const id = data.id || data._id;
  if (!id) {
    return new Response(JSON.stringify({ success: false, error: 'Missing id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // normalize possible field names from client
  const svg_code = data.svg_code ?? data.code ?? data.svg ?? null;
  const chat_history = data.chat_history ?? data.history ?? null;
  const nom_model = data.nom_model ?? data.name ?? null;

  // build update payload only with provided fields
  const updatePayload = {};
  if (svg_code !== null) updatePayload.svg_code = typeof svg_code === 'string' ? svg_code : JSON.stringify(svg_code);
  if (chat_history !== null) updatePayload.chat_history = typeof chat_history === 'string' ? chat_history : JSON.stringify(chat_history);
  if (nom_model !== null) updatePayload.nom_model = nom_model;

  if (Object.keys(updatePayload).length === 0) {
    return new Response(JSON.stringify({ success: false, error: 'No updatable fields provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // use collection name "Lunette" (adapt if your enum differs)
    const collectionName = Collections?.Lunette ?? 'Lunette';
    const updated = await pb.collection(collectionName).update(id, updatePayload);
    return new Response(JSON.stringify({ success: true, record: updated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('updateSVG error', error);
    return new Response(JSON.stringify({ success: false, error: error?.message ?? String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};