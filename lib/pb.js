import PocketBase from 'https://cdnjs.cloudflare.com/ajax/libs/pocketbase/0.26.2/pocketbase.es.mjs';

const PB_URL = "https://tavue-sae301.noelie-ahuir.fr:443"; 

// Une seule instance PocketBase côté client
export const pb = new PocketBase(PB_URL);

// pb.authStore persiste tout seul dans localStorage
// donc l'utilisateur reste connecté même après refresh

