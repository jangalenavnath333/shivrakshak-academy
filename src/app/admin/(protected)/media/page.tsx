'use client'

import { useEffect, useState } from 'react'
import { ImageIcon, Trash2, Upload, Video } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { adminMutation } from '@/lib/admin-api'
import type { MediaAsset } from '@/types'

const placements = ['hero','course-police','course-army','course-srpf','course-written','result-1','result-2','result-3','result-4','result-5','result-6','gallery','video']

export default function MediaPage() {
  const [items,setItems]=useState<MediaAsset[]>([])
  const [busy,setBusy]=useState(false)
  const [form,setForm]=useState({title:'',media_type:'image',placement:'gallery',url:'',thumbnail_url:'',alt_text:'',sort_order:0,is_published:true})
  const load=()=>supabase.from('media_assets').select('*').order('sort_order').then(({data})=>setItems(data||[]))
  useEffect(()=>{load()},[])
  async function upload(file:File) {
    setBusy(true)
    const path=`${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'-')}`
    const {error}=await supabase.storage.from('academy-media').upload(path,file,{upsert:false})
    if(error){alert(error.message);setBusy(false);return}
    const {data}=supabase.storage.from('academy-media').getPublicUrl(path)
    setForm(v=>({...v,url:data.publicUrl,media_type:file.type.startsWith('video')?'video':'image'}));setBusy(false)
  }
  async function save(){setBusy(true);try{await adminMutation('media.create',{...form,sort_order:Number(form.sort_order)});setForm(v=>({...v,title:'',url:'',thumbnail_url:''}));load()}catch(e){alert(e instanceof Error?e.message:'Upload failed')}setBusy(false)}
  async function remove(id:string){if(!confirm('हा media item काढायचा?'))return;await adminMutation('media.delete',{id});setItems(v=>v.filter(x=>x.id!==id))}
  return <div className="admin-page"><div className="page-header"><div><h1 className="page-title">फोटो व व्हिडिओ</h1><p className="page-subtitle">Websiteवरील hero, course आणि result photos इथून बदला.</p></div></div>
    <section className="admin-card"><div className="admin-form-grid"><label><span className="form-label">शीर्षक</span><input className="form-input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label><span className="form-label">Websiteवरील जागा</span><select className="form-input" value={form.placement} onChange={e=>setForm({...form,placement:e.target.value})}>{placements.map(p=><option key={p}>{p}</option>)}</select></label><label><span className="form-label">Media प्रकार</span><select className="form-input" value={form.media_type} onChange={e=>setForm({...form,media_type:e.target.value})}><option value="image">Photo</option><option value="video">Uploaded video</option><option value="youtube">YouTube video</option></select></label><label><span className="form-label">Photo / Video file</span><span className="upload-control"><Upload size={18}/>{busy?'Upload होत आहे…':'File निवडा'}<input type="file" accept="image/*,video/*" onChange={e=>e.target.files?.[0]&&upload(e.target.files[0])}/></span></label><label className="wide-field"><span className="form-label">किंवा YouTube / URL</span><input className="form-input" value={form.url} onChange={e=>{const url=e.target.value;setForm({...form,url,media_type:/youtu(?:\.be|be\.com)/i.test(url)?'youtube':form.media_type})}} placeholder="https://youtube.com/shorts/..."/></label></div><button className="btn btn-primary" disabled={busy||!form.title||!form.url} onClick={save}>Websiteवर प्रकाशित करा</button></section>
    <div className="media-admin-grid">{items.map(item=><article key={item.id} className="admin-card media-admin-item"><div>{item.media_type==='image'?<ImageIcon/>:<Video/>}<strong>{item.title}</strong><span>{item.placement}</span></div><button className="icon-danger" onClick={()=>remove(item.id)} aria-label="Delete"><Trash2/></button></article>)}</div>
  </div>
}

