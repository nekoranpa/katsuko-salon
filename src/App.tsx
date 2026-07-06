import { Package, Phone, Sparkles } from 'lucide-react'
import { products as demoProducts, serviceMenus as demoMenus } from './mockData'
import type { Product, ServiceMenu } from './types'
import './styles.css'

const yen = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' })
const salonPhone = import.meta.env.VITE_SALON_PHONE || '090-0000-0000'

function PublicSite({ menus, products }: { menus: ServiceMenu[]; products: Product[] }) {
  const visibleMenus = menus.filter((menu) => menu.is_active)
  const publicProducts = products.filter((product) => product.is_public)
  const phoneLabel = salonPhone === '090-0000-0000' ? '電話番号準備中' : salonPhone

  return (
    <main className="site">
      <header className="hero" id="top">
        <nav className="nav">
          <a className="nav-brand" href="#top" aria-label="KATSUKO 温美華 トップへ">
            <span>KATSUKO 温美華</span>
            <small>温熱ビューティーサロン</small>
          </a>
          <div className="nav-links">
            <a href="#concept">コンセプト</a>
            <a href="#menu">施術内容</a>
            <a href="#shop">ショップ</a>
            <a className="nav-button" href={`tel:${salonPhone}`}>電話予約</a>
          </div>
        </nav>

        <div className="hero-grid">
          <section className="hero-copy">
            <div className="brand-banner" aria-label="KATSUKO 温美華 ロゴ">
              <img src="/katsuko-onbika-logo-transparent.png" alt="KATSUKO 温美華" />
            </div>
            <p className="eyebrow">PRIVATE WARM BEAUTY SALON</p>
            <h1>温める、整える。<br />静かに華やぐ美しさへ。</h1>
            <p className="lead">
              KATSUKO 温美華は、温熱ケアを中心に、心身をゆるめながら美容と健康維持をサポートするプライベートサロンです。
            </p>
            <div className="actions">
              <a className="primary" href={`tel:${salonPhone}`}>電話で予約する</a>
              <a className="secondary" href="#menu">施術内容を見る</a>
            </div>
            <p className="note">施術予約はお電話で承ります。Web予約フォームは現在公開していません。</p>
          </section>

          <aside className="hero-side" aria-label="KATSUKO 温美華 コンセプト">
            <p className="side-label">Concept</p>
            <h2>温・美・華</h2>
            <p className="side-text">
              強く飾るのではなく、やさしく温め、静かに整え、自然な華やぎへ導く時間を大切にします。
            </p>
            <div className="word-list">
              <div><b>温</b><span>やさしく温める</span></div>
              <div><b>美</b><span>自然な美しさを支える</span></div>
              <div><b>華</b><span>日々に静かな華やぎを</span></div>
            </div>
          </aside>
        </div>
      </header>

      <section className="concept" id="concept">
        <div className="section-title center">
          <p>Concept</p>
          <h2>温もりでゆるみ、美しさが自然に華ひらく。</h2>
          <span>急がせるのではなく、やさしく温め、整え、年齢に応じた自然な美しさを支える時間を大切にします。</span>
        </div>
        <div className="concept-grid">
          <article><b>温</b><h3>温熱ケア</h3><p>体をやさしく温め、リラックスしやすい時間をつくります。</p></article>
          <article><b>美</b><h3>美容と健康維持</h3><p>美容・健康維持を目的に、落ち着いたケアを行います。</p></article>
          <article><b>華</b><h3>自分らしい華やぎ</h3><p>無理に飾るのではなく、自然な印象の美しさを大切にします。</p></article>
        </div>
      </section>

      <section className="menu-section" id="menu">
        <div className="section-title">
          <p>Treatment</p>
          <h2>施術内容</h2>
          <span>現在公開している主な施術内容です。詳細はお電話でご確認ください。</span>
        </div>
        <div className="menu-grid">
          {visibleMenus.map((menu) => (
            <article className="menu-card" key={menu.id}>
              <span>{menu.duration_minutes}分</span>
              <h3>{menu.name}</h3>
              <p>{menu.description}</p>
              <strong>{menu.price > 0 ? yen.format(menu.price) : '料金準備中'}</strong>
            </article>
          ))}
          <article className="menu-card muted">
            <span>option</span>
            <h3>カウンセリング</h3>
            <p>体調やご希望を伺い、その日の状態に合わせてご案内します。</p>
            <strong>お問い合わせ</strong>
          </article>
        </div>
      </section>

      <section className="shop-section" id="shop">
        <div className="section-title">
          <p>Online shop</p>
          <h2>オンラインショップ</h2>
          <span>カツコオリジナル商品の販売準備中です。公開後、Stripe決済リンクで購入できるようにします。</span>
        </div>
        {publicProducts.length === 0 ? (
          <div className="shop-empty">
            <Package />
            <h3>商品準備中</h3>
            <p>サプリメントなどの商品が決まり次第、こちらに掲載します。</p>
          </div>
        ) : (
          <div className="product-grid">
            {publicProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">温</div>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="product-footer">
                  <strong>{yen.format(product.price)}</strong>
                  {product.stripe_payment_link ? <a className="mini" href={product.stripe_payment_link}>購入する</a> : <button className="mini muted" disabled>準備中</button>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="phone-box">
        <div>
          <Sparkles size={20} />
          <span>ご予約・お問い合わせ</span>
          <strong>{phoneLabel}</strong>
        </div>
        <a className="primary light" href={`tel:${salonPhone}`}><Phone size={18} /> 電話する</a>
      </section>
    </main>
  )
}

export default function App() {
  return <PublicSite menus={demoMenus} products={demoProducts.filter(() => false)} />
}
