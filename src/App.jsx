import { useEffect, useMemo, useState, useCallback } from 'react'
import { api } from './lib/api'
import { Home, Trophy, Newspaper, TrendingUp, Search, Settings, Play, CalendarDays, History, ArrowLeft } from 'lucide-react'

const theme = {
  bg: 'bg-slate-950',
  card: 'bg-slate-900/60 backdrop-blur border border-green-400/10',
  text: 'text-slate-100',
  subtext: 'text-slate-300/80',
  accent: 'text-green-400',
  btn: 'bg-green-500 hover:bg-green-400 text-slate-900',
}

function useInterval(callback, delay) {
  useEffect(() => {
    const id = setInterval(callback, delay)
    return () => clearInterval(id)
  }, [callback, delay])
}

function Navbar({ current, onNav }) {
  const items = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'live', label: 'Live', icon: Play },
    { key: 'upcoming', label: 'Upcoming', icon: CalendarDays },
    { key: 'results', label: 'Results', icon: History },
    { key: 'rankings', label: 'Rankings', icon: Trophy },
    { key: 'news', label: 'News', icon: Newspaper },
    { key: 'trending', label: 'Trending', icon: TrendingUp },
    { key: 'search', label: 'Search', icon: Search },
    { key: 'settings', label: 'Settings', icon: Settings },
  ]
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20">
      <div className="mx-auto max-w-md px-3 pb-3">
        <div className="grid grid-cols-5 gap-2 rounded-2xl p-2 shadow-xl bg-slate-900/90 border border-green-400/10">
          {items.slice(0,5).map((it) => (
            <button key={it.key} onClick={() => onNav(it.key)} className={`flex flex-col items-center gap-1 py-2 rounded-xl ${current===it.key?'bg-green-400/10 text-green-400':'text-slate-300 hover:text-white'}`}>
              <it.icon size={20} />
              <span className="text-[11px]">{it.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2 rounded-2xl p-2 shadow-xl bg-slate-900/90 border border-green-400/10">
          {items.slice(5).map((it) => (
            <button key={it.key} onClick={() => onNav(it.key)} className={`flex flex-col items-center gap-1 py-2 rounded-xl ${current===it.key?'bg-green-400/10 text-green-400':'text-slate-300 hover:text-white'}`}>
              <it.icon size={20} />
              <span className="text-[11px]">{it.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Header({ title, onBack }) {
  return (
    <div className="sticky top-0 z-10 backdrop-blur bg-slate-950/60 border-b border-green-400/10">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
        {onBack ? (
          <button onClick={onBack} className="p-1 rounded-lg hover:bg-slate-800 text-slate-200">
            <ArrowLeft size={20} />
          </button>
        ) : (
          <img src="/cricket-ball.svg" className="w-6 h-6 animate-spin-slow" alt="ball" />
        )}
        <h1 className="font-semibold text-white truncate">{title}</h1>
      </div>
    </div>
  )
}

function MatchCard({ m, onOpen }) {
  return (
    <button onClick={onOpen} className={`w-full text-left rounded-2xl p-4 ${theme.card} hover:border-green-400/30 transition-colors`}> 
      <div className="flex items-center justify-between">
        <div className="text-xs text-green-400 font-semibold">{m.status}</div>
        <div className="text-[11px] text-slate-400">{m.venue?.name}{m.venue?.city?`, ${m.venue.city}`:''}</div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-green-500/20 grid place-items-center text-[10px]">{m.localteam?.code || 'T1'}</span>
            <div className="font-medium text-white">{m.localteam?.name}</div>
          </div>
        </div>
        <div className="text-right text-white text-sm">
          <div>{m.runs?.[0]?.score ? `${m.runs[0].score}/${m.runs[0].wickets}`: ''} <span className="text-slate-400">{m.runs?.[0]?.overs?`(${m.runs[0].overs})`:''}</span></div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 grid place-items-center text-[10px]">{m.visitorteam?.code || 'T2'}</span>
            <div className="font-medium text-white">{m.visitorteam?.name}</div>
          </div>
        </div>
        <div className="text-right text-white text-sm">
          <div>{m.runs?.[1]?.score ? `${m.runs[1].score}/${m.runs[1].wickets}`: ''} <span className="text-slate-400">{m.runs?.[1]?.overs?`(${m.runs[1].overs})`:''}</span></div>
        </div>
      </div>
      {m.note && <div className="mt-3 text-[12px] text-slate-300">{m.note}</div>}
    </button>
  )
}

function MatchesScreen({ type, onOpenMatch }) {
  const [data, setData] = useState({ matches: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setError('')
      const res = await api.matches(type === 'results' ? 'completed' : type)
      setData(res)
    } catch (e) {
      setError(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => { setLoading(true); load() }, [type, load])
  useInterval(load, 5000)

  return (
    <div className="p-4 space-y-3">
      {loading && <Loading label="Fetching matches" />}
      {error && <Error label={error} />}
      {data.matches?.length === 0 && !loading ? <Empty label="No matches" /> : data.matches?.map(m => (
        <MatchCard m={m} key={m.id} onOpen={() => onOpenMatch(m)} />
      ))}
    </div>
  )
}

function RankingsScreen() {
  const [format, setFormat] = useState('odi')
  const [data, setData] = useState({ teams: [], players: { batting: [], bowling: [], allrounder: [] } })
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    api.rankings(format).then(setData).finally(()=>setLoading(false))
  }, [format])
  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        {['test','odi','t20'].map(f => (
          <button key={f} onClick={() => setFormat(f)} className={`px-3 py-1 rounded-full text-sm ${format===f?theme.btn:'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>{f.toUpperCase()}</button>
        ))}
      </div>
      {loading && <Loading label="Loading rankings" />}
      <div className="space-y-3">
        <h3 className="text-slate-200 font-semibold">Teams</h3>
        <div className="grid grid-cols-1 gap-3">
          {data.teams?.map((t, i) => (
            <div key={i} className={`${theme.card} rounded-xl p-3 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <img src={t.team?.flag || '/flag-placeholder.svg'} className="w-6 h-4 object-cover rounded" />
                <div className="text-slate-100 text-sm">{t.team?.name || t.teamName}</div>
              </div>
              <div className="text-green-400 text-sm">#{t.position || t.rank}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-slate-200 font-semibold">Top Batters</h3>
        <div className="grid grid-cols-1 gap-3">
          {data.players?.batting?.slice(0,10).map((p, i) => (
            <div key={i} className={`${theme.card} rounded-xl p-3 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <img src={p.player?.image || '/player-placeholder.png'} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <div className="text-slate-100 text-sm">{p.player?.name || p.name}</div>
                  <div className="text-slate-400 text-xs">{p.team?.name || p.country}</div>
                </div>
              </div>
              <div className="text-green-400 text-sm">#{p.position || p.rank}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NewsScreen() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(()=>{ api.news().then(d=>setItems(d.items||[])).finally(()=>setLoading(false)) },[])
  return (
    <div className="p-4 space-y-3">
      {loading && <Loading label="Fetching news" />}
      {items.map((n, i) => (
        <a key={i} href={n.link} target="_blank" className={`${theme.card} rounded-2xl p-3 block hover:border-green-400/30`}>
          <div className="flex gap-3">
            <img src={n.image || '/news-placeholder.jpg'} className="w-24 h-16 object-cover rounded-lg" />
            <div>
              <div className="text-slate-100 text-sm font-medium line-clamp-2">{n.title}</div>
              <div className="text-slate-400 text-xs mt-1 line-clamp-2" dangerouslySetInnerHTML={{__html: n.summary || ''}} />
              <div className="text-[11px] text-green-400 mt-1">{n.source}</div>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}

function TrendingScreen() {
  const [players, setPlayers] = useState([])
  useEffect(()=>{ api.trendingPlayers().then(d=>setPlayers(d.players||[])) },[])
  return (
    <div className="p-4 space-y-3">
      {players.map((p,i)=>(
        <div key={i} className={`${theme.card} rounded-2xl p-3`}>
          <div className="flex items-center gap-3">
            <img src={p.image || '/player-placeholder.png'} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1">
              <div className="text-slate-100 text-sm font-medium">{p.name}</div>
              <div className="text-slate-400 text-xs">{p.country}</div>
            </div>
            {p.handle && <a className="text-green-400 text-xs" href={`https://x.com/${p.handle}`} target="_blank">@{p.handle}</a>}
          </div>
        </div>
      ))}
    </div>
  )
}

function SearchScreen() {
  const [q, setQ] = useState('Virat Kohli')
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(false)
  const doSearch = async () => {
    setLoading(true)
    try { const d = await api.tweets(q); setTweets(d.tweets || []) } finally { setLoading(false) }
  }
  useEffect(()=>{ doSearch() },[])
  return (
    <div className="p-4 space-y-3">
      <div className={`${theme.card} rounded-2xl p-3 flex gap-2`}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search player tweets" className="flex-1 bg-transparent outline-none text-slate-100 text-sm" />
        <button onClick={doSearch} className={`px-3 py-1 rounded-lg text-sm ${theme.btn}`}>Search</button>
      </div>
      {loading && <Loading label="Searching tweets" />}
      {tweets.map(t => (
        <div key={t.id} className={`${theme.card} rounded-2xl p-3`}>
          <div className="text-slate-100 text-sm">{t.text}</div>
          <div className="text-[11px] text-slate-400 mt-1">{new Date(t.created_at).toLocaleString()}</div>
        </div>
      ))}
      {!loading && tweets.length===0 && <Empty label="No tweets or API not configured" />}
    </div>
  )
}

function SettingsScreen() {
  return (
    <div className="p-4 space-y-3">
      <div className={`${theme.card} rounded-2xl p-4 text-slate-300 text-sm`}>
        <div className="font-semibold text-white mb-2">About</div>
        <p>Cricket app prototype with live scores, rankings, news, and trending players. Configure API keys in environment to enable real data.</p>
        <ul className="mt-3 list-disc pl-5 space-y-1">
          <li>CRICKET_API_PROVIDER = sportmonks | rapidapi</li>
          <li>CRICKET_API_KEY for SportMonks</li>
          <li>RAPIDAPI_KEY and RAPIDAPI_HOST for RapidAPI</li>
          <li>X_BEARER_TOKEN for tweets</li>
          <li>VITE_BACKEND_URL for frontend</li>
        </ul>
      </div>
    </div>
  )
}

function Loading({ label }) {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-green-500/30"></div>
        <div className="absolute inset-0 rounded-full border-t-2 border-green-400 animate-spin"></div>
      </div>
      <div className="ml-3 text-slate-300 text-sm">{label}</div>
    </div>
  )
}

function Error({ label }) { return <div className="text-red-400 text-sm p-3">{label}</div> }
function Empty({ label }) { return <div className="text-slate-400 text-sm p-3">{label}</div> }

// ---- Match Details ----
function DetailsScreen({ matchStub, onBack }) {
  const matchId = matchStub?.id
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('summary')
  const load = useCallback(async () => {
    if (!matchId) return
    try {
      const res = await api.match(matchId)
      setData(res?.data || res)
    } catch (e) {
      // noop; parent network errors handled at card level
    } finally {
      setLoading(false)
    }
  }, [matchId])
  useEffect(()=>{ setLoading(true); load() }, [load])
  useInterval(load, 10000)

  const m = data || {}
  const local = m.localteam || matchStub?.localteam || {}
  const visitor = m.visitorteam || matchStub?.visitorteam || {}
  const venue = m.venue || matchStub?.venue || {}

  const batting = Array.isArray(m.batting) ? m.batting : []
  const bowling = Array.isArray(m.bowling) ? m.bowling : []
  const lineup = Array.isArray(m.lineup) ? m.lineup : []
  const balls = Array.isArray(m.balls) ? m.balls : []
  const runs = Array.isArray(m.runs) ? m.runs : matchStub?.runs || []

  return (
    <div className="min-h-screen">
      <Header title={`${local?.code || local?.name || 'Team 1'} vs ${visitor?.code || visitor?.name || 'Team 2'}`} onBack={onBack} />
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Summary Card */}
        <div className={`${theme.card} rounded-2xl p-4`}>
          <div className="text-xs text-green-400 font-semibold">{(m.status || matchStub?.status || '').toString().toUpperCase()}</div>
          <div className="mt-2 text-slate-100 text-sm">{venue?.name}{venue?.city?`, ${venue.city}`:''}</div>
          {m.starting_at && <div className="text-slate-400 text-xs mt-1">{new Date(m.starting_at).toLocaleString()}</div>}
          {matchStub?.note && <div className="mt-2 text-slate-300 text-sm">{matchStub.note}</div>}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-800/50 p-3">
              <div className="text-slate-400 text-xs">{local?.name}</div>
              <div className="text-slate-100 font-semibold">{runs?.[0]?.score ? `${runs[0].score}/${runs[0].wickets}`: '--'} <span className="text-slate-400 text-xs">{runs?.[0]?.overs?`(${runs[0].overs})`:''}</span></div>
            </div>
            <div className="rounded-xl bg-slate-800/50 p-3">
              <div className="text-slate-400 text-xs">{visitor?.name}</div>
              <div className="text-slate-100 font-semibold">{runs?.[1]?.score ? `${runs[1].score}/${runs[1].wickets}`: '--'} <span className="text-slate-400 text-xs">{runs?.[1]?.overs?`(${runs[1].overs})`:''}</span></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {[
            {k:'summary', l:'Summary'},
            {k:'scoreboard', l:'Scoreboard'},
            {k:'commentary', l:'Commentary'},
            {k:'players', l:'Playing XI'},
          ].map(t => (
            <button key={t.k} onClick={()=>setTab(t.k)} className={`px-3 py-1 rounded-full text-sm ${tab===t.k?theme.btn:'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>{t.l}</button>
          ))}
        </div>

        {loading && <Loading label="Loading details" />}

        {!loading && tab==='scoreboard' && (
          <div className="space-y-4">
            {['1st Innings','2nd Innings','3rd Innings','4th Innings'].map((label, idx) => (
              <InningsCard key={idx} label={label} batting={batting.filter(b=> (b.scoreboard||'').includes(`${idx+1}`))} bowling={bowling.filter(b=> (b.scoreboard||'').includes(`${idx+1}`))} />
            ))}
          </div>
        )}

        {!loading && tab==='commentary' && (
          <div className="space-y-2">
            {balls.length===0 && <Empty label="No commentary available" />}
            {balls.slice().reverse().map((ball,i)=> (
              <div key={i} className={`${theme.card} rounded-xl p-3 text-sm`}> 
                <div className="text-slate-400 text-xs">Over {ball.over}.{ball.ball}</div>
                <div className="text-slate-100">{ball.comment || `${ball.batsman?.fullname || ''} ${ball.result || ''}`}</div>
              </div>
            ))}
          </div>
        )}

        {!loading && tab==='players' && (
          <div className="space-y-3">
            {lineup.length===0 && <Empty label="Lineups not available" />}
            {lineup.map((p,i)=> (
              <div key={i} className={`${theme.card} rounded-xl p-3 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <img src={p.image_path || '/player-placeholder.png'} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <div className="text-slate-100 text-sm">{p.fullname || p.name}</div>
                    <div className="text-slate-400 text-xs">{p.position?.name || p.role}</div>
                  </div>
                </div>
                {p.captain && <span className="text-[11px] text-green-400">C</span>}
                {p.wicketkeeper && <span className="text-[11px] text-cyan-400">WK</span>}
              </div>
            ))}
          </div>
        )}

        {!loading && tab==='summary' && (
          <div className="space-y-3">
            <div className={`${theme.card} rounded-xl p-3 text-sm text-slate-300`}>
              <div><span className="text-slate-400">Status:</span> {(m.status || '').toString().toUpperCase()}</div>
              {m.toss_won_team_id && <div className="mt-1"><span className="text-slate-400">Toss:</span> Team {m.toss_won_team_id} won</div>}
              {m.elected && <div className="mt-1"><span className="text-slate-400">Elected:</span> {m.elected}</div>}
              {m.round && <div className="mt-1"><span className="text-slate-400">Round:</span> {m.round}</div>}
              {m.note && <div className="mt-1"><span className="text-slate-400">Note:</span> {m.note}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InningsCard({ label, batting = [], bowling = [] }) {
  if (batting.length===0 && bowling.length===0) return null
  return (
    <div className={`${theme.card} rounded-2xl p-3`}>
      <div className="text-slate-200 font-semibold mb-2">{label}</div>
      {batting.length>0 && (
        <div className="mb-2">
          <div className="text-slate-400 text-xs mb-1">Batting</div>
          <div className="space-y-1">
            {batting.map((b,i)=> (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="text-slate-100 truncate pr-2">{b.player?.fullname || b.player?.name || b.batsman?.fullname || b.batsman?.name || 'Batter'}</div>
                <div className="text-slate-300">{b.score || b.runs || 0} ({b.ball || b.balls || 0})</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {bowling.length>0 && (
        <div>
          <div className="text-slate-400 text-xs mb-1">Bowling</div>
          <div className="space-y-1">
            {bowling.map((bw,i)=> (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="text-slate-100 truncate pr-2">{bw.player?.fullname || bw.player?.name || 'Bowler'}</div>
                <div className="text-slate-300">{bw.overs || 0} ov • {bw.wickets || 0}/{bw.runs || bw.runs_conceded || 0}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('live')
  const [selected, setSelected] = useState(null)
  const title = useMemo(()=>({
    home: 'Home', live: 'Live Matches', upcoming: 'Upcoming Matches', results: 'Results', rankings: 'ICC Rankings', news: 'Cricket News', trending: 'Trending Players', search: 'Player Search', settings: 'Settings'
  })[screen], [screen])

  return (
    <div className={`min-h-screen ${theme.bg} pb-40 bg-[radial-gradient(200px_200px_at_10%_10%,rgba(34,197,94,0.08),transparent),radial-gradient(300px_300px_at_80%_0%,rgba(34,197,94,0.08),transparent)]`}>
      {!selected && <Header title={title} />}
      <main className="max-w-md mx-auto">
        {!selected && screen==='home' && <div className="p-4"><div className={`${theme.card} rounded-2xl p-6 text-slate-300`}>Welcome to the cricket app!</div></div>}
        {!selected && screen==='live' && <MatchesScreen type="live" onOpenMatch={setSelected} />}
        {!selected && screen==='upcoming' && <MatchesScreen type="upcoming" onOpenMatch={setSelected} />}
        {!selected && screen==='results' && <MatchesScreen type="results" onOpenMatch={setSelected} />}
        {!selected && screen==='rankings' && <RankingsScreen />}
        {!selected && screen==='news' && <NewsScreen />}
        {!selected && screen==='trending' && <TrendingScreen />}
        {!selected && screen==='search' && <SearchScreen />}
        {!selected && screen==='settings' && <SettingsScreen />}
        {selected && <DetailsScreen matchStub={selected} onBack={()=>setSelected(null)} />}
      </main>
      {!selected && <Navbar current={screen} onNav={setScreen} />}
    </div>
  )
}
