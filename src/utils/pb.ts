import PocketBase from 'pocketbase';
type TypedPocketBase = InstanceType<typeof PocketBase>;

const pb = new PocketBase('http://127.0.0.1:8090') as TypedPocketBase; // adapte l'URL si besoin
export default pb;