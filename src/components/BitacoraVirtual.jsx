import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'jose-bitacora-v1';
const JOSE_PASSWORD = 'Abadacadabra';
const JOSE_ICON_A = "/images/Jose Shota's Icon.png";
const JOSE_ICON_B = "/images/Jose Shota's Other Icon.png";

const INITIAL_POSTS = [
  {
    id: 'seed-1',
    title: 'Nota de prueba',
    body: 'Este espacio es para registrar ideas, obsesiones del dia y hallazgos creativos.',
    mood: 'archivo',
    createdAt: new Date().toISOString(),
  },
];

const moodStyles = {
  archivo: { color: '#9aa0a6', border: '#3b3b3b' },
  brillo: { color: '#23909e', border: '#1c5961' },
  sombra: { color: '#c58f3d', border: '#6e4f21' },
  glitch: { color: '#b56bff', border: '#5a2c84' },
};

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function BitacoraVirtual() {
  const [mode, setMode] = useState('public');
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState('archivo');
  const [wantsEditor, setWantsEditor] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [gateMessage, setGateMessage] = useState('');
  const [iconFrame, setIconFrame] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) setPosts(parsed);
    } catch {
      // Ignore broken local data and keep defaults.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    if (!wantsEditor || isAuthorized || isLockedOut) return;
    const timer = setInterval(() => {
      setIconFrame((f) => (f === 0 ? 1 : 0));
    }, 550);
    return () => clearInterval(timer);
  }, [wantsEditor, isAuthorized, isLockedOut]);

  const orderedPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [posts]
  );

  const addPost = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setPosts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        body: body.trim(),
        mood,
        createdAt: new Date().toISOString(),
      },
    ]);
    setTitle('');
    setBody('');
    setMood('archivo');
  };

  const deletePost = (id) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const unlockEditor = (e) => {
    e.preventDefault();
    if (isLockedOut) return;
    if (passwordInput === JOSE_PASSWORD) {
      setIsAuthorized(true);
      setMode('editor');
      setGateMessage('Acceso concedido. Bienvenido, Jose Shota.');
      setPasswordInput('');
      return;
    }
    setIsLockedOut(true);
    setWantsEditor(false);
    setMode('public');
    setGateMessage('Sorry you are not Jose Shota, and if so, what a dumb');
    setPasswordInput('');
  };

  return (
    <section style={{ display: 'grid', gap: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '0.75rem',
          border: '1px dashed var(--color-text-accent)',
          padding: '0.9rem 1rem',
          background: 'rgba(0,0,0,0.35)',
        }}
      >
        <span style={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.8rem' }}>
          Bitacora Virtual / {mode === 'editor' ? 'Vista Editor' : 'Vista Publica'}
        </span>

        {isAuthorized ? (
          <button
            type="button"
            onClick={() => setMode((m) => (m === 'editor' ? 'public' : 'editor'))}
            style={{
              border: '1px solid var(--color-highlight)',
              background: 'transparent',
              color: 'var(--color-highlight)',
              padding: '0.3rem 0.7rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
            }}
          >
            Cambiar a {mode === 'editor' ? 'vista publica' : 'vista editor'}
          </button>
        ) : (
          <label style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', fontSize: '0.8rem' }}>
            <input
              type="checkbox"
              checked={wantsEditor}
              disabled={isLockedOut}
              onChange={(e) => {
                setWantsEditor(e.target.checked);
                setGateMessage('');
              }}
            />
            Only Jose Shota can access
          </label>
        )}
      </div>

      {!isAuthorized && wantsEditor && !isLockedOut && (
        <form
          onSubmit={unlockEditor}
          style={{
            display: 'grid',
            gap: '0.75rem',
            border: '1px solid #2c2c2c',
            padding: '1rem',
            background: 'rgba(20,20,20,0.65)',
          }}
        >
          <div style={{ display: 'grid', justifyItems: 'center', gap: '0.6rem' }}>
            <img
              src={iconFrame === 0 ? JOSE_ICON_A : JOSE_ICON_B}
              alt="Jose gatekeeper"
              style={{
                width: 'min(240px, 70vw)',
                height: 'auto',
                imageRendering: 'pixelated',
                border: '1px solid #2f2f2f',
                background: '#000',
              }}
            />
            <p style={{ margin: 0, textAlign: 'center', fontSize: '0.9rem' }}>
              You shall not pass, unless you are Jose Shota. If so, please enter the password.
            </p>
          </div>
          <label>
            Password
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
              style={inputStyle}
            />
          </label>
          <button type="submit" style={primaryBtn}>
            Intentar acceso
          </button>
        </form>
      )}

      {gateMessage && (
        <p
          style={{
            border: '1px dashed #3a3a3a',
            padding: '0.7rem 0.9rem',
            margin: 0,
            color: isLockedOut ? '#ef8d8d' : 'var(--color-highlight)',
          }}
        >
          {gateMessage}
        </p>
      )}

      {isLockedOut && (
        <p style={{ margin: 0, opacity: 0.82 }}>
          Editor access has been blocked for this session.
        </p>
      )}

      {mode === 'editor' && isAuthorized && (
        <form
          onSubmit={addPost}
          style={{
            display: 'grid',
            gap: '0.75rem',
            border: '1px solid #2c2c2c',
            padding: '1rem',
            background: 'rgba(20,20,20,0.45)',
          }}
        >
          <label>
            Titulo
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={inputStyle}
            />
          </label>
          <label>
            Estado mental
            <select value={mood} onChange={(e) => setMood(e.target.value)} style={inputStyle}>
              <option value="archivo">Archivo</option>
              <option value="brillo">Brillo</option>
              <option value="sombra">Sombra</option>
              <option value="glitch">Glitch</option>
            </select>
          </label>
          <label>
            Nota
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              required
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </label>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button type="submit" style={primaryBtn}>
              Publicar nota
            </button>
            <button
              type="button"
              style={secondaryBtn}
              onClick={() => {
                setTitle('');
                setBody('');
                setMood('archivo');
              }}
            >
              Limpiar
            </button>
          </div>
          <small style={{ opacity: 0.75 }}>
            Las publicaciones se guardan localmente en este navegador.
          </small>
        </form>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {orderedPosts.map((post, index) => {
          const tone = moodStyles[post.mood] || moodStyles.archivo;
          return (
            <article
              key={post.id}
              style={{
                border: `1px solid ${tone.border}`,
                background:
                  mode === 'public'
                    ? 'linear-gradient(160deg, rgba(14,14,14,0.85), rgba(5,5,5,0.95))'
                    : 'rgba(15,15,15,0.8)',
                padding: '1rem',
                position: 'relative',
                boxShadow: mode === 'public' ? 'inset 0 0 0 1px rgba(255,255,255,0.03)' : 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '0.7rem',
                  alignItems: 'baseline',
                  flexWrap: 'wrap',
                  marginBottom: '0.4rem',
                }}
              >
                <strong style={{ color: tone.color, fontSize: '1.05rem' }}>
                  {index + 1}. {post.title}
                </strong>
                <small style={{ opacity: 0.75 }}>{formatDate(post.createdAt)}</small>
              </div>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{post.body}</p>
              <div
                style={{
                  marginTop: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.8rem',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    border: `1px solid ${tone.border}`,
                    color: tone.color,
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.4rem',
                    letterSpacing: '0.08em',
                  }}
                >
                  {post.mood}
                </span>
                {mode === 'editor' && (
                  <button type="button" style={dangerBtn} onClick={() => deletePost(post.id)}>
                    Eliminar
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

const inputStyle = {
  display: 'block',
  marginTop: '0.35rem',
  width: '100%',
  boxSizing: 'border-box',
  background: '#080808',
  color: 'var(--color-text-light)',
  border: '1px solid #2f2f2f',
  padding: '0.55rem 0.65rem',
  fontFamily: 'var(--font-mono)',
};

const primaryBtn = {
  border: '1px solid var(--color-highlight)',
  background: 'var(--color-highlight)',
  color: '#071014',
  padding: '0.45rem 0.8rem',
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
};

const secondaryBtn = {
  border: '1px solid #3b3b3b',
  background: 'transparent',
  color: 'var(--color-text-light)',
  padding: '0.45rem 0.8rem',
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
};

const dangerBtn = {
  border: '1px solid #5a2a2a',
  background: 'transparent',
  color: '#ef8d8d',
  padding: '0.28rem 0.58rem',
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  fontSize: '0.72rem',
};
