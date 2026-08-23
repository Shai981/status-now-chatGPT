'use client'

import { Navigation, MapPin } from 'lucide-react'
import type { Post } from './Feed'

function km(aLat:number,aLon:number,bLat:number,bLon:number){
  const R=6371, dLat=(bLat-aLat)*Math.PI/180, dLon=(bLon-aLon)*Math.PI/180
  const x=Math.sin(dLat/2)**2+Math.cos(aLat*Math.PI/180)*Math.cos(bLat*Math.PI/180)*Math.sin(dLon/2)**2
  return 2*R*Math.asin(Math.sqrt(x))
}

export default function NearbyMap({ posts, userLocation }: { posts: Post[]; userLocation: { latitude:number; longitude:number } | null }) {
  if (!userLocation) return <div className="empty">אשר גישה למיקום כדי לראות מה קורה סביבך.</div>
  const withDistance = posts.filter(p=>p.latitude!=null&&p.longitude!=null).map(p=>({...p,distance:km(userLocation.latitude,userLocation.longitude,p.latitude!,p.longitude!)})).sort((a,b)=>a.distance-b.distance).slice(0,12)
  return <div className="nearby-wrap">
    <div className="radar-map">
      <div className="radar-ring ring-1"/><div className="radar-ring ring-2"/><div className="radar-ring ring-3"/><div className="me-dot">אני</div>
      {withDistance.slice(0,8).map((p,i)=>{ const angle=(i*47)%360, radius=Math.min(42,12+p.distance*5); const x=50+radius*Math.cos(angle*Math.PI/180), y=50+radius*Math.sin(angle*Math.PI/180); return <div key={p.id} className={`map-marker ${p.kind==='request'?'request-marker':''}`} style={{left:`${x}%`,top:`${y}%`}} title={p.location_name}><MapPin size={16}/></div> })}
    </div>
    <p className="helper map-note">המפה מציגה מיקום יחסי של עדכונים סביבך; המיקום המדויק של המשתמשים אינו מוצג.</p>
    <div className="nearby-list">{withDistance.length ? withDistance.map(p=><div className="nearby-item" key={p.id}><div><strong>{p.location_name}</strong><p>{p.text}</p><span>{p.distance<1?`${Math.round(p.distance*1000)} מטר`:`${p.distance.toFixed(1)} ק״מ`} ממך</span></div><a className="navigate-btn" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`}><Navigation size={16}/></a></div>) : <div className="empty">אין עדיין עדכונים עם מיקום GPS בסביבה.</div>}</div>
  </div>
}
