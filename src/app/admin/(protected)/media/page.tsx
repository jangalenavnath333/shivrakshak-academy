'use client'

import { useEffect, useState } from 'react'
import { ImageIcon, Trash2, Upload, Video } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { adminMutation } from '@/lib/admin-api'
import type { MediaAsset } from '@/types'

const placements = ['hero','course-police','course-army','course-srpf','course-written','result-1','result-2','result-3','result-4','result-5','result-6','demo-face-attendance','demo-online-exam','gallery','video'] as const
type MediaType = 'image' | 'video' | 'youtube'
type Placement = typeof placements[number]
type MediaForm = { title:string; media_type:MediaType; placement:Placement; url:string; thumbnail_url:string; alt_text:string; sort_order:number; is_published:boolean }

export default function MediaPage() {
  const [items,setItems]=useState<MediaAsset[]>([])
  const [busy,setBusy]=useState(false)
  const [form,setForm]=useState<MediaForm>({title:'',media_type:'image',placement:'gallery',url:'',thumbnail_url:'',alt_text:'',sort_order:0,is_published:true})
  const isDemoPlacement=form.placement.startsWith('demo-')
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
  async function uploadPoster(file:File) {
    setBusy(true)
    const path=`posters/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'-')}`
    const {error}=await supabase.storage.from('academy-media').upload(path,file,{upsert:false})
    if(error){alert(error.message);setBusy(false);return}
    const {data}=supabase.storage.from('academy-media').getPublicUrl(path)
    setForm(v=>({...v,thumbnail_url:data.publicUrl}));setBusy(false)
  }
  async function save(){setBusy(true);try{if(isDemoPlacement&&form.media_type==='image')throw new Error('Demo जागेसाठी Video किंवा YouTube निवडा.');if(isDemoPlacement&&!form.thumbnail_url)throw new Error('Demo video साठी poster photo आवश्यक आहे.');await adminMutation('media.create',{...form,sort_order:Number(form.sort_order)});setForm(v=>({...v,title:'',url:'',thumbnail_url:''}));load()}catch(e){alert(e instanceof Error?e.message:'Upload failed')}setBusy(false)}
  async function remove(id:string){if(!confirm('हा media item काढायचा?'))return;await adminMutation('media.delete',{id});setItems(v=>v.filter(x=>x.id!==id))}
  return <div className="admin-page"><div className="page-header"><div><h1 className="page-title">फोटो व व्हिडिओ</h1><p className="page-subtitle">Websiteवरील hero, course आणि result photos इथून बदला.</p></div></div>
    <section className="admin-card">
      <div className="admin-form-grid">
        <label><span className="form-label">शीर्षक</span><input className="form-input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
        <label><span className="form-label">Websiteवरील जागा</span><select className="form-input" value={form.placement} onChange={e=>{const placement=e.target.value as Placement;setForm({...form,placement,media_type:placement.startsWith('demo-')&&form.media_type==='image'?'video':form.media_type})}}>{placements.map(p=><option key={p}>{p}</option>)}</select></label>
        <label><span className="form-label">Media प्रकार</span><select className="form-input" value={form.media_type} onChange={e=>setForm({...form,media_type:e.target.value as MediaType})}>{!isDemoPlacement?<option value="image">Photo</option>:null}<option value="video">Uploaded video</option><option value="youtube">YouTube video</option></select></label>
        <label><span className="form-label">Photo / Video file</span><span className="upload-control"><Upload size={18}/>{busy?'Upload होत आहे…':'File निवडा'}<input type="file" accept={isDemoPlacement?'video/*':'image/*,video/*'} onChange={e=>e.target.files?.[0]&&upload(e.target.files[0])}/></span></label>
        <label className="wide-field"><span className="form-label">किंवा YouTube / URL</span><input className="form-input" value={form.url} onChange={e=>{const url=e.target.value;setForm({...form,url,media_type:/youtu(?:\.be|be\.com)/i.test(url)?'youtube':form.media_type})}} placeholder="https://youtube.com/shorts/..."/></label>
        <label className="wide-field"><span className="form-label">Video poster photo {isDemoPlacement?'(आवश्यक)':'(ऐच्छिक)'}</span><span className="upload-control"><Upload size={18}/>{form.thumbnail_url?'Poster तयार आहे':'Poster photo निवडा'}<input type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&uploadPoster(e.target.files[0])}/></span></label>
      </div>
      <button className="btn btn-primary" disabled={busy||!form.title||!form.url||(isDemoPlacement&&!form.thumbnail_url)} onClick={save}>Websiteवर प्रकाशित करा</button>
    </section>
    {items.length===0
      ? <div className="adm-panel" style={{marginTop:18}}><div className="adm-empty"><ImageIcon size={32}/><b>अजून कोणताही media नाही</b><span>वरील form मधून पहिला फोटो किंवा व्हिडिओ प्रकाशित करा.</span></div></div>
      : <div className="media-admin-grid">{items.map(item=><article key={item.id} className="admin-card media-admin-item">
          {/* Preview so a placement can be recognised without opening the URL. */}
          <div className="adm-media__thumb" style={{padding:0,display:'grid'}}>
            {item.media_type==='image' && item.url
              ? <img src={item.url} alt={item.alt_text||item.title} loading="lazy"/>
              : item.thumbnail_url
                ? <img src={item.thumbnail_url} alt={item.title} loading="lazy"/>
                : <Video size={26}/>}
          </div>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              {item.media_type==='image'?<ImageIcon size={15}/>:<Video size={15}/>}
              <strong>{item.title}</strong>
            </div>
            <span>{item.placement}</span>
            <span className={`adm-badge ${item.is_published?'adm-badge--ok':'adm-badge--muted'}`} style={{alignSelf:'flex-start',fontFamily:'inherit',marginTop:4}}>
              {item.is_published?'प्रकाशित':'लपवलेले'}
            </span>
          </div>
          <button className="icon-danger" onClick={()=>remove(item.id)} aria-label={`${item.title} काढून टाका`}><Trash2 size={15}/></button>
        </article>)}</div>}
  </div>
}
