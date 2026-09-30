export class BlobNotFoundError extends Error{}
export class BlobPreconditionFailedError extends Error{}
export class BlobPathnameMismatchError extends Error{}
const memory=new Map();let counter=0;
export function reset(){memory.clear();counter=0;}
export async function put(path,content,options={}){const old=memory.get(path);if(options.ifMatch&&old?.etag!==options.ifMatch){throw new BlobPreconditionFailedError('Conflict');}if(old&&!options.allowOverwrite){throw new BlobPathnameMismatchError('Exists');}const etag='\"'+String(++counter)+'\"';memory.set(path,{content,etag});return{pathname:path,etag};}
export async function get(path){const value=memory.get(path);if(!value)return null;return{statusCode:200,blob:{etag:'W/'+value.etag},stream:new Response(value.content).body};}
export async function list({prefix,cursor,limit=100}){const all=[...memory.keys()].filter(k=>k.startsWith(prefix));const start=Number(cursor)||0;return{blobs:all.slice(start,start+limit).map(pathname=>({pathname})),hasMore:start+limit<all.length,cursor:String(start+limit)};}
