import { promises as fs } from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const out=path.join(root,'www');
await fs.rm(out,{recursive:true,force:true});
await fs.mkdir(out,{recursive:true});

const rootEntries=await fs.readdir(root,{withFileTypes:true});
const allowed=new Set(['.html','.css','.js','.webmanifest']);
for(const entry of rootEntries){
  if(!entry.isFile())continue;
  const ext=path.extname(entry.name).toLowerCase();
  if(!allowed.has(ext))continue;
  await fs.copyFile(path.join(root,entry.name),path.join(out,entry.name));
}

for(const dir of ['modules','icons']){
  await fs.cp(path.join(root,dir),path.join(out,dir),{recursive:true});
}

console.log('FOH Toolkit native web bundle built in ./www');
