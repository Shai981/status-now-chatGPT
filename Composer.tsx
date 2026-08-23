'use client'

import { useState } from 'react'
import { LocateFixed, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Props = { mode:'status'|'request'; onClose:()=>void; onCreated:()=>void; userLocation?:{latitude:number;longitude:number}|null }

export default function Composer({ mode, onClose, onCreated, userLocation }: Props) {
  const [text,setText]=useState(''); const [locationName,setLocationName]=useState(''); const [expiresHours,setExpiresHours]=useState(6); const [media,setMedia]=useState<File|null>(null); const [loading,setLoading]=useState(false)
  const [coords,setCoords]=useState<{latitude:number;longitude:number}|null>(userLocation||null)

  function captureLocation(){ navigator.geolocation?.getCurrentPosition(p=>setCoords({latitude:p.coords.latitude,longitude:p.coords.longitude}),()=>alert('לא הצלחנו לקבל את המיקום. אפשר להמשיך עם שם מקום ידני.'),{enableHighAccuracy:true,timeout:8000}) }

  async function submit(){ if(!text.trim()||!locationName.trim())return; setLoading(true); try {
    if(!supabase){ const local=JSON.parse(localStorage.getItem('status-now-local')||'[]'); let localMediaUrl:null|string=null; if(media)localMediaUrl=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(r.error);r.readAsDataURL(media)}); local.unshift({id:crypto.randomUUID(),kind:mode,text:text.trim(),location_name:locationName.trim(),latitude:coords?.latitude||null,longitude:coords?.longitude||null,media_url:localMediaUrl,media_type:media?(media.type.startsWith('video/')?'video':'image'):null,created_at:new Date().toISOString(),expires_at:new Date(Date.now()+expiresHours*3600000).toISOString(),likes_count:0,comments_count:0}); localStorage.setItem('status-now-local',JSON.stringify(local)); onCreated();onClose();return }
    const {data:auth}=await supabase.auth.getUser(); let mediaUrl:null|string=null, mediaType:null|string=null; if(media){const ext=media.name.split('.').pop();const path=`${auth.user?.id||'anon'}/${crypto.randomUUID()}.${ext}`;const {error:up}=await supabase.storage.from('status-media').upload(path,media);if(up)throw up;mediaUrl=supabase.storage.from('status-media').getPublicUrl(path).data.publicUrl;mediaType=media.type.startsWith('video/')?'video':'image'}
    const {error}=await supabase.from('posts').insert({user_id:auth.user?.id||null,kind:mode,text:text.trim(),location_name:locationName.trim(),latitude:coords?.latitude||null,longitude:coords?.longitude||null,media_url:mediaUrl,media_type:mediaType,expires_at:new Date(Date.now()+expiresHours*3600000).toISOString()}); if(error)throw error;onCreated();onClose()
  } finally{setLoading(false)} }

  return <div className="modal-backdrop" onMouseDown={onClose}><div className="sheet" onMouseDown={e=>e.stopPropagation()}><div className="sheet-header"><h2>{mode==='status'?'פרסם סטטוס':'בקש סטטוס'}</h2><button className="close-btn" onClick={onClose}><X size={18}/></button></div>
  <div className="field"><label>{mode==='status'?'מה קורה עכשיו?':'מה אתה רוצה לדעת?'}</label><textarea value={text} onChange={e=>setText(e.target.value)} placeholder={mode==='status'?'למשל: פקק מטורף עכשיו באיילון דרום...':'למשל: מישהו יודע מה התור כרגע במשרד הרישוי חולון?'}/></div>
  <div className="field"><label>מיקום</label><input value={locationName} onChange={e=>setLocationName(e.target.value)} placeholder="למשל: חוף הילטון, תל אביב"/><button className={`location-btn ${coords?'location-ok':''}`} onClick={captureLocation}><LocateFixed size={17}/>{coords?'מיקום GPS צורף':'צרף את המיקום שלי'}</button></div>
  <div className="field"><label>תמונה או וידאו</label><input type="file" accept="image/*,video/*" onChange={e=>setMedia(e.target.files?.[0]||null)}/>{media&&media.type.startsWith('image/')&&<img className="media-preview" src={URL.createObjectURL(media)} alt="preview"/>}{media&&media.type.startsWith('video/')&&<video className="media-preview" src={URL.createObjectURL(media)} controls/>}</div>
  <div className="field"><label>כמה זמן המידע רלוונטי?</label><select value={expiresHours} onChange={e=>setExpiresHours(Number(e.target.value))}>{[1,3,6,12,24].map(h=><option key={h} value={h}>{h} שעות</option>)}</select></div>
  <p className="helper">המיקום הציבורי יוצג בשם המקום. קואורדינטות משמשות להצגת מרחק והתראות בסביבה.</p><button className="submit" disabled={loading||!text.trim()||!locationName.trim()} onClick={submit}>{loading?'מפרסם...':'פרסם עכשיו'}</button></div></div>
}
