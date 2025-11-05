import pb from '../../utils/pb';
import { Collections } from '../../utils/pocketbase-types';

export async function POST({ request }) {
  try {
    const data = await request.json();
    const id = data?.id || data?._id;
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'Missing id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const collectionName = Collections?.Lunette ?? 'Lunette';
    await pb.collection(collectionName).delete(id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('deleteSVG error', error);
    return new Response(JSON.stringify({ success: false, error: error?.message ?? String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}