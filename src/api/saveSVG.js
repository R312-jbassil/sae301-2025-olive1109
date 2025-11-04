import pb from '../../utils/pb';
import { Collections } from '../../utils/pocketbase-types';

export const POST = async ({ request, cookies }) => {
    const data = await request.json();
    try {
        // If server-side auth cookie is present, prefer server-recorded user id
        try {
            const cookie = cookies.get('pb_auth')?.value;
            if (cookie) {
                const cookieHeader = cookie.includes('pb_auth=') ? cookie : `pb_auth=${cookie}`;
                pb.authStore.loadFromCookie(cookieHeader);
                if (pb.authStore.isValid) {
                    // attach server-trusted user id (pb.authStore.record.id)
                    data.user = pb.authStore.record?.id || data.user;
                }
            }
        } catch (e) {
            // ignore cookie parsing errors
            console.warn('saveSVG: cookie parse warning', e?.message || e);
        }

        // Basic validation
        if (!data.name || !data.code) {
            return new Response(JSON.stringify({ success: false, error: 'Missing name or code' }), {
                headers: { "Content-Type": "application/json" },
                status: 400,
            });
        }

        // Try to parse svg code if it's a JSON string, otherwise keep as-is
        let svg_code = data.code;
        if (typeof svg_code === 'string') {
            try {
                const parsed = JSON.parse(svg_code);
                svg_code = parsed;
            } catch (e) {
                // not JSON, keep original string
            }
        }

        // Build payload for the Lunette collection (fields based on pocketbase-types.ts)
        const payload = {
            nom_model: data.name,
            svg_code: svg_code,
            date: data.date || new Date().toISOString(),
            users: data.user || null
        };

        console.log('/api/saveSVG - creating Lunette payload:', { nom_model: payload.nom_model, users: payload.users });
        const record = await pb.collection(Collections.Lunette).create(payload);
        console.log('/api/saveSVG - created Lunette id:', record.id);
        return new Response(JSON.stringify({ success: true, id: record.id }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error('saveSVG error:', error);
        return new Response(JSON.stringify({ success: false, error: error?.message || String(error) }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        });
    }
};