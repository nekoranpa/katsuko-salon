import { CalendarDays, ClipboardList, Home, Package, ScrollText, Users } from 'lucide-react'
import { useState } from 'react'
import AdminStartupPrep from './AdminStartupPrep'

type AdminMenuKey = 'overview' | 'reservations' | 'customers' | 'products' | 'startup'

const adminMenu: Array<{ key: AdminMenuKey; label: string; icon: typeof Home }> = [
  { key: 'overview', label: '管理トップ', icon: Home },
  { key: 'reservations', label: '予約管理', icon: CalendarDays },
  { key: 'customers', label: '顧客メモ', icon: Users },
  { key: 'products', label: '商品管理', icon: Package },
  { key: 'startup', label: '会社設立準備', icon: ScrollText },
]

function AdminPlaceholder({ title, body }: { title: string; body: string }) {
  return (
    <section className="admin-card admin-placeholder">
      <ClipboardList size={24} />
      <h1>{title}</h1>
      <p>{body}</p>
    </section>
  )
}

export default function AdminApp() {
  const [activeMenu, setActiveMenu] = useState<AdminMenuKey>('startup')

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar" aria-label="管理メニュー">
        <a className="admin-logo" href="/">
          <span>勝子 美和温サロン</span>
          <small>管理アプリ</small>
        </a>
        <nav className="admin-menu">
          {adminMenu.map((item) => {
            const Icon = item.icon
            return (
              <button
                className={activeMenu === item.key ? 'active' : ''}
                type="button"
                key={item.key}
                onClick={() => setActiveMenu(item.key)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      <section className="admin-content">
        {activeMenu === 'overview' && (
          <AdminPlaceholder title="管理トップ" body="予約・顧客・商品・会社設立準備のメニューを左から選択します。" />
        )}
        {activeMenu === 'reservations' && (
          <AdminPlaceholder title="予約管理" body="予約登録や来店状況の管理をここに集約します。" />
        )}
        {activeMenu === 'customers' && (
          <AdminPlaceholder title="顧客メモ" body="顧客カルテやメモ機能を追加する場所です。" />
        )}
        {activeMenu === 'products' && (
          <AdminPlaceholder title="商品管理" body="サプリなどの商品・在庫・決済リンクを管理する場所です。" />
        )}
        {activeMenu === 'startup' && <AdminStartupPrep />}
      </section>
    </main>
  )
}
