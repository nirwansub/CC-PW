const memory=new Map();let counter=0;
export function reset(){memory.clear();counter=0;}
export async function put(path,content,options={}){const old=memory.get(path);if(options.ifMatch&&old?.etag!==options.ifMatch){const e=new Error('Conflict');e.name='BlobPreconditionFailedError';throw e;}if(old&&!options.allowOverwrite){const e=new Error('Exists');e.name='BlobPathnameMismatchError';throw e;}const etag=String(++counter);memory.set(path,{content,etag});return{pathname:path,etag};}
export async function get(path){const value=memory.get(path);if(!value)return null;return{statusCode:200,blob:{etag:value.etag},stream:new Response(value.content).body};}
export async function list({prefix,cursor,limit=100}){const all=[...memory.keys()].filter(k=>k.startsWith(prefix));const start=Number(cursor)||0;return{blobs:all.slice(start,start+limit).map(pathname=>({pathname})),hasMore:start+limit<all.length,cursor:String(start+limit)};}
