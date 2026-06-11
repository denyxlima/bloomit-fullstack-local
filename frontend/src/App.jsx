import { useEffect, useMemo, useState } from 'react';
import { api, clearSession, getToken, setSession } from './api.js';

const emptyCompany = {
  legalName: '', tradeName: '', cnpj: '', cnae: '', riskLevel: '', address: '', city: '', state: '', phone: '', corporateEmail: '', legalResponsible: '', legalResponsibleCpf: '', sstResponsible: '', sstResponsibleRole: '', signatureMethod: 'Aceite eletrônico com identificação do colaborador', epiPolicy: 'Entrega mediante registro eletrônico, controle de CA, validade e aceite do colaborador.', controlsCaValidity: true, storesEvidence: true
};

const landingDeliveries = [
  { name: 'Lucas Santos', role: 'Técnico', epi: 'Bota de Segurança', ca: 'CA 12345', status: 'Assinado', type: 'success' },
  { name: 'Marcos Silva', role: 'Mecânico', epi: 'Luva de Vaqueta', ca: 'CA 9876', status: 'Assinado', type: 'success' },
  { name: 'Ana Júlia', role: 'Eletricista', epi: 'Capacete com Jugular', ca: 'CA 4567', status: 'Pendente', type: 'warning' },
];

const landingFeatures = [
  { icon: '📋', title: 'Ficha Digital NR-06', text: 'Registre entregas de EPIs com histórico completo por colaborador, função, setor, CA, data e assinatura eletrônica.' },
  { icon: '🔔', title: 'Alertas de Validade', text: 'Receba avisos quando CAs estiverem próximos do vencimento e evite equipamentos irregulares no estoque.' },
  { icon: '📦', title: 'Controle de Estoque', text: 'Monitore entradas, saídas, saldo mínimo e consumo por EPI para comprar no momento certo.' },
  { icon: '📊', title: 'Relatórios Rápidos', text: 'Gere relatórios para auditorias, fiscalizações e acompanhamento interno em poucos cliques.' },
  { icon: '🔐', title: 'Segurança dos Dados', text: 'Centralize informações de funcionários, EPIs e entregas em um ambiente organizado e seguro.' },
  { icon: '⚡', title: 'Operação Mais Ágil', text: 'Reduza papel, planilhas soltas e retrabalho no almoxarifado e no setor de segurança do trabalho.' },
];

const landingStockItems = [
  { name: 'Luva de Vaqueta', ca: 'CA 9876', current: 8, min: 20, label: 'Comprar agora', type: 'danger' },
  { name: 'Capacete com Jugular', ca: 'CA 4567', current: 12, min: 15, label: 'Atenção', type: 'warning' },
  { name: 'Bota de Segurança', ca: 'CA 12345', current: 47, min: 10, label: 'Normal', type: 'success' },
  { name: 'Óculos de Proteção', ca: 'CA 11280', current: 63, min: 25, label: 'Normal', type: 'success' },
];

const landingFaqItems = [
  { question: 'A ficha digital de EPI pode substituir a ficha em papel?', answer: 'A Bloomit centraliza registros digitais de entrega, assinatura, data, colaborador e CA, deixando a empresa mais preparada para auditorias e fiscalizações.' },
  { question: 'O funcionário consegue solicitar EPI pelo celular?', answer: 'Sim. O colaborador pode solicitar o EPI pelo navegador, informar o motivo e acompanhar o status até a retirada.' },
  { question: 'Consigo controlar estoque mínimo?', answer: 'Sim. Cada item pode ter estoque mínimo configurado para gerar alerta de compra quando o saldo estiver baixo.' },
  { question: 'Preciso instalar algum programa?', answer: 'Não. O modelo é web, acessado pelo navegador em computador, tablet ou celular.' },
];


function Logo() {
  return <div className="logo-mark"><img src="/logo.png" alt="Bloomit Systems" /><span>Bloomit<strong>Systems</strong></span></div>;
}

function Field({ label, value, onChange, placeholder, type = 'text', required, name }) {
  return <label className="field"><span>{label}{required && ' *'}</span><input name={name} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || label} /></label>;
}

function SelectField({ label, value, onChange, children }) {
  return <label className="field"><span>{label}</span><select value={value} onChange={e => onChange(e.target.value)}>{children}</select></label>;
}

function Landing({ onLogin, onRegister }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app-container marketing-page">
      <nav className="navbar">
        <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Voltar ao topo">
          <img src="/bloomit-logo.png" alt="Bloomit" className="brand-logo" />
          <span className="brand-product">Systems</span>
        </button>

        <div className="nav-links">
          <button onClick={() => scrollToSection('recursos')}>Recursos</button>
          <button onClick={() => scrollToSection('estoque')}>Estoque</button>
          <button onClick={() => scrollToSection('conformidade')}>NR-06</button>
          <button onClick={() => scrollToSection('planos')}>Planos</button>
        </div>

        <div className="nav-buttons">
          <button className="btn btn-login" onClick={onLogin}>Entrar</button>
          <button className="btn btn-primary" onClick={onRegister}>Criar Conta</button>
          <button className="menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Abrir menu">
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <button onClick={() => scrollToSection('recursos')}>Recursos</button>
          <button onClick={() => scrollToSection('estoque')}>Estoque</button>
          <button onClick={() => scrollToSection('conformidade')}>NR-06</button>
          <button onClick={() => scrollToSection('planos')}>Planos</button>
          <button onClick={() => { setMobileMenuOpen(false); onLogin(); }}>Entrar</button>
          <button className="btn btn-primary" onClick={() => { setMobileMenuOpen(false); onRegister(); }}>Criar Conta</button>
        </div>
      )}

      <main className="hero-section">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <section className="hero-grid section-shell">
          <div className="hero-content reveal">
            <div className="eyebrow"><span /> Plataforma para SST e almoxarifado</div>
            <h1>Gestão de EPIs moderna, digital e pronta para auditorias.</h1>
            <p>
              Troque fichas em papel e planilhas soltas por uma operação digital com entrega de EPIs,
              assinatura eletrônica, controle de CA, estoque mínimo e relatórios em poucos cliques.
            </p>

            <div className="hero-actions">
              <button className="btn btn-primary btn-large" onClick={onRegister}>Começar Agora Grátis</button>
              <button className="btn btn-secondary btn-large" onClick={() => scrollToSection('recursos')}>Conhecer Recursos</button>
            </div>

            <div className="trust-row">
              <span>✓ Ficha digital</span>
              <span>✓ Controle por CA</span>
              <span>✓ Menos papelada</span>
            </div>
          </div>

          <div className="dashboard-card reveal delay-1">
            <div className="window-header">
              <div className="window-dots"><span /><span /><span /></div>
              <strong>Painel Bloomit</strong>
            </div>

            <div className="dashboard-metrics">
              <div><small>Fichas válidas</small><strong>1.248</strong></div>
              <div><small>CAs vencidos</small><strong>0</strong></div>
              <div><small>Pendências</small><strong>3</strong></div>
            </div>

            <div className="visual-title">Últimas entregas ativas</div>
            <div className="delivery-list">
              {landingDeliveries.map((item) => (
                <div className="delivery-item" key={item.name}>
                  <div className="avatar">{item.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
                  <div className="delivery-info">
                    <strong>{item.name}</strong>
                    <span>{item.role} • {item.epi} ({item.ca})</span>
                  </div>
                  <span className={`status-badge ${item.type}`}>{item.status}</span>
                </div>
              ))}
            </div>

            <div className="alert-card">
              <span>⚠️</span>
              <div>
                <strong>Alerta de vencimento</strong>
                <p>O CA 12345 vencerá em 15 dias. Existem 45 unidades em estoque.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <section className="stats-section section-shell">
        <div className="stat-card"><strong>100%</strong><span>foco em conformidade NR-06</span></div>
        <div className="stat-card"><strong>24h</strong><span>acesso web ao histórico de entregas</span></div>
        <div className="stat-card"><strong>0</strong><span>papel obrigatório na rotina operacional</span></div>
        <div className="stat-card"><strong>CA</strong><span>rastreio por validade e estoque</span></div>
      </section>

      <section id="recursos" className="features-section section-shell">
        <div className="section-header">
          <span className="section-kicker">Recursos essenciais</span>
          <h2>Organize tudo que envolve EPI em um só lugar.</h2>
          <p>Uma página clara precisa mostrar rápido o problema, a solução e o ganho real para SST, almoxarifado e auditoria.</p>
        </div>

        <div className="features-grid">
          {landingFeatures.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="split-section section-shell">
        <div className="phone-mockup reveal">
          <div className="phone-shell">
            <div className="phone-top">Bloomit Mobile</div>
            <div className="phone-card">
              <small>Equipamento</small>
              <strong>Capacete com Jugular</strong>
              <span>CA 4567 • Classe B</span>
            </div>
            <div className="phone-card">
              <small>Motivo</small>
              <strong>Desgaste natural</strong>
            </div>
            <button>Enviar Solicitação</button>
            <div className="timeline">
              <p><span>✓</span> Solicitação recebida</p>
              <p><span>⏳</span> Em separação</p>
              <p><span>○</span> Pronto para retirada</p>
            </div>
          </div>
        </div>

        <div className="split-content reveal delay-1">
          <span className="section-kicker">Solicitação pelo celular</span>
          <h2>O colaborador solicita o EPI sem depender de papel ou mensagem perdida.</h2>
          <p>
            A solicitação nasce digital, chega para o responsável e segue um fluxo simples:
            recebido, em separação, pronto para retirada e entregue com assinatura registrada.
          </p>
          <div className="check-list">
            <div><strong>Pedido rápido</strong><span>O colaborador informa o EPI e o motivo da troca.</span></div>
            <div><strong>Status em tempo real</strong><span>Menos ligação, menos WhatsApp e menos ruído operacional.</span></div>
            <div><strong>Entrega documentada</strong><span>Ao retirar, o registro fica vinculado ao colaborador e ao CA.</span></div>
          </div>
        </div>
      </section>

      <section id="estoque" className="split-section reverse section-shell">
        <div className="split-content reveal">
          <span className="section-kicker">Gestão de estoque</span>
          <h2>Controle mínimo, consumo e validade de CA sem virar refém de planilha.</h2>
          <p>
            O estoque passa a ser acompanhado por item, CA, quantidade mínima e status.
            Assim fica mais fácil comprar antes de faltar e bloquear equipamentos vencidos.
          </p>
          <div className="check-list">
            <div><strong>Estoque mínimo</strong><span>Defina o ponto de reposição de cada EPI.</span></div>
            <div><strong>Alerta de compra</strong><span>Identifique o que precisa ser reposto com prioridade.</span></div>
            <div><strong>Histórico de consumo</strong><span>Planeje compras com base no uso real da operação.</span></div>
          </div>
        </div>

        <div className="stock-panel reveal delay-1">
          <div className="window-header">
            <div className="window-dots"><span /><span /><span /></div>
            <strong>Estoque de EPIs</strong>
          </div>
          <div className="stock-alert">⚠️ 2 itens abaixo do estoque mínimo</div>
          {landingStockItems.map((item) => (
            <div className={`stock-item ${item.type}`} key={item.name}>
              <div>
                <strong>{item.name}</strong>
                <span>{item.ca} • mínimo: {item.min} un.</span>
              </div>
              <div className="stock-right">
                <strong>{item.current} un.</strong>
                <small>{item.label}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="conformidade" className="compliance-section">
        <div className="section-shell compliance-grid">
          <div>
            <span className="section-kicker light">Segurança jurídica</span>
            <h2>Construa uma rotina preparada para fiscalização.</h2>
            <p>
              A Bloomit ajuda sua empresa a manter rastreabilidade das entregas, histórico por funcionário,
              controle de validade e relatórios claros para tomada de decisão.
            </p>
          </div>
          <div className="compliance-card">
            <h3>Relatório de Conformidade</h3>
            <div><span>Status NR-06</span><strong>Em organização</strong></div>
            <div><span>Fichas válidas</span><strong>1.248</strong></div>
            <div><span>Assinaturas pendentes</span><strong>3</strong></div>
            <div><span>CAs vencidos no estoque</span><strong>0</strong></div>
          </div>
        </div>
      </section>

      <section id="planos" className="pricing-section section-shell">
        <div className="section-header">
          <span className="section-kicker">Planos</span>
          <h2>Comece simples e evolua conforme a operação cresce.</h2>
          <p>Use os valores abaixo como placeholders e ajuste quando definir sua precificação final.</p>
        </div>

        <div className="pricing-grid">
          <article className="pricing-card">
            <span>Mensal</span>
            <h3>R$ 99<span>/mês</span></h3>
            <p>Para empresas que querem começar com controle digital.</p>
            <ul>
              <li>Funcionários e fichas digitais</li>
              <li>Controle de estoque por CA</li>
              <li>Relatórios essenciais</li>
              <li>Suporte por e-mail</li>
            </ul>
            <button className="btn btn-secondary" onClick={onRegister}>Testar grátis</button>
          </article>

          <article className="pricing-card highlighted">
            <div className="best-tag">Melhor custo-benefício</div>
            <span>Anual</span>
            <h3>R$ 999<span>/ano</span></h3>
            <p>Para quem quer previsibilidade, suporte e evolução contínua.</p>
            <ul>
              <li>Tudo do plano mensal</li>
              <li>2 meses grátis incluídos</li>
              <li>Onboarding personalizado</li>
              <li>Prioridade no suporte</li>
            </ul>
            <button className="btn btn-primary" onClick={onRegister}>Começar agora</button>
          </article>
        </div>
      </section>

      <section className="faq-section section-shell">
        <div className="section-header">
          <span className="section-kicker">Dúvidas frequentes</span>
          <h2>Respostas rápidas para quem está avaliando a plataforma.</h2>
        </div>

        <div className="faq-list">
          {landingFaqItems.map((item, index) => (
            <div className={`faq-item ${openFaq === index ? 'open' : ''}`} key={item.question}>
              <button onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                {item.question}
                <span>{openFaq === index ? '−' : '+'}</span>
              </button>
              {openFaq === index && <p>{item.answer}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="final-cta section-shell">
        <div className="cta-card">
          <span>🚀</span>
          <h2>Pronto para tirar a gestão de EPIs do papel?</h2>
          <p>Comece localmente agora e evolua para produção em nuvem quando chegar a hora.</p>
          <div>
            <button className="btn btn-primary btn-large" onClick={onRegister}>Criar Conta</button>
            <button className="btn btn-secondary btn-large" onClick={onLogin}>Entrar no Sistema</button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="brand footer-brand">
          <img src="/bloomit-logo.png" alt="Bloomit" className="footer-logo" />
          <span className="brand-product">Systems</span>
        </div>
        <p>Solução digital para gestão de EPIs, estoque e conformidade operacional.</p>
        <small>© 2026 Bloomit Systems. Desenvolvido para profissionais de SST no Brasil.</small>
      </footer>
    </div>
  );
}

function Feature({ title, text }) { return <article className="feature-card"><h3>{title}</h3><p>{text}</p></article>; }

function LoginPage({ onBack, onSuccess, onRegister }) {
  const [email, setEmail] = useState('teste@empresa.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try { const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); setSession(data); onSuccess(data); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  return <AuthShell title="Acesse o painel" subtitle="Entre com seu usuário corporativo" onBack={onBack}><form onSubmit={submit} className="form-stack"><Field label="E-mail" value={email} onChange={setEmail}/><Field label="Senha" type="password" value={password} onChange={setPassword}/>{error && <p className="form-error">{error}</p>}<button className="btn primary full" disabled={loading}>{loading ? 'Entrando...' : 'Entrar no sistema'}</button><button type="button" className="link-button" onClick={onRegister}>Não tem conta? Cadastre sua empresa</button></form></AuthShell>;
}

function RegisterPage({ onBack, onSuccess }) {
  const [company, setCompany] = useState(emptyCompany);
  const [user, setUser] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setC = (key, value) => setCompany(prev => ({ ...prev, [key]: value }));
  const setU = (key, value) => setUser(prev => ({ ...prev, [key]: value }));
  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try { const data = await api('/auth/register', { method: 'POST', body: JSON.stringify({ company, user }) }); setSession(data); onSuccess(data); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  return <AuthShell title="Cadastro empresarial" subtitle="Base para gestão de EPIs com rastreabilidade" onBack={onBack} wide><form onSubmit={submit} className="register-form"><div className="form-section"><h3>Dados da empresa</h3><div className="form-grid"><Field required label="Razão social" value={company.legalName} onChange={v => setC('legalName', v)}/><Field label="Nome fantasia" value={company.tradeName} onChange={v => setC('tradeName', v)}/><Field required label="CNPJ" value={company.cnpj} onChange={v => setC('cnpj', v)}/><Field label="CNAE" value={company.cnae} onChange={v => setC('cnae', v)}/><Field label="Grau de risco" value={company.riskLevel} onChange={v => setC('riskLevel', v)}/><Field label="E-mail corporativo" value={company.corporateEmail} onChange={v => setC('corporateEmail', v)}/><Field label="Endereço" value={company.address} onChange={v => setC('address', v)}/><Field label="Cidade" value={company.city} onChange={v => setC('city', v)}/><Field label="UF" value={company.state} onChange={v => setC('state', v)}/><Field label="Telefone" value={company.phone} onChange={v => setC('phone', v)}/></div></div><div className="form-section"><h3>Responsáveis e critérios jurídicos</h3><div className="form-grid"><Field label="Responsável legal" value={company.legalResponsible} onChange={v => setC('legalResponsible', v)}/><Field label="CPF responsável legal" value={company.legalResponsibleCpf} onChange={v => setC('legalResponsibleCpf', v)}/><Field label="Responsável SST" value={company.sstResponsible} onChange={v => setC('sstResponsible', v)}/><Field label="Cargo do responsável SST" value={company.sstResponsibleRole} onChange={v => setC('sstResponsibleRole', v)}/></div><label className="field wide-field"><span>Método de assinatura</span><textarea value={company.signatureMethod} onChange={e => setC('signatureMethod', e.target.value)} /></label><label className="field wide-field"><span>Política de entrega de EPI</span><textarea value={company.epiPolicy} onChange={e => setC('epiPolicy', e.target.value)} /></label></div><div className="form-section"><h3>Usuário administrador</h3><div className="form-grid"><Field required label="Nome" value={user.name} onChange={v => setU('name', v)}/><Field required label="E-mail" value={user.email} onChange={v => setU('email', v)}/><Field required type="password" label="Senha" value={user.password} onChange={v => setU('password', v)}/></div></div>{error && <p className="form-error">{error}</p>}<button className="btn primary full" disabled={loading}>{loading ? 'Criando cadastro...' : 'Criar empresa e acessar dashboard'}</button></form></AuthShell>;
}

function AuthShell({ title, subtitle, children, onBack, wide }) { return <main className="auth-page"><button className="back-btn" onClick={onBack}>← Voltar</button><section className={`auth-card ${wide ? 'wide' : ''}`}><Logo/><div className="auth-title"><h1>{title}</h1><p>{subtitle}</p></div>{children}</section></main>; }

function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState({ employees: [], epis: [], deliveries: [], requests: [], movements: [], stats: {}, logs: [] });
  const [message, setMessage] = useState('');
  const company = JSON.parse(localStorage.getItem('bloomit_company') || '{}');

  async function loadAll() {
    const [employees, epis, deliveries, requests, movements, stats, logs] = await Promise.all([
      api('/employees'), api('/epis'), api('/deliveries'), api('/requests'), api('/stock/movements'), api('/dashboard'), api('/audit-logs')
    ]);
    setData({ employees, epis, deliveries, requests, movements, stats, logs });
  }
  useEffect(() => { loadAll().catch(err => setMessage(err.message)); }, []);
  function logout() { clearSession(); onLogout(); }
  async function refreshWith(msg) { await loadAll(); setMessage(msg); setTimeout(() => setMessage(''), 2800); }

  return <div className="dash-layout"><aside className="sidebar"><Logo/><p className="company-name">{company.tradeName || company.legalName || 'Empresa'}</p><nav className="side-nav">{[['overview','Visão geral'],['requests','Solicitações'],['employees','Colaboradores'],['epis','Estoque / EPIs'],['deliveries','Entregas'],['reports','Relatórios']].map(([id,label]) => <button key={id} className={tab===id?'active':''} onClick={() => setTab(id)}>{label}</button>)}</nav><button className="btn outline full" onClick={logout}>Sair</button></aside><main className="dash-main"><header className="dash-header"><div><span>Dashboard local</span><h1>{titleByTab(tab)}</h1></div><button className="btn primary" onClick={loadAll}>Atualizar</button></header>{message && <div className="toast">{message}</div>}{tab==='overview' && <Overview data={data} setTab={setTab}/>} {tab==='requests' && <Requests data={data} refresh={refreshWith}/>} {tab==='employees' && <Employees data={data} refresh={refreshWith}/>} {tab==='epis' && <Epis data={data} refresh={refreshWith}/>} {tab==='deliveries' && <Deliveries data={data} refresh={refreshWith}/>} {tab==='reports' && <Reports data={data}/>}</main></div>;
}
function titleByTab(tab){ return ({overview:'Visão geral',requests:'Acompanhamento de solicitações',employees:'Cadastro de colaboradores',epis:'Cadastro de mercadorias em estoque',deliveries:'Entregas de EPI',reports:'Relatórios e auditoria'})[tab]; }

function Overview({ data, setTab }) { const s = data.stats; return <><section className="kpi-grid"><Kpi label="Colaboradores" value={s.employees || 0}/><Kpi label="EPIs cadastrados" value={s.epis || 0}/><Kpi label="Entregas" value={s.deliveries || 0}/><Kpi label="Estoque baixo" value={s.lowStock || 0} warn/></section><section className="quick-grid"><button onClick={() => setTab('requests')} className="quick-card"><b>Acompanhar solicitações</b><span>Ver pedidos e avançar status</span></button><button onClick={() => setTab('employees')} className="quick-card"><b>Cadastrar colaborador</b><span>Adicionar trabalhadores</span></button><button onClick={() => setTab('epis')} className="quick-card"><b>Cadastrar mercadoria</b><span>Adicionar EPI ao estoque</span></button><button onClick={() => setTab('deliveries')} className="quick-card"><b>Registrar entrega</b><span>Gerar ficha digital</span></button></section><Recent title="Últimas entregas" items={data.deliveries.map(d => `${d.employee.fullName} recebeu ${d.epi.name} — ${d.status === 'SIGNED' ? 'Assinado' : 'Pendente'}`)}/></>; }
function Kpi({label,value,warn}) { return <article className={`kpi ${warn?'warn':''}`}><span>{label}</span><strong>{value}</strong></article>; }
function Recent({title,items}) { return <section className="panel"><h2>{title}</h2>{items.length ? items.slice(0,6).map((i,idx)=><p className="line-item" key={idx}>{i}</p>) : <p className="muted">Nada registrado ainda.</p>}</section>; }

function Employees({ data, refresh }) { const [form,setForm]=useState({fullName:'',cpf:'',registration:'',role:'',department:'',admissionDate:''}); const set=(k,v)=>setForm(p=>({...p,[k]:v})); async function submit(e){e.preventDefault(); await api('/employees',{method:'POST',body:JSON.stringify(form)}); setForm({fullName:'',cpf:'',registration:'',role:'',department:'',admissionDate:''}); await refresh('Colaborador cadastrado com sucesso.');} return <div className="dash-grid"><section className="panel"><h2>Novo colaborador</h2><form onSubmit={submit} className="form-stack"><Field label="Nome completo" value={form.fullName} onChange={v=>set('fullName',v)} required/><Field label="CPF" value={form.cpf} onChange={v=>set('cpf',v)} required/><Field label="Matrícula" value={form.registration} onChange={v=>set('registration',v)}/><Field label="Função" value={form.role} onChange={v=>set('role',v)}/><Field label="Setor" value={form.department} onChange={v=>set('department',v)}/><Field type="date" label="Data de admissão" value={form.admissionDate} onChange={v=>set('admissionDate',v)}/><button className="btn primary full">Cadastrar colaborador</button></form></section><ListPanel title="Colaboradores" rows={data.employees.map(e=>[e.fullName, e.cpf, e.role || '-', e.department || '-'])} headers={['Nome','CPF','Função','Setor']}/></div>; }

function Epis({ data, refresh }) { const [form,setForm]=useState({name:'',category:'',caNumber:'',caValidity:'',manufacturer:'',size:'',currentQuantity:0,minimumQuantity:0}); const [mov,setMov]=useState({epiId:'',type:'ENTRADA',quantity:1,reason:''}); const set=(k,v)=>setForm(p=>({...p,[k]:v})); async function create(e){e.preventDefault(); await api('/epis',{method:'POST',body:JSON.stringify(form)}); setForm({name:'',category:'',caNumber:'',caValidity:'',manufacturer:'',size:'',currentQuantity:0,minimumQuantity:0}); await refresh('EPI cadastrado com sucesso.');} async function move(e){e.preventDefault(); await api('/stock/movements',{method:'POST',body:JSON.stringify(mov)}); setMov({epiId:'',type:'ENTRADA',quantity:1,reason:''}); await refresh('Estoque movimentado com sucesso.');} return <div className="dash-grid"><section className="panel"><h2>Cadastrar mercadoria/EPI</h2><form onSubmit={create} className="form-stack"><Field label="Nome do EPI" value={form.name} onChange={v=>set('name',v)} required/><Field label="Categoria" value={form.category} onChange={v=>set('category',v)}/><Field label="Número do CA" value={form.caNumber} onChange={v=>set('caNumber',v)} required/><Field type="date" label="Validade do CA" value={form.caValidity} onChange={v=>set('caValidity',v)}/><Field label="Fabricante" value={form.manufacturer} onChange={v=>set('manufacturer',v)}/><Field label="Tamanho" value={form.size} onChange={v=>set('size',v)}/><Field type="number" label="Quantidade inicial" value={form.currentQuantity} onChange={v=>set('currentQuantity',v)}/><Field type="number" label="Estoque mínimo" value={form.minimumQuantity} onChange={v=>set('minimumQuantity',v)}/><button className="btn primary full">Cadastrar no estoque</button></form></section><section className="panel"><h2>Movimentar estoque</h2><form onSubmit={move} className="form-stack"><SelectField label="EPI" value={mov.epiId} onChange={v=>setMov(p=>({...p,epiId:v}))}><option value="">Selecione</option>{data.epis.map(e=><option key={e.id} value={e.id}>{e.name} — CA {e.caNumber}</option>)}</SelectField><SelectField label="Tipo" value={mov.type} onChange={v=>setMov(p=>({...p,type:v}))}><option value="ENTRADA">Entrada</option><option value="SAIDA">Saída</option><option value="AJUSTE">Ajuste positivo</option></SelectField><Field type="number" label="Quantidade" value={mov.quantity} onChange={v=>setMov(p=>({...p,quantity:v}))}/><Field label="Motivo" value={mov.reason} onChange={v=>setMov(p=>({...p,reason:v}))}/><button className="btn outline full">Salvar movimentação</button></form></section><ListPanel title="EPIs em estoque" rows={data.epis.map(e=>[e.name, `CA ${e.caNumber}`, e.caValidity || '-', `${e.currentQuantity} ${e.unit}`, e.currentQuantity <= e.minimumQuantity ? 'Baixo' : 'Normal'])} headers={['EPI','CA','Validade','Saldo','Status']}/></div>; }

function Requests({ data, refresh }) { const [form,setForm]=useState({employeeId:'',epiId:'',reason:'',observation:''}); const statuses=['SOLICITADO','EM_ANALISE','APROVADO','EM_SEPARACAO','PRONTO_RETIRADA','ENTREGUE','RECUSADO']; async function submit(e){e.preventDefault(); await api('/requests',{method:'POST',body:JSON.stringify(form)}); setForm({employeeId:'',epiId:'',reason:'',observation:''}); await refresh('Solicitação criada com sucesso.');} async function next(req){ const idx=statuses.indexOf(req.status); const status=statuses[Math.min(idx+1,statuses.length-1)]; await api(`/requests/${req.id}/status`,{method:'PUT',body:JSON.stringify({status})}); await refresh('Status da solicitação atualizado.');} return <div className="dash-grid"><section className="panel"><h2>Nova solicitação</h2><form onSubmit={submit} className="form-stack"><SelectField label="Colaborador" value={form.employeeId} onChange={v=>setForm(p=>({...p,employeeId:v}))}><option value="">Selecione</option>{data.employees.map(e=><option key={e.id} value={e.id}>{e.fullName}</option>)}</SelectField><SelectField label="EPI solicitado" value={form.epiId} onChange={v=>setForm(p=>({...p,epiId:v}))}><option value="">Selecione</option>{data.epis.map(e=><option key={e.id} value={e.id}>{e.name} — CA {e.caNumber}</option>)}</SelectField><Field label="Motivo" value={form.reason} onChange={v=>setForm(p=>({...p,reason:v}))}/><Field label="Observação" value={form.observation} onChange={v=>setForm(p=>({...p,observation:v}))}/><button className="btn primary full">Cadastrar solicitação</button></form></section><section className="panel span-2"><h2>Acompanhamento</h2><div className="request-list">{data.requests.map(r=><article className="request-card" key={r.id}><div><b>{r.employee.fullName}</b><span>{r.epi.name} — CA {r.epi.caNumber}</span></div><strong>{r.status.replaceAll('_',' ')}</strong><button className="btn outline" onClick={()=>next(r)}>Avançar status</button></article>)}</div></section></div>; }

function Deliveries({ data, refresh }) { const [form,setForm]=useState({employeeId:'',epiId:'',quantity:1,reason:'Primeira entrega',signedByName:'',signedByCpf:'',accepted:true}); async function submit(e){e.preventDefault(); await api('/deliveries',{method:'POST',body:JSON.stringify(form)}); setForm({employeeId:'',epiId:'',quantity:1,reason:'Primeira entrega',signedByName:'',signedByCpf:'',accepted:true}); await refresh('Entrega registrada com sucesso.');} async function sign(d){ const name=prompt('Nome de quem assinou:', d.employee.fullName); const cpf=prompt('CPF:', d.employee.cpf); if(!name || !cpf) return; await api(`/deliveries/${d.id}/sign`,{method:'PUT',body:JSON.stringify({signedByName:name,signedByCpf:cpf})}); await refresh('Entrega assinada com sucesso.');} return <div className="dash-grid"><section className="panel"><h2>Registrar entrega</h2><form onSubmit={submit} className="form-stack"><SelectField label="Colaborador" value={form.employeeId} onChange={v=>setForm(p=>({...p,employeeId:v}))}><option value="">Selecione</option>{data.employees.map(e=><option key={e.id} value={e.id}>{e.fullName}</option>)}</SelectField><SelectField label="EPI" value={form.epiId} onChange={v=>setForm(p=>({...p,epiId:v}))}><option value="">Selecione</option>{data.epis.map(e=><option key={e.id} value={e.id}>{e.name} — CA {e.caNumber} — saldo {e.currentQuantity}</option>)}</SelectField><Field type="number" label="Quantidade" value={form.quantity} onChange={v=>setForm(p=>({...p,quantity:v}))}/><SelectField label="Motivo" value={form.reason} onChange={v=>setForm(p=>({...p,reason:v}))}><option>Primeira entrega</option><option>Substituição por desgaste</option><option>Perda</option><option>Dano</option><option>Vencimento</option><option>Troca de função</option><option>Reposição periódica</option></SelectField><Field label="Nome para assinatura" value={form.signedByName} onChange={v=>setForm(p=>({...p,signedByName:v}))}/><Field label="CPF para assinatura" value={form.signedByCpf} onChange={v=>setForm(p=>({...p,signedByCpf:v}))}/><label className="check"><input type="checkbox" checked={form.accepted} onChange={e=>setForm(p=>({...p,accepted:e.target.checked}))}/> Colaborador declara ciência de uso, guarda e conservação do EPI.</label><button className="btn primary full">Registrar entrega</button></form></section><section className="panel span-2"><h2>Histórico de entregas</h2><div className="request-list">{data.deliveries.map(d=><article className="request-card" key={d.id}><div><b>{d.employee.fullName}</b><span>{d.epi.name} — CA {d.epi.caNumber} — Qtd. {d.quantity}</span></div><strong className={d.status==='SIGNED'?'ok':'pend'}>{d.status==='SIGNED'?'Assinado':'Pendente'}</strong>{d.status!=='SIGNED' && <button className="btn outline" onClick={()=>sign(d)}>Assinar</button>}</article>)}</div></section></div>; }

function Reports({ data }) { const signed = data.deliveries.filter(d=>d.status==='SIGNED').length; const pending = data.deliveries.filter(d=>d.status!=='SIGNED').length; const low = data.epis.filter(e=>e.currentQuantity <= e.minimumQuantity); return <div className="dash-grid"><section className="panel"><h2>Resumo de conformidade</h2><p className="report-line">Entregas assinadas: <b>{signed}</b></p><p className="report-line">Entregas pendentes: <b>{pending}</b></p><p className="report-line">Itens abaixo do mínimo: <b>{low.length}</b></p><p className="muted">Base para exportação futura em PDF.</p></section><section className="panel"><h2>Itens críticos</h2>{low.length ? low.map(e=><p className="line-item" key={e.id}>{e.name} — saldo {e.currentQuantity}, mínimo {e.minimumQuantity}</p>) : <p className="muted">Nenhum item crítico.</p>}</section><section className="panel span-2"><h2>Logs de auditoria</h2>{data.logs.slice(0,10).map(l=><p className="line-item" key={l.id}>{new Date(l.createdAt).toLocaleString('pt-BR')} — {l.action} — {l.user?.name || 'Sistema'}</p>)}</section></div>; }

function ListPanel({ title, headers, rows }) { return <section className="panel span-2"><h2>{title}</h2><div className="table-wrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody></table></div></section>; }

export default function App() {
  const [page, setPage] = useState(getToken() ? 'dashboard' : 'landing');
  const goDashboard = () => setPage('dashboard');
  if (page === 'login') return <LoginPage onBack={() => setPage('landing')} onRegister={() => setPage('register')} onSuccess={goDashboard}/>;
  if (page === 'register') return <RegisterPage onBack={() => setPage('landing')} onSuccess={goDashboard}/>;
  if (page === 'dashboard') return <Dashboard onLogout={() => setPage('landing')}/>;
  return <Landing onLogin={() => setPage('login')} onRegister={() => setPage('register')}/>;
}
