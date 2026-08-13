'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell, CalendarDays, ChevronDown, ClipboardList, Globe, Images,
  LayoutDashboard, LogOut, Megaphone, Menu, MessageCircle, PanelLeftClose,
  ScanFace, Search, Settings, ShieldHalf, UserCheck, UserRound, Users, Utensils,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/Logo'

type Item = { href: string; label: string; icon: typeof Users; exact?: boolean }

/** Grouped so a new staff member can find a screen by what they are trying to do. */
const GROUPS: { id: string; label: string; items: Item[] }[] = [
  {
    id: 'main', label: 'मुख्य', items: [
      { href: '/admin', label: 'डॅशबोर्ड', icon: LayoutDashboard, exact: true },
      { href: '/admin/students', label: 'विद्यार्थी', icon: Users },
      { href: '/admin/fees', label: 'प्रवेश मंजुरी व फी', icon: UserCheck },
    ],
  },
  {
    id: 'academy', label: 'अकॅडमी', items: [
      { href: '/admin/leaves', label: 'विद्यार्थी सुट्टी', icon: CalendarDays },
      { href: '/admin/attendance', label: 'Live Attendance', icon: ScanFace },
      { href: '/admin/mess', label: 'मेस व्यवस्थापन', icon: Utensils },
    ],
  },
  {
    id: 'comm', label: 'संपर्क', items: [
      { href: '/admin/whatsapp', label: 'WhatsApp संदेश', icon: MessageCircle },
      { href: '/admin/notices', label: 'नोटीस', icon: Megaphone },
    ],
  },
  {
    id: 'academic', label: 'शैक्षणिक', items: [
      { href: '/admin/exams', label: 'Online परीक्षा', icon: ClipboardList },
    ],
  },
  {
    id: 'website', label: 'वेबसाइट', items: [
      { href: '/admin/media', label: 'फोटो व व्हिडिओ', icon: Images },
      { href: '/admin/settings', label: 'वेबसाइट सेटिंग्ज', icon: Settings },
    ],
  },
]

/** Page titles for the header, longest path first so nested routes win. */
const TITLES: [string, string, string][] = [
  ['/admin/students/new', 'नवीन विद्यार्थी', 'नवीन विद्यार्थ्याची नोंदणी करा.'],
  ['/admin/students', 'विद्यार्थी', 'सर्व विद्यार्थ्यांची यादी व माहिती.'],
  ['/admin/fees', 'प्रवेश मंजुरी व फी', 'अर्ज मंजूर करा, फी नोंदवा आणि Student Code तयार करा.'],
  ['/admin/leaves', 'विद्यार्थी सुट्टी', 'सुट्टीच्या नोंदी व परतीचे reminder.'],
  ['/admin/attendance', 'Live Attendance', 'आजची उपस्थिती नोंदवा.'],
  ['/admin/mess', 'मेस व्यवस्थापन', 'मेस नोंदी आणि संपणाऱ्या सदस्यत्वांचा आढावा.'],
  ['/admin/whatsapp', 'WhatsApp संदेश केंद्र', 'विद्यार्थी व पालकांना थेट संदेश पाठवा.'],
  ['/admin/notices', 'नोटीस', 'सूचना तयार करा आणि प्रकाशित करा.'],
  ['/admin/exams', 'Online परीक्षा', 'परीक्षा, प्रश्नपत्रिका आणि निकाल.'],
  ['/admin/media', 'फोटो व व्हिडिओ', 'वेबसाइटवरील फोटो आणि व्हिडिओ बदला.'],
  ['/admin/settings', 'वेबसाइट सेटिंग्ज', 'वेबसाइटवरील मजकूर व संपर्क माहिती.'],
  ['/admin', 'डॅशबोर्ड', 'अकॅडमीचा आजचा आढावा.'],
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'सुप्रभात'
  if (h < 17) return 'नमस्कार'
  return 'शुभ संध्याकाळ'
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname() || '/admin'
  const [collapsed, setCollapsed] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [menu, setMenu] = useState(false)
  const [closedGroups, setClosedGroups] = useState<string[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

  const [, title, subtitle] = TITLES.find(([prefix]) =>
    prefix === '/admin' ? pathname === '/admin' : pathname.startsWith(prefix)) || ['', 'Admin', '']

  // Closed explicitly on navigation (see closeOverlays) rather than in an effect,
  // so no state update cascades off a route change.
  const closeOverlays = () => { setDrawer(false); setMenu(false) }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); searchRef.current?.focus() }
      if (e.key === 'Escape') { setMenu(false); setDrawer(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/admin/login')
    router.refresh()
  }

  const isActive = (item: Item) => item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <div className="adm" data-collapsed={collapsed} data-drawer={drawer}>
      <div className="adm-shell">
        <button type="button" className="adm-scrim" aria-label="मेनू बंद करा" onClick={() => setDrawer(false)} />

        <aside className="adm-side">
          <Link href="/admin" className="adm-side__brand">
            <span className="adm-side__mark"><Logo size={26} /></span>
            <span>
              <span className="adm-side__name">शिवरक्षक करिअर अकॅडमी</span>
              <span className="adm-side__sub">Army • Police • SRPF • Written Exam</span>
            </span>
          </Link>

          <div className="adm-side__scroll">
            {GROUPS.map(group => {
              const open = !closedGroups.includes(group.id)
              return (
                <div className="adm-group" key={group.id}>
                  <button
                    type="button"
                    className="adm-group__label"
                    aria-expanded={open}
                    onClick={() => setClosedGroups(prev => open ? [...prev, group.id] : prev.filter(id => id !== group.id))}
                  >
                    <span>{group.label}</span>
                    <ChevronDown size={13} style={{ transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform .2s' }} />
                  </button>
                  {open && group.items.map(item => {
                    const Icon = item.icon
                    return (
                      <Link key={item.href} href={item.href} className="adm-link" data-active={isActive(item)} onClick={closeOverlays}>
                        <Icon aria-hidden="true" /><span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )
            })}

            <div className="adm-group">
              <div className="adm-group__label"><span>सिस्टम</span></div>
              <Link href="/" target="_blank" className="adm-link" onClick={closeOverlays}><Globe aria-hidden="true" /><span>Website पहा</span></Link>
              <button type="button" className="adm-link" style={{ width: '100%', background: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }} onClick={handleLogout}>
                <LogOut aria-hidden="true" /><span>Logout</span>
              </button>
            </div>
          </div>

          <div className="adm-side__foot">
            <div className="adm-profile">
              <span className="adm-profile__pic"><UserRound size={19} /></span>
              <div>
                <b>Ex-Army Director</b>
                <small>Retd. Indian Army</small>
              </div>
            </div>
            <Link href="/admin/settings" className="adm-profile__btn">प्रोफाइल पहा</Link>
          </div>
        </aside>

        <div className="adm-main">
          <header className="adm-top">
            <button
              type="button"
              className="adm-top__burger"
              aria-label="मेनू उघडा किंवा बंद करा"
              onClick={() => {
                if (window.matchMedia('(max-width: 1024px)').matches) setDrawer(v => !v)
                else setCollapsed(v => !v)
              }}
            >
              {collapsed ? <Menu size={19} /> : <PanelLeftClose size={19} />}
            </button>

            <div className="adm-top__title">
              <b>{title}</b>
              <span>{pathname === '/admin' ? `${greeting()}, Admin! आजचा दिवस शानदार जावो.` : subtitle}</span>
            </div>

            <div className="adm-top__spacer" />

            <div className="adm-search">
              <Search size={16} aria-hidden="true" />
              <input ref={searchRef} type="search" placeholder="शोधा..." aria-label="शोधा"
                onKeyDown={e => { if (e.key === 'Enter') { const q = (e.target as HTMLInputElement).value.trim(); if (q) router.push(`/admin/students?q=${encodeURIComponent(q)}`) } }} />
              <kbd>Ctrl + K</kbd>
            </div>

            <Link href="/admin/notices" className="adm-iconbtn" aria-label="नोटीस"><Bell size={18} /></Link>
            <Link href="/admin/whatsapp" className="adm-iconbtn" aria-label="WhatsApp संदेश"><MessageCircle size={18} /></Link>

            <div style={{ position: 'relative' }}>
              <button type="button" className="adm-user" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(v => !v)}>
                <span className="adm-user__pic"><ShieldHalf size={16} /></span>
                <span><b>Admin</b><small>Super Admin</small></span>
                <ChevronDown size={14} />
              </button>
              {menu && (
                <div className="adm-menu" role="menu">
                  <Link href="/admin/settings" role="menuitem" onClick={closeOverlays}><Settings size={15} /> सेटिंग्ज</Link>
                  <Link href="/" target="_blank" role="menuitem"><Globe size={15} /> Website पहा</Link>
                  <button type="button" role="menuitem" className="danger" onClick={handleLogout}><LogOut size={15} /> Logout</button>
                </div>
              )}
            </div>
          </header>

          <main className="adm-body">{children}</main>
        </div>
      </div>
    </div>
  )
}
