import { useState } from "react";
import './LoginPage.css';

interface LoginFormState {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
  showPassword: boolean;
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
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
