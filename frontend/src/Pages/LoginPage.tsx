import { useState } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');
  @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.x/dist/tabler-icons.min.css');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #EDF2F7; }

  .lf-page {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 32px 16px; position: relative; overflow: hidden; background: #f0f4f8;
  }
  .lf-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
  .lf-bg::before {
    content: ''; position: absolute; inset: 0;
    background-image: linear-gradient(rgba(28,58,94,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(28,58,94,0.07) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .lf-blob1 { position: absolute; top: -120px; left: -120px; width: 480px; height: 480px; border-radius: 50%; background: radial-gradient(circle, rgba(93,202,165,0.18) 0%, transparent 70%); pointer-events: none; }
  .lf-blob2 { position: absolute; bottom: -140px; right: -100px; width: 520px; height: 520px; border-radius: 50%; background: radial-gradient(circle, rgba(28,58,94,0.12) 0%, transparent 70%); pointer-events: none; }
  .lf-dots { position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(28,58,94,0.10) 1.5px, transparent 1.5px); background-size: 28px 28px; opacity: 0.5; }
  .lf-vignette { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(209,218,228,0.45) 100%); }

  .lf-card {
    position: relative; z-index: 1; width: 100%; max-width: 400px;
    background: rgba(255,255,255,0.92); backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.7); border-radius: 16px; padding: 40px 36px 36px;
    box-shadow: 0 2px 4px rgba(28,58,94,0.04), 0 8px 24px rgba(28,58,94,0.10), 0 32px 64px rgba(28,58,94,0.08);
    animation: cardIn 0.45s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes cardIn { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

  .lf-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
  .lf-logo-mark { width: 36px; height: 36px; background: #1C3A5E; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .lf-logo-mark i { color: #5DCAA5; font-size: 18px; }
  .lf-logo-text { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 600; color: #1a2e44; }
  .lf-logo-tagline { font-size: 10px; color: #7a92a8; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 1px; }

  .lf-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 500; color: #1a2e44; margin-bottom: 6px; }
  .lf-desc { font-size: 13px; color: #6b808f; margin-bottom: 28px; line-height: 1.55; }

  .lf-error { background: #fff1f1; border: 1px solid #fca5a5; border-radius: 8px; padding: 9px 13px; font-size: 12px; color: #991b1b; margin-bottom: 14px; display: flex; align-items: center; gap: 7px; }

  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 11.5px; font-weight: 500; color: #5a7080; margin-bottom: 6px; letter-spacing: 0.03em; text-transform: uppercase; }
  .input-wrap { position: relative; }
  .input-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #94a8b5; font-size: 15px; pointer-events: none; }
  .form-input { width: 100%; padding: 10px 12px 10px 36px; border: 1px solid #d1dbe3; border-radius: 8px; background: #f8fafc; color: #1a2e44; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
  .form-input:focus { border-color: #1C3A5E; background: #fff; box-shadow: 0 0 0 3px rgba(28,58,94,0.09); }
  .eye-btn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #94a8b5; cursor: pointer; padding: 2px; font-size: 15px; }

  .row-between { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .remember-wrap { display: flex; align-items: center; gap: 7px; font-size: 12px; color: #6b808f; cursor: pointer; }
  .remember-wrap input[type="checkbox"] { accent-color: #1C3A5E; width: 14px; height: 14px; }
  .forgot-link { font-size: 12px; color: #1C3A5E; background: none; border: none; cursor: pointer; padding: 0; font-family: 'DM Sans', sans-serif; font-weight: 500; }

  .btn-login { width: 100%; padding: 11px; background: #1C3A5E; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 14px; transition: opacity 0.15s; }
  .btn-login:hover:not(:disabled) { opacity: 0.88; }
  .btn-login:disabled { opacity: 0.55; cursor: default; }

  .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .help-text { text-align: center; font-size: 12px; color: #8fa3b0; line-height: 1.6; margin-top: 20px; padding-top: 18px; border-top: 1px solid #e8eef3; }
  .help-text a { color: #1C3A5E; font-weight: 500; text-decoration: none; }
`;

interface LoginFormState {
  email: string;
  password: string;
  remember: boolean;
  loading: boolean;
  error: string | null;
  showPassword: boolean;
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
    remember: false,
    loading: false,
    error: null,
    showPassword: false,
  });

  const handleLogin = () => {
    if (!form.email || !form.password) {
      setForm((f) => ({ ...f, error: "Vui lòng nhập đầy đủ email và mật khẩu." }));
      return;
    }
    setForm((f) => ({ ...f, loading: true, error: null }));
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, password: form.password })
    })
    .then(res => { if (!res.ok) throw new Error(); return res.json(); })
    .then(data => {
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('role', data.role);
      localStorage.setItem('fullName', data.fullName || '');
      window.location.href = data.role === 'MANAGER' ? '/manager' : '/';
    })
    .catch(() => setForm((f) => ({ ...f, loading: false, error: 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.' })));
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="lf-page">
        <div className="lf-bg"><div className="lf-dots" /></div>
        <div className="lf-blob1" />
        <div className="lf-blob2" />
        <div className="lf-vignette" />

        <div className="lf-card" role="main">
          <div className="lf-logo">
            <div className="lf-logo-mark">
              <i className="ti ti-calendar-check" aria-hidden="true" />
            </div>
            <div>
              <div className="lf-logo-text">LeaveFlow</div>
              <div className="lf-logo-tagline">Quản lý nghỉ phép</div>
            </div>
          </div>

          <h1 className="lf-title">Chào mừng trở lại</h1>
          <p className="lf-desc">Đăng nhập bằng tài khoản được cấp bởi công ty của bạn.</p>

          {form.error && (
            <div className="lf-error" role="alert">
              <i className="ti ti-alert-circle" aria-hidden="true" />
              {form.error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email công ty</label>
            <div className="input-wrap">
              <i className="ti ti-mail input-icon" aria-hidden="true" />
              <input
                id="email" className="form-input" type="email"
                placeholder="ten@congty.com" autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value, error: null }))}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Mật khẩu</label>
            <div className="input-wrap">
              <i className="ti ti-lock input-icon" aria-hidden="true" />
              <input
                id="password" className="form-input"
                type={form.showPassword ? "text" : "password"}
                placeholder="••••••••" autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value, error: null }))}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <button className="eye-btn" type="button"
                onClick={() => setForm((f) => ({ ...f, showPassword: !f.showPassword }))}
                aria-label={form.showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                <i className={form.showPassword ? "ti ti-eye-off" : "ti ti-eye"} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="row-between">
            <label className="remember-wrap">
              <input type="checkbox" checked={form.remember}
                onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))} />
              Ghi nhớ đăng nhập
            </label>
            <button className="forgot-link" type="button">Quên mật khẩu?</button>
          </div>

          <button className="btn-login" type="button" disabled={form.loading} onClick={handleLogin}>
            {form.loading ? (<><div className="spinner" aria-hidden="true" />Đang đăng nhập...</>) : "Đăng nhập"}
          </button>

          <p className="help-text">
            Gặp sự cố? <a href="mailto:it@congty.com">Liên hệ bộ phận IT</a> để được hỗ trợ.
          </p>
        </div>
      </div>
    </>
  );
}
